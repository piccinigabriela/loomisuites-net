import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Building2,
  MessageSquare,
  DollarSign,
  Bot,
  ShoppingBag,
  List,
  Globe,
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
  isEmployeeMode = false,
}) => {
  const allTabs = [
    { id: 'overview', label: 'Panel Hoy', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario iCal', icon: Calendar },
    { id: 'bookings', label: 'Reservas', icon: List },
    {
      id: 'housekeeping',
      label: 'Mucamas & Limpieza',
      icon: Sparkles,
      badge: pendingCleaningsCount > 0 ? `${pendingCleaningsCount}` : undefined,
    },
    { id: 'properties', label: 'Propiedades', icon: Building2 },
    { id: 'addons', label: 'Opcionales & Catas', icon: ShoppingBag },
    { id: 'messages', label: 'WhatsApp & Mensajes', icon: MessageSquare },
    { id: 'finances', label: 'Finanzas', icon: DollarSign, adminOnly: true },
    {
      id: 'welcome-guide',
      label: 'Tu Web & Guía QR',
      icon: Globe,
      badge: '🌐 Web',
    },
    { id: 'xenia', label: 'Copiloto IA', icon: Bot, badge: 'IA' },
  ];

  const tabs = isEmployeeMode ? allTabs.filter((t) => !t.adminOnly) : allTabs;

  return (
    <div className="bg-[#F8F9FA]/90 dark:bg-[#0E0F12]/90 border-b border-stone-200/70 dark:border-zinc-800/70 transition-colors sticky top-14 z-19 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-[#E67E22] dark:text-[#E67E22] border-stone-200/90 dark:border-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)] font-semibold'
                    : 'bg-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/60 dark:hover:bg-zinc-800/50 border-transparent font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E67E22]' : 'text-stone-400 dark:text-stone-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/50 dark:text-orange-300'
                      : 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
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
