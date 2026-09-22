import React, { useState } from 'react';
import {
  DollarSign,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { DemoState, CashMovement, Property } from '../../types';
import { formatDisplayDate } from '../../data/initialData';

interface DemoCashDrawerProps {
  demoState: DemoState;
  userRole: 'admin' | 'frontdesk' | 'housekeeping';
  onAddCashMovement: (movement: Omit<CashMovement, 'id' | 'date'>) => void;
  onDeleteCashMovement: (id: string) => void;
}

export const DemoCashDrawer: React.FC<DemoCashDrawerProps> = ({
  demoState,
  userRole,
  onAddCashMovement,
  onDeleteCashMovement,
}) => {
  const movements = demoState.cashMovements || [];

  // Form State
  const [concept, setConcept] = useState('');
  const [type, setType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [category, setCategory] = useState<CashMovement['category']>('insumos');
  const [propertyId, setPropertyId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Calculations
  // Let's assume an opening cash balance of 50,000
  const openingCash = 50000;
  const isFrontDesk = userRole === 'frontdesk';

  const cashMovementsOnly = movements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const cashOut = isFrontDesk ? 0 : cashMovementsOnly.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn - cashOut;

  // General metrics (all payment methods)
  const totalIncomes = movements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = isFrontDesk ? 0 : movements.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);

  const activeType = isFrontDesk ? 'ingreso' : type;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      showToast('⚠️ Por favor, ingresá un concepto descriptivo.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('⚠️ Por favor, ingresá un monto válido mayor a 0.');
      return;
    }

    onAddCashMovement({
      type: activeType,
      amount: numAmount,
      concept: concept.trim(),
      paymentMethod,
      category: isFrontDesk ? 'caja_chica' : category,
      propertyId: propertyId || undefined,
      userRole,
    });

    // Reset Form
    setConcept('');
    setAmount('');
    setPropertyId('');
    showToast(`✅ ${isFrontDesk ? 'Ingreso registrado' : 'Movimiento registrado'} con éxito.`);
  };

  // Filtering
  const filteredMovements = movements.filter((m) => {
    // If frontdesk, they must NEVER see or search expenses
    if (isFrontDesk && m.type === 'egreso') return false;

    const matchesSearch = m.concept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' ? true : m.type === filterType;
    const matchesCategory = filterCategory === 'all' ? true : m.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getPropertyName = (id?: string) => {
    if (!id) return 'General';
    const p = demoState.properties.find((p) => p.id === id);
    return p ? p.name : 'General';
  };

  const getCategoryLabel = (cat: CashMovement['category']) => {
    const labels: Record<CashMovement['category'], string> = {
      caja_chica: 'Caja Chica',
      mantenimiento: 'Mantenimiento',
      insumos: 'Insumos / Limpieza',
      servicios: 'Servicios públicos',
      limpieza: 'Personal de limpieza',
      otros: 'Otros gastos',
    };
    return labels[cat] || cat;
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c1a] text-[#f4f2ee] text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-[#48372b] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-[#78b37e]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
            <span>Control de Caja Chica & Gastos Operativos</span>
          </h3>
          <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
            Registra los movimientos diarios en efectivo del mostrador, compra de insumos, reparaciones rápidas y ventas extras de consumos.
          </p>
        </div>
      </div>

      {/* Box Metrics Grid */}
      <div className={`grid grid-cols-1 gap-4 ${isFrontDesk ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Current Cash Drawer Balance */}
        <div className="bg-[#fcfaf7] dark:bg-[#1b1917] rounded-xl p-5 border border-[#e8dfd3] dark:border-[#382b21] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
              Caja Efectivo (Mostrador)
            </span>
            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
              Físico
            </span>
          </div>
          <div className="text-2xl font-black text-[#1c1b18] dark:text-[#f4f2ee]">
            {formatMoney(currentCashBalance)}
          </div>
          <p className="text-[10px] text-[#78746c] mt-1.5">
            Inició con: {formatMoney(openingCash)} en caja
          </p>
        </div>

        {/* Total Incomes */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
              Ingresos Totales (Caja)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-[#78b37e]">
            +{formatMoney(totalIncomes)}
          </div>
          <p className="text-[10px] text-[#78746c] mt-1.5">Entradas por ventas & cobros</p>
        </div>

        {/* Total Expenses */}
        {!isFrontDesk && (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
                Gastos Operacionales
              </span>
              <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              -{formatMoney(totalExpenses)}
            </div>
            <p className="text-[10px] text-[#78746c] mt-1.5">Mantenimiento, insumos y compras</p>
          </div>
        )}

        {/* Total cash flow summary */}
        {!isFrontDesk && (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider">
                Flujo Neto Total
              </span>
              <DollarSign className="w-4 h-4 text-[#c46d45] shrink-0" />
            </div>
            <div className={`text-2xl font-black ${totalIncomes - totalExpenses >= 0 ? 'text-zinc-800 dark:text-zinc-100' : 'text-rose-600'}`}>
              {formatMoney(totalIncomes - totalExpenses)}
            </div>
            <p className="text-[10px] text-[#78746c] mt-1.5">Diferencia total registrada</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to Register Movement (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-6 shadow-xs h-fit">
          <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-1.5 pb-4 border-b border-[#f4f1eb] dark:border-[#2a2a2a] mb-5">
            <PlusCircle className="w-4 h-4 text-[#c46d45]" />
            <span>{isFrontDesk ? 'Registrar Cobro / Entrada de Caja' : 'Registrar Movimiento / Gasto'}</span>
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector Toggle - Hidden for frontdesk as they can only register incomes */}
            {!isFrontDesk && (
              <div>
                <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1.5">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#f8f6f2] dark:bg-[#141414] p-1 rounded-xl border border-[#ded9cd] dark:border-[#282828]">
                  <button
                    type="button"
                    onClick={() => setType('egreso')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'egreso'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18]'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Gasto (-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('ingreso')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'ingreso'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-[#78746c] dark:text-[#8e8c87] hover:text-[#1c1b18]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Ingreso (+)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Concept input */}
            <div>
              <label htmlFor="concept" className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1">
                Concepto / Descripción
              </label>
              <input
                id="concept"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={isFrontDesk ? "Ej: Cobro de desayuno extra o venta de leña" : "Ej: Compra de 5 bolsas de leña"}
                className="w-full text-xs p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#151515] text-[#1c1b18] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#c46d45]"
              />
            </div>

            {/* Grid for Amount and Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amount" className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1">
                  Monto ($ ARS)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full text-xs p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#151515] text-[#1c1b18] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#c46d45]"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1">
                  Medio de Pago
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#151515] text-[#1c1b18] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#c46d45] cursor-pointer"
                >
                  <option value="efectivo">Efectivo (Caja)</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta Posnet</option>
                </select>
              </div>
            </div>

            {/* Category selection - Hidden for frontdesk, defaults to 'caja_chica' */}
            {!isFrontDesk && (
              <div>
                <label htmlFor="category" className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#151515] text-[#1c1b18] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#c46d45] cursor-pointer"
                >
                  <option value="insumos">Insumos (Sábanas, limpieza, etc)</option>
                  <option value="mantenimiento">Mantenimiento y Reparaciones</option>
                  <option value="caja_chica">Caja Chica (Cigarrillos, extras)</option>
                  <option value="servicios">Servicios (Luz, Internet, Gas)</option>
                  <option value="limpieza">Personal de Limpieza / Housekeeping</option>
                  <option value="otros">Otros Gastos</option>
                </select>
              </div>
            )}

            {/* Optional property linkage */}
            <div>
              <label htmlFor="property" className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block mb-1">
                Asociar a Unidad (Opcional)
              </label>
              <select
                id="property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-white dark:bg-[#151515] text-[#1c1b18] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#c46d45] cursor-pointer"
              >
                <option value="">General / Todo el Complejo</option>
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
                activeType === 'ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              Registrar {activeType === 'ingreso' ? 'Ingreso' : 'Gasto'}
            </button>
          </form>
        </div>

        {/* History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Filter and search bars */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#f4f1eb] dark:border-[#2a2a2a] mb-5">
              <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">
                Historial de Caja & Gastos
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8e8a83] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar concepto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ded9cd] dark:border-[#2d2d2d] bg-white dark:bg-[#161616] text-[#1c1b18] dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                {!isFrontDesk && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs p-1.5 rounded-xl border border-[#ded9cd] dark:border-[#2d2d2d] bg-white dark:bg-[#161616] cursor-pointer"
                  >
                    <option value="all">Tipos</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Gastos</option>
                  </select>
                )}
              </div>
            </div>

            {/* List of movements */}
            {filteredMovements.length === 0 ? (
              <div className="text-center py-12 text-[#8e8a83]">
                <p className="text-xs">No se encontraron movimientos registrados en este turno.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#f4f1eb] dark:border-[#2a2a2a] text-[10px] font-bold text-[#8e8a83] uppercase tracking-wider">
                      <th className="pb-2">Fecha / Concepto</th>
                      <th className="pb-2">Vía</th>
                      <th className="pb-2">Categoría</th>
                      <th className="pb-2 text-right">Monto</th>
                      <th className="pb-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fcf9f4] dark:divide-[#222]">
                    {filteredMovements.map((mov) => (
                      <tr key={mov.id} className="text-xs hover:bg-[#faf8f4] dark:hover:bg-[#1f1e1d] transition-colors">
                        <td className="py-2.5 max-w-[220px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1c1b18] dark:text-[#e4e2df] truncate">{mov.concept}</span>
                            <span className="text-[10px] text-[#8e8a83] flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDisplayDate(mov.date)} • {getPropertyName(mov.propertyId)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className="capitalize text-[10px] font-semibold text-[#555] dark:text-zinc-400">
                            {mov.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="text-[10px] bg-[#f8f6f2] dark:bg-[#252525] text-zinc-700 dark:text-zinc-300 font-bold px-2 py-0.5 rounded border border-[#ded9cd]/40 dark:border-transparent">
                            {getCategoryLabel(mov.category)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-black">
                          <span className={mov.type === 'ingreso' ? 'text-emerald-600 dark:text-[#78b37e]' : 'text-rose-600 dark:text-rose-400'}>
                            {mov.type === 'ingreso' ? '+' : '-'}{formatMoney(mov.amount)}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => onDeleteCashMovement(mov.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table footer with export simulation */}
          <div className="pt-4 border-t border-[#f4f1eb] dark:border-[#2a2a2a] flex items-center justify-between text-[11px] text-[#8e8a83] mt-4">
            <span>Mostrando {filteredMovements.length} movimientos en total</span>
            <button
              onClick={() => showToast('📥 Planilla de caja diaria exportada en formato Excel.')}
              className="flex items-center gap-1 text-[11px] text-[#c46d45] hover:text-[#b85e35] font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cerrar Caja (Exportar)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
