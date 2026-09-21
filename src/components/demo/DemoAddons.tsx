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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
            <span>Catálogo de Servicios Opcionales & Extras</span>
          </h3>
          <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
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
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] px-4 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Opcional</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
              Servicios en Catálogo
            </span>
            <Layers className="w-4 h-4 text-[#c46d45]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee] mt-1">
            {addonsList.length} ítems
          </div>
          <p className="text-[11px] text-[#78746c] dark:text-[#8e8c87] mt-1">
            Disponibles para asignar a reservas
          </p>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
              Ingresos Extras Vendidos
            </span>
            <DollarSign className="w-4 h-4 text-[#3e6645] dark:text-[#78b37e]" />
          </div>
          <div className="text-2xl font-extrabold text-[#3e6645] dark:text-[#78b37e] mt-1">
            ${totalAddonIncome} USD
          </div>
          <p className="text-[11px] text-[#78746c] dark:text-[#8e8c87] mt-1">
            {totalItemsOrdered} pedidos registrados en reservas activas
          </p>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
              Entregas Pendientes
            </span>
            <Clock className="w-4 h-4 text-[#c46d45]" />
          </div>
          <div className="text-2xl font-extrabold text-[#c46d45] dark:text-[#d88d5e] mt-1">
            {pendingDeliveryCount} solicitudes
          </div>
          <p className="text-[11px] text-[#78746c] dark:text-[#8e8c87] mt-1">
            Servicios solicitados que requieren entrega al huésped
          </p>
        </div>
      </div>

      {/* Form modal or inline for Create / Edit */}
      {(isAddingNew || editingAddonId) && (
        <div className="p-5 rounded-2xl bg-[#f4eee7] dark:bg-[#1e1b18] border border-[#e4d6c9] dark:border-[#48372b] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ded9cd] dark:border-[#332b24] pb-3">
            <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#c46d45]" />
              <span>{editingAddonId ? 'Editar Servicio Opcional' : 'Agregar Nuevo Servicio Opcional'}</span>
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingAddonId(null);
              }}
              className="text-xs font-semibold text-[#78746c] hover:text-[#1c1b18] dark:hover:text-[#f4f2ee]"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveAddon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">
                Nombre del servicio / producto:
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Vino Malbec Reserva + Copa Bienvenida"
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">
                Categoría:
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AddonCategory)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee]"
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
                <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">
                  Precio (USD):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">
                  Unidad:
                </label>
                <input
                  type="text"
                  value={formUnitLabel}
                  onChange={(e) => setFormUnitLabel(e.target.value)}
                  placeholder="por botella"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] mb-1">
                Descripción corta para el huésped:
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Etiqueta seleccionada mendocina atemperada en la cabaña."
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#ded9cd] dark:border-[#333] bg-white dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] rounded-xl transition-colors cursor-pointer shadow-2xs"
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
                    ? 'bg-[#c46d45] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#1c1c1c] text-[#78746c] dark:text-[#8e8c87] hover:bg-[#f8f6f2] dark:hover:bg-[#252525] border border-[#ded9cd] dark:border-[#2a2a2a]'
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
          <Search className="w-3.5 h-3.5 text-[#78746c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o detalle..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-[#1c1b18] dark:text-[#f4f2ee]"
          />
        </div>
      </div>

      {/* Grid of Add-on Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map((addon) => {
          return (
            <div
              key={addon.id}
              className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs flex flex-col justify-between hover:border-[#c46d45]/40 dark:hover:border-[#383838] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f8f6f2] dark:bg-[#242424] border border-[#ded9cd] dark:border-[#333] flex items-center justify-center shrink-0">
                    {getCategoryIcon(addon.category)}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-[#c46d45] dark:text-[#d88d5e] block">
                      ${addon.price} USD
                    </span>
                    <span className="text-[10px] text-[#78746c] dark:text-[#8e8c87]">
                      {addon.unitLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f8f6f2] dark:bg-[#252525] text-[#78746c] dark:text-[#8e8c87] border border-[#ded9cd] dark:border-[#383838]">
                    {addon.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] leading-snug">
                    {addon.name}
                  </h4>
                  <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1 leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </div>

              {!isEmployeeMode && (
                <div className="mt-5 pt-3 border-t border-[#ded9cd] dark:border-[#282828] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-[#78746c] dark:text-[#8e8c87] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#c46d45]" />
                    <span>Disponible en reservas</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(addon)}
                      className="p-1.5 text-[#78746c] hover:text-[#c46d45] dark:hover:text-[#d88d5e] hover:bg-[#f8f6f2] dark:hover:bg-[#252525] rounded-lg transition-colors cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddon(addon.id)}
                      className="p-1.5 text-[#78746c] hover:text-[#a03d3d] dark:hover:text-[#d97777] hover:bg-[#fbedea] dark:hover:bg-[#33221e] rounded-lg transition-colors cursor-pointer"
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
        <div className="p-8 text-center bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] text-[#78746c] text-xs">
          No se encontraron servicios opcionales con los filtros seleccionados.
        </div>
      )}

      {/* Helper Box: How to use Add-ons */}
      <div className="p-4 rounded-xl bg-[#f4eee7] dark:bg-[#1e1b18] border border-[#e4d6c9] dark:border-[#48372b] text-xs text-[#9c512a] dark:text-[#d88d5e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#c46d45] shrink-0" />
          <span>
            <strong>¿Cómo se usan en el día a día?</strong> Al hacer clic en cualquier reserva del <strong>Calendario</strong> o <strong>Panel General</strong>, puedes sumar estos opcionales, modificar cantidades y cambiar su estado de entrega o cobro en 1 clic.
          </span>
        </div>
      </div>
    </div>
  );
};
