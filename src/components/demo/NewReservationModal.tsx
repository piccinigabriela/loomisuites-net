import React, { useState } from 'react';
import { X, Plus, Calendar, User, DollarSign, KeyRound, Check } from 'lucide-react';
import { DemoState, Reservation, BookingPlatform } from '../../types';
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

  if (!isOpen) return null;

  const selectedProp = demoState.properties.find((p) => p.id === propertyId);

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(1, d2.getTime() - d1.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

  const baseNightPrice = selectedProp?.basePrice || 85;
  const cleaningFee = selectedProp?.cleaningFee || 35;
  const accommodationTotal = baseNightPrice * nights;
  const totalAmount = accommodationTotal + cleaningFee;

  // Commission
  const commissionRate = platform === 'direct' ? 0 : platform === 'booking' ? 0.15 : 0.15;
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
    };

    onSaveReservation(newRes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" />
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
            <label className="block text-xs font-bold text-zinc-700 mb-1">Propiedad</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-800"
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
              <label className="block text-xs font-bold text-zinc-700 mb-1">Check-in</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Check-out</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 bg-white"
              />
            </div>
          </div>

          {/* Guest Name & Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Nombre del Huésped</label>
              <input
                type="text"
                required
                placeholder="Ej: Sofía Herrera"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Canal de Origen</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as BookingPlatform)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 bg-white"
              >
                <option value="direct">Directa (0% comisiones)</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="vrbo">VRBO</option>
              </select>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">WhatsApp Huésped</label>
              <input
                type="tel"
                placeholder="+54 9 11..."
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Cant. Huéspedes</label>
              <input
                type="number"
                min="1"
                max={selectedProp?.maxGuests || 6}
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Notas especiales</label>
            <input
              type="text"
              placeholder="Ej: Llega tarde en la noche, solicita cuna..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300"
            />
          </div>

          {/* Price Summary Preview */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs space-y-1.5">
            <div className="flex justify-between text-zinc-600">
              <span>{nights} noches x ${baseNightPrice} USD:</span>
              <span>${accommodationTotal} USD</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tarifa de Limpieza:</span>
              <span>${cleaningFee} USD</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-900 pt-1 border-t border-zinc-200">
              <span>Total a Cobrar:</span>
              <span className="text-sm font-extrabold text-rose-600">${totalAmount} USD</span>
            </div>
            {platform === 'direct' && (
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                ✓ Reserva directa: Te ahorraste ${(accommodationTotal * 0.15).toFixed(0)} USD en comisiones de OTAs.
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
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
