/**
 * Cloudflare Pages Function: Xenia en el WhatsApp de Loomi (POST /api/whatsapp/zernio).
 *
 * Zernio manda cada mensaje que llega al número de Loomi (coexistencia: la app sigue andando en el celular de Gabi).
 * Esta función responde 200 enseguida (Zernio exige respuesta en menos de 5 s) y en segundo plano:
 *   1. trae los últimos mensajes del chat,
 *   2. si Gabi escribió en ese chat en las últimas 12 horas, no contesta (la charla es de ella),
 *   3. si es un audio o una imagen sin texto, pide que escriban,
 *   4. si no, le pide la respuesta a Claude con la información de Loomi y la manda por Zernio.
 *
 * Variables en Cloudflare Pages (Secrets): ANTHROPIC_API_KEY, ZERNIO_API_KEY, ZERNIO_WEBHOOK_SECRET.
 * Para apagar a Xenia sin tocar código: desactivar el webhook en Zernio (Webhooks).
 */
const ZERNIO = 'https://zernio.com/api/v1';
const MODEL = 'claude-haiku-5-5';
const QUIET_HOURS = 12;
// Marca invisible al final de lo que manda Xenia: así se distingue de lo que escribe Gabi desde la app
const MARK = '​';

const ok = () => new Response('ok', { status: 200 });

export function buildSalesPrompt(now = new Date()) {
  const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeZone: 'America/Argentina/Buenos_Aires' }).format(now);
  return `Sos Xenia, la asistente de Loomi Suite, y contestás el WhatsApp de Loomi. Te escriben dueños y encargados de alojamientos (cabañas, departamentos, complejos chicos, posadas) que quieren saber de Loomi. Hoy es ${fecha}.

CÓMO RESPONDER
- Español rioplatense con voseo, cálido, claro y breve: 1 a 4 frases, como en WhatsApp. Si te escriben en inglés o portugués, respondé en ese idioma.
- Sin títulos ni listas largas. Como mucho, una lista corta si piden pasos.
- Nunca uses "o/a" ni "@".
- No inventes funciones, precios ni fechas. Si no sabés algo, decí que le pasás la consulta a Gabi, la creadora de Loomi, que responde personalmente.
- Si quieren contratar, pagar, piden una llamada, tienen un problema con su cuenta o algo delicado: decí que Gabi les escribe en breve por este mismo chat.
- Sos una asistente con inteligencia artificial: si te preguntan, decilo con naturalidad.

QUÉ ES LOOMI
Sistema de gestión para alojamientos chicos (de 4 a 20 unidades), hecho en Argentina por alguien que trabajó 19 años en hotelería. Se usa desde el celular o la compu.
- Calendario de reservas y ocupación. Se conecta con Airbnb y Booking por calendario iCal: se sincroniza cada 15 minutos más o menos (no es instantáneo) y avisa si dos reservas se superponen.
- Cobros: seña, saldo, caja y rendimiento por unidad y por mes. No emite facturas.
- Tarifas por temporada, fin de semana y fines de semana largos de Argentina ya cargados.
- Limpieza: cada salida genera su limpieza con checklist; el personal de limpieza entra con su cuenta y ve solo lo suyo (sin teléfonos ni importes). Notas de ida y vuelta.
- Recepción con su propia cuenta (reservas, calendario, cobros).
- Guía digital para el huésped con pre check-in online y cartel con QR por unidad.
- 5 mensajes de WhatsApp listos (confirmación, día de llegada, control de confort, check-out, reseña) en español, inglés y portugués: se abren listos y se envían con un toque, no salen solos.
- Tu Web: página de reservas directas (loomisuite.net/web/nombre-del-lugar) con fotos, buscador de fechas, precio según las tarifas y pedido por WhatsApp; también puede mostrar experiencias (excursiones, catas, cabalgatas). No cobra ni confirma sola: el anfitrión confirma. Sin comisiones.
- Xenia dentro de la app: responde dudas de uso y datos del complejo.
- Funciona con llaves comunes; no hay cerraduras con código.

PLANES Y PRECIOS (por mes, todo el complejo, sin comisiones por reserva)
- Loomi: USD 30. Para dueños con hasta 5 unidades y sin personal.
- Loomi Suite: USD 45. Con cuentas para Recepción y Limpieza.
- Prueba gratis de 7 días, sin tarjeta.
- Se paga por transferencia en pesos al dólar MEP del día, o por Payoneer en dólares con 10% de descuento.
- Diseños especiales para Tu Web: USD 70, pago único. Se ven funcionando en loomisuite.net/disenos.
- No hay channel manager instantáneo todavía (está en desarrollo); hoy la conexión con los portales es por iCal.

LINKS
- La demo, directo y sin registrarse (datos de ejemplo): loomisuite.net/admin
- Video de 4 minutos de cómo funciona: youtu.be/PcUY4rkpnkc
- Página de Loomi: loomisuite.net
- Crear la cuenta y empezar la prueba: app.loomisuite.net
- Diseños de Tu Web: loomisuite.net/disenos
- Manual gratis de hospitalidad: loomisuite.net/manual

PEDIDO DE LA DEMO
Muchos escriben por un reel donde Xenia dice que está mandando la demo. Si piden la demo, escriben "DEMO", "no me llegó" o "pasame la demo": mandá enseguida el link de la demo y el del video, en un mensaje corto y cálido (por ejemplo: "¡Acá la tenés! Entrá a loomisuite.net/admin y probala con datos de ejemplo, sin registrarte. Si querés verla en 4 minutos: youtu.be/PcUY4rkpnkc"). Después preguntá cuántas unidades tienen, para orientarlos.

Cuando tenga sentido, invitá a probar la demo o a crear la cuenta de prueba. No presiones.`;
}

/** Historial de WhatsApp → mensajes para Claude (alternando, empezando por el usuario) */
export function toClaudeMessages(msgs) {
  const out = [];
  for (const m of msgs) {
    const text = String(m.message || '').replace(new RegExp(MARK, 'g'), '').trim();
    if (!text) continue;
    const role = m.direction === 'incoming' ? 'user' : 'assistant';
    if (!out.length && role !== 'user') continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += `\n${text.slice(0, 1500)}`;
    else out.push({ role, content: text.slice(0, 1500) });
  }
  while (out.length && out[out.length - 1].role !== 'user') out.pop();
  return out;
}

/** ¿Gabi escribió a mano en este chat hace poco? (mensajes salientes sin la marca de Xenia) */
export function humanRecently(msgs, now = Date.now()) {
  return msgs.some((m) => {
    if (m.direction === 'incoming') return false;
    const at = Date.parse(m.createdAt || '') || 0;
    if (now - at > QUIET_HOURS * 3600 * 1000) return false;
    // Lo que manda Xenia por la API: por la marca invisible o, si WhatsApp la sacara, por cómo se envió
    if (m.sentVia && /api|zernio|automation/i.test(String(m.sentVia))) return false;
    const text = String(m.message || '');
    return !text.endsWith(MARK);
  });
}

async function verify(raw, signature, secret) {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.toLowerCase().charCodeAt(i);
  return diff === 0;
}

async function zernio(env, path, init = {}) {
  return fetch(`${ZERNIO}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${env.ZERNIO_API_KEY}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
}

async function send(env, accountId, conversationId, text) {
  await zernio(env, `/inbox/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ accountId, message: `${text}${MARK}` }),
  });
}

async function handle(env, event) {
  const accountId = event?.account?.accountId || event?.account?.id;
  const conversationId = event?.conversation?.id;
  const incoming = String(event?.message?.text || '').trim();
  if (!accountId || !conversationId) return;

  // Últimos mensajes del chat (para el contexto y para saber si Gabi está atendiendo)
  let history = [];
  try {
    const r = await zernio(env, `/inbox/conversations/${encodeURIComponent(conversationId)}/messages?accountId=${encodeURIComponent(accountId)}&limit=20&sortOrder=desc`);
    if (r.ok) history = ((await r.json()).messages || []).slice().reverse();
  } catch {}
  if (humanRecently(history)) return;

  if (!incoming) {
    await send(env, accountId, conversationId, 'Por ahora leo solo mensajes escritos. Si me escribís tu consulta, te respondo enseguida 😊');
    return;
  }

  // El mensaje nuevo puede no estar todavía en el historial: se suma si falta
  const messages = toClaudeMessages(history);
  const last = messages[messages.length - 1];
  if (!last) messages.push({ role: 'user', content: incoming.slice(0, 1500) });
  else if (!last.content.includes(incoming.slice(0, 200))) last.content += `\n${incoming.slice(0, 1500)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 800, thinking: { type: 'disabled' }, system: buildSalesPrompt(), messages }),
  });
  if (!res.ok) return; // sin respuesta: el mensaje queda para Gabi en el celular
  const data = await res.json();
  let reply = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '*$1*') // negrita de WhatsApp
    .replace(/^#+\s*/gm, '')
    .trim();
  if (!reply) return;
  await send(env, accountId, conversationId, reply.slice(0, 3500));
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.ZERNIO_API_KEY || !env.ZERNIO_WEBHOOK_SECRET || !env.ANTHROPIC_API_KEY) return new Response('Xenia en WhatsApp no está configurada', { status: 503 });
  const raw = await request.text();
  const signature = request.headers.get('x-zernio-signature') || request.headers.get('x-late-signature') || '';
  if (!(await verify(raw, signature, env.ZERNIO_WEBHOOK_SECRET))) return new Response('Firma inválida', { status: 401 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Pedido inválido', { status: 400 });
  }
  if (event?.event !== 'message.received' || event?.test) return ok();
  const platform = String(event?.account?.platform || event?.conversation?.platform || 'whatsapp').toLowerCase();
  if (!platform.includes('whatsapp')) return ok();

  waitUntil(handle(env, event).catch(() => {}));
  return ok();
}
