import { initializeApp, getApps, getApp } from 'firebase/app';
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

