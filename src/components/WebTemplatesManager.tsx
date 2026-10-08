import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Eye,
  Clock,
  Info
} from 'lucide-react';

export interface MessageTemplateItem {
  id: string;
  title: string;
  triggerEvent: string;
  category: 'checkin' | 'ruta' | 'acceso' | 'checkout';
  content: string;
  channel: 'whatsapp' | 'email';
}

const DEFAULT_TEMPLATES: MessageTemplateItem[] = [
  {
    id: 'tpl-1',
    title: 'Confirmación & Bienvenida Anticipada',
    triggerEvent: 'Al confirmarse la reserva',
    category: 'checkin',
    channel: 'whatsapp',
    content: `¡Hola, {{nombre_huésped}}! 🌲 Te confirmamos que tu reserva para la unidad {{unidad_alojamiento}} está registrada con éxito desde el {{fecha_checkin}} hasta el {{fecha_checkout}}.
Para que tu llegada sea perfecta y sin demoras, te compartimos tu Guía Digital de Bienvenida exclusiva. Desde allí vas a poder ver el mapa interactivo con la ruta de acceso, las claves de Wi-Fi y completar tu registro de pasajeros digital:
🔗 {{link_guia_digital}}
¡Estamos felices de recibirte! Cualquier duda, estamos a un toque de distancia por acá.`
  },
  {
    id: 'tpl-2',
    title: 'Coordinación en Ruta / Día de Viaje',
    triggerEvent: 'La mañana del Check-In',
    category: 'ruta',
    channel: 'whatsapp',
    content: `¡Buen día, {{nombre_huésped}}! Esperamos que tengan un muy lindo viaje en ruta hacia el complejo. 🚗
Te recordamos que el ingreso a {{unidad_alojamiento}} está habilitado a partir de las 14:00 hs. Si necesitás repasar las indicaciones exactas de cómo llegar o querés activar el GPS desde el mapa, podés hacerlo directamente desde tu enlace de bienvenida:
🔗 {{link_guia_digital}}
Avisanos cuando estén cerca de la zona para esperarlos con todo listo. ¡Buen viaje!`
  },
  {
    id: 'tpl-3',
    title: 'Instrucciones de Auto Check-In / Acceso Libre',
    triggerEvent: 'Al momento del arribo',
    category: 'acceso',
    channel: 'whatsapp',
    content: `¡Bienvenidos, {{nombre_huésped}}! Ya pueden ingresar y empezar a disfrutar de su estadía en {{unidad_alojamiento}}. 🔑
Para tu comodidad, el acceso es inteligente y autónomo. El código de tu cerradura digital o caja de llaves para abrir la puerta principal es: {{codigo_acceso}}.
En la mesa van a encontrar el instructivo rápido, pero recordá que tenés las claves de Wi-Fi y los horarios de servicios siempre a mano en tu celular a través de tu guía:
🔗 {{link_guia_digital}}
¡Que disfruten mucho el descanso!`
  }
];

const AVAILABLE_VARIABLES = [
  { label: 'Nombre Huésped', tag: '{{nombre_huésped}}' },
  { label: 'Unidad / Cabaña', tag: '{{unidad_alojamiento}}' },
  { label: 'Fecha Check-In', tag: '{{fecha_checkin}}' },
  { label: 'Fecha Check-Out', tag: '{{fecha_checkout}}' },
  { label: 'Código Acceso', tag: '{{codigo_acceso}}' },
  { label: 'Link Guía Digital', tag: '{{link_guia_digital}}' },
];

export interface WebTemplatesManagerProps {
  initialTemplates?: MessageTemplateItem[];
  onSelectTemplate?: (template: MessageTemplateItem) => void;
}

export const WebTemplatesManager: React.FC<WebTemplatesManagerProps> = ({
  initialTemplates = DEFAULT_TEMPLATES,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<MessageTemplateItem[]>(initialTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(initialTemplates[0]?.id || 'tpl-1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleSelect = (tpl: MessageTemplateItem) => {
    setActiveTemplateId(tpl.id);
    if (onSelectTemplate) {
      onSelectTemplate(tpl);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateContent = (newContent: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTemplateId ? { ...t, content: newContent } : t))
    );
  };

  const insertVariable = (tag: string) => {
    handleUpdateContent((activeTemplate?.content || '') + ' ' + tag);
  };

  const renderStyledContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 font-['Inter',sans-serif] font-light text-stone-700 leading-relaxed text-xs">
        {lines.map((line, lIdx) => {
          const parts = line.split(/(\{\{[^}]+\}\}|https?:\/\/[^\s]+)/g);
          return (
            <p key={lIdx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                  return (
                    <span
                      key={pIdx}
                      className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-mono font-normal text-[#C55A1B] bg-[#FDF3E7] border border-orange-200/50"
                    >
                      {part}
                    </span>
                  );
                }
                if (part.startsWith('http://') || part.startsWith('https://')) {
                  return (
                    <span
                      key={pIdx}
                      className="font-normal text-[#C55A1B] underline decoration-orange-300 underline-offset-2 break-all"
                    >
                      {part}
                    </span>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif] font-light text-stone-800 space-y-6">
      {/* Encabezado Zen y Aireado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>
            <span className="text-[10px] font-medium tracking-widest text-stone-400 uppercase">
              Centro de Comunicación • Omotenashi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-stone-900">
            Plantillas Web de Mensajería
          </h2>
          <p className="text-xs text-stone-400 font-light">
            Textos maestros preconfigurados con variables dinámicas y links destacados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3.5 py-2 rounded-xl text-xs font-light border border-stone-200 hover:border-orange-200 bg-white hover:bg-[#FDFBF9] text-stone-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#C55A1B]" />
            <span>{previewMode ? 'Modo Edición' : 'Vista Previa'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Selector de Plantillas (4 columnas) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[11px] font-medium tracking-wider uppercase text-stone-400 block px-1">
            Plantillas Disponibles ({templates.length})
          </span>

          <div className="space-y-2.5">
            {templates.map((tpl, idx) => {
              const isSelected = tpl.id === activeTemplateId;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FDFBF9] border-orange-200 shadow-[0_4px_16px_rgba(230,126,34,0.04)] ring-1 ring-orange-200/50'
                      : 'bg-white border-stone-100 hover:border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-50 text-stone-500 border border-stone-100">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-light text-[#C55A1B] bg-[#FDF3E7] px-2 py-0.5 rounded-full">
                      {tpl.channel.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xs font-normal text-stone-800 line-clamp-1 mb-1">
                    {tpl.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-light">
                    <Clock className="w-3 h-3" />
                    <span>Disparo: {tpl.triggerEvent}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50/60 border border-stone-100 text-[11px] text-stone-500 font-light space-y-1.5">
            <div className="flex items-center gap-1.5 text-stone-600 font-normal">
              <Info className="w-3.5 h-3.5 text-[#C55A1B]" />
              <span>Variables automáticas</span>
            </div>
            <p className="leading-relaxed">
              Las etiquetas entre llaves son reemplazadas automáticamente en el momento del envío con los datos del huésped.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Editor y Previsualización Aireada (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#C55A1B] bg-[#FDF3E7] px-2.5 py-1 rounded-md">
                Disparo: {activeTemplate.triggerEvent}
              </span>
              <h3 className="text-base font-normal text-stone-900 mt-2">
                {activeTemplate.title}
              </h3>
            </div>

            <button
              onClick={() => handleCopy(activeTemplate.id, activeTemplate.content)}
              className="px-3.5 py-2 rounded-xl text-xs font-light bg-stone-50 hover:bg-[#FDF3E7] text-stone-700 hover:text-[#C55A1B] border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedId === activeTemplate.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-normal">Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Copiar Plantilla</span>
                </>
              )}
            </button>
          </div>

          {/* Selector de Chips de Variables */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-light text-stone-400">
              Hacé clic para insertar una variable en el texto:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  onClick={() => insertVariable(v.tag)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-light bg-stone-50 hover:bg-[#FDF3E7] text-stone-600 hover:text-[#C55A1B] border border-stone-200/60 hover:border-orange-200 transition-all cursor-pointer font-mono"
                >
                  + {v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Área de Visualización / Edición */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFAF8] border border-orange-100/70 min-h-[220px]">
            {previewMode ? (
              <div className="space-y-2">
                <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400 block mb-2">
                  Vista Previa con Enlaces
                </span>
                {renderStyledContent(activeTemplate.content)}
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400 block mb-2">
                  Contenido editable
                </span>
                <textarea
                  value={activeTemplate.content}
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent border-0 resize-y focus:ring-0 text-xs text-stone-800 font-light font-['Inter',sans-serif] leading-relaxed p-0 focus:outline-none"
                  placeholder="Escribe el texto de la plantilla aquí..."
                />
              </div>
            )}
          </div>

          {/* Pie informativo */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-400 font-light">
            <span>Canal optimizado para WhatsApp Web y API directa</span>
            <span className="text-[#C55A1B] font-normal">Estilo Visual: Tipografía Inter 300 / Óxido Pastel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebTemplatesManager;
