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
  MessageCircle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-[#F8F9FA] dark:bg-[#111215] w-full max-w-lg rounded-[28px] shadow-2xl border border-black/[0.03] dark:border-white/[0.04] text-[#2D3748] dark:text-[#E2E8F0] overflow-hidden transition-colors flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#ECE7E0] dark:bg-[#18191E] text-gray-900 dark:text-gray-100 p-4 sm:p-5 flex items-center justify-between border-b border-[#DDD7CD]/50 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            {!isEditing && (
              <div className="w-11 h-11 rounded-full bg-[#DDD7CD] dark:bg-zinc-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs overflow-hidden">
                {reservation.guestAvatar ? (
                  <img
                    src={reservation.guestAvatar}
                    alt={reservation.guestName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{reservation.guestName.charAt(0)}</span>
                )}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 tracking-tight text-gray-900 dark:text-gray-100">
                <span>{isEditing ? 'Editar Reserva' : reservation.guestName}</span>
                {isEditing && (
                  <span className="text-[10px] font-bold bg-[#D86F35] text-white px-2 py-0.5 rounded-md uppercase">
                    Edición
                  </span>
                )}
              </h3>
              {!isEditing ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                      reservation.platform === 'direct'
                        ? 'bg-[#E2F7E7] text-[#2EA44F]'
                        : 'bg-[#FDF3E7] text-[#D86F35]'
                    }`}
                  >
                    {reservation.platform === 'direct' ? 'Directa (0% com)' : reservation.platform.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    ID: {reservation.id.slice(0, 8)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium">Modificá fechas, precios, cabaña o datos</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing && reservation.guestPhone && (
              <a
                href={`tel:${reservation.guestPhone}`}
                className="w-9 h-9 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] text-[#7A7369] flex items-center justify-center transition-colors cursor-pointer"
                title="Llamar al pasajero"
              >
                <Phone className="w-4 h-4 stroke-[2]" />
              </a>
            )}

            {!isEditing && onUpdateReservation && (
              <button
                id="btn-open-edit-reservation"
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 rounded-xl bg-[#F6D8C3] hover:bg-[#F0C9B0] text-[#D86F35] flex items-center justify-center transition-colors cursor-pointer"
                title="Editar datos de la reserva"
              >
                <Pencil className="w-4 h-4 stroke-[2]" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
              <div className="p-4 bg-white dark:bg-[#1A1B20] rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <span className="text-[10px] font-bold text-[#D86F35] uppercase tracking-wider block">
                  Alojamiento
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">{property?.name}</h4>
                <p className="text-xs text-gray-400 font-medium">
                  {property?.address}, {property?.neighborhood}
                </p>
              </div>

              {/* Same-Day Turnover Alert Banner */}
              {hasTurnover && (
                <div className="bg-[#FDF3E7] dark:bg-[#251D17] border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
                  <RotateCw className="w-4 h-4 text-[#D86F35] shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="font-bold flex items-center justify-between">
                      <span className="text-xs text-gray-900 dark:text-gray-100">
                        🔄 Recambio el mismo día
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F6D8C3] text-[#D86F35]">
                        Limpieza prioritaria
                      </span>
                    </div>
                    {incomingTurnover && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">
                        • Entrada a las 14hs coincide con salida de <strong>{incomingTurnover.guestName}</strong> (10hs).
                      </p>
                    )}
                    {outgoingTurnover && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">
                        • Salida a las 10hs coincide con entrada de <strong>{outgoingTurnover.guestName}</strong> (14hs).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dates & Nights */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white dark:bg-[#1A1B20] p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <span className="text-[10px] text-gray-400 font-medium block">Check-in</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {formatDisplayDate(reservation.checkIn)}
                  </span>
                  {reservation.earlyCheckIn && (
                    <span className="inline-block mt-1 text-[9px] font-bold bg-[#FDF3E7] text-[#D86F35] px-1.5 py-0.5 rounded-md">
                      Early Check
                    </span>
                  )}
                </div>
                <div className="bg-white dark:bg-[#1A1B20] p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <span className="text-[10px] text-gray-400 font-medium block">Estadía</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {reservation.nights} noches
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1A1B20] p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <span className="text-[10px] text-gray-400 font-medium block">Check-out</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {formatDisplayDate(reservation.checkOut)}
                  </span>
                  {reservation.lateCheckOut && (
                    <span className="inline-block mt-1 text-[9px] font-bold bg-[#FDF3E7] text-[#D86F35] px-1.5 py-0.5 rounded-md">
                      Late Check
                    </span>
                  )}
                </div>
              </div>

              {/* Smart Lock PIN Box */}
              {isSmartLockEnabled && (
                <div className="bg-white dark:bg-[#1A1B20] border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-5 h-5 text-[#D86F35]" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        PIN de Cerradura Inteligente
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Válido exclusivamente durante la estadía
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono bg-[#EDE8E1] px-3 py-1 rounded-xl text-gray-800">
                    {reservation.pinCode}
                  </span>
                </div>
              )}

              {/* Guest contact */}
              <div className="p-4 bg-white dark:bg-[#1A1B20] rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" /> Teléfono:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                      {reservation.guestPhone || 'No registrado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Mail className="w-3.5 h-3.5" /> Correo:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {reservation.guestEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Huéspedes:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {reservation.guestsCount} personas
                  </span>
                </div>
                {reservation.specialNotes ? (
                  <div className="pt-2 text-xs border-t border-gray-50 dark:border-zinc-800">
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Notas:</span>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 italic bg-[#FAF8F5] dark:bg-zinc-800/40 p-2.5 rounded-xl border border-gray-100">
                      {reservation.specialNotes}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Financials breakdown */}
              {!isEmployeeMode ? (
                <div className="bg-white dark:bg-[#1A1B20] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      Total de la Estadía:
                    </span>
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      ${reservation.totalAmount} USD
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Comisión Plataforma ({reservation.platform.toUpperCase()}):</span>
                    <span>-${reservation.commissionPaid} USD</span>
                  </div>

                  <div className="flex justify-between text-[#2EA44F] font-bold pt-2 border-t border-gray-50 dark:border-zinc-800">
                    <span>Ingreso Neto Limpio en Mano:</span>
                    <span className="text-sm font-sans">${reservation.netRevenue} USD</span>
                  </div>
                </div>
              ) : null}

              {/* Action triggers */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMessagesWithGuest(reservation.id);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#E6F8EA] hover:bg-[#D4F5DC] text-[#2EA44F] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Plantilla por WhatsApp</span>
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
                    className="py-2.5 px-3 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] text-xs font-bold text-gray-700 transition-colors cursor-pointer text-center"
                  >
                    {reservation.status === 'checked_in' ? 'Marcar Check-out' : 'Marcar Check-in'}
                  </button>

                  <button
                    onClick={() => {
                      onDeleteReservation(reservation.id);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl border border-red-200/60 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
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
