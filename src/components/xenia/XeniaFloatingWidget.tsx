import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  DollarSign,
  BookOpen,
  MessageSquare,
  Copy,
  Check,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Camera,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DemoState } from '../../types';
import { getClientXeniaReply } from './xeniaLocalEngine';
import { getApiUrl } from '../../utils/apiConfig';
import { XeniaAvatar, setStoredXeniaAvatar } from './XeniaAvatar';
import { useXeniaVoice } from '../../hooks/useXeniaVoice';

interface XeniaFloatingWidgetProps {
  demoState: DemoState;
  onOpenFullView?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const XeniaFloatingWidget: React.FC<XeniaFloatingWidgetProps> = ({
  demoState,
  onOpenFullView,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'fw-1',
      role: 'assistant',
      content:
        '👋 ¡Hola! Soy **Xenia**, tu asistente en Loomi Suite. Podés escribirme o **hablarme por voz con el micrófono** 🎙️ y te responderé en español latinoamericano. ¿Qué querés consultar?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setStoredXeniaAvatar(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
  } = useXeniaVoice((finalText) => {
    handleSend(finalText);
  });

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    stopSpeaking();
    if (isListening) stopListening();
  };

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading, isListening]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (isListening) stopListening();
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTranscript('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
      const res = await fetch(getApiUrl('/api/xenia/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            properties: demoState.properties,
            reservations: demoState.reservations,
            cleaningTasks: demoState.cleaningTasks,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('API response not ok');
      }

      const data = await res.json();
      const reply = data.reply || getClientXeniaReply(text, demoState);
      const assistantMsgId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (autoVoice) {
        setTimeout(() => {
          speakMessage(reply, assistantMsgId);
        }, 100);
      }
    } catch {
      clearTimeout(timeoutId);
      const localReply = getClientXeniaReply(text, demoState);
      const assistantMsgId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (autoVoice) {
        setTimeout(() => {
          speakMessage(localReply, assistantMsgId);
        }, 100);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-1 bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] shadow-2xl hover:border-[#E1500A] dark:hover:border-[#E1500A] transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-2"
          aria-label="Abrir Asistente Xenia"
        >
          <div className="relative">
            <XeniaAvatar size="md" showStatus={true} />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181B] dark:text-white">Xenia Copilot</span>
            <span className="text-[9px] font-bold text-[#71717A] dark:text-[#8E8E93]">Online 24/7</span>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] bg-[#ECEAE4] dark:bg-[#0E0F12] border border-[#C8C4B7] dark:border-[#222328] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150 text-[#18181B] dark:text-[#EFECE5]">
          {/* Header */}
          <div className="p-3.5 bg-[#EAE8E3] dark:bg-[#0C0D0F] flex items-center justify-between border-b border-[#C8C4B7] dark:border-[#222328]">
            <div className="flex items-center gap-2.5">
              <div
                className="relative group cursor-pointer"
                onClick={() => photoInputRef.current?.click()}
                title="Subir foto de Xenia"
              >
                <XeniaAvatar size="sm" showStatus={false} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Camera className="w-3 h-3 text-[#E1500A]" />
                </div>
              </div>
              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#18181B] dark:text-white">Xenia Copilot</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] animate-pulse" />
                </div>
                <p className="text-[9px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider">
                  Rendición de Cuentas & Voz
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleAutoVoice}
                className={`p-1.5 border transition-colors cursor-pointer ${
                  autoVoice
                    ? 'text-white bg-[#E1500A] border-[#E1500A]'
                    : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B]'
                }`}
                title={autoVoice ? 'Voz de Xenia activada' : 'Activar voz'}
              >
                {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {onOpenFullView && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                    onOpenFullView();
                  }}
                  className="p-1.5 text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] transition-colors cursor-pointer"
                  title="Abrir vista completa"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Horizontal Scroll */}
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] px-3 py-1.5 border-b border-[#C8C4B7] dark:border-[#222328] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            <button
              onClick={() =>
                handleSend('¿Cuál es la ocupación actual y qué reservas hay?')
              }
              className="whitespace-nowrap px-2 py-0.5 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] hover:border-[#E1500A] text-[#18181B] dark:text-white transition-colors cursor-pointer shrink-0 font-bold uppercase tracking-wider"
            >
              🛎️ Ocupación & Reservas
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto cuesta Loomi y cómo se paga?')
              }
              className="whitespace-nowrap px-2 py-0.5 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] hover:border-[#E1500A] text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white transition-colors cursor-pointer shrink-0 font-bold uppercase tracking-wider"
            >
              🏷️ Planes ARS
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto dinero ingresó este mes y qué señas hay pendientes?')
              }
              className="whitespace-nowrap px-2 py-0.5 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] hover:border-[#E1500A] text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white transition-colors cursor-pointer shrink-0 font-bold uppercase tracking-wider"
            >
              💰 Ingresos
            </button>
            <button
              onClick={() =>
                handleSend('¿Cómo sincronizo Booking y Airbnb sin dobles reservas?')
              }
              className="whitespace-nowrap px-2 py-0.5 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] hover:border-[#E1500A] text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white transition-colors cursor-pointer shrink-0 font-bold uppercase tracking-wider"
            >
              🔄 Sincronizar iCal
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ECEAE4] dark:bg-[#0E0F12]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs leading-relaxed ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <XeniaAvatar size="xs" showStatus={false} />
                )}
                <div
                  className={`max-w-[88%] p-3 border ${
                    m.role === 'user'
                      ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                      : 'bg-[#EAE8E3] dark:bg-[#0C0D0F] border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-[#EFECE5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[9px] font-bold uppercase tracking-wider opacity-70 border-b border-[#C8C4B7]/40 dark:border-[#222328] pb-1">
                    <span>{m.role === 'user' ? 'Tú' : 'Xenia'}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <>
                          <button
                            onClick={() => speakMessage(m.content, m.id)}
                            className={`p-0.5 cursor-pointer transition-colors ${
                              isSpeaking && speakingMessageId === m.id
                                ? 'text-[#E1500A] font-black animate-pulse'
                                : 'hover:text-[#E1500A]'
                            }`}
                            title={
                              isSpeaking && speakingMessageId === m.id
                                ? 'Detener voz'
                                : 'Escuchar en voz alta'
                            }
                          >
                            {isSpeaking && speakingMessageId === m.id ? (
                              <Square className="w-2.5 h-2.5 fill-current" />
                            ) : (
                              <Volume2 className="w-2.5 h-2.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyText(m.content, m.id)}
                            className="hover:text-[#E1500A] p-0.5"
                            title="Copiar"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-xs max-w-none text-current dark:prose-invert">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {isListening && (
              <div className="flex items-center gap-2 text-xs text-[#E1500A] bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#E1500A] p-2.5">
                <span className="w-2 h-2 rounded-full bg-[#E1500A] animate-ping" />
                <span className="font-bold">Escuchando tu voz... Hablá con libertad</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#8E8E93] bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] p-2.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#E1500A] animate-ping" />
                <span className="font-bold">Xenia está respondiendo...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#EAE8E3] dark:bg-[#0C0D0F] border-t border-[#C8C4B7] dark:border-[#222328]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`p-2 transition-all cursor-pointer border ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse border-red-500'
                    : 'bg-white dark:bg-[#18181B] hover:bg-[#E1500A] hover:text-white text-[#18181B] dark:text-white border-[#C8C4B7] dark:border-[#222328]'
                }`}
                title={isListening ? 'Detener micrófono y enviar' : 'Hablar con Xenia por voz'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Escuchando tu voz...' : 'Preguntale a Xenia o tocá el micro...'}
                className="flex-1 px-3 py-2 bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] text-xs text-[#18181B] dark:text-white focus:outline-none focus:border-[#E1500A]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#E1500A] hover:bg-[#C94305] disabled:opacity-50 text-white cursor-pointer transition-colors"
                title="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

