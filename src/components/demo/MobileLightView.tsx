import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Users,
  Home,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Search,
  KeyRound,
  Wifi,
  Sparkle,
  Layers,
  LayoutGrid,
  Laptop,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  CreditCard,
  Send,
  Navigation,
  Square,
  StopCircle,
} from 'lucide-react';
import { DemoState, Reservation, Property, ReservationStatus, PaymentStatus } from '../../types';
import { formatDisplayDate, formatCurrency } from '../../data/initialData';
import { XeniaAvatar } from '../xenia/XeniaAvatar';
import { useXeniaVoice } from '../../hooks/useXeniaVoice';
import { getClientXeniaReply } from '../xenia/xeniaLocalEngine';
import { getApiUrl } from '../../utils/apiConfig';

interface MobileLightViewProps {
  demoState: DemoState;
  onOpenReservationDetail: (res: Reservation) => void;
  onOpenNewReservation: () => void;
  onUpdateReservationStatus: (resId: string, status: ReservationStatus) => void;
  onUpdatePaymentStatus?: (resId: string, status: PaymentStatus) => void;
  onToggleCleaningStatus: (taskId: string, currentStatus: string) => void;
  onOpenMessagesWithGuest: (resId: string) => void;
  onSwitchToFullView: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeComplex: 'catalinas' | 'woodcabin' | 'custom';
  complexName: string;
}

export const MobileLightView: React.FC<MobileLightViewProps> = ({
  demoState,
  onOpenReservationDetail,
  onOpenNewReservation,
  onUpdateReservationStatus,
  onUpdatePaymentStatus,
  onToggleCleaningStatus,
  onOpenMessagesWithGuest,
  onSwitchToFullView,
  theme,
  onToggleTheme,
  activeComplex,
  complexName,
}) => {
  // Mobile Active Tab: 'today' | 'units' | 'guests' | 'xenia' | 'more'
  const [mobileTab, setMobileTab] = useState<'today' | 'units' | 'guests' | 'xenia' | 'more'>('today');
  const [guestSearch, setGuestSearch] = useState('');
  const [copiedWifi, setCopiedWifi] = useState<string | null>(null);

  // Quick Action Sheet for a selected guest
  const [selectedGuestAction, setSelectedGuestAction] = useState<Reservation | null>(null);
  const [copiedTextNotice, setCopiedTextNotice] = useState<string | null>(null);

  // Xenia Assistant state inside mobile view
  const [xeniaMessages, setXeniaMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([
    {
      id: 'x-init',
      role: 'assistant',
      text: '¡Hola! Soy Xenia. Tocá el micrófono 🎙️ para consultarme quién llega hoy, tus números o cómo resolver cualquier tema operativo.',
    },
  ]);
  const [xeniaInput, setXeniaInput] = useState('');
  const [isXeniaLoading, setIsXeniaLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speakMessage,
    stopSpeaking,
    autoVoice,
    toggleAutoVoice,
  } = useXeniaVoice((finalText) => {
    handleSendXenia(finalText);
  });

  const handleStopXenia = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsXeniaLoading(false);
    stopSpeaking();
    if (isListening) stopListening();
  };

  const handleSendXenia = async (textToSend?: string) => {
    const query = (textToSend || xeniaInput).trim();
    if (!query || isXeniaLoading) return;

    if (isListening) stopListening();
    stopSpeaking();

    const userMsgId = `u-${Date.now()}`;
    setXeniaMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: query }]);
    setXeniaInput('');
    setTranscript('');
    setIsXeniaLoading(true);

    // Fast 1200ms timeout for remote API with instant local fallback
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
      const res = await fetch(getApiUrl('/api/xenia/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          contextData: {
            properties: demoState.properties,
            reservations: demoState.reservations,
            cleaningTasks: demoState.cleaningTasks,
          },
        }),
      });

      clearTimeout(timeoutId);

      let replyText = '';
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply || getClientXeniaReply(query, demoState);
      } else {
        replyText = getClientXeniaReply(query, demoState);
      }

      const asstId = `a-${Date.now()}`;
      setXeniaMessages((prev) => [...prev, { id: asstId, role: 'assistant', text: replyText }]);

      if (autoVoice) {
        setTimeout(() => {
          speakMessage(replyText, asstId);
        }, 100);
      }
    } catch {
      clearTimeout(timeoutId);
      // Instant super-fast local engine response (0ms lag)
      const fallback = getClientXeniaReply(query, demoState);
      const asstId = `a-${Date.now()}`;
      setXeniaMessages((prev) => [...prev, { id: asstId, role: 'assistant', text: fallback }]);
      if (autoVoice) {
        setTimeout(() => {
          speakMessage(fallback, asstId);
        }, 100);
      }
    } finally {
      setIsXeniaLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Today's date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const activeReservations = demoState.reservations.filter((r) => r.status !== 'cancelled');

  // Check-ins today
  const checkInsToday = activeReservations.filter((r) => r.checkIn === todayStr);

  // Check-outs today
  const checkOutsToday = activeReservations.filter((r) => r.checkOut === todayStr);

  // Currently staying (in-house)
  const currentlyStaying = activeReservations.filter(
    (r) => r.checkIn <= todayStr && r.checkOut > todayStr
  );

  // Occupied properties count
  const occupiedPropertyIds = new Set(currentlyStaying.map((r) => r.propertyId));
  const totalUnits = demoState.properties.length || 1;
  const occupiedCount = Math.min(totalUnits, occupiedPropertyIds.size);
  const occupancyPercent = Math.round((occupiedCount / totalUnits) * 100);

  // Pending cleaning tasks
  const pendingCleanings = demoState.cleaningTasks.filter((c) => c.status !== 'completed');

  // Formatted today in Spanish
  const todayFormatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Copy Wi-Fi Helper
  const handleCopyWifi = (pwd: string, propId: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedWifi(propId);
    setTimeout(() => setCopiedWifi(null), 2000);
  };

  // Helper to build WhatsApp direct link with clean formatted message
  const buildWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = (phone || '').replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  // Active property of selected action modal
  const selectedActionProperty = selectedGuestAction
    ? demoState.properties.find((p) => p.id === selectedGuestAction.propertyId)
    : undefined;

  // Deposit amount (50%)
  const depositAmount = selectedGuestAction ? Math.round(selectedGuestAction.totalAmount * 0.5) : 0;

  // Pre-formatted messages for 1-tap mobile sending
  const paymentMessageText = selectedGuestAction
    ? `¡Hola ${selectedGuestAction.guestName}! Te escribo de ${complexName}. Para confirmar tu reserva en ${selectedActionProperty?.name || 'la cabaña'} del ${formatDisplayDate(selectedGuestAction.checkIn)} al ${formatDisplayDate(selectedGuestAction.checkOut)}, te solicitamos la seña del 50% (${depositAmount} USD o equivalente en pesos).\n\n📌 *Datos de Transferencia Bancaria:*\n• Alias: CATALINAS.APARTS\n• CBU: 0720000000000012345678\n• Titular: ${complexName}\n\nO podés abonar con Mercado Pago / Tarjeta. ¡Avisanos cuando realices el pago para enviarte la confirmación!`
    : '';

  const welcomeMessageText = selectedGuestAction
    ? `¡Hola ${selectedGuestAction.guestName}! Te damos la bienvenida a ${complexName} 🌟.\n\nYa está todo listo para tu llegada a ${selectedActionProperty?.name || 'tu unidad'}.\n\n🗺️ *Tu Guía Digital con Ruta GPS y Recomendaciones:*\nhttps://loomisuite.net/guia/${selectedGuestAction.propertyId}\n\n🔑 *Acceso y Wi-Fi:*\n• Red Wi-Fi: ${selectedActionProperty?.wifiNetwork || 'CatalinasAptos'}\n• Clave Wi-Fi: ${selectedActionProperty?.wifiPassword || 'TresSargentos435'}\n• Horario Check-in: A partir de las 14:00hs.\n\n¡Cualquier consulta estamos a tu disposición!`
    : '';

  const wifiMessageText = selectedGuestAction
    ? `¡Hola ${selectedGuestAction.guestName}! Te dejamos los datos de conexión de ${selectedActionProperty?.name || 'tu cabaña'}:\n\n📶 *Red Wi-Fi:* ${selectedActionProperty?.wifiNetwork || 'CatalinasAptos'}\n🔑 *Clave:* ${selectedActionProperty?.wifiPassword || 'TresSargentos435'}\n📍 *Dirección:* ${selectedActionProperty?.address || 'Tres Sargentos 435, CABA'}\n\n¡Que tengas una hermosa estadía!`
    : '';

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-[#090A0C] text-[#18181B] dark:text-[#EDE8DF] font-sans pb-24 transition-colors">
      {/* ========================================================================= */}
      {/* 1. COMPACT LIGHT MOBILE TOP BAR                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0E0F12]/95 backdrop-blur-md border-b border-[#C8C4B7]/60 dark:border-[#222328] px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#E1500A] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            L
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-black text-[#18181B] dark:text-white truncate">
              {complexName}
            </h1>
            <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
              {capitalizedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Switch to Full / Desktop view */}
          <button
            onClick={onSwitchToFullView}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Cambiar a Vista Completa (Escritorio)"
          >
            <Laptop className="w-3.5 h-3.5 text-[#FF7A38]" />
            <span>Vista Completa</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md bg-[#ECEAE4] dark:bg-[#18191D] border border-[#C8C4B7] dark:border-[#2E3038] text-[#18181B] dark:text-white active:scale-95 transition-all cursor-pointer"
            title="Cambiar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#E1500A]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#18181B]" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (BY TAB)                                             */}
      {/* ========================================================================= */}
      <main className="p-3.5 sm:p-4 max-w-lg mx-auto space-y-4 pb-28">
        {/* ======================================================================= */}
        {/* TAB 1: ☀️ HOY (Día a Día / Check-ins / Salidas / Limpieza)              */}
        {/* ======================================================================= */}
        {mobileTab === 'today' && (
          <div className="space-y-4">
            {/* Occupancy Status Banner */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/70 dark:border-[#222328] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] block">
                  Ocupación Actual
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-[#18181B] dark:text-white">
                    {occupancyPercent}%
                  </span>
                  <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
                    ({occupiedCount} de {totalUnits} unidades)
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenNewReservation}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E1500A] text-white text-xs font-bold shadow-sm shadow-[#E1500A]/30 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Reserva</span>
              </button>
            </div>

            {/* QUICK ACTIONS BAR (ATAJOS DIRECTOS EN PANTALLA) */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#141518] border border-[#C8C4B7]/70 dark:border-[#24262E] shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#E1500A]" />
                <span>Atajos Rápidos</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onOpenNewReservation}
                  className="p-2.5 rounded-lg bg-zinc-100 dark:bg-[#1E2025] hover:bg-zinc-200 dark:hover:bg-[#282A31] border border-zinc-200 dark:border-[#2D3039] text-zinc-900 dark:text-zinc-100 text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer text-center"
                >
                  <Plus className="w-4 h-4 text-[#E1500A]" />
                  <span>+ Reserva</span>
                </button>

                <button
                  onClick={() => setMobileTab('guests')}
                  className="p-2.5 rounded-lg bg-zinc-100 dark:bg-[#1E2025] hover:bg-zinc-200 dark:hover:bg-[#282A31] border border-zinc-200 dark:border-[#2D3039] text-zinc-900 dark:text-zinc-100 text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer text-center"
                >
                  <Users className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setMobileTab('more')}
                  className="p-2.5 rounded-lg bg-zinc-100 dark:bg-[#1E2025] hover:bg-zinc-200 dark:hover:bg-[#282A31] border border-zinc-200 dark:border-[#2D3039] text-zinc-900 dark:text-zinc-100 text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer text-center"
                >
                  <Zap className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <span>Más Atajos</span>
                </button>
              </div>
            </div>

            {/* SECTION: LLEGAN HOY (CHECK-INS) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] inline-block" />
                  <span>Llegan Hoy ({checkInsToday.length})</span>
                </h2>
                <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93]">
                  Check-in desde 14:00hs
                </span>
              </div>

              {checkInsToday.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/70 dark:bg-[#141518]/70 border border-dashed border-[#C8C4B7] dark:border-[#24262E] text-center text-xs text-[#71717A] dark:text-[#8E8E93] font-medium">
                  No hay ingresos previstos para hoy.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {checkInsToday.map((res) => {
                    const prop = demoState.properties.find((p) => p.id === res.propertyId);
                    const isFullyPaid = res.paymentStatus === 'paid';

                    return (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-[#C8C4B7]/80 dark:border-[#24262E] shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-[#18181B] dark:text-white">
                                {res.guestName}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                                {res.platform}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#E1500A] mt-0.5">
                              {prop?.name || 'Cabaña'} • {res.nights} {res.nights === 1 ? 'noche' : 'noches'}
                            </p>
                          </div>

                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#1E2025] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60"
                          >
                            {isFullyPaid ? '100% Pagado' : `Saldo: ${formatCurrency(res.totalAmount)}`}
                          </span>
                        </div>

                        {/* Fast 1-Tap Actions */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                          <button
                            onClick={() => setSelectedGuestAction(res)}
                            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() =>
                              onUpdateReservationStatus(
                                res.id,
                                res.status === 'checked_in' ? 'confirmed' : 'checked_in'
                              )
                            }
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold border active:scale-95 transition-all cursor-pointer ${
                              res.status === 'checked_in'
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
                                : 'bg-zinc-100 dark:bg-[#1E2025] text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-[#2D3039]'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{res.status === 'checked_in' ? 'Ingresó' : 'Marcar In'}</span>
                          </button>

                          <button
                            onClick={() => onOpenReservationDetail(res)}
                            className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-zinc-100 dark:bg-[#1E2025] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-[#2D3039] text-xs font-bold active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Ficha</span>
                            <ArrowRight className="w-3 h-3 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION: SALEN HOY (CHECK-OUTS) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 inline-block" />
                  <span>Salen Hoy ({checkOutsToday.length})</span>
                </h2>
                <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93]">
                  Check-out hasta 10:00hs
                </span>
              </div>

              {checkOutsToday.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/70 dark:bg-[#141518]/70 border border-dashed border-[#C8C4B7] dark:border-[#24262E] text-center text-xs text-[#71717A] dark:text-[#8E8E93] font-medium">
                  No hay salidas previstas para hoy.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {checkOutsToday.map((res) => {
                    const prop = demoState.properties.find((p) => p.id === res.propertyId);

                    return (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-[#C8C4B7]/80 dark:border-[#24262E] shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-black text-sm text-[#18181B] dark:text-white">
                            {res.guestName}
                          </p>
                          <p className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
                            {prop?.name || 'Cabaña'}
                          </p>
                        </div>

                        <button
                          onClick={() => onUpdateReservationStatus(res.id, 'checked_out')}
                          className="px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-zinc-800 hover:bg-[#E1500A] dark:hover:bg-[#E1500A] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer border border-transparent dark:border-zinc-700 shadow-xs"
                        >
                          Confirmar Salida
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION: LIMPIEZAS PENDIENTES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] inline-block" />
                  <span>Limpiezas del Día ({pendingCleanings.length})</span>
                </h2>
              </div>

              {pendingCleanings.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#141518] border border-zinc-200 dark:border-[#24262E] text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Todas las cabañas están limpias y listas para recibir pasajeros.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingCleanings.map((task) => {
                    const prop = demoState.properties.find((p) => p.id === task.propertyId);
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-white dark:bg-[#141518] border border-[#C8C4B7]/70 dark:border-[#24262E] shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#18181B] dark:text-white">
                            {prop?.name || 'Cabaña'}
                          </p>
                          <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93]">
                            Asignada a: <span className="font-semibold">{task.cleanerName}</span> ({task.scheduledTime})
                          </p>
                        </div>

                        <button
                          onClick={() => onToggleCleaningStatus(task.id, task.status)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#18181B] dark:bg-zinc-800 hover:bg-[#E1500A] dark:hover:bg-[#E1500A] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer border border-transparent dark:border-zinc-700 shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar Lista</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: 🏡 CABAÑAS / DEPARTAMENTOS                                       */}
        {/* ======================================================================= */}
        {mobileTab === 'units' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white">
                Unidades ({demoState.properties.length})
              </h2>
              <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93]">
                Estado en tiempo real
              </span>
            </div>

            {demoState.properties.map((prop) => {
              const currentRes = currentlyStaying.find((r) => r.propertyId === prop.id);
              const isOccupied = !!currentRes;
              const hasCleaning = pendingCleanings.some((c) => c.propertyId === prop.id);

              return (
                <div
                  key={prop.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-[#C8C4B7]/80 dark:border-[#24262E] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-[#18181B] dark:text-white">
                        {prop.name}
                      </h3>
                      <p className="text-xs text-[#71717A] dark:text-[#8E8E93] font-medium">
                        {prop.type} • Hasta {prop.maxGuests} pax
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                        isOccupied
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white font-black'
                          : hasCleaning
                          ? 'bg-zinc-100 dark:bg-[#1E2025] text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {isOccupied ? 'Ocupada' : hasCleaning ? 'En Limpieza' : 'Disponible'}
                    </span>
                  </div>

                  {/* Current Stay details if occupied */}
                  {isOccupied && currentRes && (
                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#1E2025] border border-[#C8C4B7]/40 dark:border-[#2D3039] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18181B] dark:text-white">
                          Huésped: {currentRes.guestName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#E1500A]">
                          Sale {formatDisplayDate(currentRes.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#8E8E93]">
                        <span>Tel: {currentRes.guestPhone}</span>
                        <button
                          onClick={() => setSelectedGuestAction(currentRes)}
                          className="text-[#18181B] dark:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3 text-[#E1500A]" />
                          <span>WhatsApp & Cobro</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Wi-Fi and Keys Quick Info */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[#71717A] dark:text-[#8E8E93]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Wifi className="w-3.5 h-3.5 text-[#E1500A] shrink-0" />
                      <span className="truncate">{prop.wifiNetwork}</span>
                    </div>

                    <button
                      onClick={() => handleCopyWifi(prop.wifiPassword, prop.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#18181B] dark:text-white px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0 border border-zinc-200 dark:border-zinc-700"
                    >
                      {copiedWifi === prop.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Clave</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: 👥 HUÉSPEDES (Directorio de Contacto y Pasajeros)                 */}
        {/* ======================================================================= */}
        {mobileTab === 'guests' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] dark:text-[#8E8E93] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#121316] border border-[#C8C4B7] dark:border-[#222328] rounded-xl pl-9 pr-3 py-2.5 text-[#18181B] dark:text-white focus:outline-none focus:border-[#E1500A] transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              {activeReservations
                .filter(
                  (r) =>
                    !guestSearch ||
                    r.guestName.toLowerCase().includes(guestSearch.toLowerCase()) ||
                    r.guestPhone.includes(guestSearch)
                )
                .slice(0, 15)
                .map((res) => {
                  const prop = demoState.properties.find((p) => p.id === res.propertyId);

                  return (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-sm text-[#18181B] dark:text-white">
                            {res.guestName}
                          </p>
                          <p className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                            {prop?.name || 'Cabaña'} • {formatDisplayDate(res.checkIn)} al{' '}
                            {formatDisplayDate(res.checkOut)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-[#18181B] dark:text-white block">
                            {formatCurrency(res.totalAmount)}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border inline-block mt-0.5 ${
                              res.paymentStatus === 'paid'
                                ? 'bg-zinc-100 dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-[#2D3039]'
                                : 'bg-[#FAF8F5] dark:bg-[#201C1A] text-[#E1500A] dark:text-[#F37A3D] border-amber-300/80 dark:border-[#4A291A]'
                            }`}
                          >
                            {res.paymentStatus === 'paid' ? 'Pagado' : 'Seña Pendiente'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => setSelectedGuestAction(res)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#18181B] hover:bg-black dark:bg-[#1E2026] dark:hover:bg-[#282A33] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-2xs border border-zinc-800 dark:border-[#2E303A]"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>WhatsApp & Acciones</span>
                        </button>

                        <a
                          href={`tel:${res.guestPhone}`}
                          className="flex items-center justify-center p-2 rounded-lg bg-zinc-100 dark:bg-[#1E2026] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#282A33] active:scale-95 transition-all cursor-pointer border border-zinc-200 dark:border-[#2E303A]"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => onOpenReservationDetail(res)}
                          className="flex items-center justify-center p-2 rounded-lg bg-zinc-100 dark:bg-[#1E2026] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#282A33] active:scale-95 transition-all cursor-pointer border border-zinc-200 dark:border-[#2E303A]"
                          title="Ver Ficha"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: 🎙️ XENIA VOZ (Copiloto Inteligente en Movimiento)                 */}
        {/* ======================================================================= */}
        {mobileTab === 'xenia' && (
          <div className="space-y-4">
            
            {/* Active Voice Stop Banner (Always Visible when Speaking) */}
            {isSpeaking && (
              <button
                onClick={handleStopXenia}
                className="w-full p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-pulse transition-all cursor-pointer border border-red-400"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 fill-white shrink-0" />
                  <span>Xenia está hablando... <strong>Tocá acá para Detener / Silenciar</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-black/30 text-[10px] font-mono">⏹️ PARAR</span>
              </button>
            )}

            {/* Loading / Thinking Banner */}
            {isXeniaLoading && (
              <div className="w-full p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span>Xenia analizando...</span>
                </div>
                <button
                  onClick={handleStopXenia}
                  className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-[10px] font-mono font-bold"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Big Voice Hero Card */}
            <div className="p-5 rounded-2xl bg-linear-to-b from-[#18191D] to-[#0A0B0D] text-white border border-[#c5a880]/40 shadow-lg text-center space-y-3 relative overflow-hidden">
              
              {/* Voice auto-play toggle at top right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={toggleAutoVoice}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    autoVoice
                      ? 'bg-[#E1500A]/20 border-[#E1500A] text-[#FF7A38]'
                      : 'bg-stone-800/80 border-stone-700 text-stone-400'
                  }`}
                  title="Activar/Desactivar lectura por voz"
                >
                  {autoVoice ? <Volume2 className="w-3 h-3 text-[#E1500A]" /> : <VolumeX className="w-3 h-3 text-stone-400" />}
                  <span>{autoVoice ? 'Voz ON' : 'Voz Mute'}</span>
                </button>
              </div>

              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#c5a880] shadow-md">
                <XeniaAvatar size="lg" className="w-full h-full" />
              </div>

              <div>
                <h3 className="text-base font-black text-[#EDE8DF]">
                  Xenia Copiloto por Voz
                </h3>
                <p className="text-xs text-stone-300">
                  Tocá el micrófono para hablar o escribí tu duda abajo
                </p>
              </div>

              {/* Big Mic / Stop Button */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {isSpeaking ? (
                  <button
                    onClick={handleStopXenia}
                    className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl animate-pulse ring-4 ring-red-500/40 active:scale-95"
                    title="Detener voz"
                  >
                    <Square className="w-6 h-6 fill-white" />
                    <span className="text-[9px] font-black uppercase mt-1">Parar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse scale-110 ring-8 ring-red-500/30'
                        : 'bg-[#E1500A] text-white hover:bg-[#C94305] active:scale-95 shadow-[#E1500A]/40'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-400 font-bold">
                {isSpeaking
                  ? '🔊 Xenia respondiendo en voz alta... Tocá "Parar" para silenciar'
                  : isListening
                  ? '🎙️ Escuchando... Hablá ahora'
                  : 'Presioná para consultar por voz'}
              </p>
            </div>

            {/* Quick Question Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] block">
                Preguntas Rápidas Sugeridas:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  '¿Cómo se envía la bienvenida y guía digital al huésped?',
                  '¿Cómo paso del Modo Light a la Vista Completa (PC)?',
                  '¿Quién llega hoy y qué cabañas se ocupan?',
                  '¿Cuál es mi ganancia en octubre y comisiones?',
                  '¿Cómo modifico o cambio fechas de una reserva?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendXenia(q)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/70 dark:border-[#222328] text-xs font-bold text-left text-[#18181B] dark:text-white hover:border-[#E1500A] active:scale-98 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E1500A] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendXenia();
              }}
              className="flex items-center gap-2 bg-white dark:bg-[#121316] p-2 rounded-2xl border border-[#C8C4B7]/80 dark:border-[#222328] shadow-sm"
            >
              <input
                type="text"
                value={xeniaInput}
                onChange={(e) => setXeniaInput(e.target.value)}
                placeholder="Escribí tu consulta..."
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-[#18181B] dark:text-white focus:outline-hidden"
              />
              {isSpeaking || isXeniaLoading ? (
                <button
                  type="button"
                  onClick={handleStopXenia}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Parar</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!xeniaInput.trim() || isXeniaLoading}
                  className="p-2 rounded-xl bg-[#E1500A] hover:bg-[#C94305] disabled:opacity-40 text-white transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Chat History Snippet */}
            <div className="space-y-2.5 pt-1">
              {xeniaMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl text-xs ${
                    m.role === 'user'
                      ? 'bg-[#E1500A] text-white ml-6 font-bold shadow-xs'
                      : 'bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] text-[#18181B] dark:text-[#EDE8DF] mr-4 shadow-2xs space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#C8C4B7]/30 dark:border-white/10 text-[10px]">
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakMessage(m.text, m.id);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {isSpeaking ? <Square className="w-2.5 h-2.5 fill-current text-red-500" /> : <Volume2 className="w-2.5 h-2.5" />}
                        <span>{isSpeaking ? 'Silenciar' : 'Escuchar'}</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.text);
                          setCopiedTextNotice('Respuesta copiada');
                          setTimeout(() => setCopiedTextNotice(null), 2000);
                        }}
                        className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copiar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 5: ⚡ ACCIONES / MÁS (Atajos Operativos Rápidos)                     */}
        {/* ======================================================================= */}
        {mobileTab === 'more' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#E1500A]" />
                <span>Atajos Operativos</span>
              </h2>
              <span className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93]">
                Acciones rápidas con 1 toque
              </span>
            </div>

            {/* SECCIÓN 1: RESERVAS & HUÉSPEDES */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] px-1 block">
                1. Reservas & Huéspedes
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={onOpenNewReservation}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-white shadow-2xs hover:border-[#E1500A] active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#1C1E24] text-[#E1500A] border border-[#C8C4B7]/50 dark:border-[#2D3039] flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#18181B] dark:text-white">Cargar Nueva Reserva</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-medium">
                        Reserva manual, telefónica o directa
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E1500A]" />
                </button>

                <button
                  onClick={() => setMobileTab('guests')}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-white shadow-2xs hover:border-[#E1500A] active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border border-[#C8C4B7]/50 dark:border-[#2D3039] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#18181B] dark:text-white">Directorio de Huéspedes</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-medium">
                        Buscar teléfonos, WhatsApp y cobros
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* SECCIÓN 2: HOUSEKEEPING & CABAÑAS */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] px-1 block">
                2. Housekeeping & Cabañas
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setMobileTab('units')}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-white shadow-2xs hover:border-[#E1500A] active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border border-[#C8C4B7]/50 dark:border-[#2D3039] flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#18181B] dark:text-white">Estado de Cabañas & Wi-Fi</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-medium">
                        Ver unidades libres, ocupadas y claves
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>

                <button
                  onClick={() => setMobileTab('xenia')}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-white shadow-2xs hover:border-[#E1500A] active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#E1500A]/15 text-[#E1500A] flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#18181B] dark:text-white">Preguntarle a Xenia por Voz</p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-medium">
                        Consultas instantáneas de facturación y ocupación
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E1500A]" />
                </button>
              </div>
            </div>

            {/* SECCIÓN 3: ADMINISTRACIÓN & ESCRITORIO */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] px-1 block">
                3. Administración & Vista Completa
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={onSwitchToFullView}
                  className="w-full p-3.5 rounded-xl bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] border border-[#18181B] dark:border-white flex items-center justify-between text-xs font-bold shadow-md hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 dark:bg-black/10 flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm">Cambiar a Vista Completa (Escritorio)</p>
                      <p className="text-[11px] opacity-80 font-medium">
                        Calendario Rack, Rendimiento y Configuración
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Quick Numbers Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#121316] border border-[#C8C4B7]/80 dark:border-[#222328] shadow-2xs space-y-2 mt-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] block">
                Resumen Económico Rápido
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-bold">
                    Ganancia Neta Real
                  </p>
                  <p className="text-lg font-black text-[#18181B] dark:text-white">
                    {formatCurrency(
                      activeReservations.reduce((sum, r) => sum + r.netRevenue, 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-bold">
                    Ahorro Directo (0%)
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(
                      activeReservations
                        .filter((r) => r.platform === 'direct')
                        .reduce((sum, r) => sum + r.totalAmount * 0.18, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL / BOTTOM DRAWER: ACCIONES RÁPIDAS DE WHATSAPP Y COBROS           */}
      {/* ========================================================================= */}
      {selectedGuestAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#121316] rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#C8C4B7]/60 dark:border-[#222328]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E1500A] block">
                  Acciones Rápidas con el Huésped
                </span>
                <h3 className="font-black text-base text-[#18181B] dark:text-white">
                  {selectedGuestAction.guestName}
                </h3>
                <p className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
                  {selectedActionProperty?.name} • {formatDisplayDate(selectedGuestAction.checkIn)} al {formatDisplayDate(selectedGuestAction.checkOut)}
                </p>
              </div>

              <button
                onClick={() => setSelectedGuestAction(null)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick WhatsApp Templates */}
            <div className="space-y-3">
              {/* ACTION 1: SOLICITAR SEÑA / PAGO */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#C8C4B7]/70 dark:border-[#282A33] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#22242D] text-[#18181B] dark:text-[#E4E4E7] flex items-center justify-center border border-[#C8C4B7]/40 dark:border-[#323540]">
                      <CreditCard className="w-3.5 h-3.5 text-[#E1500A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
                        1. Solicitar Seña o Saldo
                      </h4>
                      <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                        Envía Alias, CBU y monto sugerido ({depositAmount} USD)
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, paymentMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#18181B] hover:bg-black dark:bg-[#22242C] dark:hover:bg-[#2B2D37] text-white text-xs font-bold flex items-center justify-center gap-2 border border-zinc-800 dark:border-[#383B47] shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#E1500A]" />
                  <span>Enviar Solicitud de Seña por WhatsApp</span>
                </a>
              </div>

              {/* ACTION 2: ENVIAR BIENVENIDA & GUÍA DIGITAL */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#C8C4B7]/70 dark:border-[#282A33] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#22242D] text-[#18181B] dark:text-[#E4E4E7] flex items-center justify-center border border-[#C8C4B7]/40 dark:border-[#323540]">
                      <Navigation className="w-3.5 h-3.5 text-[#E1500A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
                        2. Enviar Bienvenida & Guía Digital
                      </h4>
                      <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                        Incluye ruta GPS interactiva, fotos de acceso y claves
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, welcomeMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#18181B] hover:bg-black dark:bg-[#22242C] dark:hover:bg-[#2B2D37] text-white text-xs font-bold flex items-center justify-center gap-2 border border-zinc-800 dark:border-[#383B47] shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#E1500A]" />
                  <span>Enviar Bienvenida & Guía por WhatsApp</span>
                </a>
              </div>

              {/* ACTION 3: ENVIAR CLAVE WI-FI Y UBICACIÓN */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#C8C4B7]/70 dark:border-[#282A33] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#22242D] text-[#18181B] dark:text-[#E4E4E7] flex items-center justify-center border border-[#C8C4B7]/40 dark:border-[#323540]">
                      <Wifi className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
                        3. Enviar Wi-Fi y Dirección
                      </h4>
                      <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                        Red: {selectedActionProperty?.wifiNetwork}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, wifiMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1E2027] dark:hover:bg-[#282A33] text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 border border-zinc-200 dark:border-[#323540] shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                  <span>Enviar Wi-Fi y Dirección por WhatsApp</span>
                </a>
              </div>

              {/* ACTION 4: REGISTRAR COBRO CON 1 CLIC */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#C8C4B7]/70 dark:border-[#282A33] space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] block">
                  Registrar Cobro / Estado de Pago:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'deposit_only');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'deposit_only' });
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'deposit_only'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs font-black'
                        : 'bg-[#FAF8F5] dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-[#2E303B]'
                    }`}
                  >
                    Seña 50%
                  </button>

                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'paid');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'paid' });
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'paid'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs font-black'
                        : 'bg-[#FAF8F5] dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-[#2E303B]'
                    }`}
                  >
                    100% Pagado
                  </button>

                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'pending');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'pending' });
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'pending'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs font-black'
                        : 'bg-[#FAF8F5] dark:bg-[#1C1E24] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-[#2E303B]'
                    }`}
                  >
                    Pendiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FIXED BOTTOM TAB BAR (HIGH Z-INDEX & NATIVE FEEL)                       */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5] dark:bg-[#0E0F12] border-t-2 border-[#C8C4B7] dark:border-[#282A33] py-2 px-2 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.18)] select-none">
        <button
          onClick={() => setMobileTab('today')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer ${
            mobileTab === 'today'
              ? 'text-[#E1500A] font-black scale-105'
              : 'text-[#71717A] dark:text-[#8E8E93] font-bold hover:text-[#18181B] dark:hover:text-white'
          }`}
        >
          <Sun className={`w-5 h-5 ${mobileTab === 'today' ? 'text-[#E1500A]' : ''}`} />
          <span className="text-[11px] leading-none">Hoy</span>
        </button>

        <button
          onClick={() => setMobileTab('units')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer ${
            mobileTab === 'units'
              ? 'text-[#E1500A] font-black scale-105'
              : 'text-[#71717A] dark:text-[#8E8E93] font-bold hover:text-[#18181B] dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${mobileTab === 'units' ? 'text-[#E1500A]' : ''}`} />
          <span className="text-[11px] leading-none">Cabañas</span>
        </button>

        <button
          onClick={() => setMobileTab('guests')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer ${
            mobileTab === 'guests'
              ? 'text-[#E1500A] font-black scale-105'
              : 'text-[#71717A] dark:text-[#8E8E93] font-bold hover:text-[#18181B] dark:hover:text-white'
          }`}
        >
          <Users className={`w-5 h-5 ${mobileTab === 'guests' ? 'text-[#E1500A]' : ''}`} />
          <span className="text-[11px] leading-none">Huéspedes</span>
        </button>

        <button
          onClick={() => setMobileTab('xenia')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer ${
            mobileTab === 'xenia'
              ? 'text-[#E1500A] font-black scale-105'
              : 'text-[#71717A] dark:text-[#8E8E93] font-bold hover:text-[#18181B] dark:hover:text-white'
          }`}
        >
          <Mic className={`w-5 h-5 ${mobileTab === 'xenia' ? 'text-[#E1500A]' : ''}`} />
          <span className="text-[11px] leading-none">Xenia Voz</span>
        </button>

        <button
          onClick={() => setMobileTab('more')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer ${
            mobileTab === 'more'
              ? 'text-[#E1500A] font-black scale-105'
              : 'text-[#71717A] dark:text-[#8E8E93] font-bold hover:text-[#18181B] dark:hover:text-white'
          }`}
        >
          <Zap className={`w-5 h-5 ${mobileTab === 'more' ? 'text-[#E1500A]' : ''}`} />
          <span className="text-[11px] leading-none">Atajos</span>
        </button>
      </nav>
    </div>
  );
};
