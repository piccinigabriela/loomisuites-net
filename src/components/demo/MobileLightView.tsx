import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Users,
  Home,
  CheckCircle2,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Search,
  Wifi,
  Laptop,
  X,
  ExternalLink,
  CreditCard,
  Send,
  Navigation,
  Square,
  UserCheck,
} from 'lucide-react';
import { DemoState, Reservation, Property, ReservationStatus, PaymentStatus } from '../../types';
import { formatDisplayDate } from '../../data/initialData';
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

function formatShortDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return '';
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const pIn = checkIn.split('-');
  const pOut = checkOut.split('-');
  if (pIn.length === 3 && pOut.length === 3) {
    const dIn = parseInt(pIn[2], 10);
    const mIn = parseInt(pIn[1], 10) - 1;
    const dOut = parseInt(pOut[2], 10);
    const mOut = parseInt(pOut[1], 10) - 1;
    if (mIn === mOut) {
      return `${dIn} al ${dOut} ${months[mIn] || ''}`;
    }
    return `${dIn} ${months[mIn] || ''} al ${dOut} ${months[mOut] || ''}`;
  }
  return `${checkIn} al ${checkOut}`;
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
  const [mobileTab, setMobileTab] = useState<'today' | 'units' | 'guests' | 'xenia' | 'more'>('guests');
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

  // Helper to build WhatsApp direct link
  const buildWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

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
    ? `¡Hola, ${selectedGuestAction.guestName.split(' ')[0]}! 🌲 Te confirmamos que tu reserva para la unidad ${selectedActionProperty?.name || 'tu alojamiento'} está registrada con éxito desde el ${formatDisplayDate(selectedGuestAction.checkIn)} hasta el ${formatDisplayDate(selectedGuestAction.checkOut)}.\nPara que tu llegada sea perfecta y sin demoras, te compartimos tu Guía Digital de Bienvenida exclusiva. Desde allí vas a poder ver el mapa interactivo con la ruta de acceso, las claves de Wi-Fi y completar tu registro de pasajeros digital:\n🔗 https://loomisuite.com/guia/${selectedGuestAction.propertyId}?huesped=${encodeURIComponent(selectedGuestAction.guestName.split(' ')[0])}\n¡Estamos felices de recibirte! Cualquier duda, estamos a un toque de distancia por acá.`
    : '';

  const wifiMessageText = selectedGuestAction
    ? `¡Hola ${selectedGuestAction.guestName}! Te dejamos los datos de conexión de ${selectedActionProperty?.name || 'tu cabaña'}:\n\n📶 *Red Wi-Fi:* ${selectedActionProperty?.wifiNetwork || 'CatalinasAptos'}\n🔑 *Clave:* ${selectedActionProperty?.wifiPassword || 'TresSargentos435'}\n📍 *Dirección:* ${selectedActionProperty?.address || 'Tres Sargentos 435, CABA'}\n\n¡Que tengas una hermosa estadía!`
    : '';

  return (
    <div className="min-h-screen bg-[#ECE7E0] dark:bg-[#111215] text-[#2D3748] dark:text-[#E2E8F0] font-sans antialiased pb-28 transition-colors">
      {/* ========================================================================= */}
      {/* 1. HEADER ZEN & OMOTENASHI (COPIA EXACTA DE LA IMAGEN)                    */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#ECE7E0]/95 dark:bg-[#111215]/95 backdrop-blur-md px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#DDD7CD]/50 dark:border-zinc-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#DDD7CD] dark:bg-zinc-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            L
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
              {complexName}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
              {capitalizedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Switch to Full / Desktop view */}
          <button
            onClick={onSwitchToFullView}
            className="w-9 h-9 rounded-xl bg-[#DDD7CD]/70 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-[#DDD7CD] transition-colors cursor-pointer"
            title="Cambiar a Vista Completa (Escritorio)"
          >
            <Laptop className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl bg-[#DDD7CD]/70 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-[#DDD7CD] transition-colors cursor-pointer"
            title="Cambiar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D86F35]" />
            ) : (
              <Moon className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (BY TAB)                                             */}
      {/* ========================================================================= */}
      <main className="p-4 max-w-md mx-auto space-y-4">
        {/* ======================================================================= */}
        {/* TAB 3: 👥 HUÉSPEDES (PANTALLA EXACTA COMO LA IMAGEN ENVIADA POR EL USUARIO)*/}
        {/* ======================================================================= */}
        {mobileTab === 'guests' && (
          <div className="space-y-3.5">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="Buscar por departamento, huésped o teléfono..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-[#1A1B20] border-0 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40"
              />
            </div>

            {/* Guest Cards */}
            <div className="space-y-3">
              {activeReservations
                .filter((r) => {
                  if (!guestSearch) return true;
                  const q = guestSearch.toLowerCase();
                  const prop = demoState.properties.find((p) => p.id === r.propertyId);
                  return (
                    r.guestName.toLowerCase().includes(q) ||
                    r.guestPhone.includes(q) ||
                    (prop && prop.name.toLowerCase().includes(q))
                  );
                })
                .slice(0, 15)
                .map((res) => {
                  const prop = demoState.properties.find((p) => p.id === res.propertyId);
                  const isPaid = res.paymentStatus === 'paid';

                  return (
                    <div
                      key={res.id}
                      className="bg-white dark:bg-[#1A1B20] rounded-[22px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.025)] border border-black/[0.02] dark:border-white/[0.04] space-y-2.5 transition-all"
                    >
                      {/* Top Row: Departamento y Fechas RESALTADOS on Left, Precio + Estado on Right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                            {prop?.name || 'Cabaña'}
                          </h3>
                          <span className="text-xs font-bold text-[#E67E22] dark:text-[#F39A68] whitespace-nowrap">
                            {formatShortDateRange(res.checkIn, res.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 font-sans">
                            USD {res.totalAmount.toLocaleString('es-AR')}
                          </span>
                          <span
                            className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                              isPaid
                                ? 'bg-[#E2F7E7] text-[#2EA44F] dark:bg-[#193A24] dark:text-[#52C474]'
                                : 'bg-[#FDF3E7] text-[#D86F35] dark:bg-[#3D2516] dark:text-[#F39A68]'
                            }`}
                          >
                            {isPaid ? 'PAGADO' : 'SEÑA PEND'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Nombre del Huésped más pequeño debajo on Left, 3 Botones de Acción on Right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                          <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                            {res.guestName}
                          </span>
                          <span className="text-gray-300 dark:text-zinc-600">•</span>
                          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">
                            {res.guestPhone}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Button 1: WhatsApp (Soft Pastel Green Square) */}
                          <button
                            onClick={() => setSelectedGuestAction(res)}
                            className="w-9 h-9 rounded-xl bg-[#E6F8EA] hover:bg-[#D4F5DC] dark:bg-[#1C3B24] dark:hover:bg-[#254C2E] text-[#25D366] flex items-center justify-center transition-colors cursor-pointer"
                            title="Enviar WhatsApp & Guía"
                          >
                            <MessageCircle className="w-4 h-4 fill-current/10 stroke-[2]" />
                          </button>

                          {/* Button 2: Call Phone (Soft Warm Beige/Gray Square) */}
                          <a
                            href={`tel:${res.guestPhone}`}
                            className="w-9 h-9 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] dark:bg-[#2A2B32] dark:hover:bg-[#34353E] text-[#7A7369] dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                            title="Llamar al pasajero"
                          >
                            <Phone className="w-4 h-4 stroke-[2]" />
                          </a>

                          {/* Button 3: Ficha / Detalle (Soft Pastel Terracotta/Peach Square with Arrow) */}
                          <button
                            onClick={() => onOpenReservationDetail(res)}
                            className="w-9 h-9 rounded-xl bg-[#F6D8C3] hover:bg-[#F0C9B0] dark:bg-[#3E281C] dark:hover:bg-[#4E3324] text-[#D86F35] flex items-center justify-center transition-colors cursor-pointer"
                            title="Ver Ficha Completa"
                          >
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 1: ☀️ HOY (VISTA EN VIVO ADAPTADA A LA MISMA ESTÉTICA)              */}
        {/* ======================================================================= */}
        {mobileTab === 'today' && (
          <div className="space-y-4">
            {/* 3 ATAJOS SUPERIORES */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onOpenNewReservation}
                className="bg-white dark:bg-[#1A1B20] p-4 rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-black/[0.02] flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 bg-[#F6D8C3] text-[#D86F35] rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Reserva</span>
              </button>

              <button
                onClick={() => setMobileTab('guests')}
                className="bg-white dark:bg-[#1A1B20] p-4 rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-black/[0.02] flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 bg-[#E6F8EA] text-[#25D366] rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">WhatsApp</span>
              </button>

              <button
                onClick={() => setMobileTab('more')}
                className="bg-white dark:bg-[#1A1B20] p-4 rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-black/[0.02] flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 bg-[#EDE8E1] text-[#7A7369] rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Más Atajos</span>
              </button>
            </div>

            {/* OCUPACIÓN ACTUAL */}
            <div className="bg-white dark:bg-[#1A1B20] rounded-[22px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-black/[0.02] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Ocupación Actual
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {occupancyPercent}%
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    ({occupiedCount} de {totalUnits} unidades ocupadas)
                  </span>
                </div>
              </div>
              <span className="bg-[#FDF3E7] text-[#D86F35] text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                En vivo
              </span>
            </div>

            {/* LIMPIEZAS DEL DÍA */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D86F35]" />
                  LIMPIEZAS DEL DÍA ({demoState.cleaningTasks.length})
                </h2>
              </div>

              {demoState.cleaningTasks.map((task) => {
                const prop = demoState.properties.find((p) => p.id === task.propertyId);
                const isCompleted =
                  task.status === 'completed' ||
                  task.status === 'inspected' ||
                  (task.checklist.length > 0 && task.checklist.every((c) => c.completed));

                return (
                  <div
                    key={task.id}
                    className={`rounded-[22px] p-4 border transition-all duration-500 ease-in-out flex items-center justify-between ${
                      isCompleted
                        ? 'bg-green-50/30 dark:bg-emerald-950/20 border-green-200/50 dark:border-emerald-800/40 shadow-[0_4px_16px_rgba(16,185,129,0.03)]'
                        : 'bg-white dark:bg-[#1A1B20] border-black/[0.02] shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-bold tracking-tight transition-all duration-500 ${
                            isCompleted
                              ? 'text-stone-400 dark:text-stone-500 line-through decoration-emerald-400/50 opacity-75'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {prop?.name || 'Cabaña'}
                        </h3>
                        {isCompleted && (
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 px-2 py-0.5 rounded-full transition-all animate-in fade-in duration-300">
                            Tarea Completada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        {isCompleted ? `Lista por ${task.cleanerName}` : `Asignada a: ${task.cleanerName} • ${task.scheduledTime}`}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleCleaningStatus(task.id, task.status)}
                      title={isCompleted ? 'Desmarcar tarea' : 'Marcar como Tarea Completada'}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                        isCompleted
                          ? 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50 shadow-xs'
                          : 'bg-stone-50 hover:bg-emerald-50/60 text-stone-400 hover:text-emerald-600 border-stone-200/60'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* LLEGAN HOY */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D86F35]" />
                  LLEGAN HOY ({checkInsToday.length})
                </h2>
              </div>

              {checkInsToday.map((res) => {
                const prop = demoState.properties.find((p) => p.id === res.propertyId);

                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-[#1A1B20] rounded-[22px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-black/[0.02] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                          {prop?.name || 'Cabaña'}
                        </h3>
                        <span className="text-xs font-bold text-[#E67E22] dark:text-[#F39A68] whitespace-nowrap">
                          {res.nights} {res.nights === 1 ? 'noche' : 'noches'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-[#FDF3E7] text-[#D86F35] shrink-0">
                        Check-in 14hs
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {res.guestName}
                        </span>
                        <span className="text-gray-300 dark:text-zinc-600">•</span>
                        <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">
                          {res.guestPhone}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedGuestAction(res)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#D86F35] bg-[#F6D8C3] hover:bg-[#F0C9B0] px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Bienvenida</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: 🏡 CABAÑAS / UNIDADES (ADAPTADA A LA MISMA ESTÉTICA)             */}
        {/* ======================================================================= */}
        {mobileTab === 'units' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D86F35]" />
                UNIDADES ({demoState.properties.length})
              </h2>
            </div>

            {demoState.properties.map((prop) => {
              const currentRes = currentlyStaying.find((r) => r.propertyId === prop.id);
              const isOccupied = !!currentRes;

              return (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-[#1A1B20] rounded-[22px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.025)] border border-black/[0.02] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {prop.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        {prop.type} • Hasta {prop.maxGuests} pax
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                        isOccupied
                          ? 'bg-[#FDF3E7] text-[#D86F35]'
                          : 'bg-[#EDE8E1] text-[#7A7369]'
                      }`}
                    >
                      {isOccupied ? 'OCUPADA' : 'DISPONIBLE'}
                    </span>
                  </div>

                  {isOccupied && currentRes && (
                    <div className="p-3 bg-[#FBF9F6] dark:bg-[#16171B] rounded-xl flex items-center justify-between border border-black/[0.02]">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 font-medium">Huésped actual</span>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {currentRes.guestName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Salida: {formatDisplayDate(currentRes.checkOut)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedGuestAction(currentRes)}
                        className="w-9 h-9 rounded-xl bg-[#E6F8EA] text-[#25D366] flex items-center justify-center cursor-pointer"
                        title="Contactar"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-gray-300" />
                      <span className="font-mono text-gray-500">{prop.wifiNetwork}</span>
                    </div>
                    <button
                      onClick={() => handleCopyWifi(prop.wifiPassword, prop.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#EDE8E1] text-[#7A7369] font-medium text-[11px] hover:text-[#D86F35] transition-colors cursor-pointer"
                    >
                      {copiedWifi === prop.id ? '¡Copiada!' : 'Copiar Clave'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: 🎙️ XENIA VOZ                                                     */}
        {/* ======================================================================= */}
        {mobileTab === 'xenia' && (
          <div className="space-y-4">
            {isSpeaking && (
              <button
                onClick={handleStopXenia}
                className="w-full p-3.5 rounded-2xl bg-red-100 text-red-700 font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 fill-current shrink-0" />
                  <span>Xenia respondiendo... <strong>Tocá para silenciar</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-red-200 text-[10px] font-mono">⏹️ PARAR</span>
              </button>
            )}

            <div className="p-6 rounded-[24px] bg-white dark:bg-[#1A1B20] shadow-[0_4px_16px_rgba(0,0,0,0.025)] border border-black/[0.02] text-center space-y-4 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <button
                  onClick={toggleAutoVoice}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    autoVoice
                      ? 'bg-[#FDF3E7] border-orange-200 text-[#D86F35]'
                      : 'bg-[#EDE8E1] border-gray-200 text-gray-500'
                  }`}
                >
                  {autoVoice ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>{autoVoice ? 'Voz ON' : 'Voz Mute'}</span>
                </button>
              </div>

              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#F6D8C3] p-0.5 shadow-sm">
                <XeniaAvatar size="lg" className="w-full h-full rounded-full" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Xenia Copiloto por Voz
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Consultas sobre reservas, números y tareas
                </p>
              </div>

              <div className="flex items-center justify-center pt-1">
                {isSpeaking ? (
                  <button
                    onClick={handleStopXenia}
                    className="w-16 h-16 rounded-2xl bg-red-500 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Square className="w-6 h-6 fill-white" />
                    <span className="text-[9px] font-bold mt-1">Parar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (isListening) stopListening();
                      else startListening();
                    }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#D86F35] text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
                Preguntas Sugeridas:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  '¿Cómo se envía la bienvenida y guía digital al huésped?',
                  '¿Cómo paso del Modo Light a la Vista Completa (PC)?',
                  '¿Quién llega hoy y qué cabañas se ocupan?',
                  '¿Cuál es mi ganancia en octubre y comisiones?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendXenia(q)}
                    className="p-3 rounded-2xl bg-white dark:bg-[#1A1B20] text-xs font-semibold text-left text-gray-800 dark:text-gray-200 shadow-2xs hover:text-[#D86F35] flex items-center justify-between cursor-pointer"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 5: ⚡ ATAJOS                                                        */}
        {/* ======================================================================= */}
        {mobileTab === 'more' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D86F35]" />
                ATAJOS OPERATIVOS
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={onOpenNewReservation}
                className="w-full p-4 rounded-[22px] bg-white dark:bg-[#1A1B20] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.02)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6D8C3] text-[#D86F35] flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Cargar Nueva Reserva</p>
                    <p className="text-xs text-gray-400 font-medium">Reserva manual, telefónica o directa</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={() => setMobileTab('guests')}
                className="w-full p-4 rounded-[22px] bg-white dark:bg-[#1A1B20] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.02)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F8EA] text-[#25D366] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Directorio de Huéspedes</p>
                    <p className="text-xs text-gray-400 font-medium">WhatsApp, bienvenida y cobros</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={() => setMobileTab('units')}
                className="w-full p-4 rounded-[22px] bg-white dark:bg-[#1A1B20] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.02)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8E1] text-[#7A7369] flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Estado de Cabañas & Wi-Fi</p>
                    <p className="text-xs text-gray-400 font-medium">Ver disponibilidad y claves</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={onSwitchToFullView}
                className="w-full p-4 rounded-[22px] bg-white dark:bg-[#1A1B20] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.02)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6D8C3] text-[#D86F35] flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Cambiar a Vista Completa (PC)</p>
                    <p className="text-xs text-gray-400 font-medium">Calendario Rack y finanzas</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#D86F35]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL DE ACCIONES RÁPIDAS (WHATSAPP, SEÑA, GUÍA)                       */}
      {/* ========================================================================= */}
      {selectedGuestAction && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#1A1B20] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D86F35] block">
                  Acciones Rápidas
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
                    {selectedActionProperty?.name || 'Cabaña'}
                  </h3>
                  <span className="text-xs font-bold text-[#E67E22] dark:text-[#F39A68] whitespace-nowrap">
                    {formatShortDateRange(selectedGuestAction.checkIn, selectedGuestAction.checkOut)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Huésped: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedGuestAction.guestName}</span> ({selectedGuestAction.guestPhone})
                </p>
              </div>

              <button
                onClick={() => setSelectedGuestAction(null)}
                className="p-2 rounded-full bg-[#EDE8E1] text-[#7A7369] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* ACCIÓN 1: SOLICITAR SEÑA */}
              <div className="p-4 rounded-2xl bg-[#FDF3E7]/60 dark:bg-[#251D17] border border-orange-100/60 dark:border-orange-900/30 space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D86F35]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">1. Solicitar Seña (50%)</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Envía CBU/Alias y sugerencia de seña ({depositAmount} USD)
                </p>
                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, paymentMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F6D8C3] hover:bg-[#F0C9B0] text-[#D86F35] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Seña por WhatsApp</span>
                </a>
              </div>

              {/* ACCIÓN 2: ENVIAR BIENVENIDA Y GUÍA DIGITAL */}
              <div className="p-4 rounded-2xl bg-[#E6F8EA]/60 dark:bg-[#16291C] border border-green-100/60 dark:border-green-900/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#25D366]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">2. Enviar Bienvenida & Guía Digital</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Incluye mapa GPS interactivo, fotos de acceso y Wi-Fi
                </p>
                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, welcomeMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E6F8EA] hover:bg-[#D4F5DC] text-[#2EA44F] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Guía por WhatsApp</span>
                </a>
              </div>

              {/* ACCIÓN 3: ENVIAR WI-FI */}
              <div className="p-4 rounded-2xl bg-[#EDE8E1]/60 dark:bg-[#202128] border border-gray-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#7A7369]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">3. Enviar Clave Wi-Fi</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Red: {selectedActionProperty?.wifiNetwork}
                </p>
                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, wifiMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] text-[#7A7369] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Enviar Wi-Fi por WhatsApp</span>
                </a>
              </div>

              {/* ACCIÓN 4: ESTADO DE PAGO */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1B20] border border-gray-100 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Registrar Cobro:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'deposit_only');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'deposit_only' });
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'deposit_only'
                        ? 'bg-[#FDF3E7] border-orange-200 text-[#D86F35]'
                        : 'bg-[#EDE8E1] border-transparent text-[#7A7369]'
                    }`}
                  >
                    Seña 50%
                  </button>

                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'paid');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'paid' });
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'paid'
                        ? 'bg-[#E2F7E7] border-green-200 text-[#2EA44F]'
                        : 'bg-[#EDE8E1] border-transparent text-[#7A7369]'
                    }`}
                  >
                    100% Pago
                  </button>

                  <button
                    onClick={() => {
                      onUpdatePaymentStatus?.(selectedGuestAction.id, 'pending');
                      setSelectedGuestAction({ ...selectedGuestAction, paymentStatus: 'pending' });
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedGuestAction.paymentStatus === 'pending'
                        ? 'bg-[#FDF3E7] border-orange-200 text-[#D86F35]'
                        : 'bg-[#EDE8E1] border-transparent text-[#7A7369]'
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
      {/* 4. FIXED BOTTOM TAB BAR (COPIA EXACTA DE LA IMAGEN)                        */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#15161A] border-t border-black/[0.04] dark:border-white/[0.06] py-2 px-3 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none">
        <button
          onClick={() => setMobileTab('today')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
            mobileTab === 'today'
              ? 'text-[#C97B51] font-bold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Sun className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-none">Hoy</span>
        </button>

        <button
          onClick={() => setMobileTab('units')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
            mobileTab === 'units'
              ? 'text-[#C97B51] font-bold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-none">Cabañas</span>
        </button>

        <button
          onClick={() => setMobileTab('guests')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
            mobileTab === 'guests'
              ? 'text-[#C97B51] font-bold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <div className="w-5 h-5 rounded-full border-[1.8px] border-current flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full border-[1.8px] border-current -mb-0.5" />
          </div>
          <span className="text-[11px] leading-none">Huéspedes</span>
        </button>

        <button
          onClick={() => setMobileTab('xenia')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
            mobileTab === 'xenia'
              ? 'text-[#C97B51] font-bold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Mic className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-none">Xenia Voz</span>
        </button>

        <button
          onClick={() => setMobileTab('more')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
            mobileTab === 'more'
              ? 'text-[#C97B51] font-bold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Zap className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-none">Atajos</span>
        </button>
      </nav>
    </div>
  );
};
