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
    <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs overflow-hidden transition-colors font-sans">
      {/* Calendar Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-[#C8C4B7] dark:border-[#222328] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
              RACK MULTICANAL / EN VIVO
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-xl font-black text-[#18181B] dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#E1500A]" />
              <span>Ocupación</span>
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-none bg-[#E1500A]/15 text-[#E1500A] border border-[#E1500A]/30 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-[#E1500A]" />
              <span>Recambios Mismo Día</span>
            </span>
          </div>
          <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-bold">
            Calendario Rack PMS — Check-in 14hs / Check-out 10hs sincronizado en tiempo real
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] hover:border-[#E1500A] text-[#18181B] dark:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              title="Importar reservas desde Google Calendar (.ics) o archivos CSV / Excel"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>Importar Google Cal / CSV</span>
            </button>
          )}

          {/* Month & Year Navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] p-1 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
            <button
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="p-1 hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] rounded-none transition-colors text-[#71717A] dark:text-[#8E8E93] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Selector */}
            <select
              value={currentVisibleMonth}
              onChange={(e) => handleMonthYearChange(Number(e.target.value), currentVisibleYear)}
              className="text-xs font-black px-1.5 py-0.5 bg-transparent text-[#18181B] dark:text-white border-none focus:outline-hidden cursor-pointer uppercase"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx} className="bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white font-bold">
                  {m}
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={currentVisibleYear}
              onChange={(e) => handleMonthYearChange(currentVisibleMonth, Number(e.target.value))}
              className="text-xs font-black px-1 py-0.5 bg-transparent text-[#18181B] dark:text-white border-none focus:outline-hidden cursor-pointer"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white font-bold">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="p-1 hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] rounded-none transition-colors text-[#71717A] dark:text-[#8E8E93] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Day Offset Navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] p-1 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
            <button
              onClick={() => setDayOffset((prev) => prev - 7)}
              title="Retroceder 7 días"
              className="p-1 hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] rounded-none transition-colors text-[#71717A] dark:text-[#8E8E93] cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(-2)}
              className="text-[11px] font-black uppercase px-2 py-0.5 hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] rounded-none transition-colors text-[#18181B] dark:text-white cursor-pointer"
              title="Ir al día de hoy"
            >
              Hoy
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + 7)}
              title="Avanzar 7 días"
              className="p-1 hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] rounded-none transition-colors text-[#71717A] dark:text-[#8E8E93] cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date Picker Quick Jump */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#18181B] px-2 py-1 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93]">Ir a:</span>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => handleJumpToSpecificDate(e.target.value)}
              className="text-[11px] bg-transparent text-[#18181B] dark:text-white border-none focus:outline-hidden cursor-pointer font-mono"
            />
          </div>

          {/* Property selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white cursor-pointer focus:outline-hidden"
          >
            <option value="all">Todas las unidades ({demoState.properties.length})</option>
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
            className="text-xs font-bold px-2.5 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white cursor-pointer focus:outline-hidden"
          >
            <option value="all">Todos los canales</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking">Booking.com</option>
            <option value="direct">Directa</option>
            <option value="vrbo">VRBO</option>
          </select>

          {/* Column Width Selector: Compacta (48px) | Estándar (105px) | Amplia (185px) */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] p-1 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] px-1.5 flex items-center gap-1">
              <Columns className="w-3 h-3 text-[#E1500A]" />
              <span>Col:</span>
            </span>
            <button
              onClick={() => setColumnMode('compact')}
              title="Columna compacta (48px)"
              className={`text-[11px] font-black uppercase px-2 py-1 rounded-none transition-colors cursor-pointer ${
                columnMode === 'compact'
                  ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white'
              }`}
            >
              48px
            </button>
            <button
              onClick={() => setColumnMode('medium')}
              title="Columna estándar (105px)"
              className={`text-[11px] font-black uppercase px-2 py-1 rounded-none transition-colors cursor-pointer ${
                columnMode === 'medium'
                  ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white'
              }`}
            >
              105px
            </button>
            <button
              onClick={() => setColumnMode('full')}
              title="Columna completa (185px)"
              className={`text-[11px] font-black uppercase px-2 py-1 rounded-none transition-colors cursor-pointer ${
                columnMode === 'full'
                  ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xs'
                  : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white'
              }`}
            >
              185px
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar & Turnover Indicator */}
      <div className="bg-[#DEDBD2]/40 dark:bg-[#141518] px-4 sm:px-5 py-2.5 border-b border-[#C8C4B7] dark:border-[#222328] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#71717A] dark:text-[#8E8E93]">
          <span className="font-black text-[#18181B] dark:text-white text-[11px] uppercase tracking-wider">Canales:</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-none bg-[#E1500A] inline-block" />
            <span className="text-[11px]">Airbnb</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-none bg-[#2563EB] inline-block" />
            <span className="text-[11px]">Booking.com</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-600 inline-block" />
            <span className="text-[11px]">Directo</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-none bg-purple-600 inline-block" />
            <span className="text-[11px]">VRBO</span>
          </span>

          <span className="h-3 w-px bg-[#C8C4B7] dark:bg-[#222328] hidden sm:inline-block" />

          {/* Special Turnover Legend Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#E1500A]/10 text-[#E1500A] border border-[#E1500A]/30 text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-none bg-[#E1500A] animate-pulse" />
            <span className="font-black">🔄 Recambio mismo día:</span>
            <span>Check-out 10hs & Check-in 14hs</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#71717A] dark:text-[#8E8E93]">
          <span className="font-mono text-[10px]">
            Check-in 14:00 • Check-out 10:00
          </span>
        </div>
      </div>

      {/* High-Visibility Timeline Slider & Controller */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] px-4 sm:px-5 py-2.5 border-b border-[#C8C4B7] dark:border-[#222328] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#E1500A] shrink-0" />
          <span className="font-black uppercase tracking-wider text-[#18181B] dark:text-white text-xs whitespace-nowrap">
            Desplazamiento horizontal:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScrollTimeline('left')}
              className="px-2.5 py-1 rounded-none bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] border border-[#C8C4B7] dark:border-[#222328] font-bold text-[#18181B] dark:text-white text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>‹ Anterior</span>
            </button>
            <button
              onClick={() => handleScrollTimeline('right')}
              className="px-2.5 py-1 rounded-none bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] border border-[#C8C4B7] dark:border-[#222328] font-bold text-[#18181B] dark:text-white text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              title="Deslizar hacia la derecha"
            >
              <span>Siguiente ›</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#E1500A]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-1 max-w-full sm:max-w-md">
          <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-mono">Día 1</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-[#C8C4B7] dark:bg-[#222328] rounded-none appearance-none cursor-pointer accent-[#E1500A]"
            title="Arrastra esta barra para deslizar horizontalmente por todo el calendario"
          />
          <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-mono">Día 14</span>
          <span className="font-mono text-[11px] font-black text-[#E1500A] min-w-[36px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div
        ref={timelineContainerRef}
        onScroll={updateScrollProgress}
        className="overflow-x-auto rounded-none bg-white dark:bg-[#0C0D0F] shadow-xs calendar-scrollbar"
      >
        <div className="min-w-[980px]">
          {/* Header Row of Days */}
          <div className="flex border-b border-[#C8C4B7] dark:border-[#222328] bg-[#EAE8E3] dark:bg-[#141518] text-[#18181B] dark:text-white">
            {/* Responsive Sticky Property Header Column */}
            <div className={`${getColumnWidthClass(columnMode)} font-black text-xs uppercase tracking-wider border-r border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between sticky left-0 bg-[#DEDBD2] dark:bg-[#141518] z-30 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
              <span className="truncate">
                {columnMode === 'compact' ? 'Depto' : columnMode === 'medium' ? 'Depto' : 'Departamento'}
              </span>
              {columnMode === 'full' && (
                <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-mono">Tarifa/N</span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
              {dates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`p-2 text-center border-r border-[#C8C4B7] dark:border-[#222328] last:border-r-0 ${
                    d.isToday
                      ? 'bg-[#E1500A]/15 dark:bg-[#E1500A]/20 font-black text-[#E1500A]'
                      : ''
                  }`}
                >
                  <div className="text-[10px] uppercase font-black text-[#71717A] dark:text-[#8E8E93]">{d.dayName}</div>
                  <div className={`text-sm ${d.isToday ? 'text-[#E1500A] underline decoration-2 font-black' : 'text-[#18181B] dark:text-white font-bold'}`}>
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
                className="flex border-b border-[#C8C4B7] dark:border-[#222328] min-h-[68px] hover:bg-[#DEDBD2]/20 dark:hover:bg-[#141518]/60 transition-colors"
              >
                {/* Property Label Column */}
                <div className={`${getColumnWidthClass(columnMode)} border-r border-[#C8C4B7] dark:border-[#222328] bg-[#F4F2EE] dark:bg-[#0C0D0F] flex flex-col justify-center sticky left-0 z-20 shadow-[3px_0_8px_rgba(0,0,0,0.06)] shrink-0`}>
                  {columnMode === 'compact' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="text-[11px] font-black px-1 py-0.5 rounded-none bg-[#DEDBD2] dark:bg-[#18181B] text-[#18181B] dark:text-white border border-[#C8C4B7] dark:border-[#222328] block text-center"
                        title={prop.name}
                      >
                        {getShortName(prop.name, propIndex)}
                      </span>
                      <span className="text-[10px] font-bold text-[#E1500A] mt-0.5 block font-mono">
                        ${prop.basePrice}
                      </span>
                    </div>
                  ) : columnMode === 'medium' ? (
                    <div>
                      <div className="font-black text-xs text-[#18181B] dark:text-white truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="text-[10px] font-bold text-[#E1500A] mt-0.5 font-mono">
                        ${prop.basePrice}/n
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-black text-xs text-[#18181B] dark:text-white truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-mono">
                        <span className="truncate pr-1">{prop.neighborhood}</span>
                        <span className="font-bold text-[#E1500A] shrink-0">${prop.basePrice}/n</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 14 Day Timeline Container - contains both background slots and reservation bars */}
                <div className="flex-1 relative grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
                  {/* 14 Day Background Slots */}
                  {dates.map((d) => {
                    const hasCheckoutHere = propertyReservations.some((r) => r.checkOut === d.dateStr);
                    const hasCheckinHere = propertyReservations.some((r) => r.checkIn === d.dateStr);
                    const isTurnoverDayHere = hasCheckoutHere && hasCheckinHere;

                    return (
                      <div
                        key={d.dateStr}
                        className={`h-full border-r border-[#C8C4B7] dark:border-[#222328] last:border-r-0 relative flex items-center justify-center ${
                          d.isToday ? 'bg-[#E1500A]/5 dark:bg-[#E1500A]/10' : ''
                        } ${isTurnoverDayHere ? 'bg-[#E1500A]/10 dark:bg-[#E1500A]/15' : ''}`}
                      >
                        {/* Subtle turnover vertical guideline marker in the middle of the turnover column */}
                        {isTurnoverDayHere && (
                          <div
                            className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-[#E1500A]/50 z-0 pointer-events-none"
                            title={`Día de recambio: Salida a la mañana (10hs) y Entrada a la tarde (14hs)`}
                          />
                        )}

                        <button
                          onClick={() =>
                            onOpenNewReservationWithProperty &&
                            onOpenNewReservationWithProperty(prop.id, d.dateStr)
                          }
                          title={`Crear reserva libre el ${d.dateStr}`}
                          className="w-full h-full opacity-0 hover:opacity-100 hover:bg-[#DEDBD2]/50 dark:hover:bg-[#18181B] flex items-center justify-center text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-all cursor-pointer text-xs z-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Continuous Reservation Bars */}
                  {propertyReservations.map((res) => {
                    const cleanCheckIn = res.checkIn ? String(res.checkIn).trim() : '';
                    const cleanCheckOut = res.checkOut ? String(res.checkOut).trim() : '';

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

                    if (cleanCheckIn >= endDateStr || cleanCheckOut <= startDateStr || cleanCheckIn >= cleanCheckOut) {
                      return null;
                    }

                    const isContinuingFromBefore = checkInIndex === -1 && cleanCheckIn < startDateStr;
                    const isContinuingAfter = checkOutIndex === -1 && cleanCheckOut > endDateStr;

                    const hasOutgoingTurnover = propertyReservations.some(
                      (r) => r.id !== res.id && r.checkIn === cleanCheckOut
                    );
                    const hasIncomingTurnover = propertyReservations.some(
                      (r) => r.id !== res.id && r.checkOut === cleanCheckIn
                    );

                    const startFraction = checkInIndex >= 0 
                      ? (hasIncomingTurnover ? checkInIndex + 0.45 : checkInIndex) 
                      : 0;
                    
                    const endFraction = checkOutIndex >= 0 
                      ? (hasOutgoingTurnover ? checkOutIndex + 0.45 : checkOutIndex + 0.5) 
                      : DAYS_TO_SHOW;

                    const spanFraction = Math.max(0.4, endFraction - startFraction);

                    const leftPercent = (startFraction / DAYS_TO_SHOW) * 100;
                    const widthPercent = (spanFraction / DAYS_TO_SHOW) * 100;

                    return (
                      <div
                        key={res.id}
                        style={{
                          left: `calc(${leftPercent}% + 1px)`,
                          width: `calc(${widthPercent}% - 2px)`,
                        }}
                        className="absolute top-2 bottom-2 z-10 flex items-center group"
                      >
                        <button
                          onClick={() => onSelectReservation(res)}
                          style={{
                            clipPath: isContinuingAfter 
                              ? undefined 
                              : 'polygon(0% 0%, calc(100% - 9px) 0%, 100% 50%, calc(100% - 9px) 100%, 0% 100%)',
                          }}
                          className={`w-full h-full relative ${
                            isContinuingFromBefore || hasIncomingTurnover ? 'rounded-l-none' : 'rounded-none'
                          } pl-2 sm:pl-2.5 pr-4 py-1 flex items-center justify-between text-left text-xs font-bold cursor-pointer shadow-xs border transition-all hover:scale-[1.01] hover:brightness-110 hover:shadow-md hover:z-30 overflow-hidden ${getPlatformColors(
                            res.platform
                          )}`}
                          title={`${res.guestName} (${res.platform.toUpperCase()}) · Entrada: ${formatDisplayDate(
                            res.checkIn
                          )} · Salida (Check-out): ${formatDisplayDate(res.checkOut)} · $${res.totalAmount}`}
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0 pr-1 z-10">
                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span
                                className="text-[9px] font-black px-1 py-0.2 rounded-none bg-white/25 text-white shrink-0"
                                title="Comisión Airbnb 3% anfitrión tradicional"
                              >
                                3%
                              </span>
                            )}

                            {(res.earlyCheckIn || res.lateCheckOut) && (
                              <span
                                className="text-[9px] font-black px-1 py-0.2 rounded-none bg-amber-400 text-amber-950 shrink-0"
                                title={res.earlyCheckIn ? 'Early Check-in' : 'Late Check-out'}
                              >
                                {res.earlyCheckIn ? 'Early' : 'Late'}
                              </span>
                            )}

                            <span className="font-black text-xs truncate">
                              {res.guestName}
                            </span>
                          </div>

                          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono opacity-90 shrink-0 font-bold z-10 mr-2">
                            {res.totalAmount !== undefined && (
                              <span>${res.totalAmount}</span>
                            )}
                          </div>

                          {!isContinuingAfter && (
                            <div
                              className="absolute right-0 top-0 bottom-0 w-3 bg-white/25 dark:bg-black/35 border-l border-white/25 flex items-center justify-center pointer-events-none"
                              style={{
                                clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
                              }}
                              title={`Salida / Check-out: ${formatDisplayDate(res.checkOut)}`}
                            />
                          )}
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

      {/* Interactive Horizontal Scroll Slider & Pan Bar */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border-t border-[#C8C4B7] dark:border-[#222328] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleScrollTimeline('left')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] text-[#18181B] dark:text-white px-3 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días anteriores"
          >
            <ChevronLeft className="w-4 h-4 text-[#E1500A]" />
            <span>‹ Días anteriores</span>
          </button>
          <span className="text-[11px] text-[#71717A] dark:text-[#8E8E93] sm:hidden font-mono">
            Deslizar timeline
          </span>
          <button
            onClick={() => handleScrollTimeline('right')}
            className="flex items-center gap-1 font-bold text-xs bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#27272A] text-[#18181B] dark:text-white px-3 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs cursor-pointer transition-colors"
            title="Deslizar hacia días siguientes"
          >
            <span>Días siguientes ›</span>
            <ChevronRight className="w-4 h-4 text-[#E1500A]" />
          </button>
        </div>

        {/* Slider track */}
        <div className="w-full sm:max-w-md flex items-center gap-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E1500A] shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93] whitespace-nowrap hidden md:inline">
            Barra de desplazamiento:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-[#C8C4B7] dark:bg-[#222328] rounded-none appearance-none cursor-pointer accent-[#E1500A]"
            title="Arrastra para navegar por los 14 días"
          />
          <span className="text-[11px] font-mono text-[#18181B] dark:text-white font-bold min-w-[34px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

