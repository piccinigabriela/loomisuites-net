import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
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

  const startDateStr = dates[0]?.dateStr || '';
  const endDateStr = dates[dates.length - 1]?.dateStr || '';

  const filteredProperties =
    selectedPropertyId === 'all'
      ? demoState.properties
      : demoState.properties.filter((p) => p.id === selectedPropertyId);

  // Helper to get all reservations for a property that overlap with current visible dates
  const getVisibleReservationsForProperty = (propertyId: string) => {
    return demoState.reservations.filter((r) => {
      if (r.propertyId !== propertyId || r.status === 'cancelled') return false;
      if (platformFilter !== 'all' && r.platform !== platformFilter) return false;
      // Overlaps visible range: checkIn <= lastVisibleDate && checkOut > firstVisibleDate
      return r.checkIn <= endDateStr && r.checkOut > startDateStr;
    });
  };

  const getPlatformColors = (platform: BookingPlatform) => {
    switch (platform) {
      case 'airbnb':
        return 'bg-rose-500 hover:bg-rose-600 border-rose-400 text-white';
      case 'booking':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white';
      case 'direct':
        return 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white';
      case 'vrbo':
        return 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white';
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
            <span>Directa</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
            <span>VRBO</span>
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 italic">
          Haz clic en cualquier barra de reserva para ver detalles completos
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[1050px]">
          {/* Header Row of Days */}
          <div className="grid grid-cols-[220px_repeat(14,1fr)] border-b border-zinc-200 bg-zinc-100/70 text-zinc-700">
            <div className="p-3 font-bold text-xs border-r border-zinc-200 flex items-center justify-between sticky left-0 bg-zinc-100 z-20">
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
                <div className={`text-sm ${d.isToday ? 'text-rose-600 underline decoration-2 font-bold' : ''}`}>
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>

          {/* Properties Rows */}
          {filteredProperties.map((prop) => {
            const propertyReservations = getVisibleReservationsForProperty(prop.id);

            return (
              <div
                key={prop.id}
                className="grid grid-cols-[220px_repeat(14,1fr)] border-b border-zinc-200 relative min-h-[64px] hover:bg-zinc-50/50 transition-colors"
              >
                {/* Property Label Column */}
                <div className="p-3 border-r border-zinc-200 bg-white flex flex-col justify-center sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  <div className="font-bold text-xs text-zinc-900 truncate" title={prop.name}>
                    {prop.name}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                    <span>{prop.neighborhood}</span>
                    <span className="font-semibold text-zinc-800">${prop.basePrice}/n</span>
                  </div>
                </div>

                {/* 14 Day Background Slots */}
                {dates.map((d) => (
                  <div
                    key={d.dateStr}
                    className={`h-full border-r border-zinc-200 last:border-r-0 relative flex items-center justify-center ${
                      d.isToday ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <button
                      onClick={() =>
                        onOpenNewReservationWithProperty &&
                        onOpenNewReservationWithProperty(prop.id, d.dateStr)
                      }
                      title={`Crear reserva libre el ${d.dateStr}`}
                      className="w-full h-full opacity-0 hover:opacity-100 hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Continuous Reservation Bars (Spanning across full stay) */}
                {propertyReservations.map((res) => {
                  // Calculate start column index relative to visible dates (0 to 13)
                  const checkInIndex = dates.findIndex((d) => d.dateStr === res.checkIn);
                  const checkOutIndex = dates.findIndex((d) => d.dateStr === res.checkOut);

                  const startIndex = checkInIndex !== -1 ? checkInIndex : 0;
                  const endIndex = checkOutIndex !== -1 ? checkOutIndex : DAYS_TO_SHOW;
                  const spanDays = Math.max(1, endIndex - startIndex);

                  // Calculate pixel percentage: 220px fixed left column + 14 day columns
                  const leftPercentage = `calc(220px + (100% - 220px) * ${startIndex / DAYS_TO_SHOW} + 3px)`;
                  const widthPercentage = `calc((100% - 220px) * ${spanDays / DAYS_TO_SHOW} - 6px)`;

                  return (
                    <div
                      key={res.id}
                      style={{
                        left: leftPercentage,
                        width: widthPercentage,
                      }}
                      className="absolute top-2.5 bottom-2.5 z-10 flex items-center"
                    >
                      <button
                        onClick={() => onSelectReservation(res)}
                        className={`w-full h-full rounded-lg px-2.5 py-1 flex items-center justify-between text-left text-xs font-semibold cursor-pointer shadow-sm border transition-all hover:scale-[1.01] hover:shadow-md overflow-hidden ${getPlatformColors(
                          res.platform
                        )}`}
                        title={`${res.guestName} (${res.platform.toUpperCase()}) · ${formatDisplayDate(
                          res.checkIn
                        )} al ${formatDisplayDate(res.checkOut)} · $${res.totalAmount}`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-1">
                          <span className="text-[10px] font-extrabold uppercase px-1 py-0.2 rounded bg-black/20 shrink-0">
                            {res.platform}
                          </span>
                          <span className="font-bold text-xs truncate">
                            {res.guestName}
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] opacity-90 shrink-0 font-medium">
                          <span>${res.totalAmount}</span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
