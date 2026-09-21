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
import { JsonDataModal } from './components/demo/JsonDataModal';
import { INITIAL_WELCOME_GUIDE } from './data/initialData';

export default function App() {
  // App view: 'landing' (clean landing site) or 'demo' (active PMS panel)
  const [currentView, setCurrentView] = useState<'landing' | 'demo'>('landing');

  // Demo active tab: default to overview
  const [demoTab, setDemoTab] = useState<string>('overview');

  // Active Complex: Catalinas Apartamentos or Wood Cabin
  const [activeComplex, setActiveComplex] = useState<'catalinas' | 'woodcabin'>('catalinas');

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
        /* DEMO DASHBOARD VIEW */
        <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
          <DemoHeader
            theme={theme}
            onToggleTheme={toggleTheme}
            activeComplex={activeComplex}
            onSwitchComplex={(c) => {
              setActiveComplex(c);
              showToast(c === 'catalinas' ? 'Cambiado a Catalinas Apartamentos (CABA)' : 'Cambiado a Wood Cabin (Iguazú)');
            }}
            onBackToLanding={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onResetData={handleResetData}
            onOpenNewReservation={() => {
              setInitialPropertyForRes(undefined);
              setInitialDateForRes(undefined);
              setIsNewResModalOpen(true);
            }}
            onOpenJsonModal={() => setIsJsonModalOpen(true)}
            onOpenContactModal={() => {
              setSelectedPlanForLead('Prueba Demo a Producción');
              setIsLeadModalOpen(true);
            }}
            isEmployeeMode={isEmployeeMode}
            onToggleEmployeeMode={toggleEmployeeMode}
          />

          <DemoNavTabs
            activeTab={demoTab}
            onSelectTab={setDemoTab}
            pendingCleaningsCount={pendingCleaningsCount}
            isEmployeeMode={isEmployeeMode}
          />

          {/* Demo Content Container */}
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {demoTab === 'overview' && (
              <DemoOverview
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
    </div>
  );
}
