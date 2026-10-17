import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Sparkles,
  Info,
  Layers,
  CircleDollarSign,
  Receipt,
  Scale,
  Coins,
} from 'lucide-react';
import { DemoState, Reservation, CurrencyCode } from '../../types';
import { formatCurrency, formatDisplayDate, toLocalDateStr } from '../../data/initialData';
import { isAppMode } from '../../lib/appMode';
import { OwnerReport } from './OwnerReport';
import { countsForReport, isInPeriod, ReportPeriod } from '../../lib/ownerReport';

interface DemoFinancesProps {
  demoState: DemoState;
  onUpdateCurrencySettings?: (settings: {
    settlementCurrency: CurrencyCode;
    rates: Partial<Record<CurrencyCode, number>>;
    ratesUpdatedAt?: string;
  }) => void;
  onUpdateManagementSettings?: (settings: { enabled: boolean; percent: number }) => void;
}

type MonthPoint = { month: string; occupancy: number; revenue: number; nights: number; directPct?: number; isCurrent?: boolean };

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const parseLocalDate = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

/**
 * Últimos `count` meses (incluido el actual) calculados con las reservas reales.
 * Cada estadía se reparte por noche: si cruza de un mes a otro, cada mes se lleva sus noches
 * y la parte proporcional del total. Ocupación = noches vendidas / (unidades × días del mes).
 */
export function buildMonthlyFromReservations(
  reservations: Reservation[],
  unitsCount: number,
  today: Date = new Date(),
  count = 6
): MonthPoint[] {
  const months: { y: number; m: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth() });
  }
  const acc = months.map(() => ({ nights: 0, revenue: 0 }));
  const indexOf = (y: number, m: number) => months.findIndex((x) => x.y === y && x.m === m);

  for (const r of reservations) {
    const start = parseLocalDate(r.checkIn);
    const end = parseLocalDate(r.checkOut);
    if (!start || !end || end <= start) continue;
    const totalNights = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (totalNights <= 0) continue;
    const perNight = (r.totalAmount || 0) / totalNights;
    const cursor = new Date(start);
    for (let n = 0; n < totalNights; n++) {
      const idx = indexOf(cursor.getFullYear(), cursor.getMonth());
      if (idx >= 0) {
        acc[idx].nights += 1;
        acc[idx].revenue += perNight;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return months.map((mo, i) => {
    const daysInMonth = new Date(mo.y, mo.m + 1, 0).getDate();
    const capacity = Math.max(1, unitsCount) * daysInMonth;
    return {
      month: MONTH_SHORT[mo.m],
      revenue: Math.round(acc[i].revenue),
      nights: acc[i].nights,
      occupancy: Math.min(100, Math.round((acc[i].nights / capacity) * 100)),
      isCurrent: i === months.length - 1,
    };
  });
}

const MONTHLY_DATA: MonthPoint[] = [
  { month: 'May', occupancy: 72, revenue: 3840, directPct: 35, nights: 58 },
  { month: 'Jun', occupancy: 68, revenue: 3420, directPct: 40, nights: 51 },
  { month: 'Jul', occupancy: 88, revenue: 5120, directPct: 48, nights: 74 },
  { month: 'Ago', occupancy: 76, revenue: 4210, directPct: 52, nights: 62 },
  { month: 'Sep', occupancy: 82, revenue: 4690, directPct: 58, nights: 67 },
  { month: 'Oct', occupancy: 91, revenue: 5860, directPct: 64, nights: 78, isCurrent: true },
];

export const DemoFinances: React.FC<DemoFinancesProps> = ({
  demoState,
  onUpdateCurrencySettings,
  onUpdateManagementSettings,
}) => {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [metricView, setMetricView] = useState<'both' | 'revenue' | 'occupancy'>('both');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Moneda y cotizaciones
  const currentCurrency = demoState.currencySettings?.settlementCurrency || 'USD';
  const currentRates = demoState.currencySettings?.rates || {};
  const currentRatesUpdatedAt = demoState.currencySettings?.ratesUpdatedAt || '';

  const [settlementCurrency, setSettlementCurrency] = useState<CurrencyCode>(currentCurrency);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({
    ARS: currentRates.ARS !== undefined ? String(currentRates.ARS) : '',
    USD: currentRates.USD !== undefined ? String(currentRates.USD) : '',
    BRL: currentRates.BRL !== undefined ? String(currentRates.BRL) : '',
    EUR: currentRates.EUR !== undefined ? String(currentRates.EUR) : '',
  });
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [currencyNotice, setCurrencyNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setSettlementCurrency(currentCurrency);
    setRateInputs({
      ARS: currentRates.ARS !== undefined ? String(currentRates.ARS) : '',
      USD: currentRates.USD !== undefined ? String(currentRates.USD) : '',
      BRL: currentRates.BRL !== undefined ? String(currentRates.BRL) : '',
      EUR: currentRates.EUR !== undefined ? String(currentRates.EUR) : '',
    });
  }, [currentCurrency, JSON.stringify(currentRates)]);

  const handleSettlementCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === settlementCurrency) return;

    if (demoState.reservations && demoState.reservations.length > 0) {
      const confirmed = confirm(
        '⚠️ Todos los totales, tarifas y reportes se muestran en esta moneda. Cambiarla no convierte los montos ya cargados. ¿Deseás cambiar la moneda de liquidación?'
      );
      if (!confirmed) return;
    }

    setSettlementCurrency(newCurrency);
    setRateInputs({ ARS: '', USD: '', BRL: '', EUR: '' });
    setCurrencyNotice('Cambiaste la moneda de liquidación: volvé a cargar las cotizaciones.');

    onUpdateCurrencySettings?.({
      settlementCurrency: newCurrency,
      rates: {},
      ratesUpdatedAt: '',
    });
  };

  const handleSaveRates = () => {
    const updatedRates: Partial<Record<CurrencyCode, number>> = {};
    (['ARS', 'USD', 'BRL', 'EUR'] as CurrencyCode[]).forEach((code) => {
      if (code !== settlementCurrency && rateInputs[code] !== undefined && rateInputs[code] !== '') {
        const val = parseFloat(rateInputs[code]);
        if (!isNaN(val) && val > 0) {
          updatedRates[code] = val;
        }
      }
    });

    const now = new Date();
    const formattedDate = `${toLocalDateStr(now)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onUpdateCurrencySettings?.({
      settlementCurrency,
      rates: updatedRates,
      ratesUpdatedAt: formattedDate,
    });

    setCurrencyNotice(null);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const ALL_CURRENCIES: { code: CurrencyCode; label: string }[] = [
    { code: 'ARS', label: 'Pesos argentinos (ARS)' },
    { code: 'USD', label: 'Dólares (USD)' },
    { code: 'BRL', label: 'Reales (BRL)' },
    { code: 'EUR', label: 'Euros (EUR)' },
  ];

  const otherCurrencies = ALL_CURRENCIES.filter((c) => c.code !== settlementCurrency);

  // Filtrado y cálculos
  const activeReservations = demoState.reservations.filter(
    (r) => r.status !== 'cancelled'
  );

  const displayedReservations =
    selectedPropertyId === 'all'
      ? activeReservations
      : activeReservations.filter((r) => r.propertyId === selectedPropertyId);
  // En la app, la tabla de estadías sigue al período elegido en Rendimiento
  const periodReservations = activeReservations
    .filter((r) => countsForReport(r) && isInPeriod(r.checkIn, reportPeriod))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const grossRevenue = displayedReservations.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  );

  const totalOtaCommissions = displayedReservations.reduce(
    (sum, r) => sum + (r.commissionPaid || 0),
    0
  );

  const totalCleaningFees = displayedReservations.reduce(
    (sum, r) => sum + (r.cleaningFee || 0),
    0
  );

  const totalNights = displayedReservations.reduce(
    (sum, r) => sum + (r.nights || 0),
    0
  );

  const adr = totalNights > 0 ? Math.round(grossRevenue / totalNights) : 0;
  const netRevenue = grossRevenue - totalOtaCommissions;

  // Cálculo de liquidación a propietario
  const agencyFee = Math.round(
    (netRevenue - totalCleaningFees) * (commissionRate / 100)
  );
  const ownerPayout = Math.max(0, netRevenue - totalCleaningFees - agencyFee);

  const selectedProperty =
    selectedPropertyId === 'all'
      ? null
      : demoState.properties.find((p) => p.id === selectedPropertyId);

  // Datos del gráfico: en la app, calculados con las reservas reales; en la demo, la serie de ejemplo.
  const isApp = isAppMode();
  const today = new Date();
  const unitsCount = selectedPropertyId === 'all' ? demoState.properties.length : 1;
  const chartData: MonthPoint[] = isApp
    ? buildMonthlyFromReservations(displayedReservations, unitsCount, today)
    : MONTHLY_DATA;
  const firstMonthDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const chartRangeLabel = isApp
    ? `${MONTH_LONG[firstMonthDate.getMonth()]}${firstMonthDate.getFullYear() !== today.getFullYear() ? ` ${firstMonthDate.getFullYear()}` : ''} - ${MONTH_LONG[today.getMonth()]} ${today.getFullYear()}`
    : 'Mayo - Octubre 2026';
  const hasChartData = chartData.some((d) => d.nights > 0);

  // Comparación real del mes actual contra el anterior (solo en la app)
  const currentMonthRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousMonthRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const monthDeltaPct =
    previousMonthRevenue > 0 ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) : null;

  // Cobrado real según los pagos registrados (las reservas viejas marcadas "pagado" sin pagos cuentan completas)
  const collectedFor = (r: Reservation) => {
    if (r.payments && r.payments.length > 0) {
      return r.payments.reduce((sum, p) => sum + (p.amountSettlement || 0), 0);
    }
    return r.paymentStatus === 'paid' ? r.totalAmount || 0 : 0;
  };
  const totalCollected = displayedReservations.reduce((sum, r) => sum + collectedFor(r), 0);
  const totalPending = displayedReservations.reduce(
    (sum, r) => sum + Math.max(0, (r.totalAmount || 0) - collectedFor(r)),
    0
  );

  // SVG Chart Math
  const chartW = 600;
  const chartH = 150;
  const padX = 24;
  const padY = 20;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const maxChartRevenue = Math.max(...chartData.map((d) => d.revenue), 0);
  const maxRev = isApp ? Math.max(1, Math.ceil(maxChartRevenue * 1.15)) : 6500;
  const minRev = isApp ? 0 : 2500;
  const maxOcc = 100;
  const minOcc = isApp ? 0 : 50;

  // Coordinates calculation
  const revPoints = chartData.map((d, i) => {
    const x = padX + (i / (chartData.length - 1)) * innerW;
    const norm = (d.revenue - minRev) / (maxRev - minRev);
    const y = padY + innerH - norm * innerH;
    return { x, y, val: d.revenue, label: d.month };
  });

  const occPoints = chartData.map((d, i) => {
    const x = padX + (i / (chartData.length - 1)) * innerW;
    const norm = (d.occupancy - minOcc) / (maxOcc - minOcc);
    const y = padY + innerH - norm * innerH;
    return { x, y, val: d.occupancy, label: d.month };
  });

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, p, idx, arr) => {
      if (idx === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = arr[idx - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (p.x - prev.x) / 2;
      const cp2y = p.y;
      return `${acc} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');
  };

  const revPath = buildPath(revPoints);
  const occPath = buildPath(occPoints);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {isApp && (
        <OwnerReport
          demoState={demoState}
          period={reportPeriod}
          onPeriodChange={setReportPeriod}
          onUpdateManagementSettings={onUpdateManagementSettings}
        />
      )}

      {/* Moneda y cotización Card */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
          <div>
            <span className="air-hide text-[10px] tracking-widest text-[#E67E22] uppercase font-bold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> MONEDA PRINCIPAL & COTIZACIONES
            </span>
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 mt-0.5">
              Moneda y cotización
            </h3>
          </div>
          {savedToast && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              ✓ Cotizaciones guardadas
            </span>
          )}
          {currencyNotice && (
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 animate-in fade-in">
              ⚠️ {currencyNotice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
          {/* Select Moneda de liquidación */}
          <div className="lg:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Moneda de liquidación:
            </label>
            <select
              value={settlementCurrency}
              onChange={(e) => handleSettlementCurrencyChange(e.target.value as CurrencyCode)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 cursor-pointer"
            >
              <option value="ARS">Pesos argentinos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="BRL">Reales (BRL)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-1">
              Todos los totales, tarifas y reportes se muestran en esta moneda. Cambiarla no convierte los montos ya cargados.
            </p>
          </div>

          {/* Rate inputs for other 3 currencies */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center gap-3">
            {otherCurrencies.map((curr) => (
              <div key={curr.code} className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  1 {curr.code} =
                </label>
                <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-zinc-800 p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Cotización"
                    value={rateInputs[curr.code] || ''}
                    onChange={(e) => setRateInputs({ ...rateInputs, [curr.code]: e.target.value })}
                    className="w-full text-xs font-bold bg-transparent focus:outline-none text-stone-800 dark:text-stone-100 font-mono"
                  />
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 shrink-0 pr-1">
                    {settlementCurrency}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleSaveRates}
              className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0 self-end sm:self-center"
            >
              Guardar cotizaciones
            </button>
          </div>
        </div>

        {currentRatesUpdatedAt && (
          <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium pt-1">
            Actualizada el {currentRatesUpdatedAt}
          </p>
        )}
      </div>

      {/* Header Zen */}
      {!isApp && (<>
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
            <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
              Finanzas & Reportes de Rendimiento
            </span>
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">·</span>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold">Claridad Operativa</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Control de Rendimiento & <span className="font-extrabold text-gray-900 dark:text-white">Liquidación</span>
          </h2>
          <p className="air-hide text-xs text-gray-600 dark:text-gray-400 font-medium max-w-xl">
            Flujo consolidado de facturación, comisiones de canales y liquidación mensual a propietarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Unidad */}
          <div className="flex items-center gap-2 bg-gray-50/90 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            <Building className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-zinc-800 dark:text-gray-100">Todas las Unidades (Complejo)</option>
              {demoState.properties.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-zinc-800 dark:text-gray-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            title="Exportar reporte"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 4 Métricas Zen Flotantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Facturación Bruta */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>Facturación Bruta</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatCurrency(grossRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            {!isApp ? (
              <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[10px] font-bold">
                +14% vs mes ant.
              </span>
            ) : (
              monthDeltaPct !== null && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    monthDeltaPct >= 0
                      ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                  }`}
                  title="Facturación de este mes comparada con el mes anterior"
                >
                  {monthDeltaPct >= 0 ? '+' : ''}
                  {monthDeltaPct}% vs mes ant.
                </span>
              )
            )}
            <span>{displayedReservations.length} reservas</span>
          </div>
        </div>

        {/* Comisiones OTAs */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>Comisiones OTAs</span>
            <span className="text-[10px] text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded font-semibold">
              Airbnb / Booking
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-800 dark:text-stone-200 tracking-tight mt-1">
            <span className="text-orange-600 dark:text-orange-400 mr-1 text-lg font-bold">-</span>
            {formatCurrency(totalOtaCommissions)}
          </div>
          <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            Retención de canales externos
          </p>
        </div>

        {/* Tarifa Promedio (ADR) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>Tarifa Promedio (ADR)</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Noche</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatCurrency(adr)}
          </div>
          <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            Promedio sobre {totalNights} noches vendidas
          </p>
        </div>

        {/* Ingreso Neto */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>{isApp ? 'Cobrado' : 'Ingreso Neto Cobrado'}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
              {isApp ? 'Pagos registrados' : 'Disponible'}
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight mt-1">
            {formatCurrency(isApp ? totalCollected : netRevenue)}
          </div>
          <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            {isApp
              ? totalPending > 0
                ? `Falta cobrar ${formatCurrency(totalPending)} · Neto de comisiones ${formatCurrency(netRevenue)}`
                : `Sin saldos pendientes · Neto de comisiones ${formatCurrency(netRevenue)}`
              : 'Limpio acreditado en cuentas'}
          </p>
        </div>
      </div>

      </>)}

      {/* Gráfico Semestral */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Tendencia Semestral
              </span>
              <span className="text-gray-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{chartRangeLabel}</span>
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
              Curvas de Ocupación & Facturación Flotantes
            </h3>
            <p className="air-hide text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
              Trazo refinado para apreciar la evolución de ingresos y ocupación en tiempo real.
            </p>
          </div>

          {/* Segmented controls */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200/70 dark:border-zinc-700 text-xs font-semibold">
            <button
              onClick={() => setMetricView('both')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'both'
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Ambas Curvas
            </button>
            <button
              onClick={() => setMetricView('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'revenue'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="w-2 h-0.5 bg-emerald-500 rounded-full inline-block"></span>
              <span>Ingresos</span>
            </button>
            <button
              onClick={() => setMetricView('occupancy')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'occupancy'
                  ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="w-2 h-0.5 bg-[#E67E22] rounded-full inline-block"></span>
              <span>Ocupación</span>
            </button>
          </div>
        </div>

        {/* Canvas SVG Minimalista Zen */}
        <div className="relative pt-6 pb-2">
          {/* Leyenda */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium mb-4 px-2">
            <div className="flex items-center gap-4">
              {(metricView === 'both' || metricView === 'revenue') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-emerald-600 inline-block"></span>
                  <span className="text-gray-700 dark:text-gray-300">Facturación ({currentCurrency})</span>
                </div>
              )}
              {(metricView === 'both' || metricView === 'occupancy') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#E67E22] inline-block"></span>
                  <span className="text-gray-700 dark:text-gray-300">Ocupación (%)</span>
                </div>
              )}
            </div>

            {hoveredMonthIndex !== null ? (
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-gray-200 dark:border-zinc-700 animate-in fade-in">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {chartData[hoveredMonthIndex].month}:
                </span>{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {formatCurrency(chartData[hoveredMonthIndex].revenue)}
                </span>{' '}
                ·{' '}
                <span className="text-[#E67E22] font-bold">
                  {chartData[hoveredMonthIndex].occupancy}% Ocupación
                </span>{' '}
                ({chartData[hoveredMonthIndex].nights} noches)
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                {isApp && !hasChartData
                  ? 'Todavía no hay estadías en estos meses: el gráfico se completa solo con tus reservas.'
                  : 'Pasá el mouse sobre los puntos para ver el detalle mensual'}
              </span>
            )}
          </div>

          <div className="w-full overflow-hidden bg-white dark:bg-[#18191E]">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-44 sm:h-52 select-none overflow-visible"
            >
              <line
                x1={padX}
                y1={padY + innerH}
                x2={chartW - padX}
                y2={padY + innerH}
                stroke="#E5E7EB"
                strokeWidth="1"
                className="dark:stroke-zinc-800"
              />
              <line
                x1={padX}
                y1={padY + innerH / 2}
                x2={chartW - padX}
                y2={padY + innerH / 2}
                stroke="#F3F4F6"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="dark:stroke-zinc-800/60"
              />

              {/* Curva de Ingresos */}
              {(metricView === 'both' || metricView === 'revenue') && (
                <>
                  <path
                    d={revPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90 transition-all duration-300"
                  />
                  {revPoints.map((p, i) => (
                    <g
                      key={`rev-${i}`}
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredMonthIndex === i ? 4.5 : 3}
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth="2"
                        className="transition-all duration-200 dark:fill-zinc-900"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Curva de Ocupación */}
              {(metricView === 'both' || metricView === 'occupancy') && (
                <>
                  <path
                    d={occPath}
                    fill="none"
                    stroke="#E67E22"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90 transition-all duration-300"
                  />
                  {occPoints.map((p, i) => (
                    <g
                      key={`occ-${i}`}
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredMonthIndex === i ? 4.5 : 3}
                        fill="#FFFFFF"
                        stroke="#E67E22"
                        strokeWidth="2"
                        className="transition-all duration-200 dark:fill-zinc-900"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Etiquetas X */}
              {revPoints.map((p, i) => (
                <text
                  key={`month-${i}`}
                  x={p.x}
                  y={chartH - 2}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold fill-gray-500 dark:fill-gray-400 select-none ${
                    hoveredMonthIndex === i ? 'fill-gray-900 dark:fill-white font-bold' : ''
                  }`}
                >
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Grid: Balances de Cobros por Reserva + Liquidación Propietario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla de Balances */}
        <div className={`${isApp ? 'lg:col-span-12' : 'lg:col-span-7'} bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)]`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-2">
            <div>
              <span className="air-hide text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Balance Consolidado
              </span>
              <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                Flujo de Cobros por Estadía
              </h4>
              <p className="air-hide text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Revisión clara de cada liquidación realizada.
              </p>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              {(isApp ? periodReservations : displayedReservations).length} estadías
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  <th className="py-3 px-2">Huésped / Unidad</th>
                  <th className="py-3 px-2">Canal</th>
                  <th className="py-3 px-2 text-right">Bruto</th>
                  <th className="py-3 px-2 text-right">Comisión</th>
                  <th className="py-3 px-2 text-right">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {(isApp ? periodReservations : displayedReservations).map((res) => {
                  const prop = demoState.properties.find(
                    (p) => p.id === res.propertyId
                  );
                  const isDirect = res.platform === 'direct';

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors text-xs font-medium"
                    >
                      <td className="py-4 px-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            {res.guestName}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {prop?.name || 'Sin unidad asignada'} · {res.nights} noches (
                            {formatDisplayDate(res.checkIn)})
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded capitalize font-bold ${
                            isDirect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-orange-50 dark:bg-orange-950/40 text-[#E67E22]'
                          }`}
                        >
                          {isDirect ? 'Directo (0%)' : res.platform}
                        </span>
                      </td>

                      <td className="py-4 px-2 text-right font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(res.totalAmount)}
                      </td>

                      <td className="py-4 px-2 text-right">
                        {res.commissionPaid > 0 ? (
                          <span className="text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            -{formatCurrency(res.commissionPaid)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            {formatCurrency(0)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-2 text-right">
                        <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                          {formatCurrency(res.netRevenue || res.totalAmount - res.commissionPaid)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generador de Liquidación Propietario */}
        {!isApp && (
        <div className="lg:col-span-5 bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <span className="air-hide text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Rendición de Cuentas
              </span>
              <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                Liquidación a Propietario
              </h4>
              <p className="air-hide text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Cálculo transparente para enviar por WhatsApp o correo sin disputas.
              </p>
            </div>

            {/* Selectores */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1.5">
                  Honorario de Co-hosting / Administración:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCommissionRate(rate)}
                      className={`py-2 text-xs rounded-xl border transition-all cursor-pointer font-bold ${
                        commissionRate === rate
                          ? 'border-[#E67E22]/50 bg-orange-50 dark:bg-orange-950/50 text-[#E67E22] shadow-xs'
                          : 'border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen de Liquidación */}
            <div className="bg-[#FAF9F6] dark:bg-[#15161A] rounded-2xl p-5 border border-stone-200/80 dark:border-zinc-800 space-y-3.5 text-xs font-medium">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-zinc-800">
                <span className="text-gray-600 dark:text-gray-400">Propiedad liquidada:</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  {selectedProperty ? selectedProperty.name : 'Complejo Consolidado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Facturado Bruto:</span>
                <span className="text-gray-800 dark:text-gray-100 font-bold">
                  {formatCurrency(grossRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between text-orange-700 dark:text-orange-400">
                <span className="text-gray-600 dark:text-gray-400">Comisiones de Canales (OTAs):</span>
                <span className="font-bold">-{formatCurrency(totalOtaCommissions)}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span className="text-gray-600 dark:text-gray-400">Costos de Limpieza y Reposición:</span>
                <span className="font-bold">-{formatCurrency(totalCleaningFees)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-zinc-800 text-[#E67E22]">
                <span className="text-gray-600 dark:text-gray-400">Honorarios Gestor ({commissionRate}%):</span>
                <span className="font-bold">-{formatCurrency(agencyFee)}</span>
              </div>

              {/* Total Final */}
              <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block">
                    Neto a Transferir al Propietario
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    Libre de comisiones y gastos operativos
                  </span>
                </div>
                <div className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                  {formatCurrency(ownerPayout)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100 dark:border-zinc-800 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Listo para liquidación bancaria
            </span>
            <button
              onClick={handlePrint}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
