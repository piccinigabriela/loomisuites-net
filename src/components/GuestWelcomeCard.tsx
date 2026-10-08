import React, { useState } from 'react';
import {
  Sparkles,
  Key,
  Wifi,
  MapPin,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Clock
} from 'lucide-react';

export interface GuestWelcomeCardProps {
  guestName?: string;
  propertyName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  accessCode?: string;
  wifiNetwork?: string;
  wifiPassword?: string;
  address?: string;
  guideUrl?: string;
  hostPhone?: string; // Número de WhatsApp con prefijo internacional, ej: "5491140506070"
}

export const GuestWelcomeCard: React.FC<GuestWelcomeCardProps> = ({
  guestName = "Camila",
  propertyName = "Departamento B",
  checkInDate = "15 de Octubre",
  checkOutDate = "19 de Octubre",
  checkInTime = "14:00 hs",
  accessCode = "4820",
  wifiNetwork = "CatalinasAptos_Fibra_B",
  wifiPassword = "TresSargentos435",
  address = "Tres Sargentos 435, Retiro / Catalinas Norte, CABA",
  guideUrl = "https://loomisuite.net/guia/cat-b",
  hostPhone = "5491140506070"
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Ya recibí la tarjeta de bienvenida para ${propertyName}. Muchas gracias.`
  );

  return (
    <div className="w-full max-w-md mx-auto my-6 font-['Inter',sans-serif] font-light text-stone-800">
      {/* Marco exterior aireado estilo Wabi-Sabi / Omotenashi */}
      <div className="bg-[#FAF8F5] p-2 sm:p-2.5 rounded-[32px] border border-stone-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <div className="bg-white rounded-[26px] p-6 sm:p-7 border border-stone-100 space-y-6">
          
          {/* Cabecera sutil con píldora de hospitalidad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-normal tracking-wide text-[#C55A1B] bg-[#FDF3E7] border border-orange-200/40">
                <Sparkles className="w-3 h-3 text-[#E67E22]" />
                Loomi Suite • Hospitalidad
              </span>
              <span className="text-[10px] text-stone-400 font-light flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-300" />
                Ingreso {checkInTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-light tracking-tight text-stone-900 pt-1">
              Bienvenida, <span className="font-normal text-stone-950">{guestName}</span>
            </h2>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              Tu estadía en <span className="text-stone-800 font-normal">{propertyName}</span> está lista para que ingreses de manera autónoma y descanses desde el primer minuto.
            </p>
          </div>

          {/* Bloque de Fechas de la Estancia */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#FCFAF8] rounded-2xl border border-orange-100/50 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">
                Check-In
              </span>
              <div className="flex items-center gap-1.5 text-stone-800 font-normal">
                <Calendar className="w-3.5 h-3.5 text-[#C55A1B]" />
                <span>{checkInDate}</span>
              </div>
            </div>
            <div className="space-y-0.5 border-l border-stone-200/60 pl-3">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">
                Check-Out
              </span>
              <div className="flex items-center gap-1.5 text-stone-800 font-normal">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{checkOutDate}</span>
              </div>
            </div>
          </div>

          {/* Tarjetas de Acceso Esenciales (Cerradura + Wi-Fi) */}
          <div className="space-y-2.5">
            {/* Código de Cerradura Digital */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCFAF8] border border-stone-100 hover:border-orange-200/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-stone-100 text-[#C55A1B] shrink-0 shadow-2xs">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                    Cerradura digital
                  </span>
                  <span className="text-sm font-mono font-normal tracking-wider text-stone-900">
                    {accessCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(accessCode, 'code')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-light bg-white hover:bg-[#FDF3E7] text-stone-600 hover:text-[#C55A1B] border border-stone-200/70 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Copiar código"
              >
                {copiedKey === 'code' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-normal">Listo</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-400" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Red y Clave Wi-Fi */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCFAF8] border border-stone-100 hover:border-orange-200/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-stone-100 text-[#C55A1B] shrink-0 shadow-2xs">
                  <Wifi className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                    Red Wi-Fi
                  </span>
                  <span className="text-xs text-stone-700 truncate block font-normal" title={wifiNetwork}>
                    {wifiNetwork}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(wifiPassword, 'wifi')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-light bg-white hover:bg-[#FDF3E7] text-stone-600 hover:text-[#C55A1B] border border-stone-200/70 transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                title="Copiar contraseña Wi-Fi"
              >
                {copiedKey === 'wifi' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-normal">Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-400" />
                    <span>Clave</span>
                  </>
                )}
              </button>
            </div>

            {/* Dirección / Mapa */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFAF8] border border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-stone-100 text-[#C55A1B] shrink-0 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                  Ubicación exacta
                </span>
                <span className="text-stone-700 font-normal leading-relaxed block">
                  {address}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones de Contacto y Guía Digital */}
          <div className="space-y-2 pt-1">
            {/* Botón principal: Guía Digital de Bienvenida */}
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-normal text-white bg-stone-900 hover:bg-stone-800 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <span>Abrir Guía Digital del Huésped</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
            </a>

            {/* Botón secundario: Abrir canal de WhatsApp con el anfitrión */}
            {hostPhone && (
              <a
                href={`https://wa.me/${hostPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-light text-stone-700 bg-[#FCFAF8] hover:bg-[#FDF3E7] border border-stone-200/60 hover:border-orange-200 text-center transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C55A1B]" />
                <span>Escribir al Anfitrión por WhatsApp</span>
              </a>
            )}
          </div>

          {/* Pie de cortesía */}
          <p className="text-[10px] text-center text-stone-400 font-light tracking-wide pt-1">
            Loomi Suite • Que disfrutes un descanso sereno
          </p>

        </div>
      </div>
    </div>
  );
};

export default GuestWelcomeCard;
