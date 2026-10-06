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
  Compass,
  Crown,
} from 'lucide-react';
import { WelcomeGuideData, Property } from '../../types';
import { GuestWelcomePortal } from './GuestWelcomePortal';
import { AdminGuideEditor } from './AdminGuideEditor';
import { DirectBookingLanding, LandingTemplate } from '../booking/DirectBookingLanding';

interface WelcomeGuideHubProps {
  guideData: WelcomeGuideData;
  properties: Property[];
  onUpdateGuideData: (updatedData: WelcomeGuideData) => void;
  initialSubTab?: 'landing-booking' | 'guest-view' | 'admin-view';
  initialTemplate?: LandingTemplate;
  onSelectSubTab?: (subTab: 'landing-booking' | 'guest-view' | 'admin-view') => void;
  onSelectTemplate?: (template: LandingTemplate) => void;
}

export const WelcomeGuideHub: React.FC<WelcomeGuideHubProps> = ({
  guideData,
  properties,
  onUpdateGuideData,
  initialSubTab,
  initialTemplate,
  onSelectSubTab,
  onSelectTemplate,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'landing-booking' | 'guest-view' | 'admin-view'>('guest-view');
  const [internalTemplate, setInternalTemplate] = useState<LandingTemplate>('retrato');

  const activeSubTab = initialSubTab || internalSubTab;
  const selectedTemplate = initialTemplate || internalTemplate;

  const handleSetSubTab = (tab: 'landing-booking' | 'guest-view' | 'admin-view') => {
    setInternalSubTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  const handleSetTemplate = (tmpl: LandingTemplate) => {
    setInternalTemplate(tmpl);
    if (onSelectTemplate) onSelectTemplate(tmpl);
  };

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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Top Bento Banner */}
      <div className="bg-[#18181B] dark:bg-[#0C0D0F] border border-[#222328] rounded-none p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Tu Web Oficial, Reservas Directas & Guía Digital</span>
            <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 border border-emerald-500/30 text-[10px]">
              {guideData.propertyName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Tu Web con Motor de Reservas y Portal del Huésped
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Aquí tienes el sitio web directo para tus departamentos (para poner en Instagram, Google Maps y WhatsApp) donde tus huéspedes reservan al 0% comisión y acceden a su guía digital.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCopy('booking_top', directLinks.booking)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {copiedKey === 'booking_top' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedKey === 'booking_top' ? '¡Link Web Copiado!' : 'Copiar Link de Tu Web'}</span>
          </button>
        </div>
      </div>

      {/* Clean URLs Bento Grid */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] rounded-none p-4">
        <p className="text-[10px] font-mono font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2.5">
          🔗 Enlaces Directos del Complejo ({guideData.propertyName})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                🌐 Tu Web Oficial (Reservas)
              </span>
              <p className="text-xs font-mono text-[#18181B] dark:text-[#EFECE5] truncate mt-1">/reservas/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('booking_bar', directLinks.booking)}
              className="mt-2 text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'booking_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#E1500A] flex items-center gap-1 uppercase tracking-wider font-mono">
                📱 Guía del Huésped
              </span>
              <p className="text-xs font-mono text-[#18181B] dark:text-[#EFECE5] truncate mt-1">/guia/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('guide_bar', directLinks.guide)}
              className="mt-2 text-[11px] font-bold text-[#E1500A] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'guide_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                💼 Panel de Gestión
              </span>
              <p className="text-xs font-mono text-[#18181B] dark:text-[#EFECE5] truncate mt-1">/app/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('app_bar', directLinks.app)}
              className="mt-2 text-[11px] font-bold text-[#E1500A] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'app_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#18181B] p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                🧹 Checklist Operaciones
              </span>
              <p className="text-xs font-mono text-[#18181B] dark:text-[#EFECE5] truncate mt-1">/operaciones/{slug}</p>
            </div>
            <button
              onClick={() => handleCopy('clean_bar', directLinks.housekeeping)}
              className="mt-2 text-[11px] font-bold text-[#E1500A] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'clean_bar' ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>

      {/* Switcher Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EAE8E3] dark:bg-[#0C0D0F] p-2 rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSetSubTab('guest-view')}
            className={`px-3.5 py-2 rounded-none text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'guest-view'
                ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#0C0D0F] shadow-xs'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#E1500A]" />
            <span>1. Guía Móvil del Huésped (QR & Wi-Fi)</span>
          </button>

          <button
            onClick={() => handleSetSubTab('landing-booking')}
            className={`px-3.5 py-2 rounded-none text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'landing-booking'
                ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#0C0D0F] shadow-xs'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>2. Tu Web (Reservas Directas)</span>
          </button>

          <button
            onClick={() => handleSetSubTab('admin-view')}
            className={`px-3.5 py-2 rounded-none text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'admin-view'
                ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#0C0D0F] shadow-xs'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-[#E1500A]" />
            <span>3. Ajustes & Edición de Datos</span>
          </button>
        </div>

        {activeSubTab === 'landing-booking' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pr-1 font-mono">
            <span className="text-[#71717A] dark:text-[#A1A1AA] text-[10px] uppercase hidden md:inline">Plantilla:</span>
            
            {/* Esenciales */}
            <div className="flex items-center gap-1 bg-white/60 dark:bg-[#18181B] p-0.5 rounded-lg border border-[#C8C4B7] dark:border-[#222328]">
              <button
                onClick={() => handleSetTemplate('bay')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  selectedTemplate === 'bay'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
                }`}
                title="Modelo Bay (Esencial)"
              >
                Bay
              </button>
              <button
                onClick={() => handleSetTemplate('retrato')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  selectedTemplate === 'retrato'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
                }`}
                title="Modelo Retrato (Esencial)"
              >
                Retrato
              </button>
              <button
                onClick={() => handleSetTemplate('urbano')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  selectedTemplate === 'urbano'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white'
                }`}
                title="Modelo Urbano (Esencial)"
              >
                Urbano
              </button>
            </div>

            <span className="text-stone-400 text-xs">|</span>

            {/* Signature */}
            <div className="flex items-center gap-1 bg-[#1c1917] p-0.5 rounded-lg border border-amber-500/40">
              <button
                onClick={() => handleSetTemplate('luxury-editorial-parallax')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTemplate === 'luxury-editorial-parallax'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
                title="Modelo Signature Parallax (Bodegas & Luxury)"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>👑 Parallax</span>
              </button>

              <button
                onClick={() => handleSetTemplate('luxury-horizontal-architectural')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTemplate === 'luxury-horizontal-architectural'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
                title="Modelo Signature Canvas (Horizontal Inmersivo)"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Canvas</span>
              </button>

              <button
                onClick={() => handleSetTemplate('luxury-monograph-folio')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTemplate === 'luxury-monograph-folio'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
                title="Modelo Signature Folio"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Folio</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'guest-view' && (
          <div className="flex items-center gap-1.5 text-xs pr-1 font-mono">
            <span className="text-[#71717A] dark:text-[#A1A1AA] text-[10px] uppercase">Formato:</span>
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`px-2.5 py-1 rounded-none text-[11px] font-bold cursor-pointer uppercase ${
                isMobileFrame
                  ? 'bg-[#18181B] dark:bg-[#222328] text-white'
                  : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-white'
              }`}
            >
              📱 Celular
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`px-2.5 py-1 rounded-none text-[11px] font-bold cursor-pointer uppercase ${
                !isMobileFrame
                  ? 'bg-[#18181B] dark:bg-[#222328] text-white'
                  : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-white'
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
          <div className="py-2">
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA] bg-white dark:bg-[#18181B] px-3.5 py-1.5 rounded-none border border-[#C8C4B7] dark:border-[#222328]">
                <Info className="w-3.5 h-3.5 text-[#E1500A]" />
                Experiencia interactiva que ve el huésped de {guideData.propertyName} al abrir el enlace o escanear el QR en la unidad.
              </span>
            </div>
            <GuestWelcomePortal
              guideData={guideData}
              isMobilePreview={isMobileFrame}
              template={selectedTemplate}
              onSelectTemplate={handleSetTemplate}
            />
          </div>
        )}

        {activeSubTab === 'admin-view' && (
          <AdminGuideEditor guideData={guideData} onSave={onUpdateGuideData} />
        )}

        {activeSubTab === 'landing-booking' && (
          <DirectBookingLanding
            guideData={guideData}
            properties={properties}
            activeTemplate={selectedTemplate}
            onSelectTemplate={handleSetTemplate}
          />
        )}
      </div>
    </div>
  );
};
