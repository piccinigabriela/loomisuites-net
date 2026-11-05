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
import { BulkUnitsModal } from './BulkUnitsModal';

const inputCls =
  'w-full min-h-[44px] px-3.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]';

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="space-y-3">
    <div>
      <h5 className="text-sm font-bold uppercase tracking-wide text-[#A94F12] dark:text-[#F5A35C]">{title}</h5>
      {hint && <p className="mt-0.5 text-sm text-stone-800 dark:text-stone-200">{hint}</p>}
    </div>
    {children}
  </section>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <span className="block mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{label}</span>
    {children}
  </div>
);

interface DemoPropertiesProps {
  demoState: DemoState;
  onUpdatePropertyPrice: (propertyId: string, newPrice: number) => void;
  onSaveProperty?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  /** Cargar varias unidades de una vez (y, si se pide, la categoría en Tarifas) */
  onSaveProperties?: (units: Property[], categoryForPricing: string | null) => Promise<void> | void;
  isEmployeeMode?: boolean;
}

export const DemoProperties: React.FC<DemoPropertiesProps> = ({
  demoState,
  onUpdatePropertyPrice,
  onSaveProperty,
  onDeleteProperty,
  onSaveProperties,
  isEmployeeMode = false,
}) => {
  const [bulkOpen, setBulkOpen] = useState(false);
  const isApp = isAppMode();
  const uid = isApp ? auth.currentUser?.uid : null;
  const [copiedCalLink, setCopiedCalLink] = useState<'airbnb' | 'booking' | null>(null);

  // Modal State for Create/Edit Property
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

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
        smartLock: { enabled: false, brand: '' },
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

  const calendarsOf = (prop: Property) =>
    [
      prop.icalAirbnbUrl?.trim() || prop.syncStatus?.airbnb ? 'Airbnb' : '',
      prop.icalBookingUrl?.trim() || prop.syncStatus?.booking ? 'Booking' : '',
      prop.icalOtherUrl?.trim() || prop.syncStatus?.vrbo ? 'Otro portal' : '',
      prop.icalGoogleUrl?.trim() ? 'Google' : '',
    ].filter(Boolean);

  return (
    <div className="space-y-6 font-sans text-stone-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Unidades ({demoState.properties.length})</h3>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Tus cabañas o departamentos, con su precio y sus calendarios.</p>
        </div>

        {!isEmployeeMode && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenCreate}
              className="min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold text-[#111] bg-[#E67E22] hover:bg-[#D35400] px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva unidad</span>
            </button>
            {onSaveProperties && (
              <button
                onClick={() => setBulkOpen(true)}
                className="min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold bg-white dark:bg-transparent border-2 border-[#E67E22] px-4 rounded-xl cursor-pointer hover:bg-[#E67E22]/10"
              >
                <Plus className="w-4 h-4" />
                <span>Varias juntas</span>
              </button>
            )}
            <button
              onClick={() => setShowOnboardingGuide(!showOnboardingGuide)}
              className="min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold border-2 border-stone-300 dark:border-zinc-600 px-4 rounded-xl cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <FileText className="w-4 h-4" />
              <span>{showOnboardingGuide ? 'Ocultar guía' : 'Guía'}</span>
            </button>
          </div>
        )}
      </div>

      {bulkOpen && onSaveProperties && (
        <BulkUnitsModal
          existingNames={demoState.properties.map((p) => p.name)}
          defaults={{
            address: demoState.welcomeGuide?.locationAddress || '',
            wifiNetwork: demoState.welcomeGuide?.wifiNetwork || '',
            wifiPassword: demoState.welcomeGuide?.wifiPassword || '',
          }}
          onSave={onSaveProperties}
          onClose={() => setBulkOpen(false)}
        />
      )}

      {showOnboardingGuide && !isEmployeeMode && (
        <OnboardingGuideView
          complexName={demoState.welcomeGuide?.propertyName || 'Mi Complejo'}
          onClose={() => setShowOnboardingGuide(false)}
        />
      )}

      {demoState.properties.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 p-10 text-center">
          <Building2 className="w-8 h-8 mx-auto text-[#E67E22]" />
          <p className="mt-3 text-lg font-bold">Todavía no cargaste unidades</p>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Sumá la primera o cargá varias juntas.</p>
        </div>
      ) : (
        <ul className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] divide-y divide-stone-200 dark:divide-zinc-800 overflow-hidden">
          {demoState.properties.map((prop) => {
            const isDemoPhotoInApp = isApp && prop.imageUrl && prop.imageUrl.startsWith('/cabanas/');
            const hasNoImage = !prop.imageUrl || prop.imageUrl.trim() === '' || isDemoPhotoInApp;
            const cals = calendarsOf(prop);
            const details = [
              prop.type,
              `hasta ${prop.maxGuests} ${prop.maxGuests === 1 ? 'huésped' : 'huéspedes'}`,
              prop.bedrooms ? `${prop.bedrooms} ${prop.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}` : '',
              prop.bathrooms ? `${prop.bathrooms} ${prop.bathrooms === 1 ? 'baño' : 'baños'}` : '',
            ].filter(Boolean);
            return (
              <li key={prop.id} className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => !isEmployeeMode && handleOpenEdit(prop)}
                    className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer"
                    aria-label={hasNoImage ? `Agregar foto de ${prop.name}` : `Foto de ${prop.name}`}
                  >
                    {hasNoImage ? (
                      <Camera className="w-6 h-6 text-stone-700 dark:text-stone-300" />
                    ) : (
                      <img src={prop.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="text-lg font-bold truncate">{prop.name}</p>
                    <p className="text-sm text-stone-800 dark:text-stone-200 truncate">{details.join(' · ')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
                  {!isEmployeeMode && (
                    <div className="min-w-[110px]">
                      <p className="text-lg font-bold tabular-nums">{formatCurrency(prop.basePrice)}</p>
                      <p className="text-sm text-stone-800 dark:text-stone-200">
                        por noche{prop.cleaningFee ? ` · limpieza ${formatCurrency(prop.cleaningFee)}` : ''}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 min-w-[150px]">
                    {cals.length > 0 ? (
                      cals.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
                        >
                          <Check className="w-3.5 h-3.5" /> {c}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-sm font-semibold bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100">
                        Sin calendarios
                      </span>
                    )}
                  </div>

                  {!isEmployeeMode && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="min-h-[40px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
                      >
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        aria-label={`Eliminar ${prop.name}`}
                        title="Eliminar unidad"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Nueva unidad / Editar unidad: por secciones, como en Areca */}
      {modalMode && activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" onClick={() => setModalMode(null)}>
          <div
            className="bg-white dark:bg-[#18191E] text-stone-900 dark:text-white rounded-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-xl shadow-2xl max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={modalMode === 'create' ? 'Nueva unidad' : 'Editar unidad'}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
              <h4 className="text-lg font-bold">{modalMode === 'create' ? 'Nueva unidad' : `Editar ${activeProperty.name || 'unidad'}`}</h4>
              <button onClick={() => setModalMode(null)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
              <Section title="La unidad">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={activeProperty.name}
                    placeholder="Por ejemplo: Cabaña Lapacho"
                    onChange={(e) => setActiveProperty({ ...activeProperty, name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo">
                    <input
                      type="text"
                      value={activeProperty.type}
                      placeholder="Cabaña, departamento…"
                      onChange={(e) => setActiveProperty({ ...activeProperty, type: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Huéspedes (máximo)">
                    <input
                      type="number"
                      min={1}
                      value={activeProperty.maxGuests}
                      onChange={(e) => setActiveProperty({ ...activeProperty, maxGuests: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Dormitorios">
                    <input
                      type="number"
                      min={0}
                      value={activeProperty.bedrooms}
                      onChange={(e) => setActiveProperty({ ...activeProperty, bedrooms: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Baños">
                    <input
                      type="number"
                      min={0}
                      value={activeProperty.bathrooms}
                      onChange={(e) => setActiveProperty({ ...activeProperty, bathrooms: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Precio" hint="El precio de cada noche sale de Administración → Tarifas. Este es el de referencia si no cargaste tarifas.">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`Por noche (${getActiveCurrency()})`}>
                    <input
                      type="number"
                      min={0}
                      value={activeProperty.basePrice}
                      onChange={(e) => setActiveProperty({ ...activeProperty, basePrice: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`Limpieza (${getActiveCurrency()})`}>
                    <input
                      type="number"
                      min={0}
                      value={activeProperty.cleaningFee}
                      onChange={(e) => setActiveProperty({ ...activeProperty, cleaningFee: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Para el huésped" hint="Aparece en la guía de esta unidad.">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Red wifi">
                    <input
                      type="text"
                      value={activeProperty.wifiNetwork}
                      onChange={(e) => setActiveProperty({ ...activeProperty, wifiNetwork: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Clave wifi">
                    <input
                      type="text"
                      value={activeProperty.wifiPassword}
                      onChange={(e) => setActiveProperty({ ...activeProperty, wifiPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Foto">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
                    {activeProperty.imageUrl ? (
                      <img src={activeProperty.imageUrl} alt="Vista previa de la unidad" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-stone-700 dark:text-stone-300" />
                    )}
                    {isCompressingPhoto && (
                      <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#F5A35C]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="min-h-[40px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800">
                      <Camera className="w-4 h-4" />
                      <span>{activeProperty.imageUrl ? 'Cambiar' : 'Subir foto'}</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isCompressingPhoto} />
                    </label>
                    {activeProperty.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveProperty({ ...activeProperty, imageUrl: '' });
                          setPhotoError(null);
                        }}
                        className="min-h-[40px] px-4 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
                {photoError && <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{photoError}</p>}
              </Section>

              <Section
                title="Calendarios conectados"
                hint="En Airbnb y Booking buscá Exportar calendario (o Sincronizar calendarios) y pegá acá el enlace que termina en .ics."
              >
                {(
                  [
                    ['icalAirbnbUrl', 'Airbnb', 'https://www.airbnb.com/calendar/ical/...'],
                    ['icalBookingUrl', 'Booking', 'https://admin.booking.com/hotel/hoteladmin/ical/...'],
                    ['icalOtherUrl', 'Otro portal (opcional)', 'https://...'],
                    ['icalGoogleUrl', 'Google Calendar (opcional)', 'https://calendar.google.com/calendar/ical/...'],
                  ] as Array<['icalAirbnbUrl' | 'icalBookingUrl' | 'icalOtherUrl' | 'icalGoogleUrl', string, string]>
                ).map(([key, label, ph]) => {
                  const val = (activeProperty[key] as string) || '';
                  return (
                    <Field key={key} label={label}>
                      <input
                        type="url"
                        value={val}
                        placeholder={ph}
                        onChange={(e) => setActiveProperty({ ...activeProperty, [key]: e.target.value })}
                        className={inputCls}
                      />
                      {val.trim() !== '' && !val.trim().startsWith('https://') && (
                        <span className="block mt-1 text-sm font-semibold text-amber-800 dark:text-amber-300">Pegá el enlace completo: empieza con https://</span>
                      )}
                      {key === 'icalAirbnbUrl' && (
                        <label className="flex items-start gap-2 pt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(activeProperty.importAirbnbBlocks)}
                            onChange={(e) => setActiveProperty({ ...activeProperty, importAirbnbBlocks: e.target.checked })}
                            className="mt-1 w-4 h-4 accent-[#E67E22]"
                          />
                          <span className="text-sm text-stone-900 dark:text-stone-100">
                            Traer también las fechas bloqueadas de Airbnb.{' '}
                            <span className="text-stone-800 dark:text-stone-200">Dejalo sin marcar si conectaste otros calendarios a Airbnb.</span>
                          </span>
                        </label>
                      )}
                      {key === 'icalGoogleUrl' && (
                        <span className="block mt-1 text-sm text-stone-800 dark:text-stone-200">
                          Configuración → el calendario → Integrar el calendario → Dirección secreta en formato iCal. Usá un calendario solo para esta unidad.
                        </span>
                      )}
                    </Field>
                  );
                })}

                {isApp && modalMode === 'edit' && uid && (
                  <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 p-4 space-y-3">
                    <p className="text-base font-bold">El calendario de Loomi, para pegar en cada portal</p>
                    {(['airbnb', 'booking'] as const).map((para) => {
                      const link = `https://ical.loomisuite.net/cal/${uid}/${activeProperty.id}.ics?para=${para}`;
                      return (
                        <div key={para}>
                          <span className="block text-sm font-semibold mb-1">{para === 'airbnb' ? 'Para Airbnb' : 'Para Booking'}</span>
                          <div className="flex items-center gap-2">
                            <input type="text" readOnly value={link} className={`${inputCls} font-mono text-xs`} />
                            <button
                              type="button"
                              onClick={() => {
                                copyToClipboard(link);
                                setCopiedCalLink(para);
                                setTimeout(() => setCopiedCalLink(null), 2500);
                              }}
                              className="min-h-[44px] px-4 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] font-bold text-sm shrink-0 cursor-pointer"
                            >
                              {copiedCalLink === para ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-sm text-stone-900 dark:text-stone-100">Pegalo en Airbnb o Booking en Importar calendario: así bloquean solas lo que se reserva en Loomi.</p>
                  </div>
                )}
              </Section>
            </div>

            {formValidationError && (
              <p className="mx-6 mb-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm font-semibold">{formValidationError}</p>
            )}

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 dark:border-zinc-800">
              <button onClick={() => setModalMode(null)} className="min-h-[44px] px-5 rounded-xl text-sm font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!activeProperty.name || activeProperty.name.trim() === '') {
                    setFormValidationError('Ponele un nombre a la unidad.');
                    return;
                  }
                  if (!activeProperty.basePrice || activeProperty.basePrice <= 0) {
                    setFormValidationError('Cargá el precio por noche.');
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
                }}
                className="min-h-[44px] px-6 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-sm font-bold cursor-pointer"
              >
                {modalMode === 'create' ? 'Crear unidad' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
