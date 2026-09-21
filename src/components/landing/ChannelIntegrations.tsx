import React from 'react';
import { RefreshCw, CheckCircle, Zap } from 'lucide-react';

export const ChannelIntegrations: React.FC = () => {
  const channels = [
    {
      name: 'Airbnb',
      category: 'Canal Oficial',
      badge: 'Sincronización en 3 seg',
      color: 'border-rose-200 bg-rose-50/60 text-rose-800',
      icon: '🏠',
      desc: 'Sincroniza tarifas, calendario, mensajes y reglas de cancelación de forma bidireccional.',
    },
    {
      name: 'Booking.com',
      category: 'Conectividad Oficial',
      badge: 'API Oficial + iCal',
      color: 'border-blue-200 bg-blue-50/60 text-blue-800',
      icon: '🏨',
      desc: 'Bloqueo instantáneo en menos de 3 segundos vía API directa de conectividad y sincronización de tarifas.',
    },
    {
      name: 'VRBO / Expedia',
      category: 'Mercado Internacional',
      badge: 'iCal Incluido + API',
      color: 'border-indigo-200 bg-indigo-50/60 text-indigo-800',
      icon: '✈️',
      desc: 'Sincronización de calendario iCal bidireccional incluida sin costos ocultos, y conectividad con el grupo Expedia.',
    },
    {
      name: 'TripAdvisor & Google',
      category: 'Búsquedas & Reseñas',
      badge: 'Google Travel + TripAdvisor',
      color: 'border-teal-200 bg-teal-50/60 text-teal-800',
      icon: '🗺️',
      desc: 'Aparece en las búsquedas turísticas de Google Vacation Rentals y TripAdvisor sincronizando disponibilidad por iCal.',
    },
    {
      name: 'WhatsApp Business',
      category: 'Mensajería Automatizada',
      badge: 'Sin intervención manual',
      color: 'border-emerald-200 bg-emerald-50/60 text-emerald-800',
      icon: '💬',
      desc: 'Envía ubicación por GPS, clave de Wi-Fi y código de cerradura justo en el momento preciso.',
    },
    {
      name: 'Cerraduras Digitales (Módulo Opcional)',
      category: 'Add-on Opcional',
      badge: 'Módulo Diferencial',
      color: 'border-amber-200 bg-amber-50/60 text-amber-800',
      icon: '🔑',
      desc: 'Para quienes no usan llave física y cuentan con cerraduras electrónicas (Tuya, Yale, Nuki). Genera PIN dinámico por reserva.',
    },
    {
      name: 'Cobros Directos y Señas',
      category: 'Pasarelas de Pago',
      badge: 'Mercado Pago, PayPal & Tarjetas',
      color: 'border-purple-200 bg-purple-50/60 text-purple-800',
      icon: '💳',
      desc: 'Cobra transferencias locales, señas con tarjeta o depósitos de garantía con Mercado Pago o PayPal.',
    },
  ];

  return (
    <section id="canales" className="py-16 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold mb-3">
            <RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Sincronización Multicanal en Tiempo Real</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Todas tus plataformas conectadas en un único panel
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Publica en todos lados sin miedo a una sobreventa. Cuando entra una reserva en Booking o Airbnb, Loomi Suite bloquea las demás plataformas en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((ch, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{ch.name}</h3>
                      <span className="text-xs text-zinc-500 font-medium">{ch.category}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ch.color}`}>
                    {ch.badge}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{ch.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compatible y listo para conectar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
