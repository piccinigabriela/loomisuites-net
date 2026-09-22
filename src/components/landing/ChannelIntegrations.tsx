import React from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

export const ChannelIntegrations: React.FC = () => {
  const channels = [
    {
      name: 'Airbnb',
      category: 'Canal Oficial',
      badge: 'Sincronización en 3 seg',
      color: 'border-[#e4d6c9] dark:border-[#48372b] bg-[#f4eee7] dark:bg-[#28201a] text-[#9c512a] dark:text-[#d88d5e]',
      icon: '🏠',
      desc: 'Sincroniza tarifas, calendario, mensajes y reglas de cancelación de forma bidireccional.',
    },
    {
      name: 'Booking.com',
      category: 'Conectividad Oficial',
      badge: 'API Oficial + iCal',
      color: 'border-[#c8d9e6] dark:border-[#2b3a48] bg-[#eef4f8] dark:bg-[#1a252f] text-[#2c5370] dark:text-[#76aab8]',
      icon: '🏨',
      desc: 'Bloqueo instantáneo en menos de 3 segundos vía API directa de conectividad y sincronización de tarifas.',
    },
    {
      name: 'VRBO / Expedia',
      category: 'Mercado Internacional',
      badge: 'iCal Incluido + API',
      color: 'border-[#d5cbe6] dark:border-[#382b48] bg-[#f4eef8] dark:bg-[#251a2f] text-[#553b7a] dark:text-[#a890cc]',
      icon: '✈️',
      desc: 'Sincronización de calendario iCal bidireccional incluida sin costos ocultos, y conectividad con el grupo Expedia.',
    },
    {
      name: 'TripAdvisor & Google',
      category: 'Búsquedas & Reseñas',
      badge: 'Google Travel + TripAdvisor',
      color: 'border-[#c5ded8] dark:border-[#2b443e] bg-[#ecf5f2] dark:bg-[#192b26] text-[#2b6456] dark:text-[#6cb5a2]',
      icon: '🗺️',
      desc: 'Aparece en las búsquedas turísticas de Google Vacation Rentals y TripAdvisor sincronizando disponibilidad por iCal.',
    },
    {
      name: 'WhatsApp Business',
      category: 'Mensajería Automatizada',
      badge: 'Sin intervención manual',
      color: 'border-[#d2e4d2] dark:border-[#344836] bg-[#edf4ed] dark:bg-[#1f2b20] text-[#3e6645] dark:text-[#a4cca8]',
      icon: '💬',
      desc: 'Envía ubicación por GPS, clave de Wi-Fi y código de cerradura justo en el momento preciso.',
    },
    {
      name: 'Cerraduras Digitales (Módulo Opcional)',
      category: 'Add-on Opcional',
      badge: 'Módulo Diferencial',
      color: 'border-[#ecd9be] dark:border-[#4d3d2c] bg-[#fbf5eb] dark:bg-[#282017] text-[#7d4812] dark:text-[#e4a86b]',
      icon: '🔑',
      desc: 'Para quienes no usan llave física y cuentan con cerraduras electrónicas (Tuya, Yale, Nuki). Genera PIN dinámico por reserva.',
    },
    {
      name: 'Cobros Directos para tus Huéspedes',
      category: 'Pasarelas del Complejo',
      badge: 'Mercado Pago, PayPal & CBU',
      color: 'border-[#dcd4c8] dark:border-[#3d372e] bg-[#f6f1eb] dark:bg-[#23201c] text-[#5e4b38] dark:text-[#c4b5a2]',
      icon: '💳',
      desc: 'Tus huéspedes te pagan directo a vos: integrá tu cuenta de Mercado Pago (link de pago o QR), transferencias por CBU/Alias bancario o PayPal sin intermediarios.',
    },
    {
      name: 'Google Calendar & CSV Import',
      category: 'Migración Inmediata',
      badge: 'Traspaso en 1 Clic',
      color: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-[#2a221b] text-blue-700 dark:text-[#d88d5e]',
      icon: '📅',
      desc: '¿Tenés tus reservas actuales en Google Calendar o planillas Excel? Subí tu archivo .ics o .csv y Loomi Suite importará todas tus estadías en un segundo sin superposiciones.',
    },
  ];

  return (
    <section id="canales" className="py-16 bg-[#f8f6f2] dark:bg-[#161616] border-b border-[#ded9cd] dark:border-[#282828] text-[#1c1b18] dark:text-[#f4f2ee] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edeae2] dark:bg-[#222] text-[#55514a] dark:text-[#b0ada8] border border-[#ded9cd] dark:border-[#333] text-xs font-semibold mb-3">
            <RefreshCw className="w-3.5 h-3.5 text-[#c46d45] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Sincronización Multicanal en Tiempo Real</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1c1b18] dark:text-[#ffffff] tracking-tight">
            Todas tus plataformas conectadas en un único panel
          </h2>
          <p className="mt-3 text-base text-[#66625a] dark:text-[#a8a5a0]">
            Publica en todos lados sin miedo a una sobreventa. Cuando entra una reserva en Booking o Airbnb, Loomi Suite bloquea las demás plataformas en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((ch, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] hover:border-[#c46d45]/50 dark:hover:border-[#c46d45]/50 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{ch.name}</h3>
                      <span className="text-xs text-[#78746c] dark:text-[#8e8c87] font-medium">{ch.category}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ch.color}`}>
                    {ch.badge}
                  </span>
                </div>
                <p className="text-sm text-[#55514a] dark:text-[#a8a5a0] leading-relaxed">{ch.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#edeae2] dark:border-[#282828] flex items-center gap-2 text-xs font-semibold text-[#4f7858] dark:text-[#78b37e]">
                <CheckCircle className="w-3.5 h-3.5 text-[#4f7858] dark:text-[#78b37e]" />
                <span>Compatible y listo para conectar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

