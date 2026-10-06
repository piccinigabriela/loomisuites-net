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
    <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border-b border-[#C8C4B7] dark:border-[#222328] transition-colors sticky top-12 z-19">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] border-[#18181B] dark:border-white shadow-sm font-black'
                    : 'bg-white/80 dark:bg-[#18181B]/80 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-white dark:hover:bg-[#222328] border-[#DCD8CE] dark:border-[#2A2C34]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E1500A]' : 'text-[#71717A] dark:text-[#A1A1AA]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-[#E1500A] text-white'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
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
