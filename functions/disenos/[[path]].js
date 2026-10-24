/**
 * Cloudflare Pages Function: vista previa del link loomisuite.net/disenos (y /disenos/{diseño})
 * para WhatsApp y redes. La página la arma la SPA (src/components/showcase/DesignShowcase.tsx).
 */
const NAMES = { refugio: 'Refugio', estudio: 'Estudio', calma: 'Calma', hacienda: 'Hacienda', revista: 'Revista', tierra: 'Tierra', noche: 'Noche', dia: 'Día', clara: 'Clara' };

export async function onRequest({ request, env, params }) {
  const res = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  if (request.method !== 'GET' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const url = new URL(request.url);
  const id = String((params.path && params.path[0]) || '').toLowerCase();
  const name = NAMES[id];
  const TITLE = name ? `Diseño ${name} para Tu Web — Loomi Suite` : 'Diseños para Tu Web — Loomi Suite';
  const DESC = 'Tu página de reservas directas, con tus fotos y el precio según las fechas. Mirá cada diseño funcionando.';
  const page = url.origin + '/disenos' + (name ? `/${id}` : '');
  const img = url.origin + `/muestra/d-${name ? id : 'refugio'}.jpg`;
  const set = (v) => ({ element(el) { el.setAttribute('content', v); } });
  return new HTMLRewriter()
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
}
