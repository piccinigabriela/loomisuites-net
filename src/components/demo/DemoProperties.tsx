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
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { DemoState, Property } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { OnboardingGuideView } from './OnboardingGuideView';

interface DemoPropertiesProps {
  demoState: DemoState;
  onUpdatePropertyPrice: (propertyId: string, newPrice: number) => void;
  onSaveProperty?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  isEmployeeMode?: boolean;
}

export const DemoProperties: React.FC<DemoPropertiesProps> = ({
  demoState,
  onUpdatePropertyPrice,
  onSaveProperty,
  onDeleteProperty,
  isEmployeeMode = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Modal State for Create/Edit Property
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  // Custom Domain state
  const [customDomain, setCustomDomain] = useState<string>('reservas.misalojamientos.com');
  const [isDomainSaved, setIsDomainSaved] = useState<boolean>(true);
  const [showDomainConfig, setShowDomainConfig] = useState<boolean>(false);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState<boolean>(false);

  const handleCopyDirectLink = (propertyId: string) => {
    const link = isDomainSaved && customDomain
      ? `https://${customDomain}/${propertyId}`
      : `${window.location.origin}/reserva-directa/${propertyId}`;
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

  const handleOpenCreate = () => {
    setActiveProperty({
      id: `prop-${Date.now()}`,
      name: 'Nueva Cabaña',
      type: 'Cabaña',
      address: demoState.welcomeGuide?.locationAddress || 'Dirección del Complejo',
      city: 'Complejo',
      neighborhood: 'Centro',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      basePrice: 50,
      cleaningFee: 15,
      imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviewsCount: 0,
      status: 'active',
      syncStatus: { airbnb: false, booking: false, vrbo: false },
      smartLock: { enabled: true, brand: 'Yale Smart' },
      wifiNetwork: '(a confirmar)',
      wifiPassword: '(a confirmar)',
    });
    setModalMode('create');
  };

  const handleOpenEdit = (prop: Property) => {
    setActiveProperty({ ...prop });
    setModalMode('edit');
  };

  const handleDelete = (propId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasFuture = (demoState.reservations || []).some(
      (r) => r.propertyId === propId && r.checkOut >= todayStr
    );
    if (hasFuture) {
      alert('⚠️ No se puede borrar la unidad porque tiene reservas futuras activas.');
      return;
    }
    if (confirm('¿Estás seguro de que deseás eliminar esta unidad?')) {
      onDeleteProperty?.(propId);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> INVENTARIO • DEPARTAMENTOS & SUITES
          </span>
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-[#E67E22]" />
            <span>Unidades Activas ({demoState.properties.length})</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
            Tarifas base por noche, credenciales de Wi-Fi y enlaces de reserva directa sin comisiones.
          </p>
        </div>

        {!isEmployeeMode && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleOpenCreate}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#E67E22] hover:bg-[#D35400] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Unidad</span>
            </button>
            <button
              onClick={() => setShowOnboardingGuide(!showOnboardingGuide)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-zinc-800 hover:border-orange-300 border border-stone-200/80 dark:border-zinc-700 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showOnboardingGuide ? 'Ocultar Guía' : 'Guía'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Onboarding Guide printable cheat sheet card */}
      {showOnboardingGuide && !isEmployeeMode && (
        <OnboardingGuideView
          complexName={demoState.welcomeGuide?.propertyName || 'Mi Complejo'}
          onClose={() => setShowOnboardingGuide(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {demoState.properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-orange-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                  {prop.neighborhood}, {prop.city}
                </div>

                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                  <span>{prop.rating} ({prop.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-base font-bold text-stone-800 dark:text-stone-100 tracking-tight">{prop.name}</h4>
                  {!isEmployeeMode && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="text-stone-400 hover:text-[#E67E22] p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar unidad"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="text-stone-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Eliminar unidad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-4 font-medium">{prop.address} • {prop.type}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mb-4 pb-4 border-b border-stone-100 dark:border-zinc-800 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#E67E22]" />
                    Hasta {prop.maxGuests} huéspedes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#E67E22]" />
                    {prop.bedrooms} hab.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-[#E67E22]" />
                    {prop.bathrooms} baños
                  </span>
                </div>

                {/* Price editor */}
                {!isEmployeeMode ? (
                  <div className="bg-stone-50/70 dark:bg-zinc-800/50 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider block">Tarifa por noche</span>
                      {editingPriceId === prop.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-zinc-900 text-stone-800 dark:text-stone-100 font-bold border-stone-200 dark:border-zinc-700"
                          />
                          <button
                            onClick={() => handleSavePrice(prop.id)}
                            className="text-[10px] bg-[#E67E22] text-white font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-bold text-stone-800 dark:text-stone-100">USD ${prop.basePrice}</span>
                          <button
                            onClick={() => {
                              setEditingPriceId(prop.id);
                              setTempPrice(prop.basePrice);
                            }}
                            className="text-stone-400 hover:text-[#E67E22] p-1 cursor-pointer transition-colors"
                            title="Editar tarifa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider block">Tarifa Limpieza</span>
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-100">USD ${prop.cleaningFee}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50/70 dark:bg-zinc-800/50 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#E67E22] font-semibold uppercase tracking-wider block">Gestión de Unidad</span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Capacidad: {prop.maxGuests} personas</span>
                    </div>
                    <span className="text-[10px] font-medium bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-md">
                      🔒 Solo Admin
                    </span>
                  </div>
                )}

                {/* Smart lock & Wi-Fi details with Zen copy button */}
                <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                      Acceso / Cerradura:
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">{prop.smartLock.brand}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wifi className="w-3.5 h-3.5 text-stone-400" />
                      Wi-Fi Huéspedes:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-stone-700 dark:text-stone-300">{prop.wifiNetwork}</span>
                      <button
                        onClick={() => {
                          copyToClipboard(prop.wifiNetwork);
                          setCopiedId(`wifi-${prop.id}`);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-[11px] text-stone-400 hover:text-[#E67E22] px-2 py-0.5 rounded-lg hover:bg-orange-50/60 transition-colors cursor-pointer"
                      >
                        {copiedId === `wifi-${prop.id}` ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sync Channels Status */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400 dark:text-stone-500 text-[10px] font-semibold uppercase tracking-wider">iCal Activo:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${prop.syncStatus.airbnb ? 'bg-orange-50 text-[#E67E22] border border-orange-100/60' : 'bg-stone-100 text-stone-400'}`}>
                      Airbnb
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${prop.syncStatus.booking ? 'bg-orange-50 text-[#E67E22] border border-orange-100/60' : 'bg-stone-100 text-stone-400'}`}>
                      Booking
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${prop.syncStatus.vrbo ? 'bg-orange-50 text-[#E67E22] border border-orange-100/60' : 'bg-stone-100 text-stone-400'}`}>
                      VRBO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking Footer */}
            <div className="p-3.5 bg-stone-50/60 dark:bg-zinc-800/40 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                <span className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500">Motor directo (0% comisiones)</span>
                <span className="font-mono text-stone-700 dark:text-stone-300 text-[11px]">
                  {window.location.host}/{prop.id}
                </span>
              </div>
              <button
                onClick={() => handleCopyDirectLink(prop.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-zinc-800 hover:text-[#E67E22] hover:border-orange-200 border border-stone-200/80 dark:border-zinc-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {copiedId === prop.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
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

      {/* Property Create/Edit Modal */}
      {modalMode && activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
              <h4 className="text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E67E22]" />
                <span>{modalMode === 'create' ? 'Nueva Unidad de Alojamiento' : 'Editar Unidad'}</span>
              </h4>
              <button
                onClick={() => setModalMode(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nombre de la unidad:</label>
                <input
                  type="text"
                  value={activeProperty.name}
                  onChange={(e) => setActiveProperty({ ...activeProperty, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tipo de unidad:</label>
                  <input
                    type="text"
                    value={activeProperty.type}
                    onChange={(e) => setActiveProperty({ ...activeProperty, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Capacidad (huéspedes):</label>
                  <input
                    type="number"
                    min={1}
                    value={activeProperty.maxGuests}
                    onChange={(e) => setActiveProperty({ ...activeProperty, maxGuests: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Precio base por noche (USD):</label>
                  <input
                    type="number"
                    min={0}
                    value={activeProperty.basePrice}
                    onChange={(e) => setActiveProperty({ ...activeProperty, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tarifa de limpieza (USD):</label>
                  <input
                    type="number"
                    min={0}
                    value={activeProperty.cleaningFee}
                    onChange={(e) => setActiveProperty({ ...activeProperty, cleaningFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Red Wi-Fi:</label>
                  <input
                    type="text"
                    value={activeProperty.wifiNetwork}
                    onChange={(e) => setActiveProperty({ ...activeProperty, wifiNetwork: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Clave Wi-Fi:</label>
                  <input
                    type="text"
                    value={activeProperty.wifiPassword}
                    onChange={(e) => setActiveProperty({ ...activeProperty, wifiPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Marca / Cerradura inteligente:</label>
                <input
                  type="text"
                  value={activeProperty.smartLock.brand}
                  onChange={(e) => setActiveProperty({
                    ...activeProperty,
                    smartLock: { ...activeProperty.smartLock, brand: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors font-semibold cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (activeProperty) {
                    onSaveProperty?.(activeProperty);
                    setModalMode(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold transition-colors cursor-pointer text-xs shadow-xs"
              >
                Guardar Unidad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
