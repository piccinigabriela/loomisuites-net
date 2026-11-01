/**
 * De dónde llegó cada persona (anuncio de Google, de Meta, etc.), para saber cuánto cuesta cada cuenta nueva.
 * Se toma de la etiqueta del link (utm_source / utm_campaign, o src) y se guarda solo en este navegador.
 * La landing (loomisuite.net) y la app (app.loomisuite.net) no comparten almacenamiento: por eso los links
 * hacia la app llevan el origen en el link (?src=…). Sin cookies. Se manda solo con el aviso de registro.
 */
const KEY = 'loomi_src';
const MAX_DAYS = 60;
const TRACKING = /^(utm_[a-z]+|gclid|gbraid|wbraid|fbclid|src|ref)$/;

export interface AdSource {
  source: string;
  campaign: string;
  at: string;
}

/** true si el link solo trae etiquetas de anuncios (para seguir mostrando la landing) */
export function onlyTrackingParams(search: string): boolean {
  const q = new URLSearchParams(search);
  for (const k of q.keys()) if (!TRACKING.test(k)) return false;
  return true;
}

/** Guarda el origen la primera vez que llega con etiqueta (no lo pisa otro link después) */
export function captureAdSource(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const source = (q.get('utm_source') || q.get('src') || '').trim().slice(0, 40);
    if (!source || getAdSource()) return;
    const v: AdSource = { source, campaign: (q.get('utm_campaign') || '').trim().slice(0, 60), at: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function getAdSource(): AdSource | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null') as AdSource | null;
    if (!v || !v.source) return null;
    if (Date.now() - new Date(v.at).getTime() > MAX_DAYS * 86400000) return null;
    return v;
  } catch {
    return null;
  }
}

/** Texto corto para el aviso: "google (busqueda)" */
export function adSourceLabel(): string {
  const v = getAdSource();
  return v ? `${v.source}${v.campaign ? ` (${v.campaign})` : ''}` : '';
}

/** Link a la app con el origen, si lo hay */
export function withAdSource(url: string): string {
  const v = getAdSource();
  if (!v) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('src')) u.searchParams.set('src', v.source);
    if (v.campaign && !u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', v.campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/** Los clics en links hacia app.loomisuite.net llevan el origen (así la app lo sabe al registrarse) */
export function tagAppLinks(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="https://app.loomisuite.net"]') as HTMLAnchorElement | null;
      if (a && getAdSource()) a.href = withAdSource(a.href);
    },
    true
  );
}
