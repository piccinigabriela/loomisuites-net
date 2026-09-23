import React, { useState } from 'react';
import {
  Smartphone,
  Settings,
  Globe,
  Share2,
  ExternalLink,
  QrCode,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { WelcomeGuideData, Property } from '../../types';
import { GuestWelcomePortal } from './GuestWelcomePortal';
import { AdminGuideEditor } from './AdminGuideEditor';
import { DirectBookingLanding } from '../booking/DirectBookingLanding';

interface WelcomeGuideHubProps {
  guideData: WelcomeGuideData;
  properties: Property[];
  onUpdateGuideData: (updatedData: WelcomeGuideData) => void;
}

export const WelcomeGuideHub: React.FC<WelcomeGuideHubProps> = ({
  guideData,
  properties,
  onUpdateGuideData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'guest-view' | 'admin-view' | 'landing-booking'>('guest-view');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute slug from property name
  const slug = guideData.propertyName.toLowerCase().includes('wood')
    ? 'woodcabin'
    : guideData.propertyName.toLowerCase().includes('catalinas')
    ? 'catalinas'
    : guideData.propertyName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://loomisuite.net';
  
  const directLinks = {
    guide: `${baseUrl}/guia/${slug}`,
    booking: `${baseUrl}/reservas/${slug}`,
    app: `${baseUrl}/app/${slug}`,
    housekeeping: `${baseUrl}/limpieza/${slug}`,
  };

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner introducing the feature */}
      <div className="bg-gradient-to-r from-stone-900 via-zinc-900 to-stone-900 border border-stone-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Módulo de Experiencia del Huésped & Venta Directa</span>
            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 text-[10px]">
              {guideData.propertyName} • Guía Interactiva
            </span>
          </div>
          <h2 className="text-xl font-bold font-['Outfit']">
            Guía Digital de Bienvenida & Enlaces Directos del Complejo
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Compartí con tus huéspedes o tu equipo los enlaces directos y limpios para acceder en 1 toque sin pasar por páginas intermedias.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCopy('guide', directLinks.guide)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {copiedKey === 'guide' ? <Check className="w-3.5 h-3.5 text-stone-950" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'guide' ? '¡Link Copiado!' : 'Copiar Link Guía Huésped'}</span>
          </button>
        </div>
      </div>

      {/* Clean URLs bar */}
      <div className="bg-zinc-50 dark:bg-[#1f1e1c] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
          🔗 Enlaces Directos de tu Complejo ({guideData.propertyName})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-[#282622] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                📱 Guía del Huésped
              </span>
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate mt-1">/guia/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('guide_bar', directLinks.guide)}
              className="mt-2 text-[11px] font-bold text-[#c46d45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'guide_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#282622] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                📅 Motor de Reservas Directas
              </span>
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate mt-1">/reservas/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('booking_bar', directLinks.booking)}
              className="mt-2 text-[11px] font-bold text-[#c46d45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'booking_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#282622] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                💼 Panel de Gestión (App)
              </span>
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate mt-1">/app/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('app_bar', directLinks.app)}
              className="mt-2 text-[11px] font-bold text-[#c46d45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'app_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#282622] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                🧹 Checklist de Limpieza
              </span>
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate mt-1">/limpieza/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('clean_bar', directLinks.housekeeping)}
              className="mt-2 text-[11px] font-bold text-[#c46d45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'clean_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>

      {/* Switcher Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('guest-view')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'guest-view'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>1. Vista Huésped (Guía Móvil)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('admin-view')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'admin-view'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Settings className="w-4 h-4 text-rose-500" />
            <span>2. Panel de Edición (Admin Guía)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('landing-booking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'landing-booking'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>3. Landing con Motor de Reservas (Self-Onboard)</span>
          </button>
        </div>

        {activeSubTab === 'guest-view' && (
          <div className="flex items-center gap-2 text-xs pr-2">
            <span className="text-zinc-500 text-[11px]">Formato:</span>
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                isMobileFrame ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              📱 Celular
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                !isMobileFrame ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              💻 Pantalla Completa
            </button>
          </div>
        )}
      </div>

      {/* Main View Area */}
      <div>
        {activeSubTab === 'guest-view' && (
          <div className="py-4">
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Esta es la experiencia interactiva que ve el huésped de {guideData.propertyName} al abrir el enlace o escanear el QR en la unidad.
              </span>
            </div>
            <GuestWelcomePortal guideData={guideData} isMobilePreview={isMobileFrame} />
          </div>
        )}

        {activeSubTab === 'admin-view' && (
          <AdminGuideEditor guideData={guideData} onSave={onUpdateGuideData} />
        )}

        {activeSubTab === 'landing-booking' && (
          <DirectBookingLanding guideData={guideData} properties={properties} />
        )}
      </div>
    </div>
  );
};
