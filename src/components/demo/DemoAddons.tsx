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
        return <Wine className="w-5 h-5 text-rose-500" />;
      case 'transfers':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'spa':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'desayuno':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'experiencias':
        return <Compass className="w-5 h-5 text-emerald-500" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-zinc-500" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Catálogo de Servicios Opcionales & Extras</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configura los productos y servicios opcionales (Frigobar, Transfers, Spa, Desayunos) que puedes agregar a cualquier reserva o vender desde la Guía Digital.
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
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Opcional</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Servicios en Catálogo
            </span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit'] mt-1">
            {addonsList.length} ítems
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Disponibles para asignar a reservas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Ingresos Extras Vendidos
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">
            ${totalAddonIncome} USD
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {totalItemsOrdered} pedidos registrados en reservas activas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Entregas Pendientes
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-1">
            {pendingDeliveryCount} solicitudes
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Servicios solicitados que requieren entrega al huésped
          </p>
        </div>
      </div>

      {/* Form modal or inline for Create / Edit */}
      {(isAddingNew || editingAddonId) && (
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-200/80 dark:border-purple-900/50 pb-3">
            <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>{editingAddonId ? 'Editar Servicio Opcional' : 'Agregar Nuevo Servicio Opcional'}</span>
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingAddonId(null);
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveAddon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre del servicio / producto:
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Vino Malbec Reserva + Copa Bienvenida"
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Categoría:
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AddonCategory)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Precio (USD):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Unidad:
                </label>
                <input
                  type="text"
                  value={formUnitLabel}
                  onChange={(e) => setFormUnitLabel(e.target.value)}
                  placeholder="por botella"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Descripción corta para el huésped:
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Etiqueta seleccionada mendocina atemperada en la cabaña."
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer"
              >
                {editingAddonId ? 'Actualizar Servicio' : 'Guardar en Catálogo'}
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o detalle..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Grid of Add-on Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map((addon) => {
          return (
            <div
              key={addon.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0">
                    {getCategoryIcon(addon.category)}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-purple-700 dark:text-purple-300 font-['Outfit'] block">
                      ${addon.price} USD
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {addon.unitLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {addon.category}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {addon.name}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </div>

              {!isEmployeeMode && (
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-purple-600" />
                    <span>Disponible en reservas</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(addon)}
                      className="p-1.5 text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddon(addon.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
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
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
          No se encontraron servicios opcionales con los filtros seleccionados.
        </div>
      )}

      {/* Helper Box: How to use Add-ons */}
      <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>¿Cómo se usan en el día a día?</strong> Al hacer clic en cualquier reserva del <strong>Calendario</strong> o <strong>Panel General</strong>, puedes sumar estos opcionales, modificar cantidades y cambiar su estado de entrega o cobro en 1 clic.
          </span>
        </div>
      </div>
    </div>
  );
};
