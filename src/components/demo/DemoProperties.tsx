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
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
            INVENTARIO / DEPARTAMENTOS & CABAÑAS
          </span>
          <h3 className="text-xl font-black text-[#18181B] dark:text-white flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-[#E1500A]" />
            <span>Unidades Activas ({demoState.properties.length})</span>
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5 font-bold">
            Tarifas base por noche, accesos de llaves y enlaces de reserva directa para WhatsApp.
          </p>
        </div>

        {!isEmployeeMode && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowOnboardingGuide(!showOnboardingGuide)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white bg-[#E1500A] hover:bg-[#C94305] px-4 py-2 rounded-none transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showOnboardingGuide ? 'Ocultar Guía' : 'Guía Auto-Configuración'}</span>
            </button>
            <button
              onClick={() => setShowDomainConfig(!showDomainConfig)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white bg-white dark:bg-[#18181B] hover:border-[#E1500A] border border-[#C8C4B7] dark:border-[#222328] px-4 py-2 rounded-none transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>{showDomainConfig ? 'Ocultar Dominio' : 'Dominio Propio'}</span>
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
        <div className="p-4 sm:p-5 rounded-none bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C8C4B7] dark:border-[#222328] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E1500A] text-white flex items-center justify-center font-black">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white">Dominio Propio para Motor Directo</h4>
                <p className="text-[11px] text-[#71717A] dark:text-[#8E8E93] font-medium">
                  Vinculación de tu dominio (.com o .com.ar) con certificado SSL gratuito provisto por Loomi.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-none border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SSL Seguro Activo</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-[#18181B] dark:text-white">Tu dominio personalizado:</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">https://</span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setIsDomainSaved(false);
                  }}
                  placeholder="ej: reservas.misalojamientos.com"
                  className="flex-1 text-xs font-bold text-[#18181B] dark:text-white p-2 rounded-none border border-[#C8C4B7] dark:border-[#222328] bg-white dark:bg-[#18181B] focus:outline-none focus:border-[#E1500A]"
                />
                <button
                  onClick={() => setIsDomainSaved(true)}
                  className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-none bg-[#E1500A] hover:bg-[#C94305] text-white transition-colors cursor-pointer shadow-2xs"
                >
                  {isDomainSaved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
            </div>

            <div className="md:col-span-4 p-3 rounded-none bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] text-xs text-[#71717A] dark:text-[#8E8E93] space-y-1">
              <span className="font-black uppercase tracking-wider text-[#18181B] dark:text-white block text-[10px]">Registro DNS CNAME:</span>
              <p className="font-mono text-[10px] text-[#E1500A] bg-[#ECEAE4] dark:bg-[#0E0F12] p-1.5 border border-[#C8C4B7] dark:border-[#222328]">
                CNAME @ → cname.loomisuite.com
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {demoState.properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] overflow-hidden shadow-2xs hover:border-[#E1500A] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-[#ECEAE4] dark:bg-[#0E0F12]">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#18181B]/90 text-white px-2.5 py-1 rounded-none text-xs font-black uppercase tracking-wider">
                  {prop.neighborhood}, {prop.city}
                </div>

                <div className="absolute top-3 right-3 bg-[#18181B]/90 text-white px-2 py-0.5 rounded-none text-xs font-black flex items-center gap-1 shadow-xs border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-[#E1500A] text-[#E1500A]" />
                  <span>{prop.rating} ({prop.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5">
                <h4 className="text-base font-black uppercase tracking-tight text-[#18181B] dark:text-white mb-0.5">{prop.name}</h4>
                <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mb-4 font-bold">{prop.address} · {prop.type}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717A] dark:text-[#8E8E93] mb-4 pb-4 border-b border-[#C8C4B7] dark:border-[#222328] font-bold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#E1500A]" />
                    Hasta {prop.maxGuests} huéspedes
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-[#E1500A]" />
                    {prop.bedrooms} hab.
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-[#E1500A]" />
                    {prop.bathrooms} baños
                  </span>
                </div>

                {/* Price editor */}
                {!isEmployeeMode ? (
                  <div className="bg-white dark:bg-[#18181B] rounded-none p-3 border border-[#C8C4B7] dark:border-[#222328] mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-black uppercase tracking-wider block">Tarifa por noche</span>
                      {editingPriceId === prop.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border rounded-none bg-white dark:bg-[#0C0D0F] text-[#18181B] dark:text-white font-black border-[#C8C4B7] dark:border-[#222328]"
                          />
                          <button
                            onClick={() => handleSavePrice(prop.id)}
                            className="text-[10px] bg-[#E1500A] text-white font-black uppercase tracking-wider px-2 py-1 rounded-none cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#18181B] dark:text-white">USD ${prop.basePrice}</span>
                          <button
                            onClick={() => {
                              setEditingPriceId(prop.id);
                              setTempPrice(prop.basePrice);
                            }}
                            className="text-[#71717A] hover:text-[#E1500A] dark:hover:text-[#E1500A] p-1 cursor-pointer transition-colors"
                            title="Editar tarifa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-black uppercase tracking-wider block">Tarifa Limpieza</span>
                      <span className="text-sm font-black text-[#18181B] dark:text-white">USD ${prop.cleaningFee}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#18181B] rounded-none p-3 border border-[#C8C4B7] dark:border-[#222328] mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#E1500A] font-black uppercase tracking-wider block">Gestión de Unidad</span>
                      <span className="text-xs text-[#71717A] dark:text-[#8E8E93] font-bold">Capacidad: {prop.maxGuests} personas</span>
                    </div>
                    <span className="text-[10px] font-black bg-[#ECEAE4] dark:bg-[#0E0F12] text-[#71717A] dark:text-[#8E8E93] px-2 py-1 rounded-none border border-[#C8C4B7] dark:border-[#222328] uppercase">
                      🔒 Solo Admin
                    </span>
                  </div>
                )}

                {/* Smart lock & Wi-Fi details */}
                <div className="space-y-2 text-xs text-[#71717A] dark:text-[#8E8E93]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <KeyRound className="w-3.5 h-3.5 text-[#E1500A]" />
                      Acceso / Cerradura:
                    </span>
                    <span className="font-bold text-[#18181B] dark:text-white">{prop.smartLock.brand}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Wifi className="w-3.5 h-3.5 text-[#E1500A]" />
                      Wi-Fi Huéspedes:
                    </span>
                    <span className="font-mono font-bold text-[#18181B] dark:text-white">{prop.wifiNetwork}</span>
                  </div>
                </div>

                {/* Sync Channels Status */}
                <div className="mt-4 pt-3 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs">
                  <span className="text-[#71717A] dark:text-[#8E8E93] text-[10px] font-black uppercase tracking-wider">iCal Activo:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider ${prop.syncStatus.airbnb ? 'bg-[#E1500A]/15 text-[#E1500A] border border-[#E1500A]/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      Airbnb
                    </span>
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider ${prop.syncStatus.booking ? 'bg-[#E1500A]/15 text-[#E1500A] border border-[#E1500A]/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      Booking
                    </span>
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider ${prop.syncStatus.vrbo ? 'bg-[#E1500A]/15 text-[#E1500A] border border-[#E1500A]/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      VRBO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking Footer */}
            <div className="p-3.5 bg-white dark:bg-[#18181B] border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between gap-3">
              <div className="text-xs text-[#71717A] dark:text-[#8E8E93] font-bold truncate">
                <span className="block text-[9px] font-black uppercase tracking-wider text-[#71717A] dark:text-[#8E8E93]">Canal directo (0% comisiones)</span>
                <span className="font-mono text-[#18181B] dark:text-white text-[11px]">
                  {isDomainSaved && customDomain ? customDomain : 'loomisuite.com'}/{prop.id}
                </span>
              </div>
              <button
                onClick={() => handleCopyDirectLink(prop.id)}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-[#18181B] dark:bg-white dark:text-[#18181B] hover:bg-[#E1500A] dark:hover:bg-[#E1500A] dark:hover:text-white px-3 py-1.5 rounded-none transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                {copiedId === prop.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
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
