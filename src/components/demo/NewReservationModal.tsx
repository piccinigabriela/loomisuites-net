import React, { useState } from 'react';
import { X, Plus, Calendar, User, DollarSign, KeyRound, Check, ShoppingBag, Trash2 } from 'lucide-react';
import { DemoState, Reservation, BookingPlatform, ReservationAddon, AddonService } from '../../types';
import { getRelativeDate } from '../../data/initialData';

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
  const [guestPhone, setGuestPhone] = useState('+54 9 11 ');
  const [checkIn, setCheckIn] = useState(initialDate || getRelativeDate(2));
  const [checkOut, setCheckOut] = useState(getRelativeDate(5));
  const [platform, setPlatform] = useState<BookingPlatform>('direct');
  const [guestsCount, setGuestsCount] = useState(2);
  const [specialNotes, setSpecialNotes] = useState('');

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

  if (!isOpen) return null;

  const selectedProp = demoState.properties.find((p) => p.id === propertyId);
  const addonsCatalog = demoState.addons || [];

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(1, d2.getTime() - d1.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

  const defaultNightPrice = selectedProp?.basePrice || 85;
  const effectiveNightPrice = isManualPrice && manualPricePerNight !== null ? manualPricePerNight : defaultNightPrice;
  const rawAccommodation = effectiveNightPrice * nights;
  const discountVal = customDiscountPercent > 0 ? Math.round((rawAccommodation * customDiscountPercent) / 100) : 0;
  const accommodationTotal = rawAccommodation - discountVal;
  const cleaningFee = selectedProp?.cleaningFee || 35;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomPin = `${Math.floor(1000 + Math.random() * 9000)}#`;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      propertyId,
      guestName: guestName || 'Huésped Invitado',
      guestEmail: guestEmail || 'huesped@ejemplo.com',
      guestPhone: guestPhone || '+54 9 11 5555-0000',
      guestAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
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
      paymentStatus: 'paid',
      pinCode: randomPin,
      specialNotes,
      createdAt: new Date().toISOString().split('T')[0],
      earlyCheckIn,
      lateCheckOut,
      earlyLateFee,
      customDiscountPercent,
      isManualPrice,
      airbnbFeeMode: platform === 'airbnb' ? airbnbFeeMode : undefined,
      addons: selectedAddons,
    };

    onSaveReservation(newRes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="bg-[#1c1b18] dark:bg-[#141414] text-white p-5 flex items-center justify-between border-b border-[#2e2a25] dark:border-[#222]">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#d88d5e]" />
            <h3 className="text-base font-bold font-['Outfit']">
              Crear Nueva Reserva (Demo)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Property */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Propiedad</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
            >
              {demoState.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.neighborhood} - {p.name} (${p.basePrice}/noche)
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Check-in</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Check-out</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Guest Name & Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Huésped</label>
              <input
                type="text"
                required
                placeholder="Ej: Sofía Herrera"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Canal de Origen</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as BookingPlatform)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              >
                <option value="direct">Directa (0% comisiones)</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="vrbo">VRBO</option>
              </select>
            </div>
          </div>

          {/* Modalidad de Comisión Airbnb (Soporte Cuentas Tradicionales 3% vs Simplificada 15%) */}
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

          {/* Tarifas Diferenciales y Descuentos para cualquier canal */}
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
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {isManualPrice ? 'Tarifa por Noche Especial (USD)' : `Tarifa Base de Lista: $${defaultNightPrice} USD`}
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
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
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
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Early Check-in (antes de 14hs)</span>
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
                  <span className="text-zinc-500">USD</span>
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
                placeholder="+54 9 11..."
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
                      <span className="font-bold text-purple-700 dark:text-purple-300">+${item.total} USD</span>
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
                    {a.name} — ${a.price} USD ({a.unitLabel})
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
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>
                {nights} noches x ${effectiveNightPrice} USD {isManualPrice && '(tarifa manual)'}:
              </span>
              <span>${rawAccommodation} USD</span>
            </div>
            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Descuento Especial (-{customDiscountPercent}%):</span>
                <span>-${discountVal} USD</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Tarifa de Limpieza:</span>
              <span>${cleaningFee} USD</span>
            </div>
            {earlyLateFee > 0 && (
              <div className="flex justify-between text-[#c46d45] dark:text-[#d88d5e] font-semibold">
                <span>Recargo Early / Late Check:</span>
                <span>+${earlyLateFee} USD</span>
              </div>
            )}
            {addonsTotal > 0 && (
              <div className="flex justify-between text-[#9c512a] dark:text-[#d88d5e] font-semibold">
                <span>Servicios Opcionales ({selectedAddons.length} agregados):</span>
                <span>+${addonsTotal} USD</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-[#ded9cd] dark:border-zinc-700">
              <span>Total a Cobrar:</span>
              <span className="text-sm font-extrabold text-[#c46d45] dark:text-[#d88d5e]">${totalAmount} USD</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-[#ded9cd] dark:border-zinc-700">
              <span>Comisión ({platform === 'airbnb' ? `Airbnb ${airbnbFeeMode === 'traditional_3' ? '3% tradicional' : '15% simplificada'}` : platform.toUpperCase()}):</span>
              <span>-${commissionPaid} USD</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span>Ingreso Neto Real en Mano:</span>
              <span>${netRevenue} USD</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs font-bold bg-[#c46d45] hover:bg-[#b55e37] text-white px-5 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar y Guardar Reserva</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
