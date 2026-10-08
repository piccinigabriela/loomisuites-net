import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Building2,
  MessageSquare,
  DollarSign,
  Bot,
  Compass,
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
  Users,
  Briefcase,
  ChevronUp,
} from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';
import { XeniaAvatar } from '../xenia/XeniaAvatar';

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
        <div className="p-4 border-b border-stone-200/70 dark:border-zinc-800/70 space-y-3">
          {/* Official Loomi Suite Brand */}
          <div className="flex items-center justify-between">
            <LoomiLogo size="sm" theme={isDark ? 'dark' : 'light'} />
            <div className="flex items-center gap-1.5">
              {isMobileOpen && onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="p-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl transition-colors lg:hidden mr-1 cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-stone-600" />
                )}
              </button>
              <button
                onClick={onBackToLanding}
                className="text-[11px] font-semibold text-stone-600 hover:text-[#E67E22] dark:text-stone-300 dark:hover:text-white transition-colors px-2.5 py-1 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer"
                title="Volver a la portada"
              >
                Web ↗
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/70 dark:border-zinc-800/70">
            <h1 className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate leading-tight tracking-tight">
              {complexName || 'Catalinas Apartamentos'}
            </h1>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate font-medium">Gestión hotelera & cabañas</p>
          </div>

          {/* User / Role Selector */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-3 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_2px_8px_rgba(0,0,0,0.015)] space-y-2">
            <div className="text-[9px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider px-0.5 flex items-center justify-between">
              <span>Acceso de Usuario</span>
              {loggedUser && <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] animate-pulse" title="Sesión sincronizada" />}
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
              className="w-full text-xs font-medium bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 py-1.5 px-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="admin">👑 Administrador / Dueño</option>
              <option value="frontdesk">🛎️ Recepción / Front Desk</option>
              <option value="housekeeping">🧹 Equipo de Housekeeping</option>
            </select>

            {loggedUser ? (
              <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 text-[10px] text-stone-500 dark:text-stone-400 flex flex-col gap-0.5 px-0.5">
                <span className="truncate text-stone-800 dark:text-stone-200 font-semibold">{loggedUser.name}</span>
                <span className="truncate text-[9px] text-stone-400 dark:text-stone-500">{loggedUser.email}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="mt-1 text-left text-[9px] font-semibold text-[#E67E22] hover:underline cursor-pointer flex items-center gap-1"
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
                  className="w-full mt-1 px-2.5 py-1.5 bg-stone-800 dark:bg-zinc-700 text-white hover:bg-[#E67E22] dark:hover:bg-[#E67E22] text-[10px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
        <div className="border border-stone-200/70 dark:border-zinc-800/70 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
          {/* Group Header Button */}
          <button
            onClick={() => toggleGroup('reservations')}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
              openGroups.reservations
                ? 'bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-800'
                : 'hover:bg-stone-50 dark:hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${
                isReservationsActive
                  ? 'bg-orange-50 text-[#E67E22] border-orange-200/80 dark:bg-orange-950/40 dark:border-orange-900/40'
                  : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200/60 dark:border-zinc-700'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                  Reservas & Huéspedes
                </span>
                <span className="text-[10px] font-normal text-stone-400 dark:text-stone-500">
                  Ocupación, web y estadías
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isReservationsActive && !openGroups.reservations && (
                <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
              )}
              {openGroups.reservations ? (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-400" />
              )}
            </div>
          </button>

          {/* Group Items Dropdown */}
          {openGroups.reservations && (
            <div className="p-2 space-y-1 bg-white dark:bg-[#18191E] animate-in fade-in-50 duration-150">
              {/* Hoy */}
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'overview'
                    ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Hoy / Estado</span>
              </button>

              {userRole !== 'housekeeping' && (
                <>
                  {/* Nueva Reserva Quick Button */}
                  <button
                    onClick={() => {
                      onOpenNewReservation();
                      if (onMobileClose) onMobileClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#E67E22] hover:bg-[#D35400] text-white transition-all text-left shadow-xs cursor-pointer active:scale-95 my-1"
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'calendar'
                        ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Ocupación (Calendario)</span>
                  </button>

                  {/* Lista de Reservas */}
                  <button
                    onClick={() => handleTabClick('bookings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'bookings'
                        ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    <span>Lista de Reservas</span>
                  </button>

                  {/* Avisos & WhatsApp */}
                  <button
                    onClick={() => handleTabClick('messages')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'messages'
                        ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Avisos & WhatsApp</span>
                  </button>

                  {/* Opcionales */}
                  <button
                    onClick={() => handleTabClick('addons')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      activeTab === 'addons'
                        ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>Opcionales & Extras</span>
                  </button>
                </>
              )}

              {/* Tu Web & Guía Huésped */}
              <button
                onClick={() => handleTabClick('welcome-guide')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'welcome-guide'
                    ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
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
        <div className="border border-stone-200/70 dark:border-zinc-800/70 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
          {/* Group Header Button */}
          <button
            onClick={() => toggleGroup('housekeeping')}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
              openGroups.housekeeping
                ? 'bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-800'
                : 'hover:bg-stone-50 dark:hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${
                isHousekeepingActive
                  ? 'bg-orange-50 text-[#E67E22] border-orange-200/80 dark:bg-orange-950/40 dark:border-orange-900/40'
                  : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200/60 dark:border-zinc-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                  Housekeeping
                </span>
                <span className="text-[10px] font-normal text-stone-400 dark:text-stone-500">
                  Limpieza & Mantenimiento
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {pendingCleaningsCount > 0 && (
                <span className="bg-orange-100 text-[#E67E22] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {pendingCleaningsCount}
                </span>
              )}
              {isHousekeepingActive && !openGroups.housekeeping && !pendingCleaningsCount && (
                <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
              )}
              {openGroups.housekeeping ? (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-400" />
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
                    ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Agenda Limpiezas</span>
                </div>
                {pendingCleaningsCount > 0 && (
                  <span className="bg-orange-100 text-[#E67E22] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {pendingCleaningsCount}
                  </span>
                )}
              </button>

              {/* Xenia Copilot */}
              <button
                onClick={() => handleTabClick('xenia')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  activeTab === 'xenia'
                    ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <XeniaAvatar size="xs" showStatus={false} />
                <span>Asistente Xenia AI</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* GRUPO 3: ADMINISTRACIÓN */}
        {/* ============================================================ */}
        {userRole !== 'housekeeping' && (
          <div className="border border-stone-200/70 dark:border-zinc-800/70 bg-white dark:bg-[#18191E] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden transition-colors">
            {/* Group Header Button */}
            <button
              onClick={() => toggleGroup('admin')}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                openGroups.admin
                  ? 'bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-800'
                  : 'hover:bg-stone-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl border ${
                  isAdminActive
                    ? 'bg-orange-50 text-[#E67E22] border-orange-200/80 dark:bg-orange-950/40 dark:border-orange-900/40'
                    : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200/60 dark:border-zinc-700'
                }`}>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                    Administración
                  </span>
                  <span className="text-[10px] font-normal text-stone-400 dark:text-stone-500">
                    Caja, métricas y unidades
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdminActive && !openGroups.admin && (
                  <span className="w-2 h-2 bg-[#E67E22] rounded-full" title="Sección activa" />
                )}
                {openGroups.admin ? (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </button>

            {/* Group Items Dropdown */}
            {openGroups.admin && (
              <div className="p-2 space-y-1 bg-white dark:bg-[#18191E] animate-in fade-in-50 duration-150">
                {/* Caja Chica */}
                <button
                  onClick={() => handleTabClick('cash-drawer')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                    activeTab === 'cash-drawer'
                      ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                  <span>{userRole === 'frontdesk' ? 'Caja de Mostrador' : 'Gastos & Caja'}</span>
                </button>

                {userRole === 'admin' && (
                  <>
                    {/* Rendimiento */}
                    <button
                      onClick={() => handleTabClick('finances')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                        activeTab === 'finances'
                          ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>Rendimiento Financiero</span>
                    </button>

                    {/* Unidades */}
                    <button
                      onClick={() => handleTabClick('properties')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                        activeTab === 'properties'
                          ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 font-semibold'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Departamentos & iCal</span>
                    </button>

                    {/* Setup Wizard */}
                    {onOpenOnboardingWizard && (
                      <button
                        onClick={() => {
                          onOpenOnboardingWizard();
                          if (onMobileClose) onMobileClose();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#E67E22] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left border border-orange-200/80 dark:border-orange-900/40 mt-1 cursor-pointer"
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
      <div className="p-4 border-t border-stone-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-[#101114]/60 space-y-3">
        {/* Quick Theme Switcher Pill in Footer */}
        <button
          onClick={onToggleTheme}
          className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-zinc-800/70 border border-stone-200/80 dark:border-zinc-700 text-xs font-medium text-stone-700 dark:text-stone-200 hover:border-orange-300 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#E67E22]" />
            )}
            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full font-sans">
            {isDark ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Complex / Tier Selector */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-400 font-medium">
            <span>Escenario Demo:</span>
            <span className="text-[10px] font-semibold text-[#E67E22]">1 Clic</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#E67E22] text-white shadow-xs'
                  : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-zinc-700'
              }`}
              title="Plan Inicial: Cabañas & Glampings (5 a 10 unidades • $45k)"
            >
              <span>🏡 Cabañas</span>
            </button>
            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeComplex === 'catalinas'
                  ? 'bg-[#E67E22] text-white shadow-xs'
                  : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-zinc-700'
              }`}
              title="Plan Escala: Complejos & Aparts (15 a 20 unidades • $60k)"
            >
              <span>🏢 Complejo</span>
            </button>
          </div>
          {activeComplex === 'custom' && (
            <button
              onClick={() => onSwitchComplex('custom')}
              className="w-full mt-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold bg-emerald-600 text-white shadow-xs"
            >
              ✨ Mi Complejo Real
            </button>
          )}
        </div>

        {/* Back to landing */}
        <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-stone-400 dark:text-stone-500">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="hover:text-[#E67E22] transition-colors flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Volver a la Portada</span>
            </button>
            <span className="font-mono">v2.2</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop & Laptop Persistent Sidebar (Permanently Visible) */}
      <aside className="hidden md:flex w-60 xl:w-64 shrink-0 bg-[#F4F1EB] dark:bg-[#0E0F12] text-stone-800 dark:text-stone-100 border-r border-stone-200/80 dark:border-zinc-800/80 flex-col justify-between h-screen sticky top-0 select-none overflow-y-auto z-30 font-sans transition-colors">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer (Only on small phones) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Blur Backdrop */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-64 h-full bg-[#F4F1EB] dark:bg-[#0E0F12] text-stone-800 dark:text-stone-100 border-r border-stone-200/80 dark:border-zinc-800/80 flex-col justify-between select-none overflow-y-auto font-sans transition-colors shadow-2xl animate-in slide-in-from-left duration-250">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
