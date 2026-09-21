import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  KeyRound,
  User,
  Phone,
  Mail,
  DollarSign,
  Send,
  Trash2,
  Edit2,
  Check,
  Pencil,
  RotateCcw,
  RotateCw,
  Sparkles,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Coffee,
  Wine,
  Navigation,
  Flame,
  Droplets,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { Reservation, Property, ReservationStatus, BookingPlatform, AddonService, ReservationAddon } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../data/initialData';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  property: Property | undefined;
  properties?: Property[];
  allReservations?: Reservation[];
  availableAddons?: AddonService[];
  onClose: () => void;
  onUpdateStatus: (resId: string, newStatus: ReservationStatus) => void;
  onUpdatePrice?: (resId: string, newTotalAmount: number) => void;
  onUpdateReservation?: (updatedRes: Reservation) => void;
  onDeleteReservation: (resId: string) => void;
  onOpenMessagesWithGuest: (resId: string) => void;
  isEmployeeMode?: boolean;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  property,
  properties = [],
  allReservations = [],
  availableAddons = [],
  onClose,
  onUpdateStatus,
  onUpdatePrice,
  onUpdateReservation,
  onDeleteReservation,
  onOpenMessagesWithGuest,
  isEmployeeMode = false,
}) => {
  // Mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Quick price editing inline (for view mode)
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<number>(reservation?.totalAmount || 0);

  // Full edit state
  const [editPropertyId, setEditPropertyId] = useState<string>('');
  const [editGuestName, setEditGuestName] = useState<string>('');
  const [editGuestPhone, setEditGuestPhone] = useState<string>('');
  const [editGuestEmail, setEditGuestEmail] = useState<string>('');
  const [editCheckIn, setEditCheckIn] = useState<string>('');
  const [editCheckOut, setEditCheckOut] = useState<string>('');
  const [editGuestsCount, setEditGuestsCount] = useState<number>(1);
  const [editPlatform, setEditPlatform] = useState<BookingPlatform>('direct');
  const [editStatus, setEditStatus] = useState<ReservationStatus>('confirmed');
  const [editPinCode, setEditPinCode] = useState<string>('');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editSpecialNotes, setEditSpecialNotes] = useState<string>('');
  const [editEarlyCheckIn, setEditEarlyCheckIn] = useState<boolean>(false);
  const [editLateCheckOut, setEditLateCheckOut] = useState<boolean>(false);
  const [editEarlyLateFee, setEditEarlyLateFee] = useState<number>(0);
  const [editCustomDiscountPercent, setEditCustomDiscountPercent] = useState<number>(0);
  const [editAirbnbFeeMode, setEditAirbnbFeeMode] = useState<'traditional_3' | 'simplified_15'>('traditional_3');
  const [editAddons, setEditAddons] = useState<ReservationAddon[]>([]);
  const [selectedAddonToAdd, setSelectedAddonToAdd] = useState<string>('');

  // Reset or populate state whenever reservation changes
  useEffect(() => {
    if (reservation) {
      setIsEditing(false);
      setIsEditingPrice(false);
      setTempPrice(reservation.totalAmount);

      setEditPropertyId(reservation.propertyId);
      setEditGuestName(reservation.guestName);
      setEditGuestPhone(reservation.guestPhone);
      setEditGuestEmail(reservation.guestEmail);
      setEditCheckIn(reservation.checkIn);
      setEditCheckOut(reservation.checkOut);
      setEditGuestsCount(reservation.guestsCount);
      setEditPlatform(reservation.platform);
      setEditStatus(reservation.status);
      setEditPinCode(reservation.pinCode);
      setEditTotalAmount(reservation.totalAmount);
      setEditSpecialNotes(reservation.specialNotes || '');
      setEditEarlyCheckIn(reservation.earlyCheckIn || false);
      setEditLateCheckOut(reservation.lateCheckOut || false);
      setEditEarlyLateFee(reservation.earlyLateFee || 0);
      setEditCustomDiscountPercent(reservation.customDiscountPercent || 0);
      setEditAirbnbFeeMode(reservation.airbnbFeeMode || 'traditional_3');
      setEditAddons(reservation.addons || []);
      setSelectedAddonToAdd('');
    }
  }, [reservation]);

  if (!reservation) return null;

  // Calculate turnovers with other reservations in the same property
  const incomingTurnover = allReservations.find(
    (r) =>
      r.id !== reservation.id &&
      r.propertyId === reservation.propertyId &&
      r.status !== 'cancelled' &&
      r.checkOut === reservation.checkIn
  );

  const outgoingTurnover = allReservations.find(
    (r) =>
      r.id !== reservation.id &&
      r.propertyId === reservation.propertyId &&
      r.status !== 'cancelled' &&
      r.checkIn === reservation.checkOut
  );

  const hasTurnover = !!incomingTurnover || !!outgoingTurnover;

  // Calculate dynamic nights when editing
  const calculatedNights = Math.max(
    1,
    Math.round(
      (new Date(editCheckOut || reservation.checkOut).getTime() -
        new Date(editCheckIn || reservation.checkIn).getTime()) /
        (1000 * 3600 * 24)
    ) || 1
  );

  // Calculate dynamic commissions
  const getCalculatedFinancials = () => {
    let rate = 0;
    if (editPlatform === 'airbnb') {
      rate = editAirbnbFeeMode === 'traditional_3' ? 0.03 : 0.15;
    } else if (editPlatform === 'booking' || editPlatform === 'vrbo') {
      rate = 0.15;
    }
    const accommodation = Math.max(0, editTotalAmount - (reservation.cleaningFee || 35));
    const commissionPaid = Math.round(accommodation * rate * 10) / 10;
    const netRevenue = Math.round((editTotalAmount - commissionPaid) * 10) / 10;
    return { commissionPaid, netRevenue };
  };

  const handleGenerateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setEditPinCode(pin);
  };

  const handleAddAddonToEdit = (addonServiceId: string) => {
    const service = availableAddons.find((a) => a.id === addonServiceId);
    if (!service) return;

    setEditAddons((prev) => {
      const existing = prev.find((item) => item.addonId === service.id);
      if (existing) {
        return prev.map((item) =>
          item.addonId === service.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        const newItem: ReservationAddon = {
          addonId: service.id,
          name: service.name,
          category: service.category,
          unitPrice: service.price,
          quantity: 1,
          total: service.price,
          status: 'solicitado',
          addedAt: new Date().toISOString(),
        };
        return [...prev, newItem];
      }
    });

    // Automatically adjust editTotalAmount with the addon price
    setEditTotalAmount((prev) => prev + service.price);
    setSelectedAddonToAdd('');
  };

  const handleRemoveAddonFromEdit = (addonId: string) => {
    const toRemove = editAddons.find((a) => a.addonId === addonId);
    if (!toRemove) return;
    setEditAddons((prev) => prev.filter((a) => a.addonId !== addonId));
    setEditTotalAmount((prev) => Math.max(0, prev - toRemove.total));
  };

  const handleUpdateAddonStatus = (addonId: string, newStatus: ReservationAddon['status']) => {
    if (!onUpdateReservation) return;
    const currentAddons = reservation.addons || [];
    const updated = currentAddons.map((item) =>
      item.addonId === addonId ? { ...item, status: newStatus } : item
    );
    onUpdateReservation({
      ...reservation,
      addons: updated,
    });
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateReservation) return;

    const financials = getCalculatedFinancials();

    const updatedRes: Reservation = {
      ...reservation,
      propertyId: editPropertyId || reservation.propertyId,
      guestName: editGuestName.trim() || reservation.guestName,
      guestPhone: editGuestPhone.trim() || reservation.guestPhone,
      guestEmail: editGuestEmail.trim() || reservation.guestEmail,
      checkIn: editCheckIn || reservation.checkIn,
      checkOut: editCheckOut || reservation.checkOut,
      nights: calculatedNights,
      guestsCount: Math.max(1, Number(editGuestsCount)),
      platform: editPlatform,
      status: editStatus,
      pinCode: editPinCode.trim() || reservation.pinCode,
      totalAmount: Math.max(0, Number(editTotalAmount)),
      specialNotes: editSpecialNotes.trim(),
      earlyCheckIn: editEarlyCheckIn,
      lateCheckOut: editLateCheckOut,
      earlyLateFee: Number(editEarlyLateFee) || 0,
      customDiscountPercent: Number(editCustomDiscountPercent) || 0,
      airbnbFeeMode: editPlatform === 'airbnb' ? editAirbnbFeeMode : undefined,
      commissionPaid: financials.commissionPaid,
      netRevenue: financials.netRevenue,
      addons: editAddons,
    };

    onUpdateReservation(updatedRes);
    setIsEditing(false);
  };

  const activeProperty =
    properties.find((p) => p.id === (isEditing ? editPropertyId : reservation.propertyId)) ||
    property;

  const isSmartLockEnabled = activeProperty?.smartLock?.enabled ?? false;

  const getAddonIcon = (category: string) => {
    switch (category) {
      case 'transfers':
        return <Navigation className="w-3.5 h-3.5 text-blue-500" />;
      case 'frigobar':
        return <Wine className="w-3.5 h-3.5 text-rose-500" />;
      case 'spa':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'desayuno':
        return <Coffee className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Package className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1c1b18] dark:bg-[#141414] text-white p-5 flex items-center justify-between border-b border-[#2e2a25] dark:border-[#222] shrink-0">
          <div className="flex items-center gap-3">
            {!isEditing && (
              <img
                src={
                  reservation.guestAvatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt={reservation.guestName}
                className="w-10 h-10 rounded-full object-cover border border-[#3e3a35]"
              />
            )}
            <div>
              <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-2">
                <span>{isEditing ? 'Editar Reserva' : reservation.guestName}</span>
                {isEditing && (
                  <span className="text-[10px] font-bold bg-[#382a20] text-[#e89f78] border border-[#5a3a28] px-2 py-0.5 rounded-full uppercase">
                    Modo Edición
                  </span>
                )}
              </h3>
              {!isEditing ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      reservation.platform === 'airbnb'
                        ? 'bg-[#c46d45] text-white'
                        : reservation.platform === 'booking'
                        ? 'bg-[#3b6088] text-white'
                        : reservation.platform === 'direct'
                        ? 'bg-[#3e6645] text-white'
                        : 'bg-[#5c4a6b] text-white'
                    }`}
                  >
                    Canal: {reservation.platform}
                  </span>
                  <span className="text-[10px] text-[#8e8c87] font-medium">
                    ID: {reservation.id.slice(0, 8)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#8e8c87]">Modifica fechas, precios, cabaña o datos del huésped</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && onUpdateReservation && (
              <button
                id="btn-open-edit-reservation"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c46d45] hover:bg-[#b55e37] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Editar todos los datos de la reserva"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-[#8e8c87] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {isEditing ? (
            /* ================= FULL EDIT FORM ================= */
            <form id="edit-reservation-form" onSubmit={handleSaveFullEdit} className="space-y-4">
              {/* Property Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Cabaña / Alojamiento</span>
                </label>
                <select
                  value={editPropertyId}
                  onChange={(e) => setEditPropertyId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.neighborhood} (${p.basePrice} USD/noche)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Check-in</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Check-out ({calculatedNights} noches)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Guest Name & Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Huésped Titular</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuestName}
                    onChange={(e) => setEditGuestName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Canal de Origen
                  </label>
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as BookingPlatform)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="direct">Directa (0% comisiones)</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="vrbo">VRBO</option>
                  </select>
                </div>
              </div>

              {/* Airbnb Fee Mode (only if platform is airbnb) */}
              {editPlatform === 'airbnb' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1.5">
                  <span className="font-bold text-rose-900 dark:text-rose-300 block">Modalidad Airbnb:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="editAirbnbFee"
                        checked={editAirbnbFeeMode === 'traditional_3'}
                        onChange={() => setEditAirbnbFeeMode('traditional_3')}
                        className="text-rose-600"
                      />
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] block">3% Tradicional</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Anfitrión clásico</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="editAirbnbFee"
                        checked={editAirbnbFeeMode === 'simplified_15'}
                        onChange={() => setEditAirbnbFeeMode('simplified_15')}
                        className="text-rose-600"
                      />
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] block">15% Simplificada</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Comisión completa</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Status & Guest Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Estado de la Reserva
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReservationStatus)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="confirmed">Confirmada</option>
                    <option value="checked_in">Check-in Realizado</option>
                    <option value="checked_out">Check-out Realizado</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cantidad de Personas</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeProperty?.maxGuests || 10}
                    value={editGuestsCount}
                    onChange={(e) => setEditGuestsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>WhatsApp / Celular</span>
                  </label>
                  <input
                    type="tel"
                    value={editGuestPhone}
                    onChange={(e) => setEditGuestPhone(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Correo Electrónico</span>
                  </label>
                  <input
                    type="email"
                    value={editGuestEmail}
                    onChange={(e) => setEditGuestEmail(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Smart Lock PIN (Only shown if property has smartLock enabled) */}
              {isSmartLockEnabled && (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>PIN de Cerradura Inteligente</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPin}
                      className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Generar PIN nuevo</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editPinCode}
                    onChange={(e) => setEditPinCode(e.target.value)}
                    placeholder="Ej: 4829"
                    className="w-full text-sm font-bold font-mono p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 text-blue-900 dark:text-blue-200 tracking-wider"
                  />
                </div>
              )}

              {/* Early & Late Check-in */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs space-y-2">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">Flexibilidad Horaria</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editEarlyCheckIn}
                      onChange={(e) => setEditEarlyCheckIn(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Early Check-in</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editLateCheckOut}
                      onChange={(e) => setEditLateCheckOut(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Late Check-out</span>
                  </label>
                </div>
              </div>

              {/* Optional Addon Modules (Frigobar, Transfers, Spa, Desayunos) */}
              <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 rounded-xl text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Módulos Opcionales (Frigobar, Transfers, Spa)</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    {editAddons.length} agregados
                  </span>
                </div>

                {/* Selected addons list */}
                {editAddons.length > 0 ? (
                  <div className="space-y-1.5">
                    {editAddons.map((item) => (
                      <div
                        key={item.addonId}
                        className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800/90 rounded-lg border border-purple-200/70 dark:border-purple-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {getAddonIcon(item.category)}
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {item.quantity} x ${item.unitPrice} USD
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            +${item.total} USD
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddonFromEdit(item.addonId)}
                            className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                            title="Quitar de la reserva"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                    No hay servicios opcionales cargados en esta reserva.
                  </p>
                )}

                {/* Add new addon dropdown */}
                {availableAddons.length > 0 && (
                  <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/30 flex items-center gap-1.5">
                    <select
                      value={selectedAddonToAdd}
                      onChange={(e) => setSelectedAddonToAdd(e.target.value)}
                      className="flex-1 text-xs p-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">+ Seleccionar servicio para agregar...</option>
                      {availableAddons.map((addon) => (
                        <option key={addon.id} value={addon.id}>
                          [{addon.category.toUpperCase()}] {addon.name} (+${addon.price} USD)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedAddonToAdd}
                      onClick={() => selectedAddonToAdd && handleAddAddonToEdit(selectedAddonToAdd)}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Financials & Price Edit */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Tarifa Total Cobrada</span>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editTotalAmount}
                      onChange={(e) => setEditTotalAmount(Math.max(0, Number(e.target.value)))}
                      className="w-24 p-1.5 border border-rose-300 dark:border-rose-700 rounded-lg bg-white dark:bg-zinc-900 text-right font-extrabold text-sm text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-zinc-500 font-bold text-xs">USD</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <span>Comisión Plataforma:</span>
                    <strong className="block text-red-600 dark:text-red-400">
                      -${getCalculatedFinancials().commissionPaid} USD
                    </strong>
                  </div>
                  <div>
                    <span>Ingreso Neto Anfitrión:</span>
                    <strong className="block text-emerald-600 dark:text-emerald-400">
                      ${getCalculatedFinancials().netRevenue} USD
                    </strong>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Notas Especiales u Observaciones
                </label>
                <textarea
                  rows={2}
                  value={editSpecialNotes}
                  onChange={(e) => setEditSpecialNotes(e.target.value)}
                  placeholder="Ej: Solicitó cuna para bebé, llega a las 22hs..."
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================= VIEW MODE ================= */
            <>
              {/* Property name */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Alojamiento
                </span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{property?.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {property?.address}, {property?.neighborhood}
                </p>
              </div>

              {/* Same-Day Turnover Alert Banner */}
              {hasTurnover && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200 shadow-2xs">
                  <RotateCw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="font-bold flex items-center justify-between">
                      <span className="text-xs text-amber-900 dark:text-amber-200">
                        🔄 Recambio el mismo día (Check-in / Check-out compartido)
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        Atención Limpieza
                      </span>
                    </div>
                    {incomingTurnover && (
                      <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                        • <strong>Entrada ({formatDisplayDate(reservation.checkIn)} a las 14:00):</strong> Comparte fecha con el check-out de <strong>{incomingTurnover.guestName}</strong> (10:00 hs).
                      </p>
                    )}
                    {outgoingTurnover && (
                      <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                        • <strong>Salida ({formatDisplayDate(reservation.checkOut)} a las 10:00):</strong> Comparte fecha con el check-in de <strong>{outgoingTurnover.guestName}</strong> (14:00 hs).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dates & Nights */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-medium block">Check-in</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {formatDisplayDate(reservation.checkIn)}
                  </span>
                  {reservation.earlyCheckIn && (
                    <span className="inline-block mt-1 text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Early Check
                    </span>
                  )}
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-medium block">Estadía</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {reservation.nights} noches
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-medium block">Check-out</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {formatDisplayDate(reservation.checkOut)}
                  </span>
                  {reservation.lateCheckOut && (
                    <span className="inline-block mt-1 text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Late Check
                    </span>
                  )}
                </div>
              </div>

              {/* Smart Lock PIN Box (Only shown if property has smartLock enabled) */}
              {isSmartLockEnabled && (
                <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block">
                        PIN de Cerradura Inteligente
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        Válido exclusivamente durante las fechas de estancia
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold font-mono bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300">
                    {reservation.pinCode}
                  </span>
                </div>
              )}

              {/* Guest contact */}
              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {reservation.guestPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Mail className="w-3.5 h-3.5" /> Correo:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {reservation.guestEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Huéspedes:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {reservation.guestsCount} personas
                  </span>
                </div>
                {reservation.specialNotes ? (
                  <div className="py-1 text-zinc-600 dark:text-zinc-300">
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase">Notas:</span>
                    <p className="mt-0.5 text-xs italic bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {reservation.specialNotes}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Optional Modules / Add-on Services In View Mode */}
              {reservation.addons && reservation.addons.length > 0 && (
                <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Servicios & Opcionales Contratados</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                      Total: +${reservation.addons.reduce((acc, a) => acc + a.total, 0)} USD
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {reservation.addons.map((addon) => (
                      <div
                        key={addon.addonId}
                        className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800/90 rounded-lg border border-purple-100 dark:border-purple-900/40"
                      >
                        <div className="flex items-center gap-2">
                          {getAddonIcon(addon.category)}
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-xs">
                              {addon.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {addon.quantity} un. (${addon.unitPrice} USD c/u)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 dark:text-purple-300 text-xs">
                            +${addon.total}
                          </span>

                          {/* Status pill with quick toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus =
                                addon.status === 'solicitado'
                                  ? 'entregado'
                                  : addon.status === 'entregado'
                                  ? 'cobrado'
                                  : 'solicitado';
                              handleUpdateAddonStatus(addon.addonId, nextStatus);
                            }}
                            title="Click para cambiar estado"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              addon.status === 'cobrado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : addon.status === 'entregado'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {addon.status === 'solicitado' && '⏳ Solicitado'}
                            {addon.status === 'entregado' && '✓ Entregado'}
                            {addon.status === 'cobrado' && '✓ Cobrado'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financials breakdown (Hidden in employee mode) */}
              {!isEmployeeMode ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Total Abonado por Huésped:
                      </span>
                      {reservation.platform !== 'direct' && (
                        <span
                          className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200/80 dark:bg-zinc-700 px-1.5 py-0.5 rounded"
                          title="En bloqueos iCal puedes fijar o ajustar aquí el valor real"
                        >
                          {reservation.platform.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {isEditingPrice ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 font-bold">$</span>
                        <input
                          type="number"
                          min="0"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Math.max(0, Number(e.target.value)))}
                          className="w-20 px-2 py-0.5 text-xs font-bold border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-rose-400 focus:outline-rose-500"
                        />
                        <button
                          onClick={() => {
                            onUpdatePrice?.(reservation.id, tempPrice);
                            setIsEditingPrice(false);
                          }}
                          className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
                          title="Guardar nuevo precio"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setTempPrice(reservation.totalAmount);
                            setIsEditingPrice(false);
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          ${reservation.totalAmount} USD
                        </span>
                        {onUpdatePrice && (
                          <button
                            onClick={() => setIsEditingPrice(true)}
                            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 rounded hover:bg-zinc-200/70 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            title="Modificar tarifa rápida"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {reservation.customDiscountPercent ? (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
                      <span>Descuento Directo Aplicado:</span>
                      <span>-{reservation.customDiscountPercent}%</span>
                    </div>
                  ) : null}

                  {reservation.earlyLateFee ? (
                    <div className="flex justify-between text-amber-700 dark:text-amber-400 text-[11px]">
                      <span>Adicional Early/Late Check:</span>
                      <span>+${reservation.earlyLateFee} USD</span>
                    </div>
                  ) : null}

                  {reservation.addons && reservation.addons.length > 0 ? (
                    <div className="flex justify-between text-purple-700 dark:text-purple-400 text-[11px]">
                      <span>Servicios & Opcionales ({reservation.addons.length} items):</span>
                      <span>+${reservation.addons.reduce((acc, a) => acc + a.total, 0)} USD</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>
                      Comisión (
                      {reservation.platform === 'airbnb'
                        ? reservation.airbnbFeeMode === 'traditional_3'
                          ? 'Airbnb 3% Tradicional'
                          : 'Airbnb 15%'
                        : reservation.platform.toUpperCase()}
                      ):
                    </span>
                    <span>-${reservation.commissionPaid} USD</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-zinc-200 dark:border-zinc-700">
                    <span>Ingreso Neto para Anfitrión:</span>
                    <span>${reservation.netRevenue} USD</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs flex items-center justify-between text-amber-900 dark:text-amber-300">
                  <span className="font-medium">Detalle Financiero & Comisiones:</span>
                  <span className="text-[11px] font-bold bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                    🔒 Oculto en Modo Día a Día
                  </span>
                </div>
              )}

              {/* Action triggers */}
              <div className="pt-2 flex flex-col gap-2">
                {/* Prominent Edit button at the bottom as well */}
                {onUpdateReservation && (
                  <button
                    id="btn-edit-reservation-footer"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5 text-rose-500" />
                    <span>Editar Datos de la Reserva (Fechas, Precios, Cabaña)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onOpenMessagesWithGuest(reservation.id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir Plantilla de WhatsApp para este Huésped</span>
                </button>

                {/* Status updates */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onUpdateStatus(
                        reservation.id,
                        reservation.status === 'checked_in' ? 'checked_out' : 'checked_in'
                      );
                      onClose();
                    }}
                    className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer text-center"
                  >
                    {reservation.status === 'checked_in' ? 'Marcar Check-out' : 'Marcar Check-in'}
                  </button>

                  <button
                    onClick={() => {
                      onDeleteReservation(reservation.id);
                      onClose();
                    }}
                    className="py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Reserva</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
