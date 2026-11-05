/**
 * Orígenes de reserva propios (idea vista en Areca, 5/11): además de Directa, Airbnb, Booking y Vrbo, el dueño suma los suyos
 * (Instagram, una agencia, Despegar…) con su comisión en %. Se guardan en tenants/{uid}.reservationOrigins (demo: demoState).
 * Una reserva con origen propio lleva platform 'direct' + origin = id, así el resto de la app (calendario, iCal, colores) no cambia.
 */
import type { BookingPlatform, Reservation, ReservationOrigin } from '../types';

type AirbnbFeeMode = Reservation['airbnbFeeMode'];

export const BUILTIN_CHANNELS: { value: BookingPlatform; label: string }[] = [
  { value: 'direct', label: 'Directa' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'booking', label: 'Booking.com' },
  { value: 'vrbo', label: 'Vrbo' },
];

export function normalizeOrigins(raw?: ReservationOrigin[] | null): ReservationOrigin[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw
    .map((o) => ({ id: String(o?.id || ''), label: String(o?.label || '').trim().slice(0, 40), commission: Math.min(50, Math.max(0, Number(o?.commission) || 0)) }))
    .filter((o) => o.id && o.label && !seen.has(o.id) && seen.add(o.id));
}

export const newOriginId = () => `org-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Valor del selector de canal: 'direct' | 'airbnb' | 'booking' | 'vrbo' | 'o:{id}' */
export const channelValue = (platform: BookingPlatform, origin?: string) => (origin ? `o:${origin}` : platform);

export function decodeChannel(value: string): { platform: BookingPlatform; origin?: string } {
  if (value.startsWith('o:')) return { platform: 'direct', origin: value.slice(2) };
  return { platform: (value as BookingPlatform) || 'direct' };
}

/** Comisión (0–1) del canal elegido */
export function channelRate(value: string, airbnbFeeMode: AirbnbFeeMode | undefined, origins: ReservationOrigin[]): number {
  const { platform, origin } = decodeChannel(value);
  if (origin) return (origins.find((o) => o.id === origin)?.commission || 0) / 100;
  if (platform === 'airbnb') return airbnbFeeMode === 'traditional_3' ? 0.03 : 0.15;
  if (platform === 'booking' || platform === 'vrbo') return 0.15;
  return 0;
}

/** Nombre del canal de una reserva, con los orígenes propios */
export function channelLabel(r: Pick<Reservation, 'platform' | 'origin'>, origins: ReservationOrigin[]): string {
  if (r.origin) return origins.find((o) => o.id === r.origin)?.label || 'Otro origen';
  return BUILTIN_CHANNELS.find((c) => c.value === r.platform)?.label || r.platform;
}
