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
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c1a] text-[#f4f2ee] text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-[#48372b] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#78b37e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
            <span>Gestión Operativa de Limpieza & Mucamas</span>
          </h3>
          <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
            Coordina a tu equipo sin que tengan que descargar aplicaciones. Enlaces móviles y checklists en tiempo real.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#f8f6f2] dark:bg-[#141414] p-1 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-[#2a2622] text-[#c46d45] dark:text-[#d88d5e] border border-[#ded9cd] dark:border-[#48372b] shadow-2xs'
                : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18] dark:hover:text-[#f4f2ee]'
            }`}
          >
            Todas ({demoState.cleaningTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-white dark:bg-[#2a2622] text-[#c46d45] dark:text-[#d88d5e] border border-[#ded9cd] dark:border-[#48372b] shadow-2xs'
                : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18] dark:hover:text-[#f4f2ee]'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setFilterStatus('inspected')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'inspected'
                ? 'bg-[#edf4ed] dark:bg-[#1f2b20] text-[#3e6645] dark:text-[#a4cca8] border border-[#c6dcc6] dark:border-[#344836] shadow-2xs'
                : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18] dark:hover:text-[#f4f2ee]'
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
              className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-6 shadow-xs flex flex-col justify-between hover:border-[#c46d45]/40 dark:hover:border-[#383838] transition-all"
            >
              <div>
                {/* Top Row: Property & Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#c46d45] dark:text-[#d88d5e] uppercase tracking-wider">
                      {prop?.neighborhood}
                    </span>
                    <h4 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{prop?.name}</h4>
                    <p className="text-xs text-[#78746c] dark:text-[#8e8c87]">{prop?.address}</p>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTaskStatus(task.id, e.target.value as CleaningTask['status'])
                    }
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                      task.status === 'in_progress'
                        ? 'bg-[#f4eee7] dark:bg-[#2a241e] text-[#9c512a] dark:text-[#d88d5e] border-[#e4d6c9] dark:border-[#523d2e]'
                        : task.status === 'inspected'
                        ? 'bg-[#edf4ed] dark:bg-[#1f2b20] text-[#3e6645] dark:text-[#a4cca8] border-[#c6dcc6] dark:border-[#344836]'
                        : 'bg-[#f8f6f2] dark:bg-[#181818] text-[#55514a] dark:text-[#a8a5a0] border-[#ded9cd] dark:border-[#333]'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="inspected">Inspeccionado / Listo</option>
                  </select>
                </div>

                {/* Cleaner Info Bar */}
                <div className="bg-[#f8f6f2] dark:bg-[#161616] rounded-xl p-3 border border-[#ded9cd] dark:border-[#282828] flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#78746c]" />
                    <span className="font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{task.cleanerName}</span>
                    <span className="text-[#bbb] dark:text-[#555]">•</span>
                    <span className="text-[#78746c] dark:text-[#8e8c87]">{task.cleanerPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#78746c] dark:text-[#8e8c87] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Fecha: {formatDisplayDate(task.date)} ({task.scheduledTime})</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#78746c] dark:text-[#a8a5a0]">Progreso del Turno</span>
                    <span className="text-[#c46d45] dark:text-[#d88d5e]">{completedCount} de {totalCount} items ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#edeae2] dark:bg-[#141414] rounded-full overflow-hidden border border-[#ded9cd] dark:border-[#282828]">
                    <div
                      className="h-full bg-[#c46d45] transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold text-[#78746c] dark:text-[#7a7874] uppercase tracking-wider block">
                    Puntos Clave de Control:
                  </span>
                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-[#edf4ed] dark:bg-[#1b241c] border-[#c6dcc6] dark:border-[#2e402f] text-[#78746c] dark:text-[#8e8c87] line-through'
                            : 'bg-[#f8f6f2] dark:bg-[#181818] border-[#ded9cd] dark:border-[#2c2c2c] text-[#2c2a26] dark:text-[#c8c5c0] hover:border-[#c46d45]/40 dark:hover:border-[#444]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="rounded text-[#c46d45] focus:ring-[#c46d45]"
                        />
                        <span className="flex-1 select-none font-medium">{item.task}</span>
                        {item.completed && <Check className="w-3.5 h-3.5 text-[#3e6645] dark:text-[#78b37e]" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes or Observations */}
                {task.notes && (
                  <div className="bg-[#f4eee7] dark:bg-[#1e1b18] border border-[#e4d6c9] dark:border-[#48372b] rounded-xl p-3 text-xs text-[#9c512a] dark:text-[#d88d5e] flex items-start gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[#c46d45] dark:text-[#d88d5e] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Observación operativa:</span>
                      <p className="text-[11px] mt-0.5 text-[#78746c] dark:text-[#c4b5a5]">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#ded9cd] dark:border-[#282828] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateWhatsApp(task)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#3e6645] dark:text-[#a4cca8] bg-[#edf4ed] dark:bg-[#1f2b20] hover:bg-[#dfeadf] dark:hover:bg-[#283d2c] border border-[#c6dcc6] dark:border-[#344836] px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Tareas por WhatsApp</span>
                </button>

                <div className="text-[11px] text-[#78746c] dark:text-[#7a7874] flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#78746c] dark:text-[#777]" />
                  <span>Reporte fotográfico habilitado</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURE LINK SHARE SIMULATION MODAL */}
      {selectedTaskForShare && (
        <div className="fixed inset-0 bg-[#121110]/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#ded9cd] dark:border-[#2d2d2d] shadow-2xl w-full max-w-2xl overflow-hidden transition-all transform scale-100">
            {/* Modal Header */}
            <div className="bg-[#fbf9f5] dark:bg-[#1e1e1e] px-6 py-4 border-b border-[#ded9cd]/80 dark:border-[#2d2d2d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#c46d45] dark:text-[#d88d5e]" />
                <h3 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">
                  ¿Cómo accede el personal? (Seguridad & Roles)
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForShare(null)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Simulated Phone on Left (5 cols) */}
                <div className="md:col-span-5 flex flex-col space-y-2">
                  <span className="text-[10px] font-bold text-[#7a7874] dark:text-[#8e8c87] uppercase tracking-wider block">Mensaje de WhatsApp Generado</span>
                  
                  {/* Phone Shell */}
                  <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-2xl p-3.5 border border-[#c4bfb5] dark:border-[#222] min-h-[220px] flex flex-col justify-between shadow-inner">
                    {/* Chat Header */}
                    <div className="bg-white/80 dark:bg-[#202c33] rounded-lg p-2 flex items-center gap-2 border border-black/5 dark:border-white/5 mb-3">
                      <div className="w-7 h-7 rounded-full bg-[#c46d45] text-white flex items-center justify-center text-xs font-black">
                        {selectedTaskForShare.cleanerName.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{selectedTaskForShare.cleanerName}</p>
                        <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none">En línea</p>
                      </div>
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] text-zinc-900 dark:text-white rounded-lg p-2.5 max-w-[90%] text-[10px] shadow-xs self-start border border-black/5 leading-relaxed">
                      <p className="font-semibold text-[#1c1b18] dark:text-emerald-100">Loomi Suite • Tareas de hoy 🧹</p>
                      <p className="mt-1">
                        Hola <strong>{selectedTaskForShare.cleanerName}</strong>! Te comparto la planilla de limpieza de hoy para:
                      </p>
                      <p className="font-bold text-[#c46d45] dark:text-[#ffd2b3] mt-1">
                        🏡 {getProperty(selectedTaskForShare.propertyId)?.name}
                      </p>
                      <p className="mt-1 font-mono text-[9px] bg-white/40 dark:bg-black/20 p-1.5 rounded border border-black/5 break-all">
                        https://loomi.app/task/{selectedTaskForShare.propertyId}?token={selectedTaskForShare.id.substring(0, 8)}
                      </p>
                      <p className="text-[8px] text-[#7a7a7a] dark:text-emerald-300 text-right mt-1">11:42 AM ✔✔</p>
                    </div>

                    <div className="text-center text-[9px] text-[#7a7874] dark:text-zinc-500 italic mt-3 bg-white/50 dark:bg-black/30 py-1 rounded">
                      Se envía con un solo clic por WhatsApp
                    </div>
                  </div>
                </div>

                {/* Secure explanation on Right (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-[#c46d45] dark:text-[#d88d5e] uppercase tracking-wider">¿Por qué es 100% Seguro?</h4>
                  
                  <div className="space-y-3.5">
                    {/* Item 1 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-[#f4f2ee]">Enlace de acceso único (Tokenizado)</p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#a8a5a0] leading-relaxed mt-0.5">
                          El personal accede a través de ese enlace cifrado temporal. **No necesitan registrar usuarios ni recordar contraseñas** (lo que elimina el soporte por claves olvidadas).
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-[#f4f2ee]">Interfaz Estrictamente Restringida</p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#a8a5a0] leading-relaxed mt-0.5">
                          Cuando abren ese enlace en su celular, la aplicación **no muestra el menú lateral de administración**, ni el calendario general, ni las tarifas, ni los reportes de ingresos. Es un panel 100% limpio y dedicado.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-[#f4f2ee]">Sincronización Interactiva en Vivo</p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#a8a5a0] leading-relaxed mt-0.5">
                          A medida que tildan las tareas (blancos, sábanas, Wi-Fi), el avance se refleja en tu panel general. No hay posibilidad de que ingresen o modifiquen datos que no les corresponden.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#fbf9f5] dark:bg-[#1e1e1e] px-6 py-4 border-t border-[#ded9cd]/80 dark:border-[#2d2d2d] flex justify-end">
              <button
                onClick={() => setSelectedTaskForShare(null)}
                className="px-4 py-2 bg-[#c46d45] hover:bg-[#b85e35] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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
