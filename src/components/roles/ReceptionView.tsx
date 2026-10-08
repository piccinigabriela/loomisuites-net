import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Key,
  Check,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  MessageCircle,
  Sparkles,
  Shield,
  DoorOpen,
  LogOut,
  Receipt,
  Wallet,
  ArrowRight,
  Copy,
  ExternalLink,
  Building2,
  X,
  CreditCard,
  Banknote,
  Send,
} from 'lucide-react';
import { DemoState, Reservation, ReservationStatus, PaymentStatus, CashMovement } from '../../types';
import { formatDisplayDate, getRelativeDate } from '../../data/initialData';
import { GuestWelcomeCard } from '../GuestWelcomeCard';

interface ReceptionViewProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onUpdateReservationStatus: (resId: string, status: ReservationStatus) => void;
  onUpdatePaymentStatus?: (resId: string, status: PaymentStatus) => void;
  onAddCashMovement: (movement: Omit<CashMovement, 'id' | 'date'>) => void;
  onQuickCheckIn: (resId: string) => void;
  onSwitchRole: (role: 'admin' | 'frontdesk' | 'housekeeping') => void;
  onOpenNewReservation: () => void;
  complexName?: string;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  demoState,
  onSelectReservation,
  onUpdateReservationStatus,
  onUpdatePaymentStatus,
  onAddCashMovement,
  onQuickCheckIn,
  onSwitchRole,
  onOpenNewReservation,
  complexName = 'Catalinas Apartamentos',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'checkin' | 'checkout' | 'in_house'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResForCard, setSelectedResForCard] = useState<Reservation | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cash quick form state
  const [cashConcept, setCashConcept] = useState('Cobro de Saldo de Estadía');
  const [cashAmount, setCashAmount] = useState('50');
  const [cashMethod, setCashMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [cashCategory, setCashCategory] = useState<CashMovement['category']>('caja_chica');
  const [cashPropertyId, setCashPropertyId] = useState(demoState.properties[0]?.id || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const today = getRelativeDate(0);

  // Properties map
  const getProp = (propId: string) => demoState.properties.find((p) => p.id === propId);

  // Filter reservations for Reception (Today & active stays)
  const allReservations = demoState.reservations.filter((r) => r.status !== 'cancelled');

  const todayCheckIns = allReservations.filter((r) => r.checkIn === today);
  const todayCheckOuts = allReservations.filter((r) => r.checkOut === today);
  const inHouseStays = allReservations.filter(
    (r) => r.status === 'checked_in' || (r.checkIn <= today && r.checkOut >= today)
  );

  const displayedReservations = allReservations.filter((r) => {
    const prop = getProp(r.propertyId);
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop && prop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.guestPhone && r.guestPhone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (activeFilter === 'checkin') return r.checkIn === today;
    if (activeFilter === 'checkout') return r.checkOut === today;
    if (activeFilter === 'in_house') return r.status === 'checked_in';
    return true;
  });

  // Cash movements calculations
  const openingCash = 50000;
  const cashMovements = demoState.cashMovements || [];
  const cashMovementsOnly = cashMovements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn;

  // Handlers
  const handleQuickCheckOut = (resId: string) => {
    onUpdateReservationStatus(resId, 'checked_out');
    showToast('✓ Check-out completado. Unidad enviada a Housekeeping.');
  };

  const handleSaveCashEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cashAmount);
    if (isNaN(val) || val <= 0) {
      showToast('⚠️ Ingresá un monto válido.');
      return;
    }

    onAddCashMovement({
      type: 'ingreso',
      amount: val,
      concept: cashConcept,
      category: cashCategory,
      paymentMethod: cashMethod,
      propertyId: cashPropertyId || undefined,
      userRole: 'frontdesk',
    });

    setIsCashModalOpen(false);
    showToast(`✓ Cobro de $${val} registrado en caja chica.`);
    setCashAmount('');
  };

  const handleOpenWelcomeCard = (res: Reservation) => {
    setSelectedResForCard(res);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-['Inter',sans-serif] text-stone-800 dark:text-stone-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#E67E22]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Navigation & Header */}
      <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] border border-orange-200/50">
                <DoorOpen className="w-3 h-3 text-[#E67E22]" />
                VISTA RECEPCIÓN & MOSTRADOR
              </span>
              <span className="text-[10px] text-stone-400 font-light flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDisplayDate(today)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-stone-900 dark:text-white">
              Mostrador Diario: <span className="font-semibold text-stone-800 dark:text-stone-100">{complexName}</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
              Entorno ágil para recepción en PC/tablet: check-ins, check-outs, cobro de caja chica y envío de tarjetas de bienvenida por WhatsApp en 1 clic.
            </p>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCashModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>+ Cobro Caja Chica</span>
            </button>

            <button
              onClick={onOpenNewReservation}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E67E22] hover:bg-[#d36d16] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cargar Huésped</span>
            </button>

            <div className="h-6 w-px bg-stone-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => onSwitchRole('admin')}
                className="px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:bg-white dark:hover:bg-zinc-700 font-medium transition-all cursor-pointer"
                title="Ir a control total de Dueño / Administrador"
              >
                👑 Dueño
              </button>
              <button
                onClick={() => onSwitchRole('housekeeping')}
                className="px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:bg-white dark:hover:bg-zinc-700 font-medium transition-all cursor-pointer"
                title="Ir a modo Mucamas / Limpieza PWA"
              >
                🧹 Mucamas
              </button>
            </div>
          </div>
        </div>

        {/* Counter KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Llegadas Hoy */}
          <div
            onClick={() => setActiveFilter('checkin')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'checkin'
                ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 shadow-xs'
                : 'bg-stone-50/60 dark:bg-zinc-900/40 border-stone-100 dark:border-zinc-800 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Llegadas Hoy</span>
              <DoorOpen className="w-3.5 h-3.5 text-[#E67E22]" />
            </div>
            <div className="mt-1 text-2xl font-light text-stone-900 dark:text-white">
              <span className="font-semibold text-[#E67E22]">{todayCheckIns.length}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-light">Ingreso desde 14:00</span>
          </div>

          {/* Salidas Hoy */}
          <div
            onClick={() => setActiveFilter('checkout')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'checkout'
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-xs'
                : 'bg-stone-50/60 dark:bg-zinc-900/40 border-stone-100 dark:border-zinc-800 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Salidas Hoy</span>
              <LogOut className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1 text-2xl font-light text-stone-900 dark:text-white">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{todayCheckOuts.length}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-light">Salida hasta 10:00</span>
          </div>

          {/* En Estancia */}
          <div
            onClick={() => setActiveFilter('in_house')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'in_house'
                ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 shadow-xs'
                : 'bg-stone-50/60 dark:bg-zinc-900/40 border-stone-100 dark:border-zinc-800 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>En Estancia</span>
              <User className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="mt-1 text-2xl font-light text-stone-900 dark:text-white">
              <span className="font-semibold text-purple-600 dark:text-purple-400">{inHouseStays.length}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-light">Huéspedes alojados</span>
          </div>

          {/* Caja Mostrador */}
          <div
            onClick={() => setIsCashModalOpen(true)}
            className="p-3.5 rounded-2xl border bg-stone-50/60 dark:bg-zinc-900/40 border-stone-100 dark:border-zinc-800 hover:border-emerald-200 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Caja Mostrador</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-light text-stone-900 dark:text-white">
              $<span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentCashBalance.toLocaleString('es-AR')}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-light">+ {cashMovements.length} movimientos</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Control de Mostrador & Lista de Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Guest Flow Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E67E22]" />
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                Flujo de Huéspedes & Mostrador
              </h2>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pasajero o unidad..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#E67E22] w-44 sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-xl text-[11px]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  Todos ({allReservations.length})
                </button>
                <button
                  onClick={() => setActiveFilter('checkin')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeFilter === 'checkin'
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-2xs font-semibold'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  Llegadas ({todayCheckIns.length})
                </button>
                <button
                  onClick={() => setActiveFilter('checkout')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeFilter === 'checkout'
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-2xs font-semibold'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  Salidas ({todayCheckOuts.length})
                </button>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3 pt-2">
            {displayedReservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 font-light border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
                No hay movimientos registrados con los filtros actuales.
              </div>
            ) : (
              displayedReservations.map((res) => {
                const prop = getProp(res.propertyId);
                const isTodayIn = res.checkIn === today;
                const isTodayOut = res.checkOut === today;
                const isCheckedIn = res.status === 'checked_in';
                const isCheckedOut = res.status === 'checked_out';

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80 hover:border-orange-200/70 dark:hover:border-orange-900/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Unit & Guest details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                          {prop?.name || 'Unidad'}
                        </span>
                        {isTodayIn && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-[#E67E22] dark:bg-orange-950/50 dark:text-orange-300">
                            Ingreso Hoy 14:00
                          </span>
                        )}
                        {isTodayOut && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            Salida Hoy 10:00
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono uppercase">
                          {res.platform} • {res.nights} noches
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                          {res.guestName}
                        </h3>
                        {res.guestPhone && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            {res.guestPhone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-stone-400 font-light flex-wrap">
                        <span>Del <strong>{res.checkIn}</strong> al <strong>{res.checkOut}</strong></span>
                        <span>• Total: <strong>USD {res.totalAmount}</strong></span>
                        <span className={res.paymentStatus === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                          • {res.paymentStatus === 'paid' ? 'Pagado 100%' : 'Saldo pendiente'}
                        </span>
                        {res.pinCode && (
                          <span className="font-mono bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-stone-600 dark:text-stone-300">
                            PIN: {res.pinCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-zinc-800">
                      {/* Enviar WhatsApp Welcome Card con 1 clic */}
                      <button
                        onClick={() => handleOpenWelcomeCard(res)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Abrir o enviar la Tarjeta de Bienvenida Digital por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Tarjeta WhatsApp</span>
                      </button>

                      {/* Check-in / Check-out Buttons */}
                      {!isCheckedIn && !isCheckedOut && (
                        <button
                          onClick={() => {
                            onQuickCheckIn(res.id);
                            showToast(`✓ Check-in completado para ${res.guestName}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#E67E22] hover:bg-[#d36d16] text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Check-in</span>
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          onClick={() => handleQuickCheckOut(res.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-black text-white dark:bg-white dark:text-stone-900 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Check-out</span>
                        </button>
                      )}

                      {isCheckedOut && (
                        <span className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-stone-400">
                          Finalizada
                        </span>
                      )}

                      <button
                        onClick={() => onSelectReservation(res)}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Ver ficha completa"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Caja Chica del Mostrador & Atajos Rápidos */}
        <div className="lg:col-span-4 space-y-6">
          {/* Caja Chica Box */}
          <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 border border-stone-200/70 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                  Caja Chica & Mostrador
                </h3>
              </div>
              <button
                onClick={() => setIsCashModalOpen(true)}
                className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
              >
                + Registrar
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-zinc-900 border border-emerald-100/60 dark:border-emerald-950/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Saldo en Efectivo (Fondo + Cobros)</span>
                <span className="font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                  Fondo $50k ARS
                </span>
              </div>
              <div className="text-2xl font-light text-stone-900 dark:text-white">
                $<span className="font-semibold text-emerald-600">{currentCashBalance.toLocaleString('es-AR')}</span>
              </div>
              <p className="text-[11px] text-stone-400 font-light">
                Disponible en mostrador para vueltos, cobros en mano y compras de insumos menores.
              </p>
            </div>

            {/* Presets de Cobro Rápido */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400 block">
                Atajos de Cobro Directo:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setCashConcept('Estacionamiento Cochera Privada');
                    setCashAmount('15');
                    setCashCategory('servicios');
                    setIsCashModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-orange-200 text-left bg-stone-50/50 dark:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">🚗 Cochera</span>
                  <span className="text-[10px] text-stone-400">$15 USD / día</span>
                </button>

                <button
                  onClick={() => {
                    setCashConcept('Late Check-out (Salida Extendida 16hs)');
                    setCashAmount('20');
                    setCashCategory('servicios');
                    setIsCashModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-orange-200 text-left bg-stone-50/50 dark:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">⏰ Late Check-out</span>
                  <span className="text-[10px] text-stone-400">$20 USD</span>
                </button>

                <button
                  onClick={() => {
                    setCashConcept('Consumo Frigobar / Vino Reserva');
                    setCashAmount('18');
                    setCashCategory('servicios');
                    setIsCashModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-orange-200 text-left bg-stone-50/50 dark:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">🍷 Vino Frigobar</span>
                  <span className="text-[10px] text-stone-400">$18 USD</span>
                </button>

                <button
                  onClick={() => {
                    setCashConcept('Gasto de Limpieza / Insumos Menores');
                    setCashAmount('10');
                    setCashCategory('insumos');
                    setIsCashModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-orange-200 text-left bg-stone-50/50 dark:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">🧾 Compra Insumos</span>
                  <span className="text-[10px] text-stone-400">Gasto mostrador</span>
                </button>
              </div>
            </div>

            {/* Últimos movimientos */}
            <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400 block">
                Últimos Asientos de Caja:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {cashMovements.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70 dark:bg-zinc-800/40 text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{m.concept}</p>
                      <p className="text-[10px] text-stone-400">{m.paymentMethod}</p>
                    </div>
                    <span className={`font-mono font-semibold shrink-0 ${m.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'ingreso' ? '+' : '-'}${m.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: PREVISUALIZACIÓN Y ENVÍO DE TARJETA DE BIENVENIDA WHATSAPP */}
      {selectedResForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18191E] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E67E22] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Tarjeta de Bienvenida Digital para WhatsApp
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Ficha de llegada para {selectedResForCard.guestName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResForCard(null)}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Live GuestWelcomeCard Component */}
            <div className="py-2">
              <GuestWelcomeCard
                guestName={selectedResForCard.guestName}
                propertyName={getProp(selectedResForCard.propertyId)?.name || 'Tu Alojamiento'}
                checkInDate={selectedResForCard.checkIn}
                checkOutDate={selectedResForCard.checkOut}
                checkInTime="14:00 hs"
                accessCode={selectedResForCard.pinCode || '4820'}
                wifiNetwork={getProp(selectedResForCard.propertyId)?.wifiNetwork || 'Loomi_Fibra_Optica'}
                wifiPassword={getProp(selectedResForCard.propertyId)?.wifiPassword || 'Bienvenido2026'}
                address={getProp(selectedResForCard.propertyId)?.address || 'Tres Sargentos 435, CABA'}
                guideUrl={`https://loomisuite.net/guia/${selectedResForCard.propertyId}`}
                hostPhone={selectedResForCard.guestPhone || '5491140506070'}
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const prop = getProp(selectedResForCard.propertyId);
                  const text = `¡Hola ${selectedResForCard.guestName}! Te compartimos tu tarjeta de bienvenida digital a ${prop?.name || 'tu alojamiento'}:\n\n` +
                    `🔑 Código cerradura: ${selectedResForCard.pinCode || '4820'}\n` +
                    `📶 Wi-Fi: ${prop?.wifiNetwork || 'Loomi_Fibra'} (Clave: ${prop?.wifiPassword || 'Bienvenido2026'})\n` +
                    `📍 Dirección: ${prop?.address || 'Tres Sargentos 435'}\n` +
                    `🌐 Guía completa y mapa: https://loomisuite.net/guia/${selectedResForCard.propertyId}\n\n` +
                    `¡Que tengas un excelente descanso!`;
                  navigator.clipboard.writeText(text);
                  showToast('✓ Mensaje copiado al portapapeles');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Datos</span>
              </button>

              <a
                href={`https://wa.me/${(selectedResForCard.guestPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `¡Hola ${selectedResForCard.guestName}! Te enviamos tu tarjeta de bienvenida para ingresar a ${getProp(selectedResForCard.propertyId)?.name || 'tu departamento'}: https://loomisuite.net/guia/${selectedResForCard.propertyId} (Cerradura: ${selectedResForCard.pinCode || '4820'} | Wi-Fi: ${getProp(selectedResForCard.propertyId)?.wifiNetwork || 'Loomi'}). ¡Buen descanso!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp Real</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRO DE COBRO DE CAJA CHICA */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18191E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Registrar Cobro en Mostrador
                </h3>
              </div>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCashEntry} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-stone-500 block mb-1">
                  Concepto del Cobro
                </label>
                <input
                  type="text"
                  required
                  value={cashConcept}
                  onChange={(e) => setCashConcept(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-[#E67E22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-500 block mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs font-mono font-bold focus:outline-none focus:border-[#E67E22]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-500 block mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={cashMethod}
                    onChange={(e: any) => setCashMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-[#E67E22]"
                  >
                    <option value="efectivo">💵 Efectivo Mostrador</option>
                    <option value="transferencia">🏦 Transferencia / Alias</option>
                    <option value="tarjeta">💳 Tarjeta / Posnet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-500 block mb-1">
                  Unidad Afectada (Opcional)
                </label>
                <select
                  value={cashPropertyId}
                  onChange={(e) => setCashPropertyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-[#E67E22]"
                >
                  <option value="">General del Complejo</option>
                  {demoState.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
