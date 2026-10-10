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
  User,
  Car,
  CreditCard,
  ShoppingBag,
  Wifi,
  Copy,
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
  onBackToPanel?: () => void;
}

export const WelcomeGuideHub: React.FC<WelcomeGuideHubProps> = ({
  guideData,
  properties,
  onUpdateGuideData,
  initialSubTab,
  initialTemplate,
  onSelectSubTab,
  onSelectTemplate,
  onBackToPanel,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'landing-booking' | 'guest-view' | 'admin-view'>('guest-view');
  const [internalTemplate, setInternalTemplate] = useState<LandingTemplate>('dos-aguas');

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

  // Quick edit state for Wi-Fi in the quick bar
  const [ssidInput, setSsidInput] = useState(guideData.wifiNetwork || 'Iguazu_WiFi');
  const [passwordInput, setPasswordInput] = useState(guideData.wifiPassword || 'IguazuDemo2026');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Compute slug for demo property
  const slug = 'iguazu';

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

  const handleQuickSaveWifi = () => {
    const updated = {
      ...guideData,
      wifiNetwork: ssidInput.trim(),
      wifiPassword: passwordInput.trim(),
    };
    onUpdateGuideData(updated);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  return (
    <div className="bg-[#F8F9FA] dark:bg-[#0E0F12] min-h-screen p-3 sm:p-6 font-sans antialiased text-[#2D3748] dark:text-[#E2E8F0] transition-colors">
      {/* CONTENEDOR MÁSTER CENTRADO */}
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">

        {/* 1. CABECERA PRINCIPAL (Líneas delgadas, adiós al bloque verde invasivo) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <span className="inline-block bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase">
              Módulo de Cara al Cliente
            </span>
            <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              Tu Web con Motor de Reservas & <span className="font-semibold text-gray-800 dark:text-gray-100">Portal del Huésped</span>
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">
              Sitio web oficial al 0% comisión y guía interactiva QR para {guideData.propertyName}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Botón de estado de la web */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-emerald-100/60 dark:border-emerald-900/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dominio Activo / En Línea</span>
            </div>

            <button
              onClick={() => handleCopy('direct_web', directLinks.booking)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-200 border border-gray-200/70 dark:border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar enlace directo de tu web"
            >
              {copiedKey === 'direct_web' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copiedKey === 'direct_web' ? '¡Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* 2. GRILLA DE PESTAÑAS DE PRESTACIONES (Tarjetas flotantes suaves con aire) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pestaña 1: Check-in / Datos */}
          <div
            onClick={() => handleSetSubTab('admin-view')}
            className="bg-white dark:bg-[#18191E] p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-200/70 dark:hover:border-orange-900/60 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 group-hover:text-[#E67E22] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 rounded-xl w-max transition-colors">
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Datos del Huésped</h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-medium leading-relaxed">
                Formulario de registro digital, DNI/Pasaporte y firma de términos de convivencia.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#E67E22] mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">
              Configurar campos →
            </span>
          </div>

          {/* Pestaña 2: Vehículo */}
          <div
            onClick={() => handleSetSubTab('admin-view')}
            className="bg-white dark:bg-[#18191E] p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-200/70 dark:hover:border-orange-900/60 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 group-hover:text-[#E67E22] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 rounded-xl w-max transition-colors">
                <Car className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Datos del Vehículo</h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-medium leading-relaxed">
                Patente, marca y modelo para el control de acceso y seguridad del estacionamiento.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#E67E22] mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">
              Configurar campos →
            </span>
          </div>

          {/* Pestaña 3: Datos de Pago */}
          <div
            onClick={() => handleSetSubTab('admin-view')}
            className="bg-white dark:bg-[#18191E] p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-200/70 dark:hover:border-orange-900/60 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 group-hover:text-[#E67E22] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 rounded-xl w-max transition-colors">
                <CreditCard className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Pagos & Facturación</h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-medium leading-relaxed">
                Pasarelas de Mercado Pago, PayPal o datos de transferencia bancaria directa.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#E67E22] mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">
              Configurar pasarelas →
            </span>
          </div>

          {/* Pestaña 4: Adicionales / Upselling */}
          <div
            onClick={() => handleSetSubTab('guest-view')}
            className="bg-white dark:bg-[#18191E] p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-200/70 dark:border-zinc-800 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 group-hover:text-[#E67E22] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 rounded-xl w-max transition-colors">
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Opcionales Disponibles</h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-medium leading-relaxed">
                Venta de desayunos, masajes, late check-out o alquiler de bicicletas desde el portal.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#E67E22] mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">
              Gestionar extras →
            </span>
          </div>
        </div>

        {/* 3. BARRA DE CONTROL DE WI-FI & ACCIONES (Limpia, unificada en una sola línea horizontal elegante) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          {/* Datos de Red */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
                Paso 1: Datos de Red
              </span>
              <div className="flex items-center gap-1.5 font-mono text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-200/80 dark:border-zinc-700">
                <Wifi className="w-3.5 h-3.5 text-[#E67E22]" />
                <span className="text-gray-400 text-[10px]">SSID:</span>
                <input
                  type="text"
                  value={ssidInput}
                  onChange={(e) => setSsidInput(e.target.value)}
                  className="bg-transparent text-xs font-bold font-mono focus:outline-none w-32 text-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
                Password
              </span>
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="font-mono text-xs font-bold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-200/80 dark:border-zinc-700 focus:outline-none w-32"
              />
            </div>
          </div>

          {/* Botones de Acción de Configuración */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={() => handleSetSubTab('guest-view')}
              className="text-gray-600 dark:text-zinc-300 font-semibold hover:text-gray-900 dark:hover:text-white text-xs px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-gray-200/60 dark:border-zinc-700"
            >
              Asignar a Gestión de Suites
            </button>

            <button
              onClick={handleQuickSaveWifi}
              className="bg-[#E67E22] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-orange-500/10 hover:bg-[#d35400] transition-all flex items-center space-x-1.5 active:scale-[0.98] cursor-pointer"
            >
              {isSavedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. SELECTOR DE SUBPESTAÑAS DE VISTA Y FORMATO */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#18191E] p-2 sm:p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSetSubTab('guest-view')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'guest-view'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] shadow-2xs border border-orange-200/50 dark:border-orange-900/50'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#E67E22]" />
              <span>1. Guía Móvil del Huésped (QR & Wi-Fi)</span>
            </button>

            <button
              onClick={() => handleSetSubTab('landing-booking')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'landing-booking'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] shadow-2xs border border-orange-200/50 dark:border-orange-900/50'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>2. Tu Web (Reservas Directas)</span>
            </button>

            <button
              onClick={() => handleSetSubTab('admin-view')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'admin-view'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] shadow-2xs border border-orange-200/50 dark:border-orange-900/50'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>3. Ajustes & Edición de Datos</span>
            </button>
          </div>

          {activeSubTab === 'landing-booking' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs pr-1 font-mono">
              <span className="text-gray-400 text-[10px] uppercase hidden md:inline">Plantillas Base:</span>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800/60 p-1 rounded-xl border border-gray-200/80 dark:border-zinc-700">
                <button
                  onClick={() => handleSetTemplate('clara')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTemplate === 'clara' || selectedTemplate === 'dos-aguas' || selectedTemplate === 'retrato'
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                  title="Plantilla 1: Clara • Estructuras limpias, luz franca y geometría noble"
                >
                  <span>☀️ Clara</span>
                  <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Luz franca)</span>
                </button>
                <button
                  onClick={() => handleSetTemplate('tierra')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTemplate === 'tierra' || selectedTemplate === 'corte-vette' || (selectedTemplate as string) === 'triptych'
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                  title="Plantilla 2: Tierra • Texturas nobles, maderas, revoques cálidos e imperfección natural"
                >
                  <span>🪵 Tierra</span>
                  <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Maderas)</span>
                </button>
                <button
                  onClick={() => handleSetTemplate('sombra')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTemplate === 'sombra' || selectedTemplate === 'medano-blanco' || selectedTemplate === 'bay' || selectedTemplate === 'urbano'
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                  title="Plantilla 3: Sombra • Atmósfera íntima, maderas oscuras y penumbra elegante"
                >
                  <span>🌑 Sombra</span>
                  <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Íntima)</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'guest-view' && (
            <div className="flex items-center gap-1.5 text-xs pr-1">
              <span className="text-gray-400 text-[10px] uppercase">Formato:</span>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800/60 p-1 rounded-xl border border-gray-200/80 dark:border-zinc-700">
                <button
                  onClick={() => setIsMobileFrame(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isMobileFrame
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  📱 Celular
                </button>
                <button
                  onClick={() => setIsMobileFrame(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    !isMobileFrame
                      ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  💻 Pantalla Completa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. MÓDULO DEL SIMULADOR DEL CELULAR DEL HUÉSPED & PANTALLAS */}
        <div className="transition-all">
          {activeSubTab === 'guest-view' && (
            <div className="py-2">
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 bg-white dark:bg-[#18191E] px-4 py-2 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <Info className="w-3.5 h-3.5 text-[#E67E22]" />
                  Experiencia interactiva que ve el huésped de {guideData.propertyName} al abrir el enlace o escanear el QR en la unidad.
                </span>
              </div>
              <GuestWelcomePortal
                guideData={guideData}
                isMobilePreview={isMobileFrame}
                template={selectedTemplate}
                onSelectTemplate={handleSetTemplate}
                onBackToPanel={onBackToPanel}
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
              onBackToPanel={onBackToPanel || (() => handleSetSubTab('guest-view'))}
            />
          )}
        </div>

      </div>
    </div>
  );
};
