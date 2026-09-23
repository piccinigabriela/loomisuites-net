import React from 'react';
import { Calendar, Sparkles, KeyRound, MessageSquare, LineChart, Globe, Check, Shield, Bot } from 'lucide-react';

interface FeatureBentoProps {
  onOpenDemo: () => void;
}

export const FeatureBento: React.FC<FeatureBentoProps> = ({ onOpenDemo }) => {
  return (
    <section id="funciones" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Funcionalidades Esenciales y Simples
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            Todo lo que necesitas, sin los enredos de los sistemas de grandes hoteles
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Diseñado a medida para <strong>complejos de cabañas, glampings, domos, departamentos y posadas boutique</strong>. Fácil de entender y usar desde el primer día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rack / Calendario Tape Chart */}
          <div className="md:col-span-2 rounded-2xl border border-zinc-200 p-8 bg-gradient-to-br from-zinc-50 to-white flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Módulo Central</span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                Rack Visual de Cabañas y Habitaciones (Anti-Overbooking)
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed max-w-xl">
                Visualiza en una sola grilla tipo tape-chart todas tus unidades: Cabaña 1, Cabaña 2, Habitación 101, etc.
                Sincroniza en tiempo real Booking.com, Airbnb y tus reservas telefónicas o por WhatsApp. Arrastra para cambiar de fecha o unidad con un toque.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 bg-white p-2.5 rounded-lg border border-zinc-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sincronización instantánea de calendarios iCal</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 bg-white p-2.5 rounded-lg border border-zinc-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Colores distintivos por canal y estado de pago</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200/80 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Disponible de inmediato en la demo interactiva</span>
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                Ver rack de cabañas en vivo →
              </button>
            </div>
          </div>

          {/* Card 2: Limpieza y Mucamas */}
          <div className="rounded-2xl border border-zinc-200 p-8 bg-white flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Operaciones Diarias</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                Limpieza y Mucamas por Unidad
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                Asigna a cada mucama qué cabaña o habitación preparar al momento del check-out. Con checklists de sábanas, toallas, leña y aviso de cabaña lista.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  Envío de tareas diarias por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  Estado en vivo: Sucia, Limpiando, Lista
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Probar módulo de limpieza →
              </button>
            </div>
          </div>

          {/* Card 3: Reservas Directas & Guía de Bienvenida */}
          <div className="rounded-2xl border border-zinc-200 p-8 bg-white flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">0% Comisiones & Atención</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                Landing Directa + Guía Digital de Bienvenida
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                Tu propio enlace con motor de reservas directas (Self-Onboard) más una <strong>Guía Digital para el Huésped</strong> con cómo llegar, WiFi en 1 toque, atracciones y leña, con admin para cambiar precios.
              </p>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium space-y-1">
                <div>✓ Seña 50% directo a tu CBU/Alias bancario</div>
                <div>✓ Cobro íntegro directo con tus propias condiciones y extras</div>
                <div>✓ Resuelve en el móvil del huésped el 90% de preguntas</div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Ver demo de Tu Complejo en vivo →
              </button>
            </div>
          </div>

          {/* Card 4: WhatsApp & Instrucciones */}
          <div className="rounded-2xl border border-zinc-200 p-8 bg-white flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Atención Ágil</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                Mensajes WhatsApp & Auto Check-in
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                Envía en 1 clic los datos de llegada: cómo llegar al predio, clave de WiFi, clave de la cerradura digital o dónde retirar la llave.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-800 font-medium">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Compatible con cerraduras digitales o llaves físicas</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Probar simulador de mensajes →
              </button>
            </div>
          </div>

          {/* Card 5: Extras, Caja y Reportes */}
          <div className="rounded-2xl border border-zinc-200 p-8 bg-gradient-to-br from-zinc-50 to-white flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <LineChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Caja y Consumos</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                Extras, Señas y Finanzas Claras
              </h3>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                Controla señas cobradas, saldos pendientes al check-in y extras de la cabaña (bolsas de leña, desayunos de campo, late check-out).
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-700">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Sin hojas de Excel desordenadas ni cálculos manuales</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={onOpenDemo}
                className="text-xs font-bold text-zinc-800 hover:text-purple-700 transition-colors cursor-pointer"
              >
                Ver finanzas en la demo →
              </button>
            </div>
          </div>

          {/* Card 6: Xenia Copilot IA */}
          <div className="md:col-span-3 rounded-2xl border border-rose-200 p-8 bg-gradient-to-r from-rose-900 via-zinc-900 to-zinc-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
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
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Probar a Xenia en vivo →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
