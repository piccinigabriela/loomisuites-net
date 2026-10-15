/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
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
  Smartphone,
} from 'lucide-react';
import { DemoState, Reservation, CleaningTask, ReservationStatus, PaymentStatus, CashMovement, CleaningStatus, Property, CurrencyCode, TeamContact, PreCheckin } from './types';
import {
  getDemoState,
  saveDemoState,
  resetDemoState,
  getRelativeDate,
  toLocalDateStr,
  setActiveCurrency,
  formatCurrency,
} from './data/initialData';

// Landing Page Components
import { Navbar } from './components/landing/Navbar';
import { BentoLanding } from './components/landing/BentoLanding';
import { ManualLeadMagnet } from './components/landing/ManualLeadMagnet';
import { Footer } from './components/landing/Footer';
import { LeadModal } from './components/landing/LeadModal';

// Demo Application Components
import { subscribeToPreCheckins } from './lib/precheckin';
import type { LegacyImportPayload } from './components/demo/LegacyBackupImport';
import { INITIAL_WELCOME_GUIDE, getEmptyAppState, getCleaningsForDay } from './data/initialData';
import { isAppMode } from './lib/appMode';
import { auth, onAuthStateChanged, signOut, User } from './lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { subscribeToSubscription, getAccessStatus, SubscriptionDoc } from './lib/subscription';
import { FirstStepsChecklist, getFirstStepsStatus } from './components/onboarding/FirstStepsChecklist';
import {
  subscribeToTenant,
  initializeTenantOnboarding,
  savePropertyDoc,
  deletePropertyDoc,
  saveReservationDoc,
  deleteReservationDoc,
  saveCleaningTaskDoc,
  deleteCleaningTaskDoc,
  saveCashMovementDoc,
  deleteCashMovementDoc,
  saveTenantData,
  saveCurrencySettingsDoc,
  saveManagementSettingsDoc,
  savePublicGuide,
  savePublicCalendar,
  TenantDoc,
} from './lib/tenantStore';
import { syncCalendars } from './lib/icalSync';


// Carga diferida: la landing no descarga la demo, el panel ni los modales hasta que hacen falta
function lazyNamed<T extends Record<string, any>, K extends keyof T>(loader: () => Promise<T>, name: K): React.LazyExoticComponent<T[K]> {
  return React.lazy(() => loader().then((m) => ({ default: m[name] }))) as any;
}
const CleanSidebar = lazyNamed(() => import('./components/demo/CleanSidebar'), 'CleanSidebar');
const CleanToday = lazyNamed(() => import('./components/demo/CleanToday'), 'CleanToday');
const MobileLightView = lazyNamed(() => import('./components/demo/MobileLightView'), 'MobileLightView');
const DemoHeader = lazyNamed(() => import('./components/demo/DemoHeader'), 'DemoHeader');
const DemoNavTabs = lazyNamed(() => import('./components/demo/DemoNavTabs'), 'DemoNavTabs');
const DemoOverview = lazyNamed(() => import('./components/demo/DemoOverview'), 'DemoOverview');
const DemoCalendar = lazyNamed(() => import('./components/demo/DemoCalendar'), 'DemoCalendar');
const DemoHousekeeping = lazyNamed(() => import('./components/demo/DemoHousekeeping'), 'DemoHousekeeping');
const DemoProperties = lazyNamed(() => import('./components/demo/DemoProperties'), 'DemoProperties');
const DemoAddons = lazyNamed(() => import('./components/demo/DemoAddons'), 'DemoAddons');
const DemoMessages = lazyNamed(() => import('./components/demo/DemoMessages'), 'DemoMessages');
const DemoFinances = lazyNamed(() => import('./components/demo/DemoFinances'), 'DemoFinances');
const TeamNotices = lazyNamed(() => import('./components/demo/TeamNotices'), 'TeamNotices');
const DemoCashDrawer = lazyNamed(() => import('./components/demo/DemoCashDrawer'), 'DemoCashDrawer');
const WelcomeGuideHub = lazyNamed(() => import('./components/guide/WelcomeGuideHub'), 'WelcomeGuideHub');
const DirectBookingLanding = lazyNamed(() => import('./components/booking/DirectBookingLanding'), 'DirectBookingLanding');
const XeniaCopilotView = lazyNamed(() => import('./components/xenia/XeniaCopilotView'), 'XeniaCopilotView');
const XeniaFloatingWidget = lazyNamed(() => import('./components/xenia/XeniaFloatingWidget'), 'XeniaFloatingWidget');
const NewReservationModal = lazyNamed(() => import('./components/demo/NewReservationModal'), 'NewReservationModal');
const ReservationDetailModal = lazyNamed(() => import('./components/demo/ReservationDetailModal'), 'ReservationDetailModal');
const DemoBookingsList = lazyNamed(() => import('./components/demo/DemoBookingsList'), 'DemoBookingsList');
const JsonDataModal = lazyNamed(() => import('./components/demo/JsonDataModal'), 'JsonDataModal');
const OnboardingWizardModal = lazyNamed(() => import('./components/demo/OnboardingWizardModal'), 'OnboardingWizardModal');
const CalendarImportModal = lazyNamed(() => import('./components/demo/CalendarImportModal'), 'CalendarImportModal');
const ClientAuthModal = lazyNamed(() => import('./components/auth/ClientAuthModal'), 'ClientAuthModal');
const SuperAdminView = lazyNamed(() => import('./components/admin/SuperAdminView'), 'SuperAdminView');
const DemoPlanFunctionalBar = lazyNamed(() => import('./components/demo/DemoPlanFunctionalBar'), 'DemoPlanFunctionalBar');
const ReceptionView = lazyNamed(() => import('./components/roles/ReceptionView'), 'ReceptionView');
const HousekeepingMobileView = lazyNamed(() => import('./components/roles/HousekeepingMobileView'), 'HousekeepingMobileView');
const GuestWelcomePortal = lazyNamed(() => import('./components/guide/GuestWelcomePortal'), 'GuestWelcomePortal');
const PublicGuideView = lazyNamed(() => import('./components/guide/PublicGuideView'), 'PublicGuideView');
const AppAuthScreen = lazyNamed(() => import('./components/auth/AppAuthScreen'), 'AppAuthScreen');
const TrialEndedScreen = lazyNamed(() => import('./components/auth/TrialEndedScreen'), 'TrialEndedScreen');
const WelcomeScreen = lazyNamed(() => import('./components/onboarding/WelcomeScreen'), 'WelcomeScreen');

export default function App() {
  const isApp = isAppMode();

  // Mode app public guide view: if path starts with /guia
  if (isApp && typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/guia')) {
    return <PublicGuideView />;
  }

  // Firebase Auth State in App Mode
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => isApp);
  const [tenantLoading, setTenantLoading] = useState<boolean>(() => isApp);

  // Email Verification State in App Mode
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => Boolean(currentUser?.emailVerified));
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    setIsEmailVerified(Boolean(currentUser?.emailVerified));
  }, [currentUser]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Window focus listener to check email verification status silently in App Mode
  useEffect(() => {
    if (!isApp || !currentUser || isEmailVerified) return;

    const checkVerificationStatus = async () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        try {
          await auth.currentUser.reload();
          const currentVerified = Boolean(auth.currentUser.emailVerified);
          if (currentVerified) {
            setIsEmailVerified(true);
          }
        } catch (err) {
          console.warn('Error reloading user status on focus:', err);
        }
      }
    };

    window.addEventListener('focus', checkVerificationStatus);
    document.addEventListener('visibilitychange', checkVerificationStatus);

    return () => {
      window.removeEventListener('focus', checkVerificationStatus);
      document.removeEventListener('visibilitychange', checkVerificationStatus);
    };
  }, [isApp, currentUser, isEmailVerified]);

  const handleResendVerificationEmail = async () => {
    if (!currentUser || resendCooldown > 0) return;
    try {
      auth.languageCode = 'es';
      await sendEmailVerification(currentUser, { url: 'https://app.loomisuite.net' });
      setResendCooldown(60);
      showToast('Te reenviamos el mail de confirmación. Revisá también Spam.');
    } catch (err: any) {
      console.warn('Error al reenviar email de verificación:', err);
      showToast('No pudimos reenviarlo ahora. Esperá unos minutos y probá de nuevo.');
    }
  };

  const handleCheckEmailVerified = async () => {
    if (!currentUser) return;
    try {
      await currentUser.reload();
      const updatedVerified = Boolean(auth.currentUser?.emailVerified);
      setIsEmailVerified(updatedVerified);
      if (updatedVerified) {
        showToast('¡Correo confirmado! 🎉');
      } else {
        showToast('Todavía no figura confirmado. Abrí el link del mail y volvé a intentar.');
      }
    } catch (err) {
      console.warn('Error checking verification:', err);
      showToast('Todavía no figura confirmado. Abrí el link del mail y volvé a intentar.');
    }
  };

  // Subscription state in App Mode
  const [subscriptionDoc, setSubscriptionDoc] = useState<SubscriptionDoc | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(() => isApp);

  useEffect(() => {
    if (!isApp) {
      setAuthLoading(false);
      setTenantLoading(false);
      setSubscriptionLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setTenantLoading(true);
        setSubscriptionLoading(true);
        setDemoState(getEmptyAppState());
      } else {
        setTenantLoading(false);
        setSubscriptionLoading(false);
        setSubscriptionDoc(null);
        setDemoState(getEmptyAppState());
      }
    });
    return () => unsubscribe();
  }, [isApp]);

  // Real-time Subscription doc listener in App Mode
  useEffect(() => {
    if (!isApp || !currentUser) {
      setSubscriptionDoc(null);
      setSubscriptionLoading(false);
      return;
    }
    setSubscriptionLoading(true);
    const unsubscribe = subscribeToSubscription(currentUser.uid, (doc) => {
      setSubscriptionDoc(doc);
      setSubscriptionLoading(false);
    });
    return () => unsubscribe();
  }, [isApp, currentUser]);

  const accessStatus = (isApp && currentUser) ? getAccessStatus(currentUser, subscriptionDoc) : null;
  // "Avisos al equipo" es para el plan Propietario (sin personal fijo); el plan Complejo usa Recepción y Limpieza
  const showTeamNotices = !(isApp && subscriptionDoc?.plan === 'complejo');

  // Tenant doc state in App Mode
  const [tenantDoc, setTenantDoc] = useState<TenantDoc | null>(null);

  // Pre check-ins que completan los huéspedes desde su guía (por id de reserva)
  const [precheckins, setPrecheckins] = useState<Record<string, PreCheckin>>({});
  useEffect(() => {
    if (!isApp || !currentUser) {
      setPrecheckins({});
      return;
    }
    return subscribeToPreCheckins(currentUser.uid, setPrecheckins);
  }, [isApp, currentUser]);

  // Real-time Firestore subscription in App Mode
  useEffect(() => {
    if (!isApp || !currentUser) {
      setTenantDoc(null);
      return;
    }
    const unsubscribe = subscribeToTenant(currentUser.uid, (data) => {
      if (!data.loading) {
        setTenantLoading(false);
        setTenantDoc(data.tenant);
        if (!data.exists) {
          setDemoState(getEmptyAppState());
        } else {
          if (data.tenant?.guideTemplate) {
            setGuideTemplate(data.tenant.guideTemplate);
          }
          setDemoState({
            properties: data.properties,
            reservations: data.reservations,
            cleaningTasks: data.cleaningTasks,
            templates: data.tenant?.templates || [],
            welcomeGuide: data.tenant?.welcomeGuide || getEmptyAppState().welcomeGuide,
            availableAddons: data.tenant?.availableAddons || [],
            addons: data.tenant?.availableAddons || [],
            cashMovements: data.cashMovements,
            currencySettings: data.tenant?.currencySettings || { settlementCurrency: 'ARS', rates: {} },
            managementSettings: data.tenant?.managementSettings,
            teamContacts: data.tenant?.teamContacts || [],
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    });
    return () => unsubscribe();
  }, [isApp, currentUser]);
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'superadmin' | 'guide'>(() => {
    if (isAppMode()) return 'demo';
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);

        // Si la URL apunta a /guia/... o /guide/..., renderizar de forma pública la Guía Interactiva del Huésped
        if (
          path.startsWith('/guia') ||
          path.startsWith('/guide') ||
          hash.startsWith('#/guia') ||
          hash.startsWith('#/guide') ||
          (params.has('guia') && !params.has('panel')) ||
          (params.has('guide') && !params.has('panel')) ||
          params.get('view') === 'guia' ||
          params.get('view') === 'guide'
        ) {
          return 'guide';
        }

        // Acceso por ?superadmin desactivado en la versión pública para seguridad y protección de accesos
        if (
          path.includes('/admin') ||
          path.includes('/recepcion') ||
          path.includes('/limpieza') ||
          params.has('admin') ||
          params.has('recepcion') ||
          params.has('limpieza') ||
          params.has('app') ||
          params.has('panel') ||
          params.has('demo') ||
          params.has('pms') ||
          params.has('login') ||
          params.has('ingresar') ||
          params.has('tab') ||
          params.has('reservas') ||
          params.has('booking') ||
          params.has('housekeeping') ||
          params.has('calendario') ||
          params.has('rack') ||
          params.has('onboarding') ||
          params.has('wizard') ||
          params.has('self-onboarding') ||
          params.has('configurar') ||
          params.has('import') ||
          params.has('importar') ||
          params.has('web') ||
          params.has('tu-web') ||
          params.get('view') === 'demo' ||
          params.get('view') === 'app' ||
          params.get('view') === 'panel' ||
          path.includes('/app') ||
          path.includes('/panel') ||
          path.includes('/pms') ||
          path.includes('/demo') ||
          path.includes('/login') ||
          path.includes('/ingresar') ||
          path.includes('/web') ||
          path.includes('/housekeeping') ||
          path.includes('/reservas') ||
          path.includes('/calendario') ||
          path.includes('/rack') ||
          hash.includes('app') ||
          hash.includes('panel') ||
          hash.includes('login') ||
          hash.includes('web') ||
          hash.includes('limpieza') ||
          hash.includes('recepcion') ||
          hash.includes('admin')
        ) {
          return 'demo';
        }
      }
    } catch {}
    return 'landing';
  });

  // Demo active tab: default to overview or deep linked tab
  const [demoTab, setDemoTab] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        
        if (
          params.has('guia') ||
          params.has('guide') ||
          params.has('web') ||
          params.has('tu-web') ||
          params.get('tab') === 'welcome-guide' ||
          params.get('tab') === 'web' ||
          params.get('tab') === 'tu-web' ||
          params.get('view') === 'guide' ||
          params.get('view') === 'web' ||
          path.includes('/guia') ||
          path.includes('/guide') ||
          path.includes('/web') ||
          hash.includes('guia') ||
          hash.includes('web')
        ) {
          return 'welcome-guide';
        }
        if (
          params.has('limpieza') ||
          params.has('housekeeping') ||
          params.get('tab') === 'housekeeping' ||
          path.includes('/limpieza') ||
          path.includes('/housekeeping') ||
          hash.includes('limpieza')
        ) {
          return 'housekeeping';
        }
        if (
          params.has('reservas') ||
          params.has('booking') ||
          params.get('tab') === 'direct-booking' ||
          params.get('view') === 'booking' ||
          path.includes('/reservas') ||
          path.includes('/booking') ||
          hash.includes('reservas')
        ) {
          return 'direct-booking';
        }
        if (
          params.has('calendario') ||
          params.has('rack') ||
          params.get('tab') === 'calendar' ||
          path.includes('/calendario') ||
          path.includes('/rack') ||
          hash.includes('calendario') ||
          hash.includes('rack')
        ) {
          return 'calendar';
        }
        if (params.get('tab')) {
          return params.get('tab')!;
        }
      }
    } catch {}
    return 'overview';
  });

  // Active Complex: Mi complejo
  const activeComplex = 'iguazu';

  // User Role State: 'admin' | 'frontdesk' | 'housekeeping'
  const [userRole, setUserRole] = useState<'admin' | 'frontdesk' | 'housekeeping'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        if (path.includes('/recepcion') || params.has('recepcion') || params.get('rol') === 'recepcion' || hash.includes('recepcion')) {
          return 'frontdesk';
        }
        if (path.includes('/limpieza') || path.includes('/housekeeping') || params.has('limpieza') || params.get('rol') === 'limpieza' || hash.includes('limpieza')) {
          return 'housekeeping';
        }
        if (path.includes('/admin') || params.has('admin') || params.get('rol') === 'admin' || hash.includes('admin')) {
          return 'admin';
        }
      }
      const saved = localStorage.getItem('loomi_user_role');
      if (saved === 'admin' || saved === 'frontdesk' || saved === 'housekeeping') {
        return saved as any;
      }
      return 'admin';
    } catch {
      return 'admin';
    }
  });

  const isEmployeeMode = userRole === 'housekeeping';
  const [receptionTab, setReceptionTab] = useState<'mostrador' | 'calendario'>('calendario');

  // Navigation Helpers: Open Demo / Back to Landing with PushState & Default Admin Role
  const handleOpenDemo = (tab?: string) => {
    try {
      window.history.pushState({}, '', '/demo');
    } catch {}
    setUserRole('admin');
    if (tab) {
      setDemoTab(tab);
      setMobileMode('full');
    }
    setCurrentView('demo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    if (isApp) {
      setDemoTab('overview');
      return;
    }
    try {
      window.history.pushState({}, '', '/');
    } catch {}
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize browser URL history when user navigates roles or back button
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        if (path === '/' || path === '' || path === '/index.html') {
          if (!isApp) {
            setCurrentView('landing');
            window.scrollTo(0, 0);
          } else {
            setCurrentView('demo');
            setUserRole('admin');
          }
        } else if (path.includes('/recepcion')) {
          setUserRole('frontdesk');
          setCurrentView('demo');
        } else if (path.includes('/limpieza')) {
          setUserRole('housekeeping');
          setCurrentView('demo');
        } else if (path.includes('/admin') || path.includes('/demo')) {
          setUserRole('admin');
          setCurrentView('demo');
        }
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isApp]);

  // State for WelcomeGuideHub subtab & template deep links
  const [guideSubTab, setGuideSubTab] = useState<'landing-booking' | 'guest-view' | 'admin-view'>('guest-view');
  const [guideTemplate, setGuideTemplate] = useState<any>('dos-aguas');

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

  // Mobile light mode: 'light' (clean focused UI for smartphones) vs 'full' (complete desktop dashboard)
  const [mobileMode, setMobileMode] = useState<'light' | 'full'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'light' || params.get('mobile') === 'light') return 'light';
        if (params.get('mode') === 'full' || params.get('desktop') === 'true') return 'full';
        const saved = localStorage.getItem('loomi_mobile_mode');
        if (saved === 'light' || saved === 'full') return saved;
        return window.innerWidth < 768 ? 'light' : 'full';
      }
    } catch {}
    return 'full';
  });

  const handleSetMobileMode = (mode: 'light' | 'full') => {
    setMobileMode(mode);
    try {
      localStorage.setItem('loomi_mobile_mode', mode);
    } catch {}
    showToast(mode === 'light' ? '📱 Modo Celular Light activado' : '💻 Vista Completa activada');
  };

  const handleRoleChange = (newRole: 'admin' | 'frontdesk' | 'housekeeping') => {
    setUserRole(newRole);
    try {
      localStorage.setItem('loomi_user_role', newRole);
      const newPath = newRole === 'admin' ? '/admin' : newRole === 'frontdesk' ? '/recepcion' : '/limpieza';
      window.history.pushState({}, '', newPath);
    } catch {}

    const roleNames = {
      admin: '👑 Administración (/admin)',
      frontdesk: '🛎️ Recepción Mostrador (/recepcion)',
      housekeeping: '🧹 Limpieza PWA (/limpieza)',
    };
    showToast(`Rol activo: ${roleNames[newRole]}`);
  };

  // Persistent Demo State:
  // En modo App: NUNCA se cargan datos de ejemplo (initialData) ni se lee/escribe la clave de localStorage de la demo
  const [demoState, setDemoState] = useState<DemoState>(() => (isApp ? getEmptyAppState() : getDemoState()));

  useEffect(() => {
    const active = demoState.currencySettings?.settlementCurrency || 'USD';
    setActiveCurrency(active);
  }, [demoState.currencySettings?.settlementCurrency]);

  // Requirement L.3: Debounced savePublicGuide (3 seconds)
  const isInitialPublicGuideSaveRef = React.useRef(true);

  useEffect(() => {
    if (!isApp || !currentUser || tenantLoading) return;

    const uid = currentUser.uid;
    const complexName = demoState.welcomeGuide?.propertyName || '';
    const welcomeGuide = demoState.welcomeGuide;
    const properties = demoState.properties;

    if (isInitialPublicGuideSaveRef.current) {
      isInitialPublicGuideSaveRef.current = false;
      savePublicGuide(uid, {
        complexName,
        welcomeGuide,
        guideTemplate,
        properties,
      }).catch((err) => console.warn('Error initial savePublicGuide:', err));
      return;
    }

    const timer = setTimeout(() => {
      savePublicGuide(uid, {
        complexName,
        welcomeGuide,
        guideTemplate,
        properties,
      }).catch((err) => console.warn('Error debounced savePublicGuide:', err));
    }, 3000);

    return () => clearTimeout(timer);
  }, [isApp, currentUser, tenantLoading, demoState.welcomeGuide, guideTemplate, demoState.properties]);

  // Debounced savePublicCalendar (3 seconds)
  const lastSavedPublicCalendarsRef = React.useRef<Record<string, string>>({});

  useEffect(() => {
    if (!isApp || !currentUser || tenantLoading) return;

    const uid = currentUser.uid;
    const cutoffDate = getRelativeDate(-7);
    const reservations = demoState.reservations || [];
    const properties = demoState.properties || [];

    const timer = setTimeout(() => {
      properties.forEach((unidad) => {
        const busy = reservations
          .filter(
            (r) =>
              r.propertyId === unidad.id &&
              r.status !== 'cancelled' &&
              r.checkOut >= cutoffDate
          )
          .map((r) => ({
            start: r.checkIn,
            end: r.checkOut,
            ref: r.id,
            platform: r.platform || 'direct',
          }))
          .sort((a, b) => a.start.localeCompare(b.start));

        const payload = {
          unitName: unidad.name,
          busy,
        };
        const payloadJson = JSON.stringify(payload);

        if (lastSavedPublicCalendarsRef.current[unidad.id] !== payloadJson) {
          savePublicCalendar(uid, unidad.id, payload)
            .then(() => {
              lastSavedPublicCalendarsRef.current[unidad.id] = payloadJson;
            })
            .catch((err) => console.warn('Error saving public calendar for unit:', unidad.id, err));
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isApp, currentUser, tenantLoading, demoState.reservations, demoState.properties]);

  // Ref for latest demoState so syncCalendars always reads fresh properties and reservations
  const demoStateRef = React.useRef(demoState);
  useEffect(() => {
    demoStateRef.current = demoState;
  }, [demoState]);

  // State for last iCal sync result (modo app)
  const [icalSyncState, setIcalSyncState] = useState<{
    lastSyncAt: string | null;
    errores: Array<{ propertyId: string; propertyName: string; portal: string; error: string }>;
    conflictos: Array<{ propertyId: string; unitName: string; resA: Reservation; resB: Reservation }>;
  }>({
    lastSyncAt: null,
    errores: [],
    conflictos: [],
  });

  const isSyncingRef = React.useRef(false);
  const previousConflictKeysRef = React.useRef<Set<string>>(new Set());

  const runSyncNow = async () => {
    if (!isApp || !currentUser) {
      return { agregadas: 0, actualizadas: 0, canceladas: 0, errores: [], conflictos: [] };
    }
    if (isSyncingRef.current) {
      return { agregadas: 0, actualizadas: 0, canceladas: 0, errores: [], conflictos: [] };
    }
    isSyncingRef.current = true;
    try {
      const currentProps = demoStateRef.current.properties || [];
      const currentRes = demoStateRef.current.reservations || [];
      const currentTasks = demoStateRef.current.cleaningTasks || [];

      const hasIcalUrls = currentProps.some(
        (p) => Boolean(p.icalAirbnbUrl || p.icalBookingUrl || p.icalOtherUrl || p.icalGoogleUrl)
      );

      if (!hasIcalUrls) {
        setIcalSyncState((prev) => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
        }));
        return { agregadas: 0, actualizadas: 0, canceladas: 0, errores: [], conflictos: [] };
      }

      const result = await syncCalendars(currentUser.uid, currentProps, currentRes, currentTasks);

      setIcalSyncState({
        lastSyncAt: new Date().toISOString(),
        errores: result.errores,
        conflictos: result.conflictos,
      });

      if (result.agregadas > 0 || result.actualizadas > 0 || result.canceladas > 0) {
        showToast(`Calendarios sincronizados: ${result.agregadas} nuevas, ${result.canceladas} canceladas`);
      }

      // Toast de doble reserva solo para conflictos NUEVOS
      const newConflictKeys = new Set(
        result.conflictos.map((c) => `${c.propertyId}_${c.resA.id}_${c.resB.id}`)
      );

      let hasBrandNewConflict = false;
      for (const key of newConflictKeys) {
        if (!previousConflictKeysRef.current.has(key)) {
          hasBrandNewConflict = true;
          break;
        }
      }

      if (hasBrandNewConflict && result.conflictos.length > 0) {
        const firstUnit = result.conflictos[0].unitName;
        showToast(`⚠️ Posible doble reserva en ${firstUnit}. Revisá el calendario.`);
      }

      previousConflictKeysRef.current = newConflictKeys;

      return result;
    } catch (err) {
      console.warn('Error en la sincronización de iCal:', err);
      return { agregadas: 0, actualizadas: 0, canceladas: 0, errores: [], conflictos: [] };
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isApp || !currentUser || tenantLoading) return;

    // Run 5 seconds after tenant loads
    const initialTimer = setTimeout(() => {
      runSyncNow();
    }, 5000);

    // Run every 15 minutes while app is open
    const intervalTimer = setInterval(() => {
      runSyncNow();
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isApp, currentUser, tenantLoading]);

  // Onboarding Checklist Handlers in App Mode
  const handleUpdateChecklist = async (update: { calendarios?: boolean; guia?: boolean; diaADia?: boolean }) => {
    if (!currentUser) return;
    const currentOnboarding = tenantDoc?.onboardingChecklist || {};
    const nextChecklist = {
      ...currentOnboarding,
      ...update,
    };
    setTenantDoc((prev) => (prev ? { ...prev, onboardingChecklist: nextChecklist } : null));
    try {
      await saveTenantData(currentUser.uid, { onboardingChecklist: nextChecklist });
    } catch (err) {
      console.warn('Error saving onboardingChecklist:', err);
    }
  };

  const handleDismissChecklist = async () => {
    if (!currentUser) return;
    setTenantDoc((prev) => (prev ? { ...prev, checklistDismissed: true } : null));
    try {
      await saveTenantData(currentUser.uid, { checklistDismissed: true });
    } catch (err) {
      console.warn('Error saving checklistDismissed:', err);
    }
  };

  // Active logged-in user profile
  const [loggedUser, setLoggedUser] = useState<{ name: string; email: string; complexId: string; complexName: string } | null>(() => {
    try {
      const raw = localStorage.getItem('loomi_logged_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Demo Plan Banner dismiss state (hides interactive demo pitch bar)
  const [isDemoPlanBarDismissed, setIsDemoPlanBarDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('loomi_hide_demo_plan_bar') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissDemoPlanBar = () => {
    setIsDemoPlanBarDismissed(true);
    try {
      localStorage.setItem('loomi_hide_demo_plan_bar', 'true');
    } catch {}
    showToast('Barra de demostración oculta');
  };

  const handleShowDemoPlanBar = () => {
    setIsDemoPlanBarDismissed(false);
    try {
      localStorage.removeItem('loomi_hide_demo_plan_bar');
    } catch {}
    showToast('Guía de planes demo visible');
  };

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        return (
          params.has('login') ||
          params.has('ingresar') ||
          path.includes('/login') ||
          path.includes('/ingresar') ||
          hash.includes('login') ||
          hash.includes('ingresar')
        );
      }
    } catch {}
    return false;
  });
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedPlanForLead, setSelectedPlanForLead] = useState<string | undefined>();
  const [isNewResModalOpen, setIsNewResModalOpen] = useState(false);
  const [initialPropertyForRes, setInitialPropertyForRes] = useState<string | undefined>();
  const [initialDateForRes, setInitialDateForRes] = useState<string | undefined>();
  const [selectedReservationForDetail, setSelectedReservationForDetail] = useState<Reservation | null>(null);
  // La ficha abierta siempre muestra la versión más reciente de la reserva (evita pisar cambios con datos viejos)
  const liveSelectedReservation = selectedReservationForDetail
    ? demoState.reservations.find((r) => r.id === selectedReservationForDetail.id) || selectedReservationForDetail
    : null;
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.has('onboarding') || params.has('self-onboarding') || params.has('wizard') || params.has('configurar');
      }
    } catch {}
    return false;
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.has('import') || params.has('importar');
      }
    } catch {}
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage whenever demoState changes (solo en modo demo)
  const updateDemoState = (updater: (prev: DemoState) => DemoState) => {
    setDemoState((prev) => {
      const next = updater(prev);
      if (!isApp) {
        saveDemoState(next);
      }
      return next;
    });
  };

  // Handle Onboarding Completion
  const handleCompleteOnboarding = async (data: {
    complexName: string;
    city: string;
    address: string;
    wifiNetwork: string;
    wifiPassword: string;
    properties: any[];
    addons: any[];
    settlementCurrency?: CurrencyCode;
  }) => {
    if (isApp && currentUser) {
      await initializeTenantOnboarding(
        currentUser.uid,
        currentUser.email || '',
        data.complexName,
        data.address,
        data.city,
        data.wifiNetwork,
        data.wifiPassword,
        data.properties,
        [],
        [],
        data.addons,
        { settlementCurrency: data.settlementCurrency || 'ARS', rates: {} }
      );
    } else {
      const today = getRelativeDate(0);
      const in2days = getRelativeDate(2);
      const in4days = getRelativeDate(4);

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
          guestName: isFirst ? 'Huésped de Prueba 1' : 'Huésped de Prueba 2',
          guestEmail: isFirst ? 'huesped1@gmail.com' : 'huesped2@hotmail.com',
          guestPhone: isFirst ? '+54 9 11 4455-8899' : '+54 9 351 778-9900',
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
        cleanerName: 'Sin asignar',
        cleanerPhone: '',
        status: (idx === 0 ? 'completed' : 'pending') as CleaningStatus,
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
        currencySettings: { settlementCurrency: data.settlementCurrency || 'ARS', rates: {} },
        lastUpdated: new Date().toISOString(),
      };
      updateDemoState(() => newCustomState);
    }

    setIsOnboardingModalOpen(false);
    setDemoTab('overview');
    showToast(`🎉 ¡Felicitaciones! "${data.complexName}" configurado con éxito (${data.properties.length} unidades).`);
  };

  // Reset to factory defaults
  const handleResetData = () => {
    if (isApp) {
      setDemoState(getEmptyAppState());
      showToast('Panel reiniciado.');
      return;
    }
    const fresh = resetDemoState();
    setDemoState(fresh);
    showToast('Datos ficticios restablecidos correctamente.');
  };

  // Import JSON data
  const handleImportData = async (newState: DemoState) => {
    if (isApp && currentUser) {
      for (const prop of newState.properties) {
        await savePropertyDoc(currentUser.uid, prop);
      }
      for (const res of newState.reservations) {
        await saveReservationDoc(currentUser.uid, res);
      }
      for (const task of newState.cleaningTasks) {
        await saveCleaningTaskDoc(currentUser.uid, task);
      }
      for (const mov of newState.cashMovements || []) {
        await saveCashMovementDoc(currentUser.uid, mov);
      }
      await saveTenantData(currentUser.uid, {
        welcomeGuide: newState.welcomeGuide,
        templates: newState.templates,
        availableAddons: newState.availableAddons || newState.addons,
      });
      showToast('Datos personalizados cargados y guardados en Firestore.');
    } else {
      saveDemoState(newState);
      setDemoState(newState);
      showToast('Datos personalizados cargados y guardados en localStorage.');
    }
  };

  // Handle import from Google Calendar / CSV
  // Importar el backup .json de la app anterior: unidades nuevas/actualizadas + reservas (sin duplicar)
  const handleImportLegacyBackup = async (payload: LegacyImportPayload) => {
    const { newProperties, updatedProperties, reservations, removeReservationIds, removePropertyIds } = payload;
    const removeSet = new Set(removeReservationIds);
    const removeTaskIds = demoState.cleaningTasks
      .filter((t) => (t.reservationId && removeSet.has(t.reservationId)) || t.id.startsWith('clean-legacy-'))
      .map((t) => t.id);
    const todayStr = toLocalDateStr(new Date());
    const makeCleaningTask = (r: Reservation): CleaningTask => ({
      id: `clean-legacy-${r.id}`,
      propertyId: r.propertyId,
      reservationId: r.id,
      date: r.checkOut,
      scheduledTime: '11:00 - 13:30',
      cleanerName: 'Sin asignar',
      cleanerPhone: '',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
        { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
        { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
      ],
      notes: `Generado por importación de ${r.guestName}`,
    });
    const needsCleaning = (r: Reservation) => r.status !== 'cancelled' && r.checkOut >= todayStr;

    if (isApp && currentUser) {
      const uid = currentUser.uid;
      const inChunks = async <T,>(items: T[], fn: (item: T) => Promise<void>) => {
        for (let i = 0; i < items.length; i += 20) await Promise.all(items.slice(i, i + 20).map(fn));
      };
      // Primero se borra lo anterior (mismos ids se vuelven a escribir después)
      await inChunks(removeTaskIds, (id) => deleteCleaningTaskDoc(uid, id));
      await inChunks(removeReservationIds, (id) => deleteReservationDoc(uid, id));
      await inChunks(removePropertyIds, (id) => deletePropertyDoc(uid, id));
      for (const p of [...newProperties, ...updatedProperties]) {
        await savePropertyDoc(uid, p);
      }
      // De a tandas para no saturar la conexión
      for (let i = 0; i < reservations.length; i += 20) {
        const chunk = reservations.slice(i, i + 20);
        await Promise.all(
          chunk.map(async (r) => {
            await saveReservationDoc(uid, r);
            if (needsCleaning(r)) await saveCleaningTaskDoc(uid, makeCleaningTask(r));
          })
        );
      }
    } else {
      updateDemoState((prev) => {
        const updatedById = new Map(updatedProperties.map((p) => [p.id, p]));
        const removeTaskSet = new Set(removeTaskIds);
        return {
          ...prev,
          properties: [
            ...prev.properties.filter((p) => !removePropertyIds.includes(p.id)).map((p) => updatedById.get(p.id) || p),
            ...newProperties,
          ],
          reservations: [...reservations, ...(prev.reservations || []).filter((r) => !removeSet.has(r.id))],
          cleaningTasks: [
            ...reservations.filter(needsCleaning).map(makeCleaningTask),
            ...(prev.cleaningTasks || []).filter((t) => !removeTaskSet.has(t.id)),
          ],
          lastUpdated: new Date().toISOString(),
        };
      });
    }
    showToast(
      `✅ Importadas ${reservations.length} reservas${newProperties.length ? ` y ${newProperties.length} unidades nuevas` : ''}.`
    );
  };

  // Deshacer una importación de backup: borra reservas 'legacy-', sus limpiezas y las unidades creadas por el importador
  const handleUndoLegacyImport = async () => {
    const resIds = demoState.reservations.filter((r) => r.id.startsWith('legacy-')).map((r) => r.id);
    const taskIds = demoState.cleaningTasks
      .filter((t) => t.id.startsWith('clean-legacy-') || (t.reservationId && t.reservationId.startsWith('legacy-')))
      .map((t) => t.id);
    const propIds = demoState.properties.filter((p) => p.id.startsWith('prop-import-')).map((p) => p.id);

    if (isApp && currentUser) {
      const uid = currentUser.uid;
      const runInChunks = async (ids: string[], fn: (id: string) => Promise<void>) => {
        for (let i = 0; i < ids.length; i += 20) {
          await Promise.all(ids.slice(i, i + 20).map(fn));
        }
      };
      await runInChunks(taskIds, (id) => deleteCleaningTaskDoc(uid, id));
      await runInChunks(resIds, (id) => deleteReservationDoc(uid, id));
      await runInChunks(propIds, (id) => deletePropertyDoc(uid, id));
    } else {
      updateDemoState((prev) => ({
        ...prev,
        reservations: prev.reservations.filter((r) => !resIds.includes(r.id)),
        cleaningTasks: prev.cleaningTasks.filter((t) => !taskIds.includes(t.id)),
        properties: prev.properties.filter((p) => !propIds.includes(p.id)),
        lastUpdated: new Date().toISOString(),
      }));
    }
    showToast(`Importación deshecha: se borraron ${resIds.length} reservas${propIds.length ? ` y ${propIds.length} unidades` : ''}.`);
  };

  const handleImportCalendarReservations = async (newRes: Reservation[], mode: 'add' | 'replace') => {
    if (isApp && currentUser) {
      const existingReservations = demoState.reservations || [];
      const existingIds = new Set(existingReservations.map(r => `${r.propertyId}_${r.checkIn}_${r.checkOut}`));
      const todayStr = toLocalDateStr(new Date());

      let addedCount = 0;
      for (const r of newRes) {
        const key = `${r.propertyId}_${r.checkIn}_${r.checkOut}`;
        if (existingIds.has(key)) continue; // omit duplicates

        await saveReservationDoc(currentUser.uid, r);
        addedCount++;

        if (r.checkOut >= todayStr && r.status !== 'cancelled') {
          const newCleaningTask: CleaningTask = {
            id: `clean-import-${Date.now()}-${Math.random()}`,
            propertyId: r.propertyId,
            reservationId: r.id,
            date: r.checkOut,
            scheduledTime: '11:00 - 13:30',
            cleanerName: 'Sin asignar',
            cleanerPhone: '',
            status: 'pending',
            checklist: [
              { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
              { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
              { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
              { id: 'c4', task: 'Comprobación de cerradura inteligente', completed: false },
            ],
            notes: `Generado automáticamente por importación de ${r.guestName}`,
          };
          await saveCleaningTaskDoc(currentUser.uid, newCleaningTask);
        }
      }
      showToast(`🎉 ¡Éxito! Se importaron ${addedCount} nuevas reservas a Firestore.`);
    } else {
      updateDemoState((prev) => {
        let finalReservations = [...(prev.reservations || [])];
        if (mode === 'replace') {
          finalReservations = newRes;
        } else {
          // Mode 'add' - filter duplicates or keep existing and append new ones
          const existingIds = new Set((prev.reservations || []).map(r => `${r.propertyId}_${r.checkIn}_${r.checkOut}`));
          const filterNew = newRes.filter(r => !existingIds.has(`${r.propertyId}_${r.checkIn}_${r.checkOut}`));
          finalReservations = [...filterNew, ...(prev.reservations || [])];
        }

        // Automatically create cleaning tasks for upcoming / active reservations
        const todayStr = toLocalDateStr(new Date());
        const activeForCleaning = newRes.filter(r => r.checkOut >= todayStr);

        const newCleaningTasks = activeForCleaning.map((r) => ({
          id: `clean-import-${Date.now()}-${Math.random()}`,
          propertyId: r.propertyId,
          reservationId: r.id,
          date: r.checkOut,
          scheduledTime: '11:00 - 13:30',
          cleanerName: 'Sin asignar',
          cleanerPhone: '',
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
          : [...newCleaningTasks, ...(prev.cleaningTasks || [])];

        return {
          ...prev,
          reservations: finalReservations,
          cleaningTasks: finalCleaningTasks,
          lastUpdated: new Date().toISOString(),
        };
      });

      showToast(`🎉 ¡Éxito! Se procesaron e importaron ${newRes.length} reservas correctamente.`);
    }
  };

  // New Reservation creation
  const handleSaveReservation = async (newRes: Reservation) => {
    const newCleaningTask: CleaningTask = {
      id: `clean-${Date.now()}`,
      propertyId: newRes.propertyId,
      reservationId: newRes.id,
      date: newRes.checkOut,
      scheduledTime: '11:00 - 13:30',
      cleanerName: 'Sin asignar',
      cleanerPhone: '',
      status: 'pending',
      checklist: [
        { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
        { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
        { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
        { id: 'c4', task: 'Comprobación de cerradura inteligente', completed: false },
      ],
      notes: `Generado automáticamente por check-out de ${newRes.guestName}`,
    };

    if (isApp && currentUser) {
      await saveReservationDoc(currentUser.uid, newRes);
      await saveCleaningTaskDoc(currentUser.uid, newCleaningTask);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        reservations: [newRes, ...prev.reservations],
        cleaningTasks: [newCleaningTask, ...prev.cleaningTasks],
        lastUpdated: new Date().toISOString(),
      }));
    }

    showToast(`¡Reserva de ${newRes.guestName} creada y sincronizada!`);
  };

  // Update full reservation details
  const handleUpdateReservation = async (updatedRes: Reservation) => {
    if (isApp && currentUser) {
      await saveReservationDoc(currentUser.uid, updatedRes);
      const existingTask = demoState.cleaningTasks.find((t) => t.reservationId === updatedRes.id);
      if (existingTask) {
        await saveCleaningTaskDoc(currentUser.uid, {
          ...existingTask,
          propertyId: updatedRes.propertyId,
          date: updatedRes.checkOut,
          notes: `Generado automáticamente por check-out de ${updatedRes.guestName}`,
        });
      }
    } else {
      updateDemoState((prev) => ({
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === updatedRes.id ? updatedRes : r
        ),
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
    }
    setSelectedReservationForDetail(updatedRes);
    showToast(`Reserva de ${updatedRes.guestName} guardada y actualizada.`);
  };

  // Avisos al equipo: contactos y marca de "avisado"
  const handleSaveTeamContacts = async (contacts: TeamContact[]) => {
    if (isApp && currentUser) {
      await saveTenantData(currentUser.uid, { teamContacts: contacts });
    }
    updateDemoState((prev) => ({ ...prev, teamContacts: contacts, lastUpdated: new Date().toISOString() }));
    showToast('Contactos guardados');
  };

  const handleMarkTeamNotified = async (resId: string, contactKey: string) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (!res) return;
    const updated: Reservation = {
      ...res,
      teamNotified: { ...(res.teamNotified || {}), [contactKey]: new Date().toISOString() },
    };
    if (isApp && currentUser) {
      await saveReservationDoc(currentUser.uid, updated);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        reservations: prev.reservations.map((r) => (r.id === resId ? updated : r)),
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = async (resId: string, newStatus: ReservationStatus) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      const updated = { ...res, status: newStatus };
      if (isApp && currentUser) {
        await saveReservationDoc(currentUser.uid, updated);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((r) =>
            r.id === resId ? updated : r
          ),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
    showToast(`Estado de reserva actualizado a ${newStatus}`);
  };

  // Update payment status (e.g. from Mobile Light quick action)
  const handleUpdatePaymentStatus = async (resId: string, newPaymentStatus: PaymentStatus) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      const updated = { ...res, paymentStatus: newPaymentStatus };
      if (isApp && currentUser) {
        await saveReservationDoc(currentUser.uid, updated);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((r) =>
            r.id === resId ? updated : r
          ),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
    showToast(
      `Estado de cobro actualizado a: ${
        newPaymentStatus === 'paid'
          ? '100% Abonado'
          : newPaymentStatus === 'deposit_only'
          ? 'Seña 50% Recibida'
          : 'Pendiente'
      }`
    );
  };

  // Update reservation price (e.g. for iCal blocks or manual adjustments across any channel)
  const handleUpdateReservationPrice = async (resId: string, newTotal: number) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      let rate = 0;
      if (res.platform === 'airbnb') {
        rate = res.airbnbFeeMode === 'traditional_3' ? 0.03 : 0.15;
      } else if (res.platform === 'booking' || res.platform === 'vrbo') {
        rate = 0.15;
      }
      const accommodation = Math.max(0, newTotal - (res.cleaningFee || 0));
      const commissionPaid = Math.round(accommodation * rate * 10) / 10;
      const netRevenue = Math.round((newTotal - commissionPaid) * 10) / 10;
      const updated = {
        ...res,
        totalAmount: newTotal,
        commissionPaid,
        netRevenue,
      };
      if (isApp && currentUser) {
        await saveReservationDoc(currentUser.uid, updated);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((r) => (r.id === resId ? updated : r)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
    showToast(`Tarifa de la reserva actualizada a ${formatCurrency(newTotal)}.`);
  };

  // Delete reservation
  const handleDeleteReservation = async (resId: string) => {
    if (isApp && currentUser) {
      await deleteReservationDoc(currentUser.uid, resId);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        reservations: prev.reservations.filter((r) => r.id !== resId),
        lastUpdated: new Date().toISOString(),
      }));
    }
    showToast('Reserva eliminada del calendario.');
  };

  // Toggle housekeeping item
  const handleToggleChecklistItem = async (taskId: string, itemId: string) => {
    const task = demoState.cleaningTasks.find((t) => t.id === taskId);
    if (task) {
      const updatedChecklist = task.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      const allDone = updatedChecklist.length > 0 && updatedChecklist.every((i) => i.completed);
      const newStatus: CleaningStatus = allDone
        ? 'inspected'
        : task.status === 'inspected' || task.status === 'completed'
        ? 'in_progress'
        : task.status;
      const updatedTask: CleaningTask = { ...task, checklist: updatedChecklist, status: newStatus };
      if (isApp && currentUser) {
        await saveCleaningTaskDoc(currentUser.uid, updatedTask);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          cleaningTasks: prev.cleaningTasks.map((t) => (t.id === taskId ? updatedTask : t)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
  };

  // Update cleaning task status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: CleaningTask['status']) => {
    const task = demoState.cleaningTasks.find((t) => t.id === taskId);
    if (task) {
      const isNowDone = newStatus === 'inspected' || newStatus === 'completed';
      const isNowPending = newStatus === 'pending';
      const updatedChecklist = isNowDone
        ? task.checklist.map((c) => ({ ...c, completed: true }))
        : isNowPending
        ? task.checklist.map((c) => ({ ...c, completed: false }))
        : task.checklist;
      const updatedTask = { ...task, status: newStatus, checklist: updatedChecklist };
      if (isApp && currentUser) {
        await saveCleaningTaskDoc(currentUser.uid, updatedTask);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          cleaningTasks: prev.cleaningTasks.map((t) => (t.id === taskId ? updatedTask : t)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
    showToast(
      newStatus === 'inspected' || newStatus === 'completed'
        ? '✨ Tarea Completada: Unidad lista para el huésped'
        : `Estado de limpieza actualizado a: ${newStatus}`
    );
  };

  // Update property price
  const handleUpdatePropertyPrice = async (propertyId: string, newPrice: number) => {
    const prop = demoState.properties.find((p) => p.id === propertyId);
    if (prop) {
      const updated = { ...prop, basePrice: newPrice };
      if (isApp && currentUser) {
        await savePropertyDoc(currentUser.uid, updated);
      } else {
        updateDemoState((prev) => ({
          ...prev,
          properties: prev.properties.map((p) => (p.id === propertyId ? updated : p)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
    showToast(`Tarifa por noche actualizada a ${formatCurrency(newPrice)}`);
  };

  const handleSaveProperty = async (property: Property) => {
    if (isApp && currentUser) {
      await savePropertyDoc(currentUser.uid, property);
    } else {
      updateDemoState((prev) => {
        const exists = prev.properties.some((p) => p.id === property.id);
        const newProps = exists
          ? prev.properties.map((p) => (p.id === property.id ? property : p))
          : [...prev.properties, property];
        return {
          ...prev,
          properties: newProps,
          lastUpdated: new Date().toISOString(),
        };
      });
    }
    showToast(`Unidad "${property.name}" guardada correctamente`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const todayStr = toLocalDateStr(new Date());
    const hasFuture = (demoState.reservations || []).some(
      (r) => r.propertyId === propertyId && r.checkOut >= todayStr
    );
    if (hasFuture) {
      showToast('❌ No se puede borrar la unidad porque tiene reservas futuras.');
      return;
    }
    if (isApp && currentUser) {
      await deletePropertyDoc(currentUser.uid, propertyId);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        properties: prev.properties.filter((p) => p.id !== propertyId),
        lastUpdated: new Date().toISOString(),
      }));
    }
    showToast('Unidad eliminada correctamente');
  };

  // Add Cash Movement / Gasto
  const handleAddCashMovement = async (newMov: Omit<CashMovement, 'id' | 'date'>) => {
    const dateStr = toLocalDateStr(new Date());
    const added: CashMovement = {
      ...newMov,
      id: `mov-${Date.now()}`,
      date: dateStr,
    };
    if (isApp && currentUser) {
      await saveCashMovementDoc(currentUser.uid, added);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        cashMovements: [added, ...(prev.cashMovements || [])],
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  // Delete Cash Movement / Gasto
  const handleDeleteCashMovement = async (id: string) => {
    if (isApp && currentUser) {
      await deleteCashMovementDoc(currentUser.uid, id);
    } else {
      updateDemoState((prev) => ({
        ...prev,
        cashMovements: (prev.cashMovements || []).filter((m) => m.id !== id),
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  // Quick check in
  const handleQuickCheckIn = (resId: string) => {
    handleUpdateReservationStatus(resId, 'checked_in');
  };

  // Handle open messages directly for guest
  // Reserva elegida desde una ficha para abrir Avisos & WhatsApp con ese huésped ya seleccionado
  const [messagesTarget, setMessagesTarget] = useState<{ resId: string; nonce: number } | null>(null);
  const handleOpenMessagesWithGuest = (resId: string) => {
    setMessagesTarget({ resId, nonce: Date.now() });
    setDemoTab('messages');
  };

  // Open calendar slot
  const handleOpenNewReservationWithProperty = (propId: string, date: string) => {
    setInitialPropertyForRes(propId);
    setInitialDateForRes(date);
    setIsNewResModalOpen(true);
  };

  const pendingCleaningsCount = getCleaningsForDay(demoState.cleaningTasks).filter(
    (c) => c.status !== 'completed' && c.status !== 'inspected'
  ).length;

  const handleSelectComplex = (_complexId: string, isNew?: boolean) => {
    setCurrentView('demo');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const raw = localStorage.getItem('loomi_logged_user');
      setLoggedUser(raw ? JSON.parse(raw) : null);
      
      const freshState = getDemoState();
      setDemoState(freshState);
    } catch (e) {
      console.warn('Error syncing newly selected complex state:', e);
    }

    if (isNew) {
      showToast('🎉 Complejo creado. ¡Comencemos el asistente de configuración!');
      setIsOnboardingModalOpen(true);
    } else {
      showToast('Sesión iniciada correctamente');
    }
  };

  const handleLogout = async () => {
    if (isApp) {
      try {
        await signOut(auth);
        setCurrentUser(null);
        setTenantDoc(null);
        setDemoState(getEmptyAppState());
        setTenantLoading(false);
        setIsOnboardingModalOpen(false);
        setIsNewResModalOpen(false);
        setSelectedReservationForDetail(null);
        setIsJsonModalOpen(false);
        setIsImportModalOpen(false);
        setIsLeadModalOpen(false);
        setIsAuthModalOpen(false);
        showToast('Sesión cerrada con éxito');
      } catch (err) {
        console.warn('Error signing out:', err);
      }
      return;
    }
    try {
      localStorage.removeItem('loomi_logged_user');
      localStorage.removeItem('loomi_active_complex');
      localStorage.removeItem('loomi_demo_state');
    } catch {}
    setLoggedUser(null);
    const fresh = resetDemoState();
    setDemoState(fresh);
    showToast('Sesión cerrada. Volviendo a la demo.');
  };

  // Los modales se montan recién la primera vez que se abren (y quedan montados para no perder su estado)
  const [everOpened, setEverOpened] = useState({ newRes: false, detail: false, json: false, onboarding: false, importCal: false, auth: false });
  useEffect(() => {
    setEverOpened((prev) => {
      const next = {
        newRes: prev.newRes || isNewResModalOpen,
        detail: prev.detail || !!selectedReservationForDetail,
        json: prev.json || isJsonModalOpen,
        onboarding: prev.onboarding || isOnboardingModalOpen,
        importCal: prev.importCal || isImportModalOpen,
        auth: prev.auth || isAuthModalOpen,
      };
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [isNewResModalOpen, selectedReservationForDetail, isJsonModalOpen, isOnboardingModalOpen, isImportModalOpen, isAuthModalOpen]);

  // Fuera de la landing, precargar en segundo plano las pantallas diferidas para que cambiar de pestaña sea instantáneo
  useEffect(() => {
    if (!isApp && currentView === 'landing') return;
    const t = setTimeout(() => {
      [
        () => import('./components/demo/DemoCalendar'),
        () => import('./components/demo/ReservationDetailModal'),
        () => import('./components/demo/NewReservationModal'),
        () => import('./components/demo/DemoMessages'),
        () => import('./components/demo/DemoFinances'),
        () => import('./components/demo/DemoBookingsList'),
        () => import('./components/demo/TeamNotices'),
        () => import('./components/guide/WelcomeGuideHub'),
        () => import('./components/xenia/XeniaCopilotView'),
        () => import('./components/roles/ReceptionView'),
        () => import('./components/demo/CalendarImportModal'),
      ].forEach((load) => load().catch(() => {}));
    }, 1500);
    return () => clearTimeout(t);
  }, [isApp, currentView]);

  // Loading simple en modo App mientras se verifica la sesión o se cargan los datos del complejo / suscripción
  if (isApp && (authLoading || (currentUser && (tenantLoading || subscriptionLoading)))) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F17] text-white flex flex-col items-center justify-center p-4 selection:bg-[#E67E22]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E67E22] to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 animate-pulse">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold tracking-tight text-white">Loomi Suite</p>
            <p className="text-xs text-slate-400">
              {authLoading ? 'Verificando sesión...' : 'Cargando tu complejo…'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de autenticación completa de Firebase en modo App si no inició sesión
  if (isApp && !currentUser) {
    return <AppAuthScreen onSuccess={() => {}} />;
  }

  // Pantalla de prueba finalizada si la prueba de 7 días expiró
  if (isApp && currentUser && accessStatus?.state === 'expired') {
    return (
      <TrialEndedScreen
        email={currentUser.email || ''}
        onSignOut={handleLogout}
      />
    );
  }

  // Pantalla de bienvenida y primeros pasos en modo App la primera vez que entra
  if (isApp && currentUser && !tenantDoc?.welcomeSeen) {
    return (
      <WelcomeScreen
        onOpenXenia={async () => {
          try {
            await saveTenantData(currentUser.uid, { welcomeSeen: true });
          } catch (err) {
            console.warn('Error saving welcomeSeen:', err);
          }
          setTenantDoc((prev) => ({
            ownerEmail: currentUser.email || '',
            ...(prev || {}),
            welcomeSeen: true,
          }));
          setDemoTab('xenia');
        }}
        onStart={async () => {
          try {
            await saveTenantData(currentUser.uid, { welcomeSeen: true });
            setTenantDoc((prev) => ({
              ownerEmail: currentUser.email || '',
              ...(prev || {}),
              welcomeSeen: true,
            }));
          } catch (err) {
            console.warn('Error saving welcomeSeen:', err);
          }
          if (!demoState.properties || demoState.properties.length === 0) {
            setIsOnboardingModalOpen(true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-rose-500 selection:text-white transition-colors">
      {/* Barra superior fina para prueba gratis */}
      {isApp && accessStatus?.state === 'trial' && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 py-1.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 relative z-50">
          <span>
            {accessStatus.daysLeft === 1
              ? 'Último día de prueba gratis'
              : `Te quedan ${accessStatus.daysLeft} días de prueba gratis`}
          </span>
          <span>·</span>
          <a
            href={`https://api.whatsapp.com/send?phone=5491140925939&text=${encodeURIComponent(
              `Hola, quiero activar mi plan de Loomi Suite. Mi email: ${currentUser?.email || ''}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline text-amber-950 dark:text-amber-300 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            Activar plan
          </a>
        </div>
      )}

      {/* Aviso fino de confirmación de correo electrónico */}
      {isApp && currentUser && !isEmailVerified && (
        <div className="bg-sky-50 border-b border-sky-200 text-sky-900 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-200 py-2 px-4 text-xs font-medium flex flex-wrap items-center justify-between gap-2 relative z-50 transition-colors">
          <span>
            📩 Confirmá tu correo ({currentUser.email || ''}) para poder recuperar tu contraseña si la olvidás.
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResendVerificationEmail}
              disabled={resendCooldown > 0}
              className="px-2.5 py-1 rounded-lg bg-sky-200/70 dark:bg-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/30 text-sky-900 dark:text-sky-200 font-semibold text-[11px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {resendCooldown > 0 ? `Reenviar mail (${resendCooldown}s)` : 'Reenviar mail'}
            </button>
            <button
              onClick={handleCheckEmailVerified}
              className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
            >
              Ya lo confirmé
            </button>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RENDER VIEW: LANDING, SUPERADMIN OR DEMO PMS */}
      {currentView === 'landing' ? (
        <main className="bg-[#F8F9FA] dark:bg-[#0E0F12] min-h-screen transition-colors text-[#2D3748] dark:text-[#E2E8F0] relative">
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenLogin={() => {
              window.location.href = 'https://app.loomisuite.net';
            }}
            onOpenDemo={() => handleOpenDemo()}
            onOpenContact={() => {
              setSelectedPlanForLead(undefined);
              setIsLeadModalOpen(true);
            }}
          />

          <BentoLanding
            theme={theme}
            onOpenDemo={(tab) => handleOpenDemo(tab)}
            onOpenContact={(planOrTopic) => {
              setSelectedPlanForLead(planOrTopic || 'Consulta General');
              setIsLeadModalOpen(true);
            }}
            onOpenLogin={() => {
              window.location.href = 'https://app.loomisuite.net';
            }}
          />

          <ManualLeadMagnet />

          <Footer
            onOpenDemo={() => handleOpenDemo()}
            onOpenContact={() => {
              setSelectedPlanForLead(undefined);
              setIsLeadModalOpen(true);
            }}
          />
        </main>
      ) : currentView === 'guide' ? (
        /* VISTA PÚBLICA INTERACTIVA DE LA GUÍA DEL HUÉSPED (/guia/...) */
        <div className="min-h-screen bg-[#18191E] py-4 sm:py-8 px-2 sm:px-4">
          <GuestWelcomePortal
            guideData={demoState.welcomeGuide || INITIAL_WELCOME_GUIDE}
            isMobilePreview={false}
            isPublicView={true}
            template={guideTemplate}
            unitName={
              typeof window !== 'undefined'
                ? (() => {
                    const params = new URLSearchParams(window.location.search);
                    const unitParam = params.get('unidad') || params.get('depto') || params.get('unit') || params.get('propiedad');
                    if (unitParam) return unitParam;
                    const pathname = window.location.pathname;
                    const matchedProp = demoState.properties.find((p) => pathname.includes(p.id));
                    return matchedProp ? matchedProp.name : undefined;
                  })()
                : undefined
            }
          />
        </div>
      ) : currentView === 'superadmin' ? (
        /* SUPERADMIN MASTER VIEW FOR PLATFORM OWNER */
        <SuperAdminView
          onBackToLanding={() => setCurrentView('landing')}
          onOpenComplexAsAdmin={(complexId) => {
            handleSelectComplex(complexId, false);
            showToast(`👑 Accediendo al complejo como SuperAdmin (${complexId})`);
          }}
          onOpenNewComplexModal={() => setIsAuthModalOpen(true)}
          currentComplexId={activeComplex}
          theme={theme}
        />
      ) : userRole === 'housekeeping' ? (
        /* VISTA HOUSEKEEPING / MUCAMAS: ULTRALIVIANA PWA PARA SMARTPHONE (/limpieza) */
        <HousekeepingMobileView
          demoState={demoState}
          onToggleChecklistItem={handleToggleChecklistItem}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onSwitchRole={handleRoleChange}
          complexName={demoState.welcomeGuide?.propertyName || 'Mi complejo'}
        />
      ) : userRole === 'frontdesk' ? (
        /* VISTA RECEPCIÓN / MOSTRADOR: OPTIMIZADA PARA PC / TABLET (/recepcion) */
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0F12] text-stone-800 dark:text-stone-100 font-sans transition-colors">
          {/* Pestañas de recepción: Mostrador / Calendario */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 flex items-center justify-between gap-2">
            <div className="inline-flex gap-1 bg-white dark:bg-[#18191E] border border-stone-200 dark:border-zinc-800 p-1 rounded-2xl">
              {([
                ['mostrador', '🛎️ Mostrador'],
                ['calendario', '📅 Calendario'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReceptionTab(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                    receptionTab === key
                      ? 'bg-[#E67E22] text-white'
                      : 'text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className="px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer bg-white dark:bg-[#18191E] border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Volver a Administración"
              aria-label="Volver a Administración"
            >
              👑<span className="hidden sm:inline"> Administración</span>
            </button>
          </div>
          {receptionTab === 'calendario' ? (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <DemoCalendar
                demoState={demoState}
                onSelectReservation={setSelectedReservationForDetail}
                onOpenNewReservationWithProperty={handleOpenNewReservationWithProperty}
                isAppMode={isApp}
                icalSyncState={icalSyncState}
                onRunSyncNow={runSyncNow}
              />
            </div>
          ) : (
          <ReceptionView
            demoState={demoState}
            onSelectReservation={setSelectedReservationForDetail}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onAddCashMovement={handleAddCashMovement}
            onQuickCheckIn={handleQuickCheckIn}
            onSwitchRole={handleRoleChange}
            onOpenNewReservation={() => {
              setInitialPropertyForRes(undefined);
              setInitialDateForRes(undefined);
              setIsNewResModalOpen(true);
            }}
            complexName={demoState.welcomeGuide?.propertyName || 'Mi complejo'}
            precheckins={precheckins}
          />
          )}
        </div>
      ) : mobileMode === 'light' ? (
        /* ULTRA-CLEAN MOBILE LIGHT / POCKET VIEW FOR SMARTPHONES */
        <MobileLightView
          demoState={demoState}
          onOpenReservationDetail={(res) => setSelectedReservationForDetail(res)}
          onOpenNewReservation={() => {
            setInitialPropertyForRes(undefined);
            setInitialDateForRes(undefined);
            setIsNewResModalOpen(true);
          }}
          onUpdateReservationStatus={handleUpdateReservationStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onToggleCleaningStatus={(taskId, currentStatus) =>
            handleUpdateTaskStatus(
              taskId,
              currentStatus === 'completed' || currentStatus === 'inspected' ? 'pending' : 'inspected'
            )
          }
          onOpenMessagesWithGuest={(resId) => {
            setDemoTab('messages');
            handleSetMobileMode('full');
          }}
          onSwitchToFullView={() => handleSetMobileMode('full')}
          theme={theme}
          onToggleTheme={toggleTheme}
          complexName={demoState.welcomeGuide?.propertyName || 'Mi complejo'}
          onLogout={handleLogout}
          isAppMode={isApp}
          onBackToLanding={handleBackToLanding}
          userRole={userRole}
          onSwitchRole={handleRoleChange}
          teamNoticesNode={
            showTeamNotices && userRole === 'admin' ? (
              <TeamNotices
                demoState={demoState}
                isApp={isApp}
                onSaveContacts={handleSaveTeamContacts}
                onMarkNotified={handleMarkTeamNotified}
                precheckins={precheckins}
                compact
              />
            ) : undefined
          }
        />
      ) : (
        /* DUEÑO / ADMINISTRADOR: CONTROL TOTAL DE ESCRITORIO (/admin) */
        <div className="min-h-screen flex bg-[#F8F9FA] dark:bg-[#0E0F12] text-stone-800 dark:text-stone-100 font-sans transition-colors">
          {/* Minimalist Sidebar */}
          <CleanSidebar
            activeTab={demoTab}
            onSelectTab={setDemoTab}
            pendingCleaningsCount={pendingCleaningsCount}
            complexName={demoState.welcomeGuide?.propertyName || 'Mi complejo'}
            onOpenNewReservation={() => {
              setInitialPropertyForRes(undefined);
              setInitialDateForRes(undefined);
              setIsNewResModalOpen(true);
            }}
            onOpenOnboardingWizard={() => setIsOnboardingModalOpen(true)}
            isEmployeeMode={isEmployeeMode}
            userRole={userRole}
            onChangeRole={handleRoleChange}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToLanding={handleBackToLanding}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            showTeamNotices={showTeamNotices}
            loggedUser={isApp && currentUser ? { name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario', email: currentUser.email || '', complexId: 'app-user', complexName: demoState.welcomeGuide?.propertyName || 'Mi complejo' } : loggedUser}
            onLogout={handleLogout}
            isAppMode={isApp}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] dark:bg-[#0E0F12] overflow-y-auto transition-colors">
            {/* Minimalist Architectural Top Sub-bar with fast actions & status */}
            <div className="h-14 border-b border-stone-200/80 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between bg-white/90 dark:bg-[#0E0F12]/90 sticky top-0 z-40 backdrop-blur-md transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                {!isApp && (
                  <button
                    onClick={handleBackToLanding}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 transition-colors cursor-pointer mr-0.5 shadow-2xs"
                    title="Volver a la landing"
                  >
                    <span>← Inicio</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-zinc-800 hover:border-orange-300 border border-stone-200/80 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Abrir menú de navegación"
                >
                  <Menu className="w-4 h-4 text-[#E67E22]" />
                  <span>Menú</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate max-w-[140px] sm:max-w-none">
                    {demoState.welcomeGuide?.propertyName || 'Mi complejo'}
                  </span>
                </div>
                <span className="text-stone-300 dark:text-zinc-700">/</span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
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
                    : demoTab === 'direct-booking'
                    ? 'Tu Web Directa'
                    : demoTab === 'properties'
                    ? (isApp ? 'Unidades' : 'Cabañas')
                    : demoTab === 'addons'
                    ? 'Opcionales'
                    : demoTab === 'messages'
                    ? 'Avisos & WhatsApp'
                    : demoTab === 'team-notices'
                    ? 'Avisos al equipo'
                    : 'Asistente'}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Accesos Rápidos por Rol (Dueño / Recepción / Mucamas) */}
                <div className="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs border border-stone-200/70 dark:border-zinc-700/60">
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-700 text-[#E67E22] shadow-2xs cursor-pointer"
                    title="Dueño / Administrador (/admin): Control total"
                  >
                    👑 Administración
                  </button>
                  <button
                    onClick={() => handleRoleChange('frontdesk')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
                    title="Recepción (/recepcion): Mostrador PC/tablet"
                  >
                    🛎️ Recepción
                  </button>
                  <button
                    onClick={() => handleRoleChange('housekeeping')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
                    title="Housekeeping (/limpieza): PWA Smartphone"
                  >
                    🧹 Limpieza
                  </button>
                </div>

                {/* Switch to Mobile Light View */}
                <button
                  onClick={() => handleSetMobileMode('light')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-200 hover:border-orange-300 hover:text-[#E67E22] transition-colors cursor-pointer shadow-2xs"
                  title="Cambiar a Versión Celular Light"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#E67E22]" />
                  <span className="hidden sm:inline">Modo Celular Ágil</span>
                  <span className="sm:hidden">Light</span>
                </button>

                {/* Visible Light / Dark Switcher in top sub-bar */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-stone-200 hover:border-stone-300 transition-colors cursor-pointer shadow-2xs"
                  title="Cambiar tema"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-stone-600" />
                      <span className="hidden sm:inline">Modo Oscuro</span>
                    </>
                  )}
                </button>

                {isApp ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 dark:text-zinc-400 font-medium hidden sm:inline truncate max-w-[200px]">
                      {currentUser?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Cerrar sesión en Loomi Suite"
                    >
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : loggedUser ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-900/50 text-xs font-semibold text-[#E67E22]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                    <span className="truncate max-w-[140px]">{loggedUser.name}</span>
                  </div>
                ) : (
                  <>
                    {isDemoPlanBarDismissed && (
                      <button
                        onClick={handleShowDemoPlanBar}
                        className="text-xs font-medium text-stone-600 hover:text-[#E67E22] dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                        title="Ver guía y simulador de planes"
                      >
                        <span>💡 Guía Planes</span>
                      </button>
                    )}
                    <button
                      onClick={handleResetData}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer hidden md:inline"
                    >
                      Restablecer
                    </button>
                    <span className="text-stone-300 dark:text-zinc-800 hidden md:inline">|</span>
                    <button
                      onClick={() => {
                        setSelectedPlanForLead('Plan Loomi ($45.000/mes)');
                        setIsLeadModalOpen(true);
                      }}
                      className="bg-white hover:bg-stone-50 text-stone-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-stone-200 border border-stone-200/80 dark:border-zinc-800 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Solicitar plan o activación real"
                    >
                      <span>🚀 Plan</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setInitialPropertyForRes(undefined);
                    setInitialDateForRes(undefined);
                    setIsNewResModalOpen(true);
                  }}
                  className="bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>+ Nueva Reserva</span>
                </button>
              </div>
            </div>

            {/* Atajo para volver a "Primeros pasos" mientras la carga inicial no está terminada */}
            {isApp &&
              demoTab !== 'overview' &&
              !tenantDoc?.checklistDismissed &&
              (() => {
                const progress = getFirstStepsStatus({
                  welcomeGuide: demoState.welcomeGuide,
                  properties: demoState.properties,
                  reservations: demoState.reservations,
                  onboardingChecklist: tenantDoc?.onboardingChecklist,
                });
                if (progress.completedCount >= progress.total) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setDemoTab('overview')}
                    className="fixed bottom-5 left-4 sm:left-6 z-40 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-amber-600/40 cursor-pointer transition-colors"
                    title="Volver a la lista de Primeros pasos"
                  >
                    <span aria-hidden>←</span>
                    <span>
                      Primeros pasos · {progress.completedCount} de {progress.total}
                    </span>
                  </button>
                );
              })()}

            {/* Main Content Body: Real System Dashboard Exactly as on PC */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3.5 sm:py-5">
              <Suspense
                fallback={
                  <div className="py-24 flex justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-[#E67E22] border-t-transparent animate-spin" />
                  </div>
                }
              >
              {demoTab === 'overview' && (
                <>
                  {isApp && (
                    <FirstStepsChecklist
                      welcomeGuide={demoState.welcomeGuide}
                      properties={demoState.properties}
                      reservations={demoState.reservations}
                      onboardingChecklist={tenantDoc?.onboardingChecklist}
                      checklistDismissed={tenantDoc?.checklistDismissed}
                      onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
                      onNavigateToProperties={() => setDemoTab('properties')}
                      onNavigateToCalendar={() => setDemoTab('calendar')}
                      onNavigateToGuide={() => setDemoTab('welcome-guide')}
                      onUpdateChecklist={handleUpdateChecklist}
                      onDismissChecklist={handleDismissChecklist}
                    />
                  )}
                  <CleanToday
                    demoState={demoState}
                    userRole={userRole}
                    onSelectReservation={setSelectedReservationForDetail}
                    onOpenNewReservation={() => {
                      setInitialPropertyForRes(undefined);
                      setInitialDateForRes(undefined);
                      setIsNewResModalOpen(true);
                    }}
                    onNavigateTab={setDemoTab}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onQuickCheckIn={handleQuickCheckIn}
                    onOpenOnboardingWizard={() => setIsOnboardingModalOpen(true)}
                    onRequestPlan={() => {
                      setSelectedPlanForLead('Plan Loomi ($45.000/mes)');
                      setIsLeadModalOpen(true);
                    }}
                    isEmployeeMode={isEmployeeMode}
                    isLoggedIn={!!loggedUser}
                    isAppMode={isApp}
                    icalSyncState={icalSyncState}
                  />
                </>
              )}

              {demoTab === 'calendar' && (
                <DemoCalendar
                  demoState={demoState}
                  onSelectReservation={setSelectedReservationForDetail}
                  onOpenNewReservationWithProperty={handleOpenNewReservationWithProperty}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  isAppMode={isApp}
                  icalSyncState={icalSyncState}
                  onRunSyncNow={runSyncNow}
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
                  onSaveProperty={handleSaveProperty}
                  onDeleteProperty={handleDeleteProperty}
                  isEmployeeMode={isEmployeeMode}
                />
              )}

              {demoTab === 'addons' && (
                <DemoAddons
                  demoState={demoState}
                  onUpdateAddons={async (updatedAddons) => {
                    if (isApp && currentUser) {
                      await saveTenantData(currentUser.uid, { availableAddons: updatedAddons });
                    } else {
                      updateDemoState((prev) => ({
                        ...prev,
                        addons: updatedAddons,
                        lastUpdated: new Date().toISOString(),
                      }));
                    }
                    showToast('Catálogo de Servicios Opcionales actualizado');
                  }}
                  isEmployeeMode={isEmployeeMode}
                />
              )}

              {demoTab === 'messages' && (
                <DemoMessages demoState={demoState} uid={currentUser?.uid} target={messagesTarget} />
              )}

              {demoTab === 'team-notices' && showTeamNotices && (
                <TeamNotices
                  demoState={demoState}
                  isApp={isApp}
                  onSaveContacts={handleSaveTeamContacts}
                  onMarkNotified={handleMarkTeamNotified}
                  precheckins={precheckins}
                />
              )}

              {demoTab === 'finances' && userRole === 'admin' && (
                <DemoFinances
                  demoState={demoState}
                  onUpdateCurrencySettings={async (settings) => {
                    if (isApp && currentUser) {
                      await saveCurrencySettingsDoc(currentUser.uid, settings);
                    } else {
                      updateDemoState((prev) => ({
                        ...prev,
                        currencySettings: settings,
                        lastUpdated: new Date().toISOString(),
                      }));
                    }
                    setActiveCurrency(settings.settlementCurrency);
                    showToast(`Moneda de liquidación: ${settings.settlementCurrency}`);
                  }}
                  onUpdateManagementSettings={async (settings) => {
                    if (isApp && currentUser) {
                      await saveManagementSettingsDoc(currentUser.uid, settings);
                    }
                    updateDemoState((prev) => ({
                      ...prev,
                      managementSettings: settings,
                      lastUpdated: new Date().toISOString(),
                    }));
                    showToast(
                      settings.enabled
                        ? `Comisión de gestión: ${settings.percent}% sobre el neto`
                        : 'Comisión de gestión desactivada'
                    );
                  }}
                />
              )}

              {demoTab === 'cash-drawer' && (
                <DemoCashDrawer
                  demoState={demoState}
                  userRole={userRole}
                  onAddCashMovement={handleAddCashMovement}
                  onDeleteCashMovement={handleDeleteCashMovement}
                />
              )}

              {demoTab === 'welcome-guide' && (
                <WelcomeGuideHub
                  guideData={demoState.welcomeGuide || INITIAL_WELCOME_GUIDE}
                  properties={demoState.properties}
                  initialSubTab={guideSubTab}
                  initialTemplate={guideTemplate}
                  onSelectSubTab={setGuideSubTab}
                  onSelectTemplate={(tmpl) => {
                    setGuideTemplate(tmpl);
                    if (isApp && currentUser) {
                      saveTenantData(currentUser.uid, { guideTemplate: tmpl });
                    }
                  }}
                  onBackToPanel={() => setDemoTab('overview')}
                  uid={currentUser?.uid}
                  onUpdateGuideData={async (updated) => {
                    if (isApp && currentUser) {
                      await saveTenantData(currentUser.uid, { welcomeGuide: updated });
                    } else {
                      updateDemoState((prev) => ({
                        ...prev,
                        welcomeGuide: updated,
                        lastUpdated: new Date().toISOString(),
                      }));
                    }
                    showToast('Guía de Bienvenida y datos actualizados en vivo');
                  }}
                />
              )}

              {demoTab === 'direct-booking' && (
                <DirectBookingLanding
                  guideData={demoState.welcomeGuide || INITIAL_WELCOME_GUIDE}
                  properties={demoState.properties}
                  activeTemplate={guideTemplate}
                  onSelectTemplate={setGuideTemplate}
                  onBackToPanel={() => setDemoTab('overview')}
                />
              )}

              {demoTab === 'xenia' && (
                <XeniaCopilotView demoState={demoState} />
              )}
              </Suspense>
            </div>

            {/* Selector de Planes & Escenarios Comerciales (Plano de menor prioridad visual, al pie del panel) */}
            {!isApp && !loggedUser && !isDemoPlanBarDismissed && (
              <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pb-6 pt-2">
                <DemoPlanFunctionalBar
                  onSelectTab={setDemoTab}
                  currentTab={demoTab}
                  isEmployeeMode={isEmployeeMode}
                  onToggleEmployeeMode={() => handleRoleChange(isEmployeeMode ? 'admin' : 'housekeeping')}
                  onOpenGuideWith={(subTab, template) => {
                    setGuideSubTab(subTab);
                    if (template) setGuideTemplate(template);
                    setDemoTab('welcome-guide');
                  }}
                  onOpenOnboardingWizard={() => setIsOnboardingModalOpen(true)}
                  onRequestPlan={() => {
                    setSelectedPlanForLead('Plan Loomi Suite ($60.000/mes)');
                    setIsLeadModalOpen(true);
                  }}
                  onDismiss={handleDismissDemoPlanBar}
                />
              </div>
            )}
          </div>
        </div>
    )}

      {/* Persistent Floating Xenia AI Assistant (activo en el panel de Demo y App en escritorio; oculto cuando se está en la vista Asistente Xenia) */}
      {currentView === 'demo' && !isEmployeeMode && (userRole === 'frontdesk' || mobileMode === 'light' || (demoTab !== 'xenia' && demoTab !== 'direct-booking')) && (
        <XeniaFloatingWidget
          demoState={demoState}
          onOpenFullView={() => {
            setCurrentView('demo');
            setDemoTab('xenia');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* MODALS */}
      <LeadModal
        isOpen={isLeadModalOpen}
        selectedPlan={selectedPlanForLead}
        onClose={() => setIsLeadModalOpen(false)}
        onOpenDemo={() => handleOpenDemo()}
      />

      <Suspense fallback={null}>
      {everOpened.newRes && (
      <NewReservationModal
        isOpen={isNewResModalOpen}
        demoState={demoState}
        initialPropertyId={initialPropertyForRes}
        initialDate={initialDateForRes}
        onClose={() => setIsNewResModalOpen(false)}
        onSaveReservation={handleSaveReservation}
      />
      )}

      {everOpened.detail && (
      <ReservationDetailModal
        reservation={liveSelectedReservation}
        property={demoState.properties.find(
          (p) => p.id === liveSelectedReservation?.propertyId
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
        userRole={userRole}
        currencySettings={demoState.currencySettings}
        precheckin={liveSelectedReservation ? precheckins[liveSelectedReservation.id] : undefined}
        complexName={demoState.welcomeGuide?.propertyName || ''}
      />
      )}

      {everOpened.json && (
      <JsonDataModal
        isOpen={isJsonModalOpen}
        demoState={demoState}
        onClose={() => setIsJsonModalOpen(false)}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
      )}

      {everOpened.onboarding && (
      <OnboardingWizardModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleCompleteOnboarding}
      />
      )}

      {everOpened.importCal && (
      <CalendarImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        demoState={demoState}
        onImport={handleImportCalendarReservations}
        onImportLegacy={handleImportLegacyBackup}
        onUndoLegacyImport={handleUndoLegacyImport}
      />
      )}

      {everOpened.auth && (
      <ClientAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectComplex={handleSelectComplex}
        onOpenDemo={() => handleOpenDemo()}
        currentComplexId={activeComplex}
      />
      )}
      </Suspense>
    </div>
  );
}
