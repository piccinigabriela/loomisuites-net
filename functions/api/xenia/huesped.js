/**
 * Cloudflare Pages Function: Xenia para huéspedes (POST /api/xenia/huesped), en la guía y en Tu Web.
 *
 * - Necesita ANTHROPIC_API_KEY y FIREBASE_SERVICE_ACCOUNT (JSON de una cuenta de servicio con rol "Usuario de Cloud Datastore").
 *   Sin alguna de las dos responde 503 y el chat ofrece escribirle al anfitrión por WhatsApp.
 * - El navegador solo manda dónde está (guía o web), la pregunta y el historial. La información del alojamiento la lee el
 *   servidor de lo publicado (publicGuides / publicSites): así nadie puede usar esto como un chat libre.
 * - Solo responde si el anfitrión la activó (xeniaGuest: true en lo publicado).
 * - Topes: conversaciones por mes (1000, o subscriptions/{uid}.xeniaGuestLimit), conversaciones por día y mensajes por conversación.
 *   Uso en xeniaUsage/{uid}/months/{AAAA-MM} (lo lee el anfitrión en la app) y xeniaUsage/{uid}/convs/{id}.
 * - Pagos, cambios de reserva, problemas y lo que no sabe: lo pasa al anfitrión por WhatsApp con un resumen.
 */
import { commit, docName, getAccessToken, getDoc, incrementWrite, readServiceAccount, toValue } from '../../../functions-lib/firestoreAdmin.js';

const MODEL = 'claude-haiku-5-5';
export const MONTH_LIMIT = 1000;
export const DAY_LIMIT = 100;
export const CONV_LIMIT = 20;
const SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const UID = /^[A-Za-z0-9]{10,64}$/;
const CONV = /^[a-z0-9]{12,40}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/** Fecha de Argentina (UTC−3, sin horario de verano) */
export function argDate(now = Date.now()) {
  const d = new Date(now - 3 * 3600 * 1000);
  const iso = d.toISOString().slice(0, 10);
  return { iso, month: iso.slice(0, 7), dayKey: `d${iso.slice(8, 10)}` };
}

const clean = (s, max = 600) => (typeof s === 'string' ? s.trim().slice(0, max) : '');
const list = (a) => (Array.isArray(a) ? a : []);

/** Información de la guía que puede ver un huésped (sin datos de cobro). */
export function guideInfo(pg, unitId, { forWeb = false } = {}) {
  const g = (pg && pg.guide) || {};
  const unit = list(pg && pg.units).find((u) => u && u.id === unitId) || null;
  const info = {
    alojamiento: clean(pg?.complexName || g.propertyName, 120),
    frase: clean(g.tagline, 200),
    direccion: clean((unit && unit.address) || g.locationAddress, 200),
    mapa: clean(g.googleMapsUrl, 300),
    checkIn: clean(g.checkinHour, 40),
    checkOut: clean(g.checkoutHour, 40),
    pileta: clean(g.poolHours, 200),
    lena: clean(g.woodBagPrice, 100),
    aviso: clean(g.specialAnnouncement, 600),
    normas: list(g.rules).slice(0, 20).map((r) => `${clean(r?.title, 100)}: ${clean(r?.description, 400)}`),
    comoLlegar: list(g.transportation).slice(0, 10).map((t) => ({
      titulo: clean(t?.title, 100),
      detalle: clean(t?.description, 400),
      costo: clean(t?.estimatedCost, 60),
      telefono: clean(t?.contactPhone, 40),
    })),
    paseos: list(g.attractions).slice(0, 15).map((a) => ({
      nombre: clean(a?.title, 100),
      detalle: clean(a?.description, 400),
      consejos: clean(a?.tips, 300),
      entrada: clean(a?.ticketPrice, 60),
      minutos: Number(a?.distanceMinutes) || undefined,
    })),
    dondeComer: list(g.dining).slice(0, 15).map((d) => ({
      nombre: clean(d?.name, 100),
      especialidad: clean(d?.specialty, 200),
      precio: clean(d?.priceRange, 5),
      delivery: Boolean(d?.hasDelivery),
      direccion: clean(d?.address, 200),
      telefono: clean(d?.phone, 40),
    })),
  };
  // En la web no van el wifi ni cómo se ingresa (son para quien ya reservó)
  if (!forWeb) {
    info.unidad = clean(unit && unit.name, 80);
    info.wifiRed = clean((unit && unit.wifiNetwork) || g.wifiNetwork, 80);
    info.wifiClave = clean((unit && unit.wifiPassword) || g.wifiPassword, 80);
    info.comoIngresar = clean(g.arrivalInstructions, 800);
    info.comoIngresarEn = clean(g.arrivalInstructionsEn, 800);
  }
  return info;
}

/** Información de Tu Web (sin tarifas internas ni fechas ocupadas: para eso está el buscador). */
export function siteInfo(site) {
  return {
    alojamiento: clean(site.name, 120),
    frase: clean(site.tagline, 200),
    presentacion: clean(site.description, 1500),
    ciudad: clean(site.city, 80),
    direccion: clean(site.address, 200),
    mapa: clean(site.mapsUrl, 300),
    checkIn: clean(site.checkinHour, 40),
    checkOut: clean(site.checkoutHour, 40),
    moneda: clean(site.currency, 5),
    senaPorcentaje: Number(site.depositPercent) || 0,
    unidades: list(site.units).slice(0, 30).map((u) => ({
      nombre: clean(u?.name, 80),
      personas: Number(u?.maxGuests) || undefined,
      dormitorios: Number(u?.bedrooms) || undefined,
      banos: Number(u?.bathrooms) || undefined,
      descripcion: clean(u?.description, 600),
    })),
    experiencias: list(site.experiences).slice(0, 15).map((e) => ({
      nombre: clean(e?.name, 100),
      detalle: clean(e?.text, 600),
      precio: Number(e?.price) ? `${e.price} ${site.currency || ''} ${clean(e?.unitLabel, 40)}`.trim() : 'a consultar',
    })),
  };
}

export function buildGuestPrompt({ kind, info, extra, today }) {
  // Nunca un nombre propio: del otro lado puede haber una persona o un equipo
  const host = 'el alojamiento';
  const where =
    kind === 'web'
      ? 'la página web del alojamiento, donde la gente consulta fechas y pide su reserva'
      : 'la guía digital del alojamiento, que usan los huéspedes antes y durante su estadía';
  const webRules =
    kind === 'web'
      ? `- Precios y disponibilidad: no los confirmes ni calcules. Decí que elijan las fechas en el buscador de esta página, que muestra si está libre y cuánto sale, y que desde ahí mandan el pedido por WhatsApp. La reserva la confirma ${host}.
- Si hay seña (senaPorcentaje mayor a 0), se paga al confirmar; los datos para transferir los pasa ${host} por WhatsApp.`
      : `- Para reservar otras fechas, cambiar o cancelar una reserva, o cualquier pago: lo resuelve ${host}.`;
  return `Sos Xenia, la asistente virtual del alojamiento "${info.alojamiento || 'el alojamiento'}". Atendés a huéspedes y a personas interesadas en alojarse, desde ${where}. Hoy es ${today}.

CÓMO RESPONDER
- En el idioma en que te escriben: español rioplatense con voseo, inglés o portugués de Brasil.
- Corto y cálido: 1 a 3 frases. Texto simple, sin títulos, sin asteriscos ni negritas. Una lista corta solo si piden varias cosas.
- Usá solo la INFORMACIÓN DEL ALOJAMIENTO. Si algo no está ahí (horarios, precios, servicios, distancias, mascotas, estacionamiento, políticas), no lo inventes ni lo supongas: pasá la consulta al alojamiento.
${webRules}
- Pasale la consulta al alojamiento cuando: la respuesta no está en la información; es sobre pagos, seña, transferencias, reintegros, facturas, descuentos, cambios o cancelaciones; hay un problema en la unidad (algo roto, falta algo, limpieza, ruidos); o es un pedido especial (ingresar antes, salir más tarde, cuna, mascota).
  En esos casos, decí en una frase que eso lo resuelve ${host} y agregá al final, en una línea aparte y sin nada después:
  <<ANFITRION: la consulta resumida en una frase, en primera persona y en el idioma del huésped, como si la escribiera él>>
- Emergencias (salud, incendio, gas, inseguridad): que llame primero al número de emergencias (911 en Argentina; 107 emergencias médicas, 100 bomberos) y después avise al alojamiento, con la línea <<ANFITRION: ...>>.
- Nunca pidas ni des datos bancarios, de tarjetas ni documentos.
- No hables de Loomi ni de cómo funcionás. Si preguntan, sos una asistente automática del alojamiento.
- No nombres a ninguna persona del alojamiento: hablá siempre del alojamiento ("el alojamiento te responde por WhatsApp").
- Si piden algo que no tiene que ver con la estadía o el viaje (tareas, código, otros temas), decí con amabilidad que solo ayudás con eso.

INFORMACIÓN DEL ALOJAMIENTO
${JSON.stringify(info).slice(0, 14000)}${extra ? `\n\nMÁS INFORMACIÓN (de la guía)\n${JSON.stringify(extra).slice(0, 8000)}` : ''}`;
}

/** Historial válido: alterna, empieza por el huésped y termina con la pregunta nueva. */
export function buildMessages(history, message) {
  const out = [];
  for (const h of list(history).slice(-10)) {
    if (!h || typeof h.content !== 'string' || !h.content.trim()) continue;
    const role = h.role === 'assistant' ? 'assistant' : 'user';
    if (out.length === 0 && role !== 'user') continue;
    const content = h.content.slice(0, 800);
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += `\n${content}`;
    else out.push({ role, content });
  }
  if (out.length && out[out.length - 1].role === 'user') out.pop();
  out.push({ role: 'user', content: message });
  return out;
}

/** Separa la respuesta del pedido de pase al anfitrión */
export function splitHandoff(text) {
  const m = /<<\s*ANFITRI[OÓ]N\s*:?\s*([\s\S]*?)>>/i.exec(text || '');
  const reply = (text || '')
    .replace(/<<\s*ANFITRI[OÓ]N[\s\S]*?>>/gi, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .trim();
  return { reply, handoff: m ? m[1].trim().slice(0, 400) : '' };
}

const TODAY_FMT = (iso) => {
  try {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return iso;
  }
};

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Pedido inválido' }, 400);
  }
  const kind = body?.kind === 'web' ? 'web' : body?.kind === 'guia' ? 'guia' : '';
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const conv = typeof body?.conv === 'string' ? body.conv.trim().toLowerCase() : '';
  const message = clean(body?.message, 600);
  const unitId = clean(body?.unit, 80);
  if (!kind || !message || !CONV.test(conv) || !(kind === 'web' ? SLUG.test(id) : UID.test(id))) {
    return json({ error: 'Pedido inválido' }, 400);
  }

  const sa = readServiceAccount(env);
  if (!sa || !env.ANTHROPIC_API_KEY) return json({ error: 'Xenia no está disponible', unavailable: true }, 503);

  let token;
  try {
    token = await getAccessToken(sa);
  } catch {
    return json({ error: 'Xenia no está disponible', unavailable: true }, 503);
  }

  // 1. Qué alojamiento y si la activaron
  let uid = '';
  let info;
  let extra = null;
  try {
    if (kind === 'guia') {
      const pg = await getDoc(token, `publicGuides/${id}`);
      if (!pg || pg.xeniaGuest !== true) return json({ error: 'Xenia no está activada', off: true }, 403);
      uid = id;
      info = guideInfo(pg, unitId);
    } else {
      const [site, owner] = await Promise.all([getDoc(token, `publicSites/${id}`), getDoc(token, `siteOwners/${id}`)]);
      if (!site || !site.enabled || site.xeniaGuest !== true || !owner?.uid) return json({ error: 'Xenia no está activada', off: true }, 403);
      uid = owner.uid;
      info = siteInfo(site);
      const pg = await getDoc(token, `publicGuides/${uid}`).catch(() => null);
      if (pg) {
        const g = guideInfo(pg, '', { forWeb: true });
        extra = { normas: g.normas, pileta: g.pileta, lena: g.lena, comoLlegar: g.comoLlegar, paseos: g.paseos, dondeComer: g.dondeComer };
      }
    }
  } catch {
    return json({ error: 'Xenia no está disponible', unavailable: true }, 503);
  }

  // 2. Topes y conteo
  const { iso, month, dayKey } = argDate();
  const monthPath = `xeniaUsage/${uid}/months/${month}`;
  const convPath = `xeniaUsage/${uid}/convs/${conv}`;
  try {
    const [convDoc, monthDoc, sub] = await Promise.all([
      getDoc(token, convPath),
      getDoc(token, monthPath),
      getDoc(token, `subscriptions/${uid}`).catch(() => null),
    ]);
    if (convDoc) {
      if ((Number(convDoc.messages) || 0) >= CONV_LIMIT) return json({ limit: 'conv' });
      await commit(token, [incrementWrite(convPath, { messages: 1 }), incrementWrite(monthPath, { messages: 1 })]);
    } else {
      const monthLimit = Number(sub?.xeniaGuestLimit) > 0 ? Number(sub.xeniaGuestLimit) : MONTH_LIMIT;
      if ((Number(monthDoc?.conversations) || 0) >= monthLimit) return json({ limit: 'month' });
      if ((Number(monthDoc?.[dayKey]) || 0) >= DAY_LIMIT) return json({ limit: 'day' });
      const created = await commit(token, [
        {
          update: { name: docName(convPath), fields: { messages: toValue(1), month: toValue(month), kind: toValue(kind), day: toValue(iso) } },
          currentDocument: { exists: false },
        },
        incrementWrite(monthPath, { conversations: 1, messages: 1, [dayKey]: 1 }),
      ]);
      // Si justo se creó desde otra pestaña, se cuenta como mensaje de la misma conversación
      if (!created) await commit(token, [incrementWrite(convPath, { messages: 1 }), incrementWrite(monthPath, { messages: 1 })]);
    }
  } catch {
    return json({ error: 'Xenia no está disponible', unavailable: true }, 503);
  }

  // 3. Respuesta
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        thinking: { type: 'disabled' },
        system: buildGuestPrompt({ kind, info, extra, today: TODAY_FMT(iso) }),
        messages: buildMessages(body.history, message),
      }),
    });
    if (!res.ok) return json({ error: `Claude respondió ${res.status}`, unavailable: true }, 502);
    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const { reply, handoff } = splitHandoff(text);
    if (!reply && !handoff) return json({ error: 'Respuesta vacía', unavailable: true }, 502);
    if (handoff) await commit(token, [incrementWrite(monthPath, { handoffs: 1 })]).catch(() => {});
    return json({ reply, handoff });
  } catch {
    return json({ error: 'No se pudo responder', unavailable: true }, 502);
  }
}
