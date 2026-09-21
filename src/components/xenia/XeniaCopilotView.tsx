import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Copy,
  Check,
  DollarSign,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Zap,
  Tag,
  Camera,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DemoState } from '../../types';
import { getClientXeniaReply } from './xeniaLocalEngine';
import {
  XeniaAvatar,
  XENIA_PORTRAIT_PRESETS,
  getStoredXeniaAvatar,
  setStoredXeniaAvatar,
} from './XeniaAvatar';

interface XeniaCopilotViewProps {
  demoState: DemoState;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const XeniaCopilotView: React.FC<XeniaCopilotViewProps> = ({ demoState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### 👋 ¡Hola! Soy **Xenia**, tu Copiloto Inteligente de Hospitalidad

Estoy conectada a tus **${demoState.properties.length} departamentos y cabañas** y al motor de Loomi Suite. Mi función es darte respuestas inmediatas y precisas con dos capacidades centrales:

1. **📊 Rendición de Cuentas Financieras & Huéspedes:**
   - Consulta facturación total, comisiones de OTAs (Booking / Airbnb), ingresos netos y comisiones ahorradas por reservas directas.
   - Entérate de quién llega hoy, quién sale y qué saldos o señas restan cobrar en mostrador.

2. **📘 Instrucciones de Uso de Loomi Suite:**
   - Aprende a usar cada módulo del sistema al instante. Pregúntame paso a paso cómo sincronizar calendarios iCal, cómo cargar reservas telefónicas, cómo coordinar a la mucama o cómo compartir tu link de reservas directas.

*Elige una de las preguntas sugeridas aquí al costado o escribe lo que necesites:*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/xenia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            propertiesCount: demoState.properties.length,
            reservationsCount: demoState.reservations.length,
            cleaningTasksCount: demoState.cleaningTasks.length,
            reservations: demoState.reservations,
            properties: demoState.properties,
            cleaningTasks: demoState.cleaningTasks,
            addons: demoState.addons,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Fallback to client engine');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || getClientXeniaReply(text, demoState),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'xenia_engine',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Usando motor local de Xenia:', err);
      const localReply = getClientXeniaReply(text, demoState);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: localReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'xenia_instant_engine',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Predefined prompts organized by intent
  const quickPrompts = [
    {
      category: 'Ocupación & Reservas en Vivo',
      icon: TrendingUp,
      prompts: [
        '¿Cuál es la ocupación actual del complejo y cuántas cabañas están ocupadas?',
        '¿Quiénes son los pasajeros alojados hoy y qué reservas tenemos registradas?',
        '¿Qué huéspedes tienen Early Check-in o Late Check-out confirmados?',
        '¿Cuáles reservas son directas con descuento y cuáles vienen de Airbnb al 3% o 15%?',
      ],
    },
    {
      category: 'Planes, Precios & Servicios',
      icon: Tag,
      prompts: [
        '¿Cuánto cuesta Loomi y cómo se abona la suscripción?',
        '¿Qué incluye el abono mensual y cómo funciona con llaves tradicionales?',
        '¿Qué son los módulos opcionales de frigobar y cerraduras?',
        '¿Tengo que poner tarjeta de crédito para empezar?',
      ],
    },
    {
      category: 'Rendición de Cuentas',
      icon: DollarSign,
      prompts: [
        '¿Cuánto dinero ingresó este mes y qué señas hay pendientes?',
        'Detalle de facturación por canal (Booking vs Airbnb vs Directo)',
        '¿Cuáles son los saldos a cobrar en recepción hoy al check-in?',
        '¿Cuánto dinero ahorré en comisiones gracias a reservas directas?',
      ],
    },
    {
      category: 'Instrucciones de Uso (Manual)',
      icon: BookOpen,
      prompts: [
        '¿Cómo sincronizo Booking y Airbnb sin dobles reservas?',
        '¿Cómo le paso las tareas a la mucama por WhatsApp sin instalar apps?',
        '¿Cómo compartir mi link de reservas directas para cobrar seña?',
        '¿Cómo cargo una reserva telefónica que me pidieron recién?',
      ],
    },
    {
      category: 'Plantillas para Huéspedes',
      icon: MessageSquare,
      prompts: [
        'Redactar mensaje de bienvenida con WiFi y ubicación para Cabaña 1',
        'Plantilla para pedir la seña del 50% por transferencia bancaria',
        'Respuesta rápida sobre política de leña, parrilla y check-in tardío',
      ],
    },
  ];

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>(() => getStoredXeniaAvatar());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (url: string) => {
    setSelectedPreset(url);
    setStoredXeniaAvatar(url);
  };

  const handleApplyCustomUrl = () => {
    if (customPhotoInput.trim()) {
      setSelectedPreset(customPhotoInput.trim());
      setStoredXeniaAvatar(customPhotoInput.trim());
      setCustomPhotoInput('');
      setShowPhotoModal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setSelectedPreset(dataUrl);
          setStoredXeniaAvatar(dataUrl);
          setShowPhotoModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate high-level stats for top pill bar
  const totalGross = demoState.reservations.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalNights = demoState.reservations.reduce((acc, r) => acc + r.nights, 0);
  const averageDailyRate = totalNights > 0 ? Math.round(totalGross / totalNights) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner introducing Xenia */}
      <div className="bg-[#1c1a18] rounded-2xl p-6 text-[#f0eeeb] border border-[#383028] shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)} title="Cambiar foto de Xenia">
              <XeniaAvatar size="lg" />
              <button
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                aria-label="Cambiar foto de Xenia"
              >
                <Camera className="w-4 h-4 text-[#d88d5e]" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-[#f4f2ee]">Xenia</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#263024] text-[#a5c49f] border border-[#364832]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82ba8f] animate-pulse" />
                  Copiloto de Hospitalidad
                </span>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex items-center gap-1 text-[11px] text-[#d88d5e] hover:text-[#f4f2ee] bg-[#2a221b] hover:bg-[#382b20] border border-[#48372b] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>Personalizar Foto</span>
                </button>
              </div>
              <p className="text-xs text-[#a8a5a0] mt-0.5">
                Rendición de cuentas, control de huéspedes y guía de Loomi Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-[#141414] px-3.5 py-2 rounded-xl border border-[#2c2825]">
              <span className="text-[#8e8c87] block text-[10px]">Facturación en Demo</span>
              <span className="font-bold text-[#f4f2ee] text-sm">${totalGross.toLocaleString()} USD</span>
            </div>
            <div className="bg-[#241f1c] px-3.5 py-2 rounded-xl border border-[#48372b]">
              <span className="text-[#d88d5e] block text-[10px]">Tarifa Promedio Noche</span>
              <span className="font-bold text-[#f0eeeb] text-sm">
                ${averageDailyRate} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog to change Xenia's Photo */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-[#383838] rounded-2xl max-w-md w-full p-6 text-[#f4f2ee] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#d88d5e]" />
                <h3 className="font-bold text-base">Foto de Perfil de Xenia</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-[#8e8c87] hover:text-[#f4f2ee] p-1 rounded-lg hover:bg-[#282828] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#141414] p-3.5 rounded-xl border border-[#2a2a2a]">
              <XeniaAvatar size="xl" />
              <div>
                <span className="text-xs font-bold text-[#f4f2ee] block">Vista Previa en Vivo</span>
                <span className="text-[11px] text-[#8e8c87]">
                  Esta imagen se reflejará en el chat, en la barra lateral y en el asistente flotante.
                </span>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#c8c5c0] block">
                Selecciona uno de los retratos sugeridos:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {XENIA_PORTRAIT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#2b221b] border-[#d88d5e] text-[#f4f2ee] ring-1 ring-[#d88d5e]'
                          : 'bg-[#161616] border-[#2c2c2c] text-[#a8a5a0] hover:border-[#444]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                      <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload own photo or URL */}
            <div className="pt-3 border-t border-[#2e2e2e] space-y-3">
              <span className="text-xs font-bold text-[#c8c5c0] block">
                O sube tu propia foto / ingresa un enlace:
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-[#f4f2ee] focus:outline-none focus:border-[#d88d5e]"
                />
                <button
                  onClick={handleApplyCustomUrl}
                  disabled={!customPhotoInput.trim()}
                  className="bg-[#c46d45] hover:bg-[#d67b51] disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  Aplicar URL
                </button>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] text-xs font-bold text-[#f4f2ee] py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#d88d5e]" />
                  <span>Subir foto desde tu dispositivo</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="bg-[#c46d45] hover:bg-[#d67b51] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Listo / Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Prompts + Chat View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Action Chips */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#f0eeeb] flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#d88d5e]" />
              <span>Consultas Frecuentes</span>
            </h3>
            <p className="text-xs text-[#8e8c87] mb-4">
              Toca cualquier pregunta para que Xenia te responda en el acto:
            </p>

            <div className="space-y-4">
              {quickPrompts.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <span className="text-[11px] font-bold text-[#7a7874] uppercase tracking-wider flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#a8a5a0]" />
                      {cat.category}
                    </span>
                    <div className="space-y-1.5">
                      {cat.prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={isLoading}
                          className="w-full text-left text-xs p-2.5 rounded-xl border border-[#2c2c2c] bg-[#171717] hover:border-[#523d2e] hover:bg-[#221c17] text-[#c8c5c0] hover:text-[#f0eeeb] transition-all cursor-pointer leading-snug"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#181818] rounded-2xl border border-[#282828] p-4 text-xs text-[#a8a5a0]">
            <h4 className="font-bold text-[#f0eeeb] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#82ba8f]" />
              <span>Autonomía y Claridad Total</span>
            </h4>
            <p className="leading-relaxed text-[#8e8c87]">
              En lugar de buscar en planillas o consultar manuales externos, Xenia te entrega números consolidados en tiempo real y te guía paso a paso en el uso de cada función de Loomi Suite.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Conversation */}
        <div className="lg:col-span-2 bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] shadow-xs flex flex-col h-[640px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#282828] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <XeniaAvatar size="xs" />
              <span className="text-xs font-bold text-[#f0eeeb]">
                Conversación con Xenia
              </span>
              <span className="text-[10px] text-[#7a7874]">• Motor Operativo & Gemini</span>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'assistant',
                    content: 'Conversación reiniciada. ¿En qué te ayudo hoy con tus departamentos o el uso de Loomi Suite?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="text-[11px] text-[#8e8c87] hover:text-[#d88d5e] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar chat</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <XeniaAvatar size="sm" showStatus={false} />
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#3d2e24] border border-[#5a4234] text-[#f4f2ee] shadow-xs rounded-tr-xs'
                      : 'bg-[#161616] border border-[#2a2a2a] text-[#dedbd6] shadow-xs rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/5 text-[10px] text-[#8e8c87]">
                    <span className="font-semibold text-[#c8c5c0]">
                      {msg.role === 'user' ? 'Tú (Anfitrión)' : 'Xenia'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-[#d88d5e] transition-colors p-0.5"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-[#82ba8f]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-[#dedbd6] prose-headings:text-[#f4f2ee] prose-strong:text-[#f4f2ee] prose-a:text-[#d88d5e]">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#2a2622] border border-[#48372b] flex items-center justify-center text-[#d88d5e] text-xs font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#8e8c87] animate-pulse">
                <XeniaAvatar size="sm" />
                <span>Xenia está analizando tus reservas y preparando la respuesta...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-[#282828] bg-[#181818] rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregúntale a Xenia sobre ocupación, comisiones o uso del sistema..."
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm bg-[#141414] border border-[#2e2e2e] focus:border-[#d88d5e] rounded-xl px-4 py-2.5 text-[#f4f2ee] placeholder-[#777] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#c46d45] hover:bg-[#d67b51] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
