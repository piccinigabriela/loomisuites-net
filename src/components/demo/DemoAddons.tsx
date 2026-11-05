/**
 * Opcionales y extras: lo que el complejo vende además del alojamiento.
 * Rediseño 5/11 (idea de Areca): lista compacta agrupada por categoría y categorías propias del dueño
 * (src/lib/addonCategories.ts). Se suman a las reservas y se publican en Tu Web como Experiencias.
 */
import React, { useMemo, useState } from 'react';
import { ShoppingBag, Plus, Trash2, Edit2, Coffee, Car, Wine, Sparkles, Compass, Tag, X, Check, ListTree } from 'lucide-react';
import { DemoState, AddonService, AddonCategoryDef } from '../../types';
import { formatCurrency, getActiveCurrency } from '../../data/initialData';
import { NO_CATEGORY, newCategoryId, normalizeAddonCategories } from '../../lib/addonCategories';

interface DemoAddonsProps {
  demoState: DemoState;
  onUpdateAddons?: (addons: AddonService[], categories?: AddonCategoryDef[]) => void;
  onOpenReservationDetail?: (reservationId: string) => void;
  isEmployeeMode?: boolean;
}

const inputCls =
  'w-full min-h-[44px] px-3.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <span className="block mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{label}</span>
    {children}
  </div>
);

const UNIT_SUGGESTIONS = ['por persona', 'por noche', 'por viaje', 'por unidad', 'por estadía'];
const NEW_CAT = '__nueva__';

const categoryIcon = (id: string) => {
  const cls = 'w-5 h-5 text-[#E67E22]';
  switch (id) {
    case 'frigobar':
      return <Wine className={cls} />;
    case 'transfers':
      return <Car className={cls} />;
    case 'spa':
      return <Sparkles className={cls} />;
    case 'desayuno':
      return <Coffee className={cls} />;
    case 'experiencias':
      return <Compass className={cls} />;
    case 'servicios':
      return <Tag className={cls} />;
    default:
      return <ShoppingBag className={cls} />;
  }
};

type Draft = { id?: string; name: string; category: string; price: number | ''; unitLabel: string; description: string };

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }> = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
    <div
      className="bg-white dark:bg-[#18191E] text-stone-900 dark:text-white rounded-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
        <h4 className="text-lg font-bold">{title}</h4>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 dark:border-zinc-800">{footer}</div>
    </div>
  </div>
);

export const DemoAddons: React.FC<DemoAddonsProps> = ({ demoState, onUpdateAddons, isEmployeeMode = false }) => {
  const addonsList = demoState.addons || demoState.availableAddons || [];
  const categories = useMemo(() => normalizeAddonCategories(demoState.addonCategories), [demoState.addonCategories]);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [catsOpen, setCatsOpen] = useState(false);
  const [catsDraft, setCatsDraft] = useState<AddonCategoryDef[]>([]);
  const [catToAdd, setCatToAdd] = useState('');

  // Vendidos este mes (por fecha de entrada de la reserva)
  const month = new Date().toISOString().slice(0, 7);
  const soldThisMonth = demoState.reservations
    .filter((r) => r.status !== 'cancelled' && String(r.checkIn || '').startsWith(month))
    .flatMap((r) => r.addons || []);
  const soldCount = soldThisMonth.reduce((sum, a) => sum + (a.quantity || 0), 0);
  const soldTotal = soldThisMonth.reduce((sum, a) => sum + (a.total || 0), 0);

  // Agrupados por categoría, en el orden de las categorías; los huérfanos al final
  const groups = useMemo(() => {
    const known = new Set(categories.map((c) => c.id));
    const out = categories
      .map((c) => ({ id: c.id, label: c.label, items: addonsList.filter((a) => a.category === c.id) }))
      .filter((g) => g.items.length > 0);
    const orphans = addonsList.filter((a) => !known.has(a.category));
    if (orphans.length) out.push({ id: '', label: NO_CATEGORY, items: orphans });
    return out;
  }, [categories, addonsList]);

  const openNew = () => {
    setError('');
    setNewCatName('');
    setDraft({ name: '', category: categories[0]?.id || NEW_CAT, price: '', unitLabel: 'por persona', description: '' });
  };

  const openEdit = (a: AddonService) => {
    setError('');
    setNewCatName('');
    setDraft({ id: a.id, name: a.name, category: a.category, price: a.price, unitLabel: a.unitLabel, description: a.description || '' });
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Ponele un nombre.');
    if (draft.price === '' || Number(draft.price) < 0) return setError('Cargá el precio (0 si es sin cargo).');
    let cats: AddonCategoryDef[] | undefined;
    let categoryId = draft.category;
    if (categoryId === NEW_CAT) {
      const label = newCatName.trim().slice(0, 40);
      if (!label) return setError('Escribí el nombre de la categoría nueva.');
      const existing = categories.find((c) => c.label.toLowerCase() === label.toLowerCase());
      if (existing) categoryId = existing.id;
      else {
        categoryId = newCategoryId();
        cats = [...categories, { id: categoryId, label }];
      }
    }
    const item: AddonService = {
      ...(draft.id ? addonsList.find((a) => a.id === draft.id) : {}),
      id: draft.id || `addon-${Date.now()}`,
      name: draft.name.trim(),
      category: categoryId,
      price: Number(draft.price),
      unitLabel: draft.unitLabel.trim() || 'por unidad',
      description: draft.description.trim(),
    } as AddonService;
    const updated = draft.id ? addonsList.map((a) => (a.id === draft.id ? item : a)) : [...addonsList, item];
    onUpdateAddons?.(updated, cats);
    setDraft(null);
  };

  const deleteAddon = (id: string) => {
    onUpdateAddons?.(addonsList.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  };

  const openCategories = () => {
    setCatsDraft(categories.map((c) => ({ ...c })));
    setCatToAdd('');
    setError('');
    setCatsOpen(true);
  };

  const saveCategories = () => {
    const clean = catsDraft.map((c) => ({ ...c, label: c.label.trim().slice(0, 40) }));
    if (clean.some((c) => !c.label)) return setError('Hay una categoría sin nombre.');
    onUpdateAddons?.(addonsList, clean);
    setCatsOpen(false);
  };

  const countIn = (catId: string) => addonsList.filter((a) => a.category === catId).length;

  return (
    <div className="space-y-6 font-sans text-stone-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Opcionales y extras</h3>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Lo que vendés además del alojamiento: se suma a la reserva y se puede mostrar en Tu Web.</p>
          {soldCount > 0 && (
            <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
              Este mes: {soldCount} {soldCount === 1 ? 'vendido' : 'vendidos'} · {formatCurrency(soldTotal)}
            </p>
          )}
        </div>
        {!isEmployeeMode && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openNew}
              className="min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold text-[#111] bg-[#E67E22] hover:bg-[#D35400] px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo opcional</span>
            </button>
            <button
              onClick={openCategories}
              className="min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold border-2 border-stone-300 dark:border-zinc-600 px-4 rounded-xl cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <ListTree className="w-4 h-4" />
              <span>Categorías</span>
            </button>
          </div>
        )}
      </div>

      {addonsList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 p-10 text-center">
          <ShoppingBag className="w-8 h-8 mx-auto text-[#E67E22]" />
          <p className="mt-3 text-lg font-bold">Todavía no cargaste opcionales</p>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Desayuno, traslados, excursiones, salida tarde… lo que ofrezcas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.id || 'sin'}>
              <h4 className="flex items-center gap-2 mb-2 text-base font-bold">
                {categoryIcon(g.id)}
                <span>{g.label}</span>
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">({g.items.length})</span>
              </h4>
              <ul className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] divide-y divide-stone-200 dark:divide-zinc-800 overflow-hidden">
                {g.items.map((a) => (
                  <li key={a.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold">{a.name}</p>
                      {a.description && <p className="text-sm text-stone-800 dark:text-stone-200 line-clamp-2 sm:line-clamp-1">{a.description}</p>}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="sm:text-right min-w-[110px]">
                        <p className="text-base font-bold tabular-nums">{a.price > 0 ? formatCurrency(a.price) : 'Sin cargo'}</p>
                        <p className="text-sm text-stone-800 dark:text-stone-200">{a.unitLabel}</p>
                      </div>
                      {!isEmployeeMode &&
                        (confirmDeleteId === a.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold">¿Borrar?</span>
                            <button onClick={() => deleteAddon(a.id)} className="min-h-[40px] px-3 rounded-xl bg-rose-700 text-white text-sm font-bold cursor-pointer">
                              Sí
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="min-h-[40px] px-3 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold cursor-pointer">
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(a)}
                              className="min-h-[40px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
                            >
                              <Edit2 className="w-4 h-4" /> Editar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(a.id)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              aria-label={`Borrar ${a.name}`}
                              title="Borrar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {draft && (
        <Modal
          title={draft.id ? `Editar ${draft.name || 'opcional'}` : 'Nuevo opcional'}
          onClose={() => setDraft(null)}
          footer={
            <>
              <button onClick={() => setDraft(null)} className="min-h-[44px] px-5 rounded-xl text-sm font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
                Cancelar
              </button>
              <button onClick={saveDraft} className="min-h-[44px] px-6 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-sm font-bold cursor-pointer">
                {draft.id ? 'Guardar' : 'Crear opcional'}
              </button>
            </>
          }
        >
          <Field label="Nombre">
            <input className={inputCls} value={draft.name} placeholder="Por ejemplo: Desayuno de campo" onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <select className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              {!categories.some((c) => c.id === draft.category) && draft.category !== NEW_CAT && <option value={draft.category}>{NO_CATEGORY}</option>}
              <option value={NEW_CAT}>+ Nueva categoría…</option>
            </select>
            {draft.category === NEW_CAT && (
              <input className={`${inputCls} mt-2`} value={newCatName} placeholder="Nombre de la categoría" onChange={(e) => setNewCatName(e.target.value)} autoFocus />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Precio (${getActiveCurrency()})`}>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                className={inputCls}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </Field>
            <Field label="Se cobra">
              <input className={inputCls} value={draft.unitLabel} placeholder="por persona" onChange={(e) => setDraft({ ...draft, unitLabel: e.target.value })} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {UNIT_SUGGESTIONS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setDraft({ ...draft, unitLabel: u })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer ${
                  draft.unitLabel === u ? 'border-[#E67E22] bg-[#E67E22]/15' : 'border-stone-300 dark:border-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          <Field label="Descripción (opcional)">
            <textarea
              rows={3}
              className={`${inputCls} py-2.5`}
              value={draft.description}
              placeholder="Qué incluye, horarios, cómo se pide."
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          {error && <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm font-semibold">{error}</p>}
        </Modal>
      )}

      {catsOpen && (
        <Modal
          title="Categorías"
          onClose={() => setCatsOpen(false)}
          footer={
            <>
              <button onClick={() => setCatsOpen(false)} className="min-h-[44px] px-5 rounded-xl text-sm font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
                Cancelar
              </button>
              <button onClick={saveCategories} className="min-h-[44px] px-6 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-sm font-bold cursor-pointer">
                Guardar
              </button>
            </>
          }
        >
          <p className="text-base text-stone-800 dark:text-stone-200">Cambiá los nombres, sumá las tuyas o borrá las que no uses.</p>
          <ul className="space-y-2">
            {catsDraft.map((c, i) => {
              const n = countIn(c.id);
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    value={c.label}
                    aria-label="Nombre de la categoría"
                    onChange={(e) => setCatsDraft(catsDraft.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <span className="shrink-0 w-8 text-center text-sm font-semibold" title={`${n} opcionales`}>
                    {n}
                  </span>
                  <button
                    onClick={() => setCatsDraft(catsDraft.filter((_, j) => j !== i))}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    aria-label={`Borrar ${c.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <input
              className={inputCls}
              value={catToAdd}
              placeholder="Categoría nueva"
              onChange={(e) => setCatToAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && catToAdd.trim()) {
                  setCatsDraft([...catsDraft, { id: newCategoryId(), label: catToAdd.trim().slice(0, 40) }]);
                  setCatToAdd('');
                }
              }}
            />
            <button
              disabled={!catToAdd.trim()}
              onClick={() => {
                setCatsDraft([...catsDraft, { id: newCategoryId(), label: catToAdd.trim().slice(0, 40) }]);
                setCatToAdd('');
              }}
              className="shrink-0 min-h-[44px] px-4 rounded-xl border-2 border-[#E67E22] text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Sumar
            </button>
          </div>
          <p className="text-sm text-stone-800 dark:text-stone-200">El número es cuántos opcionales tiene cada una. Si borrás una con opcionales, quedan en "{NO_CATEGORY}".</p>
          {error && <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm font-semibold">{error}</p>}
        </Modal>
      )}
    </div>
  );
};
