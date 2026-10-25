import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, DollarSign, KeyRound, Check, ShoppingBag, Trash2 } from 'lucide-react';
import { DemoState, Reservation, BookingPlatform, ReservationAddon, AddonService, PaymentStatus, ReservationPayment, CurrencyCode } from '../../types';
import { getRelativeDate, toLocalDateStr, formatCurrency, getActiveCurrency, getGuideHours, withHs } from '../../data/initialData';
import { isAppMode } from '../../lib/appMode';
import { normalizePricing, quoteStay } from '../../lib/pricing';

interface NewReservationModalProps {
  isOpen: boolean;
  demoState: DemoState;
  initialPropertyId?: string;
  initialDate?: string;
  onClose: () => void;
  onSaveReservation: (reservation: Reservation) => void;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  demoState,
  initialPropertyId,
  initialDate,
  onClose,
  onSaveReservation,
}) => {
  const [propertyId, setPropertyId] = useState<string>(
    initialPropertyId || demoState.properties[0]?.id || ''
  );
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialDate || getRelativeDate(2));
  const [checkOut, setCheckOut] = useState(getRelativeDate(5));
  const [platform, setPlatform] = useState<BookingPlatform>('direct');
  const [guestsCount, setGuestsCount] = useState(2);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [specialNotes, setSpecialNotes] = useState('');
  // Seña real (monto, moneda y método que informa el anfitrión)
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositCurrency, setDepositCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [depositMethod, setDepositMethod] = useState<ReservationPayment['method']>('transferencia');
  const [formError, setFormError] = useState<string | null>(null);

  // Nuevas opciones avanzadas solicitadas:
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [earlyLateFee, setEarlyLateFee] = useState(0);
  const [customDiscountPercent, setCustomDiscountPercent] = useState(0);
  const [isManualPrice, setIsManualPrice] = useState(false);
  const [manualPricePerNight, setManualPricePerNight] = useState<number | null>(null);
  const [airbnbFeeMode, setAirbnbFeeMode] = useState<'traditional_3' | 'simplified_15'>('traditional_3');

  // Addons selection in new reservation modal
  const [selectedAddons, setSelectedAddons] = useState<ReservationAddon[]>([]);
  const [selectedAddonIdToAdd, setSelectedAddonIdToAdd] = useState<string>('');

  // Reload initial values every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      const defaultPropId = initialPropertyId || demoState.properties[0]?.id || '';
      setPropertyId(defaultPropId);
      const defaultCheckIn = initialDate || getRelativeDate(2);
      setCheckIn(defaultCheckIn);

      const d = new Date(defaultCheckIn);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 3);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setCheckOut(`${yyyy}-${mm}-${dd}`);
      } else {
        setCheckOut(getRelativeDate(5));
      }

      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setPlatform('direct');
      setGuestsCount(2);
      setPaymentStatus('pending');
      setSpecialNotes('');
      setDepositAmount('');
      setDepositCurrency(demoState.currencySettings?.settlementCurrency || getActiveCurrency());
      setDepositMethod('transferencia');
      setFormError(null);
      setEarlyCheckIn(false);
      setLateCheckOut(false);
      setEarlyLateFee(0);
      setCustomDiscountPercent(0);
      setIsManualPrice(false);
      setManualPricePerNight(null);
      setSelectedAddons([]);
      setSelectedAddonIdToAdd('');
    }
  }, [isOpen, initialPropertyId, initialDate, demoState.properties, demoState.currencySettings?.settlementCurrency]);

  if (!isOpen) return null;

  const isPropertyValid = Boolean(propertyId && demoState.properties.some((p) => p.id === propertyId));
  const selectedProp = demoState.properties.find((p) => p.id === propertyId);
  const addonsCatalog = demoState.addons || [];

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(1, d2.getTime() - d1.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

  // Planilla de tarifas: cada noche según temporada, fin de semana o finde largo
  const quote = quoteStay(demoState.pricing, selectedProp, checkIn, checkOut);
  const useTable = quote.fromTable && quote.nights.length > 0;
  const defaultNightPrice = useTable ? Math.round(quote.total / quote.nights.length) : selectedProp?.basePrice ?? 0;
  const effectiveNightPrice = isManualPrice && manualPricePerNight !== null ? manualPricePerNight : defaultNightPrice;
  const rawAccommodation = isManualPrice || !useTable ? effectiveNightPrice * nights : quote.total;
  const discountVal = customDiscountPercent > 0 ? Math.round((rawAccommodation * customDiscountPercent) / 100) : 0;
  const accommodationTotal = rawAccommodation - discountVal;
  const cleaningFee = selectedProp?.cleaningFee ?? 0;
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = accommodationTotal + cleaningFee + earlyLateFee + addonsTotal;

  const handleAddAddonItem = (addonId: string) => {
    const item = addonsCatalog.find((a) => a.id === addonId);
    if (!item) return;

    setSelectedAddons((prev) => {
      const existing = prev.find((a) => a.addonId === addonId);
      if (existing) {
        return prev.map((a) =>
          a.addonId === addonId
            ? { ...a, quantity: a.quantity + 1, total: (a.quantity + 1) * a.unitPrice }
            : a
        );
      }
      return [
        ...prev,
        {
          addonId: item.id,
          name: item.name,
          category: item.category,
          unitPrice: item.price,
          quantity: 1,
          total: item.price,
          status: 'solicitado',
          addedAt: new Date().toISOString(),
        },
      ];
    });
    setSelectedAddonIdToAdd('');
  };

  const handleRemoveAddonItem = (addonId: string) => {
    setSelectedAddons((prev) => prev.filter((a) => a.addonId !== addonId));
  };

  // Commission calculation (considering Airbnb 3% legacy mode vs 15% standard)
  let commissionRate = 0;
  if (platform === 'booking' || platform === 'vrbo') {
    commissionRate = 0.15;
  } else if (platform === 'airbnb') {
    commissionRate = airbnbFeeMode === 'traditional_3' ? 0.03 : 0.15;
  } else {
    commissionRate = 0; // Direct booking
  }

  const commissionPaid = Math.round(accommodationTotal * commissionRate);
  const netRevenue = totalAmount - commissionPaid;

  // Seña: conversión a la moneda de liquidación con la cotización cargada por el administrador
  const settlementCurrency: CurrencyCode = demoState.currencySettings?.settlementCurrency || getActiveCurrency();
  const depositValue = parseFloat(depositAmount) || 0;
  const depositRate =
    depositCurrency === settlementCurrency ? 1 : demoState.currencySettings?.rates?.[depositCurrency] || 0;
  const depositSettlement = Math.round(depositValue * depositRate);
  const isDepositMissingRate = paymentStatus === 'deposit_only' && depositCurrency !== settlementCurrency && depositRate <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPropertyValid) return;

    if (paymentStatus === 'deposit_only') {
      if (depositValue <= 0) {
        setFormError('Ingresá el monto de la seña');
        return;
      }
      if (isDepositMissingRate) {
        setFormError(`Falta la cotización de ${depositCurrency}: cargala en Finanzas o registrá la seña en ${settlementCurrency}`);
        return;
      }
      if (totalAmount > 0 && depositSettlement >= totalAmount) {
        setFormError('La seña debe ser menor al total. Si pagó todo, elegí "Pagado".');
        return;
      }
    }
    setFormError(null);


    const initialPayments: ReservationPayment[] = [];
    if (paymentStatus === 'paid') {
      initialPayments.push({
        id: `pay-${Date.now()}`,
        date: toLocalDateStr(new Date()),
        amount: totalAmount,
        currency: settlementCurrency,
        rate: 1,
        amountSettlement: totalAmount,
        method: platform === 'direct' ? 'efectivo' : 'plataforma',
        note: 'Pago total al registrar reserva',
      });
    } else if (paymentStatus === 'deposit_only') {
      initialPayments.push({
        id: `pay-${Date.now()}`,
        date: toLocalDateStr(new Date()),
        amount: depositValue,
        currency: depositCurrency,
        rate: depositRate,
        amountSettlement: depositSettlement,
        method: depositMethod,
        note: 'Seña al registrar la reserva',
      });
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      propertyId,
      guestName: guestName.trim() || 'Huésped Invitado',
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      checkIn,
      checkOut,
      nights,
      guestsCount,
      platform,
      totalAmount,
      cleaningFee,
      commissionPaid,
      netRevenue,
      status: 'confirmed',
      paymentStatus,
      pinCode: '',
      specialNotes: specialNotes.trim(),
      createdAt: toLocalDateStr(new Date()),
      earlyCheckIn,
      lateCheckOut,
      earlyLateFee,
      customDiscountPercent,
      isManualPrice,
      airbnbFeeMode: platform === 'airbnb' ? airbnbFeeMode : undefined,
      addons: selectedAddons,
      payments: initialPayments,
    };

    onSaveReservation(newRes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-[#F8F9FA] dark:bg-[#111215] w-full max-w-lg rounded-[28px] shadow-2xl border border-black/[0.03] dark:border-white/[0.04] overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="bg-[#ECE7E0] dark:bg-[#18191E] text-gray-900 dark:text-gray-100 p-4 sm:p-5 flex items-center justify-between border-b border-[#DDD7CD]/50 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6D8C3] text-[#D86F35] flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Crear Nueva Reserva
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">Carga manual o directa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#EDE8E1] hover:bg-[#E3DDD4] text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Property */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Alojamiento</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 cursor-pointer shadow-xs"
            >
              {!isPropertyValid && <option value="">-- Elegí una unidad --</option>}
              {demoState.properties.map((p) => {
                const isApp = isAppMode();
                let neighborhoodStr = p.neighborhood ? p.neighborhood.trim() : '';
                if (isApp && neighborhoodStr === 'Centro / Zona Residencial') {
                  neighborhoodStr = '';
                }
                const neighborhoodPart = neighborhoodStr ? ` · ${neighborhoodStr}` : '';
                const pricingSettings = demoState.pricing ? normalizePricing(demoState.pricing) : null;
                const typeName = pricingSettings?.types.find((t) => t.id === pricingSettings.assignments[p.id])?.name;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}{neighborhoodPart} ({typeName || `${formatCurrency(p.basePrice)}/noche`})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Check-in</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 font-mono cursor-pointer shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Check-out</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 font-mono cursor-pointer shadow-xs"
              />
            </div>
          </div>

          {/* Guest Name & Channel */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Huésped</label>
              <input
                type="text"
                required
                placeholder="Ej: Sofía Herrera"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Canal de Origen</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as BookingPlatform)}
                className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 cursor-pointer shadow-xs"
              >
                <option value="direct">Directa (0% comisiones)</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="vrbo">VRBO</option>
              </select>
            </div>
          </div>

          {/* Payment Status Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Estado de Pago
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 cursor-pointer shadow-xs"
            >
              <option value="pending">Pendiente</option>
              <option value="deposit_only">Seña</option>
              <option value="paid">Pagado</option>
            </select>

            {paymentStatus === 'deposit_only' && (
              <div className="mt-2 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 space-y-2">
                <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Monto de la seña*
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Ej: 30000"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D86F35]/40 shadow-xs"
                  />
                  <select
                    value={depositCurrency}
                    onChange={(e) => {
                      setDepositCurrency(e.target.value as CurrencyCode);
                      setFormError(null);
                    }}
                    className="text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 cursor-pointer shadow-xs"
                  >
                    {(['ARS', 'USD', 'BRL', 'EUR'] as CurrencyCode[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as ReservationPayment['method'])}
                  className="w-full text-xs font-semibold p-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 cursor-pointer shadow-xs"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="plataforma">Pagado en la plataforma</option>
                  <option value="otro">Otro</option>
                </select>
                {isDepositMissingRate ? (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    Falta la cotización de {depositCurrency}: cargala en Finanzas o registrá la seña en {settlementCurrency}.
                  </p>
                ) : (
                  depositValue > 0 &&
                  depositCurrency !== settlementCurrency && (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Equivale a {formatCurrency(depositSettlement, settlementCurrency)} (1 {depositCurrency} = {depositRate} {settlementCurrency})
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Modalidad de Comisión Airbnb */}
          {platform === 'airbnb' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-rose-900 dark:text-rose-300 block">Modalidad de Comisión Airbnb:</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/60 cursor-pointer">
                  <input
                    type="radio"
                    name="airbnbFee"
                    checked={airbnbFeeMode === 'traditional_3'}
                    onChange={() => setAirbnbFeeMode('traditional_3')}
                    className="text-rose-600"
                  />
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] block">Tradicional (3% anfitrión)</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Cuentas creadas antes o sin software obligatorio</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/60 cursor-pointer">
                  <input
                    type="radio"
                    name="airbnbFee"
                    checked={airbnbFeeMode === 'simplified_15'}
                    onChange={() => setAirbnbFeeMode('simplified_15')}
                    className="text-rose-600"
                  />
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] block">Simplificada (15% anfitrión)</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Comisión total deducida al anfitrión</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Tarifas Diferenciales y Descuentos */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">Tarifa Manual & Descuentos (Todos los Canales)</span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  {platform === 'direct'
                    ? 'Precios acordados por WhatsApp o promociones directas'
                    : `Bloqueos de ${platform.toUpperCase()}: el calendario iCal no transmite tarifas; puedes fijar el importe real cobrado`}
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold shrink-0">
                <input
                  type="checkbox"
                  checked={isManualPrice}
                  onChange={(e) => {
                    setIsManualPrice(e.target.checked);
                    if (e.target.checked && manualPricePerNight === null) {
                      setManualPricePerNight(defaultNightPrice);
                    }
                  }}
                  className="rounded text-rose-600"
                />
                <span>Fijar Tarifa Manual</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isManualPrice
                    ? `Tarifa por Noche Especial (${getActiveCurrency()})`
                    : useTable
                    ? `Según tarifas: promedio ${formatCurrency(defaultNightPrice)}/noche`
                    : `Tarifa Base de Lista: ${formatCurrency(defaultNightPrice)}`}
                </label>
                <input
                  type="number"
                  disabled={!isManualPrice}
                  value={isManualPrice && manualPricePerNight !== null ? manualPricePerNight : defaultNightPrice}
                  onChange={(e) => setManualPricePerNight(Math.max(0, Number(e.target.value)))}
                  className={`w-full text-xs font-bold p-2 rounded-lg border ${
                    isManualPrice
                      ? 'border-amber-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Descuento Especial (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ej: 10% amigo/directo"
                  value={customDiscountPercent || ''}
                  onChange={(e) => setCustomDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full text-xs font-bold p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Early Check-in & Late Check-out */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-300">Flexibilidad de Ingreso / Egreso</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">Early & Late check</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={earlyCheckIn}
                  onChange={(e) => {
                    setEarlyCheckIn(e.target.checked);
                    if (e.target.checked && earlyLateFee === 0) setEarlyLateFee(15);
                  }}
                  className="rounded text-amber-600"
                />
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Early Check-in ({getGuideHours(demoState.welcomeGuide, isAppMode()).checkin ? `antes de las ${withHs(getGuideHours(demoState.welcomeGuide, isAppMode()).checkin)}` : 'antes del horario de ingreso'})</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lateCheckOut}
                  onChange={(e) => {
                    setLateCheckOut(e.target.checked);
                    if (e.target.checked && earlyLateFee === 0) setEarlyLateFee(15);
                  }}
                  className="rounded text-amber-600"
                />
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Late Check-out (después de 11hs)</span>
              </label>
            </div>

            {(earlyCheckIn || lateCheckOut) && (
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">Recargo total por flexibilidad horaria:</span>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={earlyLateFee}
                    onChange={(e) => setEarlyLateFee(Math.max(0, Number(e.target.value)))}
                    className="w-16 p-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-right font-bold"
                  />
                  <span className="text-zinc-500">{getActiveCurrency()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">WhatsApp Huésped</label>
              <input
                type="tel"
                placeholder="Ej: +54 9 11 1234-5678"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cant. Huéspedes</label>
              <input
                type="number"
                min="1"
                max={selectedProp?.maxGuests || 6}
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="Ej: huesped@mail.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Optional Addons Picker */}
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Servicios Opcionales & Extras</span>
              </span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400">
                {selectedAddons.length} seleccionados
              </span>
            </div>

            {selectedAddons.length > 0 && (
              <div className="space-y-1">
                {selectedAddons.map((item) => (
                  <div
                    key={item.addonId}
                    className="flex items-center justify-between p-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-purple-200 dark:border-purple-900/50 text-[11px]"
                  >
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-2">
                      {item.name} ({item.quantity}x)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-700 dark:text-purple-300">+{formatCurrency(item.total)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddonItem(item.addonId)}
                        className="text-zinc-400 hover:text-red-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedAddonIdToAdd}
                onChange={(e) => {
                  if (e.target.value) handleAddAddonItem(e.target.value);
                }}
                className="flex-1 text-[11px] p-2 rounded-lg border border-[#ded9cd] dark:border-[#383838] bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="">+ Agregar servicio opcional (Frigobar, Traslado, Spa, Desayuno)...</option>
                {addonsCatalog.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {formatCurrency(a.price)} ({a.unitLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Notas especiales</label>
            <input
              type="text"
              placeholder="Ej: Llega tarde en la noche, solicita cuna..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Price Summary Preview */}
          <div className="bg-[#f8f6f2] dark:bg-zinc-800/80 p-3.5 rounded-xl border border-[#ded9cd] dark:border-zinc-700 text-xs space-y-1.5">
            {useTable && !isManualPrice ? (
              quote.groups.map((g) => (
                <div key={g.label + g.price} className="flex justify-between gap-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                  <span>
                    {g.count} {g.count === 1 ? 'noche' : 'noches'} · {g.label} × {formatCurrency(g.price)}
                  </span>
                  <span className="whitespace-nowrap shrink-0">{formatCurrency(g.subtotal)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>
                  {nights} noches x {formatCurrency(effectiveNightPrice)} {isManualPrice && '(tarifa manual)'}:
                </span>
                <span>{formatCurrency(rawAccommodation)}</span>
              </div>
            )}
            {quote.belowMinimum && (
              <div className="text-amber-800 dark:text-amber-200 font-bold">
                Ojo: el mínimo es de {quote.minNights} noches ({quote.minNightsPeriod}). Igual podés guardarla.
              </div>
            )}
            {useTable && quote.missingPrices && !isManualPrice && (
              <div className="text-amber-800 dark:text-amber-200 font-bold">
                Faltan precios en la planilla para algunas noches: se usó la tarifa normal o el precio base.
              </div>
            )}
            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Descuento Especial (-{customDiscountPercent}%):</span>
                <span>-{formatCurrency(discountVal)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Tarifa de Limpieza:</span>
              <span>{formatCurrency(cleaningFee)}</span>
            </div>
            {earlyLateFee > 0 && (
              <div className="flex justify-between text-[#c46d45] dark:text-[#d88d5e] font-semibold">
                <span>Recargo Early / Late Check:</span>
                <span>+{formatCurrency(earlyLateFee)}</span>
              </div>
            )}
            {addonsTotal > 0 && (
              <div className="flex justify-between text-[#9c512a] dark:text-[#d88d5e] font-semibold">
                <span>Servicios Opcionales ({selectedAddons.length} agregados):</span>
                <span>+{formatCurrency(addonsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-[#ded9cd] dark:border-zinc-700">
              <span>Total a Cobrar:</span>
              <span className="text-sm font-extrabold text-[#c46d45] dark:text-[#d88d5e]">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-[#ded9cd] dark:border-zinc-700">
              <span>Comisión ({platform === 'airbnb' ? `Airbnb ${airbnbFeeMode === 'traditional_3' ? '3% tradicional' : '15% simplificada'}` : platform.toUpperCase()}):</span>
              <span>-{formatCurrency(commissionPaid)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>Ingreso Neto Real en Mano:</span>
              <span className="font-mono">{formatCurrency(netRevenue)}</span>
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              ⚠️ {formError}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white px-4 py-2.5 rounded-none cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isPropertyValid}
              className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${
                !isPropertyValid
                  ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#E1500A] hover:bg-[#C44307] text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{!isPropertyValid ? 'Elegí una unidad' : 'Confirmar y Guardar Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

