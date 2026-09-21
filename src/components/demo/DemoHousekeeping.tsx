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

  const handleSimulateWhatsApp = (cleanerName: string, propName: string) => {
    showToast(`Enlace de tareas de limpieza generado y listo para enviar a ${cleanerName} por WhatsApp`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-zinc-700 flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Gestión Operativa de Limpieza & Mucamas</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Coordina a tu equipo sin que tengan que descargar aplicaciones. Todo mediante enlaces móviles y checklists en tiempo real.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Todas ({demoState.cleaningTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setFilterStatus('inspected')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'inspected'
                ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Listas
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const prop = getProperty(task.propertyId);
          const completedCount = task.checklist.filter((c) => c.completed).length;
          const totalCount = task.checklist.length;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={task.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                {/* Top Row: Property & Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {prop?.neighborhood}
                    </span>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{prop?.name}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{prop?.address}</p>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as CleaningTask['status'])
                    }
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                      task.status === 'in_progress'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : task.status === 'inspected'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="inspected">Inspeccionado / Listo</option>
                  </select>
                </div>

                {/* Cleaner Info Bar */}
                <div className="bg-zinc-50 dark:bg-zinc-800/80 rounded-xl p-3 border border-zinc-200/80 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{task.cleanerName}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{task.cleanerPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Fecha: {formatDisplayDate(task.date)} ({task.scheduledTime})</span>
                  </div>
                </div>

                {/* Interactive Checklist */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Checklist de Calidad ({completedCount}/{totalCount})</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          item.completed
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-zinc-700 dark:text-zinc-400 line-through'
                            : 'bg-white dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer rounded"
                        />
                        <span className="select-none">{item.task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes and Photos */}
                {task.notes && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/60 mb-3">
                    <strong>Nota operativa:</strong> {task.notes}
                  </p>
                )}

                {task.photosUploaded ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
                    <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{task.photosUploaded} fotos de control subidas por la mucama</span>
                  </div>
                ) : null}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateWhatsApp(task.cleanerName, prop?.name || '')}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Tarea a WhatsApp</span>
                </button>

                <button
                  onClick={() =>
                    onUpdateTaskStatus(
                      task.id,
                      task.status === 'inspected' ? 'in_progress' : 'inspected'
                    )
                  }
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer"
                >
                  {task.status === 'inspected' ? 'Reabrir tarea' : 'Marcar Aprobado'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
