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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Finanzas, Métricas & Liquidación a Propietarios</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Desglose automático de ingresos brutos, comisiones de plataformas y honorarios de administración.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar Reporte</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
            Ingresos Brutos
          </span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit']">
            {formatCurrency(grossRevenue)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Suma de todas las estadías</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
            Comisiones a OTAs
          </span>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-['Outfit']">
            -{formatCurrency(totalOtaCommissions)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Descontado por Airbnb/Booking/VRBO</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
            Tarifa Promedio Noche (ADR)
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
            {formatCurrency(averageDailyRate)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Calculado sobre {totalNights} noches vendidas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
            Ingreso Neto Cobrado
          </span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit']">
            {formatCurrency(netRevenue)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Depositado en tus cuentas bancarias</p>
        </div>
      </div>

      {/* Owner Payout Generator */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Módulo de Co-hosting y Administración
            </span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Generador de Liquidación para el Propietario
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selecciona una propiedad para calcular la rendición mensual lista para enviar por correo o WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Propiedad:</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="text-xs font-semibold p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Honorario Gestor:</label>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="text-xs font-semibold p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
        <div className="mt-6 max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-800/80 rounded-xl p-6 border border-zinc-200/80 dark:border-zinc-700 shadow-xs font-sans transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4 mb-4">
            <div>
              <h5 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Liquidación Mensual de Rendimiento
              </h5>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Propiedad: <strong>{selectedProperty?.name}</strong> ({selectedProperty?.address})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-400 block">Período: Mes en curso</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Liquidación Aprobada
              </span>
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/60">
              <span>Total Facturado ({propReservations.length} reservas procesadas):</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(propGross)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/60 text-red-600 dark:text-red-400">
              <span>Menos comisiones pagadas a plataformas (OTAs):</span>
              <span>-{formatCurrency(propOtaCommissions)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400">
              <span>Menos costos de limpieza y reposición de insumos:</span>
              <span>-{formatCurrency(propCleaning)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/60 font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Subtotal Neto Operativo:</span>
              <span>{formatCurrency(propNetBeforeAgency)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/60 text-purple-700 dark:text-purple-400 font-semibold">
              <span>Honorarios de Co-hosting / Administración ({commissionRate}%):</span>
              <span>-{formatCurrency(agencyFee)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 text-sm font-extrabold text-zinc-900 dark:text-zinc-100 border-t-2 border-zinc-300 dark:border-zinc-700">
              <span>Total Neto a Transferir al Propietario:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-['Outfit'] text-lg">
                {formatCurrency(ownerPayout)}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-center">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Documento emitido con Loomi Suite. Información consolidada mediante integración de calendarios y pasarelas de cobro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
