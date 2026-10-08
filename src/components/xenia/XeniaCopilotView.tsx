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

import { getApiUrl } from '../../utils/apiConfig';

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
  } = useXeniaVoice((finalText) => {
    handleSendMessage(finalText);
  });

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
      const response = await fetch(getApiUrl('/api/xenia/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            properties: demoState.properties,
            reservations: demoState.reservations,
            cleaningTasks: demoState.cleaningTasks,
            addons: demoState.addons,
          },
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
        '¿Cómo enviar la bienvenida y guía digital con mapa GPS al huésped?',
        '¿Cómo pasar del Modo Light (Móvil) a la Vista Completa (PC)?',
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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Top Banner introducing Xenia */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 text-[#18181B] dark:text-[#EFECE5] border border-[#C8C4B7] dark:border-[#222328] shadow-2xs relative transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)} title="Cambiar foto de Xenia">
              <XeniaAvatar size="lg" />
              <button
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                aria-label="Cambiar foto de Xenia"
              >
                <Camera className="w-4 h-4 text-[#E1500A]" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black uppercase tracking-tight text-[#18181B] dark:text-white">Xenia Copilot</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black bg-[#E1500A]/15 text-[#E1500A] border border-[#E1500A]/30 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] animate-pulse" />
                  Copiloto Inteligente
                </span>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white bg-white dark:bg-[#18181B] hover:border-[#E1500A] border border-[#C8C4B7] dark:border-[#222328] px-2 py-0.5 rounded-none transition-colors cursor-pointer ml-1 uppercase"
                >
                  <Camera className="w-2.5 h-2.5" />
                  <span>Foto</span>
                </button>
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-bold">
                Rendición de cuentas, control de huéspedes y guía de Loomi Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-white dark:bg-[#18181B] px-3.5 py-2 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[#71717A] dark:text-[#8E8E93] block text-[9px] font-black uppercase tracking-wider">Facturación Muestra</span>
              <span className="font-black text-[#18181B] dark:text-white text-sm">USD ${totalGross.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-[#18181B] px-3.5 py-2 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[#E1500A] block text-[9px] font-black uppercase tracking-wider">Tarifa Promedio</span>
              <span className="font-black text-[#18181B] dark:text-white text-sm">
                USD ${averageDailyRate} / noche
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog to change Xenia's Photo */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] rounded-none max-w-md w-full p-6 text-[#18181B] dark:text-[#EFECE5] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#C8C4B7] dark:border-[#222328] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#E1500A]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Foto de Perfil de Xenia</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white p-1 rounded-none hover:bg-[#DCD8CE] dark:hover:bg-[#18181B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
              <XeniaAvatar size="xl" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">Vista Previa</span>
                <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93]">
                  Se actualizará instantáneamente en el chat, portada y barra lateral.
                </span>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93] block">
                Selecciona uno de los retratos sugeridos:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {XENIA_PORTRAIT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`flex items-center gap-2.5 p-2 rounded-none border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white'
                          : 'bg-white dark:bg-[#18181B] border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-[#EFECE5] hover:border-[#E1500A]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover shrink-0 border border-[#C8C4B7] dark:border-[#222328]"
                      />
                      <span className="text-[11px] font-bold leading-tight line-clamp-2">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload own photo or URL */}
            <div className="pt-3 border-t border-[#C8C4B7] dark:border-[#222328] space-y-3">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93] block">
                O sube tu propia foto / ingresa un enlace:
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="flex-1 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] rounded-none px-3 py-2 text-xs text-[#18181B] dark:text-white focus:outline-none focus:border-[#E1500A]"
                />
                <button
                  onClick={handleApplyCustomUrl}
                  disabled={!customPhotoInput.trim()}
                  className="bg-[#E1500A] hover:bg-[#C94305] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider px-3 py-2 rounded-none cursor-pointer transition-colors"
                >
                  Aplicar
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
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#222328] border border-[#C8C4B7] dark:border-[#222328] text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white py-2.5 rounded-none cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Subir foto desde tu dispositivo</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white font-black text-xs px-5 py-2.5 rounded-none cursor-pointer transition-colors uppercase tracking-wider"
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
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] rounded-none max-w-lg w-full p-6 text-[#18181B] dark:text-[#EFECE5] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#C8C4B7] dark:border-[#222328] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#E1500A]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Voz de Xenia (Español)</h3>
              </div>
              <button
                onClick={() => {
                  stopSpeaking();
                  setShowVoiceModal(false);
                }}
                className="text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white p-1 rounded-none hover:bg-[#DCD8CE] dark:hover:bg-[#18181B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white dark:bg-[#18181B] p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Voz Actual Detectada</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-white">
                  {detectedVoiceName || 'Voz estándar Latinoamericana (es-419)'}
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] leading-relaxed">
                Priorizamos automáticamente las voces de mujer en <strong>Español Latinoamericano (Argentina, México, etc.)</strong>.
              </p>
              <div className="pt-1">
                <button
                  onClick={() =>
                    speakMessage(
                      '¡Hola! Soy Xenia, tu copiloto en Loomi Suite. Estoy lista para responder consultas sobre tus alojamientos, reservas y números del mes con acento latino.'
                    )
                  }
                  className="flex items-center gap-1.5 bg-[#EAE8E3] dark:bg-[#0C0D0F] hover:border-[#E1500A] border border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-none transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-[#E1500A]" />
                  <span>Probar cómo suena esta voz</span>
                </button>
              </div>
            </div>

            {/* List of Available Latin Spanish Voices in the browser */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93] block">
                Voces disponibles en tu navegador:
              </span>

              {availableVoices.length === 0 ? (
                <div className="bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-center text-xs text-[#71717A] dark:text-[#8E8E93]">
                  No se detectaron voces adicionales. El navegador usará la síntesis fonética en Español Latino (es-419).
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
                        className={`flex items-center justify-between p-2.5 rounded-none border text-left transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white'
                            : 'bg-white dark:bg-[#18181B] border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-[#EFECE5] hover:border-[#E1500A]'
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => selectVoice(uri)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{v.name}</span>
                            {isFemale && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-[#E1500A]/15 text-[#E1500A] font-black uppercase">
                                Mujer
                              </span>
                            )}
                            {isSpain ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-black uppercase">
                                España
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black uppercase">
                                Latino
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] block mt-0.5">
                            {v.lang} {v.localService ? '• Local' : '• Cloud'}
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
                            className="p-1.5 rounded-none bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] hover:border-[#E1500A] transition-colors cursor-pointer"
                            title="Probar esta voz"
                          >
                            <Play className="w-3 h-3 fill-current text-[#E1500A]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[11px] text-[#71717A] dark:text-[#8E8E93]">
                Preferencia guardada
              </span>
              <button
                onClick={() => {
                  stopSpeaking();
                  setShowVoiceModal(false);
                }}
                className="bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white font-black text-xs px-5 py-2.5 rounded-none cursor-pointer transition-colors uppercase tracking-wider"
              >
                Aceptar / Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Prompts + Chat View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Quick Action Chips */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>Consultas Frecuentes</span>
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mb-4 font-medium">
              Toca cualquier pregunta para que Xenia te responda en el acto:
            </p>

            <div className="space-y-4">
              {quickPrompts.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-widest flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-[#E1500A]" />
                      {cat.category}
                    </span>
                    <div className="space-y-1.5">
                      {cat.prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={isLoading}
                          className="w-full text-left text-xs p-2.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] hover:border-[#E1500A] text-[#18181B] dark:text-[#EFECE5] transition-all cursor-pointer leading-snug font-medium"
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

          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 text-xs text-[#71717A] dark:text-[#8E8E93]">
            <h4 className="font-black text-[#18181B] dark:text-white mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Autonomía y Claridad Total</span>
            </h4>
            <p className="leading-relaxed">
              En lugar de buscar en planillas o consultar manuales externos, Xenia te entrega números consolidados en tiempo real y te guía paso a paso en el uso de cada función de Loomi Suite.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Conversation */}
        <div className="lg:col-span-2 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs flex flex-col h-[640px]">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#C8C4B7] dark:border-[#222328] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <XeniaAvatar size="xs" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white">
                    Conversación con Xenia
                  </span>
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none bg-white dark:bg-[#18181B] hover:border-[#E1500A] text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white border border-[#C8C4B7] dark:border-[#222328] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Configurar y probar voz"
                  >
                    <span>Voz Latina</span>
                    <Sliders className="w-2.5 h-2.5 text-[#E1500A]" />
                  </button>
                </div>
                <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] block">Consultas por voz y texto en tiempo real</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice auto-play toggle */}
              <button
                onClick={toggleAutoVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  autoVoice
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white'
                    : 'bg-white dark:bg-[#18181B] border-[#C8C4B7] dark:border-[#222328] text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white'
                }`}
                title={
                  autoVoice
                    ? 'Voz automática activada'
                    : 'Activar respuestas automáticas por voz'
                }
              >
                {autoVoice ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#E1500A]" />
                    <span>Audio ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Audio OFF</span>
                  </>
                )}
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
                className="text-[11px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] hover:border-[#E1500A] cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#ECEAE4] dark:bg-[#0E0F12]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <XeniaAvatar size="sm" showStatus={false} />
                )}

                <div
                  className={`max-w-2xl rounded-none p-4 text-xs sm:text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                      : 'bg-[#EAE8E3] dark:bg-[#0C0D0F] border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-[#EFECE5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1 border-b border-[#C8C4B7]/40 dark:border-[#222328] text-[9px] font-black uppercase tracking-wider opacity-70">
                    <span>
                      {msg.role === 'user' ? 'Tú (Anfitrión)' : 'Xenia (Copiloto)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>

                      {msg.role === 'assistant' && (
                        <>
                          {/* Speak Button for this individual message */}
                          <button
                            onClick={() => speakMessage(msg.content, msg.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-none transition-all cursor-pointer ${
                              isSpeaking && speakingMessageId === msg.id
                                ? 'bg-[#E1500A] text-white font-black'
                                : 'hover:text-[#E1500A] text-[#71717A] dark:text-[#8E8E93]'
                            }`}
                            title={
                              isSpeaking && speakingMessageId === msg.id
                                ? 'Detener voz de Xenia'
                                : 'Escuchar respuesta'
                            }
                          >
                            {isSpeaking && speakingMessageId === msg.id ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current" />
                                <span>Hablando</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Escuchar</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="hover:text-[#E1500A] transition-colors p-0.5"
                            title="Copiar texto"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-xs sm:prose-sm max-w-none text-current dark:prose-invert">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-none bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] border border-[#18181B] dark:border-white flex items-center justify-center text-xs font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live speech listening indicator */}
            {isListening && (
              <div className="flex items-center gap-3 p-3.5 bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#E1500A] rounded-none text-xs text-[#18181B] dark:text-white animate-in fade-in">
                <div className="w-8 h-8 bg-[#E1500A] flex items-center justify-center text-white animate-pulse">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-black uppercase text-[#E1500A] tracking-wider">
                    <span>🎙️ Xenia está escuchando tu voz (Español)...</span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-bold">
                    {transcript || 'Hablá con normalidad...'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                  }}
                  className="px-3 py-1.5 bg-[#E1500A] text-white font-black uppercase tracking-wider rounded-none text-xs hover:bg-[#C94305] cursor-pointer"
                >
                  {transcript.trim() ? 'Enviar consulta' : 'Detener'}
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#71717A] dark:text-[#8E8E93] animate-pulse bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] p-3">
                <XeniaAvatar size="sm" />
                <span className="font-bold">Xenia está analizando tus reservas y preparando la respuesta...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-[#C8C4B7] dark:border-[#222328] bg-[#EAE8E3] dark:bg-[#0C0D0F] space-y-2">
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
                  } else {
                    startListening();
                  }
                }}
                className={`p-2.5 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse border-red-500'
                    : 'bg-white dark:bg-[#18181B] hover:bg-[#E1500A] hover:text-white border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-white'
                }`}
                title={
                  isListening
                    ? 'Detener micrófono y enviar'
                    : 'Hablar con Xenia por voz'
                }
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="text-xs font-black uppercase hidden sm:inline">Escuchando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-black uppercase hidden sm:inline">Hablar</span>
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
                className="flex-1 text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] focus:border-[#E1500A] rounded-none px-4 py-2.5 text-[#18181B] dark:text-white placeholder-[#71717A] dark:placeholder-[#8E8E93] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#E1500A] hover:bg-[#C94305] disabled:opacity-40 text-white p-2.5 rounded-none transition-all cursor-pointer shrink-0"
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
