import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Camera,
  AlertTriangle,
  Plus,
  Send,
  Check,
  Lock,
  X,
} from 'lucide-react';
import { DemoState, CleaningTask, Property } from '../../types';
import { formatDisplayDate } from '../../data/initialData';

interface DemoHousekeepingProps {
  demoState: DemoState;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: CleaningTask['status']) => void;
}

export const DemoHousekeeping: React.FC<DemoHousekeepingProps> = ({
  demoState,
  onToggleChecklistItem,
  onUpdateTaskStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTaskForShare, setSelectedTaskForShare] = useState<CleaningTask | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTasks = demoState.cleaningTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const getProperty = (propId: string): Property | undefined => {
    return demoState.properties.find((p) => p.id === propId);
  };

  const handleSimulateWhatsApp = (task: CleaningTask) => {
    setSelectedTaskForShare(task);
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E67E22]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> HOUSEKEEPING • PUESTA A PUNTO
          </span>
          <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-[#E67E22]" />
            <span>Operaciones & Limpieza de Unidades</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
            Coordinación del staff operativo sin instalar aplicaciones pesadas. Checklists en vivo con un clic.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Todas ({demoState.cleaningTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setFilterStatus('inspected')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              filterStatus === 'inspected'
                ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Listas
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredTasks.map((task) => {
          const prop = getProperty(task.propertyId);
          const completedCount = task.checklist.filter((c) => c.completed).length;
          const totalCount = task.checklist.length;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={task.id}
              className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-orange-200 transition-all"
            >
              <div>
                {/* Top Row: Property & Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div>
                    <span className="text-[10px] font-semibold text-[#E67E22] uppercase tracking-wider">
                      {prop?.neighborhood}
                    </span>
                    <h4 className="text-base font-bold text-stone-800 dark:text-stone-100 tracking-tight">{prop?.name}</h4>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{prop?.address}</p>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as CleaningTask['status'])
                    }
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                      task.status === 'in_progress'
                        ? 'bg-orange-50 text-[#E67E22] border-orange-200 dark:bg-orange-950/40'
                        : task.status === 'inspected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40'
                        : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="inspected">Inspeccionado / Listo</option>
                  </select>
                </div>

                {/* Cleaner Info Bar */}
                <div className="bg-stone-50/70 dark:bg-zinc-800/50 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{task.cleanerName}</span>
                    <span className="text-stone-300 dark:text-zinc-600">•</span>
                    <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">{task.cleanerPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>{formatDisplayDate(task.date)} ({task.scheduledTime})</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-stone-500 dark:text-stone-400">Progreso del Turno</span>
                    <span className="text-[#E67E22] font-semibold">{completedCount} de {totalCount} items ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E67E22] transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist with Zen organic touch */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                    Puntos Clave de Control:
                  </span>
                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-stone-400 dark:text-stone-500 line-through'
                            : 'bg-stone-50/60 dark:bg-zinc-800/40 border-stone-100 dark:border-zinc-700/60 text-stone-700 dark:text-stone-200 hover:border-orange-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="rounded-md text-[#E67E22] focus:ring-[#E67E22] accent-[#E67E22] w-4 h-4"
                        />
                        <span className="flex-1 select-none font-medium">{item.task}</span>
                        {item.completed && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes or Observations */}
                {task.notes && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl p-3 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block uppercase text-[10px] text-amber-600 dark:text-amber-400">Observación operativa:</span>
                      <p className="text-[11px] mt-0.5 text-stone-600 dark:text-stone-400">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateWhatsApp(task)}
                  className="flex items-center gap-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <div className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-stone-400" />
                  <span>Fotos habilitadas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURE LINK SHARE SIMULATION MODAL */}
      {selectedTaskForShare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden transition-all transform scale-100">
            {/* Modal Header */}
            <div className="bg-stone-50/80 dark:bg-zinc-800/60 px-6 py-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-orange-50 text-[#E67E22]">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  Acceso del Personal (Planilla por WhatsApp)
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForShare(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Simulated Phone on Left (5 cols) */}
                <div className="md:col-span-5 flex flex-col space-y-2">
                  <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">Mensaje de WhatsApp Generado</span>
                  
                  {/* Phone Shell */}
                  <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-3.5 border border-stone-200/70 dark:border-zinc-800 min-h-[220px] flex flex-col justify-between">
                    {/* Chat Header */}
                    <div className="bg-white dark:bg-[#18191E] rounded-xl p-2.5 flex items-center gap-2.5 border border-stone-100 dark:border-zinc-800 mb-3 shadow-2xs">
                      <div className="w-7 h-7 rounded-full bg-[#E67E22] text-white flex items-center justify-center text-xs font-bold">
                        {selectedTaskForShare.cleanerName.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{selectedTaskForShare.cleanerName}</p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium leading-none">En línea</p>
                      </div>
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 text-stone-800 dark:text-emerald-100 rounded-2xl p-3 text-[11px] shadow-xs self-start border border-emerald-200/80 dark:border-emerald-800 leading-relaxed">
                      <p className="font-bold text-stone-800 dark:text-emerald-200">Loomi Suite • Limpiezas de hoy 🧹</p>
                      <p className="mt-1">
                        Hola <strong>{selectedTaskForShare.cleanerName}</strong>! Te comparto la planilla para:
                      </p>
                      <p className="font-semibold text-[#E67E22] mt-1">
                        🏡 {getProperty(selectedTaskForShare.propertyId)?.name}
                      </p>
                      <p className="mt-1.5 font-mono text-[9px] bg-white/80 dark:bg-black/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800 break-all">
                        https://loomi.app/task/{selectedTaskForShare.propertyId}?token={selectedTaskForShare.id.substring(0, 8)}
                      </p>
                      <p className="text-[9px] text-stone-400 dark:text-emerald-400 text-right mt-1.5">11:42 AM ✔✔</p>
                    </div>

                    <div className="text-center text-[10px] text-stone-400 dark:text-stone-500 italic mt-3 bg-white/70 dark:bg-zinc-800/70 py-1.5 rounded-xl font-medium">
                      Se envía con un solo toque por WhatsApp
                    </div>
                  </div>
                </div>

                {/* Secure explanation on Right (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-[#E67E22] uppercase tracking-wider">¿Por qué es 100% Seguro?</h4>
                  
                  <div className="space-y-3.5">
                    {/* Item 1 */}
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Enlace de acceso temporal (Tokenizado)</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                          El personal accede a través de ese enlace cifrado. No necesitan contraseñas ni descargar apps pesadas en sus celulares.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">Interfaz Estrictamente Restringida</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] leading-relaxed mt-0.5">
                          En su celular no se muestra menú de administración, ni calendario general, ni tarifas o finanzas. Solo su checklist.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">Sincronización Interactiva en Vivo</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] leading-relaxed mt-0.5">
                          A medida que tildan las tareas, el avance se refleja en tu panel general al instante.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#DEDBD2] dark:bg-[#141518] px-6 py-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end">
              <button
                onClick={() => setSelectedTaskForShare(null)}
                className="px-4 py-2 bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] text-xs font-bold uppercase tracking-wider rounded-none shadow-md transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
