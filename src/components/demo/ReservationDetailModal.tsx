import React from 'react';
import {
  X,
  Calendar,
  KeyRound,
  User,
  Phone,
  Mail,
  DollarSign,
  Send,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Reservation, Property, ReservationStatus } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../data/initialData';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  property: Property | undefined;
  onClose: () => void;
  onUpdateStatus: (resId: string, newStatus: ReservationStatus) => void;
  onDeleteReservation: (resId: string) => void;
  onOpenMessagesWithGuest: (resId: string) => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  property,
  onClose,
  onUpdateStatus,
  onDeleteReservation,
  onOpenMessagesWithGuest,
}) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={reservation.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={reservation.guestName}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <h3 className="text-base font-bold font-['Outfit']">{reservation.guestName}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  reservation.platform === 'airbnb'
                    ? 'bg-rose-500 text-white'
                    : reservation.platform === 'booking'
                    ? 'bg-blue-500 text-white'
                    : reservation.platform === 'direct'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-500 text-white'
                }`}
              >
                Canal: {reservation.platform}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Property name */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Alojamiento</span>
            <h4 className="text-sm font-bold text-zinc-900">{property?.name}</h4>
            <p className="text-xs text-zinc-500">{property?.address}, {property?.neighborhood}</p>
          </div>

          {/* Dates & Nights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
              <span className="text-[10px] text-zinc-400 font-medium block">Check-in</span>
              <span className="text-xs font-bold text-zinc-900">{formatDisplayDate(reservation.checkIn)}</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
              <span className="text-[10px] text-zinc-400 font-medium block">Estadía</span>
              <span className="text-xs font-bold text-zinc-900">{reservation.nights} noches</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
              <span className="text-[10px] text-zinc-400 font-medium block">Check-out</span>
              <span className="text-xs font-bold text-zinc-900">{formatDisplayDate(reservation.checkOut)}</span>
            </div>
          </div>

          {/* Smart Lock PIN Box */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-[11px] font-bold text-blue-900 block">PIN de Cerradura Inteligente</span>
                <span className="text-xs text-blue-700">Válido exclusivamente durante las fechas de estancia</span>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono bg-white px-3 py-1 rounded-lg border border-blue-200 text-blue-900">
              {reservation.pinCode}
            </span>
          </div>

          {/* Guest contact */}
          <div className="space-y-2 text-xs text-zinc-600">
            <div className="flex items-center justify-between py-1 border-b border-zinc-100">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Phone className="w-3.5 h-3.5" /> WhatsApp:
              </span>
              <span className="font-semibold text-zinc-900">{reservation.guestPhone}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-zinc-100">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Mail className="w-3.5 h-3.5" /> Correo:
              </span>
              <span className="font-semibold text-zinc-900">{reservation.guestEmail}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Huéspedes:</span>
              <span className="font-semibold text-zinc-900">{reservation.guestsCount} personas</span>
            </div>
          </div>

          {/* Financials breakdown */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs space-y-1">
            <div className="flex justify-between text-zinc-600">
              <span>Total Pagado por Huésped:</span>
              <span className="font-bold text-zinc-900">${reservation.totalAmount} USD</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Comisión de Plataforma ({reservation.platform}):</span>
              <span>-${reservation.commissionPaid} USD</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-zinc-200">
              <span>Ingreso Neto para Anfitrión:</span>
              <span>${reservation.netRevenue} USD</span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMessagesWithGuest(reservation.id);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
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
                className="py-2 px-3 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
              >
                {reservation.status === 'checked_in' ? 'Marcar Check-out' : 'Marcar Check-in'}
              </button>

              <button
                onClick={() => {
                  onDeleteReservation(reservation.id);
                  onClose();
                }}
                className="py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Reserva</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
