import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeftRight,
  Columns,
  SlidersHorizontal,
} from 'lucide-react';
import { DemoState, Reservation, Property, BookingPlatform } from '../../types';
import { formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface DemoCalendarProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservationWithProperty?: (propertyId: string, date: string) => void;
}

type ColumnMode = 'compact' | 'medium' | 'full';

export const DemoCalendar: React.FC<DemoCalendarProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservationWithProperty,
}) => {
  const [dayOffset, setDayOffset] = useState<number>(-2); // Show from 2 days ago to +12 days ahead
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  // Column width: compact (48px) - perfect for mobile, medium (105px), full (185px)
  const [columnMode, setColumnMode] = useState<ColumnMode>('compact');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const getColumnWidthClass = (mode: ColumnMode) => {
    switch (mode) {
      case 'compact':
        return 'w-[48px] min-w-[48px] max-w-[48px] p-1 text-center';
      case 'medium':
        return 'w-[105px] min-w-[105px] max-w-[105px] p-2';
      case 'full':
        return 'w-[185px] min-w-[185px] max-w-[185px] p-3';
    }
  };

  const handleScrollTimeline = (direction: 'left' | 'right') => {
    if (timelineContainerRef.current) {
      const scrollAmount = 320;
      timelineContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const updateScrollProgress = () => {
    if (timelineContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  const handleSliderChange = (newPercent: number) => {
    setScrollProgress(newPercent);
    if (timelineContainerRef.current) {
      const { scrollWidth, clientWidth } = timelineContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      timelineContainerRef.current.scrollLeft = (newPercent / 100) * maxScroll;
    }
  };

  // Helper to extract a short label for mobile (e.g. "Cabaña 1" -> "C1")
  const getShortName = (name: string, index: number) => {
    const match = name.match(/\b(\d+)\b/);
    if (match) return `C${match[1]}`;
    return `C${index + 1}`;
  };

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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
      {/* Calendar Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-600 dark:text-rose-500" />
            <span>Calendario Multicanal Unificado</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sincronización instantánea bidireccional entre Airbnb, Booking, VRBO y Reservas Directas.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Property selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todas las propiedades ({demoState.properties.length})</option>
            {demoState.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.basePrice}/n)
              </option>
            ))}
          </select>

          {/* Platform selector */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos los canales</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking">Booking.com</option>
            <option value="direct">Directa (Web propia)</option>
            <option value="vrbo">VRBO</option>
          </select>

          {/* Day Offset Navigator */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setDayOffset((prev) => prev - 7)}
              title="Retroceder 7 días"
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(-2)}
              className="text-[11px] font-bold px-2 py-0.5 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + 7)}
              title="Avanzar 7 días"
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Column Width Selector: Compacta (48px) | Estándar (105px) | Amplia (185px) */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1.5 flex items-center gap-1">
              <Columns className="w-3 h-3 text-rose-600" />
              <span>Columna:</span>
            </span>
            <button
              onClick={() => setColumnMode('compact')}
              title="Columna ultra compacta (48px) - Ideal para móvil para que no ocupe media pantalla"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'compact'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              48px
            </button>
            <button
              onClick={() => setColumnMode('medium')}
              title="Columna estándar (105px)"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'medium'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              105px
            </button>
            <button
              onClick={() => setColumnMode('full')}
              title="Columna completa (185px) con datos extendidos"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'full'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              185px
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar & Desktop Tips */}
      <div className="bg-zinc-50 dark:bg-zinc-800/60 px-4 sm:px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-zinc-500 dark:text-zinc-400 text-[11px]">Canales:</span>
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
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="hidden lg:inline bg-zinc-200/70 dark:bg-zinc-700/60 px-2 py-0.5 rounded text-[10px] font-mono">
            Shift + Rueda del mouse
          </span>
          <span className="italic">
            o usa la barra deslizante para recorrer los 14 días
          </span>
        </div>
      </div>

      {/* High-Visibility Timeline Slider & Controller (Visible on Laptop & Mobile) */}
      <div className="bg-gradient-to-r from-rose-50/70 via-white to-amber-50/70 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-800/60 px-4 sm:px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs whitespace-nowrap">
            Desplazamiento horizontal (14 días):
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScrollTimeline('left')}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-rose-600" />
              <span>‹ Anterior</span>
            </button>
            <button
              onClick={() => handleScrollTimeline('right')}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la derecha"
            >
              <span>Siguiente ›</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-1 max-w-full sm:max-w-md">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Día 1</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600 border border-zinc-300 dark:border-zinc-600"
            title="Arrastra esta barra para deslizar horizontalmente por todo el calendario"
          />
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Día 14</span>
          <span className="font-mono text-[11px] font-black text-rose-600 dark:text-rose-400 min-w-[36px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div
        ref={timelineContainerRef}
        onScroll={updateScrollProgress}
        className="overflow-x-auto rounded-b-xl bg-white dark:bg-zinc-900 shadow-xs calendar-scrollbar"
      >
        <div className="min-w-[980px]">
          {/* Header Row of Days */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300">
            {/* Responsive Sticky Property Header Column */}
            <div className={`${getColumnWidthClass(columnMode)} font-bold text-xs border-r border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between sticky left-0 bg-zinc-100 dark:bg-zinc-800 z-30 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
              <span className="truncate">
                {columnMode === 'compact' ? 'Cab.' : columnMode === 'medium' ? 'Cabaña' : 'Propiedad'}
              </span>
              {columnMode === 'full' && (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Tarifa/Noche</span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
              {dates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`p-2 text-center border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 ${
                    d.isToday
                      ? 'bg-rose-50 dark:bg-rose-950/40 font-bold text-rose-700 dark:text-rose-400'
                      : ''
                  }`}
                >
                  <div className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400">{d.dayName}</div>
                  <div className={`text-sm ${d.isToday ? 'text-rose-600 dark:text-rose-400 underline decoration-2 font-bold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {d.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Properties Rows */}
          {filteredProperties.map((prop, propIndex) => {
            const propertyReservations = getVisibleReservationsForProperty(prop.id);

            return (
              <div
                key={prop.id}
                className="flex border-b border-zinc-200 dark:border-zinc-800 min-h-[64px] hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Property Label Column - Ultra-compact 48px on compact, 105px on medium, 185px on full */}
                <div className={`${getColumnWidthClass(columnMode)} border-r border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 flex flex-col justify-center sticky left-0 z-20 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
                  {columnMode === 'compact' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="text-[11px] font-black px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 block text-center"
                        title={prop.name}
                      >
                        {getShortName(prop.name, propIndex)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        ${prop.basePrice}
                      </span>
                    </div>
                  ) : columnMode === 'medium' ? (
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${prop.basePrice}/n
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span className="truncate pr-1">{prop.neighborhood}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">${prop.basePrice}/n</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 14 Day Timeline Container - contains both background slots and reservation bars */}
                <div className="flex-1 relative grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
                  {/* 14 Day Background Slots */}
                  {dates.map((d) => (
                    <div
                      key={d.dateStr}
                      className={`h-full border-r border-zinc-200 dark:border-zinc-800/80 last:border-r-0 relative flex items-center justify-center ${
                        d.isToday ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <button
                        onClick={() =>
                          onOpenNewReservationWithProperty &&
                          onOpenNewReservationWithProperty(prop.id, d.dateStr)
                        }
                        title={`Crear reserva libre el ${d.dateStr}`}
                        className="w-full h-full opacity-0 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Continuous Reservation Bars (contained 100% inside timeline area) */}
                  {propertyReservations.map((res) => {
                    // Calculate start column index relative to visible dates (0 to 13)
                    const checkInIndex = dates.findIndex((d) => d.dateStr === res.checkIn);
                    const checkOutIndex = dates.findIndex((d) => d.dateStr === res.checkOut);

                    const isContinuingFromBefore = checkInIndex === -1;
                    const isContinuingAfter = checkOutIndex === -1;

                    const startIndex = checkInIndex !== -1 ? checkInIndex : 0;
                    const endIndex = checkOutIndex !== -1 ? checkOutIndex : DAYS_TO_SHOW;
                    const spanDays = Math.max(1, endIndex - startIndex);

                    const leftPercent = (startIndex / DAYS_TO_SHOW) * 100;
                    const widthPercent = (spanDays / DAYS_TO_SHOW) * 100;

                    return (
                      <div
                        key={res.id}
                        style={{
                          left: `calc(${leftPercent}% + 2px)`,
                          width: `calc(${widthPercent}% - 4px)`,
                        }}
                        className="absolute top-2.5 bottom-2.5 z-10 flex items-center"
                      >
                        <button
                          onClick={() => onSelectReservation(res)}
                          className={`w-full h-full ${
                            isContinuingFromBefore ? 'rounded-l-none' : 'rounded-l-lg'
                          } ${
                            isContinuingAfter ? 'rounded-r-none' : 'rounded-r-lg'
                          } px-2 sm:px-2.5 py-1 flex items-center justify-between text-left text-xs font-semibold cursor-pointer shadow-sm border transition-all hover:scale-[1.01] hover:shadow-md overflow-hidden ${getPlatformColors(
                            res.platform
                          )}`}
                          title={`${res.guestName} (${res.platform.toUpperCase()}) · ${formatDisplayDate(
                            res.checkIn
                          )} al ${formatDisplayDate(res.checkOut)} · $${res.totalAmount}`}
                        >
                          <div className="flex items-center gap-1.5 truncate pr-1">
                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-white/25 text-white shrink-0" title="Comisión Airbnb 3% anfitrión tradicional">
                                3%
                              </span>
                            )}
                            {(res.earlyCheckIn || res.lateCheckOut) && (
                              <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-amber-400 text-amber-950 shrink-0" title={res.earlyCheckIn ? 'Early Check-in' : 'Late Check-out'}>
                                {res.earlyCheckIn ? 'Early' : 'Late'}
                              </span>
                            )}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Horizontal Scroll Slider & Pan Bar for Laptop and Desktop */}
      <div className="bg-zinc-100 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-700 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleScrollTimeline('left')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días anteriores"
          >
            <ChevronLeft className="w-4 h-4 text-rose-600" />
            <span>‹ Días anteriores</span>
          </button>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 sm:hidden">
            Deslizar timeline
          </span>
          <button
            onClick={() => handleScrollTimeline('right')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días siguientes"
          >
            <span>Días siguientes ›</span>
            <ChevronRight className="w-4 h-4 text-rose-600" />
          </button>
        </div>

        {/* Slider track for Laptops */}
        <div className="w-full sm:max-w-md flex items-center gap-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap hidden md:inline">
            Barra de desplazamiento:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
            title="Arrastra para navegar por los 14 días"
          />
          <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 font-bold min-w-[34px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </div>
  );
};
