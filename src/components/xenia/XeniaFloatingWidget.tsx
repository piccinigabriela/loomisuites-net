import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  DollarSign,
  BookOpen,
  MessageSquare,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DemoState } from '../../types';
import { getClientXeniaReply } from './xeniaLocalEngine';

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
        '👋 ¡Hola! Soy **Xenia**, tu asistente en Loomi Suite. Puedo **rendirte cuentas de ingresos y huéspedes**, o darte las **instrucciones de uso de la plataforma** para resolver cualquier duda al instante. ¿Qué deseas saber?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
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
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || getClientXeniaReply(text, demoState),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      // Fallback direct local client intelligence - always guaranteed to answer
      const localReply = getClientXeniaReply(text, demoState);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-full shadow-2xl hover:shadow-rose-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-rose-400/30"
          aria-label="Abrir Asistente Xenia"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm tracking-tight">Xenia IA</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-rose-100 font-medium leading-tight">
              Finanzas & Guía de Uso
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-rose-950 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">Xenia Copilot</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Rendición de Cuentas & Manual de Uso
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenFullView && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullView();
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Abrir vista completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Horizontal Scroll */}
          <div className="bg-zinc-50 px-3 py-2 border-b border-zinc-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() =>
                handleSend('¿Cuál es la ocupación actual y qué reservas hay?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 hover:border-rose-400 transition-colors cursor-pointer shrink-0 font-bold"
            >
              🛎️ Ocupación & Reservas
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto cuesta Loomi y cómo se paga?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 hover:border-amber-400 transition-colors cursor-pointer shrink-0 font-medium"
            >
              🏷️ Planes & precios ARS
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánto dinero ingresó este mes y qué señas hay pendientes?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
            >
              💰 Ingresos & señas
            </button>
            <button
              onClick={() =>
                handleSend('¿Qué servicios incluye y cómo funciona con llaves tradicionales?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
            >
              🔑 ¿Qué incluye?
            </button>
            <button
              onClick={() =>
                handleSend('¿Cómo sincronizo Booking y Airbnb sin dobles reservas?')
              }
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
            >
              🔄 Sincronizar iCal
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs leading-relaxed ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-rose-600 flex items-center justify-center text-white shrink-0 text-[10px] font-bold">
                    X
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-xs'
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[9px] opacity-70 border-b border-black/5 pb-0.5">
                    <span>{m.role === 'user' ? 'Tú' : 'Xenia'}</span>
                    <div className="flex items-center gap-1">
                      <span>{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => copyText(m.content, m.id)}
                          className="hover:text-rose-600 p-0.5"
                          title="Copiar"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-xs max-w-none text-zinc-800">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white border border-zinc-200 rounded-xl p-2.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Xenia está respondiendo...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-zinc-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta a Xenia sobre ingresos o el uso del sistema..."
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-800 focus:outline-hidden focus:border-rose-500 focus:bg-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors"
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
