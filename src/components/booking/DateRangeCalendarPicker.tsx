import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react';

interface DateRangeCalendarPickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onChange: (checkIn: string, checkOut: string) => void;
  onClose?: () => void;
  accentColor?: 'amber' | 'emerald' | 'blue';
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export const DateRangeCalendarPicker: React.FC<DateRangeCalendarPickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  onClose,
  accentColor = 'amber',
}) => {
  // Parse initial month from checkIn or default to October 2026
  const initialDate = checkIn ? new Date(checkIn + 'T00:00:00') : new Date('2026-10-04T00:00:00');
  const [currentYear, setCurrentYear] = useState(
    isNaN(initialDate.getFullYear()) ? 2026 : initialDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(initialDate.getMonth()) ? 9 : initialDate.getMonth()
  ); // 9 = October (0-indexed)

  const [tempCheckIn, setTempCheckIn] = useState<string>(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState<string>(checkOut);
  const [selectingStep, setSelectingStep] = useState<'in' | 'out'>('in');

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);

    if (selectingStep === 'in') {
      setTempCheckIn(dateStr);
      // Auto-set checkOut to 3 nights later if previous checkOut <= dateStr
      if (!tempCheckOut || tempCheckOut <= dateStr) {
        const nextD = new Date(currentYear, currentMonth, day + 3);
        setTempCheckOut(
          formatDateStr(nextD.getFullYear(), nextD.getMonth(), nextD.getDate())
        );
      }
      setSelectingStep('out');
    } else {
      if (dateStr <= tempCheckIn) {
        // If clicked date is before or equal to checkIn, set as new checkIn
        setTempCheckIn(dateStr);
        setSelectingStep('out');
      } else {
        setTempCheckOut(dateStr);
        setSelectingStep('in');
      }
    }
  };

  // Quick presets
  const applyPreset = (nights: number) => {
    const base = new Date('2026-10-15T00:00:00');
    const out = new Date('2026-10-15T00:00:00');
    out.setDate(out.getDate() + nights);

    const inStr = formatDateStr(base.getFullYear(), base.getMonth(), base.getDate());
    const outStr = formatDateStr(out.getFullYear(), out.getMonth(), out.getDate());

    setTempCheckIn(inStr);
    setTempCheckOut(outStr);
    setCurrentYear(base.getFullYear());
    setCurrentMonth(base.getMonth());
  };

  const handleConfirm = () => {
    if (tempCheckIn && tempCheckOut && tempCheckOut > tempCheckIn) {
      onChange(tempCheckIn, tempCheckOut);
    } else if (tempCheckIn) {
      // Default to 3 nights
      const d = new Date(tempCheckIn + 'T00:00:00');
      d.setDate(d.getDate() + 3);
      const outStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
      onChange(tempCheckIn, outStr);
    }
    if (onClose) onClose();
  };

  // Compute nights
  const computeNights = () => {
    if (!tempCheckIn || !tempCheckOut || tempCheckOut <= tempCheckIn) return 0;
    const d1 = new Date(tempCheckIn + 'T00:00:00');
    const d2 = new Date(tempCheckOut + 'T00:00:00');
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nightsCount = computeNights();

  // Colors
  const accentClasses = {
    amber: {
      activeDay: 'bg-amber-600 text-white font-bold',
      rangeDay: 'bg-amber-100 text-amber-950 font-semibold',
      header: 'text-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    emerald: {
      activeDay: 'bg-emerald-600 text-white font-bold',
      rangeDay: 'bg-emerald-950/40 text-emerald-200 font-semibold border-y border-emerald-800/40',
      header: 'text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
    },
    blue: {
      activeDay: 'bg-blue-600 text-white font-bold',
      rangeDay: 'bg-blue-50 text-blue-900 font-semibold',
      header: 'text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'bg-blue-50 text-blue-900 border-blue-200',
    },
  }[accentColor];

  return (
    <div className="bg-white dark:bg-[#181a20] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-4 sm:p-6 w-full max-w-md mx-auto text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className={`w-5 h-5 ${accentClasses.header}`} />
          <h3 className="font-bold text-sm sm:text-base">
            Seleccionar Fechas de Estadía
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected dates indicators */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
        <div
          onClick={() => setSelectingStep('in')}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectingStep === 'in'
              ? 'border-amber-600 dark:border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
            Llegada (Check-in)
          </span>
          <span className="font-bold text-sm">
            {tempCheckIn || 'Elegir fecha'}
          </span>
        </div>

        <div
          onClick={() => setSelectingStep('out')}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectingStep === 'out'
              ? 'border-amber-600 dark:border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
            Salida (Check-out)
          </span>
          <span className="font-bold text-sm">
            {tempCheckOut || 'Elegir fecha'}
          </span>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between py-2 px-1">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stone-400 py-1">
        {WEEKDAY_NAMES.map((wd, i) => (
          <div key={i}>{wd}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs py-1">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDateStr(currentYear, currentMonth, day);
          const isCheckIn = tempCheckIn === dateStr;
          const isCheckOut = tempCheckOut === dateStr;
          const isInRange =
            tempCheckIn &&
            tempCheckOut &&
            dateStr > tempCheckIn &&
            dateStr < tempCheckOut;

          let dayClasses = 'h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-xs ';

          if (isCheckIn || isCheckOut) {
            dayClasses += `${accentClasses.activeDay} shadow-xs font-bold `;
          } else if (isInRange) {
            dayClasses += `${accentClasses.rangeDay} rounded-none `;
          } else {
            dayClasses += 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 ';
          }

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => handleDayClick(day)}
              className={dayClasses}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5 pt-3 mt-2 border-t border-stone-200 dark:border-stone-800">
        <span className="text-[10px] text-stone-400 w-full mb-0.5 font-bold uppercase">
          Estadías Rápidas:
        </span>
        <button
          type="button"
          onClick={() => applyPreset(3)}
          className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium cursor-pointer"
        >
          Finde (3 noches)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(4)}
          className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium cursor-pointer"
        >
          Escapada (4 noches)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(7)}
          className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium cursor-pointer"
        >
          Semana (7 noches)
        </button>
      </div>

      {/* Footer bar */}
      <div className="pt-4 mt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold block">
            {nightsCount > 0 ? `${nightsCount} noche${nightsCount > 1 ? 's' : ''}` : 'Seleccione fechas'}
          </span>
          <span className="text-[10px] text-stone-500">
            {tempCheckIn && tempCheckOut ? `${tempCheckIn} al ${tempCheckOut}` : 'Tarifa directa congelada'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${accentClasses.btn}`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Confirmar Fechas</span>
        </button>
      </div>
    </div>
  );
};
