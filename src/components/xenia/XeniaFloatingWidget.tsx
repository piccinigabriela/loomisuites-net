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
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DemoState } from '../../types';
import { getClientXeniaReply } from './xeniaLocalEngine';
import { XeniaAvatar } from './XeniaAvatar';
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
        '👋 ¡Hola! Soy **Xenia**, tu asistente en Loomi Suite. Podés escribirme o **hablarme por voz con el micrófono** 🎙️ y te responderé en español argentino. ¿Qué querés consultar?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
  } = useXeniaVoice();

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

    try {
      const res = await fetch('/api/xenia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        }, 150);
      }
    } catch (err) {
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
        }, 150);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-[#1c1a18] hover:bg-[#25201b] text-white rounded-full shadow-2xl hover:shadow-[#c46d45]/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-[#48372b]"
          aria-label="Abrir Asistente Xenia"
        >
          <XeniaAvatar size="sm" showStatus={false} />
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-xs tracking-tight text-[#f4f2ee]">Xenia Copilot</span>
              <span className="w-2 h-2 rounded-full bg-[#82ba8f] animate-pulse" />
            </div>
            <span className="text-[10px] text-[#d88d5e] font-medium leading-tight">
              Finanzas & Voz en Vivo
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#333] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-[#f4f2ee]">
          {/* Header */}
          <div className="p-4 bg-[#141414] text-white flex items-center justify-between border-b border-[#282828]">
            <div className="flex items-center gap-2.5">
              <XeniaAvatar size="sm" showStatus={false} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-[#f4f2ee]">Xenia Copilot</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#202d20] text-[#a4cca8] border border-[#344836]">
                    🇦🇷 Voz AR
                  </span>
                </div>
                <p className="text-[10px] text-[#8e8c87]">
                  Rendición de Cuentas & Voz
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleAutoVoice}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  autoVoice
                    ? 'text-[#d88d5e] bg-[#2a2018]'
                    : 'text-[#8e8c87] hover:text-white hover:bg-[#282828]'
                }`}
                title={autoVoice ? 'Voz de Xenia activada' : 'Activar voz'}
              >
                {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {onOpenFullView && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                    onOpenFullView();
                  }}
                  className="p-1.5 text-[#8e8c87] hover:text-white rounded-lg hover:bg-[#282828] transition-colors cursor-pointer"
                  title="Abrir vista completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 text-[#8e8c87] hover:text-white rounded-lg hover:bg-[#282828] transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Horizontal Scroll */}
          <div className="bg-[#161616] px-3 py-2 border-b border-[#282828] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() =>
                handleSend('¿Cuál es la ocupación actual y qué reservas hay?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#2a221b] border border-[#48372b] text-[#d88d5e] hover:border-[#6e503b] transition-colors cursor-pointer shrink-0 font-bold"
            >
              🛎️ Ocupación & Reservas
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto cuesta Loomi y cómo se paga?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202020] border border-[#333] text-[#c8c5c0] hover:text-[#f4f2ee] transition-colors cursor-pointer shrink-0 font-medium"
            >
              🏷️ Planes & precios ARS
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto dinero ingresó este mes y qué señas hay pendientes?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202020] border border-[#333] text-[#c8c5c0] hover:text-[#f4f2ee] transition-colors cursor-pointer shrink-0"
            >
              💰 Ingresos & señas
            </button>
            <button
              onClick={() =>
                handleSend('¿Cómo sincronizo Booking y Airbnb sin dobles reservas?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202020] border border-[#333] text-[#c8c5c0] hover:text-[#f4f2ee] transition-colors cursor-pointer shrink-0"
            >
              🔄 Sincronizar iCal
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#141414]">
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
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-[#c46d45] text-white rounded-tr-xs'
                      : 'bg-[#1e1e1e] border border-[#2e2e2e] text-[#e4e2de] rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[9px] opacity-70 border-b border-white/10 pb-0.5">
                    <span>{m.role === 'user' ? 'Tú' : 'Xenia'}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <>
                          <button
                            onClick={() => speakMessage(m.content, m.id)}
                            className={`p-0.5 rounded cursor-pointer transition-colors ${
                              isSpeaking && speakingMessageId === m.id
                                ? 'text-[#d88d5e] font-bold animate-pulse'
                                : 'hover:text-[#d88d5e]'
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
                            className="hover:text-[#d88d5e] p-0.5"
                            title="Copiar"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-2.5 h-2.5 text-[#78b37e]" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-xs max-w-none text-[#e4e2de] prose-invert">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {isListening && (
              <div className="flex items-center gap-2 text-xs text-[#d88d5e] bg-[#2b221b] border border-[#d88d5e]/50 rounded-xl p-2.5">
                <span className="w-2 h-2 rounded-full bg-[#d88d5e] animate-ping" />
                <span className="font-semibold">Escuchando tu voz... Hablá con libertad</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#8e8c87] bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-2.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#d88d5e] animate-ping" />
                <span>Xenia está respondiendo...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#181818] border-t border-[#2a2a2a]">
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
                    if (transcript.trim()) {
                      handleSend(transcript);
                    }
                  } else {
                    startListening();
                  }
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                    : 'bg-[#24201c] hover:bg-[#342b23] text-[#d88d5e] border border-[#48372b]'
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
                className="flex-1 px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-[#f4f2ee] focus:outline-none focus:border-[#d88d5e]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#c46d45] hover:bg-[#d67b51] disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors"
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

