import { DemoState, Property, Reservation, CleaningTask, MessageTemplate, WelcomeGuideData, AddonService, CashMovement } from '../types';

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

export function getGuestInitials(name: string): string {
  if (!name) return 'H';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'H';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'cab-lapacho',
    name: 'Cabaña Lapacho',
    type: 'Cabaña Familiar con Deck y Parrilla (hasta 4 pax)',
    address: 'Ruta Ejemplo km 5, Puerto Iguazú, Misiones',
    neighborhood: 'Puerto Iguazú',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    basePrice: 65,
    cleaningFee: 20,
    imageUrl: '/cabanas/cabana-terraza.jpg',
    rating: 4.97,
    reviewsCount: 114,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'Iguazu_Lapacho_WiFi',
    wifiPassword: 'IguazuDemo2026',
  },
  {
    id: 'cab-timbo',
    name: 'Cabaña Timbó',
    type: 'Cabaña Matrimonial con Vista a la Selva (hasta 2 pax)',
    address: 'Ruta Ejemplo km 5, Puerto Iguazú, Misiones',
    neighborhood: 'Puerto Iguazú',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 50,
    cleaningFee: 18,
    imageUrl: '/cabanas/cabana-hamaca.jpg',
    rating: 4.95,
    reviewsCount: 98,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'Iguazu_Timbo_WiFi',
    wifiPassword: 'IguazuDemo2026',
  },
  {
    id: 'cab-guatambu',
    name: 'Cabaña Guatambú',
    type: 'Cabaña Clásica de Madera con Galería (hasta 3 pax)',
    address: 'Ruta Ejemplo km 5, Puerto Iguazú, Misiones',
    neighborhood: 'Puerto Iguazú',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    basePrice: 58,
    cleaningFee: 20,
    imageUrl: '/cabanas/deck-hamaca.jpg',
    rating: 4.98,
    reviewsCount: 89,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'Iguazu_Guatambu_WiFi',
    wifiPassword: 'IguazuDemo2026',
  },
  {
    id: 'cab-palorosa',
    name: 'Cabaña Palo Rosa',
    type: 'Suite Superior Selva con Hidromasaje (hasta 2 pax)',
    address: 'Ruta Ejemplo km 5, Puerto Iguazú, Misiones',
    neighborhood: 'Puerto Iguazú',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 72,
    cleaningFee: 22,
    imageUrl: '/cabanas/sendero-noche.jpg',
    rating: 4.99,
    reviewsCount: 104,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Digital Touch / Teclado' },
    wifiNetwork: 'Iguazu_PaloRosa_WiFi',
    wifiPassword: 'IguazuDemo2026',
  },
];

export function generateInitialReservations(): Reservation[] {
  return [
    {
      id: 'res-101',
      propertyId: 'cab-lapacho',
      guestName: 'Lucas Fernández',
      guestEmail: 'lucas.fernandez@huesped.com',
      guestPhone: '+54 9 11 4512-8890',
      checkIn: getRelativeDate(0), // Check-in HOY 14:00 hs
      checkOut: getRelativeDate(3),
      nights: 3,
      guestsCount: 3,
      platform: 'airbnb',
      totalAmount: 195,
      cleaningFee: 20,
      commissionPaid: 5.85,
      netRevenue: 189.15,
      status: 'confirmed',
      paymentStatus: 'pending', // Saldo pendiente al ingresar
      pinCode: '4821',
      carPlate: 'AF 729 ZX',
      specialNotes: 'Llega en vuelo al aeropuerto de Iguazú a las 14:00 hs. Solicitó bolsa de leña para la parrilla.',
      createdAt: getRelativeDate(-4),
      earlyCheckIn: true,
      earlyLateFee: 15,
      addons: [
        {
          addonId: 'addon-lena',
          name: 'Bolsa de Leña Seca & Carbón para Parrilla',
          category: 'frigobar',
          unitPrice: 5,
          quantity: 1,
          total: 5,
          status: 'entregado',
        },
      ],
    },
    {
      id: 'res-102',
      propertyId: 'cab-timbo',
      guestName: 'Elena Miller',
      guestEmail: 'elena.miller@huesped.com',
      guestPhone: '+1 212 555-0199',
      checkIn: getRelativeDate(-3),
      checkOut: getRelativeDate(0), // Check-out HOY 10:00 hs (Recambio mismo día)
      nights: 3,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 150,
      cleaningFee: 18,
      commissionPaid: 22.5,
      netRevenue: 127.5,
      status: 'checked_in',
      paymentStatus: 'paid',
      pinCode: '1420',
      specialNotes: 'Check-out puntual a las 10:00 hs para tomar vuelo de regreso. Estadía impecable.',
      createdAt: getRelativeDate(-14),
    },
    {
      id: 'res-103',
      propertyId: 'cab-timbo',
      guestName: 'Agustina Gómez',
      guestEmail: 'agustina.gomez@huesped.com',
      guestPhone: '+54 9 223 543-2211',
      checkIn: getRelativeDate(0), // Check-in HOY 14:00 hs (Recambio)
      checkOut: getRelativeDate(4),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 200,
      cleaningFee: 18,
      commissionPaid: 6.0,
      netRevenue: 194.0,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '7732',
      specialNotes: 'Llega en auto desde Posadas por Ruta 12 cerca de las 15:00 hs.',
      createdAt: getRelativeDate(-3),
    },
    {
      id: 'res-104',
      propertyId: 'cab-guatambu',
      guestName: 'Claire Dupont',
      guestEmail: 'claire.dupont@huesped.com',
      guestPhone: '+33 6 12 34 56 78',
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
      specialNotes: 'Visita guiada a Cataratas contratada para mañana temprano.',
      createdAt: getRelativeDate(-10),
      addons: [
        {
          addonId: 'addon-desayuno-selva',
          name: 'Canasta de Desayuno Misionero de Campo (x2 días)',
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
      propertyId: 'cab-palorosa',
      guestName: 'Martín Soria & Familia',
      guestEmail: 'martin.soria@huesped.com',
      guestPhone: '+54 9 11 6789-2234',
      checkIn: getRelativeDate(1), // Llega mañana
      checkOut: getRelativeDate(5),
      nights: 4,
      guestsCount: 2,
      platform: 'direct', // Direct booking 0% comisión
      totalAmount: 288,
      cleaningFee: 22,
      commissionPaid: 0,
      netRevenue: 288,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '2140',
      carPlate: 'AC 910 TR',
      specialNotes: 'Reserva directa por link web de Loomi Suite. Solicitó late check-out el día de salida.',
      createdAt: getRelativeDate(-2),
    },
    {
      id: 'res-106',
      propertyId: 'cab-lapacho',
      guestName: 'Santiago Morales',
      guestEmail: 'santi.morales@huesped.com',
      guestPhone: '+54 9 351 223-9911',
      checkIn: getRelativeDate(3), // Recambio en Lapacho
      checkOut: getRelativeDate(7),
      nights: 4,
      guestsCount: 4,
      platform: 'airbnb',
      totalAmount: 260,
      cleaningFee: 20,
      commissionPaid: 7.8,
      netRevenue: 252.2,
      status: 'confirmed',
      paymentStatus: 'pending', // Seña pendiente
      pinCode: '9082',
      specialNotes: 'Vienen en familia desde Córdoba. Avisaron llegada cerca de las 16:00 hs.',
      createdAt: getRelativeDate(-1),
    },
    {
      id: 'res-107',
      propertyId: 'cab-guatambu',
      guestName: 'Valeria Benítez',
      guestEmail: 'valeria.benitez@huesped.com',
      guestPhone: '+598 99 876 543',
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
      specialNotes: 'Huéspedes de Montevideo en viaje fotográfico de naturaleza.',
      createdAt: getRelativeDate(-2),
    },
    // Reservas históricas recientes del mes para métricas coherentes (~70% ocupación mensual para 4 unidades)
    {
      id: 'res-108',
      propertyId: 'cab-lapacho',
      guestName: 'Mateo Rossi',
      guestEmail: 'mateo.rossi@huesped.com',
      guestPhone: '+54 9 11 3322-1100',
      checkIn: getRelativeDate(-7),
      checkOut: getRelativeDate(-3),
      nights: 4,
      guestsCount: 3,
      platform: 'airbnb',
      totalAmount: 260,
      cleaningFee: 20,
      commissionPaid: 7.8,
      netRevenue: 252.2,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '3120',
      createdAt: getRelativeDate(-15),
    },
    {
      id: 'res-109',
      propertyId: 'cab-timbo',
      guestName: 'Camila Torres',
      guestEmail: 'camila.torres@huesped.com',
      guestPhone: '+54 9 11 8899-7711',
      checkIn: getRelativeDate(-8),
      checkOut: getRelativeDate(-3),
      nights: 5,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 250,
      cleaningFee: 18,
      commissionPaid: 37.5,
      netRevenue: 212.5,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '7819',
      createdAt: getRelativeDate(-16),
    },
    {
      id: 'res-110',
      propertyId: 'cab-guatambu',
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
      propertyId: 'cab-palorosa',
      guestName: 'Lucía Albornoz',
      guestEmail: 'lucia.albornoz@huesped.com',
      guestPhone: '+54 9 11 7711-2233',
      checkIn: getRelativeDate(-12),
      checkOut: getRelativeDate(-7),
      nights: 5,
      guestsCount: 2,
      platform: 'direct',
      totalAmount: 360,
      cleaningFee: 22,
      commissionPaid: 0,
      netRevenue: 360,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '6618',
      createdAt: getRelativeDate(-22),
    },
    {
      id: 'res-112',
      propertyId: 'cab-lapacho',
      guestName: 'Federico Balbi',
      guestEmail: 'federico.balbi@huesped.com',
      guestPhone: '+54 9 261 411-9988',
      checkIn: getRelativeDate(-16),
      checkOut: getRelativeDate(-11),
      nights: 5,
      guestsCount: 4,
      platform: 'airbnb',
      totalAmount: 325,
      cleaningFee: 20,
      commissionPaid: 9.75,
      netRevenue: 315.25,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '8821',
      createdAt: getRelativeDate(-28),
    },
    {
      id: 'res-113',
      propertyId: 'cab-timbo',
      guestName: 'Sofía Carrizo',
      guestEmail: 'sofia.carrizo@huesped.com',
      guestPhone: '+54 9 11 9900-1122',
      checkIn: getRelativeDate(-18),
      checkOut: getRelativeDate(-13),
      nights: 5,
      guestsCount: 2,
      platform: 'booking',
      totalAmount: 250,
      cleaningFee: 18,
      commissionPaid: 37.5,
      netRevenue: 212.5,
      status: 'checked_out',
      paymentStatus: 'paid',
      pinCode: '1092',
      createdAt: getRelativeDate(-29),
    },
    {
      id: 'res-114',
      propertyId: 'cab-guatambu',
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
      propertyId: 'cab-palorosa',
      guestName: 'Marina Peña',
      guestEmail: 'marina.pena@huesped.com',
      guestPhone: '+54 9 11 4455-8899',
      checkIn: getRelativeDate(-21),
      checkOut: getRelativeDate(-17),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 288,
      cleaningFee: 22,
      commissionPaid: 8.64,
      netRevenue: 279.36,
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
      propertyId: 'cab-timbo',
      reservationId: 'res-102',
      date: getRelativeDate(0), // HOY
      scheduledTime: '10:15 - 13:30 (Recambio Rápido)',
      cleanerName: 'Marta González',
      cleanerPhone: '+54 9 3757 55-6677',
      status: 'in_progress',
      checklist: [
        { id: 'c1', task: 'Cambio de sábanas y toallas limpias', completed: true },
        { id: 'c2', task: 'Desinfección de baño y reposición de jabones', completed: true },
        { id: 'c3', task: 'Limpieza de anafe, vajilla y pava eléctrica', completed: false },
        { id: 'c4', task: 'Limpieza de terraza, reposeras y deck', completed: false },
        { id: 'c5', task: 'Control de mosquiteros y aire acondicionado', completed: false },
      ],
      notes: '⚡ RECAMBIO MISMO DÍA: Sale Elena Miller a las 10:00 hs y entra Agustina Gómez a las 14:00 hs. Prioridad máxima.',
      photosUploaded: 2,
    },
    {
      id: 'clean-2',
      propertyId: 'cab-lapacho',
      reservationId: 'res-101',
      date: getRelativeDate(0), // HOY
      scheduledTime: '09:00 - 11:30 (Preparación Cabaña Lapacho)',
      cleanerName: 'Carlos Ruiz',
      cleanerPhone: '+54 9 3757 22-3344',
      status: 'inspected',
      checklist: [
        { id: 'c1', task: 'Tendido de camas familiares y aromatización selva', completed: true },
        { id: 'c2', task: 'Limpieza de parrilla exterior y reposición de leña', completed: true },
        { id: 'c3', task: 'Reposición de saquitos de té, café y azúcar de cortesía', completed: true },
        { id: 'c4', task: 'Control de cerradura digital y llaves', completed: true },
      ],
      notes: 'Cabaña impecable y lista para el check-in de Lucas Fernández a las 14:00 hs.',
      photosUploaded: 4,
    },
    {
      id: 'clean-3',
      propertyId: 'cab-guatambu',
      reservationId: 'res-104',
      date: getRelativeDate(2),
      scheduledTime: '10:00 - 12:30 (Salida Cabaña Guatambú)',
      cleanerName: 'Ana Méndez',
      cleanerPhone: '+54 9 3757 99-8877',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Lavado y tendido de ropa blanca', completed: false },
        { id: 'c2', task: 'Limpieza profunda de pisos de madera y galería', completed: false },
        { id: 'c3', task: 'Comprobación de control remoto de A/C y TV', completed: false },
      ],
      notes: 'Salida de Claire Dupont.',
    },
    {
      id: 'clean-4',
      propertyId: 'cab-palorosa',
      reservationId: 'res-105',
      date: getRelativeDate(1),
      scheduledTime: '10:30 - 13:00 (Preparación Suite Palo Rosa)',
      cleanerName: 'Marta González',
      cleanerPhone: '+54 9 3757 55-6677',
      status: 'inspected',
      checklist: [
        { id: 'c1', task: 'Desinfección integral y pulido de hidromasaje', completed: true },
        { id: 'c2', task: 'Limpieza de ventanales con vista a la selva', completed: true },
        { id: 'c3', task: 'Toallas dobladas y kit de amenities naturales', completed: true },
        { id: 'c4', task: 'Inspección de confort aprobada', completed: true },
      ],
      notes: 'Suite preparada con hidromasaje listo para la llegada de Martín Soria.',
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
    content: '¡Hola, {{nombre_huésped}}! 🌿 Te confirmamos que tu reserva en {{unidad_alojamiento}} de Complejo Iguazú está confirmada con éxito desde el {{fecha_checkin}} hasta el {{fecha_checkout}}.\nPara que tu llegada a la selva sea perfecta y sin demoras, te compartimos tu Guía Digital de Bienvenida interactiva. Desde allí vas a poder ver el mapa con la ruta de acceso desde el aeropuerto o terminal, las claves de Wi-Fi y coordinar excursiones:\n🔗 {{link_guia_digital}}\n¡Estamos felices de recibirte! Cualquier duda, estamos a un toque de distancia por acá.',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{fecha_checkin}}', '{{fecha_checkout}}', '{{link_guia_digital}}'],
  },
  {
    id: 'tpl-2',
    title: 'Coordinación en Ruta / Día de Viaje',
    triggerEvent: 'La mañana del Check-In',
    channel: 'whatsapp',
    content: '¡Buen día, {{nombre_huésped}}! Esperamos que tengan un muy lindo viaje hacia Complejo Iguazú. 🚗\nTe recordamos que el ingreso a {{unidad_alojamiento}} está habilitado a partir de las 14:00 hs. Si necesitás repasar las indicaciones exactas de cómo llegar o querés activar el GPS en Google Maps, podés hacerlo directamente desde tu enlace de bienvenida:\n🔗 {{link_guia_digital}}\nAvisanos cuando estén cerca de Puerto Iguazú para esperarlos con la cabaña climatizada y las llaves listas. ¡Buen viaje!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{link_guia_digital}}'],
  },
  {
    id: 'tpl-3',
    title: 'Control de Confort y Blindaje Anti-Quejas',
    triggerEvent: '2 Horas Post Check-In',
    channel: 'whatsapp',
    content: '¡Hola, {{nombre_huésped}}! Esperamos que ya estén cómodamente instalados en {{unidad_alojamiento}}. ✨\nTe escribo para confirmar que hayan encontrado todo impecable y en perfecto orden. ¿Tienen buena señal de Wi-Fi y la temperatura está agradable?\nSi necesitan leña extra para la parrilla, toallas adicionales o recomendaciones de excursiones a Cataratas, estamos a total disposición por acá para que su estadía sea increíble. ¡Que descansen!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}'],
  },
  {
    id: 'tpl-4',
    title: 'Recordatorio de Check-out Amable',
    triggerEvent: 'Noche anterior al Check-out (20:00 hs)',
    channel: 'whatsapp',
    content: 'Hola, {{nombre_huésped}}, esperamos que hayan tenido una hermosa estadía en {{unidad_alojamiento}}. ✨\nLes recordamos que el check-out es mañana a las 10:00 hs para permitir la preparación del lugar.\nSolo les pedimos apagar luces y aire acondicionado, y avisarnos al salir. Si necesitan transfer al aeropuerto de Iguazú o custodia de equipaje, avísennos con gusto. ¡Buen viaje de regreso!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}'],
  },
  {
    id: 'tpl-5',
    title: 'Solicitud de Reseña 5 Estrellas y Descuento Directo',
    triggerEvent: '2 horas después del Check-out',
    channel: 'whatsapp',
    content: '¡Muchas gracias por visitar Complejo Iguazú y cuidar {{unidad_alojamiento}} con tanto cariño, {{nombre_huésped}}! 🌟\nSi disfrutaron de la naturaleza y el descanso, nos ayudarían un montón dejándonos una reseña de 5 estrellas.\nY para su próxima escapada a la selva misionera, pueden reservar directo con nosotros con tarifa preferencial: 🔗 {{link_guia_digital}}\n¡Hasta la próxima!',
    variables: ['{{nombre_huésped}}', '{{unidad_alojamiento}}', '{{link_guia_digital}}'],
  },
];

const LOCAL_STORAGE_KEY = 'loomisuite_demo_state_v6';

export const INITIAL_WELCOME_GUIDE: WelcomeGuideData = {
  propertyName: 'Complejo Iguazú (Demo)',
  tagline: 'Cabañas en la Selva Misionera • Puerto Iguazú, Misiones',
  hostName: 'Administración',
  hostPhone: '+54 9 3757 55-0100',
  locationAddress: 'Ruta Ejemplo km 5, Puerto Iguazú, Misiones',
  googleMapsUrl: 'https://maps.google.com/?q=Puerto+Iguazu+Misiones',
  wifiNetwork: 'ComplejoIguazu_Selva_5G',
  wifiPassword: 'IguazuDemo2026',
  poolHours: 'Piscina al aire libre habilitada todos los días de 09:00 a 20:30 hs',
  checkoutHour: '10:00 hs (Late check-out disponible según disponibilidad previa)',
  woodBagPrice: 'Bolsa de leña seca y carbón para parrilla: $5.000 ARS',
  specialAnnouncement: '🌿 ¡Bienvenidos a Complejo Iguazú! Guardá este link en tu celular: tenés la ruta de acceso desde el aeropuerto y terminal, clave de WiFi en 1 clic, excursiones a Cataratas y asistencia 24 hs.',
  transportation: [
    {
      id: 'trans-1',
      title: 'Cómo llegar en Auto Propio / GPS',
      type: 'car' as const,
      description: 'Tomar la Ruta Nacional 12 hasta el acceso a Puerto Iguazú y seguir las indicaciones hacia Ruta Ejemplo km 5. Cada cabaña cuenta con estacionamiento techado privado sin cargo.',
      actionLabel: 'Abrir GPS en Google Maps',
      actionUrl: 'https://maps.google.com/?q=Puerto+Iguazu+Misiones',
    },
    {
      id: 'trans-2',
      title: 'Transfer Aeropuerto Internacional Cataratas (IGR)',
      type: 'airport' as const,
      description: 'Ubicado a 18 km del complejo. Servicio de traslado privado o remís oficial coordinado previamente con chofer de confianza en recepción.',
      estimatedCost: 'Tarifa acordada ~$18.000 ARS',
      contactPhone: '+54 9 3757 55-0100',
      actionUrl: 'https://wa.me/5493757550100?text=Hola,%20quisiera%20coordinar%20el%20transfer%20desde%20el%20aeropuerto%20de%20Iguazú',
      actionLabel: 'Pedir Transfer Aeropuerto',
    },
    {
      id: 'trans-3',
      title: 'Desde la Terminal de Ómnibus de Puerto Iguazú',
      type: 'bus_station' as const,
      description: 'A 10 minutos del complejo. En la terminal podés tomar un taxi o remís local directo a Ruta Ejemplo km 5.',
      estimatedCost: 'Tarifa taxi local ~$6.000 ARS',
      actionLabel: 'Ver Ubicación en Mapa',
      actionUrl: 'https://maps.google.com/?q=Puerto+Iguazu+Misiones',
    },
  ],
  attractions: [
    {
      id: 'att-1',
      title: 'Parque Nacional Iguazú (Cataratas)',
      category: 'naturaleza' as const,
      description: 'Una de las 7 Maravillas Naturales del Mundo. Recorré el Circuito Superior, Circuito Inferior y la imponente Garganta del Diablo.',
      tips: 'Comprar la entrada con anticipación online en la web de Parques Nacionales. Recomendamos ir temprano a las 08:00 hs para evitar filas.',
      officialUrl: 'https://iguazuargentina.com',
      distanceMinutes: 15,
    },
    {
      id: 'att-2',
      title: 'Hito Tres Fronteras',
      category: 'ciudad' as const,
      description: 'Mirador panorámico emblemático donde confluyen los ríos Iguazú y Paraná, uniendo Argentina, Brasil y Paraguay.',
      tips: 'Hermoso paseo para el atardecer. Cada noche hay show de aguas danzantes y luces.',
      distanceMinutes: 10,
    },
    {
      id: 'att-3',
      title: 'Güirá Oga (Refugio de Animales Silvestres)',
      category: 'naturaleza' as const,
      description: 'Centro de rescate y rehabilitación de aves y fauna autóctona de la selva paranaense en un entorno natural protegido.',
      tips: 'Visita guiada muy educativa para hacer en familia y aprender sobre la conservación de la selva.',
      distanceMinutes: 5,
    },
    {
      id: 'att-4',
      title: 'La Aripuca',
      category: 'naturaleza' as const,
      description: 'Parque temático y monumento ecológico construido con árboles gigantes rescatados, dedicado a la concientización ambiental.',
      tips: 'Imperdible probar el helado artesanal de yerba mate y frutos del monte.',
      distanceMinutes: 6,
    },
  ],
  dining: [
    {
      id: 'din-1',
      name: 'Proveeduría & Desayunos del Complejo',
      specialty: 'En recepción disponemos de carbón, leña seca, agua mineral, café, té y chipitas calientes para el mate en tu cabaña.',
      priceRange: '$' as const,
      hasDelivery: false,
      address: 'Recepción del Complejo',
    },
    {
      id: 'din-2',
      name: 'Restaurante La Rueda (Cocina Regional)',
      specialty: 'Especialidad en pescados de río (surubí y pacú), pastas caseras y cortes a la parrilla en el centro de Puerto Iguazú.',
      priceRange: '$$' as const,
      hasDelivery: true,
      address: 'Av. Córdoba 28, Puerto Iguazú',
    },
    {
      id: 'din-3',
      name: 'El Quincho del Tío Querido',
      specialty: 'Parrilla tradicional argentina con carnes de primera calidad, shows folclóricos de arpa y música en vivo.',
      priceRange: '$$$' as const,
      hasDelivery: false,
      address: 'Av. Pres. Juan Domingo Perón, Puerto Iguazú',
    },
  ],
  rules: [
    {
      title: 'Piscina y Parque Verde',
      description: 'Habilitada todos los días de 09:00 a 20:30 hs. Ducha previa obligatoria. Por cuestiones de seguridad, no se permite ingresar con elementos de vidrio en el sector del solárium.',
    },
    {
      title: 'Sonidos de la Selva y Descanso',
      description: 'A partir de las 22:30 hs solicitamos mantener un volumen moderado para garantizar el descanso y el disfrute de la naturaleza para todas las cabañas.',
    },
    {
      title: 'Uso Seguro de Parrillas y Fogones',
      description: 'Utilizar únicamente los parrilleros asignados a cada cabaña. Por favor apagar las brasas con agua al finalizar para cuidar el predio boscoso.',
    },
  ],
  directBookingSettings: {
    customSlug: 'complejo-iguazu-demo',
    customDomain: 'complejoiguazu.com.ar',
    customDomainStatus: 'pending_dns',
    customDomainDnsTarget: 'cname.loomisuite.com',
    depositPercentage: 50,
    bankAlias: 'IGUAZU.CABANAS.DEMO',
    cbu: '0140999803400012345678',
    bankName: 'Banco de la Nación Argentina',
    accountHolder: 'Complejo Iguazú (Demo)',
    mercadoPagoLink: 'https://link.mercadopago.com.ar/complejoiguazudemo',
    paypalLink: 'https://paypal.me/complejoiguazudemo',
    directDiscountPercent: 10,
  },
};

export const INITIAL_ADDONS: AddonService[] = [
  {
    id: 'addon-transfer-in',
    name: 'Transfer Aeropuerto Cataratas IGR (Llegada)',
    category: 'transfers',
    price: 25,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Recepción personalizada en el aeropuerto de Iguazú con cartel y traslado directo a tu cabaña en vehículo con A/C.',
    iconName: 'Car',
  },
  {
    id: 'addon-transfer-out',
    name: 'Transfer a Aeropuerto Cataratas IGR (Salida)',
    category: 'transfers',
    price: 25,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Búsqueda puntual en la cabaña para llegar con tiempo a tu vuelo de regreso.',
    iconName: 'Car',
  },
  {
    id: 'addon-excursion-cataratas',
    name: 'Excursión Guiada Parque Nacional Iguazú',
    category: 'transfers',
    price: 40,
    unitLabel: 'por persona',
    description: 'Traslado ida y vuelta con guía profesional bilingüe por las pasarelas y miradores de Cataratas.',
    iconName: 'Navigation',
  },
  {
    id: 'addon-lena',
    name: 'Bolsa de Leña Seca & Carbón para Parrilla',
    category: 'frigobar',
    price: 5,
    unitLabel: 'por bolsa',
    description: 'Leña dura seleccionada y bolsa de carbón lista junto al parrillero de tu cabaña.',
    iconName: 'Flame',
  },
  {
    id: 'addon-desayuno-selva',
    name: 'Canasta de Desayuno Misionero de Campo',
    category: 'desayuno',
    price: 12,
    unitLabel: 'por persona / día',
    description: 'Chipitas caseras de almidón calientes, mermeladas de frutos de la selva, tostadas, café, leche y jugo natural.',
    iconName: 'Coffee',
  },
  {
    id: 'addon-latecheckout',
    name: 'Salida Extendida (Late Check-out hasta 17:00 hs)',
    category: 'servicios',
    price: 20,
    unitLabel: 'hasta las 17:00 hs',
    description: 'Aprovechá la piscina y el descanso de la tarde antes de tu vuelo o traslado nocturno.',
    iconName: 'Clock',
  },
  {
    id: 'addon-cleaning',
    name: 'Servicio de Mucama Extra & Recambio de Blancos',
    category: 'servicios',
    price: 18,
    unitLabel: 'por servicio',
    description: 'Limpieza integral de la cabaña con recambio completo de sábanas y toallones.',
    iconName: 'Sparkles',
  },
];

export const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'mov-1',
    date: getRelativeDate(-2),
    type: 'ingreso',
    amount: 5000,
    concept: 'Cobro Bolsa de Leña y Carbón - Cabaña Lapacho',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'cab-lapacho',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-2',
    date: getRelativeDate(-1),
    type: 'egreso',
    amount: 14500,
    concept: 'Compra de insumos de pileta (Cloro en pastillas y alguicida)',
    paymentMethod: 'efectivo',
    category: 'insumos',
    propertyId: 'cab-lapacho',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-3',
    date: getRelativeDate(-1),
    type: 'ingreso',
    amount: 20000,
    concept: 'Cobro Adicional Late Check-out en Efectivo - Cabaña Timbó',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'cab-timbo',
    userRole: 'frontdesk',
  },
  {
    id: 'mov-4',
    date: getRelativeDate(0),
    type: 'egreso',
    amount: 25000,
    concept: 'Mantenimiento de parque y poda de senderos selva',
    paymentMethod: 'transferencia',
    category: 'mantenimiento',
    propertyId: 'cab-guatambu',
    userRole: 'admin',
  },
  {
    id: 'mov-5',
    date: getRelativeDate(0),
    type: 'ingreso',
    amount: 12000,
    concept: 'Cobro de Desayuno Misionero extra en efectivo',
    paymentMethod: 'efectivo',
    category: 'caja_chica',
    propertyId: 'cab-lapacho',
    userRole: 'frontdesk',
  },
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

/**
 * Empty state for real app mode (no sample data loaded)
 */
export function getEmptyAppState(): DemoState {
  return {
    properties: [],
    reservations: [],
    cleaningTasks: [],
    templates: [],
    availableAddons: [],
    addons: [],
    cashMovements: [],
    welcomeGuide: {
      propertyName: 'Mi Complejo',
      tagline: 'Cabañas & Alojamiento',
      hostName: 'Administración',
      hostPhone: '',
      locationAddress: '',
      googleMapsUrl: '',
      wifiNetwork: '',
      wifiPassword: '',
      poolHours: '',
      checkoutHour: '10:00 hs',
      woodBagPrice: '',
      specialAnnouncement: '¡Bienvenidos a nuestro complejo! Gestioná tus reservas y servicios desde aquí.',
      transportation: [],
      attractions: [],
      dining: [],
      rules: [],
      directBookingSettings: {
        customSlug: 'mi-complejo',
        depositPercentage: 30,
        bankAlias: '',
        cbu: '',
        bankName: '',
        accountHolder: '',
        directDiscountPercent: 10,
      },
    },
    lastUpdated: new Date().toISOString(),
  };
}
