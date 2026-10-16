/**
 * Próximos ingresos por unidad, con lo justo para Limpieza: fechas, nombre y cantidad de personas.
 * Sin teléfonos, mails ni importes. Se guarda en tenants/{uid}/staff/llegadas.
 * Sin dependencias de Firebase: lo usan la app y el servidor.
 */
import type { Property, Reservation } from '../types';

export interface StaffArrival {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestsCount: number;
}

export interface StaffArrivalsDoc {
  /** propertyId → próximos ingresos ordenados por fecha */
  unidades: Record<string, StaffArrival[]>;
}

const DIAS = 21;

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Ingresos de hoy a 21 días (y estadías en curso), por unidad. */
export function buildStaffArrivals(properties: Property[], reservations: Reservation[], today: string): StaffArrivalsDoc {
  const limit = addDays(today, DIAS);
  const unidades: Record<string, StaffArrival[]> = {};
  for (const p of properties) unidades[p.id] = [];
  for (const r of reservations) {
    if (r.status === 'cancelled' || r.status === 'checked_out') continue;
    if (r.checkOut < today || r.checkIn > limit) continue;
    if (!unidades[r.propertyId]) continue;
    unidades[r.propertyId].push({
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      guestName: (r.guestName || '').trim() || 'Huésped',
      guestsCount: Number(r.guestsCount) || 1,
    });
  }
  for (const id of Object.keys(unidades)) {
    unidades[id].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }
  return { unidades };
}

/** Próximo ingreso a una unidad a partir de una fecha (el día de la limpieza). */
export function nextArrival(doc: StaffArrivalsDoc | null, propertyId: string, fromDate: string): StaffArrival | null {
  const list = doc?.unidades?.[propertyId] || [];
  return list.find((a) => a.checkIn >= fromDate) || null;
}
