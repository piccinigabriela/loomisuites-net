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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Cabaña 1',
    type: 'Cabaña de Madera en la Selva (hasta 4 pax)',
    address: 'Calle Los Bananos y Palmeras s/n',
    neighborhood: 'Selva Yriapú / Granjas',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 4,
    basePrice: 65,
    cleaningFee: 15,
    imageUrl: '/cabanas/cabana-terraza.jpg',
    rating: 4.96,
    reviewsCount: 84,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Llave Digital / Teclado' },
    wifiNetwork: 'LosBananos_Huespedes_5G',
    wifiPassword: 'CataratasSelva2026',
  },
  {
    id: 'prop-2',
    name: 'Cabaña 2',
    type: 'Cabaña Familiar con Fogón y Galería (hasta 5 pax)',
    address: 'Calle Los Bananos y Palmeras s/n',
    neighborhood: 'Selva Yriapú / Granjas',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 5,
    basePrice: 85,
    cleaningFee: 20,
    imageUrl: '/cabanas/deck-hamaca.jpg',
    rating: 4.98,
    reviewsCount: 96,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Teclado Digital' },
    wifiNetwork: 'LosBananos_Huespedes_5G',
    wifiPassword: 'CataratasSelva2026',
  },
  {
    id: 'prop-3',
    name: 'Cabaña 3',
    type: 'Cabaña Estudio Parejas con Hamaca en Deck',
    address: 'Calle Los Bananos y Palmeras s/n',
    neighborhood: 'Selva Yriapú / Granjas',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 55,
    cleaningFee: 15,
    imageUrl: '/cabanas/cabana-hamaca.jpg',
    rating: 4.95,
    reviewsCount: 62,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: false, brand: 'Llave física tradicional (Sin cerradura digital)' },
    wifiNetwork: 'LosBananos_Huespedes_5G',
    wifiPassword: 'CataratasSelva2026',
  },
  {
    id: 'prop-6',
    name: 'Cabaña 6',
    type: 'Cabaña Suite de Troncos con Galería de Palmeras',
    address: 'Calle Los Bananos y Palmeras s/n',
    neighborhood: 'Selva Yriapú / Granjas',
    city: 'Puerto Iguazú, Misiones',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    basePrice: 70,
    cleaningFee: 15,
    imageUrl: '/cabanas/jardin-heliconia.jpg',
    rating: 4.97,
    reviewsCount: 71,
    status: 'active',
    syncStatus: { airbnb: true, booking: true, vrbo: false },
    smartLock: { enabled: true, brand: 'Cerradura Teclado Digital' },
    wifiNetwork: 'LosBananos_Huespedes_5G',
    wifiPassword: 'CataratasSelva2026',
  },
];

export function generateInitialReservations(): Reservation[] {
  return [
    {
      id: 'res-101',
      propertyId: 'prop-1',
      guestName: 'Lucas Fernández',
      guestEmail: 'lucas.fernandez@gmail.com',
      guestPhone: '+54 9 11 4512-8890',
      guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(0), // Check-in TODAY!
      checkOut: getRelativeDate(3),
      nights: 3,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 245,
      cleaningFee: 15,
      commissionPaid: 6.9, // Airbnb 3% modalidad tradicional para anfitrión
      netRevenue: 238.1,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '4821#',
      specialNotes: 'Modalidad Airbnb 3% anfitrión tradicional. Llega en vuelo a las 14:00.',
      createdAt: getRelativeDate(-5),
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
      propertyId: 'prop-2',
      guestName: 'Claire Dupont',
      guestEmail: 'claire.dupont@paris.fr',
      guestPhone: '+33 6 12 34 56 78',
      guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(-2),
      checkOut: getRelativeDate(1), // Check-out TOMORROW
      nights: 3,
      guestsCount: 1,
      platform: 'booking',
      totalAmount: 246,
      cleaningFee: 30,
      commissionPaid: 36.9,
      netRevenue: 209.1,
      status: 'checked_in',
      paymentStatus: 'paid',
      pinCode: '0310#',
      specialNotes: 'Viaje por negocios. Requiere factura A / Invoice comercial.',
      createdAt: getRelativeDate(-12),
    },
    {
      id: 'res-103',
      propertyId: 'prop-3',
      guestName: 'Martín Soria & Familia',
      guestEmail: 'martin.soria@techco.com',
      guestPhone: '+54 9 11 6789-2234',
      guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(1),
      checkOut: getRelativeDate(5),
      nights: 4,
      guestsCount: 4,
      platform: 'direct', // Direct booking! (0% commission)
      totalAmount: 565,
      cleaningFee: 45,
      commissionPaid: 0,
      netRevenue: 565,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '2140#',
      specialNotes: 'Reserva directa por link web de Loomi Suite. Ahorró comisiones de Airbnb.',
      createdAt: getRelativeDate(-3),
    },
    {
      id: 'res-104',
      propertyId: 'prop-6',
      guestName: 'Elena Rostova & John Miller',
      guestEmail: 'emiller@nytravel.org',
      guestPhone: '+1 212 555 0199',
      guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(-4),
      checkOut: getRelativeDate(0), // Check-out TODAY!
      nights: 4,
      guestsCount: 3,
      platform: 'vrbo',
      totalAmount: 280,
      cleaningFee: 20,
      commissionPaid: 33.6,
      netRevenue: 246.4,
      status: 'checked_in',
      paymentStatus: 'paid',
      pinCode: '1420#',
      specialNotes: 'Late check-out solicitado a las 12:00 hs.',
      createdAt: getRelativeDate(-20),
    },
    {
      id: 'res-105',
      propertyId: 'prop-1',
      guestName: 'Santiago Morales',
      guestEmail: 'santi.morales@outlook.com',
      guestPhone: '+54 9 351 223-9911',
      guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(3), // Recambio en Cabaña 1 (Lucas sale día +3, Santiago entra día +3)
      checkOut: getRelativeDate(7),
      nights: 4,
      guestsCount: 2,
      platform: 'airbnb',
      totalAmount: 290,
      cleaningFee: 35,
      commissionPaid: 8.7, // Airbnb 3% anfitrión tradicional ($290 * 0.03)
      netRevenue: 281.3,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '9082#',
      specialNotes: 'Modalidad Airbnb 3% tradicional. Viene por festival de música en la ciudad.',
      createdAt: getRelativeDate(-2),
      airbnbFeeMode: 'traditional_3',
    },
    {
      id: 'res-106',
      propertyId: 'prop-2',
      guestName: 'Valeria Benítez',
      guestEmail: 'valeria.benitez@empresa.com',
      guestPhone: '+598 99 876 543',
      guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(1), // Recambio en Cabaña 2 (Claire sale mañana día +1, Valeria entra mañana día +1)
      checkOut: getRelativeDate(5),
      nights: 4,
      guestsCount: 2,
      platform: 'direct',
      totalAmount: 340,
      cleaningFee: 30,
      commissionPaid: 0,
      netRevenue: 340,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '5541#',
      specialNotes: 'Cliente recurrente. Reservó por la web propia sin pagar comisiones.',
      createdAt: getRelativeDate(-1),
    },
    {
      id: 'res-107',
      propertyId: 'prop-6',
      guestName: 'Agustín Gómez',
      guestEmail: 'agustin.gomez@gmail.com',
      guestPhone: '+54 9 223 543-2211',
      guestAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      checkIn: getRelativeDate(0), // Recambio HOY en Cabaña 6 (Elena sale hoy día 0 a las 11:30, Agustín entra a las 14:00)
      checkOut: getRelativeDate(4),
      nights: 4,
      guestsCount: 3,
      platform: 'booking',
      totalAmount: 280,
      cleaningFee: 20,
      commissionPaid: 42,
      netRevenue: 238,
      status: 'confirmed',
      paymentStatus: 'paid',
      pinCode: '7732#',
      specialNotes: 'Visita a Cataratas en pareja. Llega a las 14:30 hs.',
      createdAt: getRelativeDate(-4),
    },
  ];
}

export function generateInitialCleaningTasks(): CleaningTask[] {
  return [
    {
      id: 'clean-1',
      propertyId: 'prop-6',
      reservationId: 'res-104',
      date: getRelativeDate(0), // Today!
      scheduledTime: '11:00 - 13:45 (Urgente - Recambio)',
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
      notes: '⚡ RECAMBIO MISMO DÍA: Sale Elena Rostova 10:30hs y entra Agustín Gómez 14:00hs. Prioridad alta.',
      photosUploaded: 2,
    },
    {
      id: 'clean-2',
      propertyId: 'prop-1',
      date: getRelativeDate(3),
      scheduledTime: '11:00 - 13:30 (Recambio)',
      cleanerName: 'Carlos Ruiz',
      cleanerPhone: '+54 9 11 2233-4455',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Cambio de blancos 400 hilos y aromatización', completed: false },
        { id: 'c2', task: 'Limpieza de terraza y parrilla', completed: false },
        { id: 'c3', task: 'Reposición de cápsulas Nespresso (x4)', completed: false },
        { id: 'c4', task: 'Control de inventario de copas de vino', completed: false },
      ],
      notes: '⚡ RECAMBIO: Sale Lucas Fernández y entra Santiago Morales el mismo día.',
    },
    {
      id: 'clean-3',
      propertyId: 'prop-2',
      reservationId: 'res-102',
      date: getRelativeDate(1), // Tomorrow
      scheduledTime: '11:00 - 13:30 (Recambio)',
      cleanerName: 'Ana Méndez',
      cleanerPhone: '+54 9 11 9988-7766',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Lavado y tendido de ropa blanca', completed: false },
        { id: 'c2', task: 'Aspirado de alfombras y pisos de parquet', completed: false },
        { id: 'c3', task: 'Comprobación de control remoto de A/C y TV', completed: false },
      ],
      notes: '⚡ RECAMBIO: Sale Claire Dupont y entra Valeria Benítez.',
    },
    {
      id: 'clean-4',
      propertyId: 'prop-3',
      date: getRelativeDate(-1),
      scheduledTime: '12:00 - 14:30',
      cleanerName: 'Marta González',
      cleanerPhone: '+54 9 11 5566-7788',
      status: 'inspected',
      checklist: [
        { id: 'c1', task: 'Desinfección integral y sanitización', completed: true },
        { id: 'c2', task: 'Limpieza de cristales de balcón', completed: true },
        { id: 'c3', task: 'Set de toallas de baño y mano dobladas en cisne', completed: true },
        { id: 'c4', task: 'Inspección de daños aprobada', completed: true },
      ],
      notes: 'Todo en perfecto estado. Fotos de entrega registradas en la app.',
      photosUploaded: 4,
    },
  ];
}

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Confirmación y Bienvenida Anticipada',
    triggerEvent: 'Al confirmarse la reserva',
    channel: 'whatsapp',
    content: '¡Hola {nombre_huesped}! 👋 Gracias por reservar en {nombre_propiedad}. Soy tu anfitrión y estamos felices de recibirte desde el {fecha_llegada} hasta el {fecha_salida}.\n\nPara que tu llegada sea impecable y conozcas cómo llegar y moverte por la zona, te dejamos la guía digital: https://loomisuite.com/guia/{propiedad_id}\n\n¡Cualquier duda nos avisas por aquí!',
    variables: ['{nombre_huesped}', '{nombre_propiedad}', '{fecha_llegada}', '{fecha_salida}'],
  },
  {
    id: 'tpl-2',
    title: 'Instrucciones de Auto Check-in y Código de Puerta',
    triggerEvent: 'Mañana del Check-in (09:00 AM)',
    channel: 'whatsapp',
    content: '¡Buenos días {nombre_huesped}! ☀️ Tu alojamiento ya está listo para tu llegada a partir de las 14:00 hs.\n\n🔑 Datos de Acceso Digital:\n- Dirección: {direccion_propiedad}\n- Código de Cerradura Inteligente: {codigo_cerradura}\n- Red Wi-Fi: {nombre_wifi}\n- Clave Wi-Fi: {clave_wifi}\n\nPor favor avísanos apenas hayas ingresado. ¡Que disfrutes mucho de tu estancia!',
    variables: ['{nombre_huesped}', '{direccion_propiedad}', '{codigo_cerradura}', '{nombre_wifi}', '{clave_wifi}'],
  },
  {
    id: 'tpl-3',
    title: 'Recordatorio de Check-out Amable',
    triggerEvent: 'Noche anterior al Check-out (20:00 hs)',
    channel: 'whatsapp',
    content: 'Hola {nombre_huesped}, esperamos que hayas tenido una estancia maravillosa en {nombre_propiedad}. ✨\n\nTe recordamos que el check-out es mañana a las 11:00 hs para permitir la limpieza y preparación del lugar.\n\nSolo te pedimos:\n1. Apagar luces y aire acondicionado / calefacción.\n2. Dejar las llaves o cerrar bien la puerta con cerradura electrónica.\n3. Dejar los residuos en el cesto correspondiente.\n\n¡Buen viaje de regreso y esperamos recibirte pronto!',
    variables: ['{nombre_huesped}', '{nombre_propiedad}'],
  },
  {
    id: 'tpl-4',
    title: 'Solicitud de Reseña 5 Estrellas y Descuento Directo',
    triggerEvent: '2 horas después del Check-out',
    channel: 'whatsapp',
    content: '¡Muchas gracias por cuidar {nombre_propiedad} con tanto cariño, {nombre_huesped}! 🌟\n\nSi te gustó la experiencia, nos ayudarías un montón dejándonos una reseña de 5 estrellas en la plataforma.\n\nY para tu próxima escapada o viaje, puedes reservar directo con nosotros sin pagar comisiones extra: https://loomisuite.com/directo/{propiedad_id}\n\n¡Hasta la próxima!',
    variables: ['{nombre_huesped}', '{nombre_propiedad}', '{propiedad_id}'],
  },
];

const LOCAL_STORAGE_KEY = 'loomisuite_demo_state_v5';

export const INITIAL_WELCOME_GUIDE: WelcomeGuideData = {
  propertyName: 'Los Bananos - Wood Cabin Iguazú',
  tagline: 'Cabañas de Madera en la Selva Misionera • Puerto Iguazú, Argentina',
  hostName: 'Fernando',
  hostPhone: '+54 9 3757 52-1980',
  locationAddress: 'Calle Los Bananos y Palmeras s/n, Selva Yriapú / Zona Granjas, Puerto Iguazú',
  googleMapsUrl: 'https://maps.google.com/?q=Wood+Cabin+Iguazu+Puerto+Iguazu',
  wifiNetwork: 'LosBananos_Huespedes_5G',
  wifiPassword: 'CataratasSelva2026',
  poolHours: '09:00 a 22:00 hs (Toallones de pileta provistos en placard)',
  checkoutHour: '10:00 hs (Late check-out consultar con Fernando)',
  woodBagPrice: '$4.000 ARS / $4 USD',
  specialAnnouncement: '🌿 ¡Bienvenidos a Los Bananos! Guardá este link en tu celular: tenés el GPS exacto, clave de WiFi, colectivos y recomendaciones locales para no hacer cola en Cataratas.',
  transportation: [
    {
      id: 'trans-1',
      title: 'Desde el Aeropuerto Internacional Iguazú (IGR)',
      type: 'airport' as const,
      description: 'A 20 minutos de las cabañas. Recomendamos coordinar con nuestro remís de confianza (Don Carlos) con tarifa fija pactada, o tomar el transfer oficial Four Tourist.',
      estimatedCost: 'Tarifa pactada ~$18.000 ARS / $18 USD',
      contactPhone: '+54 9 3757 44-3322',
      actionUrl: 'https://wa.me/5493757443322?text=Hola%20Carlos,%20soy%20huésped%20de%20Fernando%20en%20Wood%20Cabin%20Los%20Bananos',
      actionLabel: 'Pedir Remís de Confianza',
    },
    {
      id: 'trans-2',
      title: 'Desde la Terminal de Ómnibus Puerto Iguazú',
      type: 'bus_station' as const,
      description: 'A solo 8 minutos. Puedes tomar un taxi oficial en la dársena de salida o el colectivo urbano con parada a 200m del predio.',
      estimatedCost: 'Taxi terminal ~$4.500 ARS',
      actionLabel: 'Ver Terminal en Maps',
      actionUrl: 'https://maps.google.com/?q=Terminal+de+Omnibus+Puerto+Iguazu',
    },
    {
      id: 'trans-3',
      title: 'Cómo llegar en Auto Propio / GPS',
      type: 'car' as const,
      description: 'Desde Av. Victoria Aguirre doblar en calle Los Bananos. Camino de tosca consolidado transitable todo el año. Estacionamiento techado gratuito.',
      actionLabel: 'Abrir GPS en Google Maps',
      actionUrl: 'https://maps.google.com/?q=Wood+Cabin+Iguazu+Puerto+Iguazu',
    },
    {
      id: 'trans-4',
      title: 'Colectivos al Parque Nacional Cataratas',
      type: 'remis' as const,
      description: 'La empresa Río Uruguay sale cada 20 minutos desde la terminal y pasa por Av. Victoria Aguirre. Te deja en el portal de acceso del Parque Nacional.',
      estimatedCost: 'Boleto ida y vuelta con tarjeta SUBE o efectivo',
      actionLabel: 'Horarios de Colectivos',
      actionUrl: 'https://maps.google.com/?q=Parque+Nacional+Iguazu',
    },
  ],
  attractions: [
    {
      id: 'att-1',
      title: 'Cataratas del Iguazú (Lado Argentino)',
      category: 'cataratas' as const,
      description: 'Una de las 7 Maravillas Naturales del Mundo. Incluye Garganta del Diablo, Circuito Superior e Inferior y Tren Ecológico de la Selva.',
      tips: '⚠️ IMPORTANTE: Comprar la entrada con anticipación en la web oficial de Parques Nacionales para evitar 45 min de cola. Llegar a las 08:00 hs para evitar calor y hacer Garganta del Diablo primero.',
      ticketPrice: 'Tarifas según residencia en web oficial',
      officialUrl: 'https://iguazuargentina.com',
      distanceMinutes: 20,
    },
    {
      id: 'att-2',
      title: 'Cataratas del Iguazú (Lado Brasileño - Foz)',
      category: 'cataratas' as const,
      description: 'Vista panorámica frontal imponente de todos los saltos. Excelente para fotos y panorámica completa del cañón.',
      tips: 'Llevar DNI físico o Pasaporte de todos los integrantes (menores con partida) para el trámite de aduana internacional.',
      ticketPrice: 'Ingresso Cataratas Brasil',
      officialUrl: 'https://cataratasdoiguacu.com.br',
      distanceMinutes: 25,
    },
    {
      id: 'att-3',
      title: 'Parque das Aves (Foz do Iguaçu)',
      category: 'naturaleza' as const,
      description: 'Santuario de rescate de aves de la selva atlántica. Viveros gigantes de inmersión donde caminas rodeado de tucanes, guacamayos y mariposas.',
      tips: 'Ubicado justo al lado del acceso a Cataratas de Brasil; ideal para combinar ambas visitas en el mismo día.',
      ticketPrice: 'Entrada en boletería o web',
      officialUrl: 'https://parquedasaves.com.br',
      distanceMinutes: 25,
    },
    {
      id: 'att-4',
      title: 'Hito Tres Fronteras (Puerto Iguazú)',
      category: 'ciudad' as const,
      description: 'Confluencia de los ríos Iguazú y Paraná uniendo Argentina, Brasil y Paraguay. Feria de artesanos y show de aguas danzantes con luces.',
      tips: 'El show de luces y música es gratuito todos los días a las 20:00 hs. Excelente lugar para el atardecer.',
      distanceMinutes: 10,
    },
    {
      id: 'att-5',
      title: 'Güirá Oga (Centro de Rescate de Selva)',
      category: 'naturaleza' as const,
      description: 'Refugio y hospital de animales autóctonos misioneros rescatados del tráfico o heridos. Recorrido educativo en carretón por la selva.',
      tips: 'Visita guiada muy recomendada para familias.',
      distanceMinutes: 7,
    },
    {
      id: 'att-6',
      title: 'La Aripuca',
      category: 'ciudad' as const,
      description: 'Construcción gigante con troncos rescatados de árboles centenarios. Degustación de helados artesanales de yerba mate y flor de pétalo.',
      tips: 'Ideal para probar el helado de yerba mate y comprar recuerdos mbyá.',
      distanceMinutes: 6,
    },
  ],
  dining: [
    {
      id: 'din-1',
      name: 'El Quincho del Tío Querido',
      specialty: 'Carnes a las brasas, bife de chorizo, surubí grillado y shows de tango y folclore.',
      priceRange: '$$$' as const,
      hasDelivery: false,
      address: 'Av. Pres. Juan Domingo Perón s/n',
      phone: '+54 3757 42-0151',
    },
    {
      id: 'din-2',
      name: 'Aqva Restaurant',
      specialty: 'Alta cocina regional de río: pacú, dorado, pastas caseras y excelente cava de vinos.',
      priceRange: '$$$' as const,
      hasDelivery: false,
      address: 'Córdoba y Carlos Thays',
      phone: '+54 3757 42-2090',
    },
    {
      id: 'din-3',
      name: 'Pizzería & Empanadas La Selva (Delivery a Cabaña)',
      specialty: 'Empanadas misioneras cortadas a cuchillo y pizzas al molde. Entrega rápida en la tranquera de Wood Cabin.',
      priceRange: '$' as const,
      hasDelivery: true,
      address: 'Av. Victoria Aguirre 450',
      phone: '+54 9 3757 60-1122',
    },
    {
      id: 'din-4',
      name: 'Supermercado & Vinoteca Don Pedro',
      specialty: 'A 400m de las cabañas. Carnicería para el asado, carbón, leña, bebidas frías, pan fresco y productos de almacén.',
      priceRange: '$$' as const,
      hasDelivery: false,
      address: 'Calle Los Cedros 120',
    },
  ],
  rules: [
    {
      title: 'Piscina & Parque Tropical',
      description: 'Horario habilitado de 09:00 a 22:00 hs. Ducha previa obligatoria. Prohibido ingresar con vasos o botellas de vidrio al solárium.',
    },
    {
      title: 'Parrilla & Fuego Seguro',
      description: 'El fuego debe realizarse exclusivamente dentro del fogón de la parrilla de la cabaña. Nunca dejar fuego encendido al retirarse o ir a dormir; apagar las brasas con agua.',
    },
    {
      title: 'Silencio y Reserva Natural',
      description: 'El complejo está inmerso en la selva. A partir de las 23:00 hs solicitamos mantener un volumen moderado para disfrutar el sonido de las aves y la tranquilidad.',
    },
    {
      title: 'Climatización Consciente',
      description: 'Por favor mantener puertas y ventanas cerradas mientras el aire acondicionado esté funcionando. Ayúdanos a cuidar la energía.',
    },
  ],
  directBookingSettings: {
    customSlug: 'wood-cabin-iguazu',
    customDomain: 'woodcabiniguazu.com.ar',
    customDomainStatus: 'active',
    customDomainDnsTarget: 'cname.loomisuite.com',
    depositPercentage: 50,
    bankAlias: 'CABANAS.WOOD.FER',
    cbu: '0140999803400012345678',
    bankName: 'Banco Galicia',
    accountHolder: 'Fernando Los Bananos',
    directDiscountPercent: 15,
  },
};

export const INITIAL_ADDONS: AddonService[] = [
  {
    id: 'addon-transfer-in',
    name: 'Transfer Aeropuerto IGR (Llegada)',
    category: 'transfers',
    price: 25,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Recepción personalizada en arribos con cartel y traslado directo a las cabañas en auto con A/C.',
    iconName: 'Car',
  },
  {
    id: 'addon-transfer-out',
    name: 'Transfer a Aeropuerto IGR (Salida)',
    category: 'transfers',
    price: 25,
    unitLabel: 'por viaje (hasta 4 pax)',
    description: 'Búsqueda puntual en la cabaña para llegar con tiempo al vuelo.',
    iconName: 'Car',
  },
  {
    id: 'addon-transfer-cataratas',
    name: 'Transfer Ida y Vuelta Parque Nacional Cataratas',
    category: 'transfers',
    price: 35,
    unitLabel: 'por viaje I/V',
    description: 'Traslado privado directo al Parque Nacional Iguazú (lado argentino) y regreso coordinado.',
    iconName: 'Navigation',
  },
  {
    id: 'addon-frigobar-vino',
    name: 'Vino Malbec Reserva + Copa de Bienvenida',
    category: 'frigobar',
    price: 18,
    unitLabel: 'por botella',
    description: 'Etiqueta seleccionada mendocina lista y atemperada en la cabaña.',
    iconName: 'Wine',
  },
  {
    id: 'addon-frigobar-cerveza',
    name: 'Pack Cervezas Artesanales Locales (4 un.)',
    category: 'frigobar',
    price: 12,
    unitLabel: 'pack de 4',
    description: 'Cervezas misioneras artesanales frías esperándote en la heladera.',
    iconName: 'Beer',
  },
  {
    id: 'addon-lena',
    name: 'Bolsa de Leña Seca de Espinillo + Iniciador',
    category: 'frigobar',
    price: 8,
    unitLabel: 'por bolsa 10kg',
    description: 'Leña de alta brasa para el fogón/parrilla exterior con astillas secas e iniciador ecológico.',
    iconName: 'Flame',
  },
  {
    id: 'addon-desayuno-selva',
    name: 'Canasta de Desayuno Misionero',
    category: 'desayuno',
    price: 14,
    unitLabel: 'por persona / día',
    description: 'Chipitas calientes, mermeladas de frutas nativas, medialunas, frutas tropicales, café y jugo fresco.',
    iconName: 'Coffee',
  },
  {
    id: 'addon-spa-masaje',
    name: 'Masaje Relajante Descontracturante en Deck Selva',
    category: 'spa',
    price: 40,
    unitLabel: 'sesión de 60 min',
    description: 'Masoterapeuta profesional en la privacidad de tu cabaña o deck con aceites esenciales botánicos.',
    iconName: 'Sparkles',
  },
  {
    id: 'addon-spa-hidro',
    name: 'Kit Sales Aromáticas & Espuma Relajante para Jacuzzi',
    category: 'spa',
    price: 15,
    unitLabel: 'kit spa',
    description: 'Sales minerales de lavanda y eucalipto para una inmersión reparadora.',
    iconName: 'Droplets',
  },
];

export const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'mov-1',
    date: getRelativeDate(-2),
    type: 'ingreso',
    amount: 15000,
    concept: 'Venta de 3 bolsas de leña - Cabaña Vista Lago',
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
    concept: 'Servicio técnico cerrajero por reparación picaporte cabaña 3',
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
    concept: 'Cobro de Desayuno Canasta extra en efectivo',
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
      // Ensure availableAddons and addons are set
      if (!parsed.availableAddons || parsed.availableAddons.length === 0) {
        parsed.availableAddons = INITIAL_ADDONS;
      }
      if (!parsed.addons || parsed.addons.length === 0) {
        parsed.addons = parsed.availableAddons || INITIAL_ADDONS;
      }
      if (!parsed.cashMovements || parsed.cashMovements.length === 0) {
        parsed.cashMovements = INITIAL_CASH_MOVEMENTS;
      }
      // Ensure property 3 smartLock matches updated status
      const p3 = parsed.properties?.find((p: Property) => p.id === 'prop-3');
      if (p3 && p3.smartLock?.brand?.includes('Recepción')) {
        p3.smartLock.enabled = false;
        p3.smartLock.brand = 'Llave física tradicional (Sin cerradura digital)';
      }
      saveDemoState(parsed);
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

  saveDemoState(defaultState);
  return defaultState;
}

export function saveDemoState(state: DemoState): void {
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
