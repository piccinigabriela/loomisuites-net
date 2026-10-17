import React from 'react';

/** Menú de arriba para computadora: áreas en el primer nivel, vistas de cada área en el segundo. */

export interface NavItem {
  tab: string;
  label: string;
}
export interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
  badge?: number;
}

/** Se usa en el demo; en la app real solo si se abre con ?menu=arriba (para probarlo sin tocar a los clientes). */
export function useTopNavEnabled(isApp: boolean): boolean {
  if (!isApp) return true;
  try {
    return new URLSearchParams(window.location.search).get('menu') === 'arriba';
  } catch {
    return false;
  }
}

export function buildNavGroups(opts: {
  isApp: boolean;
  userRole: 'admin' | 'frontdesk' | 'housekeeping';
  showTeamNotices: boolean;
  pendingCleaningsCount: number;
}): NavGroup[] {
  const { isApp, userRole, showTeamNotices, pendingCleaningsCount } = opts;
  const groups: NavGroup[] = [
    {
      key: 'inicio',
      label: 'Inicio',
      items: [
        { tab: 'overview', label: 'Hoy' },
        { tab: 'xenia', label: 'Xenia' },
      ],
    },
    {
      key: 'reservas',
      label: 'Reservas',
      items: [
        { tab: 'calendar', label: 'Calendario' },
        { tab: 'bookings', label: 'Lista de reservas' },
        { tab: 'addons', label: 'Opcionales y extras' },
      ],
    },
    {
      key: 'huespedes',
      label: 'Huéspedes',
      items: [
        { tab: 'messages', label: 'Avisos y WhatsApp' },
        ...(showTeamNotices ? [{ tab: 'team-notices', label: 'Avisos al equipo' }] : []),
        { tab: 'welcome-guide', label: 'Tu Web y Guía' },
      ],
    },
    {
      key: 'limpieza',
      label: 'Limpieza',
      badge: pendingCleaningsCount,
      items: [{ tab: 'housekeeping', label: 'Agenda de limpiezas' }],
    },
    {
      key: 'dinero',
      label: 'Dinero',
      items: [
        { tab: 'cash-drawer', label: userRole === 'frontdesk' ? 'Caja de mostrador' : 'Gastos y caja' },
        ...(userRole === 'admin' ? [{ tab: 'finances', label: 'Rendimiento' }] : []),
      ],
    },
  ];
  if (userRole === 'admin') {
    groups.push({
      key: 'admin',
      label: 'Administración',
      items: [
        { tab: 'properties', label: isApp ? 'Unidades y calendarios' : 'Cabañas y calendarios' },
        { tab: 'pricing', label: 'Tarifas' },
        ...(isApp ? [{ tab: 'team', label: 'Equipo y accesos' }] : []),
      ],
    });
  }
  return groups;
}

export function findActiveGroup(groups: NavGroup[], activeTab: string): NavGroup {
  return groups.find((g) => g.items.some((i) => i.tab === activeTab)) || groups[0];
}

interface AreasBarProps {
  groups: NavGroup[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  complexName: string;
}

export const DesktopAreasBar: React.FC<AreasBarProps> = ({ groups, activeTab, onSelectTab, complexName }) => {
  const active = findActiveGroup(groups, activeTab);
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const dateLabel = today.charAt(0).toUpperCase() + today.slice(1);
  return (
    <header className="bg-white dark:bg-[#0E0F12] border-b border-stone-300 dark:border-zinc-700 px-4 sm:px-8 flex flex-wrap items-center gap-x-6 gap-y-1">
      <div className="flex items-center gap-3 py-3 min-w-0">
        <div className="w-9 h-9 rounded-[10px] bg-[#A94F12] dark:bg-[#F0A46F] text-white dark:text-[#1A1206] flex items-center justify-center font-bold text-lg shrink-0" aria-hidden>
          L
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[15px] font-bold text-stone-900 dark:text-stone-50 truncate">{complexName}</div>
          <div className="text-[13px] font-medium text-stone-700 dark:text-stone-200">{dateLabel}</div>
        </div>
      </div>
      <nav aria-label="Áreas" className="flex flex-wrap items-stretch gap-x-1 self-stretch">
        {groups.map((g) => {
          const isActive = g.key === active.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => onSelectTab(g.items[0].tab)}
              aria-current={isActive ? 'page' : undefined}
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
            </button>
          );
        })}
      </nav>
    </header>
  );
};

interface SubTabsProps {
  groups: NavGroup[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const DesktopSubTabs: React.FC<SubTabsProps> = ({ groups, activeTab, onSelectTab }) => {
  const active = findActiveGroup(groups, activeTab);
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={`Vistas de ${active.label}`}>
      {active.items.map((i) => {
        const on = i.tab === activeTab;
        return (
          <button
            key={i.tab}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelectTab(i.tab)}
            className={`min-h-[40px] px-4 rounded-[10px] text-[15px] cursor-pointer transition-colors ${
              on
                ? 'font-bold bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206]'
                : 'font-semibold text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-zinc-800'
            }`}
          >
            {i.label}
          </button>
        );
      })}
    </div>
  );
};
