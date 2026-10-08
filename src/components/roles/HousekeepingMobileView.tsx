import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ChevronRight,
  Shield,
  DoorClosed,
  DoorOpen,
  BedDouble,
  Coffee,
  Wind,
  Droplets,
  MessageSquare,
  ArrowLeft,
  X,
  CheckCheck,
} from 'lucide-react';
import { DemoState, CleaningTask, Property } from '../../types';
import { formatDisplayDate } from '../../data/initialData';

interface HousekeepingMobileViewProps {
  demoState: DemoState;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: CleaningTask['status']) => void;
  onSwitchRole: (role: 'admin' | 'frontdesk' | 'housekeeping') => void;
  complexName?: string;
}

// 4 puntos oficiales del checklist rápido
const STANDARD_CHECKLIST = [
  { id: 'chk-1', label: 'Ropa de cama & toallas limpias', icon: BedDouble },
  { id: 'chk-2', label: 'Baño higienizado & amenities repuestos', icon: Droplets },
  { id: 'chk-3', label: 'Cocina & vajilla revisada', icon: Coffee },
  { id: 'chk-4', label: 'Ventilación & aroma de bienvenida', icon: Wind },
];

export const HousekeepingMobileView: React.FC<HousekeepingMobileViewProps> = ({
  demoState,
  onToggleChecklistItem,
  onUpdateTaskStatus,
  onSwitchRole,
  complexName = 'Catalinas Apartamentos',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'ready'>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for 4-point checks per task
  const [localChecks, setLocalChecks] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    demoState.cleaningTasks.forEach((t) => {
      const isComplete = t.status === 'completed' || t.status === 'inspected';
      initial[t.id] = {
        'chk-1': isComplete || (t.checklist?.find((c) => c.task.toLowerCase().includes('cama'))?.completed ?? false),
        'chk-2': isComplete || (t.checklist?.find((c) => c.task.toLowerCase().includes('baño'))?.completed ?? false),
        'chk-3': isComplete || (t.checklist?.find((c) => c.task.toLowerCase().includes('cocina'))?.completed ?? false),
        'chk-4': isComplete || (t.checklist?.find((c) => c.task.toLowerCase().includes('revisar'))?.completed ?? false),
      };
    });
    return initial;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getProp = (propId: string): Property | undefined => {
    return demoState.properties.find((p) => p.id === propId);
  };

  const tasks = demoState.cleaningTasks;

  // 3-state traffic light helper:
  // 1: 'pending' -> Ocupada / Salida pendiente (Rojo/Ámbar)
  // 2: 'in_progress' -> Para limpiar (Amarillo/Naranja)
  // 3: 'inspected' | 'completed' -> Limpia e inspeccionada (Verde)
  const getTrafficStatus = (task: CleaningTask): 'occupied' | 'to_clean' | 'ready' => {
    if (task.status === 'inspected' || task.status === 'completed') return 'ready';
    if (task.status === 'in_progress') return 'to_clean';
    return 'occupied';
  };

  const countOccupied = tasks.filter((t) => getTrafficStatus(t) === 'occupied').length;
  const countToClean = tasks.filter((t) => getTrafficStatus(t) === 'to_clean').length;
  const countReady = tasks.filter((t) => getTrafficStatus(t) === 'ready').length;

  const filteredTasks = tasks.filter((t) => {
    const s = getTrafficStatus(t);
    if (activeTab === 'pending') return s === 'occupied' || s === 'to_clean';
    if (activeTab === 'ready') return s === 'ready';
    return true;
  });

  const toggleCheck = (taskId: string, checkId: string) => {
    setLocalChecks((prev) => {
      const taskObj = prev[taskId] || {};
      const nextVal = !taskObj[checkId];
      return {
        ...prev,
        [taskId]: {
          ...taskObj,
          [checkId]: nextVal,
        },
      };
    });
  };

  // Botón táctil destacado: "Marcar unidad lista"
  const handleMarkReady = (taskId: string, propName: string) => {
    // 1. Mark all 4 checks as completed
    setLocalChecks((prev) => ({
      ...prev,
      [taskId]: {
        'chk-1': true,
        'chk-2': true,
        'chk-3': true,
        'chk-4': true,
      },
    }));

    // 2. Set official status to 'inspected'
    onUpdateTaskStatus(taskId, 'inspected');
    showToast(`✓ ${propName} marcada como LIMPIA E INSPECCIONADA`);
  };

  const handleSetTrafficStatus = (taskId: string, newTrafficState: 'occupied' | 'to_clean' | 'ready') => {
    if (newTrafficState === 'ready') {
      onUpdateTaskStatus(taskId, 'inspected');
    } else if (newTrafficState === 'to_clean') {
      onUpdateTaskStatus(taskId, 'in_progress');
    } else {
      onUpdateTaskStatus(taskId, 'pending');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1012] font-['Inter',sans-serif] text-stone-800 dark:text-stone-100 pb-16 antialiased selection:bg-orange-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Header Ultraliviano para Smartphone (PWA) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#18191E]/95 backdrop-blur-md border-b border-stone-200/60 dark:border-zinc-800 px-4 py-3 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase">
                PWA MUCAMAS EN VIVO
              </span>
            </div>
            <h1 className="text-base font-semibold text-stone-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E67E22]" />
              <span>Loomi Limpieza</span>
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light truncate max-w-[220px]">
              {complexName}
            </p>
          </div>

          {/* Role switcher minimalista */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => onSwitchRole('admin')}
              className="px-2 py-1 rounded-lg text-stone-500 hover:text-stone-900 text-[11px] font-medium cursor-pointer"
              title="Volver a Modo Dueño"
            >
              👑 Dueño
            </button>
            <button
              onClick={() => onSwitchRole('frontdesk')}
              className="px-2 py-1 rounded-lg text-stone-500 hover:text-stone-900 text-[11px] font-medium cursor-pointer"
              title="Ir a Recepción"
            >
              🛎️ Recepción
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* SEMÁFORO DE 3 ESTADOS (Resumen Táctil de Hoy) */}
        <section className="bg-white dark:bg-[#18191E] rounded-3xl p-3.5 border border-stone-200/60 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono">
              Semáforo de Unidades ({tasks.length})
            </span>
            <span className="text-[10px] text-stone-400 font-light">
              Toca para filtrar
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* 1. Ocupada / Salida pendiente */}
            <button
              onClick={() => setActiveTab(activeTab === 'pending' ? 'all' : 'pending')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === 'pending'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                Salida Pendiente
              </span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
                {countOccupied}
              </span>
            </button>

            {/* 2. Para Limpiar */}
            <button
              onClick={() => setActiveTab(activeTab === 'pending' ? 'all' : 'pending')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                Para Limpiar
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                {countToClean}
              </span>
            </button>

            {/* 3. Limpia e Inspeccionada */}
            <button
              onClick={() => setActiveTab(activeTab === 'ready' ? 'all' : 'ready')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === 'ready'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                Listas (OK)
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {countReady}
              </span>
            </button>
          </div>
        </section>

        {/* LISTA DE UNIDADES DEL DÍA */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Unidades a Realizar Hoy
            </span>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="text-[11px] text-[#E67E22] hover:underline cursor-pointer"
              >
                Ver todas ({tasks.length})
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 font-light bg-white dark:bg-[#18191E] rounded-3xl border border-stone-200/60 dark:border-zinc-800">
              No hay unidades en esta categoría.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const prop = getProp(task.propertyId);
              const traffic = getTrafficStatus(task);
              const isReady = traffic === 'ready';
              const checks = localChecks[task.id] || {};
              const checkedCount = Object.values(checks).filter(Boolean).length;
              const isExpanded = expandedTaskId === task.id || !isReady;

              return (
                <div
                  key={task.id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                    isReady
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                      : traffic === 'to_clean'
                      ? 'bg-white dark:bg-[#18191E] border-amber-200/80 dark:border-amber-900/50 shadow-[0_4px_20px_rgba(245,158,11,0.04)]'
                      : 'bg-white dark:bg-[#18191E] border-rose-200/70 dark:border-rose-900/40 shadow-[0_4px_20px_rgba(244,63,94,0.03)]'
                  }`}
                >
                  {/* Tarjeta de Encabezado de Unidad */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                            {prop?.name || 'Unidad'}
                          </span>
                          <span className="text-[10px] text-stone-400 font-light">
                            {task.scheduledTime || '11:00 a 14:00 hs'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1">
                          Asignada a: <strong>{task.cleanerName}</strong>
                        </p>
                      </div>

                      {/* Badge del Semáforo */}
                      <div className="shrink-0 text-right">
                        {traffic === 'ready' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            Limpia OK
                          </span>
                        )}
                        {traffic === 'to_clean' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            Para Limpiar
                          </span>
                        )}
                        {traffic === 'occupied' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/40">
                            <DoorClosed className="w-3 h-3 text-rose-600" />
                            Ocupada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SELECTOR DEL SEMÁFORO DE 3 ESTADOS (Selector táctil de 1 toque) */}
                    <div className="pt-1">
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl border border-stone-200/60 dark:border-zinc-700/60 text-[11px]">
                        <button
                          onClick={() => handleSetTrafficStatus(task.id, 'occupied')}
                          className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            traffic === 'occupied'
                              ? 'bg-rose-500 text-white font-bold shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          <span>🔴 Ocupada</span>
                        </button>

                        <button
                          onClick={() => handleSetTrafficStatus(task.id, 'to_clean')}
                          className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            traffic === 'to_clean'
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          <span>🟡 Limpiar</span>
                        </button>

                        <button
                          onClick={() => handleSetTrafficStatus(task.id, 'ready')}
                          className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            traffic === 'ready'
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          <span>🟢 Limpia</span>
                        </button>
                      </div>
                    </div>

                    {/* CHECKLIST RÁPIDO DE 4 PUNTOS */}
                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">
                          Checklist de 4 Puntos ({checkedCount}/4):
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {checkedCount === 4 ? '✓ Completo' : 'Toca cada ítem'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {STANDARD_CHECKLIST.map((item) => {
                          const Icon = item.icon;
                          const isChecked = !!checks[item.id];
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleCheck(task.id, item.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs ${
                                isChecked
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-medium'
                                  : 'bg-stone-50/70 dark:bg-zinc-800/40 border-stone-200/60 dark:border-zinc-700/60 text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-600' : 'text-stone-400'}`} />
                                <span className={isChecked ? 'line-through opacity-85' : ''}>
                                  {item.label}
                                </span>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* BOTÓN TÁCTIL DESTACADO: 'MARCAR UNIDAD LISTA' */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleMarkReady(task.id, prop?.name || 'Unidad')}
                        className={`w-full min-h-[48px] py-3 px-4 rounded-2xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                          isReady
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{isReady ? '✓ Unidad Lista e Inspeccionada' : 'Marcar Unidad Lista'}</span>
                      </button>
                    </div>

                    {/* Reporte rápido de novedad */}
                    {task.notes && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Nota de mucama:</strong> {task.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
