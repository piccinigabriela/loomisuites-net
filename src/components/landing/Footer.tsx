import React from 'react';
import { ShieldCheck, MessageCircle, Heart, Mail } from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';

interface FooterProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <footer className="bg-[#141414] text-[#9e9b94] py-16 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#262626]">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <LoomiLogo size="md" theme="dark" />
            </div>
            <p className="text-xs text-[#8e8a83] leading-relaxed">
              Software simple y ágil de gestión para complejos de cabañas, bed & breakfasts, pequeños hostales familiares y posadas boutique.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#a4cca8] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#78b37e]" />
              <span>Sincronización encriptada SSL 256-bit</span>
            </div>
            <div className="mt-3">
              <a
                href="mailto:contacto@loomisuite.net"
                className="inline-flex items-center gap-2 text-xs text-[#d88d5e] hover:text-[#e8a378] font-medium transition-colors"
                title="Escribir a contacto@loomisuite.net"
              >
                <Mail className="w-3.5 h-3.5 text-[#c46d45]" />
                <span>contacto@loomisuite.net</span>
              </a>
            </div>
          </div>

          {/* Col 2: Soluciones */}
          <div>
            <h4 className="text-xs font-bold text-[#f4f2ee] uppercase tracking-wider mb-3">
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
            <h4 className="text-xs font-bold text-[#f4f2ee] uppercase tracking-wider mb-3">
              Canales Conectados
            </h4>
            <ul className="space-y-2 text-xs text-[#8e8a83]">
              <li>Airbnb Channel Partner</li>
              <li>Booking.com Connectivity Oficial</li>
              <li>VRBO / Expedia (iCal + API)</li>
              <li>TripAdvisor & Google Vacation Rentals</li>
              <li>WhatsApp Cloud API</li>
              <li>Mercado Pago, PayPal & CBU (Para tus Huéspedes)</li>
              <li>Cerraduras Digitales (Módulo Opcional)</li>
            </ul>
          </div>

          {/* Col 4: Demo y Contacto */}
          <div>
            <h4 className="text-xs font-bold text-[#f4f2ee] uppercase tracking-wider mb-3">
              Probar el Sistema
            </h4>
            <p className="text-xs text-[#8e8a83] mb-3">
              Comprueba el funcionamiento en vivo con datos interactivos de muestra:
            </p>
            <button
              onClick={onOpenDemo}
              className="w-full text-xs font-bold py-2.5 px-4 bg-[#c46d45] hover:bg-[#b85e35] text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mb-2.5 shadow-md shadow-[#c46d45]/20"
            >
              <span>Abrir Demo en Vivo</span>
            </button>
            <button
              onClick={onOpenContact}
              className="w-full text-xs font-bold py-2 px-3 text-[#d0cdc8] hover:text-white hover:bg-[#202020] rounded-xl border border-[#333] flex items-center justify-center gap-1.5 cursor-pointer transition-all mb-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#78b37e]" />
              <span>Contactar Asesor Humano</span>
            </button>
            <a
              href="mailto:contacto@loomisuite.net"
              className="w-full text-xs font-semibold py-2 px-3 text-[#b5b1a8] hover:text-[#f4f2ee] hover:bg-[#202020] rounded-xl border border-[#2d2a26] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title="Enviar correo a contacto@loomisuite.net"
            >
              <Mail className="w-3.5 h-3.5 text-[#d88d5e]" />
              <span>contacto@loomisuite.net</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78746c]">
          <p>© {new Date().getFullYear()} Loomi Suite. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="mailto:contacto@loomisuite.net"
              className="hover:text-[#d88d5e] transition-colors flex items-center gap-1.5 text-[#9e9b94]"
            >
              <Mail className="w-3.5 h-3.5 text-[#c46d45]" />
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
