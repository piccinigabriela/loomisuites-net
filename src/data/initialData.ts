import { DemoState, Property, Reservation, CleaningTask, MessageTemplate, WelcomeGuideData, AddonService, CashMovement } from '../types';
import { saveComplexToCloud } from '../lib/firebase';
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'cat-a',
    name: 'Departamento A',
    type: '2 Ambientes con Cocina Completa (hasta 3 pax)',
    address: 'Tres Sargentos 435',
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
    wifiPassword: 'TresSargentos435',
  },
  {
    id: 'cat-b',
    name: 'Departamento B',
    type: 'Estudio de Diseño con Sommier Matrimonial (2 pax)',
    address: 'Tres Sargentos 435',
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
    wifiPassword: 'TresSargentos435',
  },
  {
    id: 'cat-c',
    name: 'Departamento C',
    type: '2 Ambientes con 2 Camas Sommier Individuales (hasta 3 pax)',
    address: 'Tres Sargentos 435',
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
    wifiPassword: 'TresSargentos435',
  },
  {
    id: 'cat-d',
    name: 'Departamento D',
    type: 'Estudio con 2 Camas Sommier Individuales (2 pax)',
    address: 'Tres Sargentos 435',
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
    wifiPassword: 'TresSargentos435',
  },
];

export function generateInitialReservations(): Reservation[] {
  return [...IMPORTED_CATALINAS_RESERVATIONS];
}

function _unusedOldReservations(): Reservation[] {
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
      checkIn: getRelativeDate(3), // Recambio en Depto 101 (Lucas sale día +3, Santiago entra día +3)
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
      checkIn: getRelativeDate(1), // Recambio en Depto 102 (Claire sale mañana día +1, Valeria entra mañana día +1)
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
      checkIn: getRelativeDate(0), // Recambio HOY en Depto 201 (Elena sale hoy día 0 a las 11:30, Agustín entra a las 14:00)
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
      specialNotes: 'Visita de turismo cultural en la ciudad en pareja. Llega a las 14:30 hs.',
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
  propertyName: 'Tu Complejo',
  tagline: 'Guía Digital de Bienvenida Interactiva • Buenos Aires, Argentina',
  hostName: 'Gabriela',
  hostPhone: '+54 9 11 4050-6070',
  locationAddress: 'Av. de Mayo 100, San Telmo / Monserrat, Buenos Aires',
  googleMapsUrl: 'https://maps.google.com/?q=Plaza+de+Mayo+Buenos+Aires',
  wifiNetwork: 'TuComplejo_Huespedes_5G',
  wifiPassword: 'ComplejoDemo2026',
  poolHours: '08:00 a 21:00 hs (Toallones provistos en el vestidor de terraza)',
  checkoutHour: '11:00 hs (Late check-out consultar previamente)',
  woodBagPrice: 'Servicio de Mucama Extra: $15.000 ARS',
  specialAnnouncement: '🏙️ ¡Bienvenidos a Tu Complejo! Guardá este link en tu celular: tenés la ubicación exacta, clave de WiFi en 1 clic, atracciones locales y todo para disfrutar tu estadía.',
  transportation: [
    {
      id: 'trans-1',
      title: 'Traslado Privado (Remís de Confianza)',
      type: 'airport' as const,
      description: 'Servicio de traslado privado puerta a puerta desde Aeroparque, Ezeiza o Terminal de Ómnibus, coordinado previamente con chofer profesional.',
      estimatedCost: 'Tarifa pactada ~$12.000 ARS',
      contactPhone: '+54 9 11 4050-6070',
      actionUrl: 'https://wa.me/5491140506070?text=Hola%20Gabriela,%20soy%20huésped%20de%20Tu%20Complejo%20y%20quisiera%20coordinar%20el%20traslado',
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
      // Ensure properties are Depto A, B, C, D
      const hasOldProps = !parsed.properties || parsed.properties.some((p: Property) => p.id === 'prop-1' || p.id === 'prop-2');
      if (hasOldProps || parsed.properties.length === 0) {
        parsed.properties = INITIAL_PROPERTIES;
      }
      // Ensure reservations have all real imported reservations from her CSV
      const hasOldRes = !parsed.reservations || parsed.reservations.length < 20 || parsed.reservations.some((r: any) => r.propertyId === 'prop-1');
      if (hasOldRes) {
        parsed.reservations = IMPORTED_CATALINAS_RESERVATIONS;
      }
      // Force update welcomeGuide to the new Tu Complejo setup to avoid any Iguazú mix
      if (!parsed.welcomeGuide || parsed.welcomeGuide.propertyName !== 'Tu Complejo') {
        parsed.welcomeGuide = INITIAL_WELCOME_GUIDE;
      }
      // Ensure availableAddons and addons are updated to the Buenos Aires versions
      const hasOldAddons = parsed.availableAddons?.some((a: any) => a.name?.includes('IGR') || a.name?.includes('Cataratas') || a.name?.includes('Selva') || a.name?.includes('Misionero'));
      if (!parsed.availableAddons || parsed.availableAddons.length === 0 || hasOldAddons) {
        parsed.availableAddons = INITIAL_ADDONS;
        parsed.addons = INITIAL_ADDONS;
      }
      if (!parsed.addons || parsed.addons.length === 0) {
        parsed.addons = parsed.availableAddons || INITIAL_ADDONS;
      }
      const hasOldCash = parsed.cashMovements?.some((m: any) => m.concept?.includes('leña') || m.concept?.includes('cabaña') || m.concept?.includes('Canasta'));
      if (!parsed.cashMovements || parsed.cashMovements.length === 0 || hasOldCash) {
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

export function saveDemoState(state: DemoState, complexId?: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving demo state to localStorage', e);
  }

  // Also persist to Firebase Cloud Firestore for multi-device & multi-user sync
  try {
    const activeId = complexId || (typeof localStorage !== 'undefined' ? localStorage.getItem('loomi_active_complex') || 'default' : 'default');
    saveComplexToCloud(activeId, state);
  } catch (e) {
    console.warn('Firestore cloud background sync notice:', e);
  }

  // Also persist to server in background for multi-device sync
  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      }).catch((err) => {
        console.warn('Silent server state sync notice:', err);
      });
    }
  } catch {}
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
