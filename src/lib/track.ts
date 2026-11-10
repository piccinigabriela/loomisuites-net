/**
 * Eventos en GoatCounter (10/11): qué hace la gente en la web pública, sin cookies ni datos personales.
 * Se ven en loomisuite.goatcounter.com junto con las páginas (los eventos aparecen con su nombre, ej. "manual-pedido").
 * Si GoatCounter no cargó (app real, vista previa, bloqueador), no hace nada.
 */
export function track(name: string, title?: string): void {
  try {
    const gc = (window as unknown as { goatcounter?: { count?: (o: Record<string, unknown>) => void } }).goatcounter;
    if (gc && typeof gc.count === 'function') gc.count({ path: name, title: title || name, event: true });
  } catch {
    /* sin estadística */
  }
}
