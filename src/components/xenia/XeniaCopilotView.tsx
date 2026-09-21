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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Radio,
  Sliders,
  Play,
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
import { useXeniaVoice } from '../../hooks/useXeniaVoice';
import { isFemaleVoice, isSpainVoice } from '../../utils/xeniaVoice';

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

Estoy conectada a tus **${demoState.properties.length} departamentos y cabañas** y al motor de Loomi Suite. Podés escribirme o **hablarme directamente por voz con el micrófono** 🎙️ y te responderé en español argentino:

1. **📊 Rendición de Cuentas Financieras & Huéspedes:**
   - Consulta facturación total, comisiones de OTAs (Booking / Airbnb), ingresos netos y comisiones ahorradas por reservas directas.
   - Entérate de quién llega hoy, quién sale y qué saldos o señas restan cobrar en mostrador.

2. **📘 Instrucciones de Uso de Loomi Suite:**
   - Aprende a usar cada módulo del sistema al instante. Pregúntame paso a paso cómo sincronizar calendarios iCal, cómo cargar reservas telefónicas, cómo coordinar a la mucama o cómo compartir tu link de reservas directas.

*Tocá el micrófono para hablar, elegí una pregunta sugerida o escribí lo que necesites:*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voice Hook
  const {
    isListening,
    isSpeaking,
    speakingMessageId,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speakMessage,
    stopSpeaking,
    autoVoice,
    toggleAutoVoice,
    isRecognitionSupported,
    detectedVoiceName,
    availableVoices,
    selectedVoiceURI,
    selectVoice,
  } = useXeniaVoice();

  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Sync transcript from speech recognition into input field
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (isListening) {
      stopListening();
    }
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setTranscript('');
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
      const replyContent = data.reply || getClientXeniaReply(text, demoState);
      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'xenia_engine',
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If auto-voice is enabled, speak out the reply in Argentine female voice
      if (autoVoice) {
        setTimeout(() => {
          speakMessage(replyContent, assistantMsgId);
        }, 150);
      }
    } catch (err: any) {
      console.warn('Usando motor local de Xenia:', err);
      const localReply = getClientXeniaReply(text, demoState);
      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: localReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'xenia_instant_engine',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (autoVoice) {
        setTimeout(() => {
          speakMessage(localReply, assistantMsgId);
        }, 150);
      }
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

      {/* Modal / Dialog to choose and test Latin American Voice */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-[#383838] rounded-2xl max-w-lg w-full p-6 text-[#f4f2ee] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#d88d5e]" />
                <h3 className="font-bold text-base">Voz de Xenia (Español Latinoamericano)</h3>
              </div>
              <button
                onClick={() => {
                  stopSpeaking();
                  setShowVoiceModal(false);
                }}
                className="text-[#8e8c87] hover:text-[#f4f2ee] p-1 rounded-lg hover:bg-[#282828] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-[#2a2a2a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f4f2ee] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#d88d5e]" />
                  <span>Voz Actual Detectada</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#251f1a] text-[#d88d5e] border border-[#48372b]">
                  {detectedVoiceName || 'Voz estándar Latinoamericana (es-419)'}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8c87] leading-relaxed">
                Priorizamos automáticamente las voces de mujer en <strong>Español Latinoamericano (México, Colombia, Chile, Argentina, etc.)</strong> y bloqueamos el español peninsular de España.
              </p>
              <div className="pt-1">
                <button
                  onClick={() =>
                    speakMessage(
                      '¡Hola! Soy Xenia, tu copiloto en Loomi Suite. Estoy lista para responder consultas sobre tus alojamientos, reservas y números del mes con acento latino.'
                    )
                  }
                  className="flex items-center gap-1.5 bg-[#25201b] hover:bg-[#342921] border border-[#523d2e] text-[#d88d5e] hover:text-[#f4f2ee] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Probar cómo suena esta voz</span>
                </button>
              </div>
            </div>

            {/* List of Available Latin Spanish Voices in the browser */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#c8c5c0] block">
                Voces en Español disponibles en tu navegador:
              </span>

              {availableVoices.length === 0 ? (
                <div className="bg-[#141414] p-3.5 rounded-xl border border-[#2a2a2a] text-center text-xs text-[#8e8c87]">
                  No se detectaron voces adicionales instaladas en el sistema operativo. El navegador usará la síntesis fonética en Español Latino (es-419).
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {availableVoices.map((v) => {
                    const uri = v.voiceURI || v.name;
                    const isSelected = selectedVoiceURI === uri || detectedVoiceName.includes(v.name);
                    const isFemale = isFemaleVoice(v);
                    const isSpain = isSpainVoice(v);

                    return (
                      <div
                        key={uri}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#2b221b] border-[#d88d5e] text-[#f4f2ee]'
                            : 'bg-[#151515] border-[#292929] text-[#a8a5a0] hover:border-[#444]'
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => selectVoice(uri)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{v.name}</span>
                            {isFemale && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#322319] text-[#d88d5e] font-semibold">
                                Mujer
                              </span>
                            )}
                            {isSpain ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#332222] text-[#e07777]">
                                España
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1e2e1e] text-[#86bf8a]">
                                Latino
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#777] block mt-0.5">
                            Idioma: {v.lang} {v.localService ? '• Voz Local' : '• Voz Cloud'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => {
                              selectVoice(uri);
                              setTimeout(() => {
                                speakMessage(
                                  `Hola, esta es una prueba con la voz ${v.name}.`
                                );
                              }, 100);
                            }}
                            className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-[#d88d5e] hover:text-white transition-colors cursor-pointer"
                            title="Probar esta voz"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#d88d5e]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#2a2a2a]">
              <span className="text-[11px] text-[#777]">
                Se guardará tu preferencia para futuras consultas
              </span>
              <button
                onClick={() => {
                  stopSpeaking();
                  setShowVoiceModal(false);
                }}
                className="bg-[#c46d45] hover:bg-[#d67b51] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Aceptar / Guardar
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
          <div className="p-4 border-b border-[#282828] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <XeniaAvatar size="xs" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#f0eeeb]">
                    Conversación con Xenia
                  </span>
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#202020] hover:bg-[#2c2621] text-[#d88d5e] border border-[#383028] hover:border-[#6e503b] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Configurar y probar voz en Español Latinoamericano"
                  >
                    <span>🌎 Voz Latina</span>
                    <Sliders className="w-2.5 h-2.5 opacity-70" />
                  </button>
                </div>
                <span className="text-[10px] text-[#7a7874] block">Consultas por voz y texto en tiempo real</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice auto-play toggle */}
              <button
                onClick={toggleAutoVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  autoVoice
                    ? 'bg-[#2b221b] border-[#d88d5e] text-[#f4f2ee]'
                    : 'bg-[#141414] border-[#2c2c2c] text-[#8e8c87] hover:text-[#c8c5c0]'
                }`}
                title={
                  autoVoice
                    ? 'Voz automática activada (Español Latinoamericano de mujer)'
                    : 'Activar respuestas automáticas por voz'
                }
              >
                {autoVoice ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#d88d5e]" />
                    <span>Audio Automático (ON)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Audio (OFF)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowVoiceModal(true)}
                className="text-[11px] text-[#8e8c87] hover:text-[#d88d5e] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#202020] cursor-pointer transition-colors border border-transparent hover:border-[#2e2e2e]"
                title="Elegir voz en español latino"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden sm:inline">Voz</span>
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      role: 'assistant',
                      content: '¡Listo! Conversación reiniciada. ¿En qué te ayudo hoy con tus alojamientos o el uso de Loomi Suite?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="text-[11px] text-[#8e8c87] hover:text-[#d88d5e] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#202020] cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
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
                      {msg.role === 'user' ? 'Tú (Anfitrión)' : 'Xenia (Copiloto)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>

                      {msg.role === 'assistant' && (
                        <>
                          {/* Speak Button for this individual message */}
                          <button
                            onClick={() => speakMessage(msg.content, msg.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                              isSpeaking && speakingMessageId === msg.id
                                ? 'bg-[#d88d5e] text-[#1c1a18] font-bold shadow-xs'
                                : 'hover:text-[#d88d5e] text-[#8e8c87] hover:bg-[#242424]'
                            }`}
                            title={
                              isSpeaking && speakingMessageId === msg.id
                                ? 'Detener voz de Xenia'
                                : 'Escuchar respuesta con voz de mujer en español latino'
                            }
                          >
                            {isSpeaking && speakingMessageId === msg.id ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current" />
                                <span className="flex items-center gap-0.5">
                                  <span>Hablando</span>
                                  <span className="inline-block w-1 h-2 bg-[#1c1a18] animate-bounce" />
                                  <span className="inline-block w-1 h-3 bg-[#1c1a18] animate-bounce delay-75" />
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Escuchar voz</span>
                              </>
                            )}
                          </button>

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
                        </>
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

            {/* Live speech listening indicator */}
            {isListening && (
              <div className="flex items-center gap-3 p-3.5 bg-[#2b221b] border border-[#d88d5e]/60 rounded-2xl text-xs text-[#f4f2ee] animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-[#d88d5e] flex items-center justify-center text-[#1c1a18] animate-pulse">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-[#d88d5e]">
                    <span>🎙️ Xenia está escuchando tu voz (Español Argentino)...</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-3 bg-[#d88d5e] animate-pulse" />
                      <span className="w-1 h-4 bg-[#d88d5e] animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-[#d88d5e] animate-pulse delay-150" />
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c8c5c0] mt-0.5">
                    {transcript || 'Hablá con normalidad... (ej: "¿Cuántas reservas hay hoy?" o "¿Cómo sincronizo con Airbnb?")'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    if (transcript.trim()) {
                      handleSendMessage(transcript);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#d88d5e] text-[#1c1a18] font-bold rounded-xl text-xs hover:bg-[#e49c6f] cursor-pointer"
                >
                  {transcript.trim() ? 'Enviar consulta' : 'Detener'}
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#8e8c87] animate-pulse">
                <XeniaAvatar size="sm" />
                <span>Xenia está analizando tus reservas y preparando la respuesta...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-[#282828] bg-[#181818] rounded-b-2xl space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Voice Input Button */}
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                    if (transcript.trim()) {
                      handleSendMessage(transcript);
                    }
                  } else {
                    startListening();
                  }
                }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                    : 'bg-[#26221e] hover:bg-[#342c25] border border-[#48372b] text-[#d88d5e] hover:text-[#f4f2ee]'
                }`}
                title={
                  isListening
                    ? 'Detener micrófono y enviar'
                    : 'Hablar con Xenia por voz (Español Argentino)'
                }
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="text-xs font-bold hidden sm:inline">Escuchando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-bold hidden sm:inline">Hablar</span>
                  </>
                )}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? 'Escuchando tu voz...'
                    : 'Escribí o tocá "Hablar" para consultar por voz a Xenia...'
                }
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm bg-[#141414] border border-[#2e2e2e] focus:border-[#d88d5e] rounded-xl px-4 py-2.5 text-[#f4f2ee] placeholder-[#777] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#c46d45] hover:bg-[#d67b51] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                title="Enviar mensaje"
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
