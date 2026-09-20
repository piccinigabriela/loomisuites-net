import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  DollarSign,
  BookOpen,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Zap,
  Tag,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DemoState } from '../../types';

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

Estoy conectada a tus **${demoState.properties.length} cabañas y habitaciones** y al motor de Loomi Suite. Mi función es darte respuestas inmediatas y precisas con dos capacidades centrales:

1. **📊 Rendición de Cuentas Financieras & Huéspedes:**
   - Consulta facturación total, comisiones de OTAs (Booking / Airbnb), ingresos netos y comisiones ahorradas por reservas directas.
   - Entérate de quién llega hoy, quién sale y qué saldos o señas restan cobrar en mostrador.

2. **📘 Instrucciones de Uso de Loomi Suite:**
   - Aprende a usar cada módulo del sistema al instante. Pregúntame paso a paso cómo sincronizar calendarios iCal, cómo cargar reservas telefónicas, cómo coordinar a la mucama o cómo compartir tu link de reservas directas.

*Elige una de las preguntas sugeridas aquí abajo o escribe lo que necesites:*`,
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
    if (!textToSend) {
      setInputMessage('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/xenia/chat', {
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

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No obtuve respuesta en este momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error enviando mensaje a Xenia:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Tuve una dificultad para conectar con el servidor, pero aquí puedes ver tus finanzas y calendarios en las pestañas superiores o volver a intentar.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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
      category: 'Planes, Precios & Servicios',
      icon: Tag,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      prompts: [
        '¿Cuánto cuesta Loomi y cómo se abona la suscripción?',
        '¿Qué incluye el abono mensual y cómo funciona con llaves físicas?',
        '¿Qué son los módulos opcionales de frigobar y cerraduras?',
        '¿Tengo que poner tarjeta de crédito para empezar?',
      ],
    },
    {
      category: 'Rendición de Cuentas',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
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
      color: 'text-blue-700 bg-blue-50 border-blue-200',
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
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      prompts: [
        'Redactar mensaje de bienvenida con WiFi y ubicación para Cabaña 1',
        'Plantilla para pedir la seña del 50% por transferencia bancaria',
        'Respuesta rápida sobre política de leña, parrilla y check-in tardío',
      ],
    },
  ];

  // Calculate high-level stats for top pill bar
  const totalGross = demoState.reservations.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalSaved = demoState.reservations
    .filter((r) => r.platform === 'direct')
    .reduce((acc, r) => acc + r.totalAmount * 0.18, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner introducing Xenia */}
      <div className="bg-gradient-to-r from-rose-900 via-zinc-900 to-zinc-950 rounded-2xl p-6 text-white border border-rose-800/40 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Xenia Copilot</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Inteligencia Artificial para Rendición de Cuentas, Huéspedes y Guía de Uso de Loomi Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-zinc-700">
              <span className="text-zinc-400 block text-[10px]">Facturación en Demo</span>
              <span className="font-bold text-white text-sm">${totalGross.toLocaleString()} USD</span>
            </div>
            <div className="bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-800/40">
              <span className="text-emerald-400 block text-[10px]">Ahorro Directo (18%)</span>
              <span className="font-bold text-emerald-300 text-sm">
                +${Math.round(totalSaved).toLocaleString()} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Action Chips / Cheat-sheet */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-rose-600" />
              <span>Consultas Frecuentes</span>
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Toca cualquier pregunta para que Xenia te responda en el acto:
            </p>

            <div className="space-y-4">
              {quickPrompts.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {cat.category}
                    </span>
                    <div className="space-y-1.5">
                      {cat.prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={isLoading}
                          className="w-full text-left text-xs p-2.5 rounded-xl border border-zinc-200 hover:border-rose-400 hover:bg-rose-50/50 text-zinc-700 hover:text-rose-900 transition-all cursor-pointer leading-snug"
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

          <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 text-xs text-zinc-600">
            <h4 className="font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Autonomía y Claridad Total</span>
            </h4>
            <p className="leading-relaxed text-zinc-500">
              En lugar de buscar en planillas o consultar manuales externos, Xenia te entrega números consolidados en tiempo real y te guía paso a paso en el uso de cada función de Loomi Suite.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Conversation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col h-[640px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-zinc-800">
                Conversación con Xenia
              </span>
              <span className="text-[10px] text-zinc-400">• Gemini 3.8 Flash / Motor Operativo</span>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'assistant',
                    content: 'Conversación reiniciada. ¿En qué te ayudo hoy con tus cabañas o el uso de Loomi Suite?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="text-[11px] text-zinc-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shrink-0 shadow-xs">
                    <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-rose-300" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white shadow-xs rounded-tr-xs'
                      : 'bg-zinc-50 border border-zinc-200/80 text-zinc-800 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-black/5 dark:border-white/10 text-[10px] opacity-75">
                    <span className="font-semibold">
                      {msg.role === 'user' ? 'Tú (Anfitrión)' : 'Xenia Copilot'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-rose-600 transition-colors p-0.5"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-zinc-800 dark:prose-invert">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shrink-0">
                  <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-rose-300 animate-pulse" />
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Xenia está analizando tus datos y generando la respuesta...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 rounded-b-2xl">
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
                placeholder="Pregunta a Xenia sobre ingresos, huéspedes o cómo usar una función..."
                className="flex-1 px-4 py-3 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Preguntar</span>
              </button>
            </form>
            <p className="text-[11px] text-zinc-400 mt-2 text-center">
              Xenia lee en tiempo real el estado de tus cabañas, reservaciones y tareas para responderte con exactitud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
