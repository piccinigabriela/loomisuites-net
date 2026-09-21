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
} from 'lucide-react';

interface DemoNavTabsProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingCleaningsCount: number;
  activeComplexName?: string;
  isEmployeeMode?: boolean;
}

export const DemoNavTabs: React.FC<DemoNavTabsProps> = ({
  activeTab,
  onSelectTab,
  pendingCleaningsCount,
  activeComplexName = 'Catalinas Apartamentos',
  isEmployeeMode = false,
}) => {
  const allTabs = [
    { id: 'overview', label: 'Panel General', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario Multicanal', icon: Calendar },
    {
      id: 'housekeeping',
      label: 'Limpieza & Operaciones',
      icon: Sparkles,
      badge: pendingCleaningsCount > 0 ? `${pendingCleaningsCount}` : undefined,
    },
    { id: 'properties', label: 'Propiedades & Tarifas', icon: Building2 },
    { id: 'addons', label: 'Opcionales & Extras', icon: ShoppingBag },
    { id: 'messages', label: 'WhatsApp & Mensajería', icon: MessageSquare },
    { id: 'finances', label: 'Finanzas & Propietarios', icon: DollarSign, adminOnly: true },
    {
      id: 'welcome-guide',
      label: 'Guía Huésped & Landing',
      icon: Compass,
      badge: activeComplexName,
    },
    { id: 'xenia', label: 'Xenia Copilot IA', icon: Bot, badge: 'IA' },
  ];

  const tabs = isEmployeeMode ? allTabs.filter((t) => !t.adminOnly) : allTabs;

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/40 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
