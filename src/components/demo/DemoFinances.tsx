import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  FileText,
  Building,
  CheckCircle,
  Printer,
} from 'lucide-react';
import { DemoState } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../data/initialData';

interface DemoFinancesProps {
  demoState: DemoState;
}

export const DemoFinances: React.FC<DemoFinancesProps> = ({ demoState }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    demoState.properties[0]?.id || ''
  );
  const [commissionRate, setCommissionRate] = useState<number>(20); // 20% agency fee

  // Total finances
  const activeReservations = demoState.reservations.filter(
    (r) => r.status !== 'cancelled'
  );

  const grossRevenue = activeReservations.reduce(
    (sum, r) => sum + r.totalAmount,
    0
  );

  const totalOtaCommissions = activeReservations.reduce(
    (sum, r) => sum + r.commissionPaid,
    0
  );

  const totalNights = activeReservations.reduce(
    (sum, r) => sum + r.nights,
    0
  );

  // Tarifa Promedio por Noche (ADR - Average Daily Rate)
  const averageDailyRate = totalNights > 0 ? Math.round(grossRevenue / totalNights) : 0;

  const totalCleaningFees = activeReservations.reduce(
    (sum, r) => sum + r.cleaningFee,
    0
  );

  const netRevenue = grossRevenue - totalOtaCommissions;

  // Selected property for owner payout
  const selectedProperty = demoState.properties.find(
    (p) => p.id === selectedPropertyId
  );

  const propReservations = activeReservations.filter(
    (r) => r.propertyId === selectedPropertyId
  );

  const propGross = propReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const propOtaCommissions = propReservations.reduce((sum, r) => sum + r.commissionPaid, 0);
  const propCleaning = propReservations.reduce((sum, r) => sum + r.cleaningFee, 0);
  const propNetBeforeAgency = propGross - propOtaCommissions - propCleaning;
  const agencyFee = Math.round(propNetBeforeAgency * (commissionRate / 100));
  const ownerPayout = propNetBeforeAgency - agencyFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
              FINANZAS & LIQUIDACIONES
            </span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 tracking-tight">
            <DollarSign className="w-5 h-5 text-[#E67E22]" />
            <span>Rendimiento, Métricas & Liquidación a Propietarios</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
            Desglose automático de ingresos brutos, comisiones de plataformas y honorarios de administración.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-stone-200/80 dark:border-zinc-700"
        >
          <Printer className="w-3.5 h-3.5 text-[#E67E22]" />
          <span>Imprimir / Exportar Reporte</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider block mb-1">
            Ingresos Brutos
          </span>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {formatCurrency(grossRevenue)}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-medium">Suma de todas las estadías</p>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider block mb-1">
            Comisiones a OTAs
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatCurrency(totalOtaCommissions)}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-medium">Airbnb / Booking / VRBO</p>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider block mb-1">
            Tarifa Promedio (ADR)
          </span>
          <div className="text-2xl font-bold text-[#E67E22] tracking-tight">
            {formatCurrency(averageDailyRate)}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-medium">
            Sobre {totalNights} noches vendidas
          </p>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider block mb-1">
            Ingreso Neto Cobrado
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(netRevenue)}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-medium">Limpio en tus cuentas</p>
        </div>
      </div>

      {/* Owner Payout Generator */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/70 dark:border-zinc-800/70">
          <div>
            <span className="text-[11px] font-bold text-[#E67E22] uppercase tracking-wider">
              MÓDULO DE CO-HOSTING Y ADMINISTRACIÓN
            </span>
            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-0.5">
              Generador de Liquidación para el Propietario
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
              Selecciona una propiedad para calcular la rendición mensual lista para enviar por correo o WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 block mb-1">Propiedad:</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 block mb-1">Honorario Gestor:</label>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="15">15%</option>
                <option value="20">20% (Estándar)</option>
                <option value="25">25%</option>
                <option value="30">30%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statement Mockup */}
        <div className="mt-6 max-w-2xl mx-auto bg-[#FDFBF9] dark:bg-[#131418] rounded-2xl p-6 border border-stone-200/80 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.01)] font-sans transition-colors">
          <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-zinc-800/70 pb-4 mb-4">
            <div>
              <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Liquidación Mensual de Rendimiento
              </h5>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Propiedad: <strong className="text-stone-800 dark:text-stone-200">{selectedProperty?.name}</strong> ({selectedProperty?.address})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-400 dark:text-stone-500 block">Período: Mes en curso</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block mt-0.5">
                Aprobada
              </span>
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-zinc-800/60">
              <span>Total Facturado ({propReservations.length} reservas):</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(propGross)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-zinc-800/60 text-rose-600 dark:text-rose-400">
              <span>Menos comisiones pagadas a plataformas (OTAs):</span>
              <span className="font-medium">-{formatCurrency(propOtaCommissions)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-zinc-800/60 text-stone-500 dark:text-stone-400">
              <span>Menos costos de limpieza y reposición:</span>
              <span className="font-medium">-{formatCurrency(propCleaning)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-zinc-800/60 font-medium text-stone-800 dark:text-stone-200">
              <span>Subtotal Neto Operativo:</span>
              <span className="font-semibold">{formatCurrency(propNetBeforeAgency)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-zinc-800/60 text-[#E67E22] font-medium">
              <span>Honorarios de Co-hosting ({commissionRate}%):</span>
              <span className="font-semibold">-{formatCurrency(agencyFee)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 text-sm font-bold border-t border-stone-300 dark:border-zinc-700">
              <span className="text-stone-900 dark:text-white">Neto a Transferir al Propietario:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base font-bold">
                {formatCurrency(ownerPayout)}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-200/60 dark:border-zinc-800/60 text-center">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              Documento emitido con Loomi Suite • Información consolidada en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
