/**
 * Pruebas del receptor de Aiosell: el planificador (src/lib/aiosell.ts → planChannelPush) y la función de Cloudflare
 * (functions/api/channel/aiosell.js) contra un Firestore simulado en memoria. Sin red.
 * Se corre con: npm run probar:aiosell
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import type { CleaningTask, Reservation } from '../src/types';
import { parseAiosellPush, planChannelPush, type AiosellBooking, type AiosellPush } from '../src/lib/aiosell';
import { checkBasicAuth, handlePush, onRequestPost } from '../functions/api/channel/aiosell.js';
import { fakeFirestore } from './fakeFirestore';

let pasadas = 0;
const pendientes: Array<Promise<void>> = [];
function prueba(nombre: string, fn: () => void | Promise<void>) {
  const run = async () => {
    try {
      await fn();
      pasadas++;
      console.log(`  ok  ${nombre}`);
    } catch (e) {
      console.error(`  FALLÓ  ${nombre}\n`, e);
      process.exitCode = 1;
    }
  };
  pendientes.push(pendientes.length ? pendientes[pendientes.length - 1].then(run) : run());
}

/* ---------- Datos con la forma del sandbox de Aiosell ---------- */

const NOW = '2026-11-07T12:00:00.000Z';
const rawBook = (over: Record<string, unknown> = {}) => ({
  action: 'book',
  hotelCode: 'sandbox-pms',
  channel: 'Airbnb',
  bookingId: 'AB100',
  cmBookingId: 'CM100',
  checkin: '2026-12-10',
  checkout: '2026-12-13',
  pah: false,
  amount: { amountAfterTax: 300, amountBeforeTax: 300, tax: 0, currency: 'USD' },
  guest: { firstName: 'Ana', lastName: 'Pérez', email: 'ana@example.com', phone: '+54 9 11 5555-0000' },
  rooms: [
    {
      roomCode: 'executive',
      rateplanCode: 'executive-d-ep',
      guestName: 'Ana Pérez',
      occupancy: { adults: 2, children: 0 },
      prices: [
        { date: '2026-12-10', sellRate: 100 },
        { date: '2026-12-11', sellRate: 100 },
        { date: '2026-12-12', sellRate: 100 },
      ],
    },
  ],
  ...over,
});
const parsed = (raw: unknown): AiosellPush => {
  const p = parseAiosellPush(raw);
  if (!p.ok) throw new Error(p.error);
  return p.push;
};
const ctx = { unitForRoom: (c: string) => ({ executive: 'u1', suite: 'u2' } as Record<string, string>)[c], nowIso: NOW };

const icalRes = (over: Partial<Reservation> = {}): Reservation =>
  ({
    id: 'ical-airbnb-u1-abc',
    propertyId: 'u1',
    guestName: 'Reserva Airbnb',
    guestEmail: '',
    guestPhone: '',
    checkIn: '2026-12-10',
    checkOut: '2026-12-13',
    nights: 3,
    guestsCount: 1,
    platform: 'airbnb',
    totalAmount: 0,
    cleaningFee: 0,
    commissionPaid: 0,
    netRevenue: 0,
    status: 'confirmed',
    paymentStatus: 'pending',
    pinCode: '',
    createdAt: NOW,
    source: 'ical',
    icalSource: 'airbnb',
    ...over,
  }) as Reservation;

const task = (over: Partial<CleaningTask> = {}): CleaningTask =>
  ({
    id: 'clean-x',
    propertyId: 'u1',
    reservationId: 'x',
    date: '2026-12-13',
    scheduledTime: '11:00 - 13:30',
    cleanerName: 'Sin asignar',
    cleanerPhone: '',
    status: 'pending',
    checklist: [],
    ...over,
  }) as CleaningTask;

/* ---------- Planificador ---------- */

prueba('book nuevo: crea la reserva y su limpieza', () => {
  const plan = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [], tasks: [] });
  assert.equal(plan.ops.length, 1);
  const op = plan.ops[0];
  assert.equal(op.op, 'create');
  if (op.op !== 'create') return;
  assert.equal(op.reservation.id, 'cm-sandbox-pms-AB100');
  assert.equal(op.reservation.propertyId, 'u1');
  assert.equal(op.reservation.platform, 'airbnb');
  assert.equal(op.reservation.totalAmount, 300);
  assert.equal(op.reservation.channelRoomIndex, 0);
  assert.equal(op.cleaningTask.date, '2026-12-13');
});

prueba('book que ya estaba por iCal (mismas fechas y canal): la ata, no duplica', () => {
  const ical = icalRes();
  const plan = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [ical], tasks: [] });
  assert.equal(plan.ops.length, 1);
  const op = plan.ops[0];
  assert.equal(op.op, 'update');
  if (op.op !== 'update') return;
  assert.equal(op.kind, 'attach');
  assert.equal(op.id, ical.id);
  assert.equal(op.patch.channelBookingId, 'AB100');
  assert.equal(op.patch.guestName, 'Ana Pérez', 'el nombre genérico de iCal se reemplaza por el real');
  assert.equal(op.patch.totalAmount, 300);
  assert.equal(op.patch.guestsCount, 2);
});

prueba('al atar no pisa lo que cargó el dueño', () => {
  const manual = icalRes({ id: 'r-manual', source: 'manual', guestName: 'Juan (amigo de Fer)', guestPhone: '1122', totalAmount: 250 });
  const plan = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [manual], tasks: [] });
  const op = plan.ops[0];
  assert.equal(op.op, 'update');
  if (op.op !== 'update') return;
  assert.equal(op.patch.guestName, undefined);
  assert.equal(op.patch.guestPhone, undefined);
  assert.equal(op.patch.totalAmount, undefined);
  assert.equal(op.patch.guestEmail, 'ana@example.com', 'completa lo que faltaba');
});

prueba('no ata a un bloqueo, a otro canal ni a otras fechas', () => {
  const candidates = [
    icalRes({ id: 'b1', guestName: 'Bloqueado en Airbnb' }),
    icalRes({ id: 'b2', platform: 'booking', icalSource: 'booking', guestName: 'Reserva Booking' }),
    icalRes({ id: 'b3', checkOut: '2026-12-14' }),
    icalRes({ id: 'b4', status: 'cancelled' }),
  ];
  const plan = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates, tasks: [] });
  assert.deepEqual(plan.ops.map((o) => o.op), ['create']);
});

prueba('book repetido (reintento de Aiosell): no cambia nada', () => {
  const first = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [], tasks: [] });
  const op = first.ops[0];
  if (op.op !== 'create') throw new Error('esperaba create');
  const again = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [op.reservation], candidates: [op.reservation], tasks: [op.cleaningTask] });
  assert.equal(again.ops.length, 0);
  assert.match(again.summary[0], /Sin cambios/);
});

prueba('modify: cambia fechas e importe y mueve la limpieza pendiente', () => {
  const first = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [], tasks: [] }).ops[0];
  if (first.op !== 'create') throw new Error('esperaba create');
  const push = parsed(rawBook({ action: 'modify', checkout: '2026-12-15', amount: { amountAfterTax: 500, currency: 'USD' }, rooms: [{ roomCode: 'executive', occupancy: { adults: 2 } }] }));
  const plan = planChannelPush({ push, ctx, byBooking: [first.reservation], candidates: [], tasks: [first.cleaningTask] });
  const op = plan.ops[0];
  assert.equal(op.op, 'update');
  if (op.op !== 'update') return;
  assert.equal(op.kind, 'modify');
  assert.equal(op.patch.checkOut, '2026-12-15');
  assert.equal(op.patch.nights, 5);
  assert.equal(op.patch.totalAmount, 500);
  assert.deepEqual(op.taskMoves, [{ id: first.cleaningTask.id, patch: { date: '2026-12-15' } }]);
});

prueba('modify a otra habitación: cambia la unidad y la limpieza va con ella', () => {
  const first = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [], candidates: [], tasks: [] }).ops[0];
  if (first.op !== 'create') throw new Error('esperaba create');
  const push = parsed(rawBook({ action: 'modify', rooms: [{ roomCode: 'suite', occupancy: { adults: 2 }, prices: [{ sellRate: 300 }] }] }));
  const plan = planChannelPush({ push, ctx, byBooking: [first.reservation], candidates: [], tasks: [first.cleaningTask] });
  const op = plan.ops[0];
  if (op.op !== 'update') throw new Error('esperaba update');
  assert.equal(op.patch.propertyId, 'u2');
  assert.deepEqual(op.taskMoves[0].patch, { propertyId: 'u2' });
});

prueba('modify de una reserva que no estaba: se crea', () => {
  const plan = planChannelPush({ push: parsed(rawBook({ action: 'modify' })), ctx, byBooking: [], candidates: [], tasks: [] });
  assert.deepEqual(plan.ops.map((o) => o.op), ['create']);
});

prueba('cancel: cancela y borra solo las limpiezas pendientes', () => {
  const r = icalRes({ id: 'cm-sandbox-pms-AB100', source: 'channel', channelBookingId: 'AB100', channelHotelCode: 'sandbox-pms' });
  const tasks = [task({ id: 't1', reservationId: r.id }), task({ id: 't2', reservationId: r.id, status: 'completed' })];
  const plan = planChannelPush({ push: parsed({ action: 'cancel', hotelCode: 'sandbox-pms', channel: 'Airbnb', bookingId: 'AB100' }), ctx, byBooking: [r], candidates: [], tasks });
  assert.deepEqual(plan.ops, [{ op: 'cancel', id: r.id, deleteTaskIds: ['t1'] }]);
});

prueba('cancel de algo que no está: no hace nada', () => {
  const plan = planChannelPush({ push: parsed({ action: 'cancel', hotelCode: 'sandbox-pms', bookingId: 'NADA' }), ctx, byBooking: [], candidates: [], tasks: [] });
  assert.equal(plan.ops.length, 0);
});

prueba('cancelada que vuelve a llegar: se reactiva con limpieza nueva', () => {
  const r = icalRes({ id: 'cm-sandbox-pms-AB100', status: 'cancelled', source: 'channel', channelBookingId: 'AB100', channelHotelCode: 'sandbox-pms', channelRoomIndex: 0 });
  const plan = planChannelPush({ push: parsed(rawBook()), ctx, byBooking: [r], candidates: [], tasks: [] });
  assert.deepEqual(plan.ops.map((o) => o.op), ['update', 'createTask']);
  const op = plan.ops[0];
  if (op.op === 'update') assert.equal(op.patch.status, 'confirmed');
});

prueba('habitación sin unidad conectada: no se carga y queda avisada', () => {
  const plan = planChannelPush({ push: parsed(rawBook({ rooms: [{ roomCode: 'otra' }] })), ctx, byBooking: [], candidates: [], tasks: [] });
  assert.equal(plan.ops.length, 0);
  assert.deepEqual(plan.unknownRooms, ['otra']);
});

prueba('dos habitaciones en una reserva; el modify que saca una la cancela', () => {
  const two = parsed(rawBook({ rooms: [{ roomCode: 'executive' }, { roomCode: 'suite' }] })) as AiosellBooking;
  const created = planChannelPush({ push: two, ctx, byBooking: [], candidates: [], tasks: [] }).ops.map((o) => (o.op === 'create' ? o.reservation : null)).filter(Boolean) as Reservation[];
  assert.deepEqual(created.map((r) => r.id), ['cm-sandbox-pms-AB100-1', 'cm-sandbox-pms-AB100-2']);
  const one = parsed(rawBook({ action: 'modify', rooms: [{ roomCode: 'executive' }] }));
  const plan = planChannelPush({ push: one, ctx, byBooking: created, candidates: [], tasks: [] });
  const cancels = plan.ops.filter((o) => o.op === 'cancel');
  assert.deepEqual(cancels.map((o) => (o.op === 'cancel' ? o.id : '')), ['cm-sandbox-pms-AB100-2']);
});

/* ---------- Basic auth ---------- */

prueba('basic auth: acepta solo usuario y clave correctos', () => {
  const h = (s: string) => 'Basic ' + Buffer.from(s).toString('base64');
  assert.equal(checkBasicAuth(h('aio:clave:con:dos'), 'aio', 'clave:con:dos'), true);
  assert.equal(checkBasicAuth(h('aio:otra'), 'aio', 'clave'), false);
  assert.equal(checkBasicAuth(h('otro:clave'), 'aio', 'clave'), false);
  assert.equal(checkBasicAuth('Bearer x', 'aio', 'clave'), false);
  assert.equal(checkBasicAuth(null, 'aio', 'clave'), false);
});

/* ---------- Firestore simulado ---------- */

const tenantDocs = (mode: 'real' | 'prueba') => ({
  'channelHotels/sandbox-pms': { uid: 'UID1', mode },
  'tenants/UID1': { channelManager: { enabled: true, units: { u1: { roomCode: 'executive', enabled: true }, u2: { roomCode: 'suite', enabled: true } } } },
});

prueba('función: modo prueba solo deja el registro', async () => {
  const fs = fakeFirestore({ ...tenantDocs('prueba'), 'tenants/UID1/reservations/ical-airbnb-u1-abc': icalRes() as any });
  const r = await handlePush(parsed(rawBook()), { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW });
  assert.equal(r.status, 200);
  assert.match(r.message, /^\[prueba\] Atada/);
  assert.equal(fs.docs.has('tenants/UID1/reservations/cm-sandbox-pms-AB100'), false);
  assert.equal((fs.docs.get('tenants/UID1/reservations/ical-airbnb-u1-abc') as any).channelBookingId, undefined);
  const logs = [...fs.docs.keys()].filter((k) => k.startsWith('tenants/UID1/channelLog/'));
  assert.equal(logs.length, 1);
  assert.equal((fs.docs.get('tenants/UID1/sync/aiosell') as any).mode, 'prueba');
});

prueba('función: book, repetido, modify y cancel en modo real', async () => {
  const fs = fakeFirestore(tenantDocs('real'));
  const deps = { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW };
  const R = 'tenants/UID1/reservations/cm-sandbox-pms-AB100';
  const T = 'tenants/UID1/cleaningTasks/clean-cm-sandbox-pms-AB100';

  let r = await handlePush(parsed(rawBook()), deps);
  assert.equal(r.status, 200, r.message);
  assert.equal((fs.docs.get(R) as any).guestName, 'Ana Pérez');
  assert.equal((fs.docs.get(T) as any).date, '2026-12-13');

  r = await handlePush(parsed(rawBook()), { ...deps, nowIso: '2026-11-07T12:00:01.000Z' });
  assert.match(r.message, /Sin cambios/);

  r = await handlePush(parsed(rawBook({ action: 'modify', checkout: '2026-12-14' })), { ...deps, nowIso: '2026-11-07T12:00:02.000Z' });
  assert.match(r.message, /Modificada/);
  assert.equal((fs.docs.get(R) as any).checkOut, '2026-12-14');
  assert.equal((fs.docs.get(T) as any).date, '2026-12-14');

  r = await handlePush(parsed({ action: 'cancel', hotelCode: 'sandbox-pms', channel: 'Airbnb', bookingId: 'AB100' }), { ...deps, nowIso: '2026-11-07T12:00:03.000Z' });
  assert.match(r.message, /Cancelada/);
  assert.equal((fs.docs.get(R) as any).status, 'cancelled');
  assert.equal(fs.docs.has(T), false);
  assert.equal([...fs.docs.keys()].filter((k) => k.includes('/channelLog/')).length, 4);
});

prueba('función: ata la reserva que ya estaba por iCal (modo real)', async () => {
  const fs = fakeFirestore({ ...tenantDocs('real'), 'tenants/UID1/reservations/ical-airbnb-u1-abc': icalRes() as any });
  const r = await handlePush(parsed(rawBook()), { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW });
  assert.equal(r.status, 200);
  const res = fs.docs.get('tenants/UID1/reservations/ical-airbnb-u1-abc') as any;
  assert.equal(res.channelBookingId, 'AB100');
  assert.equal(res.guestName, 'Ana Pérez');
  assert.equal(res.source, 'ical', 'sigue siendo de iCal');
  assert.equal(fs.docs.has('tenants/UID1/reservations/cm-sandbox-pms-AB100'), false);
});

prueba('función: hotel desconocido = 404', async () => {
  const fs = fakeFirestore({});
  const r = await handlePush(parsed(rawBook()), { token: 't', fetchImpl: fs.fetchImpl, nowIso: NOW });
  assert.equal(r.status, 404);
});

prueba('función completa: clave, JSON y respuesta como pide Aiosell', async () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const env = {
    AIOSELL_WEBHOOK_USER: 'aiosell-loomi',
    AIOSELL_WEBHOOK_PASSWORD: 'clave-de-prueba',
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ client_email: 'x@y.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) }),
  };
  const fs = fakeFirestore(tenantDocs('real'));
  const realFetch = globalThis.fetch;
  globalThis.fetch = fs.fetchImpl;
  try {
    const call = (body: string, auth?: string) =>
      onRequestPost({
        env,
        request: new Request('https://app.loomisuite.net/api/channel/aiosell', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
          body,
        }),
      });
    const good = 'Basic ' + Buffer.from('aiosell-loomi:clave-de-prueba').toString('base64');

    let res = await call(JSON.stringify(rawBook()));
    assert.equal(res.status, 401);
    res = await call('{no es json', good);
    assert.equal(res.status, 400);
    res = await call(JSON.stringify({ action: 'book', hotelCode: 'sandbox-pms' }), good);
    assert.equal(res.status, 400);
    res = await call(JSON.stringify(rawBook()), good);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(fs.docs.has('tenants/UID1/reservations/cm-sandbox-pms-AB100'), true);

    res = await onRequestPost({ env: {}, request: new Request('https://x/', { method: 'POST', body: '{}' }) });
    assert.equal(res.status, 503, 'sin secrets no hace nada');
  } finally {
    globalThis.fetch = realFetch;
  }
});

Promise.all(pendientes).then(() => {
  console.log(process.exitCode ? '\nHay pruebas del receptor que fallaron' : `\n${pasadas} pruebas del receptor pasaron`);
});
