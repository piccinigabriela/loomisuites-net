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
    <div className="bg-white dark:bg-[#1c1c1c] border-b border-[#ded9cd] dark:border-[#2a2a2a] transition-colors">
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
                    ? 'bg-[#f4eee7] dark:bg-[#2c221a] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-[#533928] shadow-2xs'
                    : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] hover:bg-[#f8f6f2] dark:hover:bg-[#252525] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c46d45] dark:text-[#d88d5e]' : 'text-[#a8a39b] dark:text-[#666]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#f8f6f2] dark:bg-[#332b24] text-[#9c512a] dark:text-[#d88d5e] border border-[#ded9cd] dark:border-[#4d3d30] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
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
