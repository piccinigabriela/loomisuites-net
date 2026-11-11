/**
 * Cloudflare Pages Function: recordatorio de la encuesta por WhatsApp (POST /api/whatsapp/recordatorio).
 * Lo llama Supabase (pg_cron + pg_net, trabajo "xenia-recordatorio") cada 15 minutos con la cabecera x-xenia-secret.
 * La lógica está en zernio.js (runNudges). Para apagarlo: en Supabase, select cron.unschedule('xenia-recordatorio');
 */
import { runNudges } from './zernio.js';

const clean = (v) => String(v || '').replace(/^[\s`"']+|[\s`"']+$/g, '');

export async function onRequestPost({ request, env }) {
  if (!env.ZERNIO_API_KEY || !env.CRM_XENIA_SECRET) return new Response('no configurado', { status: 503 });
  const given = clean(request.headers.get('x-xenia-secret'));
  if (!given || given !== clean(env.CRM_XENIA_SECRET)) return new Response('no', { status: 401 });
  const result = await runNudges(env);
  return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
}
