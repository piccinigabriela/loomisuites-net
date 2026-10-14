/**
 * Cloudflare Pages Function: vista previa de los links de la guía del huésped.
 *
 * WhatsApp, Telegram, Facebook, etc. no ejecutan JavaScript: leen las etiquetas <meta> del HTML.
 * Sin esto, el link /guia/... mostraba el aviso de Loomi Suite (software para anfitriones).
 * Acá servimos el mismo index.html pero con título y descripción de la guía del complejo.
 */
const PROJECT_ID = 'gen-lang-client-0206771016';
const DATABASE_ID = 'ai-studio-loomisuitesoftwa-4808a07b-59ca-4c3c-a656-b8a461bf5e08';
const API_KEY = 'AIzaSyACFYyOeSuKNQfXR5Pk8uP1ZrRa4y_rgDI';

const DEFAULT_DESCRIPTION =
  'Cómo llegar, Wi-Fi, horarios y contacto · How to get there, Wi-Fi, check-in times and contact';

/** Lee publicGuides/{uid} (lectura pública) y devuelve { complexName, unitName }. */
export async function fetchGuideNames(uid, propertyId, fetchImpl = fetch) {
  if (!uid || !/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return {};
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}` +
    `/documents/publicGuides/${uid}?key=${API_KEY}` +
    `&mask.fieldPaths=complexName&mask.fieldPaths=units`;
  try {
    const res = await fetchImpl(url, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return {};
    const data = await res.json();
    const fields = data.fields || {};
    const complexName = (fields.complexName && fields.complexName.stringValue) || '';
    let unitName = '';
    const units = (fields.units && fields.units.arrayValue && fields.units.arrayValue.values) || [];
    if (propertyId) {
      for (const u of units) {
        const f = (u.mapValue && u.mapValue.fields) || {};
        if (f.id && f.id.stringValue === propertyId) {
          unitName = (f.name && f.name.stringValue) || '';
          break;
        }
      }
    }
    return { complexName: complexName.trim(), unitName: unitName.trim() };
  } catch {
    return {};
  }
}

export function buildGuideMeta({ complexName, unitName }) {
  const place = [unitName, complexName].filter(Boolean).join(' · ');
  const title = place ? `${place} — Guía de tu estadía / Your stay guide` : 'Guía de tu estadía / Your stay guide';
  return { title, description: DEFAULT_DESCRIPTION };
}

export async function onRequest({ request, env }) {
  const assetRes = await env.ASSETS.fetch(request);
  const type = assetRes.headers.get('content-type') || '';
  if (request.method !== 'GET' || !type.includes('text/html')) return assetRes;

  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ["guia", uid, propertyId]
  const names = await fetchGuideNames(parts[1] || '', parts[2] || '');
  const { title, description } = buildGuideMeta(names);
  const pageUrl = url.origin + url.pathname;

  const setContent = (value) => ({ element(el) { el.setAttribute('content', value); } });

  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', setContent(description))
    .on('meta[name="robots"]', setContent('noindex, nofollow'))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', pageUrl); } })
    .on('meta[property="og:title"]', setContent(title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:url"]', setContent(pageUrl))
    .on('meta[property="og:site_name"]', setContent(names.complexName || 'Guía del huésped'))
    .on('meta[name="twitter:card"]', setContent('summary'))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[name="twitter:description"]', setContent(description))
    // Datos estructurados del software: no corresponden a la guía de un huésped
    .on('script[type="application/ld+json"]', { element(el) { el.remove(); } })
    .transform(assetRes);

  const headers = new Headers(rewritten.headers);
  headers.set('cache-control', 'no-cache');
  return new Response(rewritten.body, { status: rewritten.status, headers });
}
