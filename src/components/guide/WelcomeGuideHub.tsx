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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const realUrl = 'https://woodcabiniguazu.com.ar/bienvenida.html';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(realUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
              Caso Real: Los Bananos Wood Cabin
            </span>
          </div>
          <h2 className="text-xl font-bold font-['Outfit']">
            Guía Digital de Bienvenida & Landing de Reservas Directas
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Inspirada en el modelo de <strong>Fernando en Los Bananos - Wood Cabin Iguazú</strong>. Le entrega al huésped en su teléfono los modos de llegar, clave de WiFi en 1 clic, normas, compras y entradas a Cataratas; con un admin simple para cambiar tarifas o leña.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={realUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Ver Web Original</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-stone-950" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? '¡Copiado!' : 'Compartir Link'}</span>
          </button>
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
            <span>2. Admin de Fernando (Editar Datos)</span>
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
                Esta es la experiencia interactiva que ve el huésped de Los Bananos al abrir el enlace o escanear el QR en la cabaña.
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
