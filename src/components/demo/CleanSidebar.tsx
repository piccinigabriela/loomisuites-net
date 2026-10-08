import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Building2,
  MessageSquare,
  DollarSign,
  ShoppingBag,
  Sliders,
  PlusCircle,
  FileSpreadsheet,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  TrendingDown,
  Globe,
  Sparkle,
} from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';

interface CleanSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingCleaningsCount: number;
  complexName: string;
  onOpenNewReservation: () => void;
  onOpenOnboardingWizard?: () => void;
  isEmployeeMode?: boolean;
  onToggleEmployeeMode?: () => void;
  userRole?: 'admin' | 'frontdesk' | 'housekeeping';
  onChangeRole?: (role: 'admin' | 'frontdesk' | 'housekeeping') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBackToLanding: () => void;
  activeComplex: 'catalinas' | 'woodcabin' | 'custom';
  onSwitchComplex: (complex: 'catalinas' | 'woodcabin' | 'custom') => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenLogin?: () => void;
  loggedUser?: { name: string; email: string; complexId: string; complexName: string } | null;
  onLogout?: () => void;
}

export const CleanSidebar: React.FC<CleanSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCleaningsCount,
  complexName,
  onOpenNewReservation,
  onOpenOnboardingWizard,
  isEmployeeMode = false,
  onToggleEmployeeMode,
  userRole = 'admin',
  onChangeRole,
  theme,
  onToggleTheme,
  onBackToLanding,
  activeComplex,
  onSwitchComplex,
  isMobileOpen = false,
  onMobileClose,
  onOpenLogin,
  loggedUser,
  onLogout,
}) => {
  const isDark = theme === 'dark';

  // 3 Distinct Main Groups State
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    reservations: true,
    housekeeping: true,
    admin: false,
  });

  // Automatically keep the active group open when navigating
  useEffect(() => {
    if (['overview', 'calendar', 'bookings', 'addons', 'messages', 'welcome-guide'].includes(activeTab)) {
      setOpenGroups((prev) => ({ ...prev, reservations: true }));
    } else if (['housekeeping', 'xenia'].includes(activeTab)) {
      setOpenGroups((prev) => ({ ...prev, housekeeping: true }));
    } else if (['cash-drawer', 'finances', 'properties'].includes(activeTab)) {
      setOpenGroups((prev) => ({ ...prev, admin: true }));
    }
  }, [activeTab]);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isReservationsActive = ['overview', 'calendar', 'bookings', 'addons', 'messages', 'welcome-guide'].includes(activeTab);
  const isHousekeepingActive = ['housekeeping', 'xenia'].includes(activeTab);
  const isAdminActive = ['cash-drawer', 'finances', 'properties'].includes(activeTab);

  const renderSidebarContent = () => (
    <>
      {/* Top Header & Brand */}
      <div>
        {/* Brand Block */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800/80 space-y-3">
          {/* Official Loomi Suite Brand */}
          <div className="flex items-center justify-between">
            <LoomiLogo size="sm" theme={isDark ? 'dark' : 'light'} />
            <div className="flex items-center gap-1.5">
              {isMobileOpen && onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl transition-colors lg:hidden mr-0.5 cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer"
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
              <button
                onClick={onBackToLanding}
                className="text-[11px] font-medium text-gray-500 hover:text-[#E67E22] dark:text-zinc-400 dark:hover:text-white transition-colors px-2.5 py-1 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                title="Volver a la portada"
              >
                Web ↗
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100/80 dark:border-zinc-800/80">
            <h1 className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight tracking-tight">
              {complexName || 'Catalinas Apartamentos'}
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate font-light">Gestión hotelera & cabañas</p>
          </div>

          {/* User / Role Selector */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-3 border border-gray-100 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.015)] space-y-2">
            <div className="text-[9px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider px-0.5 flex items-center justify-between">
              <span>Acceso de Usuario</span>
              {loggedUser && (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Activo
                </span>
              )}
            </div>
            
            <select
              value={userRole}
              onChange={(e) => {
                if (onChangeRole) {
                  onChangeRole(e.target.value as any);
                } else if (onToggleEmployeeMode) {
                  onToggleEmployeeMode();
                }
              }}
              className="w-full text-xs font-light text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-zinc-800/80 py-1.5 px-2.5 rounded-xl border border-gray-100 dark:border-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-orange-200 cursor-pointer"
            >
              <option value="admin">👑 Administrador / Dueño</option>
              <option value="frontdesk">🛎️ Recepción / Front Desk</option>
              <option value="housekeeping">🧹 Equipo de Housekeeping</option>
            </select>

            {loggedUser ? (
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-500 dark:text-zinc-400 flex flex-col gap-0.5 px-0.5">
                <span className="truncate text-gray-800 dark:text-gray-200 font-medium">{loggedUser.name}</span>
                <span className="truncate text-[9px] text-gray-400 dark:text-zinc-500">{loggedUser.email}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="mt-1 text-left text-[9px] font-medium text-[#E67E22] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Cerrar sesión</span>
                    <span>↩</span>
                  </button>
                )}
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="w-full mt-1 px-2.5 py-1.5 bg-orange-50/70 hover:bg-orange-100/80 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-[#E67E22] border border-orange-100 dark:border-orange-900/50 text-[10px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🔑 Sincronizar Cuenta</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 3 Main Expandable Work Groups */}
      <div className="p-3 space-y-3 flex-1">

        {/* ============================================================ */}
        {/* GRUPO 1: RESERVAS, HUÉSPEDES & WEB */}
        {/* ============================================================ */}
        <div className="border border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
          {/* Group Header Button */}
          <button
            onClick={() => toggleGroup('reservations')}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
              openGroups.reservations
                ? 'bg-gray-50/60 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800'
                : 'hover:bg-gray-50/60 dark:hover:bg-zinc-800/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${
                isReservationsActive
                  ? 'bg-orange-50 text-[#E67E22] border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/40'
                  : 'bg-gray-50 text-gray-400 dark:bg-zinc-800 dark:text-zinc-400 border-gray-100 dark:border-zinc-700/60'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                  Reservas & Huéspedes
                </span>
                <span className="text-[10px] font-light text-gray-400 dark:text-zinc-500">
                  Ocupación, web y estadías
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isReservationsActive && !openGroups.reservations && (
                <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
              )}
              {openGroups.reservations ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>

          {/* Group Items Dropdown */}
          {openGroups.reservations && (
            <div className="p-2 space-y-1 bg-white dark:bg-[#18191E] animate-in fade-in-50 duration-150">
              {/* Hoy */}
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'overview'
                    ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Hoy / Estado</span>
                </div>
                {activeTab === 'overview' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                )}
              </button>

              {userRole !== 'housekeeping' && (
                <>
                  {/* Nueva Reserva Quick Button */}
                  <button
                    onClick={() => {
                      onOpenNewReservation();
                      if (onMobileClose) onMobileClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#E67E22] hover:bg-[#D35400] text-white transition-all text-left shadow-xs cursor-pointer active:scale-95 my-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Nueva Reserva</span>
                    </span>
                    <span className="text-xs">→</span>
                  </button>

                  {/* Calendario */}
                  <button
                    onClick={() => handleTabClick('calendar')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'calendar'
                        ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Ocupación (Calendario)</span>
                    </div>
                    {activeTab === 'calendar' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                    )}
                  </button>

                  {/* Lista de Reservas */}
                  <button
                    onClick={() => handleTabClick('bookings')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'bookings'
                        ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                      <span>Lista de Reservas</span>
                    </div>
                    {activeTab === 'bookings' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                    )}
                  </button>

                  {/* Avisos & WhatsApp */}
                  <button
                    onClick={() => handleTabClick('messages')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'messages'
                        ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Avisos & WhatsApp</span>
                    </div>
                    {activeTab === 'messages' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                    )}
                  </button>

                  {/* Opcionales */}
                  <button
                    onClick={() => handleTabClick('addons')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'addons'
                        ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Opcionales & Extras</span>
                    </div>
                    {activeTab === 'addons' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                    )}
                  </button>
                </>
              )}

              {/* Tu Web & Guía Huésped */}
              <button
                onClick={() => handleTabClick('welcome-guide')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'welcome-guide'
                    ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Tu Web & Guía</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Web
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* GRUPO 2: HOUSEKEEPING */}
        {/* ============================================================ */}
        <div className="border border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
          {/* Group Header Button */}
          <button
            onClick={() => toggleGroup('housekeeping')}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
              openGroups.housekeeping
                ? 'bg-gray-50/60 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800'
                : 'hover:bg-gray-50/60 dark:hover:bg-zinc-800/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${
                isHousekeepingActive
                  ? 'bg-orange-50 text-[#E67E22] border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/40'
                  : 'bg-gray-50 text-gray-400 dark:bg-zinc-800 dark:text-zinc-400 border-gray-100 dark:border-zinc-700/60'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                  Housekeeping
                </span>
                <span className="text-[10px] font-light text-gray-400 dark:text-zinc-500">
                  Limpieza & Mantenimiento
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {pendingCleaningsCount > 0 && (
                <span className="bg-orange-50 text-[#E67E22] border border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/50 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {pendingCleaningsCount}
                </span>
              )}
              {isHousekeepingActive && !openGroups.housekeeping && !pendingCleaningsCount && (
                <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
              )}
              {openGroups.housekeeping ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>

          {/* Group Items Dropdown */}
          {openGroups.housekeeping && (
            <div className="p-2 space-y-1 bg-white dark:bg-[#18191E] animate-in fade-in-50 duration-150">
              {/* Agenda Limpiezas */}
              <button
                onClick={() => handleTabClick('housekeeping')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'housekeeping'
                    ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Agenda Limpiezas</span>
                </div>
                {pendingCleaningsCount > 0 && (
                  <span className="bg-orange-50 text-[#E67E22] border border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/50 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {pendingCleaningsCount}
                  </span>
                )}
              </button>

              {/* Xenia Copilot - Minimalist Flat Sparkle Icon */}
              <button
                onClick={() => handleTabClick('xenia')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'xenia'
                    ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-orange-50/90 text-[#E67E22] dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/40">
                    <Sparkle className="w-3 h-3 fill-current" />
                  </div>
                  <span>Asistente Xenia AI</span>
                </div>
                <span className="text-[9px] font-bold tracking-widest text-[#E67E22] uppercase bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 rounded-md">
                  IA
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* GRUPO 3: ADMINISTRACIÓN */}
        {/* ============================================================ */}
        {userRole !== 'housekeeping' && (
          <div className="border border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
            {/* Group Header Button */}
            <button
              onClick={() => toggleGroup('admin')}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                openGroups.admin
                  ? 'bg-gray-50/60 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800'
                  : 'hover:bg-gray-50/60 dark:hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl border ${
                  isAdminActive
                    ? 'bg-orange-50 text-[#E67E22] border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/40'
                    : 'bg-gray-50 text-gray-400 dark:bg-zinc-800 dark:text-zinc-400 border-gray-100 dark:border-zinc-700/60'
                }`}>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                    Administración
                  </span>
                  <span className="text-[10px] font-light text-gray-400 dark:text-zinc-500">
                    Caja, métricas y unidades
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdminActive && !openGroups.admin && (
                  <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
                )}
                {openGroups.admin ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Group Items Dropdown */}
            {openGroups.admin && (
              <div className="p-2 space-y-1 bg-white dark:bg-[#18191E] animate-in fade-in-50 duration-150">
                {/* Caja Chica */}
                <button
                  onClick={() => handleTabClick('cash-drawer')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                    activeTab === 'cash-drawer'
                      ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                      : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                    <span>{userRole === 'frontdesk' ? 'Caja de Mostrador' : 'Gastos & Caja'}</span>
                  </div>
                  {activeTab === 'cash-drawer' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                  )}
                </button>

                {userRole === 'admin' && (
                  <>
                    {/* Rendimiento */}
                    <button
                      onClick={() => handleTabClick('finances')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                        activeTab === 'finances'
                          ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                          : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>Rendimiento Financiero</span>
                      </div>
                      {activeTab === 'finances' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                      )}
                    </button>

                    {/* Unidades */}
                    <button
                      onClick={() => handleTabClick('properties')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                        activeTab === 'properties'
                          ? 'bg-orange-50/80 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                          : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-light'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Departamentos & iCal</span>
                      </div>
                      {activeTab === 'properties' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                      )}
                    </button>

                    {/* Setup Wizard */}
                    {onOpenOnboardingWizard && (
                      <button
                        onClick={() => {
                          onOpenOnboardingWizard();
                          if (onMobileClose) onMobileClose();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#E67E22] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left border border-orange-100 dark:border-orange-900/40 mt-1 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 shrink-0" />
                        <span>Configurar Deptos</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Footer: Switcher & Theme Control */}
      <div className="p-4 border-t border-gray-100 dark:border-zinc-800/80 bg-white/70 dark:bg-[#101114]/60 space-y-3">
        {/* Quick Theme Switcher Pill in Footer */}
        <button
          onClick={onToggleTheme}
          className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-100 dark:border-zinc-700/80 text-xs font-light text-gray-700 dark:text-zinc-200 hover:border-orange-200 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#E67E22]" />
            )}
            <span className="font-medium">{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full font-sans border border-gray-100 dark:border-zinc-700">
            {isDark ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Complex / Tier Selector */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-400 font-light">
            <span>Escenario Demo:</span>
            <span className="text-[10px] font-semibold text-[#E67E22]">1 Clic</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeComplex === 'woodcabin'
                  ? 'bg-orange-50 text-[#E67E22] border border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/50 shadow-2xs'
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-zinc-700/70'
              }`}
              title="Plan Inicial: Cabañas & Glampings (5 a 10 unidades • $45k)"
            >
              <span>🏡 Cabañas</span>
            </button>
            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeComplex === 'catalinas'
                  ? 'bg-orange-50 text-[#E67E22] border border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/50 shadow-2xs'
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-zinc-700/70'
              }`}
              title="Plan Escala: Complejos & Aparts (15 a 20 unidades • $60k)"
            >
              <span>🏢 Complejo</span>
            </button>
          </div>
          {activeComplex === 'custom' && (
            <button
              onClick={() => onSwitchComplex('custom')}
              className="w-full mt-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs"
            >
              ✨ Mi Complejo Real
            </button>
          )}
        </div>

        {/* Back to landing */}
        <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-gray-400 dark:text-zinc-500">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="hover:text-[#E67E22] transition-colors flex items-center gap-1 font-medium"
            >
              <LogOut className="w-3 h-3" />
              <span>Volver a la Portada</span>
            </button>
            <span className="font-mono text-gray-300 dark:text-zinc-600">v2.2</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop & Laptop Persistent Sidebar (Permanently Visible) */}
      <aside className="hidden md:flex w-60 xl:w-64 shrink-0 bg-[#FBFBFC] dark:bg-[#121316] text-gray-800 dark:text-gray-100 border-r border-gray-100 dark:border-zinc-800/80 flex-col justify-between h-screen sticky top-0 select-none overflow-y-auto z-30 font-sans transition-colors">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer (Only on small phones) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Blur Backdrop */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-64 h-full bg-[#FBFBFC] dark:bg-[#121316] text-gray-800 dark:text-gray-100 border-r border-gray-100 dark:border-zinc-800/80 flex-col justify-between select-none overflow-y-auto font-sans transition-colors shadow-xl animate-in slide-in-from-left duration-250">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
