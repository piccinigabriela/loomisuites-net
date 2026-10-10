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
} from 'lucide-react';
import { DemoState, Reservation } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../data/initialData';

interface DemoFinancesProps {
  demoState: DemoState;
}

const MONTHLY_DATA = [
  { month: 'May', occupancy: 72, revenue: 3840, directPct: 35, nights: 58 },
  { month: 'Jun', occupancy: 68, revenue: 3420, directPct: 40, nights: 51 },
  { month: 'Jul', occupancy: 88, revenue: 5120, directPct: 48, nights: 74 },
  { month: 'Ago', occupancy: 76, revenue: 4210, directPct: 52, nights: 62 },
  { month: 'Sep', occupancy: 82, revenue: 4690, directPct: 58, nights: 67 },
  { month: 'Oct', occupancy: 91, revenue: 5860, directPct: 64, nights: 78, isCurrent: true },
];

export const DemoFinances: React.FC<DemoFinancesProps> = ({ demoState }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [metricView, setMetricView] = useState<'both' | 'revenue' | 'occupancy'>('both');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Filtrado y cálculos
  const activeReservations = demoState.reservations.filter(
    (r) => r.status !== 'cancelled'
  );

  const displayedReservations =
    selectedPropertyId === 'all'
      ? activeReservations
      : activeReservations.filter((r) => r.propertyId === selectedPropertyId);

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

  // SVG Chart Math
  const chartW = 600;
  const chartH = 150;
  const padX = 24;
  const padY = 20;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const maxRev = 6500;
  const minRev = 2500;
  const maxOcc = 100;
  const minOcc = 50;

  // Coordinates calculation
  const revPoints = MONTHLY_DATA.map((d, i) => {
    const x = padX + (i / (MONTHLY_DATA.length - 1)) * innerW;
    const norm = (d.revenue - minRev) / (maxRev - minRev);
    const y = padY + innerH - norm * innerH;
    return { x, y, val: d.revenue, label: d.month };
  });

  const occPoints = MONTHLY_DATA.map((d, i) => {
    const x = padX + (i / (MONTHLY_DATA.length - 1)) * innerW;
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
      {/* Header Zen */}
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
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium max-w-xl">
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
            <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[10px] font-bold">
              +14% vs mes ant.
            </span>
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
            <span>Ingreso Neto Cobrado</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
              Disponible
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight mt-1">
            {formatCurrency(netRevenue)}
          </div>
          <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            Limpio acreditado en cuentas
          </p>
        </div>
      </div>

      {/* Gráfico Semestral */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Tendencia Semestral
              </span>
              <span className="text-gray-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Mayo - Octubre 2026</span>
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
              Curvas de Ocupación & Facturación Flotantes
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
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
                  <span className="text-gray-700 dark:text-gray-300">Facturación ($ USD)</span>
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
                  {MONTHLY_DATA[hoveredMonthIndex].month}:
                </span>{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  USD {MONTHLY_DATA[hoveredMonthIndex].revenue.toLocaleString('es-AR')}
                </span>{' '}
                ·{' '}
                <span className="text-[#E67E22] font-bold">
                  {MONTHLY_DATA[hoveredMonthIndex].occupancy}% Ocupación
                </span>{' '}
                ({MONTHLY_DATA[hoveredMonthIndex].nights} noches)
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                Pasá el mouse sobre los puntos para ver el detalle mensual
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
        <div className="lg:col-span-7 bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-2">
            <div>
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Balance Consolidado
              </span>
              <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                Flujo de Cobros por Estadía
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Revisión clara de cada liquidación realizada.
              </p>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              {displayedReservations.length} estadías
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
                {displayedReservations.map((res) => {
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
                            $0
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
        <div className="lg:col-span-5 bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                Rendición de Cuentas
              </span>
              <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                Liquidación a Propietario
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
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
      </div>
    </div>
  );
};
