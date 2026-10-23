import React, { useState, useRef, useEffect } from 'react';
import { normalizeWhatsAppPhone } from '../../lib/teamNotices';
import {
  Sun,
  Moon,
  Users,
  Home,
  MessageCircle,
  Plus,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wifi,
  Laptop,
  X,
  ExternalLink,
  CreditCard,
  Send,
  Navigation,
  Square,
  LogOut,
} from 'lucide-react';
import { DemoState, Reservation, ReservationStatus, PaymentStatus, Reminder } from '../../types';
import { formatDisplayDate, formatCurrency, toLocalDateStr } from '../../data/initialData';
import { XeniaAvatar } from '../xenia/XeniaAvatar';
import { auth } from '../../lib/firebase';
import { useXeniaVoice } from '../../hooks/useXeniaVoice';
import { getClientXeniaReply } from '../xenia/xeniaLocalEngine';
import { getApiUrl } from '../../utils/apiConfig';
import { DemoCalendar } from './DemoCalendar';
import { AgendaTab, AgendaView } from './mobile/AgendaTab';
import { formatShortDateRange } from './mobile/helpers';
import { isOverdue } from '../../lib/reminders';
import { PaymentSettingsSheet } from './mobile/PaymentSettingsSheet';
import {
  availableMethods,
  composePaymentMessage,
  PAY_METHOD_LABEL,
  type PayMethod,
  type PaymentSettings,
} from './mobile/paymentMessage';

type MobileTab = 'agenda' | 'calendar' | 'avisos' | 'xenia' | 'more' | 'units';

interface MobileLightViewProps {
  demoState: DemoState;
  onOpenReservationDetail: (res: Reservation) => void;
  onOpenNewReservation: () => void;
  onUpdateReservationStatus: (resId: string, status: ReservationStatus) => void;
  onUpdatePaymentStatus?: (resId: string, status: PaymentStatus) => void;
  onToggleCleaningStatus: (taskId: string, currentStatus: string) => void;
  onOpenMessagesWithGuest: (resId: string) => void;
  onSwitchToFullView: () => void;
  /** Mi plan (abono de Loomi): solo el dueño en la app real */
  onOpenMyPlan?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  complexName: string;
  onLogout?: () => void;
  isAppMode?: boolean;
  onBackToLanding?: () => void;
  userRole?: 'admin' | 'frontdesk' | 'housekeeping';
  onSwitchRole?: (role: 'admin' | 'frontdesk' | 'housekeeping') => void;
  /** Recordatorios de la Agenda y cómo guardarlos / borrarlos */
  reminders: Reminder[];
  onSaveReminder: (r: Reminder) => Promise<void> | void;
  onDeleteReminder: (id: string) => Promise<void> | void;
  /** Datos de cobro (CBU, alias, Mercado Pago, PayPal, Payoneer) que se guardan en la guía del complejo */
  onSavePaymentSettings: (fields: Partial<PaymentSettings>) => Promise<void> | void;
  /** Calendario: tocar un día libre abre nueva reserva con esa unidad y fecha */
  onOpenNewReservationWithProperty?: (propertyId: string, date: string) => void;
  onOpenImportModal?: () => void;
  icalSyncState?: React.ComponentProps<typeof DemoCalendar>['icalSyncState'];
  onRunSyncNow?: () => Promise<any>;
  /** Pantalla "Avisos al equipo" (plan Propietario); si no viene, la pestaña lo explica */
  teamNoticesNode?: React.ReactNode;
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
  onOpenMyPlan,
  theme,
  onToggleTheme,
  complexName,
  onLogout,
  isAppMode = false,
  onBackToLanding,
  userRole = 'admin',
  onSwitchRole,
  reminders,
  onSaveReminder,
  onDeleteReminder,
  onSavePaymentSettings,
  onOpenNewReservationWithProperty,
  onOpenImportModal,
  icalSyncState,
  onRunSyncNow,
  teamNoticesNode,
}) => {
  // Pestañas: Agenda · Calendario · Avisos · Xenia · Más ("units" se abre desde Más)
  const [mobileTab, setMobileTab] = useState<MobileTab>('agenda');
  const [agendaView, setAgendaView] = useState<AgendaView>('day');
  const [copiedWifi, setCopiedWifi] = useState<string | null>(null);
  // Cobro: hoja de datos, métodos que se dejan afuera del mensaje y texto editado a mano
  const [paySheetOpen, setPaySheetOpen] = useState(false);
  const [payMethodsOff, setPayMethodsOff] = useState<PayMethod[]>([]);
  const [payTextOverride, setPayTextOverride] = useState<string | null>(null);
  const [copiedPayText, setCopiedPayText] = useState(false);

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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // con 1,2 s siempre contestaba el motor local

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

  // Fechas de hoy
  const todayStr = toLocalDateStr(new Date());
  const activeReservations = demoState.reservations.filter((r) => r.status !== 'cancelled');
  const currentlyStaying = activeReservations.filter((r) => r.checkIn <= todayStr && r.checkOut > todayStr);
  const overdueRemindersCount = reminders.filter((r) => isOverdue(r, todayStr)).length;

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
    const cleanPhone = normalizeWhatsAppPhone(phone);
    const encoded = encodeURIComponent(text);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  };

  const selectedActionProperty = selectedGuestAction
    ? demoState.properties.find((p) => p.id === selectedGuestAction.propertyId)
    : undefined;

  // Saldo real: total menos los pagos registrados (sin porcentajes ni datos bancarios inventados)
  const paidSoFar = selectedGuestAction
    ? (selectedGuestAction.payments || []).reduce((s, p) => s + (p.amountSettlement || 0), 0) ||
      (selectedGuestAction.paymentStatus === 'paid' ? selectedGuestAction.totalAmount : 0)
    : 0;
  const depositAmount = selectedGuestAction ? Math.max(0, (selectedGuestAction.totalAmount || 0) - paidSoFar) : 0;
  const guideUid = isAppMode ? auth?.currentUser?.uid : undefined;
  const guideLink = selectedGuestAction
    ? guideUid
      ? `${window.location.origin}/guia/${guideUid}/${selectedGuestAction.propertyId}?huesped=${encodeURIComponent(selectedGuestAction.guestName.split(' ')[0])}&res=${encodeURIComponent(selectedGuestAction.id)}`
      : `${window.location.origin}/guia/${selectedGuestAction.propertyId}?huesped=${encodeURIComponent(selectedGuestAction.guestName.split(' ')[0])}`
    : '';

  // Pre-formatted messages for 1-tap mobile sending
  const paymentSettings = demoState.welcomeGuide?.directBookingSettings;
  const payMethodsAvailable = availableMethods(paymentSettings);
  const payMethodsOn = payMethodsAvailable.filter((m) => !payMethodsOff.includes(m));
  const composedPaymentText = selectedGuestAction
    ? composePaymentMessage({
        guestFirstName: selectedGuestAction.guestName.split(' ')[0],
        complexName,
        unitName: selectedActionProperty?.name || 'la unidad',
        dates: `${formatDisplayDate(selectedGuestAction.checkIn)} al ${formatDisplayDate(selectedGuestAction.checkOut)}`,
        balanceText: depositAmount > 0 ? formatCurrency(depositAmount) : undefined,
        methods: payMethodsOn,
        settings: paymentSettings,
      })
    : '';
  const paymentMessageText = payTextOverride ?? composedPaymentText;

  // Al abrir otra reserva se vuelve al mensaje armado solo
  useEffect(() => {
    setPayMethodsOff([]);
    setPayTextOverride(null);
    setCopiedPayText(false);
  }, [selectedGuestAction?.id]);

  const welcomeMessageText = selectedGuestAction
    ? `¡Hola, ${selectedGuestAction.guestName.split(' ')[0]}! 🌲 Te confirmamos que tu reserva para la unidad ${selectedActionProperty?.name || 'tu cabaña'} está registrada con éxito desde el ${formatDisplayDate(selectedGuestAction.checkIn)} hasta el ${formatDisplayDate(selectedGuestAction.checkOut)}.\nPara que tu llegada sea fácil, te compartimos tu guía digital: cómo llegar, Wi-Fi, horarios y contacto.\n🔗 ${guideLink}\n¡Estamos felices de recibirte! Cualquier duda, estamos a un toque de distancia por acá.`
    : '';

  const wifiMessageText = selectedGuestAction
    ? `¡Hola ${selectedGuestAction.guestName}! Te dejamos los datos de conexión de ${selectedActionProperty?.name || 'tu cabaña'}:\n\n📶 *Red Wi-Fi:* ${selectedActionProperty?.wifiNetwork || '(a confirmar)'}\n🔑 *Clave:* ${selectedActionProperty?.wifiPassword || '(a confirmar)'}\n📍 *Dirección:* ${selectedActionProperty?.address || '(a confirmar)'}\n\n¡Que tengas una hermosa estadía!`
    : '';

  return (
    <div className="min-h-screen bg-[#ECE7E0] dark:bg-[#111215] text-[#2D3748] dark:text-[#E2E8F0] font-sans antialiased pb-28 transition-colors">
      {/* ========================================================================= */}
      {/* 1. HEADER ZEN & OMOTENASHI (COPIA EXACTA DE LA IMAGEN)                    */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#ECE7E0]/95 dark:bg-[#111215]/95 backdrop-blur-md px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#DDD7CD]/50 dark:border-zinc-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
              {complexName}
            </h1>
            <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold truncate">
              {capitalizedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {/* Botón "← Inicio" solo en demo y cuando !isAppMode */}
          {!isAppMode && onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-2.5 py-1.5 rounded-xl bg-[#DDD7CD]/70 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-[#DDD7CD] transition-colors cursor-pointer flex items-center gap-1"
              title="Volver a la landing"
              aria-label="Volver a la landing"
            >
              ←
            </button>
          )}

          {/* Selector chico de rol (Dueño / Recepción / Mucamas) */}
          {onSwitchRole && (
            <select
              value={userRole}
              onChange={(e) => onSwitchRole(e.target.value as 'admin' | 'frontdesk' | 'housekeeping')}
              className="px-2 py-1.5 rounded-xl bg-[#DDD7CD]/70 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-semibold border-0 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              title="Cambiar Rol"
            >
              <option value="admin">👑 Administración</option>
              <option value="frontdesk">🛎️ Recepción</option>
              <option value="housekeeping">🧹 Limpieza</option>
            </select>
          )}

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
              <Sun className="w-4 h-4 text-[#FFB27F]" />
            ) : (
              <Moon className="w-4 h-4 text-gray-700" />
            )}
          </button>

          {/* Logout in App mode */}
          {isAppMode && onLogout && (
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (BY TAB)                                             */}
      {/* ========================================================================= */}
      <main className="p-4 max-w-md mx-auto space-y-4">
        {/* ======================================================================= */}
        {/* 📅 AGENDA: buscador, Por día / Lista, alojados ahora y recordatorios     */}
        {/* ======================================================================= */}
        {mobileTab === 'agenda' && (
          <AgendaTab
            demoState={demoState}
            reminders={reminders}
            todayStr={todayStr}
            view={agendaView}
            onChangeView={setAgendaView}
            onOpenWhatsApp={setSelectedGuestAction}
            onOpenReservationDetail={onOpenReservationDetail}
            onToggleCleaningStatus={onToggleCleaningStatus}
            onSaveReminder={onSaveReminder}
            onDeleteReminder={onDeleteReminder}
          />
        )}

        {/* ======================================================================= */}
        {/* 🗓️ CALENDARIO: el mismo calendario de la app, ya compactado para celular */}
        {/* ======================================================================= */}
        {mobileTab === 'calendar' && (
          <DemoCalendar
            demoState={demoState}
            onSelectReservation={onOpenReservationDetail}
            onOpenNewReservationWithProperty={onOpenNewReservationWithProperty}
            onOpenImportModal={onOpenImportModal}
            isAppMode={isAppMode}
            icalSyncState={icalSyncState}
            onRunSyncNow={onRunSyncNow}
          />
        )}

        {/* ======================================================================= */}
        {/* 🏡 ESTADO DE CABAÑAS & WI-FI (se abre desde "Más")                      */}
        {/* ======================================================================= */}
        {mobileTab === 'units' && (
          <div className="space-y-3.5">
            <button
              onClick={() => setMobileTab('more')}
              className="px-3.5 py-2.5 rounded-xl bg-[#DDD7CD] dark:bg-zinc-800 text-stone-900 dark:text-gray-100 text-sm font-extrabold cursor-pointer"
            >
              ← Volver a Más
            </button>
            <h2 className="px-1 text-base font-extrabold text-stone-900 dark:text-white">Unidades ({demoState.properties.length})</h2>

            {demoState.properties.map((prop) => {
              const currentRes = currentlyStaying.find((r) => r.propertyId === prop.id);
              const isOccupied = !!currentRes;

              return (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-[#1A1B20] border border-stone-300/80 dark:border-white/10 rounded-[22px] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-gray-100 tracking-tight">{prop.name}</h3>
                      <p className="text-xs font-semibold text-stone-800 dark:text-gray-200">
                        {prop.type} • Hasta {prop.maxGuests} pax
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold tracking-wider px-2 py-1 rounded-md uppercase ${
                        isOccupied
                          ? 'bg-[#FBE3CB] text-[#7A3306] dark:bg-[#3D2516] dark:text-[#FFB27F]'
                          : 'bg-[#D3F1DB] text-[#0F5C2F] dark:bg-[#193A24] dark:text-[#7BE59A]'
                      }`}
                    >
                      {isOccupied ? 'Ocupada' : 'Disponible'}
                    </span>
                  </div>

                  {isOccupied && currentRes && (
                    <div className="p-3 bg-[#F4EFE8] dark:bg-[#16171B] rounded-xl flex items-center justify-between border border-stone-300/70 dark:border-white/10">
                      <div className="space-y-0.5">
                        <span className="text-xs text-stone-800 dark:text-gray-200 font-bold">Huésped actual</span>
                        <p className="text-sm font-extrabold text-stone-900 dark:text-gray-100">{currentRes.guestName}</p>
                        <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold">
                          Salida: {formatDisplayDate(currentRes.checkOut)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedGuestAction(currentRes)}
                        aria-label={`Contactar a ${currentRes.guestName}`}
                        className="w-10 h-10 rounded-xl bg-[#D4F2DC] dark:bg-[#1C3B24] text-[#136B36] dark:text-[#6EE08F] flex items-center justify-center cursor-pointer"
                        title="Contactar"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-300/70 dark:border-zinc-700 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wifi className="w-4 h-4 text-stone-800 dark:text-gray-200 shrink-0" />
                      <span className="font-mono font-semibold text-stone-900 dark:text-gray-100 truncate">{prop.wifiNetwork}</span>
                    </div>
                    <button
                      onClick={() => handleCopyWifi(prop.wifiPassword, prop.id)}
                      className="px-3 py-2 rounded-lg bg-[#E4DDD1] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 font-bold text-xs cursor-pointer shrink-0"
                    >
                      {copiedWifi === prop.id ? '¡Copiada!' : 'Copiar clave'}
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
                      ? 'bg-[#FBE3CB] border-orange-400 text-[#7A3306] dark:bg-[#3D2516] dark:border-[#FFB27F]/60 dark:text-[#FFB27F]'
                      : 'bg-[#E4DDD1] border-stone-400 text-stone-900 dark:bg-zinc-700 dark:border-zinc-500 dark:text-gray-100'
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
                <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold">
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
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-gray-100 block px-1">
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
                    <ArrowRight className="w-4 h-4 text-stone-800 dark:text-gray-300 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 🔔 AVISOS AL EQUIPO                                                     */}
        {/* ======================================================================= */}
        {mobileTab === 'avisos' &&
          (teamNoticesNode ? (
            <div className="space-y-3.5">{teamNoticesNode}</div>
          ) : (
            <div className="bg-white dark:bg-[#1A1B20] border border-stone-300/80 dark:border-white/10 rounded-[22px] p-5 space-y-2">
              <h2 className="text-base font-extrabold text-stone-900 dark:text-gray-100">🔔 Avisos al equipo</h2>
              <p className="text-sm font-semibold text-stone-900 dark:text-gray-100">
                Esta pantalla no está disponible en tu plan.
              </p>
            </div>
          ))}

        {/* ======================================================================= */}
        {/* ⋯ MÁS                                                                    */}
        {/* ======================================================================= */}
        {mobileTab === 'more' && (
          <div className="space-y-3.5">
            <h2 className="px-1 text-base font-extrabold text-stone-900 dark:text-white">Más</h2>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  key: 'new',
                  onClick: onOpenNewReservation,
                  icon: <Plus className="w-5 h-5" />,
                  tone: 'bg-[#F6D2B8] text-[#8F3B08] dark:bg-[#3E281C] dark:text-[#FFB27F]',
                  title: 'Cargar nueva reserva',
                  sub: 'Reserva manual, telefónica o directa',
                },
                {
                  key: 'guests',
                  onClick: () => {
                    setAgendaView('list');
                    setMobileTab('agenda');
                  },
                  icon: <Users className="w-5 h-5" />,
                  tone: 'bg-[#D4F2DC] text-[#136B36] dark:bg-[#1C3B24] dark:text-[#6EE08F]',
                  title: 'Directorio de huéspedes',
                  sub: 'WhatsApp, bienvenida y cobros',
                },
                {
                  key: 'units',
                  onClick: () => setMobileTab('units'),
                  icon: <Home className="w-5 h-5" />,
                  tone: 'bg-[#E4DDD1] text-[#3A352D] dark:bg-zinc-700 dark:text-gray-100',
                  title: 'Estado de cabañas & Wi-Fi',
                  sub: 'Ver disponibilidad y claves',
                },
                ...(onOpenMyPlan
                  ? [
                      {
                        key: 'myplan',
                        onClick: onOpenMyPlan,
                        icon: <CreditCard className="w-5 h-5" />,
                        tone: 'bg-[#E4DDD1] text-[#3A352D] dark:bg-zinc-700 dark:text-gray-100',
                        title: 'Mi plan de Loomi',
                        sub: 'Vencimiento y cómo pagar',
                      },
                    ]
                  : []),
                {
                  key: 'pay',
                  onClick: () => setPaySheetOpen(true),
                  icon: <CreditCard className="w-5 h-5" />,
                  tone: 'bg-[#FBE3CB] text-[#7A3306] dark:bg-[#3D2516] dark:text-[#FFB27F]',
                  title: 'Datos de cobro',
                  sub: 'CBU, alias, Mercado Pago, PayPal y Payoneer',
                },
                {
                  key: 'full',
                  onClick: onSwitchToFullView,
                  icon: <Laptop className="w-5 h-5" />,
                  tone: 'bg-[#F6D2B8] text-[#8F3B08] dark:bg-[#3E281C] dark:text-[#FFB27F]',
                  title: 'Cambiar a vista completa (PC)',
                  sub: 'Calendario Rack y finanzas',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className="w-full p-4 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-stone-300/80 dark:border-white/10 flex items-center justify-between active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.tone}`}>{item.icon}</div>
                    <div className="text-left min-w-0">
                      <p className="font-extrabold text-sm text-stone-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-xs font-semibold text-stone-800 dark:text-gray-200">{item.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-900 dark:text-gray-100 shrink-0" />
                </button>
              ))}
            </div>

            {isAppMode && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full mt-2 min-h-[52px] rounded-[22px] border-2 border-rose-600 dark:border-rose-400 text-rose-700 dark:text-rose-300 text-[15px] font-extrabold flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </button>
            )}
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8F3B08] dark:text-[#FFB27F] block">
                  Acciones Rápidas
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
                    {selectedActionProperty?.name || 'Cabaña'}
                  </h3>
                  <span className="text-xs font-bold text-[#8F3B08] dark:text-[#FFB27F] whitespace-nowrap">
                    {formatShortDateRange(selectedGuestAction.checkIn, selectedGuestAction.checkOut)}
                  </span>
                </div>
                <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold mt-0.5">
                  Huésped: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedGuestAction.guestName}</span> ({selectedGuestAction.guestPhone})
                </p>
              </div>

              <button
                onClick={() => setSelectedGuestAction(null)}
                aria-label="Cerrar"
                className="p-2.5 rounded-full bg-[#E4DDD1] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* ACCIÓN 1: PEDIR PAGO / SALDO (CBU, Mercado Pago, PayPal, Payoneer) */}
              <div className="p-4 rounded-2xl bg-[#FDF3E7]/60 dark:bg-[#251D17] border border-orange-200 dark:border-orange-900/40 space-y-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8F3B08] dark:text-[#FFB27F]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">1. Pedir pago / saldo</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold">
                  {depositAmount > 0 ? `Saldo pendiente: ${formatCurrency(depositAmount)}.` : 'No figura saldo pendiente.'}{' '}
                  {payMethodsAvailable.length > 0 ? 'Elegí cómo cobrar y revisá el mensaje antes de enviarlo.' : ''}
                </p>

                {payMethodsAvailable.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-900 dark:text-gray-100">
                      Todavía no cargaste datos de cobro (CBU, alias, Mercado Pago, PayPal o Payoneer).
                    </p>
                    <button
                      onClick={() => setPaySheetOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 text-xs font-extrabold cursor-pointer"
                    >
                      Cargar datos de cobro
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Métodos de pago a incluir">
                      {payMethodsAvailable.map((m) => {
                        const on = !payMethodsOff.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setPayTextOverride(null);
                              setPayMethodsOff((prev) => (on ? [...prev, m] : prev.filter((x) => x !== m)));
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                              on
                                ? 'bg-stone-900 text-white border-stone-900 dark:bg-[#FFB27F] dark:text-stone-900 dark:border-[#FFB27F]'
                                : 'bg-white text-stone-900 border-stone-400 dark:bg-transparent dark:text-gray-100 dark:border-zinc-500'
                            }`}
                          >
                            {on ? '✓ ' : ''}
                            {PAY_METHOD_LABEL[m]}
                          </button>
                        );
                      })}
                    </div>

                    <label htmlFor="pay-message" className="block text-xs font-bold text-stone-900 dark:text-gray-100">
                      Mensaje (podés editarlo)
                    </label>
                    <textarea
                      id="pay-message"
                      rows={9}
                      value={paymentMessageText}
                      onChange={(e) => setPayTextOverride(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#111215] text-stone-900 dark:text-gray-100 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F]"
                    />

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <a
                        href={buildWhatsAppLink(selectedGuestAction.guestPhone, paymentMessageText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#F6D2B8] hover:bg-[#F0C2A0] text-[#7A3306] dark:bg-[#3E281C] dark:hover:bg-[#4E3324] dark:text-[#FFB27F] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Pedir pago por WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(paymentMessageText);
                          setCopiedPayText(true);
                          setTimeout(() => setCopiedPayText(false), 2000);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-[#E4DDD1] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 text-xs font-extrabold cursor-pointer"
                      >
                        {copiedPayText ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <button
                      onClick={() => setPaySheetOpen(true)}
                      className="text-xs font-extrabold text-[#8F3B08] dark:text-[#FFB27F] underline underline-offset-2 cursor-pointer"
                    >
                      Cambiar mis datos de cobro
                    </button>
                  </>
                )}
              </div>

              {/* ACCIÓN 2: ENVIAR BIENVENIDA Y GUÍA DIGITAL */}
              <div className="p-4 rounded-2xl bg-[#E6F8EA]/60 dark:bg-[#16291C] border border-green-100/60 dark:border-green-900/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#136B36] dark:text-[#6EE08F]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">2. Enviar Bienvenida & Guía Digital</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold">
                  Incluye mapa GPS interactivo, fotos de acceso y Wi-Fi
                </p>
                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, welcomeMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#D4F2DC] hover:bg-[#C2ECCD] text-[#0F5C2F] dark:bg-[#1C3B24] dark:hover:bg-[#254C2E] dark:text-[#6EE08F] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Guía por WhatsApp</span>
                </a>
              </div>

              {/* ACCIÓN 3: ENVIAR WI-FI */}
              <div className="p-4 rounded-2xl bg-[#EDE8E1]/60 dark:bg-[#202128] border border-stone-300/70 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-stone-800 dark:text-gray-200" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">3. Enviar Clave Wi-Fi</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-gray-200 font-semibold">
                  Red: {selectedActionProperty?.wifiNetwork}
                </p>
                <a
                  href={buildWhatsAppLink(selectedGuestAction.guestPhone, wifiMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E4DDD1] hover:bg-[#D9D0C1] text-[#3A352D] dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Enviar Wi-Fi por WhatsApp</span>
                </a>
              </div>

              {/* ACCIÓN 4: ESTADO DE PAGO */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1B20] border border-gray-100 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-gray-100 block">
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
                        ? 'bg-[#FBE3CB] border-[#8F3B08] text-[#7A3306] dark:bg-[#3D2516] dark:border-[#FFB27F] dark:text-[#FFB27F]'
                        : 'bg-[#E4DDD1] border-transparent text-stone-900 dark:bg-zinc-700 dark:text-gray-100'
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
                        ? 'bg-[#D3F1DB] border-[#0F5C2F] text-[#0F5C2F] dark:bg-[#193A24] dark:border-[#7BE59A] dark:text-[#7BE59A]'
                        : 'bg-[#E4DDD1] border-transparent text-stone-900 dark:bg-zinc-700 dark:text-gray-100'
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
                        ? 'bg-[#FBE3CB] border-[#8F3B08] text-[#7A3306] dark:bg-[#3D2516] dark:border-[#FFB27F] dark:text-[#FFB27F]'
                        : 'bg-[#E4DDD1] border-transparent text-stone-900 dark:bg-zinc-700 dark:text-gray-100'
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

      {paySheetOpen && (
        <PaymentSettingsSheet
          settings={paymentSettings}
          onSave={onSavePaymentSettings}
          onClose={() => setPaySheetOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. BARRA INFERIOR: Agenda · Calendario · Avisos · Xenia · Más              */}
      {/* ========================================================================= */}
      <nav
        aria-label="Secciones"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#15161A] border-t-2 border-stone-300 dark:border-white/15 py-1.5 px-2 flex items-stretch justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none"
      >
        {(
          [
            { id: 'agenda', emoji: '📅', label: 'Agenda' },
            { id: 'calendar', emoji: '🗓️', label: 'Calendario' },
            { id: 'avisos', emoji: '🔔', label: 'Avisos' },
            { id: 'xenia', emoji: '✨', label: 'Xenia' },
            { id: 'more', emoji: '⋯', label: 'Más' },
          ] as Array<{ id: MobileTab; emoji: string; label: string }>
        ).map((item) => {
          const isActive = mobileTab === item.id || (item.id === 'more' && mobileTab === 'units');
          return (
            <button
              key={item.id}
              onClick={() => setMobileTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-h-[54px] flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#F6D2B8] text-[#7A3306] dark:bg-white/10 dark:text-[#FFB27F] font-extrabold'
                  : 'text-stone-900 dark:text-gray-200 font-bold'
              }`}
            >
              <span className={`leading-none ${item.id === 'more' ? 'text-2xl font-black -mt-1' : 'text-xl'}`} aria-hidden>
                {item.emoji}
              </span>
              <span className="text-[11px] leading-none">{item.label}</span>
              {item.id === 'agenda' && overdueRemindersCount > 0 && (
                <span
                  aria-label={`${overdueRemindersCount} recordatorios atrasados`}
                  className="absolute top-0.5 right-[18%] min-w-[18px] h-[18px] px-1 rounded-full bg-red-700 text-white text-[10px] font-extrabold flex items-center justify-center"
                >
                  {overdueRemindersCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
