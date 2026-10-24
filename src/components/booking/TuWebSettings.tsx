/**
 * Administración → Tu Web: crear el link, textos, fotos, unidades visibles y dominio propio.
 * Los cambios de textos, unidades, tarifas o reservas se publican solos desde App.tsx.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  ImagePlus,
  Loader2,
  Moon,
  Sun,
  Trash2,
  Trees,
  Mountain,
  X,
  Sunrise,
  Building2,
  Leaf,
  Wheat,
  BookOpen,
} from 'lucide-react';
import type { CurrencyCode, Property, Reservation, WelcomeGuideData } from '../../types';
import type { PricingSettings } from '../../lib/pricing';
import {
  allowedTheme,
  BASIC_THEMES,
  buildPublicSite,
  buildSiteBusy,
  PublicSitePhoto,
  siteUrl,
  slugify,
  slugProblem,
  visibleUnits,
  WebSiteSettings,
  whatsappDigits,
} from '../../lib/publicSite';
import {
  addSitePhoto,
  claimSlug,
  deleteSitePhoto,
  fetchSitePhotos,
  moveSite,
  updateSitePhoto,
} from '../../lib/publicSiteStore';
import { compressImage } from '../../lib/imageCompress';
import { PublicSiteView } from './PublicSiteView';

interface Props {
  uid: string;
  settings?: WebSiteSettings | null;
  onSaveSettings: (s: WebSiteSettings) => Promise<void>;
  guide?: WelcomeGuideData | null;
  complexName?: string;
  city?: string;
  properties: Property[];
  reservations: Reservation[];
  pricing?: Partial<PricingSettings> | null;
  currency?: CurrencyCode;
  onGoToPricing?: () => void;
  /** Diseños especiales habilitados por Loomi (subscriptions/{uid}.webDesigns) */
  webDesigns?: string[];
}

const card = 'bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 sm:p-6';
const h3 = 'text-lg font-bold text-stone-900 dark:text-white';
const help = 'text-base font-medium text-stone-800 dark:text-stone-200';
const label = 'text-sm font-bold text-stone-900 dark:text-white';
const inputCls =
  'w-full text-base font-medium px-3 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-base font-bold transition-colors cursor-pointer disabled:opacity-60';
const ghostBtn =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white text-base font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-60';

export const TuWebSettings: React.FC<Props> = ({
  uid,
  settings,
  onSaveSettings,
  guide,
  complexName,
  city,
  properties,
  reservations,
  pricing,
  currency,
  onGoToPricing,
  webDesigns,
}) => {
  const slug = settings?.slug || '';
  const [photos, setPhotos] = useState<PublicSitePhoto[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [busyMsg, setBusyMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    fetchSitePhotos(slug)
      .then((list) => alive && setPhotos(list))
      .catch(() => {})
      .finally(() => alive && setPhotosLoaded(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  const flashError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 6000);
  };

  // ---------- Sin web todavía: elegir el link ----------
  if (!slug) {
    return <CreateSite uid={uid} defaultName={guide?.propertyName || complexName || ''} onCreated={onSaveSettings} />;
  }

  const s: WebSiteSettings = settings!;
  const url = siteUrl(slug);
  const shown = visibleUnits(properties, s);
  const generalPhotos = photos.filter((p) => !p.unitId);
  const whats = whatsappDigits(s.whatsapp || guide?.hostPhone || '');
  const noPrice = shown.filter((p) => !(pricing?.assignments && pricing.assignments[p.id]) && !(Number(p.basePrice) > 0));

  const save = async (patch: Partial<WebSiteSettings>) => {
    try {
      await onSaveSettings({ ...s, ...patch });
    } catch {
      flashError('No se pudo guardar. Revisá la conexión y probá de nuevo.');
    }
  };

  const nextOrder = () => (photos.length ? Math.max(...photos.map((p) => p.order || 0)) + 1 : 1);

  const upload = async (files: FileList | null, unitId: string) => {
    if (!files || !files.length) return;
    const list = Array.from(files).slice(0, 12);
    let order = nextOrder();
    for (let i = 0; i < list.length; i++) {
      setBusyMsg(`Subiendo foto ${i + 1} de ${list.length}…`);
      try {
        const data = await compressImage(list[i]);
        const photo = { data, order: order++, unitId };
        const id = await addSitePhoto(slug, photo);
        setPhotos((prev) => [...prev, { ...photo, id }]);
      } catch {
        flashError(`No se pudo subir "${list[i].name}". Probá con otra foto.`);
      }
    }
    setBusyMsg('');
  };

  const removePhoto = async (p: PublicSitePhoto) => {
    try {
      await deleteSitePhoto(slug, p.id);
      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      flashError('No se pudo borrar la foto.');
    }
  };

  /** Mueve una foto un lugar dentro de su grupo (general o de una unidad) */
  const movePhoto = async (p: PublicSitePhoto, dir: -1 | 1) => {
    const group = photos.filter((x) => x.unitId === p.unitId);
    const i = group.findIndex((x) => x.id === p.id);
    const other = group[i + dir];
    if (!other) return;
    const a = p.order, b = other.order;
    setPhotos((prev) =>
      prev
        .map((x) => (x.id === p.id ? { ...x, order: b } : x.id === other.id ? { ...x, order: a } : x))
        .sort((x, y) => x.order - y.order)
    );
    try {
      await Promise.all([updateSitePhoto(slug, p.id, { order: b }), updateSitePhoto(slug, other.id, { order: a })]);
    } catch {
      flashError('No se pudo cambiar el orden.');
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const pending: string[] = [];
  if (!whats) pending.push('Falta el WhatsApp donde te llegan los pedidos.');
  if (photosLoaded && !generalPhotos.length) pending.push('Sumá al menos una foto de portada.');
  if (!shown.length) pending.push('No hay unidades visibles.');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Link y estado */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#E67E22]" /> Tu Web
          </h2>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              s.enabled ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100' : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'
            }`}
          >
            {s.enabled ? 'Publicada' : 'En pausa'}
          </span>
        </div>
        <p className="mt-4 text-lg font-bold text-stone-900 dark:text-white break-all">{url.replace('https://', '')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
            <ExternalLink className="w-4 h-4" /> Abrir
          </a>
          <button type="button" onClick={copy} className={ghostBtn}>
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar link'}
          </button>
          <button type="button" onClick={() => setShowPreview(true)} className={ghostBtn}>
            <Eye className="w-4 h-4" /> Ver cómo queda
          </button>
          <button type="button" onClick={() => save({ enabled: !s.enabled })} className={s.enabled ? ghostBtn : primaryBtn}>
            {s.enabled ? 'Pausar' : 'Publicar'}
          </button>
        </div>
        {pending.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {pending.map((p) => (
              <li key={p} className="text-base font-bold text-amber-800 dark:text-amber-200">
                • {p}
              </li>
            ))}
          </ul>
        )}
        <ChangeSlug uid={uid} slug={slug} onChanged={(newSlug) => save({ slug: newSlug })} />
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 text-base font-bold p-4">{errorMsg}</div>
      )}
      {busyMsg && (
        <div className="rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white text-base font-bold p-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {busyMsg}
        </div>
      )}

      {/* Textos */}
      <TextsCard settings={s} guide={guide} onSave={save} webDesigns={webDesigns || []} />

      {/* Fotos generales */}
      <div className={card}>
        <h3 className={h3}>Fotos del complejo</h3>
        <p className={`${help} mt-1`}>La primera es la portada. Horizontales y con buena luz se ven mejor.</p>
        <PhotoGrid photos={generalPhotos} onMove={movePhoto} onDelete={removePhoto} firstLabel="Portada" />
        <UploadButton onFiles={(f) => upload(f, '')} disabled={!!busyMsg} />
      </div>

      {/* Unidades */}
      <div className={card}>
        <h3 className={h3}>Unidades</h3>
        <p className={`${help} mt-1`}>Los precios salen de Tarifas y la disponibilidad, de tus reservas y calendarios.</p>
        {noPrice.length > 0 && (
          <p className="mt-3 text-base font-bold text-amber-800 dark:text-amber-200">
            Sin precio: {noPrice.map((p) => p.name).join(', ')}.{' '}
            {onGoToPricing && (
              <button type="button" onClick={onGoToPricing} className="underline underline-offset-4 cursor-pointer">
                Ir a Tarifas
              </button>
            )}
          </p>
        )}
        <div className="mt-5 space-y-6">
          {properties
            .slice()
            .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { numeric: true }))
            .map((p) => (
              <UnitBlock
                key={p.id}
                property={p}
                settings={s}
                photos={photos.filter((x) => x.unitId === p.id)}
                onSave={save}
                onUpload={(f) => upload(f, p.id)}
                onMove={movePhoto}
                onDelete={removePhoto}
                uploading={!!busyMsg}
              />
            ))}
        </div>
      </div>

      {/* Dominio propio */}
      <details className={`${card} group`}>
        <summary className={`${h3} cursor-pointer list-none flex items-center justify-between`}>
          ¿Tenés dominio propio?
          <span className="text-[#E67E22] text-base group-open:rotate-90 transition-transform">›</span>
        </summary>
        <div className={`${help} mt-4 space-y-3`}>
          <p>Tu web puede verse en tu propio dominio, por ejemplo www.tucomplejo.com.ar.</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Escribinos a Loomi con el dominio. Lo damos de alta y te pasamos el dato exacto para copiar.</li>
            <li>
              Donde administrás el dominio (DonWeb, Cloudflare, Hostinger u otro), creá un registro <b>CNAME</b> con nombre <b>www</b> y el
              destino que te pasamos.
            </li>
            <li>En unas horas, a veces hasta 48, tu web aparece en www.tudominio.</li>
          </ol>
          <p>Mientras tanto, el link de Loomi funciona siempre.</p>
        </div>
      </details>

      {showPreview && (
        <Preview
          onClose={() => setShowPreview(false)}
          settings={{ ...s, theme: allowedTheme(s.theme, webDesigns) }}
          guide={guide}
          complexName={complexName}
          city={city}
          properties={properties}
          reservations={reservations}
          pricing={pricing}
          currency={currency}
          photos={photos}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

const CreateSite: React.FC<{ uid: string; defaultName: string; onCreated: (s: WebSiteSettings) => Promise<void> }> = ({
  uid,
  defaultName,
  onCreated,
}) => {
  const [name, setName] = useState(() => slugify(defaultName));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    const slug = slugify(name);
    const problem = slugProblem(slug);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    const err = await claimSlug(uid, slug);
    if (err) {
      setSaving(false);
      return setError(err);
    }
    try {
      await onCreated({ slug, enabled: false, theme: 'noche' });
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={card}>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-[#E67E22]" /> Tu Web
        </h2>
        <p className={`${help} mt-3`}>
          Una página con tus fotos, tus precios y tu disponibilidad. El huésped elige fechas y te escribe por WhatsApp con todo armado. Sin
          comisiones.
        </p>
        <label className="block mt-6 space-y-2">
          <span className={label}>Elegí el nombre del link</span>
          <div className="flex items-center rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 overflow-hidden">
            <span className="pl-3 text-base font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">loomisuite.net/web/</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 min-w-0 text-base font-bold py-2.5 pr-3 bg-transparent text-stone-900 dark:text-white outline-none"
              placeholder="tucomplejo"
              maxLength={40}
            />
          </div>
        </label>
        {error && <p className="mt-3 text-base font-bold text-rose-700 dark:text-rose-300">{error}</p>}
        <button type="button" onClick={create} disabled={saving} className={`${primaryBtn} mt-5`}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Crear mi web
        </button>
        <p className={`${help} mt-4`}>Queda en pausa hasta que la publiques.</p>
      </div>
    </div>
  );
};

const ChangeSlug: React.FC<{ uid: string; slug: string; onChanged: (s: string) => Promise<void> }> = ({ uid, slug, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(slug);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-5 text-base font-bold text-stone-900 dark:text-white underline underline-offset-4 cursor-pointer">
        Cambiar el link
      </button>
    );
  }

  const change = async () => {
    const next = slugify(name);
    if (next === slug) return setOpen(false);
    const problem = slugProblem(next);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    const err = await claimSlug(uid, next);
    if (err) {
      setSaving(false);
      return setError(err);
    }
    try {
      await moveSite(slug, next);
      await onChanged(next);
      setOpen(false);
    } catch {
      setError('No se pudo cambiar. Probá de nuevo.');
    }
    setSaving(false);
  };

  return (
    <div className="mt-5 pt-5 border-t border-stone-200 dark:border-zinc-800 space-y-3">
      <p className={help}>El link viejo deja de funcionar: si ya lo compartiste, avisá el nuevo.</p>
      <div className="flex items-center rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 overflow-hidden">
        <span className="pl-3 text-base font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">loomisuite.net/web/</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          className="flex-1 min-w-0 text-base font-bold py-2.5 pr-3 bg-transparent text-stone-900 dark:text-white outline-none"
          maxLength={40}
        />
      </div>
      {error && <p className="text-base font-bold text-rose-700 dark:text-rose-300">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={change} disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Cambiar
        </button>
        <button type="button" onClick={() => setOpen(false)} className={ghostBtn}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

const TextsCard: React.FC<{
  settings: WebSiteSettings;
  guide?: WelcomeGuideData | null;
  onSave: (patch: Partial<WebSiteSettings>) => Promise<void>;
  webDesigns: string[];
}> = ({ settings, guide, onSave, webDesigns }) => {
  const [tagline, setTagline] = useState(settings.tagline ?? guide?.tagline ?? '');
  const [description, setDescription] = useState(settings.description || '');
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '');
  const [saved, setSaved] = useState(false);
  const theme = allowedTheme(settings.theme, webDesigns);
  const dirty =
    tagline !== (settings.tagline ?? guide?.tagline ?? '') || description !== (settings.description || '') || whatsapp !== (settings.whatsapp || '');

  const submit = async () => {
    await onSave({ tagline: tagline.trim(), description: description.trim(), whatsapp: whatsapp.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={card}>
      <h3 className={h3}>Textos</h3>
      <div className="mt-4 space-y-5">
        <label className="block space-y-2">
          <span className={label}>Frase corta</span>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120} className={inputCls} placeholder="Cabañas entre la selva, a 10 minutos de las Cataratas" />
        </label>
        <label className="block space-y-2">
          <span className={label}>Presentación</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1200}
            rows={4}
            className={inputCls}
            placeholder="Contá en pocas líneas qué hace especial tu lugar."
          />
        </label>
        <label className="block space-y-2">
          <span className={label}>WhatsApp para los pedidos</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            inputMode="tel"
            className={inputCls}
            placeholder={guide?.hostPhone ? `${guide.hostPhone} (el de la guía)` : 'Ej: 3757 123456'}
          />
        </label>
        <div className="space-y-2">
          <span className={label}>Estilo</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['noche', 'Noche', Moon],
                ['dia', 'Día', Sun],
                ['clara', 'Clara', Trees],
                ['tierra', 'Tierra', Mountain],
                ['refugio', 'Refugio', Sunrise],
                ['estudio', 'Estudio', Building2],
                ['calma', 'Calma', Leaf],
                ['hacienda', 'Hacienda', Wheat],
                ['revista', 'Revista', BookOpen],
              ] as const
            ).filter(([key]) => BASIC_THEMES.includes(key) || webDesigns.includes(key)).map(([key, name, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => onSave({ theme: key })}
                aria-pressed={theme === key}
                className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 text-base font-bold cursor-pointer ${
                  theme === key
                    ? 'border-[#E67E22] text-stone-900 dark:text-white bg-orange-50 dark:bg-orange-950/40'
                    : 'border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {name}
              </button>
            ))}
          </div>
        </div>
        <p className={help}>
          ¿Querés un diseño especial para tu web?{' '}
          <a
            href={`https://wa.me/5491140925939?text=${encodeURIComponent('Hola! Quiero ver los diseños especiales para Tu Web.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-4"
          >
            Escribinos
          </a>
        </p>
        <button type="button" onClick={submit} disabled={!dirty} className={primaryBtn}>
          {saved ? <Check className="w-4 h-4" /> : null} {saved ? 'Guardado' : 'Guardar textos'}
        </button>
      </div>
    </div>
  );
};

const UnitBlock: React.FC<{
  property: Property;
  settings: WebSiteSettings;
  photos: PublicSitePhoto[];
  onSave: (patch: Partial<WebSiteSettings>) => Promise<void>;
  onUpload: (files: FileList | null) => void;
  onMove: (p: PublicSitePhoto, dir: -1 | 1) => void;
  onDelete: (p: PublicSitePhoto) => void;
  uploading: boolean;
}> = ({ property, settings, photos, onSave, onUpload, onMove, onDelete, uploading }) => {
  const cfg = settings.units?.[property.id] || {};
  const [desc, setDesc] = useState(cfg.description || '');
  const hidden = !!cfg.hidden || property.status === 'paused';

  const patchUnit = (patch: { hidden?: boolean; description?: string }) =>
    onSave({ units: { ...(settings.units || {}), [property.id]: { ...cfg, ...patch } } });

  return (
    <div className="rounded-xl border border-stone-300 dark:border-zinc-700 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-bold text-stone-900 dark:text-white">{property.name}</p>
          {property.maxGuests > 0 && <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Hasta {property.maxGuests} personas</p>}
        </div>
        <label className="inline-flex items-center gap-2 text-base font-bold text-stone-900 dark:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={!hidden}
            disabled={property.status === 'paused'}
            onChange={(e) => patchUnit({ hidden: !e.target.checked })}
            className="w-5 h-5 accent-[#E67E22]"
          />
          Mostrar en la web
        </label>
      </div>
      {!hidden && (
        <>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => desc !== (cfg.description || '') && patchUnit({ description: desc.trim() })}
            maxLength={600}
            rows={2}
            className={inputCls}
            placeholder="Ej: Cama matrimonial, deck con hamaca y parrilla propia."
          />
          <PhotoGrid photos={photos} onMove={onMove} onDelete={onDelete} />
          <UploadButton onFiles={onUpload} disabled={uploading} small />
        </>
      )}
    </div>
  );
};

const PhotoGrid: React.FC<{
  photos: PublicSitePhoto[];
  onMove: (p: PublicSitePhoto, dir: -1 | 1) => void;
  onDelete: (p: PublicSitePhoto) => void;
  firstLabel?: string;
}> = ({ photos, onMove, onDelete, firstLabel }) => {
  if (!photos.length) return null;
  const iconBtn = 'w-9 h-9 rounded-lg bg-black/70 text-white flex items-center justify-center cursor-pointer disabled:opacity-40';
  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((p, i) => (
        <div key={p.id} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-stone-200 dark:bg-zinc-800">
          <img src={p.data} alt="" className="w-full h-full object-cover" />
          {i === 0 && firstLabel && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#E67E22] text-white text-xs font-bold">{firstLabel}</span>
          )}
          <div className="absolute bottom-2 inset-x-2 flex justify-between">
            <div className="flex gap-1">
              <button type="button" aria-label="Mover antes" disabled={i === 0} onClick={() => onMove(p, -1)} className={iconBtn}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button type="button" aria-label="Mover después" disabled={i === photos.length - 1} onClick={() => onMove(p, 1)} className={iconBtn}>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button type="button" aria-label="Borrar foto" onClick={() => onDelete(p)} className={iconBtn}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const UploadButton: React.FC<{ onFiles: (f: FileList | null) => void; disabled?: boolean; small?: boolean }> = ({ onFiles, disabled, small }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button type="button" disabled={disabled} onClick={() => ref.current?.click()} className={`${ghostBtn} ${small ? '' : 'mt-4'}`}>
        <ImagePlus className="w-4 h-4" /> Sumar fotos
      </button>
    </>
  );
};

const Preview: React.FC<{
  onClose: () => void;
  settings: WebSiteSettings;
  guide?: WelcomeGuideData | null;
  complexName?: string;
  city?: string;
  properties: Property[];
  reservations: Reservation[];
  pricing?: Partial<PricingSettings> | null;
  currency?: CurrencyCode;
  photos: PublicSitePhoto[];
}> = ({ onClose, settings, guide, complexName, city, properties, reservations, pricing, currency, photos }) => {
  const site = useMemo(() => {
    const data = buildPublicSite({ settings, guide, complexName, city, properties, pricing, currency });
    const today = new Date();
    const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return { ...data, busy: buildSiteBusy(data.units.map((u) => u.id), reservations, t) };
  }, [settings, guide, complexName, city, properties, pricing, currency, reservations]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 left-3 z-[210] inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-white text-stone-900 text-base font-bold shadow-xl cursor-pointer"
      >
        <X className="w-4 h-4" /> Cerrar vista previa
      </button>
      <PublicSiteView site={site} photos={photos} preview />
    </div>
  );
};
