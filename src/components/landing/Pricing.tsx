import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Play } from 'lucide-react';

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

        {/* Security & Support note */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
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
