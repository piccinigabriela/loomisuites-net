/**
 * Lo que la app le manda a Xenia (Claude) sobre el complejo: lo justo para contestar.
 * Sin teléfonos, mails, claves de wifi ni documentos; huéspedes solo por su primer nombre.
 */
import type { DemoState } from '../types';

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const firstName = (n?: string) => (n || '').trim().split(/\s+/)[0] || 'Huésped';

export function buildXeniaContext(state: Partial<DemoState> | null | undefined) {
  const s = state || {};
  const today = localDate();
  const props = s.properties || [];
  const unit = (id: string) => props.find((p) => p.id === id)?.name || 'Unidad';
  const active = (s.reservations || []).filter((r) => r.status !== 'cancelled');
  const brief = (r: any) => ({
    huesped: firstName(r.guestName),
    unidad: unit(r.propertyId),
    llegada: r.checkIn,
    salida: r.checkOut,
    noches: r.nights,
    canal: r.platform,
    personas: r.guests,
    saldoPendiente: r.paymentStatus !== 'paid',
  });

  const monthPrefix = today.slice(0, 7);
  const ofMonth = active.filter((r) => (r.checkIn || '').startsWith(monthPrefix));
  const sum = (list: any[], k: string) => Math.round(list.reduce((a, r) => a + (Number(r[k]) || 0), 0));

  const horizonDate = new Date();
  horizonDate.setMonth(horizonDate.getMonth() + 6);
  const horizon = localDate(horizonDate);

  const pendingCleanings = (s.cleaningTasks || []).filter((t) => t.status === 'pending' && t.date >= today);

  return {
    hoy: today,
    complejo: s.welcomeGuide?.propertyName || '',
    horarios: { ingreso: s.welcomeGuide?.checkinHour || '', salida: s.welcomeGuide?.checkoutHour || '' },
    moneda: s.currencySettings?.settlementCurrency || 'ARS',
    unidades: props.map((p) => ({ nombre: p.name, capacidad: p.maxGuests, estado: p.status })),
    alojadosHoy: active.filter((r) => r.checkIn <= today && r.checkOut > today).map(brief),
    ingresosHoy: active.filter((r) => r.checkIn === today).map(brief),
    salidasHoy: active.filter((r) => r.checkOut === today).map(brief),
    proximosIngresos: active
      .filter((r) => r.checkIn > today)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 12)
      .map(brief),
    esteMes: {
      reservas: ofMonth.length,
      total: sum(ofMonth, 'totalAmount'),
      neto: sum(ofMonth, 'netRevenue'),
      comisiones: sum(ofMonth, 'commissionPaid'),
      directas: ofMonth.filter((r) => r.platform === 'direct').length,
      porUnidad: props.map((p) => {
        const list = ofMonth.filter((r) => r.propertyId === p.id);
        return { unidad: p.name, reservas: list.length, noches: sum(list, 'nights'), total: sum(list, 'totalAmount'), neto: sum(list, 'netRevenue') };
      }),
    },
    // Para disponibilidad: por unidad, las reservas de los próximos 6 meses (la salida es el día que se van; esa noche queda libre)
    ocupacionPorUnidad: props.map((p) => ({
      unidad: p.name,
      reservas: active
        .filter((r) => r.propertyId === p.id && r.checkOut > today && r.checkIn <= horizon)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
        .slice(0, 30)
        .map((r) => ({ llegada: r.checkIn, salida: r.checkOut, huesped: firstName(r.guestName) })),
    })),
    limpiezasPendientes: pendingCleanings.length,
    opcionales: (s.availableAddons || []).map((a: any) => ({ nombre: a.name, precio: a.price })),
  };
}
