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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] dark:bg-[#0C0D0F] text-[#EFECE5] text-xs font-bold px-4 py-3 rounded-none shadow-xl border border-[#E1500A] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E1500A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#18181B] dark:text-[#EFECE5] flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-[#E1500A]" />
            <span>Gestión Operativa de Limpieza & Mucamas</span>
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5">
            Coordina a tu equipo sin que tengan que descargar aplicaciones. Enlaces móviles y checklists en tiempo real.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#DEDBD2] dark:bg-[#141518] p-1 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-none font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xs'
                : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-[#EFECE5]'
            }`}
          >
            Todas ({demoState.cleaningTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-none font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xs'
                : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-[#EFECE5]'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setFilterStatus('inspected')}
            className={`px-3 py-1.5 rounded-none font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
              filterStatus === 'inspected'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-[#EFECE5]'
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
              className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-5 sm:p-6 shadow-2xs flex flex-col justify-between hover:border-[#E1500A] transition-all"
            >
              <div>
                {/* Top Row: Property & Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-black text-[#E1500A] uppercase tracking-wider">
                      {prop?.neighborhood}
                    </span>
                    <h4 className="text-base font-bold text-[#18181B] dark:text-[#EFECE5] tracking-tight">{prop?.name}</h4>
                    <p className="text-xs text-[#71717A] dark:text-[#8E8E93]">{prop?.address}</p>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as CleaningTask['status'])
                    }
                    className={`text-xs font-bold px-3 py-1.5 rounded-none border cursor-pointer ${
                      task.status === 'in_progress'
                        ? 'bg-[#E1500A]/10 text-[#E1500A] border-[#E1500A]/40'
                        : task.status === 'inspected'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                        : 'bg-[#F4F2EE] dark:bg-[#141518] text-[#71717A] dark:text-[#8E8E93] border-[#C8C4B7] dark:border-[#222328]'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="inspected">Inspeccionado / Listo</option>
                  </select>
                </div>

                {/* Cleaner Info Bar */}
                <div className="bg-[#DEDBD2]/50 dark:bg-[#141518] rounded-none p-3 border border-[#C8C4B7] dark:border-[#222328] flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#71717A] dark:text-[#8E8E93]" />
                    <span className="font-black text-[#18181B] dark:text-[#EFECE5]">{task.cleanerName}</span>
                    <span className="text-[#C8C4B7] dark:text-[#333]">•</span>
                    <span className="text-[#71717A] dark:text-[#8E8E93] font-mono">{task.cleanerPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#71717A] dark:text-[#8E8E93] font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#E1500A]" />
                    <span className="font-mono">Fecha: {formatDisplayDate(task.date)} ({task.scheduledTime})</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#71717A] dark:text-[#8E8E93]">Progreso del Turno</span>
                    <span className="text-[#E1500A] font-mono">{completedCount} de {totalCount} items ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEDBD2] dark:bg-[#141518] rounded-none overflow-hidden border border-[#C8C4B7] dark:border-[#222328]">
                    <div
                      className="h-full bg-[#E1500A] transition-all duration-300 rounded-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">
                    Puntos Clave de Control:
                  </span>
                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2 rounded-none border text-xs cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 text-[#71717A] dark:text-[#8E8E93] line-through'
                            : 'bg-[#F4F2EE] dark:bg-[#141518] border-[#C8C4B7] dark:border-[#222328] text-[#18181B] dark:text-[#EFECE5] hover:border-[#E1500A]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="rounded-none text-[#E1500A] focus:ring-[#E1500A] accent-[#E1500A]"
                        />
                        <span className="flex-1 select-none font-bold">{item.task}</span>
                        {item.completed && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes or Observations */}
                {task.notes && (
                  <div className="bg-[#E1500A]/10 dark:bg-[#E1500A]/15 border border-[#E1500A]/30 rounded-none p-3 text-xs text-[#18181B] dark:text-[#EFECE5] flex items-start gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black block uppercase text-[10px] text-[#E1500A]">Observación operativa:</span>
                      <p className="text-[11px] mt-0.5 text-[#71717A] dark:text-[#8E8E93]">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateWhatsApp(task)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 px-3.5 py-2 rounded-none transition-colors cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <div className="text-[11px] text-[#71717A] dark:text-[#8E8E93] flex items-center gap-1 font-mono">
                  <Camera className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Fotos habilitadas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURE LINK SHARE SIMULATION MODAL */}
      {selectedTaskForShare && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xl w-full max-w-2xl overflow-hidden transition-all transform scale-100">
            {/* Modal Header */}
            <div className="bg-[#DEDBD2] dark:bg-[#141518] px-6 py-4 border-b border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EFECE5] uppercase tracking-wider">
                  Acceso del Personal (Seguridad & Roles)
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForShare(null)}
                className="p-1 rounded-none text-[#71717A] hover:bg-[#C8C4B7] dark:hover:bg-[#222328] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Simulated Phone on Left (5 cols) */}
                <div className="md:col-span-5 flex flex-col space-y-2">
                  <span className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Mensaje de WhatsApp Generado</span>
                  
                  {/* Phone Shell */}
                  <div className="bg-[#EAE8E3] dark:bg-[#141518] rounded-none p-3.5 border border-[#C8C4B7] dark:border-[#222328] min-h-[220px] flex flex-col justify-between">
                    {/* Chat Header */}
                    <div className="bg-white dark:bg-[#0C0D0F] rounded-none p-2 flex items-center gap-2 border border-[#C8C4B7] dark:border-[#222328] mb-3">
                      <div className="w-7 h-7 rounded-none bg-[#E1500A] text-white flex items-center justify-center text-xs font-black">
                        {selectedTaskForShare.cleanerName.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#18181B] dark:text-[#EFECE5]">{selectedTaskForShare.cleanerName}</p>
                        <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none">En línea</p>
                      </div>
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 text-[#18181B] dark:text-emerald-100 rounded-none p-2.5 max-w-[95%] text-[10px] shadow-xs self-start border border-emerald-300 dark:border-emerald-800 leading-relaxed">
                      <p className="font-black text-[#18181B] dark:text-emerald-200">Loomi Suite • Tareas de hoy 🧹</p>
                      <p className="mt-1">
                        Hola <strong>{selectedTaskForShare.cleanerName}</strong>! Te comparto la planilla de limpieza de hoy para:
                      </p>
                      <p className="font-bold text-[#E1500A] mt-1">
                        🏡 {getProperty(selectedTaskForShare.propertyId)?.name}
                      </p>
                      <p className="mt-1 font-mono text-[9px] bg-white/60 dark:bg-black/40 p-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] break-all">
                        https://loomi.app/task/{selectedTaskForShare.propertyId}?token={selectedTaskForShare.id.substring(0, 8)}
                      </p>
                      <p className="text-[8px] text-[#71717A] dark:text-emerald-400 text-right mt-1">11:42 AM ✔✔</p>
                    </div>

                    <div className="text-center text-[9px] text-[#71717A] dark:text-[#8E8E93] italic mt-3 bg-white/50 dark:bg-black/30 py-1 rounded-none font-mono">
                      Se envía con un solo clic por WhatsApp
                    </div>
                  </div>
                </div>

                {/* Secure explanation on Right (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-[#E1500A] uppercase tracking-wider">¿Por qué es 100% Seguro?</h4>
                  
                  <div className="space-y-3.5">
                    {/* Item 1 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">Enlace de acceso único (Tokenizado)</p>
                        <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] leading-relaxed mt-0.5">
                          El personal accede a través de ese enlace cifrado temporal. No necesitan contraseñas ni descargar apps pesadas.
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
