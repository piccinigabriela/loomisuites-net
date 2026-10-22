/**
 * Cloudflare Pages Function: Tu Web (/web/{nombre}).
 *
 * - /web/{nombre}: el mismo index.html, con título, descripción y foto del complejo para la vista previa
 *   del link en WhatsApp, Instagram, Facebook (no ejecutan JavaScript, leen las etiquetas <meta>).
 * - /web/{nombre}/portada.jpg: la foto de portada como imagen (las fotos se guardan en Firestore como data URL).
 */
const PROJECT_ID = 'gen-lang-client-0206771016';
const DATABASE_ID = 'ai-studio-loomisuitesoftwa-4808a07b-59ca-4c3c-a656-b8a461bf5e08';
const API_KEY = 'AIzaSyACFYyOeSuKNQfXR5Pk8uP1ZrRa4y_rgDI';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
const SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

const str = (fields, key) => (fields && fields[key] && fields[key].stringValue) || '';

export async function fetchSiteMeta(slug, fetchImpl = fetch) {
  if (!SLUG.test(slug)) return null;
  const url =
    `${BASE}/publicSites/${slug}?key=${API_KEY}` +
    '&mask.fieldPaths=name&mask.fieldPaths=tagline&mask.fieldPaths=city&mask.fieldPaths=enabled';
  try {
    const res = await fetchImpl(url, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return null;
    const f = (await res.json()).fields || {};
    return {
      name: str(f, 'name').trim(),
      tagline: str(f, 'tagline').trim(),
      city: str(f, 'city').trim(),
      enabled: Boolean(f.enabled && f.enabled.booleanValue),
    };
  } catch {
    return null;
  }
}

/** Id de la foto de portada: la primera foto general (sin unidad) por orden; si no hay, la primera. */
export async function fetchCoverId(slug, fetchImpl = fetch) {
  if (!SLUG.test(slug)) return '';
  const url =
    `${BASE}/publicSites/${slug}/photos?key=${API_KEY}&pageSize=100` +
    '&mask.fieldPaths=order&mask.fieldPaths=unitId';
  try {
    const res = await fetchImpl(url, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return '';
    const docs = ((await res.json()).documents || []).map((d) => ({
      id: d.name.split('/').pop(),
      order: Number((d.fields && d.fields.order && (d.fields.order.integerValue || d.fields.order.doubleValue)) || 0),
      unitId: str(d.fields, 'unitId'),
    }));
    docs.sort((a, b) => a.order - b.order);
    const cover = docs.find((d) => !d.unitId) || docs[0];
    return cover ? cover.id : '';
  } catch {
    return '';
  }
}

async function coverResponse(slug) {
  const id = await fetchCoverId(slug);
  if (!id) return new Response('Not found', { status: 404 });
  const res = await fetch(`${BASE}/publicSites/${slug}/photos/${id}?key=${API_KEY}&mask.fieldPaths=data`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) return new Response('Not found', { status: 404 });
  const dataUrl = str((await res.json()).fields, 'data');
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) return new Response('Not found', { status: 404 });
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { 'content-type': m[1], 'cache-control': 'public, max-age=3600' },
  });
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ["web", nombre, ("portada.jpg")]
  const slug = (parts[1] || '').toLowerCase();

  if (parts[2] === 'portada.jpg' && request.method === 'GET') return coverResponse(slug);

  // La app (SPA): para /web/{nombre} se sirve index.html
  const assetRes = await env.ASSETS.fetch(request);
  const type = assetRes.headers.get('content-type') || '';
  if (request.method !== 'GET' || !type.includes('text/html')) return assetRes;

  const meta = await fetchSiteMeta(slug);
  if (!meta || !meta.name) {
    const headers = new Headers(assetRes.headers);
    headers.set('cache-control', 'no-cache');
    return new Response(assetRes.body, { status: meta ? 200 : 404, headers });
  }

  const title = meta.city ? `${meta.name} · ${meta.city}` : meta.name;
  const description = meta.tagline || 'Reservá directo con el anfitrión · Book directly with the host';
  const pageUrl = `${url.origin}/web/${slug}`;
  const image = `${url.origin}/web/${slug}/portada.jpg`;
  const setContent = (value) => ({ element(el) { el.setAttribute('content', value); } });

  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', setContent(description))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', pageUrl); } })
    .on('meta[property="og:title"]', setContent(title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:url"]', setContent(pageUrl))
    .on('meta[property="og:site_name"]', setContent(meta.name))
    .on('meta[name="twitter:card"]', setContent('summary_large_image'))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[name="twitter:description"]', setContent(description))
    // index.html no trae imagen: se agrega la portada del complejo
    .on('head', {
      element(el) {
        el.append(`<meta property="og:image" content="${image}" /><meta name="twitter:image" content="${image}" />`, { html: true });
      },
    })
    // Datos estructurados y landing prearmada del software: no corresponden a la página del complejo
    .on('script[type="application/ld+json"]', { element(el) { el.remove(); } })
    .on('#prerendered', { element(el) { el.remove(); } })
    .transform(assetRes);

  const headers = new Headers(rewritten.headers);
  headers.set('cache-control', 'no-cache');
  return new Response(rewritten.body, { status: rewritten.status, headers });
}
