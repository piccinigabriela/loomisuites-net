import React from 'react';
import { Building2, ShieldCheck, Lock, Mail, MessageCircle, Heart } from 'lucide-react';

interface FooterProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white font-['Outfit']">
                Loomi <span className="text-rose-500">Suite</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Software simple y ágil de gestión para complejos de cabañas, bed & breakfasts, pequeños hostales familiares y posadas boutique.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Sincronización encriptada SSL 256-bit</span>
            </div>
          </div>

          {/* Col 2: Soluciones */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Solución
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#funciones" className="hover:text-white transition-colors">Calendario Multicanal Anti-Overbooking</a>
              </li>
              <li>
                <a href="#funciones" className="hover:text-white transition-colors">Gestión de Limpieza & Mucamas</a>
              </li>
              <li>
                <a href="#funciones" className="hover:text-white transition-colors">Motor de Reservas Directas</a>
              </li>
              <li>
                <a href="#funciones" className="hover:text-white transition-colors">Auto Check-in y Cerraduras</a>
              </li>
              <li>
                <a href="#funciones" className="hover:text-white transition-colors">Liquidación a Propietarios</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Integraciones */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Canales Conectados
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Airbnb Channel Partner</li>
              <li>Booking.com Connectivity Oficial</li>
              <li>VRBO / Expedia (iCal + API)</li>
              <li>TripAdvisor & Google Vacation Rentals</li>
              <li>WhatsApp Cloud API</li>
              <li>Mercado Pago & PayPal</li>
              <li>Cerraduras Digitales (Módulo Opcional)</li>
            </ul>
          </div>

          {/* Col 4: Demo y Contacto */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Probar el Sistema
            </h4>
            <p className="text-xs text-zinc-400 mb-3">
              Comprueba el funcionamiento en vivo con datos interactivos de muestra:
            </p>
            <button
              onClick={onOpenDemo}
              className="w-full text-xs font-bold py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mb-3"
            >
              <span>Abrir Demo en Vivo</span>
            </button>
            <button
              onClick={onOpenContact}
              className="w-full text-xs font-semibold py-2 px-3 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contactar por WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Loomi Suite. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Privacidad de Datos</span>
            <span>Términos del Servicio</span>
            <span>Seguridad de Pagos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
