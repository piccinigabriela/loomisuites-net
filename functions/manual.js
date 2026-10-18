/**
 * Cloudflare Pages Function: vista previa del link loomisuite.net/manual
 * (WhatsApp, Facebook, LinkedIn leen estas etiquetas; la página la arma la SPA).
 */
const MANUALS = {
  hospitalidad: {
    title: 'Hospitalidad plena: las 6 normas de oro del anfitrión — Manual gratis',
    desc: 'Manual de Loomi Suite inspirado en la Xenía griega y el Omotenashi japonés. Descargalo gratis.',
    img: '/manual-portada.jpg',
  },
  fotos: {
    title: 'En su mejor día: guía de fotografía para alojamientos — Manual gratis',
    desc: 'Fotos que hacen que te reserven, con el celular o con cámara. Manual gratis de Loomi Suite.',
    img: '/manual-fotografia-portada.jpg',
  },
};

export async function onRequest({ request, env }) {
  const res = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  if (request.method !== 'GET' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const url = new URL(request.url);
  const m = url.searchParams.get('m') === 'fotos' ? MANUALS.fotos : MANUALS.hospitalidad;
  const TITLE = m.title;
  const DESC = m.desc;
  const page = url.origin + '/manual' + (m === MANUALS.fotos ? '?m=fotos' : '');
  const img = url.origin + m.img;
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
