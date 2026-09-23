import React from 'react';
import { Calendar, Sparkles, KeyRound, MessageSquare, LineChart, Globe, Check, Shield, Bot } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface FeatureBentoProps {
  onOpenDemo: () => void;
}

export const FeatureBento: React.FC<FeatureBentoProps> = ({ onOpenDemo }) => {
  return (
    <section id="funciones" className="py-20 bg-white dark:bg-[#121212] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Funcionalidades Esenciales y Simples
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-2">
            Todo lo que necesitas, sin los enredos de los sistemas de grandes hoteles
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Diseñado a medida para <strong>complejos de cabañas, glampings, domos, departamentos y posadas boutique</strong>. Fácil de entender y usar desde el primer día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rack / Calendario Tape Chart */}
          <SpotlightCard
            spotlightColor="rgba(244, 63, 94, 0.16)"
            borderColor="rgba(244, 63, 94, 0.45)"
            className="md:col-span-2 p-8 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Módulo Central</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                Rack Visual de Cabañas y Habitaciones (Anti-Overbooking)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed max-w-xl">
                Visualiza en una sola grilla tipo tape-chart todas tus unidades: Cabaña 1, Cabaña 2, Habitación 101, etc.
                Sincroniza en tiempo real Booking.com, Airbnb y tus reservas telefónicas o por WhatsApp. Arrastra para cambiar de fecha o unidad con un toque.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Sincronización instantánea de calendarios iCal</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Colores distintivos por canal y estado de pago</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Disponible de inmediato en la demo interactiva</span>
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                Ver rack de cabañas en vivo →
              </button>
            </div>
          </SpotlightCard>

          {/* Card 2: Limpieza y Mucamas */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.16)"
            borderColor="rgba(245, 158, 11, 0.45)"
            className="p-8 bg-white dark:bg-zinc-900"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-5 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Operaciones Diarias</span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Limpieza y Mucamas por Unidad
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Asigna a cada mucama qué cabaña o habitación preparar al momento del check-out. Con checklists de sábanas, toallas, leña y aviso de cabaña lista.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Envío de tareas diarias por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Estado en vivo: Sucia, Limpiando, Lista
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                Probar módulo de limpieza →
              </button>
            </div>
          </SpotlightCard>

          {/* Card 3: Reservas Directas & Guía de Bienvenida */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.16)"
            borderColor="rgba(16, 185, 129, 0.45)"
            className="p-8 bg-white dark:bg-zinc-900"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">0% Comisiones & Atención</span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Landing Directa + Guía Digital de Bienvenida
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Tu propio enlace con motor de reservas directas (Self-Onboard) más una <strong>Guía Digital para el Huésped</strong> con cómo llegar, WiFi en 1 toque, atracciones y leña, con admin para cambiar precios.
              </p>
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium space-y-1">
                <div>✓ Seña 50% directo a tu CBU/Alias bancario</div>
                <div>✓ Cobro íntegro directo con tus propias condiciones y extras</div>
                <div>✓ Resuelve en el móvil del huésped el 90% de preguntas</div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Ver demo de Tu Complejo en vivo →
              </button>
            </div>
          </SpotlightCard>

          {/* Card 4: WhatsApp & Instrucciones */}
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.16)"
            borderColor="rgba(59, 130, 246, 0.45)"
            className="p-8 bg-white dark:bg-zinc-900"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-5 shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Atención Ágil</span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Mensajes WhatsApp & Auto Check-in
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Envía en 1 clic los datos de llegada: cómo llegar al predio, clave de WiFi, clave de la cerradura digital o dónde retirar la llave.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-800 dark:text-blue-300 font-medium">
                <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Compatible con cerraduras digitales o llaves físicas</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Probar simulador de mensajes →
              </button>
            </div>
          </SpotlightCard>

          {/* Card 5: Extras, Caja y Reportes */}
          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.16)"
            borderColor="rgba(168, 85, 247, 0.45)"
            className="p-8 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-5 shadow-xs">
                <LineChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Caja y Consumos</span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Extras, Señas y Finanzas Claras
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Controla señas cobradas, saldos pendientes al check-in y extras de la cabaña (bolsas de leña, desayunos de campo, late check-out).
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Sin hojas de Excel desordenadas ni cálculos manuales</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-purple-700 dark:hover:text-purple-400 transition-colors cursor-pointer"
              >
                Ver finanzas en la demo →
              </button>
            </div>
          </SpotlightCard>

          {/* Card 6: Xenia Copilot IA */}
          <SpotlightCard
            spotlightColor="rgba(244, 63, 94, 0.28)"
            borderColor="rgba(244, 63, 94, 0.6)"
            className="md:col-span-3 p-8 bg-gradient-to-r from-rose-950 via-zinc-900 to-zinc-950 text-white shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">
                  <Bot className="w-4 h-4 text-rose-400" />
                  <span>Inteligencia Artificial Especializada en Hospitalidad</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Xenia Copilot: Rendición de Cuentas y Guía de Uso Integrada
                </h3>
                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                  ¿Cuánto dinero ingresó este mes? ¿Quién llega hoy? ¿Cómo se sincroniza Booking? Xenia responde al instante con los datos reales de tu alojamiento y te explica el uso paso a paso de cada módulo de Loomi Suite, para dominar la plataforma de inmediato sin curvas de aprendizaje ni demoras de soporte.
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={onOpenDemo}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Bot className="w-4 h-4" />
                  <span>Probar a Xenia en vivo →</span>
                </button>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};
