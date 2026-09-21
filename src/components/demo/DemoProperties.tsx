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
} from 'lucide-react';
import { DemoState, Property } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';

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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-600" />
            <span>Cabañas y Habitaciones ({demoState.properties.length})</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tarifas base, accesos (llaves/cerradura) y enlaces de reserva directa para enviar por WhatsApp.
          </p>
        </div>

        {!isEmployeeMode && (
          <button
            onClick={() => setShowDomainConfig(!showDomainConfig)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-rose-600" />
            <span>{showDomainConfig ? 'Ocultar Configuración Web' : 'Configurar Dominio Propio'}</span>
          </button>
        )}
      </div>

      {/* Dominio Propio Configuration Card */}
      {showDomainConfig && !isEmployeeMode && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50/50 via-zinc-50 to-white dark:from-rose-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dominio Propio para Motor Directo (Add-on Opcional)</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  El cliente registra y abona su dominio (.com o .com.ar). Loomi provee la vinculación DNS y el certificado SSL gratuito.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SSL Seguro Activo</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Tu dominio personalizado:</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">https://</span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setIsDomainSaved(false);
                  }}
                  placeholder="ej: reservas.misalojamientos.com"
                  className="flex-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <button
                  onClick={() => setIsDomainSaved(true)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                >
                  {isDomainSaved ? 'Guardado' : 'Guardar Dominio'}
                </button>
              </div>
            </div>

            <div className="md:col-span-4 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-[11px]">Registro DNS CNAME:</span>
              <p className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-700">
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
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {prop.neighborhood}, {prop.city}
                </div>

                <div className="absolute top-3 right-3 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{prop.rating} ({prop.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{prop.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{prop.address} • {prop.type}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    Hasta {prop.maxGuests} huéspedes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-zinc-400" />
                    {prop.bedrooms} hab.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-zinc-400" />
                    {prop.bathrooms} baños
                  </span>
                </div>

                {/* Price editor */}
                {!isEmployeeMode ? (
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-zinc-200/80 dark:border-zinc-700/80 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">Tarifa por noche</span>
                      {editingPriceId === prop.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                          />
                          <button
                            onClick={() => handleSavePrice(prop.id)}
                            className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">${prop.basePrice} USD</span>
                          <button
                            onClick={() => {
                              setEditingPriceId(prop.id);
                              setTempPrice(prop.basePrice);
                            }}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                            title="Editar tarifa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">Tarifa Limpieza</span>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">${prop.cleaningFee} USD</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200/70 dark:border-amber-900/60 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold block">Gestión de Unidad</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Capacidad: {prop.maxGuests} personas</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-1 rounded-md">
                      🔒 Tarifas Reservadas para Administración
                    </span>
                  </div>
                )}

                {/* Smart lock & Wi-Fi details */}
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Cerradura inteligente:
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{prop.smartLock.brand}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Wifi className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Wi-Fi Huéspedes:
                    </span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{prop.wifiNetwork}</span>
                  </div>
                </div>

                {/* Sync Channels Status */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Sincronización activa:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.airbnb ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      Airbnb
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.booking ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      Booking
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.vrbo ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      VRBO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">
                <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">Canal directo (0% comisiones)</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[11px]">
                  {isDomainSaved && customDomain ? customDomain : 'loomisuite.com'}/{prop.id}
                </span>
              </div>
              <button
                onClick={() => handleCopyDirectLink(prop.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 border border-emerald-200/60 dark:border-emerald-800/60"
              >
                {copiedId === prop.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
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
