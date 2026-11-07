/**
 * Cloudflare Pages Function: avisos del channel manager Aiosell (POST /api/channel/aiosell).
 * Plan y respuestas de Aiosell: docs/channel-manager-aiosell.md. Lógica (pura, con pruebas): src/lib/aiosell.ts.
 *
 * - Aiosell manda book / modify / cancel con basic auth que definimos nosotros:
 *   secrets AIOSELL_WEBHOOK_USER y AIOSELL_WEBHOOK_PASSWORD en Cloudflare Pages (nunca en el repo).
 * - Escribe con la cuenta de servicio (FIREBASE_SERVICE_ACCOUNT, la misma de Xenia para huéspedes).
 * - channelHotels/{hotelCode} {uid, mode} (solo administración y servidor): de qué cuenta es cada hotel de Aiosell.
 *   mode "real" escribe reservas; cualquier otro valor (o sin mode) = prueba: solo deja el registro de lo que haría.
 * - tenants/{uid}.channelManager.units {propertyId: {roomCode, enabled}}: qué unidad es cada habitación de Aiosell.
 * - Registro de cada aviso en tenants/{uid}/channelLog/{id} (lo ve el dueño). Habitaciones sin unidad conectada quedan
 *   ahí con sus datos: nunca se pierde una reserva.
 * - Respuesta: {success, message}. Error 5xx solo si algo falló de nuestro lado, así Aiosell reintenta (3 veces).
 */
import { commit, docName, getAccessToken, getDoc, readServiceAccount, runQuery, toValue, where } from '../../../functions-lib/firestoreAdmin.js';
import { parseAiosellPush, planChannelPush } from '../../../src/lib/aiosell.ts';

const HOTEL = /^[A-Za-z0-9_.-]{1,80}$/;

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

/** Compara sin cortar en la primera diferencia (no da pistas por el tiempo de respuesta) */
function sameText(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

/** true si el encabezado Authorization trae el usuario y la clave correctos */
export function checkBasicAuth(header, user, pass) {
  const m = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header || '');
  if (!m) return false;
  let decoded = '';
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0)));
  } catch {
    return false;
  }
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  const okUser = sameText(decoded.slice(0, i), user);
  const okPass = sameText(decoded.slice(i + 1), pass);
  return okUser && okPass;
}

/** Objeto de JS → campos de Firestore, sin los undefined */
function fieldsOf(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) if (v !== undefined) out[k] = toValue(v);
  return out;
}

const createWrite = (path, data) => ({ update: { name: docName(path), fields: fieldsOf(data) }, currentDocument: { exists: false } });
const patchWrite = (path, patch) => {
  const keys = Object.keys(patch).filter((k) => patch[k] !== undefined);
  return {
    update: { name: docName(path), fields: fieldsOf(patch) },
    updateMask: { fieldPaths: keys },
    currentDocument: { exists: true },
  };
};
const deleteWrite = (path) => ({ delete: docName(path) });

/** Plan → escrituras de Firestore */
export function planWrites(uid, ops) {
  const res = (id) => `tenants/${uid}/reservations/${id}`;
  const task = (id) => `tenants/${uid}/cleaningTasks/${id}`;
  const writes = [];
  for (const o of ops) {
    if (o.op === 'create') {
      writes.push(createWrite(res(o.reservation.id), o.reservation));
      writes.push({ update: { name: docName(task(o.cleaningTask.id)), fields: fieldsOf(o.cleaningTask) } });
    } else if (o.op === 'update') {
      if (Object.keys(o.patch).length) writes.push(patchWrite(res(o.id), o.patch));
      for (const m of o.taskMoves) writes.push(patchWrite(task(m.id), m.patch));
    } else if (o.op === 'cancel') {
      writes.push(patchWrite(res(o.id), { status: 'cancelled' }));
      for (const id of o.deleteTaskIds) writes.push(deleteWrite(task(id)));
    } else if (o.op === 'createTask') {
      writes.push({ update: { name: docName(task(o.cleaningTask.id)), fields: fieldsOf(o.cleaningTask) } });
    }
  }
  return writes;
}

/** Lee lo que hace falta, arma el plan y (en modo real) lo escribe. Devuelve {status, message}. */
export async function handlePush(push, { token, fetchImpl = fetch, nowIso = new Date().toISOString() }) {
  if (!HOTEL.test(push.hotelCode)) return { status: 400, message: 'Invalid hotelCode' };
  const hotel = await getDoc(token, `channelHotels/${push.hotelCode}`, fetchImpl);
  if (!hotel || typeof hotel.uid !== 'string' || !hotel.uid) return { status: 404, message: `Unknown hotelCode ${push.hotelCode}` };
  const uid = hotel.uid;
  const real = hotel.mode === 'real';

  for (let attempt = 0; attempt < 2; attempt++) {
    const tenant = (await getDoc(token, `tenants/${uid}`, fetchImpl, ['channelManager', 'cleaningChecklist'])) || {};
    const units = (tenant.channelManager && tenant.channelManager.units) || {};
    const roomToUnit = new Map();
    for (const [propertyId, u] of Object.entries(units)) {
      if (u && u.enabled !== false && typeof u.roomCode === 'string' && u.roomCode) roomToUnit.set(u.roomCode, propertyId);
    }
    const ctx = { unitForRoom: (code) => roomToUnit.get(code), nowIso, cleaningChecklist: tenant.cleaningChecklist || null };
    const parent = `tenants/${uid}`;

    const byBooking = await runQuery(
      token,
      parent,
      'reservations',
      [where('channelHotelCode', push.hotelCode), where('channelBookingId', push.bookingId)],
      fetchImpl
    );

    let candidates = [];
    if (push.action !== 'cancel') {
      const unitIds = [...new Set(push.rooms.map((r) => roomToUnit.get(r.roomCode)).filter(Boolean))];
      const lists = await Promise.all(
        unitIds.map((pid) => runQuery(token, parent, 'reservations', [where('propertyId', pid), where('checkIn', push.checkin)], fetchImpl))
      );
      candidates = lists.flat();
    }

    const ids = [...new Set([...byBooking, ...candidates].map((r) => r.id))];
    const tasks = [];
    for (let i = 0; i < ids.length; i += 30) {
      tasks.push(...(await runQuery(token, parent, 'cleaningTasks', [where('reservationId', ids.slice(i, i + 30), 'IN')], fetchImpl)));
    }

    const plan = planChannelPush({ push, ctx, byBooking, candidates, tasks });

    const logId = `${nowIso.replace(/[^0-9]/g, '').slice(0, 17)}-${push.bookingId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);
    const log = {
      at: nowIso,
      mode: real ? 'real' : 'prueba',
      action: push.action,
      hotelCode: push.hotelCode,
      channel: push.channel,
      bookingId: push.bookingId,
      summary: plan.summary,
      unknownRooms: plan.unknownRooms,
      ...(push.action !== 'cancel'
        ? { checkIn: push.checkin, checkOut: push.checkout, guestName: push.guest.name, rooms: push.rooms.map((r) => r.roomCode) }
        : {}),
    };
    const writes = [
      ...(real ? planWrites(uid, plan.ops) : []),
      { update: { name: docName(`${parent}/channelLog/${logId}`), fields: fieldsOf(log) } },
      {
        update: {
          name: docName(`${parent}/sync/aiosell`),
          fields: fieldsOf({ lastAt: nowIso, lastAction: push.action, lastBookingId: push.bookingId, mode: log.mode }),
        },
        updateMask: { fieldPaths: ['lastAt', 'lastAction', 'lastBookingId', 'mode'] },
      },
    ];

    if (await commit(token, writes, fetchImpl)) {
      const head = real ? '' : '[prueba] ';
      return { status: 200, message: head + (plan.summary.join(' | ') || 'OK') };
    }
    // Una condición falló (otro aviso de la misma reserva se escribió en el medio): se vuelve a leer una vez
  }
  return { status: 503, message: 'Conflict, please retry' };
}

export async function onRequestPost({ request, env }) {
  const user = env.AIOSELL_WEBHOOK_USER;
  const pass = env.AIOSELL_WEBHOOK_PASSWORD;
  const sa = readServiceAccount(env);
  if (!user || !pass || !sa) return json({ success: false, message: 'Not configured' }, 503);
  if (!checkBasicAuth(request.headers.get('authorization'), user, pass)) {
    return json({ success: false, message: 'Unauthorized' }, 401, { 'www-authenticate': 'Basic realm="loomi"' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }
  const parsed = parseAiosellPush(body);
  if (!parsed.ok) return json({ success: false, message: parsed.error }, 400);

  try {
    const token = await getAccessToken(sa);
    const r = await handlePush(parsed.push, { token });
    return json({ success: r.status === 200, message: r.message }, r.status);
  } catch (e) {
    console.error('aiosell', e && e.message);
    return json({ success: false, message: 'Temporary error, please retry' }, 500);
  }
}

export const onRequest = () => json({ success: false, message: 'Method not allowed' }, 405, { allow: 'POST' });
