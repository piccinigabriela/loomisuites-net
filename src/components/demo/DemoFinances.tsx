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

// 6 meses con datos consistentes y armoniosos
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
  // Canvas width = 640, height = 180, padding = 32
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]/60"></span>
            <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-medium">
              Finanzas & Reportes de Rendimiento
            </span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400 font-light">Modo Zen & Claridad</span>
          </div>
          <h2 className="text-xl font-light text-gray-800 tracking-tight">
            Control de Rendimiento & <span className="font-normal text-gray-900">Liquidación</span>
          </h2>
          <p className="text-xs text-gray-400 font-light max-w-xl">
            Flujo consolidado de facturación, comisiones de canales y liquidación mensual a propietarios sin estrés visual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Unidad */}
          <div className="flex items-center gap-2 bg-gray-50/70 border border-gray-100 rounded-xl px-3 py-2 text-xs font-light text-gray-700">
            <Building className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent border-none text-xs font-light text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Unidades (Complejo)</option>
              {demoState.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-light text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            title="Exportar reporte"
          >
            <Printer className="w-3.5 h-3.5 text-gray-400" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 4 Métricas Zen Flotantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Facturación Bruta */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 font-light mb-1">
            <span>Facturación Bruta</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500/70" />
          </div>
          <div className="text-2xl font-light text-gray-900 tracking-tight mt-1">
            {formatCurrency(grossRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400 font-light">
            <span className="text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded text-[10px] font-normal">
              +14% vs mes ant.
            </span>
            <span>{displayedReservations.length} reservas</span>
          </div>
        </div>

        {/* Comisiones OTAs (Atenuadas en óxido/naranja pastel) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 font-light mb-1">
            <span>Comisiones OTAs</span>
            <span className="text-[10px] text-orange-600/80 bg-orange-50/60 px-2 py-0.5 rounded font-light">
              Airbnb / Booking
            </span>
          </div>
          <div className="text-2xl font-light text-stone-700 tracking-tight mt-1">
            <span className="text-orange-500/80 mr-1 text-lg font-light">-</span>
            {formatCurrency(totalOtaCommissions)}
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-light">
            Retención de canales externos
          </p>
        </div>

        {/* Tarifa Promedio (ADR) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 font-light mb-1">
            <span>Tarifa Promedio (ADR)</span>
            <span className="text-[11px] text-gray-400 font-light">Noche</span>
          </div>
          <div className="text-2xl font-light text-gray-900 tracking-tight mt-1">
            {formatCurrency(adr)}
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-light">
            Promedio sobre {totalNights} noches vendidas
          </p>
        </div>

        {/* Ingreso Neto (Verde pastel suave) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 font-light mb-1">
            <span>Ingreso Neto Cobrado</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded font-normal">
              Disponible
            </span>
          </div>
          <div className="text-2xl font-light text-emerald-800 tracking-tight mt-1">
            {formatCurrency(netRevenue)}
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-light">
            Limpio acreditado en cuentas
          </p>
        </div>
      </div>

      {/* Gráfico Zen: Rendimiento & Ocupación Mensual (Líneas Ultra Delgadas, Sin Grillas Pesadas, Curvas Flotantes) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.005)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-medium">
                Tendencia Semestral
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 font-light">Mayo - Octubre 2026</span>
            </div>
            <h3 className="text-base font-light text-gray-800 tracking-tight mt-0.5">
              Curvas de Ocupación & Facturación Flotantes
            </h3>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              Sin cuadrículas que saturen la vista; trazos finos que permiten apreciar la aceleración de ingresos y ocupación.
            </p>
          </div>

          {/* Segmented controls para alternar curvas */}
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-100 text-xs font-light">
            <button
              onClick={() => setMetricView('both')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'both'
                  ? 'bg-white text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-normal'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Ambas Curvas
            </button>
            <button
              onClick={() => setMetricView('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'revenue'
                  ? 'bg-white text-emerald-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-normal'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-0.5 bg-emerald-500/70 rounded-full inline-block"></span>
              <span>Ingresos</span>
            </button>
            <button
              onClick={() => setMetricView('occupancy')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'occupancy'
                  ? 'bg-white text-[#E67E22] shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-normal'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-0.5 bg-[#E67E22]/70 rounded-full inline-block"></span>
              <span>Ocupación</span>
            </button>
          </div>
        </div>

        {/* Canvas SVG Minimalista Zen */}
        <div className="relative pt-6 pb-2">
          {/* Leyenda y tooltip contextual */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-light mb-4 px-2">
            <div className="flex items-center gap-4">
              {(metricView === 'both' || metricView === 'revenue') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[1.5px] bg-emerald-600/70 inline-block"></span>
                  <span className="text-gray-600 font-light">Facturación ($ USD)</span>
                </div>
              )}
              {(metricView === 'both' || metricView === 'occupancy') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[1.5px] bg-[#E67E22]/70 inline-block"></span>
                  <span className="text-gray-600 font-light">Ocupación (%)</span>
                </div>
              )}
            </div>

            {hoveredMonthIndex !== null ? (
              <div className="text-xs text-gray-600 font-light bg-gray-50/80 px-3 py-1 rounded-xl border border-gray-100 animate-in fade-in">
                <span className="font-medium text-gray-800">
                  {MONTHLY_DATA[hoveredMonthIndex].month}:
                </span>{' '}
                <span className="text-emerald-700">
                  ${MONTHLY_DATA[hoveredMonthIndex].revenue.toLocaleString()} USD
                </span>{' '}
                ·{' '}
                <span className="text-[#E67E22]">
                  {MONTHLY_DATA[hoveredMonthIndex].occupancy}% Ocupación
                </span>{' '}
                ({MONTHLY_DATA[hoveredMonthIndex].nights} noches)
              </div>
            ) : (
              <span className="text-[11px] text-gray-400 font-light hidden sm:inline">
                Pasa el mouse sobre los puntos para ver el detalle mensual
              </span>
            )}
          </div>

          <div className="w-full overflow-hidden bg-white">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-44 sm:h-52 select-none overflow-visible"
            >
              {/* Líneas guía sutilísimas (casi invisibles, para flotar en el fondo blanco) */}
              <line
                x1={padX}
                y1={padY + innerH}
                x2={chartW - padX}
                y2={padY + innerH}
                stroke="#F3F4F6"
                strokeWidth="1"
              />
              <line
                x1={padX}
                y1={padY + innerH / 2}
                x2={chartW - padX}
                y2={padY + innerH / 2}
                stroke="#F9FAFB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Curva de Ingresos (Verde pastel sutil y trazo delgado) */}
              {(metricView === 'both' || metricView === 'revenue') && (
                <>
                  <path
                    d={revPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-70 transition-all duration-300"
                  />
                  {/* Puntos de datos ultra limpios */}
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
                        r={hoveredMonthIndex === i ? 4 : 2.5}
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Curva de Ocupación (Naranja suave Zen, trazo delgado) */}
              {(metricView === 'both' || metricView === 'occupancy') && (
                <>
                  <path
                    d={occPath}
                    fill="none"
                    stroke="#E67E22"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-70 transition-all duration-300"
                  />
                  {/* Puntos de datos */}
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
                        r={hoveredMonthIndex === i ? 4 : 2.5}
                        fill="#FFFFFF"
                        stroke="#E67E22"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Etiquetas del eje X (Meses) */}
              {revPoints.map((p, i) => (
                <text
                  key={`month-${i}`}
                  x={p.x}
                  y={chartH - 2}
                  textAnchor="middle"
                  className={`text-[10px] font-light fill-gray-400 select-none ${
                    hoveredMonthIndex === i ? 'fill-gray-800 font-normal' : ''
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
        {/* Tabla de Balances de Cobros (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-2">
            <div>
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-medium">
                Balance Consolidado
              </span>
              <h4 className="text-base font-light text-gray-800 tracking-tight mt-0.5">
                Flujo de Cobros por Estadía
              </h4>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Filas amplias y descansadas para revisar con calma cada liquidación.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-light">
              {displayedReservations.length} estadías
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100/70 text-[10px] uppercase tracking-wider text-gray-400 font-normal">
                  <th className="py-3 px-2 font-medium">Huésped / Unidad</th>
                  <th className="py-3 px-2 font-medium">Canal</th>
                  <th className="py-3 px-2 text-right font-medium">Bruto</th>
                  <th className="py-3 px-2 text-right font-medium">Comisión</th>
                  <th className="py-3 px-2 text-right font-medium">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {displayedReservations.map((res) => {
                  const prop = demoState.properties.find(
                    (p) => p.id === res.propertyId
                  );
                  const isDirect = res.platform === 'direct';

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-gray-50/50 transition-colors text-xs font-light"
                    >
                      {/* Huésped y Unidad con margen interno generoso (py-4) */}
                      <td className="py-4 px-2">
                        <div className="space-y-0.5">
                          <p className="font-normal text-gray-800 leading-tight">
                            {res.guestName}
                          </p>
                          <p className="text-[11px] text-gray-400 font-light">
                            {prop?.name || 'Unidad'} · {res.nights} noches (
                            {formatDisplayDate(res.checkIn)})
                          </p>
                        </div>
                      </td>

                      {/* Canal */}
                      <td className="py-4 px-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                            isDirect
                              ? 'bg-emerald-50/70 text-emerald-700 font-normal'
                              : 'bg-orange-50/60 text-[#E67E22] font-light'
                          }`}
                        >
                          {isDirect ? 'Directo (0%)' : res.platform}
                        </span>
                      </td>

                      {/* Bruto */}
                      <td className="py-4 px-2 text-right font-normal text-gray-700">
                        {formatCurrency(res.totalAmount)}
                      </td>

                      {/* Comisión OTA en naranja/óxido pastel sutil */}
                      <td className="py-4 px-2 text-right">
                        {res.commissionPaid > 0 ? (
                          <span className="text-orange-600/80 bg-orange-50/50 px-1.5 py-0.5 rounded text-[11px] font-light">
                            -{formatCurrency(res.commissionPaid)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded text-[11px] font-light">
                            $0
                          </span>
                        )}
                      </td>

                      {/* Neto cobrado en verde pastel muy tenue */}
                      <td className="py-4 px-2 text-right">
                        <span className="text-emerald-800 bg-emerald-50/40 px-2 py-0.5 rounded font-normal">
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

        {/* Generador de Liquidación Propietario Zen (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-50 mb-5">
              <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-medium">
                Rendición de Cuentas
              </span>
              <h4 className="text-base font-light text-gray-800 tracking-tight mt-0.5">
                Liquidación a Propietario
              </h4>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Cálculo transparente para enviar por WhatsApp o correo sin disputas.
              </p>
            </div>

            {/* Selectores */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] text-gray-400 font-light block mb-1.5">
                  Honorario de Co-hosting / Administración:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCommissionRate(rate)}
                      className={`py-2 text-xs rounded-xl border transition-all cursor-pointer font-light ${
                        commissionRate === rate
                          ? 'border-[#E67E22]/50 bg-orange-50/60 text-[#E67E22] font-normal shadow-xs'
                          : 'border-gray-100 bg-gray-50/60 text-gray-600 hover:bg-gray-100/60'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen de Liquidación Zen */}
            <div className="bg-[#FAF9F6] rounded-2xl p-5 border border-stone-200/50 space-y-3.5 text-xs font-light">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/40">
                <span className="text-gray-500 font-light">Propiedad liquidada:</span>
                <span className="font-normal text-gray-800">
                  {selectedProperty ? selectedProperty.name : 'Complejo Consolidado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Facturado Bruto:</span>
                <span className="text-gray-800 font-normal">
                  {formatCurrency(grossRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between text-orange-600/80">
                <span className="text-gray-500">Comisiones de Canales (OTAs):</span>
                <span className="font-light">-{formatCurrency(totalOtaCommissions)}</span>
              </div>

              <div className="flex items-center justify-between text-stone-500">
                <span className="text-gray-500">Costos de Limpieza y Reposición:</span>
                <span className="font-light">-{formatCurrency(totalCleaningFees)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/40 text-[#E67E22]">
                <span className="text-gray-600">Honorarios Gestor ({commissionRate}%):</span>
                <span className="font-light">-{formatCurrency(agencyFee)}</span>
              </div>

              {/* Total Final */}
              <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-800 block">
                    Neto a Transferir al Propietario
                  </span>
                  <span className="text-[10px] text-gray-400 font-light">
                    Libre de comisiones y gastos operativos
                  </span>
                </div>
                <div className="text-lg font-light text-emerald-800 bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-100/60">
                  {formatCurrency(ownerPayout)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-50 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-light">
              Listo para liquidación bancaria
            </span>
            <button
              onClick={handlePrint}
              className="text-xs font-light text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
