/**
 * Checklist de limpieza propio de cada complejo (pedido de Roxana y Guido, 3/11).
 * Se guarda en tenants/{uid}.cleaningChecklist y lo usan la app y el servidor de iCal al crear cada limpieza.
 * - items: tareas de todas las limpiezas (si nunca se cargaron, van las 4 de siempre).
 * - units: tareas extra de una unidad ("regar las plantas", "prender la bomba de la pileta").
 */
import type { CleaningChecklistItem } from '../types';

export interface CleaningChecklistSettings {
  /** Tareas de todas las limpiezas. Sin definir = las de siempre. */
  items?: string[];
  /** Tareas extra por unidad (id de la unidad → tareas) */
  units?: Record<string, string[]>;
}

export const DEFAULT_CLEANING_ITEMS = [
  'Cambio integral de sábanas y toallas limpias',
  'Sanitización de baños y reposición de amenities',
  'Limpieza profunda de cocina y vajilla',
  'Llaves en su lugar',
];

export const MAX_ITEMS = 30;
export const MAX_ITEM_LENGTH = 140;

/** Limpia una lista: sin vacíos, sin repetidos, con largo y cantidad máximos */
export function cleanItems(list: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(list) ? list : []) {
    const t = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_ITEM_LENGTH);
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

/** Tareas generales del complejo */
export function generalItems(settings?: CleaningChecklistSettings | null): string[] {
  return settings && Array.isArray(settings.items) ? cleanItems(settings.items) : [...DEFAULT_CLEANING_ITEMS];
}

/** Tareas extra de una unidad */
export function unitItems(settings: CleaningChecklistSettings | null | undefined, propertyId: string): string[] {
  return cleanItems(settings?.units?.[propertyId]);
}

/** El checklist de una limpieza nueva: las generales y después las de su unidad */
export function buildCleaningChecklist(settings: CleaningChecklistSettings | null | undefined, propertyId: string): CleaningChecklistItem[] {
  const all = cleanItems([...generalItems(settings), ...unitItems(settings, propertyId)]);
  const list = all.length > 0 ? all : [...DEFAULT_CLEANING_ITEMS];
  return list.map((task, i) => ({ id: `c${i + 1}`, task, completed: false }));
}

/** Para guardar: sin unidades vacías ni de unidades que ya no existen */
export function normalizeChecklistSettings(
  settings: CleaningChecklistSettings,
  propertyIds: string[]
): CleaningChecklistSettings {
  const ids = new Set(propertyIds);
  const units: Record<string, string[]> = {};
  for (const [id, list] of Object.entries(settings.units || {})) {
    const items = cleanItems(list);
    if (ids.has(id) && items.length) units[id] = items;
  }
  return { items: cleanItems(settings.items), units };
}
