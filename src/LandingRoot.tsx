import React, { useEffect, useState, Suspense } from 'react';
import { Navbar } from './components/landing/Navbar';
import { BentoLanding } from './components/landing/BentoLanding';
import { ManualLeadMagnet } from './components/landing/ManualLeadMagnet';
import { Footer } from './components/landing/Footer';

const LeadModal = React.lazy(() => import('./components/landing/LeadModal').then((m) => ({ default: m.LeadModal })));

/**
 * loomisuite.net (landing): versión liviana sin la app, la demo ni Firebase.
 * "Probar demo" va a /demo, que carga la app completa.
 */
export const LandingRoot: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('loomi_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadPlan, setLeadPlan] = useState<string | undefined>(undefined);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('loomi_theme', theme);
    } catch {}
  }, [theme]);

  const openDemo = (tab?: string) => {
    window.location.href = tab ? `/demo?tab=${encodeURIComponent(tab)}` : '/demo';
  };
  const openContact = (plan?: string) => {
    setLeadPlan(plan);
    setLeadOpen(true);
  };
  const openLogin = () => {
    window.location.href = 'https://app.loomisuite.net';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors">
      <main className="bg-[#F8F9FA] dark:bg-[#0E0F12] min-h-screen transition-colors text-[#2D3748] dark:text-[#E2E8F0] relative">
        <Navbar
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onOpenLogin={openLogin}
          onOpenDemo={() => openDemo()}
          onOpenContact={() => openContact(undefined)}
        />
        <BentoLanding theme={theme} onOpenDemo={(tab) => openDemo(tab)} onOpenContact={(p) => openContact(p || 'Consulta General')} onOpenLogin={openLogin} />
        <ManualLeadMagnet />
        <Footer onOpenDemo={() => openDemo()} onOpenContact={() => openContact(undefined)} />
      </main>
      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal isOpen={leadOpen} selectedPlan={leadPlan} onClose={() => setLeadOpen(false)} onOpenDemo={() => openDemo()} />
        </Suspense>
      )}
    </div>
  );
};
