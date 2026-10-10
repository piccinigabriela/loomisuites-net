import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { DemoState } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';

// Initialize Firebase App
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);

// Configure auth persistence to browser local storage
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Silent auth persistence notice:', err);
  });
}

export const googleAuthProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
};
export type { User };

/**
 * Sign in with Google using Firebase Authentication popup (Real Firebase Auth)
 */
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(auth, provider);
}

/**
 * Helper to translate Firebase Auth error codes to rioplatense Spanish
 */
export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico ingresado no tiene un formato válido.';
    case 'auth/user-not-found':
      return 'No encontramos ninguna cuenta con este correo. Verificalo o creá una nueva cuenta.';
    case 'auth/wrong-password':
      return 'La contraseña que ingresaste es incorrecta. Verificala o usá "¿Olvidaste tu contraseña?".';
    case 'auth/invalid-credential':
      return 'El correo o la contraseña son incorrectos. Verificalos e intentá de nuevo.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Iniciá sesión o restablecé tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/missing-password':
      return 'Por favor ingresá tu contraseña.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de completar el inicio de sesión.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google. Habilitá las ventanas emergentes para continuar.';
    case 'auth/network-request-failed':
      return 'Hubo un problema de conexión. Verificá tu internet e intentá de nuevo.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, esperá unos minutos antes de volver a intentar.';
    case 'auth/user-disabled':
      return 'Esta cuenta fue desactivada por un administrador.';
    default:
      return 'Ocurrió un error inesperado al procesar la solicitud. Intentá de nuevo en unos instantes.';
  }
}

// Initialize Firestore with specific database ID if provided
export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(firebaseApp, databaseId)
  : getFirestore(firebaseApp);

/**
 * Persist complex state to Firebase Cloud Firestore
 */
export async function saveComplexToCloud(complexId: string, state: DemoState): Promise<void> {
  if (!complexId || !db) return;
  try {
    const complexRef = doc(db, 'complexes', complexId);
    await setDoc(
      complexRef,
      {
        ...state,
        lastCloudSyncedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Silent cloud Firestore sync notice:', error);
  }
}

/**
 * Fetch complex state from Firebase Cloud Firestore
 */
export async function loadComplexFromCloud(complexId: string): Promise<DemoState | null> {
  if (!complexId || !db) return null;
  try {
    const complexRef = doc(db, 'complexes', complexId);
    const snap = await getDoc(complexRef);
    if (snap.exists()) {
      return snap.data() as DemoState;
    }
  } catch (error) {
    console.warn('Error loading complex from Firestore:', error);
  }
  return null;
}

/**
 * Subscribe to real-time changes in Firestore for multi-device sync
 */
export function subscribeToComplexCloud(
  complexId: string,
  onUpdate: (state: DemoState) => void
): () => void {
  if (!complexId || !db) return () => {};

  const complexRef = doc(db, 'complexes', complexId);
  return onSnapshot(
    complexRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DemoState;
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Firestore live listener notice:', err);
    }
  );
}

/**
 * Save lead or onboarding request to cloud
 */
export async function saveLeadToCloud(lead: {
  fullName: string;
  phone: string;
  email: string;
  complexName: string;
  propertiesCount: number;
  planOrTopic?: string;
  notes?: string;
}): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'leads'), {
      ...lead,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Notice saving lead to Firestore:', e);
  }
}

/**
 * SuperAdmin: Fetch all registered complexes from Cloud Firestore
 */
export async function fetchAllComplexesFromCloud(): Promise<Array<{ id: string; data: any }>> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'complexes'));
    return snap.docs.map((d) => ({
      id: d.id,
      data: d.data(),
    }));
  } catch (e) {
    console.warn('Error fetching all complexes for SuperAdmin:', e);
    return [];
  }
}

/**
 * SuperAdmin: Fetch all leads from Cloud Firestore
 */
export async function fetchAllLeadsFromCloud(): Promise<Array<{ id: string; data: any }>> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'leads'));
    return snap.docs.map((d) => ({
      id: d.id,
      data: d.data(),
    }));
  } catch (e) {
    console.warn('Error fetching leads for SuperAdmin:', e);
    return [];
  }
}

/**
 * Global users/complexes registry to let mobile devices retrieve their account by email
 */
export async function saveRegisteredAccountToCloud(profile: any): Promise<void> {
  if (!profile || !profile.adminEmail || !db) return;
  try {
    const docId = profile.adminEmail.toLowerCase().trim();
    const ref = doc(db, 'registered_complexes', docId);
    // Blindaje de seguridad: Nunca almacenar contraseñas en colecciones en la nube
    const { password, ...safeProfile } = profile;
    await setDoc(ref, {
      ...safeProfile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Error saving registered complex to Firestore:', error);
  }
}

/**
 * Find registered account in Firestore by email
 */
export async function findRegisteredAccountInCloud(email: string): Promise<any | null> {
  if (!email || !db) return null;
  try {
    const docId = email.toLowerCase().trim();
    const ref = doc(db, 'registered_complexes', docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.warn('Error finding registered complex in Firestore:', error);
  }
  return null;
}

/**
 * Scan all complexes inside /complexes for one containing the target email (fallback recovery)
 */
export async function findComplexByAdminEmailInCloud(email: string): Promise<{ id: string; data: any } | null> {
  if (!email || !db) return null;
  try {
    const snap = await getDocs(collection(db, 'complexes'));
    const targetEmail = email.toLowerCase().trim();
    for (const d of snap.docs) {
      const data = d.data();
      // Search for email string inside full document content
      const jsonStr = JSON.stringify(data).toLowerCase();
      if (jsonStr.includes(targetEmail)) {
        return { id: d.id, data };
      }
    }
  } catch (e) {
    console.warn('Error scanning complexes for email:', e);
  }
  return null;
}

