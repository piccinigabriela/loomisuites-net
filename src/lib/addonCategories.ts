/**
 * Categorías de los opcionales y extras (idea vista en Areca, 5/11).
 * Las 6 de siempre son el punto de partida; el dueño puede sumar, renombrar o borrar.
 * Se guardan en tenants/{uid}.addonCategories (app) o en demoState.addonCategories (demo).
 * Un opcional cuya categoría ya no existe se muestra en "Sin categoría".
 */
import type { AddonCategoryDef } from '../types';

export const DEFAULT_ADDON_CATEGORIES: AddonCategoryDef[] = [
  { id: 'desayuno', label: 'Desayunos y comidas' },
  { id: 'frigobar', label: 'Bebidas y frigobar' },
  { id: 'transfers', label: 'Traslados' },
  { id: 'experiencias', label: 'Excursiones y experiencias' },
  { id: 'spa', label: 'Spa y masajes' },
  { id: 'servicios', label: 'Otros servicios' },
];

export const NO_CATEGORY = 'Sin categoría';

export function normalizeAddonCategories(raw?: AddonCategoryDef[] | null): AddonCategoryDef[] {
  if (!Array.isArray(raw)) return DEFAULT_ADDON_CATEGORIES;
  const seen = new Set<string>();
  return raw
    .map((c) => ({ id: String(c?.id || '').trim(), label: String(c?.label || '').trim().slice(0, 40) }))
    .filter((c) => c.id && c.label && !seen.has(c.id) && seen.add(c.id));
}

export function addonCategoryLabel(id: string | undefined, cats: AddonCategoryDef[]): string {
  return cats.find((c) => c.id === id)?.label || NO_CATEGORY;
}

export const newCategoryId = () => `cat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
