import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Info,
  Building,
} from 'lucide-react';
import { DemoState, Reservation, Property, BookingPlatform } from '../../types';
import { formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface DemoCalendarProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservationWithProperty?: (propertyId: string, date: string) => void;
}

export const DemoCalendar: React.FC<DemoCalendarProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservationWithProperty,
}) => {
  const [dayOffset, setDayOffset] = useState<number>(-2); // Show from 2 days ago to +12 days ahead
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const DAYS_TO_SHOW = 14;

  // Generate date array
  const dates: { dateStr: string; dayNum: string; dayName: string; isToday: boolean }[] = [];
  const todayStr = getRelativeDate(0);

  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({
      dateStr,
      dayNum: d.getDate().toString(),
      dayName: dayNamesShort[d.getDay()],
      isToday: dateStr === todayStr,
    });
  }

  const filteredProperties =
    selectedPropertyId === 'all'
      ? demoState.properties
      : demoState.properties.filter((p) => p.id === selectedPropertyId);

  // Helper to find reservations for a property on a given date
  const getReservationForSlot = (propertyId: string, dateStr: string) => {
    return demoState.reservations.find(
      (r) =>
        r.propertyId === propertyId &&
        r.status !== 'cancelled' &&
        dateStr >= r.checkIn &&
        dateStr < r.checkOut &&
        (platformFilter === 'all' || r.platform === platformFilter)
    );
  };

  const getPlatformBadge = (platform: BookingPlatform) => {
    switch (platform) {
      case 'airbnb':
        return 'bg-rose-500 text-white hover:bg-rose-600';
      case 'booking':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'direct':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'vrbo':
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
      default:
        return 'bg-zinc-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Calendar Header / Filters */}
      <div className="p-5 border-b border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-600" />
            <span>Calendario Multicanal Unificado</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Sincronización instantánea bidireccional entre Airbnb, Booking, VRBO y Reservas Directas.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Property selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-800"
          >
            <option value="all">Todas las propiedades ({demoState.properties.length})</option>
            {demoState.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.neighborhood} - {p.name.slice(0, 24)}...
              </option>
            ))}
          </select>

          {/* Platform selector */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-800"
          >
            <option value="all">Todos los canales</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking">Booking.com</option>
            <option value="direct">Directa (Web propia)</option>
            <option value="vrbo">VRBO</option>
          </select>

          {/* Day Offset Navigator */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              onClick={() => setDayOffset((prev) => prev - 7)}
              title="Semana anterior"
              className="p-1 hover:bg-white rounded transition-colors text-zinc-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(-2)}
              className="text-[11px] font-bold px-2 py-0.5 hover:bg-white rounded transition-colors text-zinc-700 cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + 7)}
              title="Semana siguiente"
              className="p-1 hover:bg-white rounded transition-colors text-zinc-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="bg-zinc-50 px-5 py-2.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-zinc-600 text-[11px]">Canales:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span>Airbnb</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span>Booking.com</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span>Directa (0% com)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
            <span>VRBO</span>
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 italic">
          Haz clic en cualquier celda para ver detalles o agregar reserva
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[950px]">
          {/* Header Row of Days */}
          <div className="grid grid-cols-[220px_repeat(14,1fr)] border-b border-zinc-200 bg-zinc-100/70 text-zinc-700">
            <div className="p-3 font-bold text-xs border-r border-zinc-200 flex items-center justify-between">
              <span>Propiedad</span>
              <span className="text-[10px] text-zinc-500 font-normal">Tarifa/Noche</span>
            </div>
            {dates.map((d) => (
              <div
                key={d.dateStr}
                className={`p-2 text-center border-r border-zinc-200 last:border-r-0 ${
                  d.isToday ? 'bg-rose-50 font-bold text-rose-700' : ''
                }`}
              >
                <div className="text-[10px] uppercase">{d.dayName}</div>
                <div className={`text-sm ${d.isToday ? 'text-rose-600 underline decoration-2' : ''}`}>
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>

          {/* Properties Rows */}
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="grid grid-cols-[220px_repeat(14,1fr)] border-b border-zinc-200 hover:bg-zinc-50/50 transition-colors"
            >
              {/* Property Label Column */}
              <div className="p-3 border-r border-zinc-200 bg-white flex flex-col justify-center">
                <div className="font-bold text-xs text-zinc-900 truncate" title={prop.name}>
                  {prop.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                  <span>{prop.neighborhood}</span>
                  <span className="font-semibold text-zinc-800">${prop.basePrice}/n</span>
                </div>
              </div>

              {/* Day Cells */}
              {dates.map((d) => {
                const res = getReservationForSlot(prop.id, d.dateStr);
                const isCheckInDay = res && res.checkIn === d.dateStr;
                const isCheckOutDay = res && res.checkOut === d.dateStr;

                return (
                  <div
                    key={d.dateStr}
                    className={`h-16 border-r border-zinc-200 last:border-r-0 p-1 relative flex items-center justify-center ${
                      d.isToday ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {res ? (
                      <button
                        onClick={() => onSelectReservation(res)}
                        className={`w-full h-12 rounded-md p-1 flex flex-col justify-center text-left text-xs font-semibold cursor-pointer shadow-xs transition-transform hover:scale-102 ${getPlatformBadge(
                          res.platform
                        )}`}
                        title={`${res.guestName} (${res.platform.toUpperCase()}) - ${formatDisplayDate(res.checkIn)} a ${formatDisplayDate(res.checkOut)}`}
                      >
                        {isCheckInDay ? (
                          <>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-90">
                              Llega: {res.guestName.split(' ')[0]}
                            </span>
                            <span className="text-[9px] opacity-80">${res.totalAmount}</span>
                          </>
                        ) : (
                          <div className="w-full text-center">
                            <span className="text-[9px] truncate block opacity-90">
                              {res.guestName.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onOpenNewReservationWithProperty &&
                          onOpenNewReservationWithProperty(prop.id, d.dateStr)
                        }
                        title={`Crear reserva libre en ${prop.neighborhood} el ${d.dateStr}`}
                        className="w-full h-full rounded opacity-0 hover:opacity-100 hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
