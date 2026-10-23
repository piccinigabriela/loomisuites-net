/**
 * Tu Web: la página pública de reservas directas de cada complejo.
 *
 * Datos públicos en publicSites/{slug} (lectura libre) y fotos en publicSites/{slug}/photos.
 * El link usa un nombre (slug) y no el uid del dueño: con el uid cualquiera podría abrir la guía (wifi, accesos).
 * Quién es el dueño de cada nombre está en siteOwners/{slug} (privado).
 * Configuración del dueño en tenants/{uid}.webSite.
 *
 * Sin Firebase ni React: lo usan la app, la página pública y el servidor (server-sync).
 */
import type { CurrencyCode, Property, Reservation, WelcomeGuideData } from '../types';
import { normalizePricing, PricingSettings } from './pricing';

export type SiteTheme = 'noche' | 'dia' | 'clara' | 'tierra';

/** Diseños incluidos en todos los planes */
export const BASIC_THEMES: SiteTheme[] = ['noche', 'dia', 'clara'];
/** Diseños especiales (de pago): los habilita la administración de Loomi en subscriptions/{uid}.webDesigns */
export const SPECIAL_THEMES: Array<{ id: SiteTheme; name: string }> = [{ id: 'tierra', name: 'Tierra' }];

/** El estilo que se publica: si el elegido no está incluido ni habilitado, vuelve a Noche */
export function allowedTheme(theme: SiteTheme | undefined, webDesigns: string[] | undefined): SiteTheme {
  const t = theme || 'noche';
  if (BASIC_THEMES.includes(t)) return t;
  return (webDesigns || []).includes(t) ? t : 'noche';
}

/** Lo que el dueño configura (tenants/{uid}.webSite) */
export interface WebSiteSettings {
  slug: string;
  enabled: boolean;
  /** Frase corta debajo del nombre */
  tagline?: string;
  /** Texto de presentación */
  description?: string;
  /** WhatsApp para los pedidos (si está vacío se usa el de la guía) */
  whatsapp?: string;
  theme?: SiteTheme;
  /** Por unidad: ocultarla y su descripción */
  units?: Record<string, { hidden?: boolean; description?: string }>;
}

export interface PublicSiteUnit {
  id: string;
  name: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  basePrice: number;
}

export interface BusyRange {
  /** Primera noche ocupada (YYYY-MM-DD) */
  s: string;
  /** Día de salida (esa noche queda libre) */
  e: string;
}

/** publicSites/{slug} */
export interface PublicSiteDoc {
  enabled: boolean;
  name: string;
  tagline: string;
  description: string;
  city: string;
  address: string;
  mapsUrl: string;
  whatsapp: string;
  checkinHour: string;
  checkoutHour: string;
  currency: CurrencyCode;
  theme: SiteTheme;
  units: PublicSiteUnit[];
  pricing: PricingSettings | null;
  busy?: Record<string, BusyRange[]>;
  busyUpdatedAt?: unknown;
  updatedAt?: unknown;
}

/** publicSites/{slug}/photos/{id} */
export interface PublicSitePhoto {
  id: string;
  /** Imagen en data URL (JPEG comprimido) */
  data: string;
  order: number;
  /** Unidad a la que pertenece ('' = foto general del complejo) */
  unitId: string;
}

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/** Nombres que no se pueden usar como link */
const RESERVED = new Set(['admin', 'app', 'web', 'guia', 'manual', 'loomi', 'loomisuite', 'demo', 'test', 'panel', 'api']);

/** "Cabañas Las Catalinas" → "cabanas-las-catalinas" */
export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

export function slugProblem(slug: string): string {
  if (!slug) return 'Escribí un nombre para el link.';
  if (slug.length < 3) return 'Tiene que tener al menos 3 letras.';
  if (!SLUG_PATTERN.test(slug)) return 'Solo letras sin acentos, números y guiones (sin guion al principio ni al final).';
  if (RESERVED.has(slug)) return 'Ese nombre está reservado. Probá con otro.';
  return '';
}

/** Solo los dígitos, para wa.me. Si es un celular argentino sin código de país, se agrega 549. */
export function whatsappDigits(phone: string): string {
  let d = (phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = '549' + d; // 3757 123456 → 54 9 3757 123456
  if (d.startsWith('54') && !d.startsWith('549') && d.length === 12) d = '549' + d.slice(2);
  return d;
}

/** Arma el documento público (sin las fechas ocupadas, que se escriben aparte). */
export function buildPublicSite(input: {
  settings: WebSiteSettings;
  guide?: WelcomeGuideData | null;
  complexName?: string;
  city?: string;
  properties: Property[];
  pricing?: Partial<PricingSettings> | null;
  currency?: CurrencyCode;
}): Omit<PublicSiteDoc, 'busy' | 'busyUpdatedAt' | 'updatedAt'> {
  const { settings, guide } = input;
  const unitCfg = settings.units || {};
  const units: PublicSiteUnit[] = visibleUnits(input.properties, settings).map((p) => ({
    id: p.id,
    name: p.name || '',
    maxGuests: Number(p.maxGuests) || 0,
    bedrooms: Number(p.bedrooms) || 0,
    bathrooms: Number(p.bathrooms) || 0,
    description: (unitCfg[p.id]?.description || '').trim(),
    basePrice: Number(p.basePrice) || 0,
  }));

  let pricing: PricingSettings | null = null;
  if (input.pricing) {
    const p = normalizePricing(input.pricing);
    const ids = new Set(units.map((u) => u.id));
    pricing = { ...p, assignments: Object.fromEntries(Object.entries(p.assignments).filter(([id]) => ids.has(id))) };
  }

  return {
    enabled: Boolean(settings.enabled),
    name: (guide?.propertyName || input.complexName || '').trim(),
    tagline: (settings.tagline ?? guide?.tagline ?? '').trim(),
    description: (settings.description || '').trim(),
    city: (input.city || '').trim(),
    address: (guide?.locationAddress || '').trim(),
    mapsUrl: (guide?.googleMapsUrl || '').trim(),
    whatsapp: whatsappDigits(settings.whatsapp || guide?.hostPhone || ''),
    checkinHour: (guide?.checkinHour || '').trim(),
    checkoutHour: (guide?.checkoutHour || '').trim(),
    currency: input.currency || 'ARS',
    theme: settings.theme && ['noche', 'dia', 'clara', 'tierra'].includes(settings.theme) ? settings.theme : 'noche',
    units,
    pricing,
  };
}

export function visibleUnits(properties: Property[], settings: WebSiteSettings): Property[] {
  const cfg = settings.units || {};
  return properties
    .filter((p) => p.status !== 'paused' && !cfg[p.id]?.hidden)
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { numeric: true }));
}

/**
 * Fechas ocupadas por unidad, desde hoy. Solo rangos unidos: no dice cuántas reservas hay ni de quién.
 * La usan la app y el servidor con la misma fecha de hoy, así no se pisan con datos distintos.
 */
export function buildSiteBusy(
  unitIds: string[],
  reservations: Reservation[],
  today: string
): Record<string, BusyRange[]> {
  const out: Record<string, BusyRange[]> = {};
  for (const id of unitIds) {
    const ranges = reservations
      .filter((r) => r.propertyId === id && r.status !== 'cancelled' && r.checkIn && r.checkOut && r.checkOut > today && r.checkOut > r.checkIn)
      .map((r) => ({ s: r.checkIn < today ? today : r.checkIn, e: r.checkOut }))
      .sort((a, b) => a.s.localeCompare(b.s));
    const merged: BusyRange[] = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r.s <= last.e) {
        if (r.e > last.e) last.e = r.e;
      } else {
        merged.push({ ...r });
      }
    }
    out[id] = merged;
  }
  return out;
}

/** true si la unidad está libre todas las noches entre checkIn y checkOut */
export function isUnitFree(busy: BusyRange[] | undefined, checkIn: string, checkOut: string): boolean {
  return !(busy || []).some((b) => b.s < checkOut && b.e > checkIn);
}

/** JSON con claves ordenadas, para comparar sin importar el orden */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
      : v
  );
}

/** Link público de Tu Web */
export function siteUrl(slug: string): string {
  return `https://loomisuite.net/web/${slug}`;
}

/** Hosts de Loomi: en cualquier otro, la página es el dominio propio de un complejo */
export function isLoomiHost(hostname: string): boolean {
  const h = (hostname || '').toLowerCase();
  return (
    h === 'loomisuite.net' ||
    h.endsWith('.loomisuite.net') ||
    h.endsWith('.pages.dev') ||
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === ''
  );
}
