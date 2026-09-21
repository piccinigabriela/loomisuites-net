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
    showToast(`Enlace móvil de tareas de limpieza listo para enviar a ${cleanerName} por WhatsApp`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c1a] text-[#f4f2ee] text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-[#48372b] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#78b37e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#f4f2ee] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d88d5e]" />
            <span>Gestión Operativa de Limpieza & Mucamas</span>
          </h3>
          <p className="text-xs text-[#8e8c87] mt-0.5">
            Coordina a tu equipo sin que tengan que descargar aplicaciones. Enlaces móviles y checklists en tiempo real.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#2a2a2a] text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#2a2622] text-[#d88d5e] border border-[#48372b]'
                : 'text-[#8e8c87] hover:text-[#f4f2ee]'
            }`}
          >
            Todas ({demoState.cleaningTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-[#2a2622] text-[#d88d5e] border border-[#48372b]'
                : 'text-[#8e8c87] hover:text-[#f4f2ee]'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setFilterStatus('inspected')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'inspected'
                ? 'bg-[#1f2b20] text-[#a4cca8] border border-[#344836]'
                : 'text-[#8e8c87] hover:text-[#f4f2ee]'
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
              className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-6 shadow-xs flex flex-col justify-between hover:border-[#383838] transition-all"
            >
              <div>
                {/* Top Row: Property & Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#d88d5e] uppercase tracking-wider">
                      {prop?.neighborhood}
                    </span>
                    <h4 className="text-base font-bold text-[#f4f2ee]">{prop?.name}</h4>
                    <p className="text-xs text-[#8e8c87]">{prop?.address}</p>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as CleaningTask['status'])
                    }
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                      task.status === 'in_progress'
                        ? 'bg-[#2a241e] text-[#d88d5e] border-[#523d2e]'
                        : task.status === 'inspected'
                        ? 'bg-[#1f2b20] text-[#a4cca8] border-[#344836]'
                        : 'bg-[#181818] text-[#a8a5a0] border-[#333]'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="inspected">Inspeccionado / Listo</option>
                  </select>
                </div>

                {/* Cleaner Info Bar */}
                <div className="bg-[#161616] rounded-xl p-3 border border-[#282828] flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#777]" />
                    <span className="font-semibold text-[#f4f2ee]">{task.cleanerName}</span>
                    <span className="text-[#555]">•</span>
                    <span className="text-[#8e8c87]">{task.cleanerPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#8e8c87] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#777]" />
                    <span>Fecha: {formatDisplayDate(task.date)} ({task.scheduledTime})</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#a8a5a0]">Progreso del Turno</span>
                    <span className="text-[#d88d5e]">{completedCount} de {totalCount} items ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-[#282828]">
                    <div
                      className="h-full bg-[#c46d45] transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold text-[#7a7874] uppercase tracking-wider block">
                    Puntos Clave de Control:
                  </span>
                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-[#1b241c] border-[#2e402f] text-[#8e8c87] line-through'
                            : 'bg-[#181818] border-[#2c2c2c] text-[#c8c5c0] hover:border-[#444]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="rounded text-[#c46d45] focus:ring-[#c46d45]"
                        />
                        <span className="flex-1 select-none">{item.task}</span>
                        {item.completed && <Check className="w-3.5 h-3.5 text-[#78b37e]" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes or Observations */}
                {task.notes && (
                  <div className="bg-[#1e1b18] border border-[#48372b] rounded-xl p-3 text-xs text-[#d88d5e] flex items-start gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[#d88d5e] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Observación operativa:</span>
                      <p className="text-[11px] mt-0.5 text-[#c4b5a5]">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#282828] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateWhatsApp(task.cleanerName, prop?.name || '')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#a4cca8] bg-[#1f2b20] hover:bg-[#283d2c] border border-[#344836] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Tareas por WhatsApp</span>
                </button>

                <div className="text-[11px] text-[#7a7874] flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#777]" />
                  <span>Reporte fotográfico habilitado</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
