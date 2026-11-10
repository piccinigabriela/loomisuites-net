/**
 * Cloudflare Pages Function: Xenia en el WhatsApp de Loomi (POST /api/whatsapp/zernio).
 *
 * Zernio manda cada mensaje que llega al número de Loomi (coexistencia: la app sigue andando en el celular de Gabi).
 * Esta función responde 200 enseguida (Zernio exige respuesta en menos de 5 s) y en segundo plano:
 *   1. trae los últimos mensajes del chat,
 *   2. si Gabi escribió en ese chat en las últimas 12 horas, o si el chat lo empezó ella (proveedores, contactos suyos), no contesta,
 *   3. si es un audio o una imagen sin texto, pide que escriban,
 *   4. si no, le pide la respuesta a Claude con la información de Loomi y la manda por Zernio.
 *
 * Encuesta por charla (10/11): si el chat lo empezó Gabi con el mensaje de la encuesta sin TACC (plantilla del CRM, "relevando… celíacos"),
 * Xenia sigue la charla: una pregunta por mensaje, entiende respuestas con palabras y guarda lo que contestan en el CRM de prospectos
 * (Supabase, función crm_xenia_encuesta, por teléfono). Si Gabi escribe a mano en ese chat, si preguntan otra cosa (<<EQUIPO>>)
 * o cuando termina (<<FIN>>), Xenia deja de contestar en ese chat (marca invisible END en su último mensaje).
 *
 * Variables en Cloudflare Pages (Secrets): ANTHROPIC_API_KEY, ZERNIO_API_KEY, ZERNIO_WEBHOOK_SECRET y CRM_XENIA_SECRET
 * (clave para guardar la encuesta en el CRM; sin ella la charla sigue igual pero no se guarda).
 * Para apagar a Xenia sin tocar código: desactivar el webhook en Zernio (Webhooks).
 */
const ZERNIO = 'https://zernio.com/api/v1';
const MODEL = 'claude-haiku-5-5';
const QUIET_HOURS = 12;
// Marca invisible al final de lo que manda Xenia: así se distingue de lo que escribe Gabi desde la app
const MARK = '​';
// Marca invisible de "Xenia ya no sigue en este chat" (encuesta terminada o pasada al equipo); va antes de MARK
const END = '⁠';
// CRM de prospectos (Supabase de CheckInn). La clave publicable es pública; lo que protege es CRM_XENIA_SECRET.
const CRM_URL = 'https://vnfgitgadadjjjciftsa.supabase.co';
const CRM_KEY = 'sb_publishable_IKbP0ieyJfrtdguY39N7wg_RMjN_CxH';

const ok = () => new Response('ok', { status: 200 });

export function buildSalesPrompt(now = new Date()) {
  const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeZone: 'America/Argentina/Buenos_Aires' }).format(now);
  return `Sos Xenia, la asistente de Loomi Suite, y contestás el WhatsApp de Loomi. Te escriben dueños y encargados de alojamientos (cabañas, departamentos, complejos chicos, posadas) que quieren saber de Loomi. Hoy es ${fecha}.

CÓMO RESPONDER
- Español rioplatense con voseo, cálido, claro y breve: 1 a 4 frases, como en WhatsApp. Si te escriben en inglés o portugués, respondé en ese idioma.
- Sin títulos ni listas largas. Como mucho, una lista corta si piden pasos.
- Nunca uses "o/a" ni "@".
- Los links copialos exactamente como están en LINKS, letra por letra.
- No inventes funciones, precios ni fechas. Si no sabés algo, decí que le pasás la consulta al equipo de Loomi, que responde por este mismo chat.
- Si quieren contratar, pagar, piden una llamada, tienen un problema con su cuenta o algo delicado: decí que el equipo de Loomi les escribe en breve por este mismo chat.
- No nombres a ninguna persona del equipo. Si te preguntan con quién hablan o piden un nombre, la persona de Loomi es María.
- Sos una asistente con inteligencia artificial: si te preguntan, decilo con naturalidad.
- Contestá solo a posibles clientes. Si el mensaje es de una empresa que ofrece sus servicios, un proveedor, publicidad, un mensaje automático o un bot (por ejemplo, novedades de un software, ofertas, encuestas), respondé exactamente <<SILENCIO>> y nada más: lo ve el equipo de Loomi.

QUÉ ES LOOMI
Sistema de gestión para alojamientos chicos (de 4 a 20 unidades), hecho en Argentina, con 30 años de experiencia en hotelería detrás. Se usa desde el celular o la compu.
- Calendario de reservas y ocupación. Se conecta con Airbnb y Booking por calendario iCal: se sincroniza cada 15 minutos más o menos (no es instantáneo) y avisa si dos reservas se superponen.
- Cobros: seña, saldo, caja y rendimiento por unidad y por mes. No emite facturas, pero en cada reserva deja los datos para facturar listos para copiar y pegar en el facturador de ARCA o el que usen.
- Tarifas por temporada, fin de semana y fines de semana largos de Argentina ya cargados.
- Limpieza: cada salida genera su limpieza con el checklist que arma el dueño (tareas generales y tareas propias de cada unidad); el personal de limpieza entra con su cuenta y ve solo lo suyo (sin teléfonos ni importes). Notas de ida y vuelta.
- Recepción con su propia cuenta (reservas, calendario, cobros).
- Guía digital para el huésped con pre check-in online y cartel con QR por unidad.
- 5 mensajes de WhatsApp listos (confirmación, día de llegada, control de confort, check-out, reseña) en español, inglés y portugués: se abren listos y se envían con un toque, no salen solos.
- Tu Web: página de reservas directas (loomisuite.net/web/nombre-del-lugar) con fotos, buscador de fechas, precio según las tarifas y pedido por WhatsApp; también puede mostrar experiencias (excursiones, catas, cabalgatas). No cobra ni confirma sola: el anfitrión confirma. Puede pedir una seña (el porcentaje lo elige el anfitrión): la web la avisa y el huésped la transfiere cuando el anfitrión le confirma. Se le puede poner un descuento por reservar directo (el dueño elige el porcentaje). El huésped acepta las condiciones de la reserva (cancelación, seña, mascotas) antes de pedir. Lleva el logo del lugar. Sin comisiones.
- Xenia dentro de la app: responde dudas de uso y datos del complejo.
- Xenia para huéspedes (se activa si el anfitrión quiere): responde a los huéspedes en la guía y en Tu Web, en español, inglés y portugués, solo con lo que el anfitrión cargó; pagos, cambios de reserva y lo que no sabe se lo pasa al anfitrión por WhatsApp. Incluye 1.000 conversaciones por mes; si necesitan más, 1.000 extra cuestan USD 10 por mes, solo si las piden.
- Funciona con llaves comunes. Si la puerta tiene cerradura con teclado, cada reserva lleva su código y va en el mensaje de bienvenida (el código se carga a mano en la cerradura; Loomi no se conecta con marcas de cerraduras).
- Pasar a Loomi: unidades y tarifas en unos 15 minutos; las reservas de Airbnb y Booking entran solas al pegar los links de calendario; las de Excel u otro sistema se importan desde un archivo; si prefieren, el equipo de Loomi se las carga sin costo. No hace falta capacitación: Xenia explica dentro de la app cómo hacer cada cosa.

PLANES Y PRECIOS (por mes, todo el complejo, sin comisiones por reserva)
- Loomi: USD 35. Todo Loomi, hasta 20 unidades, con Airbnb y Booking conectados por iCal (cada 15 minutos).
- Loomi Suite: USD 45 más USD 6 por unidad conectada (si en Airbnb y Booking el complejo figura como hotel, con tipos de habitación de varias unidades, puede salir USD 11 por todo el complejo: eso lo confirma el equipo). Todo Loomi con channel manager: conexión directa con Airbnb y Booking, reservas al instante. Está por salir; no prometas fecha.
- PROMO FIN DE AÑO: quien crea su cuenta antes del 31 de diciembre de 2026 paga Loomi USD 25 (en vez de 35) o Loomi Suite USD 35 (en vez de 45) por mes, para siempre. Mencionala cuando hablen de precios, sin presionar.
- Los dos planes incluyen las cuentas que necesite el equipo (recepción, limpieza, administración), sin costo por usuario.
- Prueba gratis de 7 días, sin tarjeta.
- Se paga por transferencia en pesos al dólar MEP del día, o por Payoneer en dólares con 10% de descuento.
- Diseños especiales para Tu Web: USD 70, pago único. Se ven funcionando en loomisuite.net/disenos.
- No hay channel manager instantáneo todavía (está en desarrollo); hoy la conexión con los portales es por iCal.

MIEDOS AL CAMBIAR DE SISTEMA (si aparecen, contestá con esto, corto y sin exagerar)
- "Es difícil de aprender": se configura en unos 15 minutos; Xenia explica cada cosa dentro de la app; no hace falta capacitación.
- "Overbooking o reservas repetidas": si una reserva entra por dos lados, Loomi la junta en una sola; si dos se pisan, avisa en el calendario. Con iCal la sincronización es cada 15 minutos (no es instantánea): decilo si preguntan.
- "Los informes son rígidos": se elige el período y se bajan a Excel o se imprimen para la contadora o el dueño.
- "Después todo se cobra aparte": todo incluido, sin costo por usuario ni comisión por reserva; lo único aparte es el channel manager por unidad y los diseños especiales de Tu Web.
No nombres a otros sistemas ni hables mal de ellos.

LINKS
- La demo, directo y sin registrarse (datos de ejemplo): loomisuite.net/demo. En la demo no se ve la sincronización con Airbnb y Booking (ni por iCal ni con channel manager) porque no hay calendarios reales conectados; para probarla con sus propios calendarios está la prueba gratis de 7 días. Aclaralo si preguntan.
- Video de 4 minutos de cómo funciona: youtu.be/PcUY4rkpnkc
- Página de Loomi: loomisuite.net
- Todo lo que hace Loomi, en una página: loomisuite.net/funciones
- Crear la cuenta y empezar la prueba: app.loomisuite.net
- Diseños de Tu Web: loomisuite.net/disenos
- Manuales gratis para anfitriones (hospitalidad, fotografía y "Sin gluten, sin lactosa"): loomisuite.net/manual. El de sin gluten y sin lactosa, directo: loomisuite.net/manual?m=sintacc

PEDIDO DE LA DEMO
Muchos escriben por un reel donde Xenia dice que está mandando la demo. Si piden la demo, escriben "DEMO", "no me llegó" o "pasame la demo": mandá enseguida el link de la demo y el del video, en un mensaje corto y cálido (por ejemplo: "¡Acá la tenés! Entrá a loomisuite.net/demo y probala con datos de ejemplo, sin registrarte. Si querés verla en 4 minutos: youtu.be/PcUY4rkpnkc"). Después preguntá cuántas unidades tienen, para orientarlos.

Cuando tenga sentido, invitá a probar la demo o a crear la cuenta de prueba. No presiones.`;
}

/** Historial de WhatsApp → mensajes para Claude (alternando, empezando por el usuario) */
export function toClaudeMessages(msgs) {
  const out = [];
  for (const m of msgs) {
    const text = String(m.message || '').replace(new RegExp(`[${MARK}${END}]`, 'g'), '').trim();
    if (!text) continue;
    const role = m.direction === 'incoming' ? 'user' : 'assistant';
    if (!out.length && role !== 'user') continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += `\n${text.slice(0, 1500)}`;
    else out.push({ role, content: text.slice(0, 1500) });
  }
  while (out.length && out[out.length - 1].role !== 'user') out.pop();
  return out;
}

const isHuman = (m) => {
  if (m.direction === 'incoming') return false;
  if (m.sentVia && /api|zernio|automation/i.test(String(m.sentVia))) return false;
  return !String(m.message || '').endsWith(MARK);
};

/** ¿El chat lo empezó Gabi a mano? (6/11: escribió a Aiosell desde este número y Xenia le contestó al bot de ellos) */
export function startedByHuman(msgs) {
  const first = msgs.find((m) => String(m.message || '').trim());
  return Boolean(first && isHuman(first));
}

/** El primer mensaje de la encuesta sin TACC (plantilla del CRM): "relevando/relevamiento … celíacos" */
export const isSurveyOpener = (text) => /relev(ando|amiento)/i.test(String(text || '')) && /cel[ií]ac/i.test(String(text || ''));

/**
 * Estado de la encuesta por charla en este chat. Cuenta desde el ÚLTIMO mensaje de encuesta que mandó Gabi a mano
 * (10/11: con un número que ya había chateado antes con Loomi, el primer mensaje del historial no era la encuesta y Xenia no seguía).
 */
export function surveyState(msgs) {
  const list = msgs.filter((m) => String(m.message || '').trim());
  let idx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (isHuman(list[i]) && isSurveyOpener(list[i].message)) {
      idx = i;
      break;
    }
  }
  if (idx < 0) return { survey: false };
  const rest = list.slice(idx + 1);
  return {
    survey: true,
    opener: String(list[idx].message || '').replace(new RegExp(`[${MARK}${END}]`, 'g'), '').trim(),
    after: rest,
    takenOver: rest.some((m) => isHuman(m)),
    ended: rest.some((m) => m.direction !== 'incoming' && String(m.message || '').includes(END)),
  };
}

export function buildSurveyPrompt(opener) {
  return `Sos Xenia, del equipo de Loomi Suite. Estás haciendo por WhatsApp un relevamiento corto de alojamientos aptos para celíacos e intolerantes a la lactosa. El primer mensaje ya lo mandó el equipo: "${String(opener || '').slice(0, 600)}". Ahora seguís vos la charla.

CÓMO
- Una sola pregunta por mensaje, corta y cálida, en español rioplatense con voseo (o en el idioma en que te escriban). Una o dos frases, sin listas ni títulos.
- Antes de la pregunta, agradecé o comentá en pocas palabras lo que contestaron, sin exagerar.
- Aceptá respuestas con palabras ("envasados nomás", "a veces"). Si no queda claro, repreguntá una vez dando las opciones; si sigue sin quedar claro, pasá a la siguiente.
- Si ya contestaron algo en otro mensaje, no lo vuelvas a preguntar.
- Si contestan con el formato de números de la encuesta escrita (por ejemplo "1-1, 2-3, 3-2"), tomalo: el primer número es la pregunta y el segundo la opción, con la numeración de abajo (la pregunta 6 es la de la guía, la 7 cómo se enteran y la 8 el sistema).
- No vendas ni hables de Loomi. Si preguntan qué es Loomi, piden precios o una demo, o la charla se va a otro tema: respondé en una frase que el equipo de Loomi les escribe por este mismo chat y agregá <<EQUIPO>>. Desde ahí no seguís.
- No nombres a ninguna persona. Si preguntan con quién hablan, sos Xenia, la asistente con inteligencia artificial de Loomi Suite.
- Si dicen que no quieren contestar o se molestan: agradecé con amabilidad, despedite y poné <<FIN>>.
- Si el mensaje es una bienvenida o respuesta automática (por ejemplo "Gracias por comunicarse con Cabañas…, nuestro horario de atención es…, en breve le respondemos"), aunque traiga datos del alojamiento, respondé exactamente <<SILENCIO>>: se espera a que conteste una persona.

PREGUNTAS (en este orden; entre corchetes el código y las opciones)
[p1] ¿Ofrecen desayuno? 1 sí, incluido · 2 sí, con cargo · 3 no, pero hay cocina equipada · 4 no
  Si p1 es 3 o 4 (no sirven comida): preguntá solo [p8] y terminá.
[p2] ¿Tienen opciones sin TACC? 1 no · 2 productos envasados · 3 los preparan en la cocina, con cuidados · 4 cocina 100 % sin gluten
[p3] ¿Y sin lactosa? 1 no · 2 a pedido · 3 siempre
[p4] ¿Se los piden los huéspedes? 1 nunca · 2 a veces · 3 seguido
[p5] ¿Lo cuentan en su web o en sus avisos? 1 sí · 2 no
[p7] ¿Cómo se enteran de que un huésped es celíaco o intolerante? 1 recién cuando llega · 2 les avisa por mensaje · 3 lo pregunta su sistema de reservas antes de llegar (pre check-in)
[p8] ¿Llevan las reservas con algún sistema, o con cuaderno, Excel o el calendario de Airbnb o Booking? 1 sin sistema · 2 con un sistema de gestión
[p6] (solo si sirven comida) ¿Les gustaría aparecer gratis en una guía de alojamientos aptos para celíacos e intolerantes a la lactosa? 1 sí · 2 no

AL TERMINAR
Agradecé y mandá el regalo, copiando el link letra por letra: si sirven comida, el manual "Sin gluten, sin lactosa": loomisuite.net/manual?m=sintacc ; si no, el manual de hospitalidad: loomisuite.net/manual. Después poné <<FIN>>.

DATOS (obligatorio)
Al final de cada respuesta, en una línea aparte, agregá <<DATOS:{...}>> con todas las respuestas que tengas hasta ahora, como números (por ejemplo {"p1":1,"p2":2}), y "resumen": una frase con lo importante que dijeron, con sus palabras (por ejemplo el nombre del sistema que usan). Esa línea no la ve el alojamiento.`;
}

/**
 * ¿Es la bienvenida automática de WhatsApp Business del alojamiento? (10/11: "Gracias por comunicarse con Cabañas…
 * Nuestro horario de atención es… En breve le respondemos"). A eso no se contesta: se espera a que escriba una persona.
 */
export function isAutoReply(text) {
  const t = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const signs = [
    /gracias por (comunicarse|comunicarte|contactarse|contactarte|contactarnos|escribirnos|tu mensaje|su mensaje|su consulta|tu consulta)/,
    /(en breve|a la brevedad|lo antes posible|pronto) (le |te )?(respond|contest|comunic)/,
    /(le|te) (respondemos|responderemos|contestamos|contestaremos)/,
    /horario de atencion/,
    /mensaje automatico|respuesta automatica/,
    /(no estamos disponibles|fuera de horario|estamos fuera)/,
    /thanks for (contacting|reaching|your message)|we will (get back|reply|respond)/,
  ];
  // Dos señales juntas (o una y "automático"): una persona que contesta la encuesta casi nunca escribe así
  const n = signs.filter((r) => r.test(t)).length;
  return n >= 2 || (n >= 1 && /automatic/.test(t));
}

/** Saca de la respuesta de Claude las marcas de la encuesta */
export function parseSurveyReply(text) {
  let t = String(text || '');
  let data = null;
  const m = /<<\s*DATOS\s*:\s*(\{[\s\S]*?\})\s*>>/i.exec(t);
  if (m) {
    try {
      data = JSON.parse(m[1]);
    } catch {
      data = null;
    }
    t = t.replace(m[0], '');
  }
  const done = /<<\s*FIN\s*>>/i.test(t);
  const handoff = /<<\s*EQUIPO\s*>>/i.test(t);
  const silent = /<<\s*SILENCIO\s*>>/i.test(t);
  t = t.replace(/<<\s*(FIN|EQUIPO|SILENCIO)\s*>>/gi, '').replace(/<<[^>]*>>/g, '').trim();
  const answers = {};
  let summary = '';
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      if (/^p[1-8]$/.test(k) && Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 4) answers[k] = Number(v);
    }
    summary = String(data.resumen || data.summary || '').slice(0, 600);
  }
  return { text: t, answers, summary, done, handoff, silent };
}

/** Teléfono de quien escribe (Zernio: message.sender.phoneNumber; si no, lo que haya) */
export function senderPhone(event) {
  const s = event?.message?.sender || {};
  const cands = [s.phoneNumber, s.id, event?.conversation?.participantId, event?.conversation?.participantPhone, event?.contact?.phone];
  for (const c of cands) {
    const d = String(c || '').replace(/\D/g, '');
    if (d.length >= 8) return d;
  }
  return '';
}

async function saveSurvey(env, event, parsed) {
  if (!env.CRM_XENIA_SECRET) return;
  const phone = senderPhone(event);
  if (!phone || (!Object.keys(parsed.answers).length && !parsed.done)) return;
  try {
    await fetch(`${CRM_URL}/rest/v1/rpc/crm_xenia_encuesta`, {
      method: 'POST',
      headers: { apikey: CRM_KEY, authorization: `Bearer ${CRM_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        p_secret: env.CRM_XENIA_SECRET,
        p_phone: phone,
        p_name: String(event?.message?.sender?.name || '').slice(0, 120) || null,
        p_answers: parsed.answers,
        p_done: parsed.done,
        p_summary: parsed.summary || '',
      }),
    });
  } catch {}
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
    const r = await zernio(env, `/inbox/conversations/${encodeURIComponent(conversationId)}/messages?accountId=${encodeURIComponent(accountId)}&limit=40&sortOrder=desc`);
    if (r.ok) history = ((await r.json()).messages || []).slice().reverse();
  } catch {}
  const sv = surveyState(history);
  if (sv.survey) {
    // Encuesta por charla: la sigue Xenia salvo que Gabi haya escrito a mano después, la hayan pasado al equipo o ya terminó
    if (sv.takenOver || sv.ended) return;
    await handleSurvey(env, event, accountId, conversationId, incoming, sv.after, sv.opener);
    return;
  }
  if (humanRecently(history) || startedByHuman(history)) return;

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
    // Los links de Loomi, siempre bien escritos (el 1/11 salió "loomisuiye.net")
    .replace(/\bloomi\s?s[a-z]{2,7}\.n[a-z]{1,2}\b/gi, 'loomisuite.net')
    .trim();
  if (!reply || /<<\s*SILENCIO\s*>>/i.test(reply)) return; // proveedores, publicidad o bots: lo ve Gabi en el celular
  await send(env, accountId, conversationId, reply.slice(0, 3500));
}

async function handleSurvey(env, event, accountId, conversationId, incoming, history, opener) {
  if (isAutoReply(incoming)) return; // bienvenida automática del alojamiento: se espera a la persona
  if (!incoming) {
    await send(env, accountId, conversationId, '¡Gracias! Por ahora leo solo mensajes escritos: ¿me lo podés escribir? 😊');
    return;
  }
  const messages = toClaudeMessages(history);
  const last = messages[messages.length - 1];
  if (!last) messages.push({ role: 'user', content: incoming.slice(0, 1500) });
  else if (!last.content.includes(incoming.slice(0, 200))) last.content += `\n${incoming.slice(0, 1500)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, thinking: { type: 'disabled' }, system: buildSurveyPrompt(opener), messages }),
  });
  if (!res.ok) return; // sin respuesta: lo ve Gabi en el celular
  const data = await res.json();
  const raw = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const parsed = parseSurveyReply(raw);
  if (parsed.silent) return;
  await saveSurvey(env, event, parsed);
  let reply = parsed.text
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#+\s*/gm, '')
    .replace(/\bloomi\s?s[a-z]{2,7}\.n[a-z]{1,2}\b/gi, 'loomisuite.net')
    .trim();
  if (!reply) return;
  // Terminó o la pasó al equipo: la marca END hace que Xenia no siga en este chat
  if (parsed.done || parsed.handoff) reply += END;
  await send(env, accountId, conversationId, reply.slice(0, 1500));
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
