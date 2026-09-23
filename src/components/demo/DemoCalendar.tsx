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
  RotateCw,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { DemoState, Reservation, Property, BookingPlatform } from '../../types';
import { formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface DemoCalendarProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservationWithProperty?: (propertyId: string, date: string) => void;
  onOpenImportModal?: () => void;
}

type ColumnMode = 'compact' | 'medium' | 'full';

export const DemoCalendar: React.FC<DemoCalendarProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservationWithProperty,
  onOpenImportModal,
}) => {
  const [dayOffset, setDayOffset] = useState<number>(-2); // Show from 2 days ago to +12 days ahead
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [highlightTurnoversOnly, setHighlightTurnoversOnly] = useState<boolean>(false);
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

  // Helper to extract a short label for units (e.g. "Departamento A" -> "A", "Depto 1" -> "D1")
  const getShortName = (name: string, index: number) => {
    // Check for single letter department: Departamento A, Depto B, etc.
    const letterMatch = name.match(/(?:Departamento|Depto|Unidad)?\s*([A-D])\b/i);
    if (letterMatch) return letterMatch[1].toUpperCase();

    const deptoNumMatch = name.match(/Depto\s*(\d+)/i);
    if (deptoNumMatch) return `D${deptoNumMatch[1]}`;

    const match = name.match(/\b(\d+)\b/);
    if (match) return `D${match[1]}`;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return letters[index] || `D${index + 1}`;
  };

  const DAYS_TO_SHOW = 14;

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generate date array
  const dates: { dateStr: string; dayNum: string; dayName: string; isToday: boolean; monthName: string; yearNum: number }[] = [];
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
      monthName: MONTH_NAMES[d.getMonth()],
      yearNum: d.getFullYear(),
      isToday: dateStr === todayStr,
    });
  }

  const startDateStr = dates[0]?.dateStr || '';
  const endDateStr = dates[dates.length - 1]?.dateStr || '';

  // Calculate current visible month and year based on first visible day
  const firstDateObj = new Date();
  firstDateObj.setDate(firstDateObj.getDate() + dayOffset);
  const currentVisibleMonth = firstDateObj.getMonth();
  const currentVisibleYear = firstDateObj.getFullYear();

  // Jump directly to 1st of a chosen month & year
  const handleMonthYearChange = (newMonth: number, newYear: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(newYear, newMonth, 1);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    setDayOffset(diffDays);
  };

  // Jump to previous month
  const handlePrevMonth = () => {
    let m = currentVisibleMonth - 1;
    let y = currentVisibleYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    handleMonthYearChange(m, y);
  };

  // Jump to next month
  const handleNextMonth = () => {
    let m = currentVisibleMonth + 1;
    let y = currentVisibleYear;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    handleMonthYearChange(m, y);
  };

  // Jump to specific date chosen in datepicker
  const handleJumpToSpecificDate = (val: string) => {
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      setDayOffset(diffDays);
    }
  };

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

  // Detect same-day turnover (when another reservation checks out on this reservation's check-in date, or checks in on its check-out date)
  const getTurnoverInfo = (res: Reservation) => {
    const incomingTurnover = demoState.reservations.find(
      (r) =>
        r.id !== res.id &&
        r.propertyId === res.propertyId &&
        r.status !== 'cancelled' &&
        r.checkOut === res.checkIn
    );

    const outgoingTurnover = demoState.reservations.find(
      (r) =>
        r.id !== res.id &&
        r.propertyId === res.propertyId &&
        r.status !== 'cancelled' &&
        r.checkIn === res.checkOut
    );

    return {
      incomingTurnover,
      outgoingTurnover,
      hasTurnover: !!incomingTurnover || !!outgoingTurnover,
    };
  };

  // Count total turnovers in the system
  const totalTurnoversCount = demoState.reservations.filter((r) => {
    if (r.status === 'cancelled') return false;
    const { hasTurnover } = getTurnoverInfo(r);
    return hasTurnover;
  }).length;

  const getPlatformColors = (platform: BookingPlatform) => {
    switch (platform) {
      case 'airbnb':
        // Soft pastel coral / terracotta (Airbnb)
        return 'bg-[#c46850] hover:bg-[#b05842] border-[#d87a62] text-[#fbf7f5] shadow-xs';
      case 'booking':
        // Soft pastel slate blue (Booking)
        return 'bg-[#4a6b8c] hover:bg-[#3e5b78] border-[#5e82a6] text-[#f4f7fb] shadow-xs';
      case 'direct':
        // Soft pastel sage olive (Direct)
        return 'bg-[#5c8a66] hover:bg-[#4d7555] border-[#72a37d] text-[#f2f8f3] shadow-xs';
      case 'vrbo':
        // Soft pastel dusty purple (VRBO)
        return 'bg-[#6b5882] hover:bg-[#5a4970] border-[#816c9c] text-[#f8f5fa] shadow-xs';
      default:
        return 'bg-[#525252] text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-[#ded9cd] dark:border-[#262626] shadow-2xs overflow-hidden transition-colors font-sans">
      {/* Calendar Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-[#ded9cd] dark:border-[#262626] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#1c1b18] dark:text-[#f0eeeb] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#c46d45] dark:text-[#c4774a]" />
              <span>Ocupación</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Recambios Mismo Día</span>
            </span>
          </div>
          <p className="text-xs text-[#78746c] dark:text-[#8c8a85] mt-0.5">
            Calendario Rack PMS — Check-in 14hs / Check-out 10hs con marcación visual de recambios compartidos
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#d88d5e]/30 bg-[#2a221b]/40 hover:bg-[#d88d5e]/15 text-[#d88d5e] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Importar reservas desde Google Calendar (.ics) o archivos CSV / Excel"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#d88d5e]" />
              <span>Importar Google Cal / CSV</span>
            </button>
          )}

          {/* Month & Year Navigator */}
          <div className="flex items-center gap-1 bg-[#f8f6f2] dark:bg-[#242424] p-1 rounded-lg border border-[#ded9cd] dark:border-[#333333]">
            <button
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="p-1 hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] rounded transition-colors text-[#78746c] dark:text-[#a8a5a0] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Selector */}
            <select
              value={currentVisibleMonth}
              onChange={(e) => handleMonthYearChange(Number(e.target.value), currentVisibleYear)}
              className="text-xs font-bold px-1.5 py-0.5 bg-transparent text-[#1c1b18] dark:text-[#e0deda] border-none focus:outline-hidden cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx} className="bg-white dark:bg-[#242424] text-[#1c1b18] dark:text-[#e0deda]">
                  {m}
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={currentVisibleYear}
              onChange={(e) => handleMonthYearChange(currentVisibleMonth, Number(e.target.value))}
              className="text-xs font-bold px-1 py-0.5 bg-transparent text-[#1c1b18] dark:text-[#e0deda] border-none focus:outline-hidden cursor-pointer"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-[#242424] text-[#1c1b18] dark:text-[#e0deda]">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="p-1 hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] rounded transition-colors text-[#78746c] dark:text-[#a8a5a0] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Day Offset Navigator */}
          <div className="flex items-center gap-1 bg-[#f8f6f2] dark:bg-[#242424] p-1 rounded-lg border border-[#ded9cd] dark:border-[#333333]">
            <button
              onClick={() => setDayOffset((prev) => prev - 7)}
              title="Retroceder 7 días"
              className="p-1 hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] rounded transition-colors text-[#78746c] dark:text-[#a8a5a0] cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(-2)}
              className="text-[11px] font-bold px-2 py-0.5 hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] rounded transition-colors text-[#1c1b18] dark:text-[#e0deda] cursor-pointer"
              title="Ir al día de hoy"
            >
              Hoy
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + 7)}
              title="Avanzar 7 días"
              className="p-1 hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] rounded transition-colors text-[#78746c] dark:text-[#a8a5a0] cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date Picker Quick Jump */}
          <div className="flex items-center gap-1.5 bg-[#f8f6f2] dark:bg-[#242424] px-2 py-1 rounded-lg border border-[#ded9cd] dark:border-[#333333]">
            <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8c8a85]">Ir a:</span>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => handleJumpToSpecificDate(e.target.value)}
              className="text-[11px] bg-transparent text-[#1c1b18] dark:text-[#e0deda] border-none focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Property selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#ded9cd] dark:border-[#333333] bg-[#f8f6f2] dark:bg-[#242424] text-[#1c1b18] dark:text-[#e0deda] cursor-pointer"
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
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#ded9cd] dark:border-[#333333] bg-[#f8f6f2] dark:bg-[#242424] text-[#1c1b18] dark:text-[#e0deda] cursor-pointer"
          >
            <option value="all">Todos los canales</option>
            <option value="airbnb">Airbnb (Coral)</option>
            <option value="booking">Booking.com (Azul)</option>
            <option value="direct">Directa (Verde oliva)</option>
            <option value="vrbo">VRBO (Lavanda)</option>
          </select>

          {/* Column Width Selector: Compacta (48px) | Estándar (105px) | Amplia (185px) */}
          <div className="flex items-center gap-1 bg-[#f8f6f2] dark:bg-[#242424] p-1 rounded-lg border border-[#ded9cd] dark:border-[#333333]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78746c] dark:text-[#7a7874] px-1.5 flex items-center gap-1">
              <Columns className="w-3 h-3 text-[#c46d45]" />
              <span>Col:</span>
            </span>
            <button
              onClick={() => setColumnMode('compact')}
              title="Columna compacta (48px)"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'compact'
                  ? 'bg-white dark:bg-[#333333] text-[#c46d45] dark:text-[#e8a070] shadow-2xs border border-[#ded9cd] dark:border-transparent'
                  : 'text-[#78746c] dark:text-[#8a8883] hover:text-[#1c1b18] dark:hover:text-[#d0cdc8]'
              }`}
            >
              48px
            </button>
            <button
              onClick={() => setColumnMode('medium')}
              title="Columna estándar (105px)"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'medium'
                  ? 'bg-white dark:bg-[#333333] text-[#c46d45] dark:text-[#e8a070] shadow-2xs border border-[#ded9cd] dark:border-transparent'
                  : 'text-[#78746c] dark:text-[#8a8883] hover:text-[#1c1b18] dark:hover:text-[#d0cdc8]'
              }`}
            >
              105px
            </button>
            <button
              onClick={() => setColumnMode('full')}
              title="Columna completa (185px)"
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                columnMode === 'full'
                  ? 'bg-white dark:bg-[#333333] text-[#c46d45] dark:text-[#e8a070] shadow-2xs border border-[#ded9cd] dark:border-transparent'
                  : 'text-[#78746c] dark:text-[#8a8883] hover:text-[#1c1b18] dark:hover:text-[#d0cdc8]'
              }`}
            >
              185px
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar & Turnover Indicator */}
      <div className="bg-[#fbf9f5] dark:bg-[#191919] px-4 sm:px-5 py-2.5 border-b border-[#ded9cd] dark:border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#78746c] dark:text-[#a8a5a0]">
          <span className="font-bold text-[#55514a] dark:text-[#7a7874] text-[11px]">Canales:</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c46850] inline-block" />
            <span className="text-[11px]">Airbnb</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4a6b8c] inline-block" />
            <span className="text-[11px]">Booking.com</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5c8a66] inline-block" />
            <span className="text-[11px]">Directo</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6b5882] inline-block" />
            <span className="text-[11px]">VRBO</span>
          </span>

          <span className="h-3 w-px bg-[#ded9cd] dark:bg-[#333] hidden sm:inline-block" />

          {/* Special Turnover Legend Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold">🔄 Recambio mismo día:</span>
            <span>Check-out 10hs & Check-in 14hs marcados en la barra</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#78746c] dark:text-[#706e6a]">
          <span className="italic">
            💡 Las reservas con recambio muestran la etiqueta <strong>🔄 Recambio</strong> y el horario de rotación
          </span>
        </div>
      </div>

      {/* High-Visibility Timeline Slider & Controller (Visible on Laptop & Mobile) */}
      <div className="bg-[#f8f6f2] dark:bg-[#181818] px-4 sm:px-5 py-2.5 border-b border-[#ded9cd] dark:border-[#262626] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#c46d45] shrink-0" />
          <span className="font-bold text-[#1c1b18] dark:text-zinc-200 text-xs whitespace-nowrap">
            Desplazamiento horizontal (14 días):
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScrollTimeline('left')}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] border border-[#ded9cd] dark:border-[#333] font-bold text-[#1c1b18] dark:text-zinc-200 text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#c46d45]" />
              <span>‹ Anterior</span>
            </button>
            <button
              onClick={() => handleScrollTimeline('right')}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] border border-[#ded9cd] dark:border-[#333] font-bold text-[#1c1b18] dark:text-zinc-200 text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la derecha"
            >
              <span>Siguiente ›</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#c46d45]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-1 max-w-full sm:max-w-md">
          <span className="text-[10px] text-[#78746c] dark:text-zinc-400 font-mono">Día 1</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2.5 bg-[#ded9cd] dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#c46d45] border border-[#d2ccc0] dark:border-zinc-600"
            title="Arrastra esta barra para deslizar horizontalmente por todo el calendario"
          />
          <span className="text-[10px] text-[#78746c] dark:text-zinc-400 font-mono">Día 14</span>
          <span className="font-mono text-[11px] font-black text-[#c46d45] dark:text-rose-400 min-w-[36px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div
        ref={timelineContainerRef}
        onScroll={updateScrollProgress}
        className="overflow-x-auto rounded-b-xl bg-white dark:bg-[#1c1c1c] shadow-xs calendar-scrollbar"
      >
        <div className="min-w-[980px]">
          {/* Header Row of Days */}
          <div className="flex border-b border-[#ded9cd] dark:border-[#262626] bg-[#f8f6f2] dark:bg-[#202020] text-[#1c1b18] dark:text-zinc-300">
            {/* Responsive Sticky Property Header Column */}
            <div className={`${getColumnWidthClass(columnMode)} font-bold text-xs border-r border-[#ded9cd] dark:border-[#262626] flex items-center justify-between sticky left-0 bg-[#f4f1ea] dark:bg-[#202020] z-30 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
              <span className="truncate">
                {columnMode === 'compact' ? 'Depto' : columnMode === 'medium' ? 'Depto' : 'Departamento'}
              </span>
              {columnMode === 'full' && (
                <span className="text-[10px] text-[#78746c] dark:text-zinc-400 font-normal">Tarifa/Noche</span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
              {dates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`p-2 text-center border-r border-[#ded9cd] dark:border-[#262626] last:border-r-0 ${
                    d.isToday
                      ? 'bg-[#f4eee7] dark:bg-rose-950/40 font-bold text-[#9c512a] dark:text-rose-400'
                      : ''
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#78746c] dark:text-zinc-400">{d.dayName}</div>
                  <div className={`text-sm ${d.isToday ? 'text-[#c46d45] dark:text-rose-400 underline decoration-2 font-black' : 'text-[#1c1b18] dark:text-zinc-200 font-bold'}`}>
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
                className="flex border-b border-[#ded9cd] dark:border-[#262626] min-h-[68px] hover:bg-[#fbf9f5] dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Property Label Column */}
                <div className={`${getColumnWidthClass(columnMode)} border-r border-[#ded9cd] dark:border-[#262626] bg-white dark:bg-[#1c1c1c] flex flex-col justify-center sticky left-0 z-20 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
                  {columnMode === 'compact' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="text-[11px] font-black px-1 py-0.5 rounded bg-[#f4f1ea] dark:bg-[#242424] text-[#1c1b18] dark:text-zinc-100 border border-[#ded9cd] dark:border-[#333] block text-center"
                        title={prop.name}
                      >
                        {getShortName(prop.name, propIndex)}
                      </span>
                      <span className="text-[10px] font-bold text-[#4f7858] dark:text-emerald-400 mt-0.5 block">
                        ${prop.basePrice}
                      </span>
                    </div>
                  ) : columnMode === 'medium' ? (
                    <div>
                      <div className="font-bold text-xs text-[#1c1b18] dark:text-zinc-100 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="text-[10px] font-bold text-[#4f7858] dark:text-emerald-400 mt-0.5">
                        ${prop.basePrice}/n
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-xs text-[#1c1b18] dark:text-zinc-100 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#78746c] dark:text-zinc-400 mt-0.5">
                        <span className="truncate pr-1">{prop.neighborhood}</span>
                        <span className="font-bold text-[#4f7858] dark:text-emerald-400 shrink-0">${prop.basePrice}/n</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 14 Day Timeline Container - contains both background slots and reservation bars */}
                <div className="flex-1 relative grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
                  {/* 14 Day Background Slots */}
                  {dates.map((d) => {
                    // Check if this property has a turnover on this specific day (someone checking out AND someone checking in)
                    const hasCheckoutHere = propertyReservations.some((r) => r.checkOut === d.dateStr);
                    const hasCheckinHere = propertyReservations.some((r) => r.checkIn === d.dateStr);
                    const isTurnoverDayHere = hasCheckoutHere && hasCheckinHere;

                    return (
                      <div
                        key={d.dateStr}
                        className={`h-full border-r border-[#ded9cd] dark:border-[#262626] last:border-r-0 relative flex items-center justify-center ${
                          d.isToday ? 'bg-[#f4eee7]/50 dark:bg-rose-950/20' : ''
                        } ${isTurnoverDayHere ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}`}
                      >
                        {/* Subtle turnover vertical guideline marker in the middle of the turnover column */}
                        {isTurnoverDayHere && (
                          <div
                            className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-amber-500/40 z-0 pointer-events-none"
                            title={`Día de recambio: Salida a la mañana (10hs) y Entrada a la tarde (14hs)`}
                          />
                        )}

                        <button
                          onClick={() =>
                            onOpenNewReservationWithProperty &&
                            onOpenNewReservationWithProperty(prop.id, d.dateStr)
                          }
                          title={`Crear reserva libre el ${d.dateStr}`}
                          className="w-full h-full opacity-0 hover:opacity-100 hover:bg-[#f4f1ea] dark:hover:bg-zinc-800 flex items-center justify-center text-[#78746c] hover:text-[#1c1b18] dark:hover:text-zinc-200 transition-all cursor-pointer text-xs z-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Continuous Reservation Bars with PMS Half-Day Turnover Split (14hs In / 10hs Out) */}
                  {propertyReservations.map((res) => {
                    const { incomingTurnover, outgoingTurnover, hasTurnover } = getTurnoverInfo(res);

                    // Calculate start and end column index relative to visible dates (0 to 13)
                    const cleanCheckIn = res.checkIn ? String(res.checkIn).trim() : '';
                    const cleanCheckOut = res.checkOut ? String(res.checkOut).trim() : '';

                    // Robust date index finder with timestamp fallback
                    const findDateIndex = (rawDateStr: string) => {
                      if (!rawDateStr) return -1;
                      const targetStr = rawDateStr.trim();
                      const strIdx = dates.findIndex((d) => d.dateStr === targetStr);
                      if (strIdx !== -1) return strIdx;

                      try {
                        const targetTime = new Date(targetStr + 'T00:00:00').getTime();
                        if (isNaN(targetTime)) return -1;
                        return dates.findIndex((d) => {
                          const dTime = new Date(d.dateStr + 'T00:00:00').getTime();
                          return dTime === targetTime;
                        });
                      } catch {
                        return -1;
                      }
                    };

                    const checkInIndex = findDateIndex(cleanCheckIn);
                    const checkOutIndex = findDateIndex(cleanCheckOut);

                    // Check if reservation genuinely overlaps the 14-day window:
                    if (cleanCheckIn >= endDateStr || cleanCheckOut <= startDateStr || cleanCheckIn >= cleanCheckOut) {
                      return null;
                    }

                    const isContinuingFromBefore = checkInIndex === -1 && cleanCheckIn < startDateStr;
                    const isContinuingAfter = checkOutIndex === -1 && cleanCheckOut > endDateStr;

                    // Standard PMS Half-Day Split Math with Diagonal Chevron Overlap:
                    // If outgoingTurnover exists, extend the endFraction slightly to meet the incoming turnover seamlessly
                    // If incomingTurnover exists, start from slightly earlier to interlock diagonally
                    const startFraction = checkInIndex >= 0 
                      ? (incomingTurnover ? checkInIndex + 0.35 : checkInIndex + 0.45) 
                      : 0;
                    const endFraction = checkOutIndex >= 0 
                      ? (outgoingTurnover ? checkOutIndex + 0.65 : checkOutIndex + 0.55) 
                      : DAYS_TO_SHOW;
                    const spanFraction = Math.max(0.4, endFraction - startFraction);

                    const leftPercent = (startFraction / DAYS_TO_SHOW) * 100;
                    const widthPercent = (spanFraction / DAYS_TO_SHOW) * 100;

                    // Compute seamless diagonal cut polygon
                    let clipPathStyle: string | undefined = undefined;
                    if (incomingTurnover && outgoingTurnover) {
                      clipPathStyle = 'polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)';
                    } else if (incomingTurnover) {
                      clipPathStyle = 'polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%)';
                    } else if (outgoingTurnover) {
                      clipPathStyle = 'polygon(0% 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)';
                    }

                    return (
                      <div
                        key={res.id}
                        style={{
                          left: `calc(${leftPercent}% + 1px)`,
                          width: `calc(${widthPercent}% - 2px)`,
                        }}
                        className="absolute top-1.5 bottom-1.5 z-10 flex items-center group"
                      >
                        <button
                          onClick={() => onSelectReservation(res)}
                          style={clipPathStyle ? { clipPath: clipPathStyle } : undefined}
                          className={`w-full h-full relative ${
                            isContinuingFromBefore || incomingTurnover ? 'rounded-l-none' : 'rounded-l-lg'
                          } ${
                            isContinuingAfter || outgoingTurnover ? 'rounded-r-none' : 'rounded-r-lg'
                          } px-2 sm:px-2.5 py-1 flex items-center justify-between text-left text-xs font-semibold cursor-pointer shadow-xs border transition-all hover:scale-[1.01] hover:brightness-110 hover:shadow-md hover:z-30 overflow-hidden ${getPlatformColors(
                            res.platform
                          )} ${
                            hasTurnover
                              ? 'ring-1 ring-amber-400/70 shadow-amber-500/10'
                              : ''
                          }`}
                          title={`${res.guestName} (${res.platform.toUpperCase()}) · ${formatDisplayDate(
                            res.checkIn
                          )} al ${formatDisplayDate(res.checkOut)} · $${res.totalAmount}${
                            hasTurnover
                              ? `\n\n🔄 DÍA DE RECAMBIO (MISMO DÍA):${
                                  incomingTurnover
                                    ? `\n↘ ENTRADA: Llega hoy a las 14:00 hs (tras el check-out de ${incomingTurnover.guestName} a las 10:00 hs)`
                                    : ''
                                }${
                                  outgoingTurnover
                                    ? `\n↗ SALIDA: Deja el depto hoy a las 10:00 hs (ingresa ${outgoingTurnover.guestName} a las 14:00 hs)`
                                    : ''
                                }`
                              : ''
                          }`}
                        >
                          {/* Visual Diagonal Incoming Indicator (↘ 14hs) */}
                          {incomingTurnover && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-4 bg-amber-400/90 text-amber-950 flex flex-col items-center justify-center font-black tracking-tighter text-[7.5px] leading-tight select-none pointer-events-none"
                              title={`Llega 14:00 hs`}
                            >
                              <span>↘</span>
                              <span className="text-[6.5px] font-extrabold">14h</span>
                            </div>
                          )}

                          {/* Visual Diagonal Outgoing Indicator (↗ 10hs) */}
                          {outgoingTurnover && (
                            <div
                              className="absolute right-0 top-0 bottom-0 w-4 bg-amber-400/90 text-amber-950 flex flex-col items-center justify-center font-black tracking-tighter text-[7.5px] leading-tight select-none pointer-events-none"
                              title={`Sale 10:00 hs`}
                            >
                              <span>↗</span>
                              <span className="text-[6.5px] font-extrabold">10h</span>
                            </div>
                          )}

                          <div
                            className={`flex items-center gap-1.5 truncate pr-1 ${
                              incomingTurnover ? 'pl-3' : ''
                            } ${outgoingTurnover ? 'pr-3' : ''}`}
                          >
                            {/* Prominent Turnover Badge on the bar */}
                            {hasTurnover && (
                              <span
                                className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-300 text-stone-950 shrink-0 flex items-center gap-0.5 shadow-2xs"
                                title="Recambio mismo día: 10:00hs Salida / 14:00hs Entrada"
                              >
                                <RotateCw className="w-2.5 h-2.5" />
                                <span className="hidden sm:inline">Recambio</span>
                              </span>
                            )}

                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span
                                className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-white/25 text-white shrink-0"
                                title="Comisión Airbnb 3% anfitrión tradicional"
                              >
                                3%
                              </span>
                            )}

                            {(res.earlyCheckIn || res.lateCheckOut) && (
                              <span
                                className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-amber-400 text-amber-950 shrink-0"
                                title={res.earlyCheckIn ? 'Early Check-in' : 'Late Check-out'}
                              >
                                {res.earlyCheckIn ? 'Early' : 'Late'}
                              </span>
                            )}

                            <span className="font-bold text-xs truncate">
                              {res.guestName}
                            </span>
                          </div>

                          <div
                            className={`hidden sm:flex items-center gap-1.5 text-[10px] opacity-90 shrink-0 font-medium ${
                              outgoingTurnover ? 'pr-2' : ''
                            }`}
                          >
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
      <div className="bg-[#f8f6f2] dark:bg-[#191919] border-t border-[#ded9cd] dark:border-[#262626] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleScrollTimeline('left')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] text-[#1c1b18] dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-[#ded9cd] dark:border-[#333] shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días anteriores"
          >
            <ChevronLeft className="w-4 h-4 text-[#c46d45]" />
            <span>‹ Días anteriores</span>
          </button>
          <span className="text-[11px] text-[#78746c] dark:text-zinc-400 sm:hidden">
            Deslizar timeline
          </span>
          <button
            onClick={() => handleScrollTimeline('right')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2e2e2e] text-[#1c1b18] dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-[#ded9cd] dark:border-[#333] shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días siguientes"
          >
            <span>Días siguientes ›</span>
            <ChevronRight className="w-4 h-4 text-[#c46d45]" />
          </button>
        </div>

        {/* Slider track for Laptops */}
        <div className="w-full sm:max-w-md flex items-center gap-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#c46d45] shrink-0" />
          <span className="text-[11px] font-bold text-[#78746c] dark:text-zinc-400 whitespace-nowrap hidden md:inline">
            Barra de desplazamiento:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2.5 bg-[#ded9cd] dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#c46d45]"
            title="Arrastra para navegar por los 14 días"
          />
          <span className="text-[11px] font-mono text-[#1c1b18] dark:text-zinc-300 font-bold min-w-[34px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

