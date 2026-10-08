import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Coffee,
  Car,
  Wine,
  Sparkles,
  Compass,
  CheckCircle2,
  Tag,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { DemoState, AddonService, AddonCategory } from '../../types';

interface DemoAddonsProps {
  demoState: DemoState;
  onUpdateAddons?: (addons: AddonService[]) => void;
  onOpenReservationDetail?: (reservationId: string) => void;
  isEmployeeMode?: boolean;
}

export const DemoAddons: React.FC<DemoAddonsProps> = ({
  demoState,
  onUpdateAddons,
  isEmployeeMode = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);

  // Form state for creating / editing an addon
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AddonCategory>('frigobar');
  const [formPrice, setFormPrice] = useState<number>(10);
  const [formUnitLabel, setFormUnitLabel] = useState('por unidad');
  const [formDescription, setFormDescription] = useState('');

  const addonsList = demoState.addons || [];

  // Calculate stats
  const activeReservations = demoState.reservations.filter((r) => r.status !== 'cancelled');
  const allOrderedAddons = activeReservations.flatMap((r) => r.addons || []);
  const totalAddonIncome = allOrderedAddons.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalItemsOrdered = allOrderedAddons.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const pendingDeliveryCount = allOrderedAddons.filter((item) => item.status === 'solicitado').length;

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'Todos los Servicios', icon: Layers },
    { id: 'frigobar', label: 'Frigobar & Bebidas', icon: Wine },
    { id: 'transfers', label: 'Transfers & Traslados', icon: Car },
    { id: 'spa', label: 'Spa & Relax', icon: Sparkles },
    { id: 'desayuno', label: 'Desayunos', icon: Coffee },
    { id: 'experiencias', label: 'Experiencias & Tours', icon: Compass },
  ];

  const filteredAddons = addonsList.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchTerm) {
      const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchDesc;
    }
    return true;
  });

  const getCategoryIcon = (category: AddonCategory) => {
    switch (category) {
      case 'frigobar':
        return <Wine className="w-5 h-5 text-[#c46d45]" />;
      case 'transfers':
        return <Car className="w-5 h-5 text-[#4a7298]" />;
      case 'spa':
        return <Sparkles className="w-5 h-5 text-[#c46d45]" />;
      case 'desayuno':
        return <Coffee className="w-5 h-5 text-[#a87848]" />;
      case 'experiencias':
        return <Compass className="w-5 h-5 text-[#3e6645]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-[#78746c]" />;
    }
  };

  const handleStartEdit = (addon: AddonService) => {
    setEditingAddonId(addon.id);
    setFormName(addon.name);
    setFormCategory(addon.category);
    setFormPrice(addon.price);
    setFormUnitLabel(addon.unitLabel);
    setFormDescription(addon.description);
    setIsAddingNew(false);
  };

  const handleSaveAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingAddonId) {
      // Update existing
      const updated = addonsList.map((item) =>
        item.id === editingAddonId
          ? {
              ...item,
              name: formName.trim(),
              category: formCategory,
              price: Number(formPrice),
              unitLabel: formUnitLabel.trim() || 'por unidad',
              description: formDescription.trim(),
            }
          : item
      );
      if (onUpdateAddons) onUpdateAddons(updated);
      setEditingAddonId(null);
    } else {
      // Create new
      const newAddon: AddonService = {
        id: `addon-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        unitLabel: formUnitLabel.trim() || 'por unidad',
        description: formDescription.trim(),
      };
      const updated = [...addonsList, newAddon];
      if (onUpdateAddons) onUpdateAddons(updated);
      setIsAddingNew(false);
    }

    // Reset
    setFormName('');
    setFormPrice(10);
    setFormUnitLabel('por unidad');
    setFormDescription('');
  };

  const handleDeleteAddon = (id: string) => {
    if (confirm('¿Deseas eliminar este servicio opcional del catálogo?')) {
      const updated = addonsList.filter((item) => item.id !== id);
      if (onUpdateAddons) onUpdateAddons(updated);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> SERVICIOS ADICIONALES • UPSELLING
          </span>
          <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 tracking-tight">
            <ShoppingBag className="w-5 h-5 text-[#E67E22]" />
            <span>Catálogo de Servicios Opcionales & Extras</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
            Configura productos y extras (Frigobar, Transfers, Spa, Desayunos) para sumar a cualquier reserva o vender desde la Guía Digital.
          </p>
        </div>

        {!isEmployeeMode && (
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingAddonId(null);
              setFormName('');
              setFormCategory('frigobar');
              setFormPrice(15);
              setFormUnitLabel('por unidad');
              setFormDescription('');
            }}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-[#E67E22] hover:bg-[#D35400] px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Opcional</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Servicios en Catálogo
            </span>
            <Layers className="w-4 h-4 text-[#E67E22]" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            {addonsList.length} <span className="text-xs font-normal text-stone-400">ítems</span>
          </div>
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            Disponibles para asignar
          </p>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Ingresos Extras Vendidos
            </span>
            <DollarSign className="w-4 h-4 text-[#E67E22]" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            USD ${totalAddonIncome}
          </div>
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            {totalItemsOrdered} pedidos en reservas
          </p>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Entregas Pendientes
            </span>
            <Clock className="w-4 h-4 text-[#E67E22]" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-[#E67E22] tracking-tight">
            {pendingDeliveryCount} <span className="text-xs font-normal text-stone-400">solicitudes</span>
          </div>
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            Requieren entrega al huésped
          </p>
        </div>
      </div>

      {/* Form modal or inline for Create / Edit */}
      {(isAddingNew || editingAddonId) && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18191E] border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#E67E22]" />
              <span>{editingAddonId ? 'Editar Servicio Opcional' : 'Agregar Nuevo Servicio Opcional'}</span>
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingAddonId(null);
              }}
              className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveAddon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Nombre del servicio / producto:
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Vino Malbec Reserva + Copa Bienvenida"
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#E67E22]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Categoría:
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AddonCategory)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#E67E22]"
              >
                <option value="frigobar">🍷 Frigobar & Bebidas</option>
                <option value="transfers">🚗 Transfers & Traslados</option>
                <option value="spa">✨ Spa & Masajes</option>
                <option value="desayuno">☕ Desayunos & Comidas</option>
                <option value="experiencias">🧭 Experiencias & Excursiones</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Precio (USD):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#E67E22]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Unidad:
                </label>
                <input
                  type="text"
                  value={formUnitLabel}
                  onChange={(e) => setFormUnitLabel(e.target.value)}
                  placeholder="por botella"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#E67E22]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Descripción corta:
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Etiqueta seleccionada mendocina atemperada en la cabaña."
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#E67E22]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#E67E22] hover:bg-[#D35400] rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {editingAddonId ? 'Actualizar' : 'Guardar en Catálogo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-[#E67E22] border-stone-200/90 dark:border-zinc-700 shadow-xs font-semibold'
                    : 'bg-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-transparent font-medium hover:bg-stone-100/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en catálogo..."
            className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-stone-200/80 dark:border-zinc-700 bg-white dark:bg-[#18191E] text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#E67E22] transition-colors"
          />
        </div>
      </div>

      {/* Grid of Add-on Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map((addon) => {
          return (
            <div
              key={addon.id}
              className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-orange-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50/70 dark:bg-zinc-800 text-[#E67E22] flex items-center justify-center shrink-0">
                    {getCategoryIcon(addon.category)}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-stone-800 dark:text-stone-100 block">
                      USD ${addon.price}
                    </span>
                    <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      {addon.unitLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400">
                    {addon.category}
                  </span>
                  <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100 leading-snug">
                    {addon.name}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed font-normal">
                    {addon.description}
                  </p>
                </div>
              </div>

              {!isEmployeeMode && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#E67E22]" />
                    <span>Disponible</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(addon)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddon(addon.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAddons.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 text-stone-400 dark:text-stone-500 text-xs font-medium">
          No se encontraron servicios opcionales con los filtros seleccionados.
        </div>
      )}
    </div>
  );
};
