import React from 'react';
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
  X,
  TrendingDown,
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
  onOpenSuperAdmin?: () => void;
  activeComplex: 'catalinas' | 'woodcabin' | 'custom';
  onSwitchComplex: (complex: 'catalinas' | 'woodcabin' | 'custom') => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
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
  onOpenSuperAdmin,
  activeComplex,
  onSwitchComplex,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const isDark = theme === 'dark';

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderSidebarContent = () => (
    <>
      {/* Top Header & Brand */}
      <div>
        {/* Brand Block */}
        <div className="p-4 border-b border-[#ded9cd]/80 dark:border-[#242424]/80 space-y-3">
          {/* Official Loomi Suite Brand */}
          <div className="flex items-center justify-between">
            <LoomiLogo size="sm" theme={isDark ? 'dark' : 'light'} />
            <div className="flex items-center gap-1.5">
              {isMobileOpen && onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="p-1 text-[#66625a] dark:text-[#a8a5a0] hover:bg-[#edeae2] dark:hover:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-lg transition-colors lg:hidden mr-1"
                  title="Cerrar menú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg text-[#66625a] dark:text-[#a8a5a0] hover:bg-[#edeae2] dark:hover:bg-[#222] border border-[#ded9cd] dark:border-[#333] transition-colors"
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[#55514a]" />
                )}
              </button>
              <button
                onClick={onBackToLanding}
                className="text-[11px] font-semibold text-[#7a7874] hover:text-[#c46d45] dark:hover:text-[#d88d5e] transition-colors px-1.5 py-1 rounded hover:bg-[#edeae2] dark:hover:bg-[#222]"
                title="Volver a la portada"
              >
                Web ↗
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ded9cd] dark:border-[#222]">
            <h1 className="text-xs font-bold text-[#1c1b18] dark:text-[#f0eeeb] truncate leading-tight tracking-tight">
              {complexName || 'Catalinas Apartamentos'}
            </h1>
            <p className="text-[10px] text-[#78746c] dark:text-[#8e8c87] truncate">Gestión de alquileres</p>
          </div>

          {/* User / Role Selector */}
          <div className="bg-white dark:bg-[#1f1f1f] rounded-lg p-2 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-2xs space-y-1.5">
            <div className="text-[9px] uppercase font-bold text-[#7a7874] dark:text-[#8e8c87] tracking-wider px-0.5">
              Acceso de Usuario
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
              className="w-full text-[11px] font-bold bg-[#fbf9f5] dark:bg-[#151515] text-[#1c1b18] dark:text-[#f4f2ee] py-1 px-1.5 rounded-md border border-[#ded9cd] dark:border-[#2c2c2c] focus:outline-none cursor-pointer"
            >
              <option value="admin">👑 Administrador / Dueño</option>
              <option value="frontdesk">🛎️ Recepción / Front Desk</option>
              <option value="housekeeping">🧹 Equipo de Housekeeping</option>
            </select>
          </div>
        </div>
      </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4.5">
          {/* RUBRO 1: OPERATIVA */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-[#8e8a83] dark:text-[#6e6c68] uppercase">
              Operativa
            </div>
            <div className="space-y-0.5">
              {/* Hoy */}
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  activeTab === 'overview'
                    ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                    : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
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
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#c46d45] dark:text-[#d88d5e] hover:bg-[#f4eee7] dark:hover:bg-[#26211c] transition-colors text-left"
                  >
                    <span className="text-sm font-bold leading-none">+</span>
                    <span>Nueva Reserva</span>
                  </button>

                  {/* Calendario */}
                  <button
                    onClick={() => handleTabClick('calendar')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                      activeTab === 'calendar'
                        ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                        : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                    <span>Ocupación (Calendario)</span>
                  </button>

                  {/* Lista de Reservas */}
                  <button
                    onClick={() => handleTabClick('bookings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                      activeTab === 'bookings'
                        ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                        : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                    <span>Lista de Reservas</span>
                  </button>

                  {/* Opcionales */}
                  <button
                    onClick={() => handleTabClick('addons')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                      activeTab === 'addons'
                        ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                        : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                    <span>Opcionales & Extras</span>
                  </button>

                  {/* Avisos & WhatsApp */}
                  <button
                    onClick={() => handleTabClick('messages')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                      activeTab === 'messages'
                        ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                        : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                    <span>Avisos & WhatsApp</span>
                  </button>
                </>
              )}

              {/* Guía Huésped */}
              <button
                onClick={() => handleTabClick('welcome-guide')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  activeTab === 'welcome-guide'
                    ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                    : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                <span>Guía Huésped & Web</span>
              </button>
            </div>
          </div>

          {/* RUBRO 2: LIMPIEZA */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-[#8e8a83] dark:text-[#6e6c68] uppercase">
              Limpieza
            </div>
            <div className="space-y-0.5">
              {/* Agenda Limpiezas */}
              <button
                onClick={() => handleTabClick('housekeeping')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  activeTab === 'housekeeping'
                    ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                    : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                  <span>Agenda Housekeeping</span>
                </div>
                {pendingCleaningsCount > 0 && (
                  <span className="bg-[#f4eee7] dark:bg-[#3a2820] text-[#9c512a] dark:text-[#e09060] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#e4d6c9] dark:border-[#5a3a2a]">
                    {pendingCleaningsCount}
                  </span>
                )}
              </button>

              {/* Xenia Copilot */}
              <button
                onClick={() => handleTabClick('xenia')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  activeTab === 'xenia'
                    ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                    : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                }`}
              >
                <XeniaAvatar size="xs" showStatus={false} />
                <span>Asistente Xenia AI</span>
              </button>
            </div>
          </div>

          {/* RUBRO 3: ADMINISTRACIÓN (only visible for roles with admin capabilities or frontdesk) */}
          {userRole !== 'housekeeping' && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-[#8e8a83] dark:text-[#6e6c68] uppercase">
                Administración
              </div>
              <div className="space-y-0.5">
                {/* Caja Chica */}
                <button
                  onClick={() => handleTabClick('cash-drawer')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                    activeTab === 'cash-drawer'
                      ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                      : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                  <span>{userRole === 'frontdesk' ? 'Caja de Mostrador' : 'Gastos & Caja'}</span>
                </button>

                {userRole === 'admin' && (
                  <>
                    {/* Rendimiento */}
                    <button
                      onClick={() => handleTabClick('finances')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                        activeTab === 'finances'
                          ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                          : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                      <span>Rendimiento Financiero</span>
                    </button>

                    {/* Unidades */}
                    <button
                      onClick={() => handleTabClick('properties')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                        activeTab === 'properties'
                          ? 'bg-[#edeae2] dark:bg-[#262422] text-[#1c1b18] dark:text-[#f2efe9] shadow-2xs border border-[#ded9cd] dark:border-[#38322c]'
                          : 'text-[#66625a] dark:text-[#9c9994] hover:bg-[#edeae2]/60 dark:hover:bg-[#1e1e1e] hover:text-[#1c1b18] dark:hover:text-[#e4e1dc]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#78746c] dark:text-[#a8a49e]" />
                      <span>Departamentos & iCal</span>
                    </button>

                    {/* Setup Wizard */}
                    {onOpenOnboardingWizard && (
                      <button
                        onClick={() => {
                          onOpenOnboardingWizard();
                          if (onMobileClose) onMobileClose();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#c46d45] dark:text-[#d88d5e] hover:bg-[#f4eee7] dark:hover:bg-[#28211c] transition-colors text-left border border-dashed border-[#c46d45]/40 dark:border-[#523d2e]/60"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#c46d45] dark:text-[#d88d5e]" />
                        <span>Configurar Deptos</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Bottom Footer: Switcher & Theme Control */}
      <div className="p-3 border-t border-[#ded9cd] dark:border-[#242424] bg-[#f4f1ea] dark:bg-[#141414] space-y-2.5">
        {/* Quick Theme Switcher Pill in Footer */}
        <button
          onClick={onToggleTheme}
          className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#1f1f1f] border border-[#ded9cd] dark:border-[#2a2a2a] text-xs font-semibold text-[#44403a] dark:text-[#d0cdc8] hover:border-[#c46d45]/50 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#c46d45]" />
            )}
            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </div>
          <span className="text-[10px] text-[#8e8a83] bg-[#edeae2] dark:bg-[#292929] px-1.5 py-0.5 rounded font-mono">
            {isDark ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Complex Selector */}
        <div className="flex items-center justify-between text-[11px] text-[#7a7874] px-1">
          <span>Complejo:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                activeComplex === 'catalinas'
                  ? 'bg-[#c46d45] text-white dark:bg-[#2e2a26] dark:text-[#e8a070]'
                  : 'hover:text-[#1c1b18] dark:hover:text-[#b8b5b0]'
              }`}
            >
              Catalinas
            </button>
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#c46d45] text-white dark:bg-[#2e2a26] dark:text-[#e8a070]'
                  : 'hover:text-[#1c1b18] dark:hover:text-[#b8b5b0]'
              }`}
            >
              Wood
            </button>
            {activeComplex === 'custom' && (
              <button
                onClick={() => onSwitchComplex('custom')}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#2e5235] text-white dark:bg-[#1e2e22] dark:text-[#80cf9b]"
              >
                Real
              </button>
            )}
          </div>
        </div>

        {/* Back to landing & SuperAdmin */}
        <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-[#78746c] dark:text-[#6e6c68]">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="hover:text-[#1c1b18] dark:hover:text-[#b0ada8] transition-colors flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Volver a la Portada</span>
            </button>
            <span>v2.2</span>
          </div>

          {onOpenSuperAdmin && (
            <button
              onClick={onOpenSuperAdmin}
              className="w-full text-left text-[10px] font-bold text-[#c46d45] dark:text-[#d88d5e] hover:underline pt-1 border-t border-[#ded9cd]/60 dark:border-[#2a2a2a] flex items-center gap-1"
            >
              <span>👑 Panel Maestro SuperAdmin</span>
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#fbf9f5] dark:bg-[#161616] text-[#3c3933] dark:text-[#e0deda] border-r border-[#ded9cd] dark:border-[#242424] flex-col justify-between h-screen sticky top-0 select-none overflow-y-auto z-30 font-sans transition-colors">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Blur Backdrop */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-64 h-full bg-[#fbf9f5] dark:bg-[#161616] text-[#3c3933] dark:text-[#e0deda] border-r border-[#ded9cd] dark:border-[#242424] flex flex-col justify-between select-none overflow-y-auto font-sans transition-colors shadow-2xl animate-in slide-in-from-left duration-250">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
