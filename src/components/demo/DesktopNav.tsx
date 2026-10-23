import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Menú de arriba para computadora: áreas en el primer nivel, vistas de cada área en el segundo. */

export type NavAction = 'new-reservation' | 'onboarding';

export interface NavItem {
  /** Pestaña que se abre; las acciones (nueva reserva, configurar unidades) no tienen pestaña */
  tab?: string;
  action?: NavAction;
  label: string;
}
export interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
  badge?: number;
}

/** Menú de arriba: demo y app real. Salida de emergencia: abrir la app con ?menu=lateral para volver al menú de la izquierda. */
export function useTopNavEnabled(isApp: boolean): boolean {
  if (!isApp) return true;
  try {
    return new URLSearchParams(window.location.search).get('menu') !== 'lateral';
  } catch {
    return true;
  }
}

/** Los mismos tres grupos del menú lateral: Reservas, Limpieza y Administración. */
export function buildNavGroups(opts: {
  isApp: boolean;
  userRole: 'admin' | 'frontdesk' | 'housekeeping';
  showTeamNotices: boolean;
  pendingCleaningsCount: number;
  hasOnboarding: boolean;
}): NavGroup[] {
  const { isApp, userRole, showTeamNotices, pendingCleaningsCount, hasOnboarding } = opts;
  const isAdmin = userRole === 'admin';
  return [
    {
      key: 'reservas',
      label: 'Reservas',
      items: [
        { tab: 'overview', label: 'Hoy / Estado' },
        { action: 'new-reservation', label: '+ Nueva reserva' },
        { tab: 'calendar', label: 'Ocupación (Calendario)' },
        { tab: 'bookings', label: 'Lista de reservas' },
        { tab: 'messages', label: 'Avisos y WhatsApp' },
        ...(showTeamNotices ? [{ tab: 'team-notices', label: 'Avisos al equipo' }] : []),
        { tab: 'addons', label: 'Opcionales y extras' },
        { tab: 'welcome-guide', label: 'Tu Web y Guía' },
      ],
    },
    {
      key: 'limpieza',
      label: 'Limpieza',
      badge: pendingCleaningsCount,
      items: [
        { tab: 'housekeeping', label: 'Agenda de limpiezas' },
      ],
    },
    {
      key: 'admin',
      label: 'Administración',
      items: [
        { tab: 'cash-drawer', label: userRole === 'frontdesk' ? 'Caja de mostrador' : 'Gastos y caja' },
        ...(isAdmin
          ? [
              { tab: 'finances', label: 'Rendimiento financiero' },
              { tab: 'properties', label: isApp ? 'Unidades y calendarios' : 'Cabañas y calendarios' },
              { tab: 'pricing', label: 'Tarifas' },
              ...(isApp ? [{ tab: 'team', label: 'Equipo y accesos' }] : []),
              ...(hasOnboarding ? [{ action: 'onboarding' as NavAction, label: 'Configurar unidades' }] : []),
            ]
          : []),
      ],
    },
  ];
}

export function findActiveGroup(groups: NavGroup[], activeTab: string): NavGroup {
  return groups.find((g) => g.items.some((i) => i.tab === activeTab)) || groups[0];
}

export function findActiveItem(groups: NavGroup[], activeTab: string): NavItem | undefined {
  return groups.flatMap((g) => g.items).find((i) => i.tab === activeTab);
}

interface AreasBarProps {
  groups: NavGroup[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onAction: (action: NavAction) => void;
  complexName: string;
}

export const DesktopAreasBar: React.FC<AreasBarProps> = ({ groups, activeTab, onSelectTab, onAction, complexName }) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);
  const active = findActiveGroup(groups, activeTab);

  useEffect(() => {
    if (!openKey) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openKey]);

  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const dateLabel = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      ref={barRef}
      className="relative z-50 bg-white dark:bg-[#0E0F12] border-b border-stone-300 dark:border-zinc-700 px-4 sm:px-8 flex flex-wrap items-center gap-x-6 gap-y-1"
    >
      <div className="flex items-center gap-3 py-3 min-w-0 flex-1 basis-0 min-w-[220px]">
        {/* Logo de Loomi: el arco del círculo incompleto (mismo dibujo que public/favicon.svg) */}
        <svg viewBox="0 0 1000 1000" className="w-9 h-9 shrink-0" aria-hidden="true">
          <rect width="1000" height="1000" rx="220" fill="#0B0F17" />
          <path d="M 809.3 385 A 330 330 0 1 1 612.9 189.9" fill="none" stroke="#EFECE5" strokeWidth="110" strokeLinecap="round" />
        </svg>
        <div className="leading-tight min-w-0">
          <div className="text-[15px] font-bold text-stone-900 dark:text-stone-50 truncate">{complexName}</div>
          <div className="text-[13px] font-medium text-stone-700 dark:text-stone-200">{dateLabel}</div>
        </div>
      </div>
      <nav aria-label="Áreas" className="flex flex-wrap items-stretch justify-center gap-x-2 self-stretch">
        {groups.map((g) => {
          const isActive = g.key === active.key;
          const isOpen = openKey === g.key;
          return (
            <div key={g.key} className="relative flex items-stretch">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : g.key)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={`min-h-[44px] px-3.5 flex items-center gap-2 text-[15px] border-b-[3px] cursor-pointer transition-colors ${
                  isActive
                    ? 'font-bold text-stone-900 dark:text-white border-[#A94F12] dark:border-[#F0A46F]'
                    : 'font-semibold text-stone-700 dark:text-stone-200 border-transparent hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <span>{g.label}</span>
                {!!g.badge && g.badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#A94F12] dark:bg-[#F0A46F] text-white dark:text-[#1A1206] text-[12px] font-bold flex items-center justify-center">
                    {g.badge}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {isOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 min-w-[270px] bg-white dark:bg-[#1A1B20] border border-stone-300 dark:border-zinc-600 rounded-2xl shadow-xl p-2 flex flex-col"
                >
                  {g.items.map((i) => {
                    const on = !!i.tab && i.tab === activeTab;
                    const isAction = !!i.action;
                    return (
                      <button
                        key={i.tab || i.action}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenKey(null);
                          if (i.action) onAction(i.action);
                          else if (i.tab) onSelectTab(i.tab);
                        }}
                        className={`min-h-[44px] px-3.5 rounded-xl text-left text-[15px] cursor-pointer transition-colors ${
                          isAction
                            ? 'font-bold text-[#A94F12] dark:text-[#F0A46F] hover:bg-orange-50 dark:hover:bg-zinc-800'
                            : on
                            ? 'font-bold bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206]'
                            : 'font-semibold text-stone-900 dark:text-stone-50 hover:bg-stone-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {i.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Espejo del bloque de la izquierda, para que el menú quede justo en el centro */}
      <div className="hidden lg:block flex-1 basis-0 min-w-[220px]" aria-hidden />
    </header>
  );
};

/** Dónde estás: "Reservas › Ocupación (Calendario)". Reemplaza al título de la barra de abajo. */
export const DesktopCrumb: React.FC<{ groups: NavGroup[]; activeTab: string }> = ({ groups, activeTab }) => {
  const group = findActiveGroup(groups, activeTab);
  const item = findActiveItem(groups, activeTab);
  return (
    <div className="flex items-center gap-2 text-[15px]">
      <span className="font-semibold text-stone-700 dark:text-stone-200">{group.label}</span>
      <span className="text-stone-500 dark:text-stone-400" aria-hidden>›</span>
      <span className="font-bold text-stone-900 dark:text-white">{item?.label || ''}</span>
    </div>
  );
};
