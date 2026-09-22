import React from 'react';
import {
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  Eye,
  Building,
} from 'lucide-react';
import { DemoState, Reservation, CleaningTask } from '../../types';
import { formatCurrency, formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface CleanTodayProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservation: () => void;
  onNavigateTab: (tab: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: CleaningTask['status']) => void;
  onQuickCheckIn: (resId: string) => void;
  isEmployeeMode?: boolean;
  userRole?: 'admin' | 'frontdesk' | 'housekeeping';
}

export const CleanToday: React.FC<CleanTodayProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservation,
  onNavigateTab,
  onUpdateTaskStatus,
  onQuickCheckIn,
  isEmployeeMode = false,
  userRole = 'admin',
}) => {
  const today = getRelativeDate(0);

  // Total monthly revenue calculation
  const totalRevenue = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  // Cash drawer calculation for frontdesk preview
  const openingCash = 50000;
  const cashMovements = demoState.cashMovements || [];
  const cashMovementsOnly = cashMovements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn;

  const totalNights = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.nights, 0);

  const activeReservationsCount = demoState.reservations.filter(
    (r) => r.status !== 'cancelled'
  ).length;

  const todayCheckIns = demoState.reservations.filter(
    (r) => r.checkIn === today && r.status !== 'cancelled'
  );

  const todayCheckOuts = demoState.reservations.filter(
    (r) => r.checkOut === today && r.status !== 'cancelled'
  );

  // Cleaning list
  const cleaningTasks = demoState.cleaningTasks;

  const getPropName = (propId: string) => {
    const p = demoState.properties.find((item) => item.id === propId);
    return p ? p.name : propId;
  };

  const getPropShortCode = (propId: string) => {
    const p = demoState.properties.find((item) => item.id === propId);
    if (!p) return '1A';
    const match = p.name.match(/\b([0-9][A-Za-z]|[0-9]+)\b/);
    if (match) return match[1].toUpperCase();
    return p.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-[#1c1b18] dark:text-[#f0eeeb] tracking-tight">Hoy</h2>
        <p className="text-xs text-[#78746c] dark:text-[#8c8a85] mt-0.5">
          Resumen del día y próximos movimientos
        </p>
      </div>

      {/* Top 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Ocupados Hoy */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
            Ocupados Hoy
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">
            {demoState.properties.length > 0 ? `1` : `0`}{' '}
            <span className="text-xs font-normal text-[#8e8a83] dark:text-[#807d78]">
              /{demoState.properties.length}
            </span>
          </div>
          <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">Deptos activos</div>
        </div>

        {/* Card 2: Ingresos Mes (for admin) or Caja (for frontdesk) or Employee Mode */}
        {userRole === 'admin' ? (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
            <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
              Ingresos Mes
            </div>
            <div className="mt-2 text-2xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">
              USD {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">
              Total facturado · neto prop. USD {(totalRevenue * 0.76).toFixed(2)}
            </div>
          </div>
        ) : userRole === 'frontdesk' ? (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
            <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
              Caja de Mostrador
            </div>
            <div className="mt-2 text-2xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">
              ${currentCashBalance.toLocaleString('es-AR')} ARS
            </div>
            <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">
              Fondo inicial: $50,000 ARS
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
            <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
              Modo Operativo
            </div>
            <div className="mt-2 text-xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">Día a Día</div>
            <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">Métricas financieras ocultas</div>
          </div>
        )}

        {/* Card 3: Noches Mes */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
            Noches Mes
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">
            {totalNights}{' '}
            <span className="text-xs font-normal text-[#8e8a83] dark:text-[#807d78]">~2x</span>
          </div>
          <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">Vendidas · prom. por reserva</div>
        </div>

        {/* Card 4: Check-ins 7D */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="text-[10px] font-bold text-[#78746c] dark:text-[#8a8883] uppercase tracking-wider">
            Check-ins 7D
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1c1b18] dark:text-[#f2efe9]">
            {activeReservationsCount}
          </div>
          <div className="text-[11px] text-[#78746c] dark:text-[#706e6a] mt-0.5">Próximas llegadas</div>
        </div>
      </div>

      {/* Row 2: Check-ins HOY (3 cols), Check-outs HOY (3 cols), A Limpiar (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Check-ins HOY */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#4f7858] dark:bg-[#82ba8f]" />
              <h3 className="text-xs font-bold text-[#2c2a26] dark:text-[#d4d1cc]">
                Check-ins HOY · {todayCheckIns.length}
              </h3>
            </div>

            {todayCheckIns.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8e8a83] dark:text-[#6e6c68]">
                Sin check-ins
              </div>
            ) : (
              <div className="space-y-2">
                {todayCheckIns.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-2.5 rounded-lg bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2a2a2a] border border-[#ded9cd] dark:border-[#2e2e2e] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f4eee7] dark:bg-[#382a22] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-transparent">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <span className="text-xs font-semibold text-[#1c1b18] dark:text-[#ebe8e1]">
                        {res.guestName}
                      </span>
                    </div>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickCheckIn(res.id);
                        }}
                        className="text-[10px] font-bold bg-[#edf4ed] dark:bg-[#2a382e] text-[#3e6645] dark:text-[#82ba8f] hover:bg-[#dfeadf] dark:hover:bg-[#344839] px-2 py-0.5 rounded border border-[#c6dcc6] dark:border-[#3e5444] transition-colors"
                      >
                        Ingresar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-outs HOY */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c46d45] dark:bg-[#c4774a]" />
            <h3 className="text-xs font-bold text-[#2c2a26] dark:text-[#d4d1cc]">
              Check-outs HOY · {todayCheckOuts.length}
            </h3>
          </div>

          {todayCheckOuts.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8e8a83] dark:text-[#6e6c68]">
              Sin check-outs
            </div>
          ) : (
            <div className="space-y-2">
              {todayCheckOuts.map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-2.5 rounded-lg bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2a2a2a] border border-[#ded9cd] dark:border-[#2e2e2e] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f4eee7] dark:bg-[#382a22] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-transparent">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-semibold text-[#1c1b18] dark:text-[#ebe8e1]">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#78746c] dark:text-[#8e8c87] bg-[#edeae2] dark:bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#ded9cd] dark:border-[#2c2c2c]">
                    ✓ Salida
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* A Limpiar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c46d45] dark:bg-[#c4774a]" />
              <h3 className="text-xs font-bold text-[#2c2a26] dark:text-[#d4d1cc]">
                A Limpiar · {cleaningTasks.length}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('housekeeping')}
              className="text-[11px] font-bold text-[#c46d45] hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {cleaningTasks.slice(0, 6).map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#f8f6f2] dark:bg-[#242424] border border-[#ded9cd] dark:border-[#2e2e2e] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f3ecf8] dark:bg-[#2c2538] text-[#7a4fa3] dark:text-[#b894e6] border border-[#dfd2eb] dark:border-transparent">
                      {getPropShortCode(task.propertyId)}
                    </span>
                    <span className="text-[11px] text-[#78746c] dark:text-[#9c9994]">
                      {formatDisplayDate(task.date)}
                    </span>
                    <span className="text-xs font-semibold text-[#2c2a26] dark:text-[#dedbd6]">
                      {task.cleanerName.split(' ')[0]}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      onUpdateTaskStatus(
                        task.id,
                        isCompleted ? 'pending' : 'completed'
                      )
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                      isCompleted
                        ? 'bg-[#edf4ed] dark:bg-[#2a382e] text-[#3e6645] dark:text-[#82ba8f] border-[#c6dcc6] dark:border-[#3e5444]'
                        : 'bg-[#f4eee7] dark:bg-[#2a2622] text-[#9c512a] dark:text-[#d88d5e] border-[#e4d6c9] dark:border-[#3a2e26] hover:bg-[#edeae2]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isCompleted ? 'Limpio' : 'Marcar'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Próximos Check-ins (7 días) & Últimas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Próximos Check-ins (7 días) */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c46d45] dark:bg-[#c4774a]" />
            <h3 className="text-xs font-bold text-[#2c2a26] dark:text-[#d4d1cc]">
              Próximos Check-ins (7 días)
            </h3>
          </div>

          <div className="space-y-1.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-2.5 rounded-lg bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2a2a2a] border border-[#ded9cd] dark:border-[#2e2e2e] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#edf4ed] dark:bg-[#263228] text-[#3e6645] dark:text-[#82ba8f] border border-[#c6dcc6] dark:border-transparent">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-semibold text-[#1c1b18] dark:text-[#ebe8e1]">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#78746c] dark:text-[#7a7874] font-mono">
                    {formatDisplayDate(res.checkIn)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Últimas Reservas */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#262626] shadow-2xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c46d45] dark:bg-[#c4774a]" />
            <h3 className="text-xs font-bold text-[#2c2a26] dark:text-[#d4d1cc]">
              Últimas Reservas
            </h3>
          </div>

          <div className="space-y-1.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-2.5 rounded-lg bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2a2a2a] border border-[#ded9cd] dark:border-[#2e2e2e] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f4eee7] dark:bg-[#382a22] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-transparent">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-semibold text-[#1c1b18] dark:text-[#ebe8e1]">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#3e6645] dark:text-[#82ba8f] bg-[#edf4ed] dark:bg-[#1e2e22] px-2 py-0.5 rounded border border-[#c6dcc6] dark:border-[#2c3e30]">
                    Confirmada
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
