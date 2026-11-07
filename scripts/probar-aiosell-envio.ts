/**
 * Pruebas de lo que Loomi le manda a Aiosell (server-sync/src/aiosellSend.ts y channelSendBodies de src/lib/aiosell.ts),
 * con una base y un Aiosell simulados. Sin red. Se corre con: npm run probar:aiosell
 */
import assert from 'node:assert/strict';
import type { Property, Reservation } from '../src/types';
import { channelSendBodies, connectedUnits } from '../src/lib/aiosell';
import { enviarCuentaAiosell, postAiosell, type AiosellConfig } from '../server-sync/src/aiosellSend';

let pasadas = 0;
const cola: Array<() => Promise<void>> = [];
function prueba(nombre: string, fn: () => void | Promise<void>) {
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
}

const props = [
  { id: 'u1', name: 'depto A', basePrice: 100 },
  { id: 'u2', name: 'depto B', basePrice: 150 },
] as unknown as Property[];
const cm = {
  enabled: true,
  hotelCode: 'sandbox-pms',
  units: { u1: { roomCode: 'executive', rateplanCode: 'executive-d-ep', enabled: true }, u2: { roomCode: 'suite', enabled: true } },
  rates: { send: true, percent: 10 },
};
const res = (over: Partial<Reservation>) =>
  ({ id: 'r1', propertyId: 'u1', checkIn: '2026-11-10', checkOut: '2026-11-12', status: 'confirmed', ...over }) as Reservation;

prueba('unidades conectadas: con su tarifa y sin las apagadas', () => {
  assert.deepEqual(connectedUnits({ ...cm, units: { ...cm.units, u3: { roomCode: 'x', enabled: false } } }), [
    { propertyId: 'u1', roomCode: 'executive', rateplanCode: 'executive-d-ep' },
    { propertyId: 'u2', roomCode: 'suite', rateplanCode: undefined },
  ]);
});

prueba('envío: disponibilidad, precios con su tarifa y +10 %, estadía mínima', () => {
  const b = channelSendBodies({ cm, reservations: [res({})], properties: props, pricing: null, from: '2026-11-07', days: 10 })!;
  assert.equal(b.availability.hotelCode, 'sandbox-pms');
  const exec = b.availability.updates.flatMap((u) => u.rooms.filter((r) => r.roomCode === 'executive').map((r) => [u.startDate, u.endDate, r.available]));
  assert.deepEqual(exec, [
    ['2026-11-07', '2026-11-09', 1],
    ['2026-11-10', '2026-11-11', 0],
    ['2026-11-12', '2026-11-16', 1],
  ]);
  const rates = b.rates!.updates.flatMap((u) => u.rates);
  assert.ok(rates.some((r) => r.roomCode === 'executive' && r.rateplanCode === 'executive-d-ep'));
  assert.ok(rates.some((r) => r.roomCode === 'suite' && r.rateplanCode === 'STD'));
  assert.ok(rates.filter((r) => r.roomCode === 'executive').every((r) => r.rate === 110), 'Tarifas + 10 %');
  assert.ok(b.restrictions!.updates.length > 0);
});

prueba('sin "mandar precios": solo disponibilidad', () => {
  const b = channelSendBodies({ cm: { ...cm, rates: { send: false } }, reservations: [], properties: props, pricing: null, from: '2026-11-07', days: 5 })!;
  assert.equal(b.rates, null);
  assert.equal(b.restrictions, null);
});

prueba('canceladas y bloqueos: las canceladas no ocupan', () => {
  const b = channelSendBodies({ cm, reservations: [res({ status: 'cancelled' })], properties: props, pricing: null, from: '2026-11-07', days: 10 })!;
  assert.ok(b.availability.updates.every((u) => u.rooms.every((r) => r.available === 1)));
});

/* ---------- Base simulada (lo mínimo de firebase-admin que se usa) ---------- */

function fakeDb(docs: Record<string, any>) {
  const store = new Map<string, any>(Object.entries(docs));
  const snap = (path: string) => {
    const data = store.get(path);
    return { exists: data !== undefined, id: path.split('/').pop(), get: (f: string) => data?.[f], data: () => data };
  };
  const query = (col: string, filter?: (d: any) => boolean) => ({
    get: async () => ({
      docs: [...store.entries()]
        .filter(([p, d]) => p.startsWith(col + '/') && !p.slice(col.length + 1).includes('/') && (!filter || filter(d)))
        .map(([p]) => snap(p)),
    }),
  });
  const db: any = {
    doc: (path: string) => ({
      get: async () => snap(path),
      set: async (data: any, opts?: { merge?: boolean }) => store.set(path, opts?.merge ? { ...(store.get(path) || {}), ...data } : data),
    }),
    collection: (col: string) => ({
      ...query(col),
      where: (f: string, op: string, v: any) => query(col, (d) => (op === '>' ? d[f] > v : op === '==' ? d[f] === v : true)),
    }),
  };
  return { db, store };
}

const cfg: AiosellConfig = { user: 'aiosell', password: 'x', pms: 'sample-pms', baseUrl: 'https://live.aiosell.com/api/v2/cm' };

function fakeAiosell(answer: (url: string, body: any) => { status: number; body: unknown } = () => ({ status: 200, body: { success: true } })) {
  const calls: Array<{ url: string; auth: string; body: any }> = [];
  const fetchImpl = (async (url: unknown, init: any) => {
    const body = JSON.parse(init.body);
    calls.push({ url: String(url), auth: init.headers.authorization, body });
    const a = answer(String(url), body);
    return new Response(JSON.stringify(a.body), { status: a.status });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

const baseDocs = () => ({
  'tenants/UID1': { channelManager: cm, pricing: null },
  'tenants/UID1/properties/u1': props[0],
  'tenants/UID1/properties/u2': props[1],
  'tenants/UID1/reservations/r1': res({}),
  'tenants/UID1/reservations/viejo': res({ id: 'viejo', checkIn: '2026-10-01', checkOut: '2026-10-05' }),
});
const NOW = new Date('2026-11-07T15:00:00Z');

prueba('envío real: las tres llamadas a las direcciones de Aiosell con basic auth', async () => {
  const { db, store } = fakeDb(baseDocs());
  const ai = fakeAiosell();
  const r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: NOW });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.sent, ['availability', 'rates', 'restrictions']);
  assert.deepEqual(ai.calls.map((c) => c.url), [
    'https://live.aiosell.com/api/v2/cm/update/sample-pms',
    'https://live.aiosell.com/api/v2/cm/update-rates/sample-pms',
    'https://live.aiosell.com/api/v2/cm/update/sample-pms',
  ]);
  assert.equal(ai.calls[0].auth, 'Basic ' + Buffer.from('aiosell:x').toString('base64'));
  assert.equal(ai.calls[0].body.updates[0].startDate, '2026-11-07');
  assert.equal(store.get('tenants/UID1/sync/aiosell').lastSendError, '');
});

prueba('sin cambios: a los 10 minutos no se manda nada; con una reserva nueva, solo la disponibilidad', async () => {
  const { db, store } = fakeDb(baseDocs());
  const ai = fakeAiosell();
  await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: NOW });
  const later = new Date(NOW.getTime() + 10 * 60000);
  let r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: later });
  assert.deepEqual(r.sent, []);
  assert.equal(ai.calls.length, 3);
  store.set('tenants/UID1/reservations/r2', res({ id: 'r2', propertyId: 'u2', checkIn: '2026-11-20', checkOut: '2026-11-22' }));
  r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: new Date(later.getTime() + 600000) });
  assert.deepEqual(r.sent, ['availability']);
  assert.equal(ai.calls.length, 4);
});

prueba('una vez por día se manda todo aunque no haya cambios', async () => {
  const { db } = fakeDb(baseDocs());
  const ai = fakeAiosell();
  await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: NOW });
  const r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: new Date(NOW.getTime() + 25 * 3600000) });
  assert.deepEqual(r.sent, ['availability', 'rates', 'restrictions']);
});

prueba('si Aiosell contesta error, se registra y se reintenta en la próxima vuelta', async () => {
  const { db, store } = fakeDb(baseDocs());
  let fail = true;
  const ai = fakeAiosell(() => (fail ? { status: 200, body: { success: false, message: 'Invalid hotel' } } : { status: 200, body: { success: true } }));
  let r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: NOW });
  assert.equal(r.errors.length, 3);
  assert.match(store.get('tenants/UID1/sync/aiosell').lastSendError, /Invalid hotel/);
  fail = false;
  r = await enviarCuentaAiosell(db, cfg, 'UID1', 'sandbox-pms', { fetchImpl: ai.fetchImpl, now: new Date(NOW.getTime() + 600000) });
  assert.deepEqual(r.sent, ['availability', 'rates', 'restrictions']);
  assert.equal(store.get('tenants/UID1/sync/aiosell').lastSendError, '');
});

prueba('modo "solo mostrar": no llama a Aiosell ni guarda nada', async () => {
  const { db, store } = fakeDb(baseDocs());
  const ai = fakeAiosell();
  const r = await enviarCuentaAiosell(db, null, 'UID1', 'sandbox-pms', { dryRun: true, force: true, fetchImpl: ai.fetchImpl, now: NOW });
  assert.equal(ai.calls.length, 0);
  assert.equal(store.has('tenants/UID1/sync/aiosell'), false);
  assert.ok(r.bodies?.availability);
});

prueba('error de red: se devuelve como texto, no rompe', async () => {
  const err = await postAiosell(cfg, 'availability', {}, (async () => {
    throw new Error('sin conexión');
  }) as typeof fetch);
  assert.equal(err, 'sin conexión');
});

(async () => {
  for (const t of cola) await t();
  console.log(process.exitCode ? '\nHay pruebas del envío que fallaron' : `\n${pasadas} pruebas del envío pasaron`);
})();
