import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Building, Sparkles, Send } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  selectedPlan?: string;
  onClose: () => void;
  onOpenDemo: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  selectedPlan,
  onClose,
  onOpenDemo,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertiesCount, setPropertiesCount] = useState('4-10');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate lead capture
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
              {selectedPlan ? `Plan Seleccionado: ${selectedPlan}` : 'Asesoría Especializada'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            Gestiona tu alojamiento con la simpleza de Loomi Suite
          </h3>
          <p className="text-xs text-rose-100 mt-1">
            Déjanos tus datos y un especialista te contactará de inmediato por WhatsApp sin compromiso.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900">¡Solicitud recibida con éxito!</h4>
              <p className="text-xs text-zinc-600 mt-2 max-w-xs mx-auto">
                Nos pondremos en contacto contigo a la brevedad por WhatsApp para coordinar tu activación sin costo de instalación.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDemo();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Mientras tanto, explorar la Demo Interactiva →
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Tu Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Laura Gómez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-rose-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="laura@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-rose-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ¿Cuántas propiedades o alojamientos gestionas hoy?
                </label>
                <select
                  value={propertiesCount}
                  onChange={(e) => setPropertiesCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-rose-500 text-sm bg-white"
                >
                  <option value="4-10">4 a 10 propiedades ($45.000 / mes)</option>
                  <option value="10-20">10 a 20 propiedades ($60.000 / mes)</option>
                  <option value="20-30">20 a 30 propiedades ($80.000 / mes)</option>
                  <option value="30+">Más de 30 propiedades (Plan Personalizado)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-sm font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar y Recibir Asesoría por WhatsApp</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  🔒 Sin tarjeta de crédito para comenzar. Pagos por suscripción de Mercado Pago o PayPal al activar.
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDemo();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  O simplemente probar la Demo Interactiva en vivo ahora →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
