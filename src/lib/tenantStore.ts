import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Property, Reservation, CleaningTask, MessageTemplate, AddonService, WelcomeGuideData, CashMovement } from '../types';

export interface TenantDoc {
  ownerEmail: string;
  complexName?: string;
  address?: string;
  city?: string;
  welcomeGuide?: WelcomeGuideData;
  templates?: MessageTemplate[];
  availableAddons?: AddonService[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Subscribe in real-time to tenants/{uid} and all subcollections: properties, reservations, cleaningTasks, cashMovements.
 * Returns an unsubscribe function.
 */
export function subscribeToTenant(
  uid: string,
  onData: (state: {
    tenant: TenantDoc | null;
    properties: Property[];
    reservations: Reservation[];
    cleaningTasks: CleaningTask[];
    cashMovements: CashMovement[];
    exists: boolean;
    loading: boolean;
  }) => void
): () => void {
  if (!uid || !db) {
    onData({ tenant: null, properties: [], reservations: [], cleaningTasks: [], cashMovements: [], exists: false, loading: false });
    return () => {};
  }

  let tenantData: TenantDoc | null = null;
  let tenantExists = false;
  let propertiesList: Property[] = [];
  let reservationsList: Reservation[] = [];
  let cleaningList: CleaningTask[] = [];
  let cashList: CashMovement[] = [];
  let tenantLoaded = false;
  let propLoaded = false;
  let resLoaded = false;
  let cleanLoaded = false;
  let cashLoaded = false;

  const checkReady = () => {
    if (tenantLoaded && propLoaded && resLoaded && cleanLoaded && cashLoaded) {
      onData({
        tenant: tenantData,
        properties: propertiesList,
        reservations: reservationsList,
        cleaningTasks: cleaningList,
        cashMovements: cashList,
        exists: tenantExists,
        loading: false,
      });
    }
  };

  const tenantRef = doc(db, 'tenants', uid);
  const unsubTenant = onSnapshot(tenantRef, (snap) => {
    tenantExists = snap.exists();
    tenantData = tenantExists ? (snap.data() as TenantDoc) : null;
    tenantLoaded = true;
    checkReady();
  }, (err) => {
    console.error('Error listening to tenant doc:', err);
    tenantLoaded = true;
    checkReady();
  });

  const propRef = collection(db, 'tenants', uid, 'properties');
  const unsubProp = onSnapshot(propRef, (snap) => {
    propertiesList = snap.docs.map(d => ({ ...(d.data() as Property), id: d.id }));
    propLoaded = true;
    checkReady();
  }, (err) => {
    console.error('Error listening to properties:', err);
    propLoaded = true;
    checkReady();
  });

  const resRef = collection(db, 'tenants', uid, 'reservations');
  const unsubRes = onSnapshot(resRef, (snap) => {
    reservationsList = snap.docs.map(d => ({ ...(d.data() as Reservation), id: d.id }));
    resLoaded = true;
    checkReady();
  }, (err) => {
    console.error('Error listening to reservations:', err);
    resLoaded = true;
    checkReady();
  });

  const cleanRef = collection(db, 'tenants', uid, 'cleaningTasks');
  const unsubClean = onSnapshot(cleanRef, (snap) => {
    cleaningList = snap.docs.map(d => ({ ...(d.data() as CleaningTask), id: d.id }));
    cleanLoaded = true;
    checkReady();
  }, (err) => {
    console.error('Error listening to cleaning tasks:', err);
    cleanLoaded = true;
    checkReady();
  });

  const cashRef = collection(db, 'tenants', uid, 'cashMovements');
  const unsubCash = onSnapshot(cashRef, (snap) => {
    cashList = snap.docs.map(d => ({ ...(d.data() as CashMovement), id: d.id }));
    cashLoaded = true;
    checkReady();
  }, (err) => {
    console.error('Error listening to cash movements:', err);
    cashLoaded = true;
    checkReady();
  });

  return () => {
    unsubTenant();
    unsubProp();
    unsubRes();
    unsubClean();
    unsubCash();
  };
}

/**
 * Initialize a new tenant with onboarding data and default properties
 */
export async function initializeTenantOnboarding(
  uid: string,
  ownerEmail: string,
  complexName: string,
  address: string,
  city: string,
  wifiNetwork: string,
  wifiPassword: string,
  initialProperties: Property[],
  initialReservations: Reservation[] = [],
  initialCleaningTasks: CleaningTask[] = [],
  initialAddons: AddonService[] = []
): Promise<void> {
  if (!uid || !db) return;
  const tenantRef = doc(db, 'tenants', uid);
  
  const initialGuide: WelcomeGuideData = {
    propertyName: complexName,
    tagline: 'Cabañas & Alojamiento',
    hostName: 'Administración',
    hostPhone: '',
    locationAddress: address,
    googleMapsUrl: '',
    wifiNetwork: wifiNetwork,
    wifiPassword: wifiPassword,
    poolHours: '09:00 - 21:00 hs',
    checkoutHour: '10:00 hs',
    woodBagPrice: '',
    specialAnnouncement: '¡Bienvenidos a nuestro complejo! Gestioná tus reservas y servicios desde aquí.',
    transportation: [],
    attractions: [],
    dining: [],
    rules: [
      { title: 'Silencio nocturno', description: 'De 23:00 a 08:00 hs para el descanso de todos.' },
      { title: 'Fumar', description: 'Prohibido fumar dentro de las cabañas. Utilizar los decks o áreas exteriores.' }
    ],
    directBookingSettings: {
      customSlug: complexName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      depositPercentage: 30,
      bankAlias: '',
      cbu: '',
      bankName: '',
      accountHolder: '',
      directDiscountPercent: 10,
    },
  };

  const defaultTemplates: MessageTemplate[] = [
    {
      id: 'tpl-welcome',
      title: 'Mensaje de Bienvenida',
      triggerEvent: 'checkin',
      channel: 'whatsapp',
      content: '¡Hola {{nombre_huésped}}! Te damos la bienvenida a {{nombre_complejo}}. Tu unidad asignada es {{unidad_alojamiento}}. Podés consultar la guía digital de la estadía aquí: {{link_guia_digital}}. ¡Que disfrutes tu estadía!',
      variables: ['nombre_huésped', 'nombre_complejo', 'unidad_alojamiento', 'link_guia_digital'],
    },
    {
      id: 'tpl-reminder',
      title: 'Recordatorio de Check-in',
      triggerEvent: 'reminder',
      channel: 'whatsapp',
      content: 'Hola {{nombre_huésped}}, te recordamos que tu ingreso a {{nombre_complejo}} ({{unidad_alojamiento}}) es el día {{fecha_checkin}}. ¡Te esperamos!',
      variables: ['nombre_huésped', 'nombre_complejo', 'unidad_alojamiento', 'fecha_checkin'],
    },
    {
      id: 'tpl-checkout',
      title: 'Agradecimiento / Check-out',
      triggerEvent: 'checkout',
      channel: 'whatsapp',
      content: 'Hola {{nombre_huésped}}, esperamos que hayas tenido una excelente estadía en {{nombre_complejo}}. El check-out es el {{fecha_checkout}}. ¡Buen viaje de regreso!',
      variables: ['nombre_huésped', 'nombre_complejo', 'fecha_checkout'],
    },
    {
      id: 'tpl-deposit',
      title: 'Solicitud de Seña / Pago',
      triggerEvent: 'manual',
      channel: 'whatsapp',
      content: 'Hola {{nombre_huésped}}, para confirmar tu reserva en {{nombre_complejo}} para la unidad {{unidad_alojamiento}} del {{fecha_checkin}} al {{fecha_checkout}}, por favor realizá el envío de la seña. ¡Gracias!',
      variables: ['nombre_huésped', 'nombre_complejo', 'unidad_alojamiento', 'fecha_checkin', 'fecha_checkout'],
    },
  ];

  await setDoc(tenantRef, {
    ownerEmail,
    complexName,
    address,
    city,
    welcomeGuide: initialGuide,
    templates: defaultTemplates,
    availableAddons: initialAddons,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Save properties
  for (const prop of initialProperties) {
    const propRef = doc(db, 'tenants', uid, 'properties', prop.id);
    await setDoc(propRef, prop, { merge: true });
  }

  // Save reservations
  for (const res of initialReservations) {
    const resRef = doc(db, 'tenants', uid, 'reservations', res.id);
    await setDoc(resRef, res, { merge: true });
  }

  // Save cleaning tasks
  for (const task of initialCleaningTasks) {
    const taskRef = doc(db, 'tenants', uid, 'cleaningTasks', task.id);
    await setDoc(taskRef, task, { merge: true });
  }
}

export async function saveTenantData(uid: string, data: Partial<TenantDoc>): Promise<void> {
  if (!uid || !db) return;
  const tenantRef = doc(db, 'tenants', uid);
  await setDoc(tenantRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function savePropertyDoc(uid: string, property: Property): Promise<void> {
  if (!uid || !db) return;
  const propRef = doc(db, 'tenants', uid, 'properties', property.id);
  await setDoc(propRef, property, { merge: true });
}

export async function deletePropertyDoc(uid: string, propertyId: string): Promise<void> {
  if (!uid || !db) return;
  const propRef = doc(db, 'tenants', uid, 'properties', propertyId);
  await deleteDoc(propRef);
}

export async function saveReservationDoc(uid: string, reservation: Reservation): Promise<void> {
  if (!uid || !db) return;
  const resRef = doc(db, 'tenants', uid, 'reservations', reservation.id);
  await setDoc(resRef, reservation, { merge: true });
}

export async function deleteReservationDoc(uid: string, reservationId: string): Promise<void> {
  if (!uid || !db) return;
  const resRef = doc(db, 'tenants', uid, 'reservations', reservationId);
  await deleteDoc(resRef);
}

export async function saveCleaningTaskDoc(uid: string, task: CleaningTask): Promise<void> {
  if (!uid || !db) return;
  const taskRef = doc(db, 'tenants', uid, 'cleaningTasks', task.id);
  await setDoc(taskRef, task, { merge: true });
}

export async function deleteCleaningTaskDoc(uid: string, taskId: string): Promise<void> {
  if (!uid || !db) return;
  const taskRef = doc(db, 'tenants', uid, 'cleaningTasks', taskId);
  await deleteDoc(taskRef);
}

export async function saveCashMovementDoc(uid: string, movement: CashMovement): Promise<void> {
  if (!uid || !db) return;
  const moveRef = doc(db, 'tenants', uid, 'cashMovements', movement.id);
  await setDoc(moveRef, movement, { merge: true });
}

export async function deleteCashMovementDoc(uid: string, movementId: string): Promise<void> {
  if (!uid || !db) return;
  const moveRef = doc(db, 'tenants', uid, 'cashMovements', movementId);
  await deleteDoc(moveRef);
}
