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
  Camera,
} from 'lucide-react';
import { DemoState, Property } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { toLocalDateStr, formatCurrency, getActiveCurrency } from '../../data/initialData';
import { OnboardingGuideView } from './OnboardingGuideView';
import { isAppMode } from '../../lib/appMode';
import { auth } from '../../lib/firebase';

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
  const isApp = isAppMode();
  const uid = isApp ? auth.currentUser?.uid : null;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCalLink, setCopiedCalLink] = useState<'airbnb' | 'booking' | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Modal State for Create/Edit Property
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Custom Domain state
  const [customDomain, setCustomDomain] = useState<string>('reservas.misalojamientos.com');
  const [isDomainSaved, setIsDomainSaved] = useState<boolean>(true);
  const [showDomainConfig, setShowDomainConfig] = useState<boolean>(false);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState<boolean>(false);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo seleccionado no es una imagen.'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al procesar la imagen.'));
        img.onload = () => {
          const processCanvas = (maxSide: number, quality: number): string => {
            let width = img.width;
            let height = img.height;

            if (width > maxSide || height > maxSide) {
              if (width > height) {
                height = Math.round((height * maxSide) / width);
                width = maxSide;
              } else {
                width = Math.round((width * maxSide) / height);
                height = maxSide;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Error al crear lienzo de imagen.');
            }
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL('image/jpeg', quality);
          };

          try {
            // Lado mayor máximo 1200px, JPEG calidad 0.7
            let dataUrl = processCanvas(1200, 0.7);

            // Si el resultado pasa de 300 KB, reintentar con 1000px y calidad 0.6
            const base64Part = dataUrl.split(',')[1] || '';
            const sizeInBytes = (base64Part.length * 3) / 4;

            if (sizeInBytes > 307200) {
              dataUrl = processCanvas(1000, 0.6);
            }

            resolve(dataUrl);
          } catch (err: any) {
            reject(err);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('El archivo seleccionado no es una imagen.');
      e.target.value = '';
      return;
    }

    setPhotoError(null);
    setIsCompressingPhoto(true);

    try {
      const compressedDataUrl = await compressImageFile(file);
      if (activeProperty) {
        setActiveProperty({
          ...activeProperty,
          imageUrl: compressedDataUrl,
        });
      }
    } catch (err: any) {
      setPhotoError(err?.message || 'No se pudo procesar la imagen.');
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

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
    setPhotoError(null);
    setFormValidationError(null);
    if (isApp) {
      setActiveProperty({
        id: `prop-${Date.now()}`,
        name: '',
        type: 'Departamento',
        address: demoState.welcomeGuide?.locationAddress || '',
        city: '',
        neighborhood: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        basePrice: 0,
        cleaningFee: 0,
        imageUrl: '',
        rating: 0,
        reviewsCount: 0,
        status: 'active',
        syncStatus: { airbnb: false, booking: false, vrbo: false },
        smartLock: { enabled: false, brand: '' },
        wifiNetwork: demoState.welcomeGuide?.wifiNetwork || '',
        wifiPassword: demoState.welcomeGuide?.wifiPassword || '',
      });
    } else {
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
    }
    setModalMode('create');
  };

  const handleOpenEdit = (prop: Property) => {
    setPhotoError(null);
    setFormValidationError(null);
    setActiveProperty({ ...prop });
    setModalMode('edit');
  };

  const handleDelete = (propId: string) => {
    const todayStr = toLocalDateStr(new Date());
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
          <span className="air-hide text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> INVENTARIO • DEPARTAMENTOS & SUITES
          </span>
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-[#E67E22]" />
            <span>Unidades Activas ({demoState.properties.length})</span>
          </h3>
          <p className="air-hide text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
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
        {demoState.properties.map((prop) => {
          const isDemoPhotoInApp = isApp && prop.imageUrl && prop.imageUrl.startsWith('/cabanas/');
          const hasNoImage = !prop.imageUrl || prop.imageUrl.trim() === '' || isDemoPhotoInApp;

          let neighborhoodStr = prop.neighborhood ? prop.neighborhood.trim() : '';
          if (isApp && neighborhoodStr === 'Centro / Zona Residencial') {
            neighborhoodStr = '';
          }
          const cityStr = prop.city ? prop.city.trim() : '';
          let locationTag = '';
          if (neighborhoodStr && cityStr) {
            locationTag = `${neighborhoodStr}, ${cityStr}`;
          } else if (neighborhoodStr) {
            locationTag = neighborhoodStr;
          } else if (cityStr) {
            locationTag = cityStr;
          }

          return (
            <div
              key={prop.id}
              className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
                  {hasNoImage ? (
                    <button
                      onClick={() => handleOpenEdit(prop)}
                      className="w-full h-full bg-stone-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer group"
                    >
                      <Camera className="w-8 h-8 text-stone-400 dark:text-stone-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold">Agregá una foto de esta unidad</span>
                    </button>
                  ) : (
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {locationTag && (
                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                      {locationTag}
                    </div>
                  )}

                  {!isApp && prop.reviewsCount > 0 && (
                    <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                      <span>{prop.rating} ({prop.reviewsCount})</span>
                    </div>
                  )}
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
                          <span className="text-base font-bold text-stone-800 dark:text-stone-100">{formatCurrency(prop.basePrice)}</span>
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
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{formatCurrency(prop.cleaningFee)}</span>
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
                  {!(isApp && !prop.smartLock?.enabled) && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                        Acceso / Cerradura:
                      </span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {prop.smartLock?.brand || 'Habilitada'}
                      </span>
                    </div>
                  )}
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
            {!isApp && (
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
            )}
          </div>
        );
      })}
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
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Precio base por noche ({getActiveCurrency()}):</label>
                  <input
                    type="number"
                    min={0}
                    value={activeProperty.basePrice}
                    onChange={(e) => setActiveProperty({ ...activeProperty, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tarifa de limpieza ({getActiveCurrency()}):</label>
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

              {/* Foto de la unidad */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                <label className="block font-semibold text-stone-700 dark:text-stone-300">Foto de la unidad:</label>
                
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center">
                  {activeProperty.imageUrl ? (
                    <img
                      src={activeProperty.imageUrl}
                      alt="Vista previa de la unidad"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 gap-2 p-4 text-center">
                      <Camera className="w-8 h-8 text-stone-400" />
                      <span className="text-xs font-medium">Sin foto de la unidad</span>
                    </div>
                  )}

                  {isCompressingPhoto && (
                    <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#E67E22]" />
                      <span className="text-xs font-semibold">Procesando foto…</span>
                    </div>
                  )}
                </div>

                {photoError && (
                  <p className="text-xs font-semibold text-rose-500">{photoError}</p>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors cursor-pointer border border-stone-200 dark:border-zinc-700">
                    <Camera className="w-4 h-4 text-[#E67E22]" />
                    <span>{activeProperty.imageUrl ? 'Cambiar foto' : 'Subir foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isCompressingPhoto}
                    />
                  </label>

                  {activeProperty.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProperty({ ...activeProperty, imageUrl: '' });
                        setPhotoError(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar foto</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="smartLockEnabled"
                    checked={activeProperty.smartLock.enabled}
                    onChange={(e) => setActiveProperty({
                      ...activeProperty,
                      smartLock: { ...activeProperty.smartLock, enabled: e.target.checked }
                    })}
                    className="rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer"
                  />
                  <label htmlFor="smartLockEnabled" className="font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                    Tiene cerradura inteligente / acceso digital
                  </label>
                </div>
                {activeProperty.smartLock.enabled && (
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Marca / Cerradura inteligente:</label>
                    <input
                      type="text"
                      placeholder="ej. Yale Smart, Nuki, Código digital"
                      value={activeProperty.smartLock.brand}
                      onChange={(e) => setActiveProperty({
                        ...activeProperty,
                        smartLock: { ...activeProperty.smartLock, brand: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Nueva Sección: Calendarios conectados */}
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 space-y-3">
                <h5 className="font-bold text-stone-800 dark:text-stone-100 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#E67E22]" />
                  <span>Calendarios conectados</span>
                </h5>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Enlace iCal de Airbnb:</label>
                  <input
                    type="url"
                    value={activeProperty.icalAirbnbUrl || ''}
                    onChange={(e) => setActiveProperty({ ...activeProperty, icalAirbnbUrl: e.target.value })}
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                  {activeProperty.icalAirbnbUrl && activeProperty.icalAirbnbUrl.trim() !== '' && !activeProperty.icalAirbnbUrl.trim().startsWith('https://') && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                      Pegá el enlace completo, empieza con https://
                    </span>
                  )}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`importAirbnbBlocks-${activeProperty.id}`}
                      checked={Boolean(activeProperty.importAirbnbBlocks)}
                      onChange={(e) => setActiveProperty({ ...activeProperty, importAirbnbBlocks: e.target.checked })}
                      className="mt-0.5 rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer"
                    />
                    <label htmlFor={`importAirbnbBlocks-${activeProperty.id}`} className="cursor-pointer space-y-0.5 select-none">
                      <span className="block font-medium text-stone-700 dark:text-stone-300">
                        Importar también las fechas bloqueadas de Airbnb
                      </span>
                      <span className="block text-[11px] text-stone-500 dark:text-stone-400">
                        Dejala desmarcada si conectaste otros calendarios a Airbnb, para evitar bloqueos duplicados.
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Enlace iCal de Booking:</label>
                  <input
                    type="url"
                    value={activeProperty.icalBookingUrl || ''}
                    onChange={(e) => setActiveProperty({ ...activeProperty, icalBookingUrl: e.target.value })}
                    placeholder="https://admin.booking.com/hotel/hoteladmin/ical/..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                  {activeProperty.icalBookingUrl && activeProperty.icalBookingUrl.trim() !== '' && !activeProperty.icalBookingUrl.trim().startsWith('https://') && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                      Pegá el enlace completo, empieza con https://
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Otro portal (opcional):</label>
                  <input
                    type="url"
                    value={activeProperty.icalOtherUrl || ''}
                    onChange={(e) => setActiveProperty({ ...activeProperty, icalOtherUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                  {activeProperty.icalOtherUrl && activeProperty.icalOtherUrl.trim() !== '' && !activeProperty.icalOtherUrl.trim().startsWith('https://') && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                      Pegá el enlace completo, empieza with https://
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Google Calendar (dirección secreta en formato iCal):
                  </label>
                  <input
                    type="url"
                    value={activeProperty.icalGoogleUrl || ''}
                    onChange={(e) => setActiveProperty({ ...activeProperty, icalGoogleUrl: e.target.value })}
                    placeholder="https://calendar.google.com/calendar/ical/..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 font-medium"
                  />
                  {activeProperty.icalGoogleUrl && activeProperty.icalGoogleUrl.trim() !== '' && !activeProperty.icalGoogleUrl.trim().startsWith('https://') && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                      Pegá el enlace completo, empieza con https://
                    </span>
                  )}
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    En Google Calendar: Configuración → elegí el calendario → Integrar el calendario → Dirección secreta en formato iCal. Usá un calendario solo para esta unidad: cada evento se toma como fecha ocupada.
                  </p>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  En Airbnb y en Booking buscá la opción Exportar calendario o Sincronizar calendarios y copiá el enlace que termina en .ics.
                </p>

                {/* Tu calendario de Loomi (solo en modo app y si la unidad ya está guardada) */}
                {isApp && modalMode === 'edit' && uid && (
                  <div className="mt-3 pt-3 border-t border-dashed border-stone-200 dark:border-zinc-700 space-y-2 bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-xl">
                    <h6 className="font-bold text-stone-800 dark:text-stone-100 text-xs">
                      Tu calendario de Loomi (pegalo en cada portal):
                    </h6>

                    <div className="space-y-2">
                      <div>
                        <span className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-0.5">Para Airbnb:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={`https://ical.loomisuite.net/cal/${uid}/${activeProperty.id}.ics?para=airbnb`}
                            className="flex-1 p-2 text-[10px] font-mono rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const link = `https://ical.loomisuite.net/cal/${uid}/${activeProperty.id}.ics?para=airbnb`;
                              copyToClipboard(link);
                              setCopiedCalLink('airbnb');
                              setTimeout(() => setCopiedCalLink(null), 2500);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                          >
                            {copiedCalLink === 'airbnb' ? 'Enlace copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-0.5">Para Booking:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={`https://ical.loomisuite.net/cal/${uid}/${activeProperty.id}.ics?para=booking`}
                            className="flex-1 p-2 text-[10px] font-mono rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const link = `https://ical.loomisuite.net/cal/${uid}/${activeProperty.id}.ics?para=booking`;
                              copyToClipboard(link);
                              setCopiedCalLink('booking');
                              setTimeout(() => setCopiedCalLink(null), 2500);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                          >
                            {copiedCalLink === 'booking' ? 'Enlace copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed pt-1">
                      Pegalo en Airbnb o Booking en Importar calendario. Así bloquean solas las fechas que se reservan en Loomi.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {formValidationError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                ⚠️ {formValidationError}
              </div>
            )}

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
                    if (!activeProperty.name || activeProperty.name.trim() === '') {
                      setFormValidationError('Ingresá un nombre para la unidad');
                      alert('Ingresá un nombre para la unidad');
                      return;
                    }
                    if (!activeProperty.basePrice || activeProperty.basePrice <= 0) {
                      setFormValidationError('Ingresá la tarifa por noche');
                      alert('Ingresá la tarifa por noche');
                      return;
                    }

                    setFormValidationError(null);
                    const finalProp: Property = {
                      ...activeProperty,
                      syncStatus: {
                        airbnb: Boolean(activeProperty.icalAirbnbUrl && activeProperty.icalAirbnbUrl.trim() !== ''),
                        booking: Boolean(activeProperty.icalBookingUrl && activeProperty.icalBookingUrl.trim() !== ''),
                        vrbo: Boolean(activeProperty.icalOtherUrl && activeProperty.icalOtherUrl.trim() !== ''),
                      },
                    };
                    onSaveProperty?.(finalProp);
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
