/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Play,
  RotateCcw,
  MessageCircle,
  Plus,
  ArrowUp,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { DemoState, Reservation, CleaningTask, ReservationStatus } from './types';
import {
  getDemoState,
  saveDemoState,
  resetDemoState,
  getRelativeDate,
} from './data/initialData';

// Landing Page Components
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { QuestionsHub } from './components/landing/QuestionsHub';
import { ChannelIntegrations } from './components/landing/ChannelIntegrations';
import { Footer } from './components/landing/Footer';
import { LeadModal } from './components/landing/LeadModal';

// Demo Application Components
import { CleanSidebar } from './components/demo/CleanSidebar';
import { CleanToday } from './components/demo/CleanToday';
import { DemoHeader } from './components/demo/DemoHeader';
import { DemoNavTabs } from './components/demo/DemoNavTabs';
import { DemoOverview } from './components/demo/DemoOverview';
import { DemoCalendar } from './components/demo/DemoCalendar';
import { DemoHousekeeping } from './components/demo/DemoHousekeeping';
import { DemoProperties } from './components/demo/DemoProperties';
import { DemoAddons } from './components/demo/DemoAddons';
import { DemoMessages } from './components/demo/DemoMessages';
import { DemoFinances } from './components/demo/DemoFinances';
import { WelcomeGuideHub } from './components/guide/WelcomeGuideHub';
import { XeniaCopilotView } from './components/xenia/XeniaCopilotView';
import { XeniaFloatingWidget } from './components/xenia/XeniaFloatingWidget';
import { NewReservationModal } from './components/demo/NewReservationModal';
import { ReservationDetailModal } from './components/demo/ReservationDetailModal';
import { DemoBookingsList } from './components/demo/DemoBookingsList';
import { JsonDataModal } from './components/demo/JsonDataModal';
import { OnboardingWizardModal } from './components/demo/OnboardingWizardModal';
import { CalendarImportModal } from './components/demo/CalendarImportModal';
import { INITIAL_WELCOME_GUIDE } from './data/initialData';

export default function App() {
  // App view: 'landing' (clean landing site) or 'demo' (active PMS panel)
  const [currentView, setCurrentView] = useState<'landing' | 'demo'>('landing');

  // Demo active tab: default to overview
  const [demoTab, setDemoTab] = useState<string>('overview');

  // Active Complex: Catalinas Apartamentos, Wood Cabin or Custom
  const [activeComplex, setActiveComplex] = useState<'catalinas' | 'woodcabin' | 'custom'>('catalinas');

  // Employee Mode ("Modo Día a Día") - restricts access to financial metrics & rates
  const [isEmployeeMode, setIsEmployeeMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('loomi_employee_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Theme state (Dark Mode / Light Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('loomi_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('loomi_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(next === 'dark' ? '🌙 Modo Oscuro activado' : '☀️ Modo Claro activado');
      return next;
    });
  };

  const toggleEmployeeMode = () => {
    setIsEmployeeMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('loomi_employee_mode', String(next));
      } catch {}
      if (next && demoTab === 'finances') {
        setDemoTab('overview');
      }
      showToast(
        next
          ? '👷 Modo Día a Día activado: datos financieros y de propietarios ocultos para empleados.'
          : '👑 Modo Administrador / Dueño activado: acceso total a finanzas y liquidaciones.'
      );
      return next;
    });
  };

  // Persistent Demo State (from localStorage)
  const [demoState, setDemoState] = useState<DemoState>(getDemoState);

  // Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedPlanForLead, setSelectedPlanForLead] = useState<string | undefined>();
  const [isNewResModalOpen, setIsNewResModalOpen] = useState(false);
  const [initialPropertyForRes, setInitialPropertyForRes] = useState<string | undefined>();
  const [initialDateForRes, setInitialDateForRes] = useState<string | undefined>();
  const [selectedReservationForDetail, setSelectedReservationForDetail] = useState<Reservation | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage whenever demoState changes
  const updateDemoState = (updater: (prev: DemoState) => DemoState) => {
    setDemoState((prev) => {
      const next = updater(prev);
      saveDemoState(next);
      return next;
    });
  };

  // Handle Onboarding Completion
  const handleCompleteOnboarding = (data: {
    complexName: string;
    city: string;
    address: string;
    wifiNetwork: string;
    wifiPassword: string;
    properties: any[];
    addons: any[];
  }) => {
    const today = getRelativeDate(0);
    const in2days = getRelativeDate(2);
    const in4days = getRelativeDate(4);

    // Create initial sample reservations for the user's units
    const initialRealReservations: Reservation[] = data.properties.map((prop, idx) => {
      const isFirst = idx === 0;
      const cIn = isFirst ? today : in2days;
      const cOut = isFirst ? in2days : in4days;
      const nights = 2;
      const totalAmount = prop.basePrice * nights + prop.cleaningFee;
      const commissionPaid = Math.round(totalAmount * 0.03 * 10) / 10;
      return {
        id: `res-real-${idx + 1}`,
        propertyId: prop.id,
        guestName: isFirst ? 'Martín Palermo (Huésped de Prueba)' : 'Carolina Herrera',
        guestEmail: isFirst ? 'martin.palermo@gmail.com' : 'caro.herrera@hotmail.com',
        guestPhone: isFirst ? '+54 9 11 4455-8899' : '+54 9 351 778-9900',
        guestAvatar: isFirst ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
        checkIn: cIn,
        checkOut: cOut,
        nights,
        guestsCount: Math.min(2, prop.maxGuests),
        platform: isFirst ? 'airbnb' : 'direct',
        totalAmount,
        cleaningFee: prop.cleaningFee,
        commissionPaid,
        netRevenue: totalAmount - commissionPaid,
        status: isFirst ? 'checked_in' : 'confirmed',
        paymentStatus: isFirst ? 'paid' : 'deposit_only',
        pinCode: prop.smartLock?.enabled ? '4912' : '',
        createdAt: new Date().toISOString(),
        earlyCheckIn: false,
        lateCheckOut: false,
        addons: data.addons.length > 0 ? [
          {
            addonId: data.addons[0].id,
            name: data.addons[0].name,
            category: data.addons[0].category,
            unitPrice: data.addons[0].price,
            quantity: 1,
            total: data.addons[0].price,
            status: 'entregado',
          }
        ] : [],
      };
    });

    const initialRealTasks: CleaningTask[] = data.properties.map((prop, idx) => ({
      id: `clean-real-${idx + 1}`,
      propertyId: prop.id,
      date: idx === 0 ? today : in2days,
      scheduledTime: '11:00 - 13:30',
      cleanerName: 'Equipo de Limpieza',
      cleanerPhone: '+54 9 11 9988-7766',
      status: idx === 0 ? 'completed' : 'pending',
      checklist: [
        { id: 'c1', task: 'Cambio de sábanas y toallas sanitizadas', completed: idx === 0 },
        { id: 'c2', task: 'Limpieza profunda de baño y reposición de amenities', completed: idx === 0 },
        { id: 'c3', task: 'Desinfección de superficies y vajilla', completed: idx === 0 },
        { id: 'c4', task: 'Verificación de WiFi y cerradura', completed: idx === 0 },
      ],
      notes: `Limpieza para ${prop.name}`,
    }));

    const newCustomState: DemoState = {
      properties: data.properties,
      reservations: initialRealReservations,
      cleaningTasks: initialRealTasks,
      templates: demoState.templates || [],
      availableAddons: data.addons,
      addons: data.addons,
      welcomeGuide: {
        ...(demoState.welcomeGuide || INITIAL_WELCOME_GUIDE),
        propertyName: data.complexName,
        tagline: `${data.city} • Departamentos Exclusivos`,
        locationAddress: data.address,
        wifiNetwork: data.wifiNetwork,
        wifiPassword: data.wifiPassword,
      },
      lastUpdated: new Date().toISOString(),
    };

    updateDemoState(() => newCustomState);
    setActiveComplex('custom');
    setIsOnboardingModalOpen(false);
    setDemoTab('overview');
    showToast(`🎉 ¡Felicitaciones! "${data.complexName}" configurado con éxito (${data.properties.length} unidades).`);
  };

  // Reset to factory defaults
  const handleResetData = () => {
    const fresh = resetDemoState();
    setDemoState(fresh);
    showToast('Datos ficticios restablecidos correctamente.');
  };

  // Import JSON data
  const handleImportData = (newState: DemoState) => {
    saveDemoState(newState);
    setDemoState(newState);
    showToast('Datos personalizados cargados y guardados en localStorage.');
  };

  // Handle import from Google Calendar / CSV
  const handleImportCalendarReservations = (newRes: Reservation[], mode: 'add' | 'replace') => {
    updateDemoState((prev) => {
      let finalReservations = [...prev.reservations];
      if (mode === 'replace') {
        finalReservations = newRes;
      } else {
        // Mode 'add' - filter duplicates or keep existing and append new ones
        const existingIds = new Set(prev.reservations.map(r => `${r.propertyId}_${r.checkIn}_${r.checkOut}`));
        const filterNew = newRes.filter(r => !existingIds.has(`${r.propertyId}_${r.checkIn}_${r.checkOut}`));
        finalReservations = [...filterNew, ...prev.reservations];
      }

      // Also automatically create cleaning tasks for each new imported reservation!
      const newCleaningTasks = newRes.map((r) => ({
        id: `clean-import-${Date.now()}-${Math.random()}`,
        propertyId: r.propertyId,
        reservationId: r.id,
        date: r.checkOut,
        scheduledTime: '11:00 - 13:30',
        cleanerName: 'Marta González',
        cleanerPhone: '+54 9 11 5566-7788',
        status: 'pending' as const,
        checklist: [
          { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
          { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
          { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
          { id: 'c4', task: 'Comprobación de cerradura inteligente', completed: false },
        ],
        notes: `Generado automáticamente por importación de ${r.guestName}`,
      }));

      const finalCleaningTasks = mode === 'replace'
        ? newCleaningTasks
        : [...newCleaningTasks, ...prev.cleaningTasks];

      return {
        ...prev,
        reservations: finalReservations,
        cleaningTasks: finalCleaningTasks,
        lastUpdated: new Date().toISOString(),
      };
    });

    showToast(`🎉 ¡Éxito! Se importaron ${newRes.length} reservas y se crearon sus tareas de limpieza.`);
  };

  // New Reservation creation
  const handleSaveReservation = (newRes: Reservation) => {
    updateDemoState((prev) => {
      // Also automatically create a cleaning task scheduled on checkout!
      const newCleaningTask: CleaningTask = {
        id: `clean-${Date.now()}`,
        propertyId: newRes.propertyId,
        reservationId: newRes.id,
        date: newRes.checkOut,
        scheduledTime: '11:00 - 13:30',
        cleanerName: 'Marta González',
        cleanerPhone: '+54 9 11 5566-7788',
        status: 'pending',
        checklist: [
          { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
          { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
          { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
          { id: 'c4', task: 'Comprobación de cerradura inteligente', completed: false },
        ],
        notes: `Generado automáticamente por check-out de ${newRes.guestName}`,
      };

      return {
        ...prev,
        reservations: [newRes, ...prev.reservations],
        cleaningTasks: [newCleaningTask, ...prev.cleaningTasks],
        lastUpdated: new Date().toISOString(),
      };
    });

    showToast(`¡Reserva de ${newRes.guestName} creada y sincronizada!`);
  };

  // Update full reservation details
  const handleUpdateReservation = (updatedRes: Reservation) => {
    updateDemoState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === updatedRes.id ? updatedRes : r
      ),
      // Automatically keep cleaning task synced with property and checkout date
      cleaningTasks: prev.cleaningTasks.map((t) => {
        if (t.reservationId === updatedRes.id) {
          return {
            ...t,
            propertyId: updatedRes.propertyId,
            date: updatedRes.checkOut,
            notes: `Generado automáticamente por check-out de ${updatedRes.guestName}`,
          };
        }
        return t;
      }),
      lastUpdated: new Date().toISOString(),
    }));
    setSelectedReservationForDetail(updatedRes);
    showToast(`Reserva de ${updatedRes.guestName} guardada y actualizada.`);
  };

  // Update reservation status
  const handleUpdateReservationStatus = (resId: string, newStatus: ReservationStatus) => {
    updateDemoState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === resId ? { ...r, status: newStatus } : r
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(`Estado de reserva actualizado a ${newStatus}`);
  };

  // Update reservation price (e.g. for iCal blocks or manual adjustments across any channel)
  const handleUpdateReservationPrice = (resId: string, newTotal: number) => {
    updateDemoState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) => {
        if (r.id !== resId) return r;
        let rate = 0;
        if (r.platform === 'airbnb') {
          rate = r.airbnbFeeMode === 'traditional_3' ? 0.03 : 0.15;
        } else if (r.platform === 'booking' || r.platform === 'vrbo') {
          rate = 0.15;
        }
        const accommodation = Math.max(0, newTotal - (r.cleaningFee || 0));
        const commissionPaid = Math.round(accommodation * rate * 10) / 10;
        const netRevenue = Math.round((newTotal - commissionPaid) * 10) / 10;
        return {
          ...r,
          totalAmount: newTotal,
          commissionPaid,
          netRevenue,
        };
      }),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(`Tarifa de la reserva actualizada a $${newTotal} USD.`);
  };

  // Delete reservation
  const handleDeleteReservation = (resId: string) => {
    updateDemoState((prev) => ({
      ...prev,
      reservations: prev.reservations.filter((r) => r.id !== resId),
      lastUpdated: new Date().toISOString(),
    }));
    showToast('Reserva eliminada del calendario.');
  };

  // Toggle housekeeping item
  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    updateDemoState((prev) => ({
      ...prev,
      cleaningTasks: prev.cleaningTasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...t, checklist: updatedChecklist };
      }),
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Update cleaning task status
  const handleUpdateTaskStatus = (taskId: string, newStatus: CleaningTask['status']) => {
    updateDemoState((prev) => ({
      ...prev,
      cleaningTasks: prev.cleaningTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(`Estado de limpieza actualizado a: ${newStatus}`);
  };

  // Update property price
  const handleUpdatePropertyPrice = (propertyId: string, newPrice: number) => {
    updateDemoState((prev) => ({
      ...prev,
      properties: prev.properties.map((p) =>
        p.id === propertyId ? { ...p, basePrice: newPrice } : p
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(`Tarifa por noche actualizada a $${newPrice} USD`);
  };

  // Quick check in
  const handleQuickCheckIn = (resId: string) => {
    handleUpdateReservationStatus(resId, 'checked_in');
  };

  // Handle open messages directly for guest
  const handleOpenMessagesWithGuest = (resId: string) => {
    setDemoTab('messages');
  };

  // Open calendar slot
  const handleOpenNewReservationWithProperty = (propId: string, date: string) => {
    setInitialPropertyForRes(propId);
    setInitialDateForRes(date);
    setIsNewResModalOpen(true);
  };

  const pendingCleaningsCount = demoState.cleaningTasks.filter(
    (c) => c.status !== 'completed' && c.status !== 'inspected'
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-rose-500 selection:text-white transition-colors">
      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RENDER VIEW: LANDING OR DEMO */}
      {currentView === 'landing' ? (
        <main>
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenDemo={() => {
              setCurrentView('demo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setSelectedPlanForLead(undefined);
              setIsLeadModalOpen(true);
            }}
          />

          <Hero
            onOpenDemo={() => {
              setCurrentView('demo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setSelectedPlanForLead(undefined);
              setIsLeadModalOpen(true);
            }}
          />

          <QuestionsHub
            onOpenDemo={() => {
              setCurrentView('demo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={(planOrTopic) => {
              setSelectedPlanForLead(planOrTopic || 'Consulta General');
              setIsLeadModalOpen(true);
            }}
          />

          <ChannelIntegrations />

          <Footer
            onOpenDemo={() => {
              setCurrentView('demo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setSelectedPlanForLead(undefined);
              setIsLeadModalOpen(true);
            }}
          />

          {/* Floating Sticky CTA Bar on Mobile/Desktop */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl border border-zinc-700 flex items-center gap-3">
            <span className="text-xs font-medium hidden sm:inline text-zinc-300">
              ¿Quieres ver cómo funciona en la vida real?
            </span>
            <button
              onClick={() => {
                setCurrentView('demo');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/30"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Probar Demo en Vivo</span>
            </button>
          </div>
        </main>
      ) : (
        /* CLEAN RELAXED CARBON PMS DASHBOARD VIEW */
        <div className="min-h-screen flex bg-[#f8f6f2] dark:bg-[#141414] text-[#1c1b18] dark:text-[#e0deda] font-sans transition-colors">
          {/* Minimalist Sidebar */}
          <CleanSidebar
            activeTab={demoTab}
            onSelectTab={setDemoTab}
            pendingCleaningsCount={pendingCleaningsCount}
            complexName={
              activeComplex === 'catalinas'
                ? 'Catalinas Apartamentos'
                : activeComplex === 'woodcabin'
                ? 'Los Bananos Wood Cabin'
                : 'Mi Complejo Real'
            }
            onOpenNewReservation={() => {
              setInitialPropertyForRes(undefined);
              setInitialDateForRes(undefined);
              setIsNewResModalOpen(true);
            }}
            onOpenOnboardingWizard={() => setIsOnboardingModalOpen(true)}
            isEmployeeMode={isEmployeeMode}
            onToggleEmployeeMode={toggleEmployeeMode}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToLanding={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activeComplex={activeComplex}
            onSwitchComplex={(c) => {
              setActiveComplex(c);
              showToast(
                c === 'catalinas'
                  ? 'Cambiado a Catalinas Apartamentos'
                  : c === 'woodcabin'
                  ? 'Cambiado a Wood Cabin'
                  : 'Cambiado a Mi Complejo Real'
              );
            }}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#f4f1ea] dark:bg-[#141414] overflow-y-auto transition-colors">
            {/* Minimalist Top Sub-bar with fast actions & status */}
            <div className="h-12 border-b border-[#ded9cd] dark:border-[#242424] px-4 sm:px-6 flex items-center justify-between bg-[#fbf9f5]/90 dark:bg-[#161616]/90 sticky top-0 z-20 backdrop-blur-xs transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg text-[#66625a] dark:text-[#a8a5a0] hover:bg-[#edeae2] dark:hover:bg-[#222] border border-[#ded9cd] dark:border-[#333] transition-colors cursor-pointer"
                  title="Abrir menú"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#78746c] dark:text-[#8c8a85]">
                  {activeComplex === 'catalinas'
                    ? 'Catalinas Apartamentos (CABA)'
                    : activeComplex === 'woodcabin'
                    ? 'Wood Cabin (Iguazú)'
                    : 'Mi Complejo Real'}
                </span>
                <span className="text-[#ded9cd] dark:text-[#3a3a3a]">/</span>
                <span className="text-xs font-bold text-[#1c1b18] dark:text-[#f0eeeb] capitalize">
                  {demoTab === 'overview'
                    ? 'Hoy'
                    : demoTab === 'calendar'
                    ? 'Ocupación'
                    : demoTab === 'housekeeping'
                    ? 'Limpiezas'
                    : demoTab === 'finances'
                    ? 'Rendimiento'
                    : demoTab === 'welcome-guide'
                    ? 'Guía Huésped'
                    : demoTab === 'properties'
                    ? 'Departamentos'
                    : demoTab === 'addons'
                    ? 'Opcionales'
                    : demoTab === 'messages'
                    ? 'Avisos & WhatsApp'
                    : 'Asistente'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Visible Light / Dark Switcher in top sub-bar */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#202020] border border-[#ded9cd] dark:border-[#333] text-[#44403a] dark:text-[#d0cdc8] hover:border-[#c46d45]/50 transition-colors cursor-pointer shadow-2xs"
                  title="Cambiar tema"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#55514a]" />
                      <span>Modo Oscuro</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetData}
                  className="text-[11px] font-medium text-[#78746c] dark:text-[#9c9994] hover:text-[#1c1b18] dark:hover:text-[#ebe8e1] transition-colors cursor-pointer"
                >
                  Restablecer Muestra
                </button>
                <span className="text-[#ded9cd] dark:text-[#3a3a3a]">|</span>
                <button
                  onClick={() => {
                    setInitialPropertyForRes(undefined);
                    setInitialDateForRes(undefined);
                    setIsNewResModalOpen(true);
                  }}
                  className="bg-[#c46d45] hover:bg-[#b85e35] text-white dark:bg-[#2e2620] dark:hover:bg-[#3d2e24] dark:text-[#d88d5e] border border-transparent dark:border-[#523c2e] text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>+ Nueva Reserva</span>
                </button>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
              {demoTab === 'overview' && (
                <CleanToday
                  demoState={demoState}
                  onSelectReservation={setSelectedReservationForDetail}
                  onOpenNewReservation={() => {
                    setInitialPropertyForRes(undefined);
                    setInitialDateForRes(undefined);
                    setIsNewResModalOpen(true);
                  }}
                  onNavigateTab={setDemoTab}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onQuickCheckIn={handleQuickCheckIn}
                  isEmployeeMode={isEmployeeMode}
                />
              )}

              {demoTab === 'calendar' && (
                <DemoCalendar
                  demoState={demoState}
                  onSelectReservation={setSelectedReservationForDetail}
                  onOpenNewReservationWithProperty={handleOpenNewReservationWithProperty}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                />
              )}

              {demoTab === 'bookings' && (
                <DemoBookingsList
                  demoState={demoState}
                  onSelectReservation={setSelectedReservationForDetail}
                  onUpdateReservationStatus={handleUpdateReservationStatus}
                  onUpdateReservation={handleUpdateReservation}
                  onDeleteReservation={handleDeleteReservation}
                />
              )}

              {demoTab === 'housekeeping' && (
                <DemoHousekeeping
                  demoState={demoState}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              )}

              {demoTab === 'properties' && (
                <DemoProperties
                  demoState={demoState}
                  onUpdatePropertyPrice={handleUpdatePropertyPrice}
                  isEmployeeMode={isEmployeeMode}
                />
              )}

              {demoTab === 'addons' && (
                <DemoAddons
                  demoState={demoState}
                  onUpdateAddons={(updatedAddons) => {
                    updateDemoState((prev) => ({
                      ...prev,
                      addons: updatedAddons,
                      lastUpdated: new Date().toISOString(),
                    }));
                    showToast('Catálogo de Servicios Opcionales actualizado');
                  }}
                  isEmployeeMode={isEmployeeMode}
                />
              )}

              {demoTab === 'messages' && (
                <DemoMessages demoState={demoState} />
              )}

              {demoTab === 'finances' && !isEmployeeMode && (
                <DemoFinances demoState={demoState} />
              )}

              {demoTab === 'welcome-guide' && (
                <WelcomeGuideHub
                  guideData={demoState.welcomeGuide || INITIAL_WELCOME_GUIDE}
                  properties={demoState.properties}
                  onUpdateGuideData={(updated) => {
                    updateDemoState((prev) => ({
                      ...prev,
                      welcomeGuide: updated,
                      lastUpdated: new Date().toISOString(),
                    }));
                    showToast('Guía de Bienvenida y datos actualizados en vivo');
                  }}
                />
              )}

              {demoTab === 'xenia' && (
                <XeniaCopilotView demoState={demoState} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Floating Xenia AI Assistant */}
      <XeniaFloatingWidget
        demoState={demoState}
        onOpenFullView={() => {
          setCurrentView('demo');
          setDemoTab('xenia');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODALS */}
      <LeadModal
        isOpen={isLeadModalOpen}
        selectedPlan={selectedPlanForLead}
        onClose={() => setIsLeadModalOpen(false)}
        onOpenDemo={() => {
          setCurrentView('demo');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <NewReservationModal
        isOpen={isNewResModalOpen}
        demoState={demoState}
        initialPropertyId={initialPropertyForRes}
        initialDate={initialDateForRes}
        onClose={() => setIsNewResModalOpen(false)}
        onSaveReservation={handleSaveReservation}
      />

      <ReservationDetailModal
        reservation={selectedReservationForDetail}
        property={demoState.properties.find(
          (p) => p.id === selectedReservationForDetail?.propertyId
        )}
        properties={demoState.properties}
        allReservations={demoState.reservations}
        availableAddons={demoState.addons || demoState.availableAddons || []}
        onClose={() => setSelectedReservationForDetail(null)}
        onUpdateStatus={handleUpdateReservationStatus}
        onUpdatePrice={handleUpdateReservationPrice}
        onUpdateReservation={handleUpdateReservation}
        onDeleteReservation={handleDeleteReservation}
        onOpenMessagesWithGuest={handleOpenMessagesWithGuest}
        isEmployeeMode={isEmployeeMode}
      />

      <JsonDataModal
        isOpen={isJsonModalOpen}
        demoState={demoState}
        onClose={() => setIsJsonModalOpen(false)}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleCompleteOnboarding}
      />

      <CalendarImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        demoState={demoState}
        onImport={handleImportCalendarReservations}
      />
    </div>
  );
}
