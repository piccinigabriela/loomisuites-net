import { DemoState, Property, Reservation, CleaningTask, MessageTemplate, WelcomeGuideData, AddonService, CashMovement } from '../types';
import { IMPORTED_CATALINAS_RESERVATIONS } from './importedReservations';

// Helper to format date offset from today
export function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]}`;
}

export function formatCurrency(amount: number, currency: 'USD' | 'ARS' = 'USD'): string {
  const rounded = Math.round(amount || 0);
  if (currency === 'ARS') {
    return `$${rounded.toLocaleString('es-AR')}`;
  }
  return `USD ${rounded.toLocaleString('es-AR')}`;
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'cat-a',
    name: 'Departamento A',
    type: '2 Ambientes con Cocina Completa (hasta 3 pax)',
    address: 'Tres Sargentos 400 (Piso Demo)',
    neighborhood: 'Retiro / Catalinas Norte',
    city: 'Ciudad Autónoma de Buenos Aires',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    basePrice: 58,
    cleaningFee: 20,
    imageUrl: '/catalinas/1dormA.jpg',
    rating: 4.97,
    reviewsCount: 112,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'CatalinasAptos_Fibra_A',
    wifiPassword: 'CatalinasDemo2026',
  },
  {
    id: 'cat-b',
    name: 'Departamento B',
    type: 'Estudio de Diseño con Sommier Matrimonial (2 pax)',
    address: 'Tres Sargentos 400 (Piso Demo)',
    neighborhood: 'Retiro / Catalinas Norte',
    city: 'Ciudad Autónoma de Buenos Aires',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 48,
    cleaningFee: 18,
    imageUrl: '/catalinas/estudioB.jpg',
    rating: 4.95,
    reviewsCount: 94,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'CatalinasAptos_Fibra_B',
    wifiPassword: 'CatalinasDemo2026',
  },
  {
    id: 'cat-c',
    name: 'Departamento C',
    type: '2 Ambientes con 2 Camas Sommier Individuales (hasta 3 pax)',
    address: 'Tres Sargentos 400 (Piso Demo)',
    neighborhood: 'Retiro / Catalinas Norte',
    city: 'Ciudad Autónoma de Buenos Aires',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    basePrice: 58,
    cleaningFee: 20,
    imageUrl: '/catalinas/1dormC.jpg',
    rating: 4.98,
    reviewsCount: 88,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'CatalinasAptos_Fibra_C',
    wifiPassword: 'CatalinasDemo2026',
  },
  {
    id: 'cat-d',
    name: 'Departamento D',
    type: 'Estudio con 2 Camas Sommier Individuales (2 pax)',
    address: 'Tres Sargentos 400 (Piso Demo)',
    neighborhood: 'Retiro / Catalinas Norte',
    city: 'Ciudad Autónoma de Buenos Aires',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 48,
    cleaningFee: 18,
    imageUrl: '/catalinas/D.jpg',
    rating: 4.96,
    reviewsCount: 76,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'CatalinasAptos_Fibra_D',
    wifiPassword: 'CatalinasDemo2026',
  },
];

export function generateInitialReservations(): Reservation[] {
  return [
    {
      id: 'res-101',
      propertyId: 'cat-a',
      guestName: 'Lucas Fernández',
      guestEmail: 'lucas.fernandez@huesped.com',
      guestPhone: '+54 9 11 4512-8890',
      guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(0), // Check-in HOY 14:00 hs
      checkOut: getRelativeDate(3),
      nights: 3,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 174,
      cleaningFee: 20,
      commissionPaid: 5.22,
      netRevenue: 168.78,
      status: 'confirmed',
      paymentStatus: 'pending', // Saldo pendiente al ingresar
      pinCode: '4821',
      carPlate: 'AF 729 ZX',
      specialNotes: 'Llega en vuelo a las 14:00 hs. Solicitó coordinar acceso temprano si está lista la unidad.',
      createdAt: getRelativeDate(-4),
      earlyCheckIn: true,
      earlyLateFee: 15,
      airbnbFeeMode: 'traditional_3',
      addons: [
        {
          addonId: 'addon-frigobar-vino',
          name: 'Vino Malbec Reserva + Copa de Bienvenida',
          category: 'frigobar',
          unitPrice: 18,
          quantity: 1,
          total: 18,
          status: 'entregado',
        },
      ],
    },
    {
      id: 'res-102',
      propertyId: 'cat-b',
      guestName: 'Elena Miller',
      guestEmail: 'elena.miller@huesped.com',
      guestPhone: '+1 212 555-0199',
      guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(-3),
      checkOut: getRelativeDate(0), // Check-out HOY 10:00 hs (Recambio mismo día)
      nights: 3,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 144,
      cleaningFee: 18,
      commissionPaid: 21.6,
      netRevenue: 122.4,
      status: 'checked_in',
      paymentStatus: 'paid',
      pinCode: '1420',
      specialNotes: 'Check-out puntual a las 10:00 hs. Deja equipaje en guarda hasta el mediodía.',
      createdAt: getRelativeDate(-14),
    },
    {
      id: 'res-103',
      propertyId: 'cat-b',
      guestName: 'Agustina Gómez',
      guestEmail: 'agustina.gomez@huesped.com',
      guestPhone: '+54 9 223 543-2211',
      guestAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(0), // Check-in HOY 14:00 hs (Recambio)
      checkOut: getRelativeDate(4),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 192,
      cleaningFee: 18,
      commissionPaid: 5.76,
      netRevenue: 186.24,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '7732',
      specialNotes: 'Llega en remise desde Aeroparque a las 14:30 hs.',
      createdAt: getRelativeDate(-3),
      airbnbFeeMode: 'traditional_3',
    },
    {
      id: 'res-104',
      propertyId: 'cat-c',
      guestName: 'Claire Dupont',
      guestEmail: 'claire.dupont@huesped.com',
      guestPhone: '+33 6 12 34 56 78',
      guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(-2),
      checkOut: getRelativeDate(2), // Estadía en curso (sale en 2 días)
      nights: 4,
      guestsCount: 2,
      platform: 'direct',
      totalAmount: 232,
      cleaningFee: 20,
      commissionPaid: 0,
      netRevenue: 232,
      status: 'checked_in',
      paymentStatus: 'paid',
      pinCode: '0310',
      carPlate: 'AB 415 KM',
      specialNotes: 'Viaje de trabajo y turismo. Todo en orden en la unidad.',
      createdAt: getRelativeDate(-10),
      addons: [
        {
          addonId: 'addon-desayuno-artesanal',
          name: 'Desayuno Campestre Artesanal (x2 días)',
          category: 'desayuno',
          unitPrice: 12,
          quantity: 2,
          total: 24,
          status: 'entregado',
        },
      ],
    },
    {
      id: 'res-105',
      propertyId: 'cat-d',
      guestName: 'Martín Soria & Familia',
      guestEmail: 'martin.soria@huesped.com',
      guestPhone: '+54 9 11 6789-2234',
      guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(1), // Llega mañana
      checkOut: getRelativeDate(5),
      nights: 4,
      guestsCount: 2,
      platform: 'direct', // Direct booking 0% comisión
      totalAmount: 192,
      cleaningFee: 18,
      commissionPaid: 0,
      netRevenue: 192,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '2140',
      carPlate: 'AC 910 TR',
      specialNotes: 'Reserva directa por link web de Loomi Suite. Ahorró comisiones de intermediarios.',
      createdAt: getRelativeDate(-2),
    },
    {
      id: 'res-106',
      propertyId: 'cat-a',
      guestName: 'Santiago Morales',
      guestEmail: 'santi.morales@huesped.com',
      guestPhone: '+54 9 351 223-9911',
      guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(3), // Recambio en Depto A
      checkOut: getRelativeDate(7),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 232,
      cleaningFee: 20,
      commissionPaid: 6.96,
      netRevenue: 225.04,
      status: 'confirmed',
      paymentStatus: 'pending', // Seña pendiente
      pinCode: '9082',
      specialNotes: 'Modalidad Airbnb tradicional. Viene por evento corporativo.',
      createdAt: getRelativeDate(-1),
      airbnbFeeMode: 'traditional_3',
    },
    {
      id: 'res-107',
      propertyId: 'cat-c',
      guestName: 'Valeria Benítez',
      guestEmail: 'valeria.benitez@huesped.com',
      guestPhone: '+598 99 876 543',
      guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(2),
      checkOut: getRelativeDate(6),
      nights: 4,
      guestsCount: 2,
      platform: 'direct',
      totalAmount: 232,
      cleaningFee: 20,
      commissionPaid: 0,
      netRevenue: 232,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '5541',
      specialNotes: 'Huésped frecuente de Montevideo.',
      createdAt: getRelativeDate(-2),
    },
    // Reservas históricas recientes del mes para métricas coherentes (~70% ocupación mensual para 4 unidades)
    {
      id: 'res-108',
      propertyId: 'cat-a',
      guestName: 'Mateo Rossi',
      guestEmail: 'mateo.rossi@huesped.com',
      guestPhone: '+54 9 11 3322-1100',
      checkIn: getRelativeDate(-7),
      checkOut: getRelativeDate(-3),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 232,
      cleaningFee: 20,
      commissionPaid: 6.96,
      netRevenue: 225.04,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '3120',
      createdAt: getRelativeDate(-15),
    },
    {
      id: 'res-109',
      propertyId: 'cat-b',
      guestName: 'Camila Torres',
      guestEmail: 'camila.torres@huesped.com',
      guestPhone: '+54 9 11 8899-7711',
      checkIn: getRelativeDate(-8),
      checkOut: getRelativeDate(-3),
      nights: 5,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 240,
      cleaningFee: 18,
      commissionPaid: 36,
      netRevenue: 204,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '7819',
      createdAt: getRelativeDate(-16),
    },
    {
      id: 'res-110',
      propertyId: 'cat-c',
      guestName: 'Gonzalo Silva',
      guestEmail: 'gonzalo.silva@huesped.com',
      guestPhone: '+54 9 341 456-7890',
      checkIn: getRelativeDate(-9),
      checkOut: getRelativeDate(-4),
      nights: 5,
      guestsCount: 3,
      platform: 'airbnb',
      totalAmount: 290,
      cleaningFee: 20,
      commissionPaid: 8.7,
      netRevenue: 281.3,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '4452',
      createdAt: getRelativeDate(-20),
    },
    {
      id: 'res-111',
      propertyId: 'cat-d',
      guestName: 'Lucía Albornoz',
      guestEmail: 'lucia.albornoz@huesped.com',
      guestPhone: '+54 9 11 7711-2233',
      checkIn: getRelativeDate(-12),
      checkOut: getRelativeDate(-7),
      nights: 5,
      guestsCount: 2,
      platform: 'direct',
      totalAmount: 240,
      cleaningFee: 18,
      commissionPaid: 0,
      netRevenue: 240,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '6618',
      createdAt: getRelativeDate(-22),
    },
    {
      id: 'res-112',
      propertyId: 'cat-a',
      guestName: 'Federico Balbi',
      guestEmail: 'federico.balbi@huesped.com',
      guestPhone: '+54 9 261 411-9988',
      checkIn: getRelativeDate(-16),
      checkOut: getRelativeDate(-11),
      nights: 5,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 290,
      cleaningFee: 20,
      commissionPaid: 8.7,
      netRevenue: 281.3,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '8821',
      createdAt: getRelativeDate(-28),
    },
    {
      id: 'res-113',
      propertyId: 'cat-b',
      guestName: 'Sofía Carrizo',
      guestEmail: 'sofia.carrizo@huesped.com',
      guestPhone: '+54 9 11 9900-1122',
      checkIn: getRelativeDate(-18),
      checkOut: getRelativeDate(-13),
      nights: 5,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 240,
      cleaningFee: 18,
      commissionPaid: 36,
      netRevenue: 204,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '1092',
      createdAt: getRelativeDate(-29),
    },
    {
      id: 'res-114',
      propertyId: 'cat-c',
      guestName: 'Ignacio Roldán',
      guestEmail: 'ignacio.roldan@huesped.com',
      guestPhone: '+54 9 11 5566-4433',
      checkIn: getRelativeDate(-20),
      checkOut: getRelativeDate(-15),
      nights: 5,
      guestsCount: 3,
      platform: 'direct',
      totalAmount: 290,
      cleaningFee: 20,
      commissionPaid: 0,
      netRevenue: 290,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '9920',
      createdAt: getRelativeDate(-30),
    },
    {
      id: 'res-115',
      propertyId: 'cat-d',
      guestName: 'Marina Peña',
      guestEmail: 'marina.pena@huesped.com',
      guestPhone: '+54 9 11 4455-8899',
      checkIn: getRelativeDate(-21),
      checkOut: getRelativeDate(-17),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 192,
      cleaningFee: 18,
      commissionPaid: 5.76,
      netRevenue: 186.24,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '3319',
      createdAt: getRelativeDate(-32),
    },
  ];
}

export function generateInitialCleaningTasks(): CleaningTask[] {
  return [
    {
      id: 'clean-1',
      propertyId: 'cat-b',
      reservationId: 'res-102',
      date: getRelativeDate(0), // HOY
      scheduledTime: '10:30 - 13:30 (Urgente - Recambio)',
      cleanerName: 'Marta González',
      cleanerPhone: '+54 9 11 5566-7788',
      status: 'in_progress',
      checklist: [
        { id: 'c1', task: 'Cambio exprés de sábanas y toallas limpias', completed: true },
        { id: 'c2', task: 'Desinfección de baños y reposición de jabones/shampoo', completed: true },
        { id: 'c3', task: 'Limpieza profunda de cocina, heladera y microondas', completed: false },
        { id: 'c4', task: 'Verificación de cerradura inteligente y pilas', completed: false },
        { id: 'c5', task: 'Fotos de control y reporte final', completed: false },
      ],
      notes: '⚡ RECAMBIO MISMO DÍA: Sale Elena Miller a las 10:00 hs y entra Agustina Gómez a las 14:00 hs. Prioridad máxima.',
      photosUploaded: 2,
    },
    {
      id: 'clean-2',
      propertyId: 'cat-a',
      reservationId: 'res-101',
      date: getRelativeDate(0), // HOY
      scheduledTime: '09:00 - 11:30 (Preparación Depto A)',
      cleanerName: 'Carlos Ruiz',
      cleanerPhone: '+54 9 11 2233-4455',
      status: 'inspected',
      checklist: [
        { id: 'c1', task: 'Cambio de blancos 400 hilos y aromatización', completed: true },
        { id: 'c2', task: 'Limpieza de terraza y balcón', completed: true },
        { id: 'c3', task: 'Reposición de cápsulas de café y amenities', completed: true },
        { id: 'c4', task: 'Control de vajilla y copas', completed: true },
      ],
      notes: 'Unidad higienizada y lista para el check-in de Lucas Fernández a las 14:00 hs.',
      photosUploaded: 4,
    },
    {
      id: 'clean-3',
      propertyId: 'cat-c',
      reservationId: 'res-104',
      date: getRelativeDate(2),
      scheduledTime: '11:00 - 13:30 (Salida Depto C)',
      cleanerName: 'Ana Méndez',
      cleanerPhone: '+54 9 11 9988-7766',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Lavado y tendido de ropa blanca', completed: false },
        { id: 'c2', task: 'Aspirado y desinfección de pisos', completed: false },
        { id: 'c3', task: 'Comprobación de control remoto de A/C y TV', completed: false },
      ],
      notes: 'Salida de Claire Dupont.',
    },
    {
      id: 'clean-4',
      propertyId: 'cat-d',
      reservationId: 'res-105',
      date: getRelativeDate(1),
      scheduledTime: '11:00 - 13:00 (Preparación Depto D)',
      cleanerName: 'Marta González',
      cleanerPhone: '+54 9 11 5566-7788',
      status: 'inspected',
      checklist: [
        { id: 'c1', task: 'Desinfección integral y sanitización', completed: true },
        { id: 'c2', task: 'Limpieza de ventanales', completed: true },
        { id: 'c3', task: 'Toallas dobladas y amenities de baño', completed: true },
        { id: 'c4', task: 'Inspección de daños aprobada', completed: true },
      ],
      notes: 'Todo en perfecto orden. Lista para la llegada de Martín Soria mañana.',
      photosUploaded: 3,
    },
  ];
}

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Confirmación & Bienvenida Anticipada',
    triggerEvent: 'Al confirmarse la reserva',
    channel: 'whatsapp',
    content: '¡Hola, {{nombre_huésped}}! 🌲 Te confirmamos que tu reserva para la unidad {{unidad_alojamiento}} está registrada con éxito desde el {{fecha_checkin}} hasta el {{fecha_checkout}}.\nPara que tu llegada sea perfecta y sin demoras, te compartimos tu Guía Digital de Bienvenida exclusiva. Desde allí vas a poder ver el mapa interactivo con la ruta de acceso, las claves de Wi-Fi y completar tu registro de pasajeros digital:\n🔗 {{link_guia_digital}}\n¡Estamos felices de recibirte! Cualquier duda, estamos a un toque de distancia por acá.',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{fecha_checkin}}', '{{fecha_checkout}}', '{{link_guia_digital}}'],
  },
  {
    id: 'tpl-2',
    title: 'Coordinación en Ruta / Día de Viaje',
    triggerEvent: 'La mañana del Check-In',
    channel: 'whatsapp',
    content: '¡Buen día, {{nombre_huésped}}! Esperamos que tengan un muy lindo viaje en ruta hacia el complejo. 🚗\nTe recordamos que el ingreso a {{unidad_alojamiento}} está habilitado a partir de las 14:00 hs. Si necesitás repasar las indicaciones exactas de cómo llegar o querés activar el GPS desde el mapa, podés hacerlo directamente desde tu enlace de bienvenida:\n🔗 {{link_guia_digital}}\nAvisanos cuando estén cerca de la zona para esperarlos con el alojamiento climatizado y las llaves listas. ¡Buen viaje!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{link_guia_digital}}'],
  },
  {
    id: 'tpl-3',
    title: 'Control de Confort y Blindaje Anti-Quejas',
    triggerEvent: '2 Horas Post Check-In',
    channel: 'whatsapp',
    content: '¡Hola, {{nombre_huésped}}! Esperamos que ya estén cómodamente instalados en {{unidad_alojamiento}}. ✨\nTe escribo para confirmar que hayan encontrado todo impecable y en perfecto orden. ¿Tienen buena señal de Wi-Fi y la temperatura está agradable?\nSi necesitan algún juego extra de toallas, almohada adicional o recomendación de dónde almorzar o cenar rico hoy, estamos a total disposición por acá para que su estadía sea increíble. ¡Que descansen!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}'],
  },
  {
    id: 'tpl-4',
    title: 'Recordatorio de Check-out Amable',
    triggerEvent: 'Noche anterior al Check-out (20:00 hs)',
    channel: 'whatsapp',
    content: 'Hola, {{nombre_huésped}}, esperamos que hayan tenido una estadía maravillosa en {{unidad_alojamiento}}. ✨\nLes recordamos que el check-out es mañana a las 11:00 hs para permitir la preparación del lugar.\nSolo les pedimos apagar luces y climatización, y avisarnos al salir. ¡Buen viaje de regreso y esperamos recibirlos pronto!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}'],
  },
  {
    id: 'tpl-5',
    title: 'Solicitud de Reseña 5 Estrellas y Descuento Directo',
    triggerEvent: '2 horas después del Check-out',
    channel: 'whatsapp',
    content: '¡Muchas gracias por cuidar {{unidad_alojamiento}} con tanto cariño, {{nombre_huésped}}! 🌟\nSi les gustó la experiencia, nos ayudarían un montón dejándonos una reseña de 5 estrellas.\nY para su próxima escapada, pueden reservar directo con nosotros con tarifa preferencial: 🔗 {{link_guia_digital}}\n¡Hasta la próxima!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{link_guia_digital}}'],
  },
];

const LOCAL_STORAGE_KEY = 'loomisuite_demo_state_v5';

export const INITIAL_WELCOME_GUIDE: WelcomeGuideData = {
  propertyName: 'Catalinas Apartamentos',
  tagline: 'Guía Digital de Bienvenida Interactiva • Buenos Aires, Argentina',
  hostName: 'Administración',
  hostPhone: '+54 9 11 5555-0100',
  locationAddress: 'Tres Sargentos 400, Retiro / Catalinas Norte, CABA',
  googleMapsUrl: 'https://maps.google.com/?q=Tres+Sargentos+Retiro+Buenos+Aires',
  wifiNetwork: 'CatalinasAptos_Fibra_5G',
  wifiPassword: 'CatalinasDemo2026',
  poolHours: 'No aplica (Edificio residencial urbano con seguridad y ascensor)',
  checkoutHour: '10:00 hs (Consultar con Recepción para custodia de equipaje)',
  woodBagPrice: 'Servicio de Mucama Extra: $18 USD / $18.000 ARS',
  specialAnnouncement: '🏙️ ¡Bienvenidos a Catalinas Apartamentos! Guardá este link en tu celular: tenés la ubicación exacta, clave de WiFi en 1 clic, atracciones de la ciudad y todo para disfrutar tu estadía.',
  transportation: [
    {
      id: 'trans-1',
      title: 'Traslado Privado (Remís de Confianza)',
      type: 'airport' as const,
      description: 'Servicio de traslado privado puerta a puerta desde Aeroparque, Ezeiza o Terminal de Ómnibus, coordinado previamente con chofer profesional.',
      estimatedCost: 'Tarifa pactada ~$12.000 ARS',
      contactPhone: '+54 9 11 5555-0100',
      actionUrl: 'https://wa.me/5491155550100?text=Hola,%20soy%20huésped%20de%20Tu%20Complejo%20y%20quisiera%20coordinar%20el%20traslado',
      actionLabel: 'Pedir Traslado Privado',
    },
    {
      id: 'trans-2',
      title: 'Servicio Público (Subte y Colectivos)',
      type: 'bus_station' as const,
      description: 'Múltiples líneas de colectivos y estaciones de Subte (Línea A, D o E) a menos de 200 metros del complejo, con conexión rápida a toda la ciudad.',
      estimatedCost: 'Boleto con tarjeta SUBE',
      actionLabel: 'Ver Estaciones Cercanas',
      actionUrl: 'https://maps.google.com/?q=Plaza+de+Mayo+Buenos+Aires',
    },
    {
      id: 'trans-3',
      title: 'Cómo llegar en Auto Propio / GPS',
      type: 'car' as const,
      description: 'Acceso directo por avenidas principales de la ciudad. Estacionamiento cubierto con seguridad las 24 hs a 50 metros del complejo disponible por una tarifa diaria.',
      actionLabel: 'Abrir GPS en Google Maps',
      actionUrl: 'https://maps.google.com/?q=Plaza+de+Mayo+Buenos+Aires',
    },
  ],
  attractions: [
    {
      id: 'att-1',
      title: 'Plaza de Mayo y Cabildo Histórico',
      category: 'ciudad' as const,
      description: 'El centro cívico e histórico más importante de la República Argentina, rodeado por la Catedral Metropolitana, el Cabildo y la Casa Rosada.',
      tips: 'Entrada libre y gratuita al Cabildo histórico. Excelente punto para iniciar cualquier caminata por el centro histórico.',
      distanceMinutes: 2,
    },
    {
      id: 'att-2',
      title: 'Teatro Colón (Visita Guiada)',
      category: 'ciudad' as const,
      description: 'Uno de los teatros de ópera más importantes del mundo, famoso por su acústica perfecta y su imponente arquitectura del siglo XIX.',
      tips: 'Recomendamos reservar la visita guiada en la web oficial con anticipación.',
      officialUrl: 'https://teatrocolon.org.ar',
      distanceMinutes: 12,
    },
    {
      id: 'att-3',
      title: 'San Telmo y Plaza Dorrego',
      category: 'naturaleza' as const,
      description: 'Barrio colonial emblemático famoso por sus calles adoquinadas, tiendas de antigüedades, artistas de tango callejeros y la gran feria de los domingos.',
      tips: 'Ideal para pasear un domingo por la mañana y almorzar en el icónico Mercado de San Telmo.',
      distanceMinutes: 10,
    },
    {
      id: 'att-4',
      title: 'Puerto Madero y Puente de la Mujer',
      category: 'ciudad' as const,
      description: 'El barrio más moderno de la ciudad con un hermoso paseo peatonal frente a los antiguos diques reciclados y el famoso Puente de la Mujer de Calatrava.',
      tips: 'Excelente para pasear al atardecer y disfrutar de una cena frente al agua.',
      distanceMinutes: 15,
    },
  ],
  dining: [
    {
      id: 'din-1',
      name: 'Proveeduría Interna del Complejo',
      specialty: 'En recepción disponemos de insumos básicos como café, té, azúcar, galletitas, agua mineral, carbón y artículos de aseo personal sin cargo o con costo mínimo.',
      priceRange: '$' as const,
      hasDelivery: false,
      address: 'Lobby / Recepción del Complejo',
    },
    {
      id: 'din-2',
      name: 'Almacén & Fiambrería El Sol (A 1 cuadra)',
      specialty: 'Minimercado de barrio ideal para compras rápidas de insumos frescos: pan fresco, lácteos, fiambres, bebidas heladas y productos de almacén.',
      priceRange: '$' as const,
      hasDelivery: false,
      address: 'Av. de Mayo 210',
    },
    {
      id: 'din-3',
      name: 'Supermercado de Cercanía (A 2 cuadras)',
      specialty: 'Supermercado express ideal para compras grandes de mercadería para cocinar en tu unidad: frutas, verduras, carnes y variedad de marcas.',
      priceRange: '$$' as const,
      hasDelivery: false,
      address: 'Alsina 180',
    },
  ],
  rules: [
    {
      title: 'Piscina y Solárium en Terraza',
      description: 'Habilitada todos los días de 08:00 a 21:00 hs. Ducha previa obligatoria. Por cuestiones de seguridad, no se permite ingresar con elementos de vidrio en el sector del solárium.',
    },
    {
      title: 'Descanso y Convivencia',
      description: 'A partir de las 22:00 hs solicitamos mantener un volumen moderado para garantizar el descanso y confort de todos los huéspedes de las unidades vecinas.',
    },
    {
      title: 'Climatización Consciente',
      description: 'Por favor mantener cerradas las puertas y ventanas exteriores mientras el aire acondicionado o calefacción estén encendidos para un uso responsable de la energía.',
    },
  ],
  directBookingSettings: {
    customSlug: 'tu-complejo-demo',
    customDomain: 'tucomplejo.com.ar',
    customDomainStatus: 'pending_dns',
    customDomainDnsTarget: 'cname.loomisuite.com',
    depositPercentage: 50,
    bankAlias: 'COMPLEJO.DEMO.ALIA',
    cbu: '0140999803400012345678',
    bankName: 'Banco de la Nación Argentina',
    accountHolder: 'Gabriela - Tu Complejo',
    mercadoPagoLink: 'https://link.mercadopago.com.ar/tucomplejodemo',
    paypalLink: 'https://paypal.me/tucomplejodemo',
    directDiscountPercent: 10,
  },
};

export const INITIAL_ADDONS: AddonService[] = [
  {
    id: 'addon-transfer-in',
    name: 'Transfer Aeropuerto AEP/EZE (Llegada)',
    category: 'transfers',
    price: 30,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Recepción personalizada en arribos con cartel y traslado directo al complejo en auto de categoría con A/C.',
    iconName: 'Car',
  },
  {
    id: 'addon-transfer-out',
    name: 'Transfer a Aeropuerto AEP/EZE (Salida)',
    category: 'transfers',
    price: 30,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Búsqueda puntual en la recepción para llegar con tiempo a tu vuelo.',
    iconName: 'Car',
  },
  {
    id: 'addon-transfer-citytour',
    name: 'City Tour Histórico Privado con Guía',
    category: 'transfers',
    price: 45,
    unitLabel: 'tour de 3 hs',
    description: 'Recorrido privado en auto por Plaza de Mayo, San Telmo, La Boca y Recoleta, con explicaciones históricas.',
    iconName: 'Navigation',
  },
  {
    id: 'addon-frigobar-vino',
    name: 'Vino Malbec Reserva + Copa de Bienvenida',
    category: 'frigobar',
    price: 18,
    unitLabel: 'por botella',
    description: 'Etiqueta seleccionada mendocina lista y atemperada en tu unidad.',
    iconName: 'Wine',
  },
  {
    id: 'addon-frigobar-cerveza',
    name: 'Pack Cervezas Artesanales Porteñas (4 un.)',
    category: 'frigobar',
    price: 12,
    unitLabel: 'pack de 4',
    description: 'Cervezas artesanales seleccionadas frías esperándote en la heladera.',
    iconName: 'Beer',
  },
  {
    id: 'addon-lena',
    name: 'Estacionamiento Privado Cubierto en Cochera',
    category: 'frigobar',
    price: 15,
    unitLabel: 'por día',
    description: 'Acceso a cochera privada y vigilada las 24 horas a metros de tu unidad.',
    iconName: 'Shield',
  },
  {
    id: 'addon-desayuno-selva',
    name: 'Canasta de Desayuno Porteño Premium',
    category: 'desayuno',
    price: 14,
    unitLabel: 'por persona / día',
    description: 'Medialunas recién horneadas, tostadas, mermeladas, queso crema, jugo de naranja exprimido y café.',
    iconName: 'Coffee',
  },
  {
    id: 'addon-spa-masaje',
    name: 'Masaje Relajante Descontracturante en tu Unidad',
    category: 'spa',
    price: 40,
    unitLabel: 'sesión de 60 min',
    description: 'Masoterapeuta profesional en la privacidad y comodidad de tu departamento con aceites esenciales.',
    iconName: 'Sparkles',
  },
  {
    id: 'addon-spa-hidro',
    name: 'Kit Sales Aromáticas & Amenities Premium para Baño',
    category: 'spa',
    price: 15,
    unitLabel: 'kit spa',
    description: 'Sales minerales de lavanda y eucalipto para una inmersión reparadora en la bañera.',
    iconName: 'Droplets',
  },
];

export const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'mov-1',
    date: getRelativeDate(-2),
    type: 'ingreso',
    amount: 15000,
    concept: 'Cobro de Estacionamiento Cubierto - Depto 101',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'prop-1',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-2',
    date: getRelativeDate(-1),
    type: 'egreso',
    amount: 8500,
    concept: 'Artículos de limpieza para reposición (Desinfectante, trapos)',
    paymentMethod: 'efectivo',
    category: 'insumos',
    propertyId: 'prop-1',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-3',
    date: getRelativeDate(-1),
    type: 'ingreso',
    amount: 45000,
    concept: 'Cobro Adicional Late Check-out en Efectivo - Huésped Pérez',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'prop-2',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-4',
    date: getRelativeDate(0),
    type: 'egreso',
    amount: 32000,
    concept: 'Servicio técnico cerrajero por reparación picaporte Depto 103',
    paymentMethod: 'transferencia',
    category: 'mantenimiento',
    propertyId: 'prop-3',
    userRole: 'admin',
  },
  {
    id: 'mov-5',
    date: getRelativeDate(0),
    type: 'ingreso',
    amount: 12000,
    concept: 'Cobro de Desayuno Porteño extra en efectivo',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'prop-1',
    userRole: 'frontdesk',
  }
];

export function getDemoState(): DemoState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure properties array exists
      if (!parsed.properties || !Array.isArray(parsed.properties) || parsed.properties.length === 0) {
        parsed.properties = INITIAL_PROPERTIES;
      }
      // Preserve user reservations without force-overwriting their simulation
      if (!parsed.reservations || !Array.isArray(parsed.reservations)) {
        parsed.reservations = generateInitialReservations();
      }
      // Ensure welcomeGuide exists
      if (!parsed.welcomeGuide) {
        parsed.welcomeGuide = INITIAL_WELCOME_GUIDE;
      }
      // Ensure templates exist
      if (!parsed.templates || !Array.isArray(parsed.templates) || parsed.templates.length === 0) {
        parsed.templates = INITIAL_TEMPLATES;
      }
      // Ensure addons exist
      if (!parsed.availableAddons || !Array.isArray(parsed.availableAddons) || parsed.availableAddons.length === 0) {
        parsed.availableAddons = INITIAL_ADDONS;
      }
      if (!parsed.addons || !Array.isArray(parsed.addons) || parsed.addons.length === 0) {
        parsed.addons = parsed.availableAddons || INITIAL_ADDONS;
      }
      // Ensure cash movements exist
      if (!parsed.cashMovements || !Array.isArray(parsed.cashMovements)) {
        parsed.cashMovements = INITIAL_CASH_MOVEMENTS;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading demo state from localStorage', e);
  }

  const defaultState: DemoState = {
    properties: INITIAL_PROPERTIES,
    reservations: generateInitialReservations(),
    cleaningTasks: generateInitialCleaningTasks(),
    templates: INITIAL_TEMPLATES,
    welcomeGuide: INITIAL_WELCOME_GUIDE,
    availableAddons: INITIAL_ADDONS,
    addons: INITIAL_ADDONS,
    cashMovements: INITIAL_CASH_MOVEMENTS,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  } catch {}
  return defaultState;
}

export function saveDemoState(state: DemoState, _complexId?: string): void {
  // Aislamiento total: la demo vive exclusivamente en el localStorage del usuario
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving demo state to localStorage', e);
  }
}

export function resetDemoState(): DemoState {
  const freshState: DemoState = {
    properties: INITIAL_PROPERTIES,
    reservations: generateInitialReservations(),
    cleaningTasks: generateInitialCleaningTasks(),
    templates: INITIAL_TEMPLATES,
    welcomeGuide: INITIAL_WELCOME_GUIDE,
    availableAddons: INITIAL_ADDONS,
    addons: INITIAL_ADDONS,
    cashMovements: INITIAL_CASH_MOVEMENTS,
    lastUpdated: new Date().toISOString(),
  };
  saveDemoState(freshState);
  return freshState;
}
