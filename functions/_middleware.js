/**
 * Solo corre en las rutas de public/_routes.json.
 * /.well-known/*: si el archivo no existe, responder 404 en lugar de la app (la SPA devuelve
 * index.html para cualquier ruta, y Lighthouse lo lee como un ai-catalog.json inválido).
 */
export async function onRequest({ request, next }) {
  const res = await next();
  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/.well-known/') && (res.headers.get('content-type') || '').includes('text/html')) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  return res;
}
