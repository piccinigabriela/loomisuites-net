// @ts-nocheck -- pruebas sobre JS sin tipos
/**
 * Pruebas de la conexión desde el Panel de clientes (functions/api/channel/admin.js) con un Firestore simulado. Sin red.
 * Se corre con: npm run probar:aiosell
 */
import assert from 'node:assert/strict';
// JS de Cloudflare sin tipos
// @ts-nocheck -- pruebas sobre JS sin tipos
import { cleanSave, handleAdmin, isAdminToken, suiteStatus } from '../functions/api/channel/admin.js';
import { fakeFirestore } from './fakeFirestore';

let pasadas = 0;
const cola: Array<() => Promise<void>> = [];
const prueba = (nombre: string, fn: () => void | Promise<void>) =>
  cola.push(async () => {
    try {
      await fn();
      pasadas++;
      console.log(`  ok  ${nombre}`);
    } catch (e) {
      console.error(`  FALLÓ  ${nombre}\n`, e);
      process.exitCode = 1;
    }
  });

const UID = 'UIDprueba12345';
const base = (sub: any = { status: 'active', plan: 'complejo' }) => ({
  ...(sub ? { [`subscriptions/${UID}`]: sub } : {}),
  [`tenants/${UID}`]: { complexName: 'deptos del retiro' },
  [`tenants/${UID}/properties/pA`]: { name: 'depto A' },
  [`tenants/${UID}/properties/pB`]: { name: 'depto B' },
});
const NOW = '2026-11-09T12:00:00.000Z';

prueba('solo la cuenta de administración con mail verificado', async () => {
  const lookup = (user: unknown) => (async () => new Response(JSON.stringify({ users: [user] }), { status: 200 })) as unknown as typeof fetch;
  assert.equal(await isAdminToken('t', lookup({ email: 'Piccini.Gabriela@gmail.com', emailVerified: true })), true);
  assert.equal(await isAdminToken('t', lookup({ email: 'piccini.gabriela@gmail.com', emailVerified: false })), false);
  assert.equal(await isAdminToken('t', lookup({ email: 'otra@gmail.com', emailVerified: true })), false);
  assert.equal(await isAdminToken('', lookup({})), false);
});

prueba('validación: códigos, unidades sin código, habitación repetida', () => {
  const ids = new Set(['pA', 'pB']);
  assert.equal(cleanSave({ hotelCode: 'hotel con espacios', units: { pA: { roomCode: 'x' } } }, ids).ok, false);
  assert.equal(cleanSave({ hotelCode: 'h1', units: { pA: { roomCode: '' } } }, ids).ok, false);
  assert.equal(cleanSave({ hotelCode: 'h1', units: { pA: { roomCode: 'r1' }, pB: { roomCode: 'r1' } } }, ids).ok, false);
  const ok = cleanSave({ hotelCode: ' h1 ', mode: 'real', units: { pA: { roomCode: 'r1', rateplanCode: 'r1-ep' }, pB: { roomCode: '' }, pX: { roomCode: 'r9' } }, rates: { send: true, percent: 500 } }, ids);
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.deepEqual(ok.value, { hotelCode: 'h1', mode: 'real', units: { pA: { roomCode: 'r1', enabled: true, rateplanCode: 'r1-ep' } }, rates: { send: true, percent: 100 } });
});

prueba('get de una cuenta sin conectar: unidades ordenadas y nada más', async () => {
  const fs = fakeFirestore(base());
  const r = await handleAdmin('get', { uid: UID }, { token: 't', fetchImpl: fs.fetchImpl });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.units, [{ id: 'pA', name: 'depto A' }, { id: 'pB', name: 'depto B' }]);
  assert.equal(r.body.channelManager, null);
  assert.equal(r.body.hotel, null);
});

prueba('save conecta en prueba, get lo muestra; cambiar de hotel borra el anterior', async () => {
  const fs = fakeFirestore(base());
  const deps = { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW };
  let r = await handleAdmin('save', { uid: UID, hotelCode: 'sandbox-pms', mode: 'prueba', units: { pA: { roomCode: 'executive' }, pB: { roomCode: 'suite' } }, rates: { send: false } }, deps);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.deepEqual(fs.docs.get('channelHotels/sandbox-pms'), { uid: UID, mode: 'prueba', provider: 'aiosell', updatedAt: NOW });
  const cm = (fs.docs.get(`tenants/${UID}`) as any).channelManager;
  assert.equal(cm.hotelCode, 'sandbox-pms');
  assert.equal(cm.units.pA.roomCode, 'executive');
  assert.equal((fs.docs.get(`tenants/${UID}`) as any).complexName, 'deptos del retiro', 'no pisa lo demás de la cuenta');
  r = await handleAdmin('get', { uid: UID }, deps);
  assert.deepEqual(r.body.hotel, { mode: 'prueba' });
  r = await handleAdmin('save', { uid: UID, hotelCode: 'hotel-2', mode: 'prueba', units: { pA: { roomCode: 'a' } } }, deps);
  assert.equal(r.status, 200);
  assert.equal(fs.docs.has('channelHotels/sandbox-pms'), false);
  assert.equal(fs.docs.has('channelHotels/hotel-2'), true);
});

prueba('no conecta un hotel que ya es de otra cuenta', async () => {
  const fs = fakeFirestore({ ...base(), 'channelHotels/h1': { uid: 'OTRAcuenta123', mode: 'real' } });
  const r = await handleAdmin('save', { uid: UID, hotelCode: 'h1', units: { pA: { roomCode: 'a' } } }, { token: 't', fetchImpl: fs.fetchImpl });
  assert.equal(r.status, 409);
});

prueba('modo real en el hotel de prueba con una cuenta de más de 20 reservas: no', async () => {
  const docs: Record<string, any> = base();
  for (let i = 0; i < 25; i++) docs[`tenants/${UID}/reservations/r${i}`] = { status: 'confirmed' };
  const fs = fakeFirestore(docs);
  const r = await handleAdmin('save', { uid: UID, hotelCode: 'sandbox-pms', mode: 'real', units: { pA: { roomCode: 'executive' } } }, { token: 't', fetchImpl: fs.fetchImpl });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /más de 20 reservas/);
});

prueba('disconnect borra el hotel y apaga el channel manager', async () => {
  const fs = fakeFirestore(base());
  const deps = { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW };
  await handleAdmin('save', { uid: UID, hotelCode: 'h1', mode: 'real', units: { pA: { roomCode: 'a' } } }, deps);
  const r = await handleAdmin('disconnect', { uid: UID }, deps);
  assert.equal(r.status, 200);
  assert.equal(fs.docs.has('channelHotels/h1'), false);
  assert.equal((fs.docs.get(`tenants/${UID}`) as any).channelManager.enabled, false);
});

prueba('get trae los últimos avisos, del más nuevo al más viejo', async () => {
  const fs = fakeFirestore({
    ...base(),
    [`tenants/${UID}/channelLog/1`]: { at: '2026-11-07T10:00:00Z', action: 'book', summary: ['Nueva: Ana'] },
    [`tenants/${UID}/channelLog/2`]: { at: '2026-11-08T10:00:00Z', action: 'cancel', summary: ['Cancelada: Ana'] },
    [`tenants/${UID}/sync/aiosell`]: { lastAt: '2026-11-08T10:00:00Z', lastAction: 'cancel', lastSendAt: '2026-11-08T10:05:00Z', lastSendError: '' },
  });
  const r = await handleAdmin('get', { uid: UID }, { token: 't', fetchImpl: fs.fetchImpl });
  assert.deepEqual(r.body.log.map((l: any) => l.action), ['cancel', 'book']);
  assert.equal(r.body.sync.lastAction, 'cancel');
});

prueba('estado del abono para el channel manager', () => {
  assert.equal(suiteStatus(null, NOW), 'prueba');
  assert.equal(suiteStatus({ status: 'trial' }, NOW), 'prueba');
  assert.equal(suiteStatus({ status: 'suspended' }, NOW), 'vencido');
  assert.equal(suiteStatus({ status: 'active', plan: 'propietario' }, NOW), 'loomi');
  assert.equal(suiteStatus({ status: 'active', plan: 'complejo', activeUntil: '2026-12-09T00:00:00Z' }, NOW), 'paga');
  assert.equal(suiteStatus({ status: 'active', plan: 'complejo', activeUntil: '2026-11-01T00:00:00Z' }, NOW), 'vencido');
});

prueba('en la prueba gratis no se conecta un hotel real (Aiosell cobra por propiedad)', async () => {
  const fs = fakeFirestore(base(null));
  const deps = { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW };
  let r = await handleAdmin('save', { uid: UID, hotelCode: 'h1', mode: 'prueba', units: { pA: { roomCode: 'a' } } }, deps);
  assert.equal(r.status, 402);
  assert.match(r.body.error, /prueba gratis/);
  assert.equal(fs.docs.has('channelHotels/h1'), false);
  assert.equal((await handleAdmin('get', { uid: UID }, deps)).body.pay, 'prueba');
  r = await handleAdmin('save', { uid: UID, hotelCode: 'sandbox-pms', mode: 'prueba', units: { pA: { roomCode: 'executive' } } }, deps);
  assert.equal(r.status, 200, 'el hotel de prueba de Aiosell no cuesta: se puede');
  r = await handleAdmin('save', { uid: UID, hotelCode: 'h1', mode: 'real', units: { pA: { roomCode: 'a' } }, cuentaPropia: true }, deps);
  assert.equal(r.status, 200, 'cuenta propia: se conecta sin abono');
  assert.equal((fs.docs.get(`tenants/${UID}`) as any).channelManager.ownAccount, true);
});

prueba('plan Loomi (no Suite) o vencido: tampoco', async () => {
  for (const sub of [{ status: 'active', plan: 'propietario' }, { status: 'active', plan: 'complejo', activeUntil: '2026-10-01T00:00:00Z' }]) {
    const fs = fakeFirestore(base(sub));
    const r = await handleAdmin('save', { uid: UID, hotelCode: 'h1', units: { pA: { roomCode: 'a' } } }, { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW });
    assert.equal(r.status, 402);
  }
});

prueba('cuenta inválida o inexistente', async () => {
  const fs = fakeFirestore({});
  assert.equal((await handleAdmin('get', { uid: '../x' }, { token: 't', fetchImpl: fs.fetchImpl })).status, 400);
  assert.equal((await handleAdmin('get', { uid: 'NOEXISTE12345' }, { token: 't', fetchImpl: fs.fetchImpl })).status, 404);
});

(async () => {
  for (const t of cola) await t();
  console.log(process.exitCode ? '\nHay pruebas del Panel que fallaron' : `\n${pasadas} pruebas del Panel pasaron`);
})();
