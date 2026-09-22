import React, { useState } from 'react';
import {
  Building2,
  Users,
  Bed,
  Bath,
  Wifi,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  DollarSign,
  Star,
  RefreshCw,
  Globe,
  CheckCircle2,
  Lock,
  FileText,
} from 'lucide-react';
import { DemoState, Property } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { OnboardingGuideView } from './OnboardingGuideView';

interface DemoPropertiesProps {
  demoState: DemoState;
  onUpdatePropertyPrice: (propertyId: string, newPrice: number) => void;
  isEmployeeMode?: boolean;
}

export const DemoProperties: React.FC<DemoPropertiesProps> = ({
  demoState,
  onUpdatePropertyPrice,
  isEmployeeMode = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Custom Domain state
  const [customDomain, setCustomDomain] = useState<string>('reservas.misalojamientos.com');
  const [isDomainSaved, setIsDomainSaved] = useState<boolean>(true);
  const [showDomainConfig, setShowDomainConfig] = useState<boolean>(false);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState<boolean>(false);

  const handleCopyDirectLink = (propertyId: string) => {
    const link = isDomainSaved && customDomain
      ? `https://${customDomain}/${propertyId}`
      : `https://loomisuite.com/reserva-directa/${propertyId}`;
    copyToClipboard(link);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSavePrice = (propertyId: string) => {
    if (tempPrice > 0) {
      onUpdatePropertyPrice(propertyId, tempPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
            <span>Departamentos y Cabañas ({demoState.properties.length})</span>
          </h3>
          <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
            Tarifas base por noche, accesos (llaves/cerraduras) y enlaces de reserva directa para WhatsApp.
          </p>
        </div>

        {!isEmployeeMode && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowOnboardingGuide(!showOnboardingGuide)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#c46d45]/20"
            >
              <FileText className="w-4 h-4" />
              <span>{showOnboardingGuide ? 'Ocultar Guía' : 'Ver Guía Auto-Configuración (PDF)'}</span>
            </button>
            <button
              onClick={() => setShowDomainConfig(!showDomainConfig)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-bold text-[#1c1b18] dark:text-[#c8c5c0] bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2c2c2c] border border-[#ded9cd] dark:border-[#333] px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-4 h-4 text-[#c46d45] dark:text-[#d88d5e]" />
              <span>{showDomainConfig ? 'Ocultar Dominio' : 'Configurar Dominio Propio'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Onboarding Guide printable cheat sheet card */}
      {showOnboardingGuide && !isEmployeeMode && (
        <OnboardingGuideView
          complexName={demoState.welcomeGuide?.propertyName || 'Catalinas Apartamentos'}
          onClose={() => setShowOnboardingGuide(false)}
        />
      )}

      {/* Dominio Propio Configuration Card */}
      {showDomainConfig && !isEmployeeMode && (
        <div className="p-5 rounded-2xl bg-[#f4eee7] dark:bg-[#1e1b18] border border-[#e4d6c9] dark:border-[#48372b] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#ded9cd] dark:border-[#332b24] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c46d45] text-white flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">Dominio Propio para Motor Directo (Add-on Opcional)</h4>
                <p className="text-xs text-[#78746c] dark:text-[#a8a5a0]">
                  Vinculación de tu dominio (.com o .com.ar) con certificado SSL gratuito provisto por Loomi.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3e6645] dark:text-[#a4cca8] bg-[#edf4ed] dark:bg-[#223023] px-2.5 py-1 rounded-full border border-[#c6dcc6] dark:border-[#344836]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3e6645] dark:text-[#78b37e]" />
              <span>SSL Seguro Activo</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#c8c5c0]">Tu dominio personalizado:</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#78746c] dark:text-[#8e8c87]">https://</span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setIsDomainSaved(false);
                  }}
                  placeholder="ej: reservas.misalojamientos.com"
                  className="flex-1 text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] p-2 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] focus:outline-none focus:border-[#c46d45]"
                />
                <button
                  onClick={() => setIsDomainSaved(true)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-[#c46d45] hover:bg-[#b55e37] text-white transition-colors cursor-pointer shadow-2xs"
                >
                  {isDomainSaved ? 'Guardado' : 'Guardar Dominio'}
                </button>
              </div>
            </div>

            <div className="md:col-span-4 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#ded9cd] dark:border-[#2c2825] text-xs text-[#78746c] dark:text-[#a8a5a0] space-y-1">
              <span className="font-bold text-[#1c1b18] dark:text-[#c8c5c0] block text-[11px]">Registro DNS CNAME:</span>
              <p className="font-mono text-[11px] text-[#c46d45] dark:text-[#d88d5e] bg-[#f8f6f2] dark:bg-[#1a1715] p-1.5 rounded border border-[#ded9cd] dark:border-[#3a2d24]">
                CNAME @ → cname.loomisuite.com
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoState.properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] overflow-hidden shadow-xs hover:border-[#c46d45]/40 dark:hover:border-[#383838] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-[#f4f2ee] dark:bg-[#141414]">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#1c1b18]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {prop.neighborhood}, {prop.city}
                </div>

                <div className="absolute top-3 right-3 bg-[#1c1b18]/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-[#c46d45] text-[#c46d45]" />
                  <span>{prop.rating} ({prop.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <h4 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">{prop.name}</h4>
                <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mb-4">{prop.address} • {prop.type}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#78746c] dark:text-[#a8a5a0] mb-4 pb-4 border-b border-[#ded9cd] dark:border-[#282828]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#78746c]" />
                    Hasta {prop.maxGuests} huéspedes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-[#78746c]" />
                    {prop.bedrooms} hab.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-[#78746c]" />
                    {prop.bathrooms} baños
                  </span>
                </div>

                {/* Price editor */}
                {!isEmployeeMode ? (
                  <div className="bg-[#f8f6f2] dark:bg-[#161616] rounded-xl p-3 border border-[#ded9cd] dark:border-[#282828] mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#78746c] dark:text-[#8e8c87] font-medium block">Tarifa por noche</span>
                      {editingPriceId === prop.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border rounded bg-white dark:bg-[#1c1c1c] text-[#1c1b18] dark:text-[#f4f2ee] font-bold border-[#ded9cd] dark:border-[#444]"
                          />
                          <button
                            onClick={() => handleSavePrice(prop.id)}
                            className="text-[11px] bg-[#3e6645] text-white font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-[#3e6645] dark:text-[#78b37e]">${prop.basePrice} USD</span>
                          <button
                            onClick={() => {
                              setEditingPriceId(prop.id);
                              setTempPrice(prop.basePrice);
                            }}
                            className="text-[#78746c] hover:text-[#c46d45] dark:hover:text-[#d88d5e] p-1 cursor-pointer transition-colors"
                            title="Editar tarifa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#78746c] dark:text-[#8e8c87] font-medium block">Tarifa Limpieza</span>
                      <span className="text-sm font-bold text-[#1c1b18] dark:text-[#c8c5c0]">${prop.cleaningFee} USD</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f4eee7] dark:bg-[#24201a] rounded-xl p-3 border border-[#e4d6c9] dark:border-[#483a2c] mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#9c512a] dark:text-[#d88d5e] font-bold block">Gestión de Unidad</span>
                      <span className="text-xs text-[#78746c] dark:text-[#a8a5a0]">Capacidad: {prop.maxGuests} personas</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#edeae2] dark:bg-[#332b20] text-[#9c512a] dark:text-[#d88d5e] px-2 py-1 rounded-md border border-[#ded9cd] dark:border-[#54422e]">
                      🔒 Tarifas para Administración
                    </span>
                  </div>
                )}

                {/* Smart lock & Wi-Fi details */}
                <div className="space-y-2 text-xs text-[#78746c] dark:text-[#a8a5a0]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#78746c] dark:text-[#8e8c87]">
                      <KeyRound className="w-3.5 h-3.5 text-[#c46d45]" />
                      Cerradura / Acceso:
                    </span>
                    <span className="font-semibold text-[#1c1b18] dark:text-[#f4f2ee]">{prop.smartLock.brand}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#78746c] dark:text-[#8e8c87]">
                      <Wifi className="w-3.5 h-3.5 text-[#3e6645] dark:text-[#78b37e]" />
                      Wi-Fi Huéspedes:
                    </span>
                    <span className="font-mono text-[#1c1b18] dark:text-[#f4f2ee]">{prop.wifiNetwork}</span>
                  </div>
                </div>

                {/* Sync Channels Status */}
                <div className="mt-4 pt-3 border-t border-[#ded9cd] dark:border-[#282828] flex items-center justify-between text-xs">
                  <span className="text-[#78746c] dark:text-[#8e8c87] text-[11px]">Sincronización activa:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.airbnb ? 'bg-[#fbedea] dark:bg-[#33221e] text-[#b83b2a] dark:text-[#f09a82] border border-[#f5cbc3] dark:border-[#59352e]' : 'bg-[#f4f2ee] dark:bg-[#181818] text-[#78746c] dark:text-[#555]'}`}>
                      Airbnb
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.booking ? 'bg-[#ebf3fa] dark:bg-[#1b2b38] text-[#1e588f] dark:text-[#8ac4f2] border border-[#c5ddf5] dark:border-[#2b4c68]' : 'bg-[#f4f2ee] dark:bg-[#181818] text-[#78746c] dark:text-[#555]'}`}>
                      Booking
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.vrbo ? 'bg-[#f4f0fa] dark:bg-[#252438] text-[#5b4ea8] dark:text-[#b4b2f2] border border-[#ddd3f5] dark:border-[#3e3c68]' : 'bg-[#f4f2ee] dark:bg-[#181818] text-[#78746c] dark:text-[#555]'}`}>
                      VRBO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking Footer */}
            <div className="p-4 bg-[#f8f6f2] dark:bg-[#141414] border-t border-[#ded9cd] dark:border-[#282828] flex items-center justify-between gap-3">
              <div className="text-xs text-[#78746c] dark:text-[#a8a5a0] font-medium truncate">
                <span className="block text-[10px] text-[#78746c]">Canal directo (0% comisiones)</span>
                <span className="font-mono text-[#1c1b18] dark:text-[#c8c5c0] text-[11px]">
                  {isDomainSaved && customDomain ? customDomain : 'loomisuite.com'}/{prop.id}
                </span>
              </div>
              <button
                onClick={() => handleCopyDirectLink(prop.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#3e6645] dark:text-[#a4cca8] bg-[#edf4ed] dark:bg-[#1e2b20] hover:bg-[#dfeadf] dark:hover:bg-[#283d2c] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 border border-[#c6dcc6] dark:border-[#344836] shadow-2xs"
              >
                {copiedId === prop.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3e6645] dark:text-[#78b37e]" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace Directo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
