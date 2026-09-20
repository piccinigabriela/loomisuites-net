import React, { useState } from 'react';
import { DollarSign, Clock, TrendingUp, Play, Calculator } from 'lucide-react';
import { formatCurrency } from '../../data/initialData';

interface RoiCalculatorProps {
  onOpenDemo: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenDemo }) => {
  const [propertiesCount, setPropertiesCount] = useState<number>(3);
  const [avgNightRate, setAvgNightRate] = useState<number>(85);
  const [avgOccupancy, setAvgOccupancy] = useState<number>(75); // 75% occupancy

  // Math:
  // Nights per month per property = 30 * (avgOccupancy / 100)
  const occupiedNightsPerMonth = Math.round(30 * (avgOccupancy / 100));
  const totalOccupiedNights = occupiedNightsPerMonth * propertiesCount;
  const grossMonthlyRevenue = totalOccupiedNights * avgNightRate;

  // With direct booking engine, typically 25% of nights become direct
  // OTA commission rate is ~15%
  const directBookingNights = Math.round(totalOccupiedNights * 0.25);
  const otaCommissionSaved = Math.round(directBookingNights * avgNightRate * 0.15);

  // Time saved: ~4 hours per property per month (messaging, coordination, calendar sync)
  const hoursSavedPerMonth = propertiesCount * 8;

  // Cost of Loomi Suite plans ($19, $47, $99)
  const softwareCost = propertiesCount <= 3 ? 19 : propertiesCount <= 10 ? 47 : 99;
  const netBenefit = otaCommissionSaved - softwareCost;

  return (
    <section id="calculadora" className="py-20 bg-zinc-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold mb-3 border border-zinc-700">
            <Calculator className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulador de Rentabilidad & Tiempo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¿Cuánto dinero y tiempo puedes recuperar cada mes?
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Ajusta los controles según tu complejo o posada para ver el impacto real de no depender 100% de comisiones OTA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Sliders Box */}
          <div className="lg:col-span-7 bg-zinc-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-zinc-700">
            {/* Slider 1: Cantidad de propiedades */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-200">
                  Cabañas o habitaciones
                </label>
                <span className="text-lg font-bold text-rose-400 bg-rose-500/10 px-3 py-0.5 rounded-lg border border-rose-500/20">
                  {propertiesCount} {propertiesCount === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={propertiesCount}
                onChange={(e) => setPropertiesCount(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>1 unidad</span>
                <span>5 unidades</span>
                <span>10 unidades</span>
                <span>20+ unidades</span>
              </div>
            </div>

            {/* Slider 2: Tarifa promedio por noche */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-200">
                  Tarifa promedio por noche (USD)
                </label>
                <span className="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-lg border border-emerald-500/20">
                  ${avgNightRate} USD
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                step="5"
                value={avgNightRate}
                onChange={(e) => setAvgNightRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>$30</span>
                <span>$100</span>
                <span>$180</span>
                <span>$250+</span>
              </div>
            </div>

            {/* Slider 3: Ocupación promedio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-200">
                  Ocupación mensual promedio
                </label>
                <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-3 py-0.5 rounded-lg border border-blue-500/20">
                  {avgOccupancy}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={avgOccupancy}
                onChange={(e) => setAvgOccupancy(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-zinc-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>40% (Baja)</span>
                <span>70% (Promedio)</span>
                <span>95% (Alta)</span>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-700 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                Tu Retorno Estimado Mensual
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
                +{formatCurrency(otaCommissionSaved)} <span className="text-sm font-normal text-zinc-400">/ mes</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                Ahorrado al migrar apenas el 25% a reservas directas sin comisiones OTAs.
              </p>

              <div className="mt-6 pt-6 border-t border-zinc-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Tiempo libre recuperado:</span>
                  </div>
                  <span className="text-sm font-bold text-white">~{hoursSavedPerMonth} horas / mes</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Facturación estimada mensual:</span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatCurrency(grossMonthlyRevenue)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    <span>Beneficio neto tras software:</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">+{formatCurrency(netBenefit)} / mes</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-700/80">
              <button
                onClick={onOpenDemo}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 py-3.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Ver cómo funciona en la Demo en Vivo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
