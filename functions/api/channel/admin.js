/**
 * Cloudflare Pages Function: el Panel de clientes conecta complejos al channel manager (POST /api/channel/admin).
 * Hace lo mismo que `npm run aiosell -- conectar|desconectar|precios` de server-sync, sin Cloud Shell.
 *
 * - Solo la administración: la app manda el token de Firebase y acá se verifica que sea la cuenta de administración
 *   con el mail verificado (la misma regla que isAdmin() en firestore.rules).
 * - Lee y escribe con la cuenta de servicio (FIREBASE_SERVICE_ACCOUNT): channelHotels/{hotelCode} no tiene reglas
 *   (nadie lo toca desde la app) y la administración no puede escribir tenants/{uid} por reglas.
 * - Acciones: get (estado de una cuenta), save (conectar o cambiar), disconnect.
 */
import { commit, docName, getAccessToken, getDoc, readServiceAccount, runQuery, toValue } from '../../../functions-lib/firestoreAdmin.js';

const FIREBASE_API_KEY = 'AIzaSyACFYyOeSuKNQfXR5Pk8uP1ZrRa4y_rgDI';
const ADMIN_EMAIL = 'piccini.gabriela@gmail.com';
const HOTEL = /^[A-Za-z0-9_.-]{1,80}$/;
const CODE = /^[A-Za-z0-9_.-]{1,80}$/;
const UID = /^[A-Za-z0-9]{10,64}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/** true si el token es de la cuenta de administración con el mail verificado */
export async function isAdminToken(idToken, fetchImpl = fetch) {
  if (!idToken || idToken.length > 4096) return false;
  try {
    const res = await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://app.loomisuite.net/' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return false;
    const u = ((await res.json()).users || [])[0];
    return !!u && u.emailVerified === true && String(u.email || '').toLowerCase() === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

const fieldsOf = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [k, toValue(v)]));

/** Normaliza lo que manda el Panel. Devuelve {ok, value} o {ok:false, error}. */
export function cleanSave(body, propertyIds) {
  const hotelCode = String(body.hotelCode || '').trim();
  if (!HOTEL.test(hotelCode)) return { ok: false, error: 'El código del hotel solo puede tener letras, números, guiones y puntos.' };
  const mode = body.mode === 'real' ? 'real' : 'prueba';
  const units = {};
  const seen = new Set();
  for (const [pid, u] of Object.entries(body.units || {})) {
    if (!propertyIds.has(pid) || !u) continue;
    const roomCode = String(u.roomCode || '').trim();
    if (!roomCode) continue;
    if (!CODE.test(roomCode)) return { ok: false, error: `Código de habitación inválido: ${roomCode}` };
    if (seen.has(roomCode)) return { ok: false, error: `La habitación ${roomCode} está en dos unidades.` };
    seen.add(roomCode);
    const rateplanCode = String(u.rateplanCode || '').trim();
    if (rateplanCode && !CODE.test(rateplanCode)) return { ok: false, error: `Código de tarifa inválido: ${rateplanCode}` };
    units[pid] = { roomCode, enabled: u.enabled !== false, ...(rateplanCode ? { rateplanCode } : {}) };
  }
  if (!Object.keys(units).length) return { ok: false, error: 'Poné el código de habitación de Aiosell en al menos una unidad.' };
  const percent = Math.max(-50, Math.min(100, Number(body.rates?.percent) || 0));
  return { ok: true, value: { hotelCode, mode, units, rates: { send: body.rates?.send === true, percent } } };
}

export async function handleAdmin(action, body, { token, fetchImpl = fetch, nowIso = new Date().toISOString() }) {
  const uid = String(body.uid || '');
  if (!UID.test(uid)) return { status: 400, body: { error: 'Cuenta inválida' } };
  const tenantPath = `tenants/${uid}`;
  const tenant = await getDoc(token, tenantPath, fetchImpl, ['channelManager', 'complexName']);
  if (!tenant) return { status: 404, body: { error: 'No existe esa cuenta' } };
  const cm = tenant.channelManager || null;

  if (action === 'get') {
    const [props, log, sync, hotel] = await Promise.all([
      runQuery(token, tenantPath, 'properties', [], fetchImpl, 100),
      runQuery(token, tenantPath, 'channelLog', [], fetchImpl, 10, { field: 'at', desc: true }),
      getDoc(token, `${tenantPath}/sync/aiosell`, fetchImpl),
      cm && cm.hotelCode && HOTEL.test(cm.hotelCode) ? getDoc(token, `channelHotels/${cm.hotelCode}`, fetchImpl) : null,
    ]);
    return {
      status: 200,
      body: {
        channelManager: cm,
        hotel: hotel && hotel.uid === uid ? { mode: hotel.mode === 'real' ? 'real' : 'prueba' } : null,
        units: props
          .map((p) => ({ id: p.id, name: String(p.name || p.id) }))
          .sort((a, b) => a.name.localeCompare(b.name, 'es')),
        log: log.map((l) => ({ at: l.at, mode: l.mode, action: l.action, channel: l.channel || '', bookingId: l.bookingId, summary: l.summary || [] })),
        sync: sync ? { lastAt: sync.lastAt || '', lastAction: sync.lastAction || '', lastSendAt: sync.lastSendAt || '', lastSendError: sync.lastSendError || '' } : null,
      },
    };
  }

  if (action === 'save') {
    const props = await runQuery(token, tenantPath, 'properties', [], fetchImpl, 100);
    const c = cleanSave(body, new Set(props.map((p) => p.id)));
    if (!c.ok) return { status: 400, body: { error: c.error } };
    const v = c.value;
    const other = await getDoc(token, `channelHotels/${v.hotelCode}`, fetchImpl);
    if (other && other.uid && other.uid !== uid) return { status: 409, body: { error: `El hotel ${v.hotelCode} ya está conectado a otra cuenta.` } };
    if (v.mode === 'real' && /sandbox/i.test(v.hotelCode)) {
      const res = await runQuery(token, tenantPath, 'reservations', [], fetchImpl, 21);
      if (res.length > 20) {
        return { status: 400, body: { error: 'Esta cuenta tiene más de 20 reservas: parece real. El hotel de prueba de Aiosell manda reservas inventadas; usá modo prueba o una cuenta de prueba.' } };
      }
    }
    const writes = [];
    if (cm && cm.hotelCode && cm.hotelCode !== v.hotelCode && HOTEL.test(cm.hotelCode)) {
      const old = await getDoc(token, `channelHotels/${cm.hotelCode}`, fetchImpl);
      if (old && old.uid === uid) writes.push({ delete: docName(`channelHotels/${cm.hotelCode}`) });
    }
    writes.push({
      update: { name: docName(`channelHotels/${v.hotelCode}`), fields: fieldsOf({ uid, mode: v.mode, provider: 'aiosell', updatedAt: nowIso }) },
    });
    const channelManager = {
      enabled: true,
      provider: 'aiosell',
      hotelCode: v.hotelCode,
      since: (cm && cm.hotelCode === v.hotelCode && cm.since) || nowIso,
      units: v.units,
      rates: v.rates,
    };
    writes.push({
      update: { name: docName(tenantPath), fields: fieldsOf({ channelManager }) },
      updateMask: { fieldPaths: ['channelManager'] },
      currentDocument: { exists: true },
    });
    if (!(await commit(token, writes, fetchImpl))) return { status: 409, body: { error: 'Algo cambió mientras guardabas. Probá de nuevo.' } };
    return { status: 200, body: { ok: true, message: v.mode === 'real' ? 'Conectado en modo real.' : 'Conectado en modo prueba: solo registra lo que haría.' } };
  }

  if (action === 'disconnect') {
    if (!cm || !cm.hotelCode) return { status: 200, body: { ok: true, message: 'No estaba conectado.' } };
    const writes = [];
    if (HOTEL.test(cm.hotelCode)) {
      const hotel = await getDoc(token, `channelHotels/${cm.hotelCode}`, fetchImpl);
      if (hotel && hotel.uid === uid) writes.push({ delete: docName(`channelHotels/${cm.hotelCode}`) });
    }
    writes.push({
      update: { name: docName(tenantPath), fields: fieldsOf({ channelManager: { ...cm, enabled: false } }) },
      updateMask: { fieldPaths: ['channelManager'] },
    });
    await commit(token, writes, fetchImpl);
    return { status: 200, body: { ok: true, message: 'Desconectado. Si Aiosell manda algo, va a recibir "hotel desconocido".' } };
  }

  return { status: 400, body: { error: 'Acción desconocida' } };
}

export async function onRequestPost({ request, env }) {
  const sa = readServiceAccount(env);
  if (!sa) return json({ error: 'Falta la cuenta de servicio' }, 503);
  const idToken = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!(await isAdminToken(idToken))) return json({ error: 'Solo la administración' }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Pedido inválido' }, 400);
  }
  try {
    const token = await getAccessToken(sa);
    const r = await handleAdmin(String(body.action || ''), body, { token });
    return json(r.body, r.status);
  } catch (e) {
    console.error('channel admin', e && e.message);
    return json({ error: 'Error del servidor. Probá de nuevo.' }, 500);
  }
}
