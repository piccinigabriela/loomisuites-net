import React from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

export const ChannelIntegrations: React.FC = () => {
  const channels = [
    {
      name: 'Airbnb',
      category: 'Canal Oficial',
      badge: 'Sincronización en 3 seg',
      color: 'border-[#18181B] bg-[#18181B] text-white',
      icon: '🏠',
      desc: 'Sincroniza tarifas, calendario, mensajes y reglas de cancelación de forma bidireccional.',
    },
    {
      name: 'Booking.com',
      category: 'Conectividad Oficial',
      badge: 'API Oficial + iCal',
      color: 'border-[#E1500A] bg-[#E1500A] text-white',
      icon: '🏨',
      desc: 'Bloqueo instantáneo en menos de 3 segundos vía API directa de conectividad y sincronización de tarifas.',
    },
    {
      name: 'VRBO / Expedia',
      category: 'Mercado Internacional',
      badge: 'iCal Incluido + API',
      color: 'border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#252525] text-[#18181B] dark:text-[#FFFFFF]',
      icon: '✈️',
      desc: 'Sincronización de calendario iCal bidireccional incluida sin costos ocultos, y conectividad con el grupo Expedia.',
    },
    {
      name: 'TripAdvisor & Portales iCal',
      category: 'Portales Turísticos & OTAs',
      badge: 'TripAdvisor + iCal Global',
      color: 'border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#252525] text-[#18181B] dark:text-[#FFFFFF]',
      icon: '🗺️',
      desc: 'Sincronizá tu disponibilidad en TripAdvisor y en cualquier portal turístico o regional que soporte iCal sin costos extras.',
    },
    {
      name: 'WhatsApp Business',
      category: 'Mensajería Automatizada',
      badge: 'Sin intervención manual',
      color: 'border-[#18181B] bg-[#18181B] text-white',
      icon: '💬',
      desc: 'Envía ubicación por GPS, clave de Wi-Fi y código de cerradura justo en el momento preciso.',
    },
    {
      name: 'Cerraduras Digitales (Módulo Opcional)',
      category: 'Add-on Opcional',
      badge: 'Módulo Diferencial',
      color: 'border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#252525] text-[#18181B] dark:text-[#FFFFFF]',
      icon: '🔑',
      desc: 'Para quienes no usan llave física y cuentan con cerraduras electrónicas (Tuya, Yale, Nuki). Genera PIN dinámico por reserva.',
    },
    {
      name: 'Cobros Directos para tus Huéspedes',
      category: 'Pasarelas del Complejo',
      badge: 'Mercado Pago, PayPal & CBU',
      color: 'border-[#E1500A] bg-[#E1500A] text-white',
      icon: '💳',
      desc: 'Tus huéspedes te pagan directo a vos: integrás tu cuenta de Mercado Pago (link de pago o QR), transferencias por CBU/Alias bancario o PayPal sin intermediarios.',
    },
    {
      name: 'Google Calendar & CSV Import',
      category: 'Migración Inmediata',
      badge: 'Traspaso en 1 Clic',
      color: 'border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#252525] text-[#18181B] dark:text-[#FFFFFF]',
      icon: '📅',
      desc: '¿Tenés tus reservas actuales en Google Calendar o planillas Excel? Subí tu archivo .ics o .csv y Loomi Suite importará todas tus estadías en un segundo sin superposiciones.',
    },
  ];

  return (
    <section id="canales" className="py-16 bg-[#EFECE5] dark:bg-[#1A1A1A] border-b border-[#DCD8CE] dark:border-[#2D2D2D] text-[#18181B] dark:text-[#FAF7F2] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#252525] text-[#18181B] dark:text-[#EFECE5] border border-[#DCD8CE] dark:border-[#383838] text-xs font-black mb-3 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-[#E1500A] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Sincronización Multicanal en Tiempo Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] dark:text-[#FFFFFF] tracking-tight">
            Todas tus plataformas conectadas en un único panel
          </h2>
          <p className="mt-3 text-base text-[#666666] dark:text-[#A3A3A3]">
            Publica en todos lados sin miedo a una sobreventa. Cuando entra una reserva en Booking o Airbnb, Loomi Suite bloquea las demás plataformas en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((ch, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border-2 border-[#DCD8CE] dark:border-[#333333] bg-white dark:bg-[#222222] hover:border-[#E1500A] dark:hover:border-[#E1500A] hover:shadow-xl transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <h3 className="text-lg font-black text-[#18181B] dark:text-[#FFFFFF]">{ch.name}</h3>
                      <span className="text-xs text-[#666666] dark:text-[#A3A3A3] font-semibold">{ch.category}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${ch.color}`}>
                    {ch.badge}
                  </span>
                </div>
                <p className="text-sm text-[#666666] dark:text-[#A3A3A3] leading-relaxed">{ch.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#DCD8CE] dark:border-[#333333] flex items-center gap-2 text-xs font-black text-[#18181B] dark:text-[#FFFFFF]">
                <CheckCircle className="w-3.5 h-3.5 text-[#E1500A]" />
                <span>Compatible y listo para conectar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

