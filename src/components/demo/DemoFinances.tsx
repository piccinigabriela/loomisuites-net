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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
            FINANZAS / RENDIMIENTO & LIQUIDACIONES
          </span>
          <h3 className="text-xl font-black text-[#18181B] dark:text-white flex items-center gap-2 mt-0.5">
            <DollarSign className="w-5 h-5 text-[#E1500A]" />
            <span>Finanzas, Métricas & Liquidación a Propietarios</span>
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-bold">
            Desglose automático de ingresos brutos, comisiones de plataformas y honorarios de administración.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white bg-white dark:bg-[#18181B] hover:border-[#E1500A] px-3.5 py-2 rounded-none transition-colors cursor-pointer border border-[#C8C4B7] dark:border-[#222328] shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#E1500A]" />
          <span>Imprimir / Exportar Reporte</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] shadow-2xs transition-colors">
          <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-widest block mb-1">
            Ingresos Brutos
          </span>
          <div className="text-2xl font-black text-[#18181B] dark:text-white">
            {formatCurrency(grossRevenue)}
          </div>
          <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] mt-1">Suma de todas las estadías</p>
        </div>

        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] shadow-2xs transition-colors">
          <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-widest block mb-1">
            Comisiones a OTAs
          </span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            -{formatCurrency(totalOtaCommissions)}
          </div>
          <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] mt-1">Airbnb / Booking / VRBO</p>
        </div>

        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] shadow-2xs transition-colors">
          <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-widest block mb-1">
            Tarifa Promedio (ADR)
          </span>
          <div className="text-2xl font-black text-[#E1500A]">
            {formatCurrency(averageDailyRate)}
          </div>
          <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] mt-1">
            Sobre {totalNights} noches vendidas
          </p>
        </div>

        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] shadow-2xs transition-colors">
          <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-widest block mb-1">
            Ingreso Neto Cobrado
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(netRevenue)}
          </div>
          <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] mt-1">Limpio en tus cuentas</p>
        </div>
      </div>

      {/* Owner Payout Generator */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#C8C4B7] dark:border-[#222328]">
          <div>
            <span className="text-[10px] font-black text-[#E1500A] uppercase tracking-widest">
              MÓDULO DE CO-HOSTING Y ADMINISTRACIÓN
            </span>
            <h4 className="text-base font-black uppercase tracking-tight text-[#18181B] dark:text-white mt-0.5">
              Generador de Liquidación para el Propietario
            </h4>
            <p className="text-xs text-[#71717A] dark:text-[#8E8E93] font-medium">
              Selecciona una propiedad para calcular la rendición mensual lista para enviar por correo o WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] block mb-1">Propiedad:</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="text-xs font-bold p-2 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white focus:outline-none focus:border-[#E1500A]"
              >
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] block mb-1">Honorario Gestor:</label>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="text-xs font-bold p-2 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white focus:outline-none focus:border-[#E1500A]"
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
        <div className="mt-6 max-w-2xl mx-auto bg-white dark:bg-[#18181B] rounded-none p-6 border border-[#C8C4B7] dark:border-[#222328] shadow-2xs font-sans transition-colors">
          <div className="flex items-center justify-between border-b border-[#C8C4B7] dark:border-[#222328] pb-4 mb-4">
            <div>
              <h5 className="text-sm font-black uppercase tracking-tight text-[#18181B] dark:text-white">
                Liquidación Mensual de Rendimiento
              </h5>
              <p className="text-xs text-[#71717A] dark:text-[#8E8E93] font-medium">
                Propiedad: <strong>{selectedProperty?.name}</strong> ({selectedProperty?.address})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] block">Período: Mes en curso</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-none border border-emerald-300 dark:border-emerald-800">
                Aprobada
              </span>
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-2.5 text-xs text-[#18181B] dark:text-[#EFECE5]">
            <div className="flex justify-between py-1 border-b border-[#C8C4B7]/40 dark:border-[#222328]">
              <span>Total Facturado ({propReservations.length} reservas):</span>
              <span className="font-bold">{formatCurrency(propGross)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#C8C4B7]/40 dark:border-[#222328] text-red-600 dark:text-red-400">
              <span>Menos comisiones pagadas a plataformas (OTAs):</span>
              <span>-{formatCurrency(propOtaCommissions)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#C8C4B7]/40 dark:border-[#222328] text-[#71717A] dark:text-[#8E8E93]">
              <span>Menos costos de limpieza y reposición:</span>
              <span>-{formatCurrency(propCleaning)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#C8C4B7]/40 dark:border-[#222328] font-bold">
              <span>Subtotal Neto Operativo:</span>
              <span>{formatCurrency(propNetBeforeAgency)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#C8C4B7]/40 dark:border-[#222328] text-[#E1500A] font-bold">
              <span>Honorarios de Co-hosting ({commissionRate}%):</span>
              <span>-{formatCurrency(agencyFee)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 text-sm font-black border-t-2 border-[#18181B] dark:border-white">
              <span className="uppercase tracking-wider">Neto a Transferir al Propietario:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">
                {formatCurrency(ownerPayout)}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#C8C4B7] dark:border-[#222328] text-center">
            <p className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-medium">
              Documento emitido con Loomi Suite. Información consolidada en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
