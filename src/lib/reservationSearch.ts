/**
 * Buscador de reservas (lista de la compu y Agenda del celular): por huésped, unidad, teléfono, mail o patente.
 * Sin importar acentos ni mayúsculas, y "dept", "depto", "dpto" o "departamento" valen lo mismo.
 */
import type { Reservation } from '../types';

export function normalizeSearch(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(departamento|depto|dept|dpto|dto)\b\.?/g, 'depto')
    .replace(/[^a-z0-9@.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesReservationSearch(query: string, r: Reservation, unitName: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  // Unidad: "depto a", "dept B", "cabaña"
  if (normalizeSearch(unitName).includes(q)) return true;
  // Huésped: cada palabra buscada es el comienzo de una palabra del nombre ("jua per" encuentra a Juan Pérez)
  const guestWords = normalizeSearch(r.guestName).split(' ');
  if (q.split(' ').every((w) => guestWords.some((g) => g.startsWith(w)))) return true;
  if (normalizeSearch(r.guestName).includes(q)) return true;
  if (normalizeSearch(r.guestEmail || '').includes(q)) return true;
  if (r.carPlate && normalizeSearch(r.carPlate).replace(/\s/g, '').includes(q.replace(/\s/g, ''))) return true;
  const digits = query.replace(/\D/g, '');
  return digits.length >= 3 && (r.guestPhone || '').replace(/\D/g, '').includes(digits);
}
