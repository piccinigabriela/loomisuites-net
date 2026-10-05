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
  activeComplexName = 'Catalinas Apartamentos',
  isEmployeeMode = false,
}) => {
  const allTabs = [
    { id: 'overview', label: 'Panel General', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario Multicanal', icon: Calendar },
    { id: 'bookings', label: 'Lista de Reservas', icon: List },
    {
      id: 'housekeeping',
      label: 'Operaciones & Puesta a Punto',
      icon: Sparkles,
      badge: pendingCleaningsCount > 0 ? `${pendingCleaningsCount}` : undefined,
    },
    { id: 'properties', label: 'Propiedades & Tarifas', icon: Building2 },
    { id: 'addons', label: 'Opcionales & Extras', icon: ShoppingBag },
    { id: 'messages', label: 'WhatsApp & Mensajería', icon: MessageSquare },
    { id: 'finances', label: 'Finanzas & Propietarios', icon: DollarSign, adminOnly: true },
    {
      id: 'welcome-guide',
      label: 'Tu Web & Guía',
      icon: Globe,
      badge: '🌐 Web',
    },
    { id: 'xenia', label: 'Xenia Copilot IA', icon: Bot, badge: 'IA' },
  ];

  const tabs = isEmployeeMode ? allTabs.filter((t) => !t.adminOnly) : allTabs;

  return (
    <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border-b border-[#C8C4B7] dark:border-[#222328] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-xs'
                    : 'text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white hover:bg-[#DCD8CE]/50 dark:hover:bg-[#18181B] border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-none border ${
                    isActive
                      ? 'bg-[#E1500A] text-white border-[#E1500A]'
                      : 'bg-[#DCD8CE] dark:bg-[#18181B] text-[#71717A] dark:text-[#8E8E93] border-[#C8C4B7] dark:border-[#222328]'
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
