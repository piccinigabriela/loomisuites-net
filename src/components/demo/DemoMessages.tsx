import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  User,
  KeyRound,
  CheckCheck,
} from 'lucide-react';
import { DemoState, Reservation, MessageTemplate } from '../../types';
import { formatDisplayDate } from '../../data/initialData';
import { copyToClipboard } from '../../utils/clipboard';

interface DemoMessagesProps {
  demoState: DemoState;
}

export const DemoMessages: React.FC<DemoMessagesProps> = ({ demoState }) => {
  const [selectedResId, setSelectedResId] = useState<string>(
    demoState.reservations[0]?.id || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    demoState.templates[1]?.id || demoState.templates[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  const selectedReservation = demoState.reservations.find(
    (r) => r.id === selectedResId
  );
  const selectedProperty = demoState.properties.find(
    (p) => p.id === selectedReservation?.propertyId
  );
  const selectedTemplate = demoState.templates.find(
    (t) => t.id === selectedTemplateId
  );

  // Compute interpolated message content
  const getInterpolatedMessage = () => {
    if (!selectedTemplate || !selectedReservation || !selectedProperty) return '';

    let content = selectedTemplate.content;
    content = content.replace(/{nombre_huesped}/g, selectedReservation.guestName.split(' ')[0]);
    content = content.replace(/{nombre_propiedad}/g, selectedProperty.name);
    content = content.replace(/{propiedad_id}/g, selectedProperty.id);
    content = content.replace(/{direccion_propiedad}/g, `${selectedProperty.address}, ${selectedProperty.neighborhood}`);
    content = content.replace(/{fecha_llegada}/g, formatDisplayDate(selectedReservation.checkIn));
    content = content.replace(/{fecha_salida}/g, formatDisplayDate(selectedReservation.checkOut));
    content = content.replace(/{codigo_cerradura}/g, selectedReservation.pinCode);
    content = content.replace(/{nombre_wifi}/g, selectedProperty.wifiNetwork);
    content = content.replace(/{clave_wifi}/g, selectedProperty.wifiPassword);

    return content;
  };

  const handleCopy = () => {
    copyToClipboard(getInterpolatedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulate = () => {
    setSimulatedSent(true);
    setTimeout(() => setSimulatedSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
        <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
          <span>Simulador de Mensajería y WhatsApp Automático</span>
        </h3>
        <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
          Configura tus plantillas inteligentes. Los datos del huésped, las fechas y las contraseñas de las cerraduras se rellenan automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Selectors (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Reservation Selector */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider mb-2">
              1. Selecciona el Huésped o Reserva
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-[#ded9cd] dark:border-[#383838] bg-[#f8f6f2] dark:bg-[#252525] text-[#1c1b18] dark:text-[#f4f2ee]"
            >
              {demoState.reservations.map((r) => {
                const prop = demoState.properties.find((p) => p.id === r.propertyId);
                return (
                  <option key={r.id} value={r.id}>
                    {r.guestName} ({r.platform.toUpperCase()}) - {prop?.neighborhood} ({formatDisplayDate(r.checkIn)} al {formatDisplayDate(r.checkOut)})
                  </option>
                );
              })}
            </select>

            {selectedReservation && (
              <div className="mt-3 p-3 bg-[#f8f6f2] dark:bg-[#252525] rounded-xl border border-[#ded9cd] dark:border-[#383838] flex items-center justify-between text-xs text-[#78746c] dark:text-[#8e8c87]">
                <span>Teléfono: <strong className="text-[#1c1b18] dark:text-[#f4f2ee]">{selectedReservation.guestPhone}</strong></span>
                <span>PIN Cerradura: <strong className="font-mono text-[#c46d45] dark:text-[#d88d5e]">{selectedReservation.pinCode}</strong></span>
              </div>
            )}
          </div>

          {/* Template Selector */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider mb-3">
              2. Elige el Disparador o Plantilla
            </label>
            <div className="space-y-2.5">
              {demoState.templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-[#f4eee7] dark:bg-[#2a241e] border-[#c46d45] dark:border-[#d88d5e] shadow-xs'
                      : 'bg-white dark:bg-[#222] border-[#ded9cd] dark:border-[#333] hover:border-[#c46d45]/50 dark:hover:border-[#555]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{tpl.title}</span>
                    <span className="text-[10px] bg-[#f4eee7] dark:bg-[#2a241e] text-[#9c512a] dark:text-[#d88d5e] px-2 py-0.5 rounded-full font-bold border border-[#e4d6c9] dark:border-[#523d2e]">
                      {tpl.triggerEvent}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78746c] dark:text-[#8e8c87] line-clamp-2">{tpl.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: WhatsApp Phone Mockup (6 cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-[36px] bg-[#1c1b18] dark:bg-[#141414] p-3 shadow-2xl border-4 border-[#ded9cd] dark:border-[#2a2a2a] relative">
            {/* Phone notch */}
            <div className="w-32 h-4 bg-[#2c2a26] dark:bg-[#242424] rounded-b-xl mx-auto mb-2" />

            {/* Screen */}
            <div className="bg-[#EFEAE2] rounded-[28px] overflow-hidden flex flex-col h-[520px] shadow-inner text-zinc-900">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-300 overflow-hidden">
                    <img
                      src={selectedReservation?.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold leading-none">{selectedReservation?.guestName}</h5>
                    <span className="text-[10px] text-emerald-200">En línea</span>
                  </div>
                </div>
                <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-[10px]">
                  Loomi Suite Bot
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-3">
                <div className="text-center">
                  <span className="text-[10px] bg-white/80 text-zinc-500 px-2 py-0.5 rounded shadow-xs">
                    Hoy
                  </span>
                </div>

                {/* Sent Bubble */}
                <div className="self-end bg-[#DCF8C6] rounded-xl rounded-tr-none p-3 max-w-[85%] shadow-xs text-xs text-zinc-800 leading-relaxed relative">
                  <div className="whitespace-pre-line text-[12px]">
                    {getInterpolatedMessage()}
                  </div>
                  <div className="text-right mt-1 flex items-center justify-end gap-1 text-[10px] text-zinc-400">
                    <span>10:14 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Bottom Actions inside mockup */}
              <div className="p-2 bg-white/95 border-t border-zinc-200 flex items-center justify-between gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={handleSendSimulate}
                  className="flex-1 text-xs font-bold py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{simulatedSent ? '¡Mensaje Enviado!' : 'Simular Envío'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
