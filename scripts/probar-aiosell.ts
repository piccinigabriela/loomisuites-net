/**
 * Pruebas de src/lib/aiosell.ts (sin red ni Firebase). Se corre con: npm run probar:aiosell
 */
import assert from 'node:assert/strict';
import type { Property, Reservation } from '../src/types';
import { defaultPricing, type PricingSettings } from '../src/lib/pricing';
import {
  availabilityUpdates,
  bookingToReservations,
  channelReservationId,
  channelToPlatform,
  minimumStayUpdates,
  modificationPatch,
  parseAiosellPush,
  rateUpdates,
  type AiosellBooking,
} from '../src/lib/aiosell';

let pasadas = 0;
function prueba(nombre: string, fn: () => void) {
  try {
    fn();
    pasadas++;
    console.log(`  ok  ${nombre}`);
  } catch (e) {
    console.error(`  FALLÓ  ${nombre}\n`, e);
    process.exitCode = 1;
  }
}

const book = {
  action: 'book',
  hotelCode: 'LOOMI-1',
  channel: 'Booking.com',
  bookingId: 'B123',
  cmBookingId: 'CM9',
  bookedOn: '2026-11-06T10:00:00Z',
  checkin: '2026-12-10',
  checkout: '2026-12-13',
  specialRequests: 'Llegamos tarde',
  pah: false,
  amount: { amountAfterTax: 300, amountBeforeTax: 270, tax: 30, currency: 'usd' },
  guest: { firstName: 'Ana', lastName: 'Pérez', email: 'ana@example.com', phone: '+5491100000000' },
  rooms: [
    {
      roomCode: 'u1',
      rateplanCode: 'STD',
      guestName: 'Ana Pérez',
      occupancy: { adults: 2, children: 1 },
      prices: [
        { date: '2026-12-10', sellRate: 100 },
        { date: '2026-12-11', sellRate: 100 },
        { date: '2026-12-12', sellRate: 100 },
      ],
    },
  ],
};

const ctx = {
  unitForRoom: (code: string) => (code === 'u1' ? 'prop-1' : code === 'u2' ? 'prop-2' : undefined),
  nowIso: '2026-11-06T12:00:00.000Z',
};

function leer(body: unknown): AiosellBooking {
  const r = parseAiosellPush(body);
  assert.ok(r.ok, 'debería ser válida');
  assert.notEqual(r.ok && r.push.action, 'cancel');
  return (r as { ok: true; push: AiosellBooking }).push;
}

console.log('Aiosell → Loomi');

prueba('lee un book completo', () => {
  const b = leer(book);
  assert.equal(b.hotelCode, 'LOOMI-1');
  assert.equal(b.checkin, '2026-12-10');
  assert.equal(b.pah, false);
  assert.equal(b.currency, 'USD');
  assert.equal(b.guest.name, 'Ana Pérez');
  assert.equal(b.rooms[0].adults, 2);
  assert.equal(b.rooms[0].total, 300);
});

prueba('acepta fechas con hora y bookingId numérico', () => {
  const b = leer({ ...book, bookingId: 77, checkin: '2026-12-10T14:00:00', checkout: '2026-12-13T10:00:00' });
  assert.equal(b.bookingId, '77');
  assert.equal(b.checkin, '2026-12-10');
});

prueba('lee un cancel', () => {
  const r = parseAiosellPush({ action: 'cancel', hotelCode: 'LOOMI-1', channel: 'airbnb', bookingId: 'B123' });
  assert.deepEqual(r, { ok: true, push: { action: 'cancel', hotelCode: 'LOOMI-1', channel: 'airbnb', bookingId: 'B123' } });
});

prueba('rechaza lo inválido sin tirar error', () => {
  for (const malo of [
    null,
    'hola',
    {},
    { action: 'otra', hotelCode: 'x', bookingId: '1' },
    { action: 'book', bookingId: '1' },
    { ...book, bookingId: '' },
    { ...book, checkin: 'mañana' },
    { ...book, checkout: '2026-12-10' },
    { ...book, rooms: [] },
    { ...book, rooms: [{ rateplanCode: 'STD' }] },
  ]) {
    const r = parseAiosellPush(malo);
    assert.equal(r.ok, false, JSON.stringify(malo));
  }
});

prueba('canales: Airbnb, Booking, Expedia/Vrbo y el resto', () => {
  assert.equal(channelToPlatform('airbnb').platform, 'airbnb');
  assert.equal(channelToPlatform('Booking.com').platform, 'booking');
  assert.equal(channelToPlatform('Expedia').platform, 'vrbo');
  assert.equal(channelToPlatform('Vrbo').platform, 'vrbo');
  const otro = channelToPlatform('Agoda');
  assert.equal(otro.platform, 'direct');
  assert.equal(otro.known, false);
  assert.equal(otro.label, 'Agoda');
});

prueba('book → una reserva y su limpieza al check-out', () => {
  const res = bookingToReservations(leer(book), ctx);
  assert.equal(res.unknownRooms.length, 0);
  assert.equal(res.items.length, 1);
  const { reservation: r, cleaningTask: c } = res.items[0];
  assert.equal(r.id, 'cm-LOOMI-1-B123');
  assert.equal(r.propertyId, 'prop-1');
  assert.equal(r.platform, 'booking');
  assert.equal(r.source, 'channel');
  assert.equal(r.channelBookingId, 'B123');
  assert.equal(r.nights, 3);
  assert.equal(r.guestsCount, 3);
  assert.equal(r.totalAmount, 300);
  assert.equal(r.paymentStatus, 'paid');
  assert.equal(r.status, 'confirmed');
  assert.equal(c.date, '2026-12-13');
  assert.equal(c.reservationId, r.id);
  assert.equal(c.id, 'clean-cm-LOOMI-1-B123');
  assert.ok(c.checklist.length > 0);
  assert.equal(res.currency, 'USD');
});

prueba('paga en el alojamiento (pah) queda pendiente', () => {
  const res = bookingToReservations(leer({ ...book, pah: true }), ctx);
  assert.equal(res.items[0].reservation.paymentStatus, 'pending');
});

prueba('canal desconocido va como origen propio', () => {
  const res = bookingToReservations(leer({ ...book, channel: 'Agoda' }), ctx);
  const r = res.items[0].reservation;
  assert.equal(r.platform, 'direct');
  assert.equal(r.origin, '');
  assert.equal(r.channelName, 'Agoda');
});

prueba('sin precios por noche usa el importe total', () => {
  const sinPrecios = { ...book, rooms: [{ ...book.rooms[0], prices: [] }] };
  const res = bookingToReservations(leer(sinPrecios), ctx);
  assert.equal(res.items[0].reservation.totalAmount, 300);
});

prueba('dos habitaciones: dos reservas con ids distintos y el importe repartido', () => {
  const dos = {
    ...book,
    rooms: [
      { ...book.rooms[0], prices: [] },
      { ...book.rooms[0], roomCode: 'u2', prices: [] },
    ],
  };
  const res = bookingToReservations(leer(dos), ctx);
  assert.deepEqual(
    res.items.map((i) => i.reservation.id),
    ['cm-LOOMI-1-B123-1', 'cm-LOOMI-1-B123-2']
  );
  assert.equal(res.items[0].reservation.totalAmount, 150);
  assert.equal(channelReservationId('H', 'B', 1, 2), 'cm-H-B-2');
});

prueba('habitación no conectada: no se pierde, se informa', () => {
  const res = bookingToReservations(leer({ ...book, rooms: [{ ...book.rooms[0], roomCode: 'zzz' }] }), ctx);
  assert.equal(res.items.length, 0);
  assert.deepEqual(res.unknownRooms, ['zzz']);
});

prueba('mismo book dos veces da el mismo id (un reintento no duplica)', () => {
  const a = bookingToReservations(leer(book), ctx).items[0].reservation.id;
  const b = bookingToReservations(leer(book), ctx).items[0].reservation.id;
  assert.equal(a, b);
});

prueba('modify: cambia fechas e importes y no toca lo demás', () => {
  const original = bookingToReservations(leer(book), ctx).items[0].reservation;
  const existente: Reservation = { ...original, specialNotes: 'nota del anfitrión', pinCode: '1234' };
  const modificada = leer({
    ...book,
    action: 'modify',
    checkout: '2026-12-14',
    rooms: [{ ...book.rooms[0], prices: [...book.rooms[0].prices, { date: '2026-12-13', sellRate: 100 }] }],
  });
  const siguiente = bookingToReservations(modificada, ctx).items[0].reservation;
  const parche = modificationPatch(existente, siguiente);
  assert.deepEqual(parche, { checkOut: '2026-12-14', nights: 4, totalAmount: 400, netRevenue: 400 });
  assert.equal('pinCode' in parche, false);
  assert.equal('specialNotes' in parche, false);
});

prueba('modify sin cambios devuelve un parche vacío', () => {
  const r = bookingToReservations(leer(book), ctx).items[0].reservation;
  assert.deepEqual(modificationPatch(r, { ...r }), {});
});

prueba('modify no pisa el estado de pago si ya hay pagos cargados', () => {
  const r = bookingToReservations(leer(book), ctx).items[0].reservation;
  const conPago: Reservation = {
    ...r,
    paymentStatus: 'deposit_only',
    payments: [{ id: 'p1', date: '2026-11-07', amount: 50, currency: 'USD', rate: 1, amountSettlement: 50, method: 'efectivo' }],
  };
  assert.equal('paymentStatus' in modificationPatch(conPago, { ...r }), false);
});

console.log('Loomi → Aiosell');

const unidades = [
  { propertyId: 'prop-1', roomCode: 'u1' },
  { propertyId: 'prop-2', roomCode: 'u2' },
];

prueba('disponibilidad: libre, ocupada y libre otra vez', () => {
  const body = availabilityUpdates({
    hotelCode: 'LOOMI-1',
    units: [unidades[0]],
    reservations: [{ propertyId: 'prop-1', checkIn: '2026-12-03', checkOut: '2026-12-05', status: 'confirmed' }],
    from: '2026-12-01',
    days: 7,
  });
  assert.deepEqual(body, {
    hotelCode: 'LOOMI-1',
    updates: [
      { startDate: '2026-12-01', endDate: '2026-12-02', rooms: [{ roomCode: 'u1', available: 1 }] },
      { startDate: '2026-12-03', endDate: '2026-12-04', rooms: [{ roomCode: 'u1', available: 0 }] },
      { startDate: '2026-12-05', endDate: '2026-12-07', rooms: [{ roomCode: 'u1', available: 1 }] },
    ],
  });
});

prueba('disponibilidad: el día de salida queda libre y las canceladas no cuentan', () => {
  const body = availabilityUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    reservations: [
      { propertyId: 'prop-1', checkIn: '2026-12-01', checkOut: '2026-12-02', status: 'confirmed' },
      { propertyId: 'prop-1', checkIn: '2026-12-02', checkOut: '2026-12-04', status: 'cancelled' },
    ],
    from: '2026-12-01',
    days: 3,
  });
  assert.deepEqual(body.updates, [
    { startDate: '2026-12-01', endDate: '2026-12-01', rooms: [{ roomCode: 'u1', available: 0 }] },
    { startDate: '2026-12-02', endDate: '2026-12-03', rooms: [{ roomCode: 'u1', available: 1 }] },
  ]);
});

prueba('disponibilidad: unidades con el mismo tramo se mandan juntas', () => {
  const body = availabilityUpdates({
    hotelCode: 'H',
    units: unidades,
    reservations: [],
    from: '2026-12-01',
    days: 3,
  });
  assert.deepEqual(body.updates, [
    {
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      rooms: [
        { roomCode: 'u1', available: 1 },
        { roomCode: 'u2', available: 1 },
      ],
    },
  ]);
});

prueba('disponibilidad: cada unidad tiene sus propios tramos', () => {
  const body = availabilityUpdates({
    hotelCode: 'H',
    units: unidades,
    reservations: [{ propertyId: 'prop-2', checkIn: '2026-12-02', checkOut: '2026-12-03', status: 'confirmed' }],
    from: '2026-12-01',
    days: 3,
  });
  assert.deepEqual(body.updates, [
    { startDate: '2026-12-01', endDate: '2026-12-01', rooms: [{ roomCode: 'u2', available: 1 }] },
    { startDate: '2026-12-01', endDate: '2026-12-03', rooms: [{ roomCode: 'u1', available: 1 }] },
    { startDate: '2026-12-02', endDate: '2026-12-02', rooms: [{ roomCode: 'u2', available: 0 }] },
    { startDate: '2026-12-03', endDate: '2026-12-03', rooms: [{ roomCode: 'u2', available: 1 }] },
  ]);
});

prueba('endInclusive: false suma un día al final de cada tramo', () => {
  const body = availabilityUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    reservations: [],
    from: '2026-12-01',
    days: 3,
    endInclusive: false,
  });
  assert.deepEqual(body.updates, [{ startDate: '2026-12-01', endDate: '2026-12-04', rooms: [{ roomCode: 'u1', available: 1 }] }]);
});

const props = [
  { id: 'prop-1', name: 'Uno', basePrice: 80 },
  { id: 'prop-2', name: 'Dos', basePrice: 0 },
] as unknown as Property[];

const tarifas: PricingSettings = {
  ...defaultPricing(),
  types: [{ id: 't1', name: 'Depto' }],
  assignments: { 'prop-1': 't1' },
  weekendNights: [5, 6, 0],
  normal: { minNights: 2, precios: { t1: { semana: 100, finde: 150 } } },
  seasons: [
    { id: 's1', name: 'Verano', desde: '2026-12-14', hasta: '2026-12-31', minNights: 5, precios: { t1: { semana: 200, finde: 250 } } },
  ],
  longWeekends: [],
  longWeekendPrices: {},
};

prueba('precios: semana, finde y temporada, en tramos', () => {
  // 2026-12-10 jueves … 2026-12-15 martes; la temporada (verano) arranca el lunes 14
  const body = rateUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    properties: props,
    pricing: tarifas,
    from: '2026-12-10',
    days: 6,
  });
  assert.deepEqual(body.updates, [
    { startDate: '2026-12-10', endDate: '2026-12-10', rates: [{ roomCode: 'u1', rateplanCode: 'STD', rate: 100 }] },
    { startDate: '2026-12-11', endDate: '2026-12-13', rates: [{ roomCode: 'u1', rateplanCode: 'STD', rate: 150 }] },
    { startDate: '2026-12-14', endDate: '2026-12-15', rates: [{ roomCode: 'u1', rateplanCode: 'STD', rate: 200 }] },
  ]);
});

prueba('precios: "Tarifas + X %" y "Tarifas − X %"', () => {
  const mas = rateUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    properties: props,
    pricing: tarifas,
    from: '2026-12-10',
    days: 1,
    adjustment: { percent: 15 },
  });
  assert.equal(mas.updates[0].rates[0].rate, 115);
  const menos = rateUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    properties: props,
    pricing: tarifas,
    from: '2026-12-10',
    days: 1,
    adjustment: { percent: -10 },
  });
  assert.equal(menos.updates[0].rates[0].rate, 90);
});

prueba('precios: sin precio cargado, esa unidad no se manda', () => {
  const body = rateUpdates({
    hotelCode: 'H',
    units: unidades,
    properties: props,
    pricing: tarifas,
    from: '2026-12-10',
    days: 1,
  });
  assert.deepEqual(
    body.updates.flatMap((u) => u.rates.map((r) => r.roomCode)),
    ['u1']
  );
});

prueba('estadía mínima: normal 2, verano 5', () => {
  const body = minimumStayUpdates({
    hotelCode: 'H',
    units: [unidades[0]],
    properties: props,
    pricing: tarifas,
    from: '2026-12-12',
    days: 4,
  });
  assert.deepEqual(body.updates, [
    { startDate: '2026-12-12', endDate: '2026-12-13', rooms: [{ roomCode: 'u1', restrictions: { minimumStay: 2 } }] },
    { startDate: '2026-12-14', endDate: '2026-12-15', rooms: [{ roomCode: 'u1', restrictions: { minimumStay: 5 } }] },
  ]);
});

prueba('un año completo se calcula rápido', () => {
  const t0 = Date.now();
  const diez = Array.from({ length: 10 }, (_, i) => ({ propertyId: `p${i}`, roomCode: `r${i}` }));
  const todas = diez.map((u) => ({ id: u.propertyId, name: u.propertyId, basePrice: 100 })) as unknown as Property[];
  rateUpdates({ hotelCode: 'H', units: diez, properties: todas, pricing: null, from: '2026-11-06', days: 365 });
  availabilityUpdates({ hotelCode: 'H', units: diez, reservations: [], from: '2026-11-06', days: 365 });
  assert.ok(Date.now() - t0 < 3000, 'tardó demasiado');
});

console.log(process.exitCode ? '\nHay pruebas que fallaron' : `\n${pasadas} pruebas pasaron`);
