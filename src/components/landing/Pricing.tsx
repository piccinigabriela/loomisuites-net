import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Play, PlusCircle, KeyRound, Wine, Flower2, Globe } from 'lucide-react';

interface PricingProps {
  onOpenDemo: () => void;
  onOpenContact: (planName?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenDemo, onOpenContact }) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Cabaña / B&B',
      subtitle: 'Para dueños de 1 a 3 cabañas o habitaciones',
      monthlyPrice: 24,
      annualPrice: 19,
      popular: false,
      features: [
        'Hasta 3 cabañas o habitaciones conectadas',
        'Sincronización automática Booking & Airbnb',
        'Rack visual anti-overbooking en el celular',
        'Plantillas de WhatsApp de bienvenida y WiFi',
        'Coordinación de limpieza por unidad',
        'Link web de reservas directas con seña',
        'Onboarding autogestionable en 15 minutos',
      ],
      ctaText: 'Elegir Starter',
    },
    {
      id: 'pro',
      name: 'Loomi Pro Complejo',
      subtitle: 'Para complejos de cabañas, hostales y posadas (4 a 10 unidades)',
      monthlyPrice: 59,
      annualPrice: 47,
      popular: true,
      features: [
        'Hasta 10 cabañas o habitaciones',
        'Sincronización total (Booking, Airbnb, VRBO, iCal)',
        'Check-in automático: Llaves o cerraduras electrónicas',
        'Panel de mucamas con fotos y checklist de leña/blancos',
        'Motor de reservas directas sin pagar 18% de comisión',
        'Plantillas automáticas y mensajes ilimitados',
        'Onboarding acompañado por WhatsApp paso a paso',
        'Soporte prioritario 7 días a la semana',
      ],
      ctaText: 'Comenzar con Loomi Pro',
    },
    {
      id: 'lodge',
      name: 'Loomi Multi-Lodge',
      subtitle: 'Para hostales grandes, posadas boutique o 11 a 25 unidades',
      monthlyPrice: 129,
      annualPrice: 99,
      popular: false,
      features: [
        'Hasta 25 cabañas o habitaciones independientes',
        'Control de caja diaria, señas y extras (desayunos, leña)',
        'Múltiples perfiles: Administrador, Recepción, Mucamas',
        'Reportes de ocupación y exportación a Excel en 1 clic',
        'Link web con marca y logo de tu complejo',
        'Migración completa de tus reservas previas por nuestro equipo',
      ],
      ctaText: 'Elegir Multi-Lodge',
    },
  ];

  return (
    <section id="precios" className="py-20 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Planes Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            Inversión fija, sin porcentajes ocultos sobre tus ventas
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            A diferencia de otros softwares, nosotros jamás nos quedamos con un porcentaje de tus reservas. 
            Prueba todas las funcionalidades gratis en la demo interactiva.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-semibold">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                !isAnnual ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                isAnnual ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                -20% Ahorro
              </span>
            </button>
          </div>

          {/* Payment Methods Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Transferencia Bancaria Directa (CBU / CVU / Alias)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              PayPal (Pagos del exterior)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'border-2 border-rose-500 shadow-xl bg-gradient-to-b from-rose-50/40 via-white to-white'
                    : 'border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    RECOMENDADO PARA SUPERHOSTS
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{plan.subtitle}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-zinc-900 font-['Outfit']">${price}</span>
                    <span className="text-sm font-medium text-zinc-500">USD / mes</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isAnnual ? 'Facturado anualmente ($' + price * 12 + '/año)' : 'Sin compromiso de permanencia'}
                  </p>

                  <div className="mt-8 pt-6 border-t border-zinc-100">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-4">
                      ¿Qué incluye?
                    </span>
                    <ul className="space-y-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col gap-2.5">
                  <button
                    onClick={() => onOpenContact(plan.name)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      plan.popular
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    }`}
                  >
                    {plan.ctaText}
                  </button>

                  <button
                    onClick={onOpenDemo}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-rose-600 fill-rose-600" />
                    <span>Ver cómo se ve en la Demo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modular Add-ons Banner */}
        <div className="mt-16 max-w-5xl mx-auto rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-bold mb-2">
                <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Arquitectura 100% Modular</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                Módulos Opcionales: Pagá solo lo que tu complejo necesita
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
                El sistema base incluye todo lo necesario para operar con llaves físicas y reservas directas. Si brindás servicios adicionales o automatización con cerraduras, activás los add-ons con tarifa diferencial:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {/* Add-on 1 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Cerraduras Inteligentes & PIN</h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Para unidades con cerraduras digitales (Tuya, TTLock, Yale). Genera y rota códigos numéricos dinámicos vinculados a la reserva por WhatsApp.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">Add-on opcional</span>
                <button
                  onClick={() => onOpenContact('Módulo Cerraduras Inteligentes')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Consultar →
                </button>
              </div>
            </div>

            {/* Add-on 2 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100">
                  <Wine className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Frigobar & Consumos Extras</h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Carga consumos de frigobar, desayunos, confitería, leña para cabañas o amenities especiales a la cuenta del huésped para liquidar al check-out.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">Add-on opcional</span>
                <button
                  onClick={() => onOpenContact('Módulo Frigobar y Consumos')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Consultar →
                </button>
              </div>
            </div>

            {/* Add-on 3 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                  <Flower2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Spa, Turnos & Amenities</h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Gestión de turnos de piscina climatizada, sauna, masajes, alquiler de bicicletas, kayaks o paseos guiados con cupos por horario.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">Add-on opcional</span>
                <button
                  onClick={() => onOpenContact('Módulo Spa y Turnos')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Consultar →
                </button>
              </div>
            </div>

            {/* Add-on 4: Dominio Propio */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-rose-50/20 to-white">
              <div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-100">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Dominio Propio (.com / .ar)</h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Tu motor de reserva directa bajo tu propia marca (ej: <code>reservas.tucabana.com</code>). El costo de registro anual del dominio corre por cuenta del cliente; Loomi configura DNS y SSL gratis.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 font-mono">Costo del dominio</span>
                <button
                  onClick={() => onOpenContact('Dominio Propio para Motor Directo')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Vincular →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Concierge Callout */}
        <div className="mt-10 max-w-5xl mx-auto rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-100/60 border border-rose-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Servicio Concierge
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1.5">
                ¿No tenés tiempo? Hacemos el Onboarding por vos (Servicio Llave en Mano)
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed max-w-2xl">
                Si no querés encargarte de cargar las fotos, registrar las cabañas, o configurar las claves iCal de tus plataformas de alquiler, nuestro equipo lo hace por vos. Nos das tus enlaces de Airbnb/Booking, fotos del complejo y nos encargamos de todo el setup inicial en 72 horas. <strong>Tarifa única personalizada según la cantidad de unidades de tu complejo.</strong> ¡Listo para usar con soporte inicial personalizado!
              </p>
            </div>
          </div>
          <div className="text-center md:text-right shrink-0">
            <div className="text-xl font-extrabold text-[#c46d45] font-['Outfit']">
              A Cotizar
            </div>
            <div className="text-[10px] text-zinc-400 font-medium">Pago único proporcional</div>
            <button
              onClick={() => onOpenContact('Servicio Concierge Onboarding Llave en Mano (Presupuesto)')}
              className="mt-3 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 cursor-pointer transition-colors"
            >
              Consultar Puesta en Marcha
            </button>
          </div>
        </div>

        {/* Distinction Box: How you pay Loomi vs How your guests pay you */}
        <div className="mt-12 max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                1. Tu Abono Mensual a Loomi
              </span>
              <h4 className="font-bold text-zinc-900 text-sm mt-1.5">
                Transferencia Bancaria o PayPal
              </h4>
              <p className="text-zinc-600 mt-1 leading-relaxed">
                Nosotros cobramos la suscripción del software por <strong>Transferencia Bancaria directa (CBU/CVU o Alias)</strong> para Argentina o mediante <strong>PayPal</strong> para cuentas en el exterior. Sin intermediarios ni comisiones sorpresa.
              </p>
            </div>
            <div className="md:border-l md:border-zinc-200 md:pl-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">
                2. Los Cobros a tus Huéspedes
              </span>
              <h4 className="font-bold text-zinc-900 text-sm mt-1.5">
                Mercado Pago, PayPal o Tu Propio CBU
              </h4>
              <p className="text-zinc-600 mt-1 leading-relaxed">
                Vos cobrás tus reservas directas y señas con total libertad: podés integrar tu propia cuenta de <strong>Mercado Pago</strong> (link de pago o QR, el estándar local más utilizado), <strong>PayPal</strong> para extranjeros o tu CBU/Alias bancario. Todo el dinero de tus huéspedes va directo a tu cuenta.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Support note */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-600">✓</span>
            Abono mensual por Transferencia Bancaria (CBU/CVU) o PayPal
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-700" />
            14 días de garantía de satisfacción o devolución total
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-zinc-700" />
            Activación en menos de 10 minutos
          </span>
        </div>
      </div>
    </section>
  );
};
