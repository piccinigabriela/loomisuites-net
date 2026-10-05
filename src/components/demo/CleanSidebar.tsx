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
  Globe,
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
        <div className="p-4 border-b border-[#C8C4B7] dark:border-[#222328] space-y-3">
          {/* Official Loomi Suite Brand */}
          <div className="flex items-center justify-between">
            <LoomiLogo size="sm" theme={isDark ? 'dark' : 'light'} />
            <div className="flex items-center gap-1.5">
              {isMobileOpen && onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="p-1 text-[#71717A] dark:text-[#8E8E93] hover:bg-[#DCD8CE] dark:hover:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] rounded-none transition-colors lg:hidden mr-1 cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-none text-[#71717A] dark:text-[#8E8E93] hover:bg-[#DCD8CE] dark:hover:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] transition-colors cursor-pointer"
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-[#E1500A]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[#18181B]" />
                )}
              </button>
              <button
                onClick={onBackToLanding}
                className="text-[11px] font-black uppercase tracking-wider text-[#71717A] hover:text-[#E1500A] dark:hover:text-white transition-colors px-2 py-1 rounded-none border border-[#C8C4B7] dark:border-[#222328] hover:bg-[#DCD8CE] dark:hover:bg-[#18181B] cursor-pointer"
                title="Volver a la portada"
              >
                Web ↗
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328]">
            <h1 className="text-xs font-black text-[#18181B] dark:text-white truncate leading-tight tracking-tight uppercase">
              {complexName || 'Catalinas Apartamentos'}
            </h1>
            <p className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">Gestión de alquileres</p>
          </div>

          {/* User / Role Selector */}
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-2 border border-[#C8C4B7] dark:border-[#222328] space-y-1.5">
            <div className="text-[9px] uppercase font-black text-[#71717A] dark:text-[#8E8E93] tracking-widest px-0.5 flex items-center justify-between">
              <span>Acceso de Usuario</span>
              {loggedUser && <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] animate-pulse" title="Sesión sincronizada" />}
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
              className="w-full text-[11px] font-bold bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white py-1 px-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] focus:outline-none cursor-pointer"
            >
              <option value="admin">👑 Administrador / Dueño</option>
              <option value="frontdesk">🛎️ Recepción / Front Desk</option>
              <option value="housekeeping">🧹 Equipo de Housekeeping</option>
            </select>

            {loggedUser ? (
              <div className="pt-1.5 border-t border-[#C8C4B7] dark:border-[#222328] text-[10px] text-[#71717A] dark:text-[#8E8E93] flex flex-col gap-0.5 px-0.5">
                <span className="truncate text-[#18181B] dark:text-white font-black">{loggedUser.name}</span>
                <span className="truncate text-[9px] text-[#71717A] dark:text-[#8E8E93]">{loggedUser.email}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="mt-1.5 text-left text-[9px] font-black text-[#E1500A] hover:underline cursor-pointer flex items-center gap-1"
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
                  className="w-full mt-1 px-2 py-1.5 bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white text-[10px] font-black rounded-none transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🔑 Sincronizar Cuenta / Celular</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4">
          {/* RUBRO 1: OPERATIVA */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-black tracking-widest text-[#71717A] dark:text-[#8E8E93] uppercase">
              Operativa
            </div>
            <div className="space-y-1">
              {/* Hoy */}
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                  activeTab === 'overview'
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                    : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
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
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-none text-xs font-black bg-[#E1500A] hover:bg-[#C94305] text-white transition-all text-left shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Nueva Reserva</span>
                    </span>
                    <span className="text-xs font-black">→</span>
                  </button>

                  {/* Calendario */}
                  <button
                    onClick={() => handleTabClick('calendar')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                      activeTab === 'calendar'
                        ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                        : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Ocupación (Calendario)</span>
                  </button>

                  {/* Lista de Reservas */}
                  <button
                    onClick={() => handleTabClick('bookings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                      activeTab === 'bookings'
                        ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                        : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    <span>Lista de Reservas</span>
                  </button>

                  {/* Opcionales */}
                  <button
                    onClick={() => handleTabClick('addons')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                      activeTab === 'addons'
                        ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                        : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>Opcionales & Extras</span>
                  </button>

                  {/* Avisos & WhatsApp */}
                  <button
                    onClick={() => handleTabClick('messages')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                      activeTab === 'messages'
                        ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                        : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Avisos & WhatsApp</span>
                  </button>
                </>
              )}

              {/* Tu Web & Guía Huésped */}
              <button
                onClick={() => handleTabClick('welcome-guide')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                  activeTab === 'welcome-guide'
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                    : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Tu Web & Guía</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 border border-emerald-300 dark:border-emerald-800">
                  Web
                </span>
              </button>
            </div>
          </div>

          {/* RUBRO 2: LIMPIEZA */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-black tracking-widest text-[#71717A] dark:text-[#8E8E93] uppercase">
              Limpieza & Asistente
            </div>
            <div className="space-y-1">
              {/* Agenda Limpiezas */}
              <button
                onClick={() => handleTabClick('housekeeping')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                  activeTab === 'housekeeping'
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                    : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Agenda Housekeeping</span>
                </div>
                {pendingCleaningsCount > 0 && (
                  <span className="bg-[#E1500A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-none">
                    {pendingCleaningsCount}
                  </span>
                )}
              </button>

              {/* Xenia Copilot */}
              <button
                onClick={() => handleTabClick('xenia')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                  activeTab === 'xenia'
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                    : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                }`}
              >
                <XeniaAvatar size="xs" showStatus={false} />
                <span>Asistente Xenia AI</span>
              </button>
            </div>
          </div>

          {/* RUBRO 3: ADMINISTRACIÓN */}
          {userRole !== 'housekeeping' && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-black tracking-widest text-[#71717A] dark:text-[#8E8E93] uppercase">
                Administración
              </div>
              <div className="space-y-1">
                {/* Caja Chica */}
                <button
                  onClick={() => handleTabClick('cash-drawer')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                    activeTab === 'cash-drawer'
                      ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                      : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
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
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                        activeTab === 'finances'
                          ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                          : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>Rendimiento Financiero</span>
                    </button>

                    {/* Unidades */}
                    <button
                      onClick={() => handleTabClick('properties')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold transition-all text-left border ${
                        activeTab === 'properties'
                          ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                          : 'text-[#18181B] dark:text-[#EFECE5] bg-transparent border-transparent hover:border-[#C8C4B7] dark:hover:border-[#222328] hover:bg-[#DCD8CE]/40 dark:hover:bg-[#18181B]'
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
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-bold text-[#E1500A] hover:bg-[#E1500A] hover:text-white transition-colors text-left border border-[#E1500A]/40"
                      >
                        <Sliders className="w-3.5 h-3.5" />
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
      <div className="p-3 border-t border-[#C8C4B7] dark:border-[#222328] bg-[#EAE8E3] dark:bg-[#0C0D0F] space-y-2.5">
        {/* Quick Theme Switcher Pill in Footer */}
        <button
          onClick={onToggleTheme}
          className="w-full py-1.5 px-2.5 rounded-none bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] text-xs font-black text-[#18181B] dark:text-white hover:border-[#E1500A] flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-[#E1500A]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#E1500A]" />
            )}
            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </div>
          <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] bg-[#EAE8E3] dark:bg-[#0C0D0F] px-1.5 py-0.5 rounded-none font-mono">
            {isDark ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Complex Selector */}
        <div className="flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#8E8E93] px-1 font-bold">
          <span>Complejo:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-1.5 py-0.5 rounded-none text-[10px] font-black ${
                activeComplex === 'catalinas'
                  ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B]'
                  : 'hover:text-[#18181B] dark:hover:text-white'
              }`}
            >
              Catalinas
            </button>
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-1.5 py-0.5 rounded-none text-[10px] font-black ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B]'
                  : 'hover:text-[#18181B] dark:hover:text-white'
              }`}
            >
              Wood
            </button>
            {activeComplex === 'custom' && (
              <button
                onClick={() => onSwitchComplex('custom')}
                className="px-1.5 py-0.5 rounded-none text-[10px] font-black bg-[#E1500A] text-white"
              >
                Real
              </button>
            )}
          </div>
        </div>

        {/* Back to landing */}
        <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-[#71717A] dark:text-[#8E8E93]">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="hover:text-[#E1500A] transition-colors flex items-center gap-1 font-black"
            >
              <LogOut className="w-3 h-3" />
              <span>Volver a la Portada</span>
            </button>
            <span className="font-bold">v2.2</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#EAE8E3] dark:bg-[#0C0D0F] text-[#18181B] dark:text-[#EFECE5] border-r border-[#C8C4B7] dark:border-[#222328] flex-col justify-between h-screen sticky top-0 select-none overflow-y-auto z-30 font-sans transition-colors">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Blur Backdrop */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-64 h-full bg-[#EAE8E3] dark:bg-[#0C0D0F] text-[#18181B] dark:text-[#EFECE5] border-r border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between select-none overflow-y-auto font-sans transition-colors shadow-2xl animate-in slide-in-from-left duration-250">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
