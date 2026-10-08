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
  Download,
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
        // Soft warm terracotta / coral (Airbnb)
        return 'bg-[#d96748] hover:bg-[#c85a3c] border-[#e27d60] text-white shadow-xs rounded-lg';
      case 'booking':
        // Serene slate blue (Booking)
        return 'bg-[#3d688d] hover:bg-[#34597a] border-[#4e7d9f] text-white shadow-xs rounded-lg';
      case 'direct':
        // Natural bamboo sage green (Direct)
        return 'bg-[#4e815a] hover:bg-[#41704c] border-[#639970] text-white shadow-xs rounded-lg';
      case 'vrbo':
        // Soft wisteria purple (VRBO)
        return 'bg-[#6a5b82] hover:bg-[#5b4c73] border-[#7f6f97] text-white shadow-xs rounded-lg';
      default:
        return 'bg-stone-600 text-white rounded-lg';
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* CONTROL SUPERIOR DEL RACK / CALENDARIO ZEN */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 dark:border-zinc-800 space-y-5 transition-colors">
        
        {/* ROW 1: TÍTULO, SUBTÍTULO Y ACCIONES DE IMPORTACIÓN RÁPIDA */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-block bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                Rack Multicanal • En Tiempo Real
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1.5 border border-emerald-100/40 dark:border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Recarga Automática Activa</span>
              </span>
            </div>
            <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              Ocupación & <span className="font-semibold text-gray-800 dark:text-white">Disponibilidad</span>
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-medium leading-normal max-w-xl">
              Rack sincronizado con Google Calendars, Airbnb y canales directos. Check-in: 14:00 / Check-out: 10:00.
            </p>
          </div>

          {/* Acciones de Datos (Importar) compactadas en botones limpios con icono */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="flex items-center space-x-1.5 text-gray-500 dark:text-zinc-300 font-semibold hover:text-gray-800 dark:hover:text-white text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl border border-gray-100 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Importar reservas desde Google Calendar (.ics) o CSV"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <span>Importar iCal / CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: FILTROS, SELECTORES Y ZOOM DE PIXELES (Separados y alineados con aire) */}
        <div className="pt-4 border-t border-gray-50 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-gray-600 dark:text-zinc-300">
          
          {/* Selectores de Filtro (Unidades y Canales) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:space-x-3">
            {/* Selector Fecha/Mes */}
            <div className="flex items-center bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 space-x-1 text-gray-800 dark:text-gray-100 font-bold">
              <select
                value={currentVisibleMonth}
                onChange={(e) => handleMonthYearChange(Number(e.target.value), currentVisibleYear)}
                className="bg-transparent border-none text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx} className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-medium">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={currentVisibleYear}
                onChange={(e) => handleMonthYearChange(currentVisibleMonth, Number(e.target.value))}
                className="bg-transparent border-none text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-medium">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Unidades */}
            <div className="flex items-center bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 rounded-xl px-3 py-1.5 space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/80 transition-colors">
              <span className="text-gray-400 font-normal">Unidades:</span>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">
                  Todas ({demoState.properties.length})
                </option>
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Canales */}
            <div className="flex items-center bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 rounded-xl px-3 py-1.5 space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/80 transition-colors">
              <span className="text-gray-400 font-normal">Canales:</span>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">Todos</option>
                <option value="airbnb" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">Airbnb</option>
                <option value="booking" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">Booking.com</option>
                <option value="direct" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">Directo</option>
                <option value="vrbo" className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100">VRBO</option>
              </select>
            </div>
          </div>

          {/* Controles de Navegación del Calendario (Hoy, Anterior, Siguiente) */}
          <div className="flex items-center bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-gray-700 dark:text-gray-200 rounded-lg transition-all text-xs font-bold cursor-pointer"
            >
              Anterior
            </button>
            <button
              onClick={() => setDayOffset(-2)}
              className="px-4 py-1.5 bg-white dark:bg-zinc-700 shadow-xs text-[#E67E22] rounded-lg text-xs font-black cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-gray-700 dark:text-gray-200 rounded-lg transition-all text-xs font-bold cursor-pointer"
            >
              Siguiente
            </button>
          </div>

          {/* Control de Zoom de Pixeles (Contenedor tipo pestaña limpia) */}
          <div className="flex items-center bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 rounded-xl p-1 text-[11px] font-bold text-gray-400">
            <button
              onClick={() => setColumnMode('compact')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                columnMode === 'compact'
                  ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-xs'
                  : 'hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              48px
            </button>
            <button
              onClick={() => setColumnMode('medium')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                columnMode === 'medium'
                  ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-xs'
                  : 'hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              105px
            </button>
            <button
              onClick={() => setColumnMode('full')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                columnMode === 'full'
                  ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-xs'
                  : 'hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              150px
            </button>
          </div>
        </div>

        {/* ROW 3: DETALLE DE CANALES Y RECAMBIO (Sutiles referencias de color) */}
        <div className="pt-3 border-t border-gray-50 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-gray-400 dark:text-zinc-400">
          {/* Listado de Canales Conectados */}
          <div className="flex flex-wrap items-center space-x-4">
            <span className="uppercase tracking-wider text-gray-300 dark:text-zinc-500">Canales:</span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#d96748]" /> Airbnb
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#3d688d]" /> Booking.com
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#4e815a]" /> Directo
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" /> VRBO
            </span>
          </div>

          {/* Alerta de Recambio del Mismo Día (Naranja pastel e icono claro) */}
          <div className="flex items-center space-x-1.5 bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] px-3 py-1.5 rounded-xl border border-orange-100/60 dark:border-orange-900/40">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Recambio mismo día: Salida 10:00 & Entrada 14:00</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DEL RACK GANTT TIMELINE */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">

      {/* High-Visibility Timeline Slider & Controller */}
      <div className="bg-white dark:bg-[#18191E] px-5 py-3 border-b border-stone-200/70 dark:border-zinc-800/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-[#E67E22] shrink-0" />
          <span className="font-bold text-stone-700 dark:text-stone-300 text-xs whitespace-nowrap">
            Desplazamiento horizontal:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScrollTimeline('left')}
              className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 font-medium text-stone-700 dark:text-stone-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Deslizar hacia la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>‹ Anterior</span>
            </button>
            <button
              onClick={() => handleScrollTimeline('right')}
              className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 font-medium text-stone-700 dark:text-stone-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Deslizar hacia la derecha"
            >
              <span>Siguiente ›</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#E67E22]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-1 max-w-full sm:max-w-md">
          <span className="text-[11px] text-stone-400 font-mono">Día 1</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#E67E22]"
            title="Arrastra esta barra para deslizar horizontalmente por todo el calendario"
          />
          <span className="text-[11px] text-stone-400 font-mono">Día 14</span>
          <span className="font-mono text-xs font-bold text-[#E67E22] min-w-[36px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Gantt Timeline Table */}
      <div
        ref={timelineContainerRef}
        onScroll={updateScrollProgress}
        className="overflow-x-auto bg-white dark:bg-[#18191E] calendar-scrollbar"
      >
        <div className="min-w-[980px]">
          {/* Header Row of Days */}
          <div className="flex border-b border-stone-200/70 dark:border-zinc-800/70 bg-stone-50/70 dark:bg-[#141518] text-stone-700 dark:text-stone-300">
            {/* Responsive Sticky Property Header Column */}
            <div className={`${getColumnWidthClass(columnMode)} font-bold text-xs uppercase tracking-wider border-r border-stone-200/70 dark:border-zinc-800/70 flex items-center justify-between sticky left-0 bg-stone-100/80 dark:bg-[#141518] z-30 shadow-[3px_0_8px_rgba(0,0,0,0.03)] shrink-0`}>
              <span className="truncate">
                {columnMode === 'compact' ? 'Depto' : columnMode === 'medium' ? 'Depto' : 'Departamento'}
              </span>
              {columnMode === 'full' && (
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">Tarifa/N</span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
              {dates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`p-2.5 text-center border-r border-stone-100 dark:border-zinc-800/50 last:border-r-0 ${
                    d.isToday
                      ? 'bg-orange-50/70 dark:bg-orange-950/20 text-[#E67E22]'
                      : ''
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500">{d.dayName}</div>
                  <div className={`text-sm mt-0.5 ${d.isToday ? 'text-[#E67E22] font-extrabold' : 'text-stone-800 dark:text-stone-200 font-medium'}`}>
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
                className="flex border-b border-stone-100 dark:border-zinc-800/50 min-h-[68px] hover:bg-stone-50/40 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Property Label Column */}
                <div className={`${getColumnWidthClass(columnMode)} border-r border-stone-200/70 dark:border-zinc-800/70 bg-[#FAF9F6] dark:bg-[#15161A] flex flex-col justify-center sticky left-0 z-20 shadow-[3px_0_8px_rgba(0,0,0,0.03)] shrink-0`}>
                  {columnMode === 'compact' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-zinc-700/80 block text-center"
                        title={prop.name}
                      >
                        {getShortName(prop.name, propIndex)}
                      </span>
                      <span className="text-[10px] font-semibold text-[#E67E22] mt-0.5 block font-mono">
                        ${prop.basePrice}
                      </span>
                    </div>
                  ) : columnMode === 'medium' ? (
                    <div>
                      <div className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="text-[10px] font-semibold text-[#E67E22] mt-0.5 font-mono">
                        ${prop.basePrice}/n
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate" title={prop.name}>
                        {prop.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 font-mono">
                        <span className="truncate pr-1">{prop.neighborhood}</span>
                        <span className="font-semibold text-[#E67E22] shrink-0">${prop.basePrice}/n</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 14 Day Timeline Container */}
                <div className="flex-1 relative grid grid-cols-[repeat(14,minmax(0,1fr))] min-w-[840px]">
                  {/* 14 Day Background Slots */}
                  {dates.map((d) => {
                    const hasCheckoutHere = propertyReservations.some((r) => r.checkOut === d.dateStr);
                    const hasCheckinHere = propertyReservations.some((r) => r.checkIn === d.dateStr);
                    const isTurnoverDayHere = hasCheckoutHere && hasCheckinHere;

                    return (
                      <div
                        key={d.dateStr}
                        className={`h-full border-r border-stone-100 dark:border-zinc-800/40 last:border-r-0 relative flex items-center justify-center ${
                          d.isToday ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                        } ${isTurnoverDayHere ? 'bg-orange-50/40 dark:bg-orange-950/15' : ''}`}
                      >
                        {/* Subtle turnover vertical guideline marker in the middle */}
                        {isTurnoverDayHere && (
                          <div
                            className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-[#E67E22]/40 z-0 pointer-events-none"
                            title={`Día de recambio: Salida a la mañana (10hs) y Entrada a la tarde (14hs)`}
                          />
                        )}

                        <button
                          onClick={() =>
                            onOpenNewReservationWithProperty &&
                            onOpenNewReservationWithProperty(prop.id, d.dateStr)
                          }
                          title={`Crear reserva libre el ${d.dateStr}`}
                          className="w-full h-full opacity-0 hover:opacity-100 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-all cursor-pointer text-xs z-0"
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
                              : 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)',
                          }}
                          className={`w-full h-full relative ${
                            isContinuingFromBefore || hasIncomingTurnover ? 'rounded-l-none' : 'rounded-lg'
                          } pl-2 sm:pl-3 pr-3.5 py-1 flex items-center justify-between text-left text-xs font-semibold cursor-pointer shadow-xs border transition-all hover:scale-[1.01] hover:brightness-105 hover:shadow-md hover:z-30 overflow-hidden ${getPlatformColors(
                            res.platform
                          )}`}
                          title={`${res.guestName} (${res.platform.toUpperCase()}) · Entrada: ${formatDisplayDate(
                            res.checkIn
                          )} · Salida (Check-out): ${formatDisplayDate(res.checkOut)} · $${res.totalAmount}`}
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0 pr-1 z-10">
                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white shrink-0"
                                title="Comisión Airbnb 3% anfitrión tradicional"
                              >
                                3%
                              </span>
                            )}

                            {(res.earlyCheckIn || res.lateCheckOut) && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-300 text-amber-950 shrink-0"
                                title={res.earlyCheckIn ? 'Early Check-in' : 'Late Check-out'}
                              >
                                {res.earlyCheckIn ? 'Early' : 'Late'}
                              </span>
                            )}

                            <span className="font-bold text-xs truncate text-white">
                              {res.guestName}
                            </span>
                          </div>

                          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono opacity-90 shrink-0 font-medium z-10 mr-2 text-white">
                            {res.totalAmount !== undefined && (
                              <span>${res.totalAmount}</span>
                            )}
                          </div>

                          {!isContinuingAfter && (
                            <div
                              className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 dark:bg-black/30 border-l border-white/20 flex items-center justify-center pointer-events-none"
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
      <div className="bg-stone-50/50 dark:bg-[#141518] border-t border-stone-200/70 dark:border-zinc-800/70 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleScrollTimeline('left')}
            className="flex items-center gap-1 font-semibold text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 px-3.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 cursor-pointer transition-colors"
            title="Deslizar hacia días anteriores"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>‹ Días anteriores</span>
          </button>
          <span className="text-[11px] text-stone-400 sm:hidden font-mono">
            Deslizar timeline
          </span>
          <button
            onClick={() => handleScrollTimeline('right')}
            className="flex items-center gap-1 font-semibold text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 px-3.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 cursor-pointer transition-colors"
            title="Deslizar hacia días siguientes"
          >
            <span>Días siguientes ›</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#E67E22]" />
          </button>
        </div>

        {/* Slider track */}
        <div className="w-full sm:max-w-md flex items-center gap-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap hidden md:inline">
            Barra de desplazamiento:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#E67E22]"
            title="Arrastra para navegar por los 14 días"
          />
          <span className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold min-w-[34px] text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};

