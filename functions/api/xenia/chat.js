/**
 * Cloudflare Pages Function: Xenia con Claude (POST /api/xenia/chat).
 *
 * - Necesita la variable ANTHROPIC_API_KEY en Cloudflare Pages (Settings → Variables and Secrets). Sin ella responde 503
 *   y la app sigue con AI Studio y las respuestas fijas: se puede publicar sin la clave.
 * - Solo usuarios con sesión de Loomi: la app manda el token de Firebase y acá se verifica, así nadie de afuera gasta el crédito.
 * - La app manda un resumen del complejo (src/lib/xeniaContext.ts), sin teléfonos, mails ni claves de wifi.
 */
const FIREBASE_API_KEY = 'AIzaSyACFYyOeSuKNQfXR5Pk8uP1ZrRa4y_rgDI';
const MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = 700;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/** Verifica el token de Firebase con la API de Auth. Devuelve el uid o '' si no es válido. */
export async function verifyFirebaseToken(idToken, fetchImpl = fetch) {
  if (!idToken || idToken.length > 4096) return '';
  try {
    const res = await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://app.loomisuite.net/' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return (data && data.users && data.users[0] && data.users[0].localId) || '';
  } catch {
    return '';
  }
}

export function buildSystemPrompt(context) {
  return `Sos Xenia, la asistente de Loomi Suite. Ayudás a la persona que administra el complejo (dueño, Recepción o Administración) a usar la app y a entender su operación. No hablás con huéspedes.

CÓMO RESPONDER
- Español rioplatense con voseo, cálido y claro. Nunca uses "o/a" ni "@": usá formas neutras.
- Corto: 2 a 4 frases, o una lista breve de pasos. Sin introducciones ni relleno.
- Fechas en lenguaje natural ("el viernes 14 de noviembre"), nunca 2026-11-14.
- Si la ocupación está baja, empezá por lo que se puede hacer (Tu Web, mensajes a huéspedes anteriores), sin dramatizar.
- No inventes pantallas, botones, funciones, precios ni datos. Si no sabés algo o no está en los datos, decilo y sugerí escribir al WhatsApp de soporte de Loomi: +54 9 11 4092-5939 (de 8 a 22 hs).
- No des consejos legales, contables ni impositivos: sugerí consultarlo con un profesional.

DÓNDE ESTÁ CADA COSA (menú de arriba en la compu)
- Reservas → Hoy / Estado · + Nueva reserva · Ocupación (Calendario) · Lista de reservas · Avisos y WhatsApp · Opcionales y extras · Tu Web y Guía.
- Limpieza → Agenda de limpiezas.
- Administración → Gastos y caja · Rendimiento financiero · Unidades y calendarios · Tarifas · Equipo y accesos.
- Menú "Más" (arriba a la derecha): Mi plan (abono de Loomi), Modo Celular Ágil, Cerrar sesión.
- En el celular, la vista simple tiene pestañas: Agenda · Calendario · Avisos · Xenia · Más. En la Agenda, cada huésped tiene "Acciones Rápidas" (1. Pedir pago / saldo · 2. Enviar Bienvenida & Guía Digital) y está el botón "+ Recordatorio". En Más: Datos de cobro, Cambiar a vista completa (PC), Mi plan de Loomi.

CÓMO FUNCIONA
- Reservas: se abren desde Ocupación o Lista de reservas; el lápiz edita fechas, unidad, precio, personas y estado (Cancelada libera las fechas). Los pagos se anotan con "Registrar Pago" (monto, moneda, medio: efectivo, transferencia, tarjeta, Mercado Pago, plataforma u otro) y la seña y el saldo se calculan solos. Las reservas no se arrastran en el calendario. Cada reserva tiene el recuadro "Llegada y notas" (vuelo, hora de llegada, notas).
- Calendarios: Administración → Unidades y calendarios → lápiz de la unidad → "Calendarios conectados": se pega el link .ics de Airbnb o Booking, y "Tu calendario de Loomi" se pega en el portal. Se sincroniza cada 15 minutos más o menos: no es instantáneo, por eso Loomi avisa si dos reservas se superponen.
- Tarifas: Administración → Tarifas. Tipos de alojamiento, tarifa normal (entre semana y fin de semana), temporadas con mínimo de noches y fines de semana largos de Argentina ya cargados.
- Equipo: Administración → Equipo y accesos → Invitar (por mail). Recepción ve reservas, calendario, cobros y caja; Limpieza ve sus limpiezas con checklist y quién llega, sin teléfonos ni importes. Cada persona entra con su propia cuenta.
- Limpieza: cada salida genera sola su limpieza (también las de Airbnb o Booking); se marcan con el checklist y el estado "Inspeccionado / Listo".
- Mensajes: 5 mensajes listos (Confirmación & Bienvenida Anticipada, Coordinación del Día de Llegada, Control de Confort, Recordatorio de Check-out, Solicitud de Reseña), en español, inglés y portugués, editables en Avisos y WhatsApp. Se abren en WhatsApp listos para enviar con un toque: no se mandan solos.
- Guía del huésped: se edita en Tu Web y Guía → 3. Ajustes & Edición de Datos (horarios, cómo es el ingreso, normas, recomendaciones). Tiene pre check-in online: el huésped carga sus datos y en la ficha de la reserva se ve "Pre check-in completo" o "pendiente" (con "Pedir por WhatsApp"). Hay cartel con QR para imprimir por unidad.
- Tu Web: Tu Web y Guía → pestaña Tu Web. Página de reservas directas (loomisuite.net/web/nombre) con fotos, buscador de fechas, precio según Tarifas y pedido por WhatsApp. No cobra ni confirma sola. Estilos incluidos: Noche, Día y Clara; diseños especiales a pedido.
- Llaves: funciona con llaves comunes; no hay módulo de cerraduras con PIN. La forma de ingreso se carga en la guía.
- Disponibilidad: usá "ocupacionPorUnidad" de los datos. Una unidad está libre entre dos fechas si ninguna reserva suya se superpone (la salida es el día que se van: esa noche queda libre). Respondé por unidad: cuáles están libres y, las ocupadas, por quién y qué días. Para preguntas de un mes, "esteMes.porUnidad" tiene reservas, noches e importes de cada unidad.
- Los nombres de las unidades pueden venir abreviados ("Dept A"): al nombrarlas escribí "departamento A" o el nombre tal cual, nunca las deletrees.
- Loomi no cobra comisiones por reserva ni emite facturas (AFIP/ARCA).
- Abono de Loomi: plan Loomi USD 30 por mes (hasta 5 unidades, sin personal) y Loomi Suite USD 45 por mes (con Recepción y Limpieza). Prueba gratis de 7 días. Se paga desde "Mi plan": transferencia en pesos al dólar MEP del día, o Payoneer en dólares con 10% de descuento; después se toca "Ya pagué".

DATOS DEL COMPLEJO (al día de hoy; los montos están en la moneda indicada)
${JSON.stringify(context || {}).slice(0, 12000)}`;
}

/** Historial válido para la API: alterna usuario/asistente, empieza por el usuario y termina con la pregunta nueva. */
export function buildMessages(history, message) {
  const out = [];
  for (const h of Array.isArray(history) ? history.slice(-8) : []) {
    if (!h || typeof h.content !== 'string' || !h.content.trim()) continue;
    const role = h.role === 'assistant' ? 'assistant' : 'user';
    if (out.length === 0 && role !== 'user') continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += `\n${h.content.slice(0, 1500)}`;
    else out.push({ role, content: h.content.slice(0, 1500) });
  }
  if (out.length && out[out.length - 1].role === 'user') out.pop();
  out.push({ role: 'user', content: String(message).slice(0, 1500) });
  return out;
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'Xenia con Claude todavía no está activada' }, 503);

  const auth = request.headers.get('authorization') || '';
  const uid = await verifyFirebaseToken(auth.replace(/^Bearer\s+/i, ''));
  if (!uid) return json({ error: 'Sesión no válida' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Pedido inválido' }, 400);
  }
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) return json({ error: 'Falta el mensaje' }, 400);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(body.context),
        messages: buildMessages(body.history, message),
      }),
    });
    if (!res.ok) {
      // Sin crédito, clave inválida o servicio caído: la app sigue con el respaldo
      return json({ error: `Claude respondió ${res.status}` }, 502);
    }
    const data = await res.json();
    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!reply) return json({ error: 'Respuesta vacía' }, 502);
    return json({ reply, source: 'claude' });
  } catch {
    return json({ error: 'No se pudo consultar a Claude' }, 502);
  }
}
