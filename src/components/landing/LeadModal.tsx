import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Building, Sparkles, Send, PhoneCall, Mail } from 'lucide-react';
import { saveLeadToCloud } from '../../lib/firebase';

interface LeadModalProps {
  isOpen: boolean;
  selectedPlan?: string;
  onClose: () => void;
  onOpenDemo: () => void;
}

const SALES_WHATSAPP_PHONE = '5491140925939';
const SALES_PHONE_DISPLAY = '+54 9 11 4092-5939';
const CONTACT_EMAIL = 'contacto@loomisuite.net';

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
  const [accommodationType, setAccommodationType] = useState('Glamping & Domos');
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const planName = selectedPlan || 'Plan Cabañas & Glampings';
    const message = `¡Hola Loomi Suite! 👋 Mi nombre es ${name.trim()}. Gestiono ${propertiesCount} unidades de tipo *${accommodationType}* y me interesa activar el *${planName}*.
📱 Mi Teléfono/WhatsApp: ${phone.trim()}
✉️ Mi Correo: ${email.trim()}
¿Cómo coordinamos la activación y la sincronización de mis calendarios?`;

    const url = `https://wa.me/${SALES_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);
    setSubmitted(true);

    // Save lead record in Firestore Cloud Database
    saveLeadToCloud({
      fullName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      complexName: `${name.trim()} (${accommodationType})`,
      propertiesCount: parseInt(propertiesCount.replace(/\D/g, ''), 10) || 5,
      planOrTopic: planName,
    });

    // Attempt to open WhatsApp in new window
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1714] text-zinc-900 dark:text-zinc-100 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-[#382b20] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c46d45] to-[#9c512a] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              {selectedPlan ? `Plan: ${selectedPlan}` : 'Activación Comercial'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            Comenzá a gestionar tu complejo con Loomi Suite
          </h3>
          <p className="text-xs text-amber-100/90 mt-1">
            Atención por WhatsApp: <strong>{SALES_PHONE_DISPLAY}</strong> o por correo: <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-bold hover:text-white">{CONTACT_EMAIL}</a>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-[#1a1714]">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">¡Solicitud generada con éxito!</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 max-w-sm mx-auto">
                Hemos preparado tu mensaje comercial para el equipo de Loomi Suite en WhatsApp <strong>{SALES_PHONE_DISPLAY}</strong> o vía correo a <strong>{CONTACT_EMAIL}</strong>.
              </p>
              
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir WhatsApp Directo ({SALES_PHONE_DISPLAY})</span>
                </a>

                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Consulta sobre Loomi Suite - ${name || 'Complejo'}`)}&body=${encodeURIComponent(`Hola Loomi Suite,\n\nMi nombre es ${name} y me interesa recibir información sobre el plan ${selectedPlan || 'Loomi Suite'}.\n\nTeléfono: ${phone}\nCorreo: ${email}\nCantidad de unidades: ${propertiesCount}`)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#26201a] dark:hover:bg-[#342a22] border border-zinc-300 dark:border-[#48372b] text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[#c46d45]" />
                  <span>O enviar por correo a {CONTACT_EMAIL}</span>
                </a>
                
                <button
                  onClick={() => {
                    onClose();
                    onOpenDemo();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2a221b] hover:bg-[#382b20] border border-[#48372b] text-[#d88d5e] text-xs font-bold transition-all cursor-pointer"
                >
                  Continuar explorando el Panel Demo →
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Tu Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Gabriela Piccini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#48372b] bg-zinc-50 dark:bg-[#121110] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:border-[#c46d45] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Tu WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#48372b] bg-zinc-50 dark:bg-[#121110] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:border-[#c46d45] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#48372b] bg-zinc-50 dark:bg-[#121110] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:border-[#c46d45] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Tipo de Alojamiento
                  </label>
                  <select
                    value={accommodationType}
                    onChange={(e) => setAccommodationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#48372b] bg-zinc-50 dark:bg-[#121110] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#c46d45] text-sm"
                  >
                    <option value="Glamping & Domos">⛺ Glamping & Domos Geodésicos</option>
                    <option value="Complejo de Cabañas">🌲 Complejo de Cabañas</option>
                    <option value="Departamentos Turísticos">🏢 Departamentos Turísticos</option>
                    <option value="Posada & Lodge">🏡 Posada / Lodge de Naturaleza</option>
                    <option value="Bed & Breakfast / Hostel">☕ B&B / Pequeño Hostal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    ¿Cuántas unidades gestionas?
                  </label>
                  <select
                    value={propertiesCount}
                    onChange={(e) => setPropertiesCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#48372b] bg-zinc-50 dark:bg-[#121110] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#c46d45] text-sm"
                  >
                    <option value="4-10">4 a 10 unidades ($45.000 / mes)</option>
                    <option value="10-20">10 a 20 unidades ($60.000 / mes)</option>
                    <option value="20-30">20 a 30 unidades ($80.000 / mes)</option>
                    <option value="30+">Más de 30 unidades (Personalizado)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c46d45] hover:bg-[#b85e35] active:scale-98 text-white text-sm font-bold shadow-md shadow-[#c46d45]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar y Chatear por WhatsApp ({SALES_PHONE_DISPLAY})</span>
                </button>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center mt-2">
                  🔒 Sin tarjeta de crédito para comenzar. Activación y configuración guiada en 24 horas.
                </p>

                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-[#382b20] flex items-center justify-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <Mail className="w-3.5 h-3.5 text-[#c46d45] shrink-0" />
                  <span>¿Preferís escribirnos por correo?</span>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-[#c46d45] dark:text-[#d88d5e] font-bold hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDemo();
                  }}
                  className="text-xs font-semibold text-[#c46d45] hover:underline cursor-pointer"
                >
                  O simplemente continuar probando la Demo Interactiva →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
