/**
 * Cloudflare Pages Function: vista previa del link loomisuite.net/manual
 * (WhatsApp, Facebook, LinkedIn leen estas etiquetas; la página la arma la SPA).
 */
const TITLE = 'Hospitalidad plena: las 6 normas de oro del anfitrión — Manual gratis';
const DESC = 'Manual de Loomi Suite inspirado en la Xenía griega y el Omotenashi japonés. Descargalo gratis.';

export async function onRequest({ request, env }) {
  const res = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  if (request.method !== 'GET' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const url = new URL(request.url);
  const page = url.origin + '/manual';
  const img = url.origin + '/manual-portada.jpg';
  const set = (v) => ({ element(el) { el.setAttribute('content', v); } });
  const out = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(TITLE); } })
    .on('meta[name="description"]', set(DESC))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', page); } })
    .on('meta[property="og:title"]', set(TITLE))
    .on('meta[property="og:description"]', set(DESC))
    .on('meta[property="og:url"]', set(page))
    .on('meta[name="twitter:title"]', set(TITLE))
    .on('meta[name="twitter:description"]', set(DESC))
    .on('head', {
      element(el) {
        el.append(`<meta property="og:image" content="${img}" /><meta name="twitter:image" content="${img}" />`, { html: true });
      },
    })
    .transform(res);
  return out;
}
