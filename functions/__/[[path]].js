/**
 * Cloudflare Pages Function: proxy de las rutas de Firebase Auth.
 *
 * Permite usar app.loomisuite.net como "authDomain" de Firebase, así la pantalla de Google
 * dice "app.loomisuite.net" en lugar de "gen-lang-client-0206771016.firebaseapp.com".
 * Reenvía /__/auth/* y /__/firebase/* al dominio de Firebase del proyecto.
 * Referencia: Firebase "Best practices for using signInWithRedirect", opción 3 (proxy).
 */
const FIREBASE_AUTH_HOST = 'https://gen-lang-client-0206771016.firebaseapp.com';

export async function onRequest({ request }) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/__/auth/') && !url.pathname.startsWith('/__/firebase/')) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.delete('host');

  const upstream = await fetch(FIREBASE_AUTH_HOST + url.pathname + url.search, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
}
