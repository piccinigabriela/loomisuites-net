/**
 * Cloudflare Pages Function: dólar MEP del día para "Mi plan" (pago por Payoneer).
 * Lee dolarapi.com desde el servidor (sin problemas de CORS en el navegador) y lo guarda 10 minutos en la caché de Cloudflare.
 * Responde { rate, date } o 502 si no se pudo leer.
 */
export function parseMep(data) {
  const rate = Number(data && (data.venta ?? data.sell));
  if (!(rate > 0)) return null;
  return { rate, date: String((data && (data.fechaActualizacion || data.updated)) || '') };
}

export async function onRequest() {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/bolsa', { cf: { cacheTtl: 600, cacheEverything: true } });
    if (res.ok) {
      const q = parseMep(await res.json());
      if (q) {
        return new Response(JSON.stringify(q), {
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' },
        });
      }
    }
  } catch {}
  return new Response(JSON.stringify({ error: 'sin cotización' }), {
    status: 502,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
