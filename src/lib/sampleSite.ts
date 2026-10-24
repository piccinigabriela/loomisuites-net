/**
 * Complejo de ejemplo para el muestrario de diseños (loomisuite.net/disenos).
 * "Corte delle Vette" es inventado: no existe. Fotos en public/muestra/.
 */
import type { PublicSiteDoc, PublicSitePhoto } from './publicSite';
import { expPhotoKey } from './publicSite';

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function sampleSite(theme: string): PublicSiteDoc {
  return {
    enabled: true,
    name: 'Corte delle Vette',
    tagline: 'Bodega boutique y suites al pie de los Andes',
    description:
      'Seis suites entre viñedos, con vista al cordón del Plata. Desayuno con productos de la finca, pileta frente a las montañas y degustación en la cava al atardecer.',
    city: 'Luján de Cuyo, Mendoza',
    address: 'Ruta 15 km 32',
    mapsUrl: 'https://maps.google.com/?q=Luj%C3%A1n+de+Cuyo',
    whatsapp: '5492610000000',
    checkinHour: '14:00',
    checkoutHour: '11:00',
    currency: 'ARS',
    theme: theme as PublicSiteDoc['theme'],
    units: [
      { id: 'u1', name: 'Suite Malbec', maxGuests: 2, bedrooms: 1, bathrooms: 1, description: 'Cama king, salamandra y deck propio con piscina de inmersión mirando a la cordillera.', basePrice: 185000 },
      { id: 'u2', name: 'Suite Torrontés', maxGuests: 3, bedrooms: 1, bathrooms: 1, description: 'Dos camas, galería hacia los viñedos y luz de la mañana.', basePrice: 150000 },
      { id: 'u3', name: 'Casa de la Finca', maxGuests: 6, bedrooms: 3, bathrooms: 2, description: 'Para familias o amigos: tres dormitorios, cocina completa y parrilla.', basePrice: 320000 },
    ],
    pricing: null,
    busy: { u2: [{ s: plusDays(10), e: plusDays(13) }] },
    experiences: [
      {
        id: 'x1',
        name: 'Cata en la cava',
        text: 'Una hora con nuestro enólogo entre barricas: probás cinco vinos de la finca, del Torrontés al Malbec de altura, con quesos y panes de la casa. Todos los días a las 18. Cupos chicos: conviene avisar con un día de anticipación.',
        price: 45000,
        unitLabel: 'por persona',
      },
      { id: 'x2', name: 'Cabalgata al atardecer', text: 'Dos horas a caballo por los viñedos y el pie de monte, con guía baqueano. Para todos los niveles.', price: 0, unitLabel: '' },
      { id: 'x3', name: 'Almuerzo en la galería', text: 'Menú de pasos con vinos de la casa frente a la cordillera.', price: 60000, unitLabel: 'por persona' },
    ],
  };
}

const ph = (n: number, unitId = '', order = 0): PublicSitePhoto => ({ id: `m${n}-${unitId || 'g'}-${order}`, data: `/muestra/v${n}.jpg`, order, unitId });

export const samplePhotos: PublicSitePhoto[] = [
  ph(2), ph(3, '', 1), ph(1, '', 2), ph(8, '', 3), ph(5, '', 4), ph(4, '', 5),
  ph(6, 'u1'), ph(4, 'u1', 1), ph(7, 'u2'), ph(2, 'u2', 1), ph(3, 'u3'), ph(1, 'u3', 1),
  ph(8, expPhotoKey('x1')), ph(3, expPhotoKey('x3')),
];
