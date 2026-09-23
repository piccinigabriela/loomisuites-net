import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo es el proceso de Onboarding (puesta en marcha)?',
      a: 'Lleva menos de 15 minutos en total y no requiere conocimientos técnicos ni instalaciones. Consta de 3 pasos sencillos: 1) Cargas tus cabañas o habitaciones con su nombre y capacidad; 2) Pegas los enlaces iCal de Booking y Airbnb para importar automáticamente todas tus reservas existentes; 3) Se genera tu enlace propio de reservas directas y tus plantillas de WhatsApp. Si prefieres, te acompañamos por WhatsApp en vivo para configurarlo juntos.',
    },
    {
      q: '¿Por qué no está pensado para grandes inmobiliarias de 300 departamentos?',
      a: 'Porque las inmobiliarias requieren sistemas de facturación corporativa, cobro de alquileres tradicionales y 50 módulos burocráticos. Loomi Suite fue diseñado con la filosofía ágil (estilo BananaDesk) para complejos de cabañas, bed & breakfasts, pequeños hostales y posadas de 2 a 25 unidades: una interfaz visual, rápida, enfocada en no tener sobreventas, coordinar mucamas y vender directo por WhatsApp.',
    },
    {
      q: '¿Loomi Suite reemplaza mis cuentas de Airbnb o Booking.com?',
      a: 'No, las sincroniza y potencia. Sigues recibiendo tus reservas normalmente desde Airbnb o Booking.com. Loomi Suite actúa como el centro de control que sincroniza la disponibilidad de inmediato para evitar dobles reservas (overbookings) y te permite gestionar todo desde una sola pantalla limpia.',
    },
    {
      q: '¿Cómo funciona la Demo Interactiva en vivo?',
      a: 'La demo funciona al 100% en tu navegador utilizando almacenamiento local con datos ficticios realistas de cabañas y habitaciones de B&B. Puedes crear reservas, cambiar el estado de las limpiezas, simular el envío de mensajes por WhatsApp y ver cómo se actualizan las finanzas sin ingresar tarjeta ni registrarte.',
    },
    {
      q: '¿Cómo se comunican las tareas con el personal de limpieza y mucamas?',
      a: 'No exigimos que tu personal descargue aplicaciones pesadas ni recuerde contraseñas. Loomi Suite genera una vista web móvil simple que puedes enviarles automáticamente por WhatsApp con el cronograma del día, qué cabaña o habitación toca y checklist de ropa blanca y reposición.',
    },
    {
      q: '¿Necesito cerraduras inteligentes o cambiar las puertas de mis cabañas?',
      a: 'No, de ninguna manera. En Argentina y la región la gran mayoría de complejos y cabañas opera con llave física tradicional, llavero o candado con combinación. Loomi Suite está 100% preparado para trabajar con tus llaves físicas de siempre (podés enviar ubicación del llavero o coordinar la entrega por WhatsApp). Quienes tengan departamentos urbanos con cerraduras digitales (Tuya, Yale, TTLock) pueden activar opcionalmente el Módulo de Cerraduras Inteligentes con una tarifa adicional diferencial, pagando solo si lo usan.',
    },
    {
      q: '¿Cómo funciona el motor de reservas directas para ahorrar comisiones?',
      a: 'Te entregamos una página web moderna con tu propio enlace donde los huéspedes que te contactan por Instagram o WhatsApp pueden ver fotos, elegir fechas y señar directo a tu cuenta bancaria. Así te ahorras el 18% a 20% que cobran las plataformas.',
    },
    {
      q: '¿Cómo cobro a mis huéspedes por sus estadías y señas directas?',
      a: 'Tus huéspedes te pagan directo a vos con la pasarela que prefieras: podés integrar tu propia cuenta de Mercado Pago (link de pago o QR, que es la forma más común en Argentina para cobrar con tarjeta o dinero en cuenta), transferencia bancaria directa a tu CBU/Alias, o PayPal para turistas extranjeros. Si usás otra billetera o sistema de cobro, también podés sumarla. Loomi no interviene en tus cobros ni te descuenta comisiones por reserva.',
    },
    {
      q: '¿Cuáles son los medios de pago para abonar la suscripción de Loomi?',
      a: 'Nosotros cobramos el abono mensual del software mediante transferencia bancaria directa (CBU, CVU o Alias) para Argentina, o a través de PayPal para anfitriones del exterior. No necesitás ingresar ninguna tarjeta de crédito para probar la demo interactiva ni para comenzar.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-b border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Resolución de Dudas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Todo lo que necesitas saber antes de probar y comenzar con Loomi Suite.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-zinc-900 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="mt-12 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">¿Tenés otra duda o consulta particular?</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Nuestro equipo de soporte y asesores te responderá a la brevedad.</p>
          </div>
          <a
            href="mailto:contacto@loomisuite.net"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c46d45] hover:bg-[#b85e35] text-white text-xs font-bold transition-colors shadow-xs"
            title="Escribir a contacto@loomisuite.net"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>contacto@loomisuite.net</span>
          </a>
        </div>
      </div>
    </section>
  );
};
