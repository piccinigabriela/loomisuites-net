import React from 'react';
import { ShieldCheck, MessageCircle, Heart, Mail } from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';

interface FooterProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <footer className="bg-[#18181B] text-[#A3A3A3] py-16 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#27272A]">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="text-xl font-light tracking-widest text-white">
                loomi<span className="font-semibold text-[#E67E22]">suite</span>
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Software simple y ágil de gestión para complejos de cabañas, glampings, domos, pequeños hostales familiares y posadas boutique.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#E67E22] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#E67E22]" />
              <span>Sincronización encriptada SSL 256-bit</span>
            </div>
            <div className="mt-3">
              <a
                href="mailto:contacto@loomisuite.net"
                className="inline-flex items-center gap-2 text-xs text-[#E67E22] hover:text-[#FF8833] font-semibold transition-colors"
                title="Escribir a contacto@loomisuite.net"
              >
                <Mail className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>contacto@loomisuite.net</span>
              </a>
            </div>
          </div>

          {/* Col 2: Soluciones */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">
              Solución
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#preguntas-clave" className="hover:text-white transition-colors">Calendario Multicanal Anti-Overbooking</a>
              </li>
              <li>
                <a href="#preguntas-clave" className="hover:text-white transition-colors">Gestión de Limpieza & Mucamas</a>
              </li>
              <li>
                <a href="#preguntas-clave" className="hover:text-white transition-colors">Motor de Reservas Directas</a>
              </li>
              <li>
                <a href="#preguntas-clave" className="hover:text-white transition-colors">Auto Check-in y WhatsApp</a>
              </li>
              <li>
                <a href="#preguntas-clave" className="hover:text-white transition-colors">Asistente IA Xenia 24/7</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Integraciones */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">
              Canales Conectados
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>Airbnb Channel Partner</li>
              <li>Booking.com Connectivity Oficial</li>
              <li>VRBO / Expedia (iCal + API)</li>
              <li>TripAdvisor & Portales iCal</li>
              <li>WhatsApp Cloud API</li>
              <li>Mercado Pago, PayPal & CBU (Para tus Huéspedes)</li>
              <li>Cerraduras Digitales (Módulo Opcional)</li>
            </ul>
          </div>

          {/* Col 4: Demo y Contacto */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">
              Probar el Sistema
            </h4>
            <p className="text-xs text-[#A3A3A3] mb-3">
              Comprueba el funcionamiento en vivo con datos interactivos de muestra:
            </p>
            <button
              onClick={onOpenDemo}
              className="w-full text-xs font-black py-3 px-4 bg-[#E1500A] hover:bg-[#C94305] text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mb-2.5 shadow-lg shadow-[#E1500A]/30 active:scale-98"
            >
              <span>Abrir Demo en Vivo</span>
            </button>
            <button
              onClick={onOpenContact}
              className="w-full text-xs font-bold py-2.5 px-3 text-[#EFECE5] hover:text-white hover:bg-[#27272A] rounded-xl border border-[#383838] flex items-center justify-center gap-1.5 cursor-pointer transition-all mb-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>Contactar Asesor Humano</span>
            </button>
            <a
              href="mailto:contacto@loomisuite.net"
              className="w-full text-xs font-semibold py-2.5 px-3 text-[#A3A3A3] hover:text-white hover:bg-[#27272A] rounded-xl border border-[#383838] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title="Enviar correo a contacto@loomisuite.net"
            >
              <Mail className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>contacto@loomisuite.net</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E9DB8]">
          <p>© {new Date().getFullYear()} Loomi Suite. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="mailto:contacto@loomisuite.net"
              className="hover:text-[#C6A75E] transition-colors flex items-center gap-1.5 text-[#A6B4CE]"
            >
              <Mail className="w-3.5 h-3.5 text-[#C6A75E]" />
              <span>contacto@loomisuite.net</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <span>Diseñado para cabañas, glampings, domos y alojamientos independientes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
