import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Building2,
  KeyRound,
  Printer,
  X,
  Smartphone,
  Check,
} from 'lucide-react';

interface OnboardingGuideViewProps {
  onClose?: () => void;
  complexName?: string;
}

export const OnboardingGuideView: React.FC<OnboardingGuideViewProps> = ({
  onClose,
  complexName = 'Catalinas Apartamentos',
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Guia_Onboarding_LoomiSuite_${complexName.replace(/\s+/g, '_')}`;
    window.print();
    document.title = originalTitle;
  };

  const steps = [
    {
      step: '1',
      title: 'Registrar tus Unidades (Cabañas/Deptos)',
      subtitle: 'Configuración inicial de capacidad y fotos',
      icon: <Building2 className="w-5 h-5 text-[#c46d45]" />,
      desc: 'Cargá cada cabaña o departamento con su nombre único, cantidad de dormitorios, baños y huéspedes máximos. Esto le permite al sistema calcular tarifas y coordinar las limpiezas de manera automática.',
      checklist: [
        'Definir tarifa base por noche (USD/Pesos).',
        'Establecer la tarifa única de limpieza por recambio.',
        'Asignar el nombre de la red Wi-Fi y contraseña de la unidad.',
      ],
    },
    {
      step: '2',
      title: 'Sincronizar tus Calendarios (Doble Vía)',
      subtitle: 'Evitá el Overbooking / Sincronización automática',
      icon: <Calendar className="w-5 h-5 text-[#c46d45]" />,
      desc: 'Vinculá tus canales de venta (Airbnb, Booking.com, VRBO o tu propio Google Calendar) copiando y pegando el enlace iCal provisto por cada plataforma.',
      checklist: [
        'Copiar el enlace de exportación iCal de Airbnb e importarlo en Loomi.',
        'Exportar el iCal de Loomi y pegarlo en el calendario de Airbnb / Booking.',
        'Utilizar el módulo de Google Calendar para migrar tus reservas históricas.',
      ],
    },
    {
      step: '3',
      title: 'Configurar tu Equipo de Trabajo (Mucamas)',
      subtitle: 'Notificaciones automáticas en 1 clic',
      icon: <Users className="w-5 h-5 text-[#c46d45]" />,
      desc: 'Cargá los nombres de tus mucamas o personal de mantenimiento y sus números de WhatsApp. Ya no necesitás llamarlas para avisar que hay una unidad para limpiar.',
      checklist: [
        'Configurar el checklist obligatorio por unidad (Blanco, Sábanas, Toallas, Leña).',
        'Establecer el horario límite de limpieza para el próximo Check-in.',
        'Probar el envío de avisos de limpieza automáticos con el botón verde de WhatsApp.',
      ],
    },
    {
      step: '4',
      title: 'Activar tu Guía del Huésped',
      subtitle: 'Tu conserje digital 24/7 en un enlace web',
      icon: <Smartphone className="w-5 h-5 text-[#c46d45]" />,
      desc: 'Creá tu guía interactiva digital para que los huéspedes tengan toda la información de forma autónoma. Podés adjuntar el mapa de ubicación, clave de Wi-Fi, reglamentos y ofrecer opcionales (frigobar, traslados, etc.).',
      checklist: [
        'Cargar fotos de alta calidad y recomendaciones locales (Restaurantes, Paseos).',
        'Agregar los productos del Frigobar y servicios extra con sus respectivos precios.',
        'Compartir el link directo del depto en el mensaje de bienvenida de WhatsApp.',
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] overflow-hidden shadow-md max-w-4xl mx-auto transition-colors">
      {/* Visual Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#fbf9f5] via-white to-[#fcfaf7] dark:from-[#1c1c1c] dark:to-[#161616] border-b border-[#ded9cd] dark:border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Material de Bienvenida
            </span>
            <span className="text-[10px] font-bold text-[#3e6645] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Listo para Imprimir / Guardar
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee] tracking-tight mt-2.5">
            Guía de Auto-Configuración Paso a Paso
          </h2>
          <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1">
            Instrucciones para poner en marcha el PMS de tu complejo {complexName} de manera independiente.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] rounded-xl cursor-pointer transition-colors shadow-sm shadow-[#c46d45]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7a7874] hover:bg-[#f4f2ee] dark:hover:bg-[#222] border border-[#ded9cd] dark:border-[#333] transition-colors cursor-pointer"
              title="Cerrar Guía"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Cheat Sheet Area */}
      <div ref={printAreaRef} id="printable-guide-area" className="p-6 sm:p-8 space-y-8 font-sans text-[#1c1b18] dark:text-[#e0deda] bg-white dark:bg-[#1a1a1a]">
        
        {/* Printable ONLY Header (Hidden on Web screen via print CSS / tailwind) */}
        <div className="hidden print:block border-b-2 border-[#1c1b18] pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase text-zinc-900">LOOMI SUITE</h1>
              <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">PMS & Concierge de Alquiler Temporario</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-800">Guía de Inicio Rápido</span>
              <p className="text-[10px] text-zinc-500">Complejo: {complexName}</p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-[#f8f6f2] dark:bg-[#222] p-5 rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] print:border-zinc-300 transition-colors">
          <h3 className="text-sm font-bold text-[#c46d45] dark:text-[#e2835c] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>¡Bienvenido a la gestión inteligente de alquileres!</span>
          </h3>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b5af] mt-2 leading-relaxed">
            Esta guía contiene los pasos específicos para cargar tu complejo de alojamiento desde cero. Siguiendo estos pasos, en menos de una hora tu sistema estará listo para recibir reservas y coordinar a tu equipo de limpieza automáticamente.
          </p>
        </div>

        {/* Main Steps */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#78746c] dark:text-[#8c8a85] border-b border-[#ded9cd]/60 dark:border-[#282828] pb-2">
            Pasos para la Configuración Inicial
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-5 rounded-2xl border border-[#ded9cd]/80 dark:border-[#2a2a2a] hover:border-[#c46d45]/30 bg-white dark:bg-[#1c1c1c] print:border-zinc-300 print:break-inside-avoid"
              >
                <div className="w-9 h-9 rounded-xl bg-[#fbf9f5] dark:bg-[#252525] text-[#c46d45] dark:text-[#d88d5e] flex items-center justify-center shrink-0 border border-[#ded9cd]/40 dark:border-[#333] font-bold text-sm">
                  {item.step}
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{item.title}</h4>
                    <p className="text-[11px] text-[#78746c] dark:text-[#8c8a85]">{item.subtitle}</p>
                  </div>
                  <p className="text-xs text-[#5c5850] dark:text-[#b0ada7] leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-2">Checklist de tareas:</span>
                    <ul className="space-y-1.5">
                      {item.checklist.map((check, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2 text-xs text-[#3c3933] dark:text-[#c8c5c0]">
                          <div className="w-3.5 h-3.5 rounded border border-[#ded9cd] dark:border-[#444] bg-[#fbf9f5] dark:bg-[#222] shrink-0 mt-0.5 flex items-center justify-center">
                            <span className="text-[8px] text-emerald-600 font-bold hidden print:inline">✓</span>
                          </div>
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concierge Support Block */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-[#c46d45]/40 dark:border-[#4c3224]/60 bg-[#fbf9f5] dark:bg-[#1f1a17] space-y-4 print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c46d45]/10 text-[#c46d45] flex items-center justify-center border border-[#c46d45]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">¿Preocupación Cero? (Servicio Concierge)</h4>
                <p className="text-xs text-[#78746c] dark:text-[#a8a5a0]">Nosotros configuramos todo tu complejo por vos con una tarifa a medida.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] px-4 py-2 rounded-xl border border-[#c46d45]/20 shrink-0 shadow-2xs">
              Solicitar Puesta en Marcha
            </button>
          </div>
          <p className="text-xs text-[#6e6a62] dark:text-[#9c9994] leading-relaxed pt-2 border-t border-[#ded9cd]/60 dark:border-[#2e2621]">
            Si no querés encargarte de copiar enlaces, configurar las cerraduras inteligentes, o cargar tus fotos, nuestro equipo de onboarding se encarga del setup completo en 72hs. Solo nos proveés tus enlaces de Booking/Airbnb y nosotros te entregamos el sistema listo para operar con un soporte premium inicial de cortesía.
          </p>
        </div>

        {/* Print-only CSS style embedded for perfect print formatting */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            #printable-guide-area {
              padding: 0 !important;
              margin: 0 !important;
              background-color: white !important;
              color: black !important;
            }
            .print\\:border-zinc-300 {
              border-color: #d4d4d8 !important;
            }
            .print\\:break-inside-avoid {
              break-inside: avoid !important;
            }
            .dark {
              --tw-text-opacity: 1 !important;
              color: rgb(24 24 27) !important;
            }
            button, .lg\\:hidden {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );
};
