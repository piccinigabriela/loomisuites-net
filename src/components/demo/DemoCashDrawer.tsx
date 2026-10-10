import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Building,
  Plus,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
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

  // Cálculos de caja diaria
  const openingCash = 50000;
  const isFrontDesk = userRole === 'frontdesk';

  const cashMovementsOnly = movements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const cashOut = isFrontDesk ? 0 : cashMovementsOnly.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn - cashOut;

  // Métricas generales
  const totalIncomes = movements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = isFrontDesk ? 0 : movements.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);
  const netCashFlow = totalIncomes - totalExpenses;

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

    setConcept('');
    setAmount('');
    setPropertyId('');
    showToast(`✅ ${isFrontDesk ? 'Ingreso registrado' : 'Movimiento registrado'} con éxito.`);
  };

  const filteredMovements = movements.filter((m) => {
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
      insumos: 'Insumos / Reposición',
      servicios: 'Servicios',
      limpieza: 'Personal de limpieza',
      otros: 'Otros',
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Zen */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/95 backdrop-blur-sm text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-[#E67E22]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Zen */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
            <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
              Caja Diaria & Movimientos
            </span>
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">·</span>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold">Turno en Curso</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Flujo de Caja Diaria & <span className="font-extrabold text-gray-900 dark:text-white">Arqueo de Turno</span>
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium max-w-xl">
            Control de efectivo en recepción, cobros de extras y registro sereno de gastos operativos diarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('📥 Planilla de caja diaria exportada en formato Excel.')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Cerrar Turno (Exportar)</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Caja Diaria */}
      <div className={`grid grid-cols-1 gap-4 ${isFrontDesk ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Saldo Físico Efectivo */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>Efectivo en Mostrador</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
              Físico
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatMoney(currentCashBalance)}
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-2">
            Apertura de turno: {formatMoney(openingCash)}
          </p>
        </div>

        {/* Ingresos */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
            <span>Cobros & Entradas</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 tracking-tight mt-1">
            +{formatMoney(totalIncomes)}
          </div>
          <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[10px] font-bold">
              Entradas registradas
            </span>
          </div>
        </div>

        {/* Gastos */}
        {!isFrontDesk && (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
              <span>Egresos & Compras</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-200 tracking-tight mt-1">
              <span className="text-orange-600 dark:text-orange-400 mr-1 text-lg font-bold">-</span>
              {formatMoney(totalExpenses)}
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-2">
              Insumos, reparaciones y caja chica
            </p>
          </div>
        )}

        {/* Flujo Neto Zen */}
        {!isFrontDesk && (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.005)] transition-all">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
              <span>Flujo Neto Total</span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold">Balance</span>
            </div>
            <div className={`text-2xl font-bold tracking-tight mt-1 ${netCashFlow >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-stone-800 dark:text-stone-200'}`}>
              {formatMoney(netCashFlow)}
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-2">
              Diferencia del período
            </p>
          </div>
        )}
      </div>

      {/* Formulario y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] h-fit">
          <div className="pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
            <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
              Movimiento Rápido
            </span>
            <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
              {isFrontDesk ? 'Registrar Cobro / Entrada' : 'Registrar Cobro o Gasto'}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
              Ingresa el movimiento con concepto claro para mantener el balance al día.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isFrontDesk && (
              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1.5">
                  Tipo de Transacción:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setType('ingreso')}
                    className={`py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      type === 'ingreso'
                        ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ingreso (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('egreso')}
                    className={`py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      type === 'egreso'
                        ? 'bg-white dark:bg-zinc-700 text-[#E67E22] shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>Gasto (-)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Concepto */}
            <div>
              <label htmlFor="concept" className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1">
                Concepto / Detalle
              </label>
              <input
                id="concept"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={isFrontDesk ? "Ej: Cobro desayuno extra o late check-out" : "Ej: Compra de leña o reparación rápida"}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-gray-300 transition-all font-medium"
              />
            </div>

            {/* Monto y Medio de Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amount" className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1">
                  Monto ($ ARS)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="15000"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-gray-300 transition-all font-medium"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1">
                  Medio de Pago
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="efectivo" className="dark:bg-zinc-800">Efectivo (Caja)</option>
                  <option value="transferencia" className="dark:bg-zinc-800">Transferencia</option>
                  <option value="tarjeta" className="dark:bg-zinc-800">Tarjeta / Posnet</option>
                </select>
              </div>
            </div>

            {/* Categoría */}
            {!isFrontDesk && (
              <div>
                <label htmlFor="category" className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="insumos" className="dark:bg-zinc-800">Insumos y Reposición</option>
                  <option value="mantenimiento" className="dark:bg-zinc-800">Mantenimiento</option>
                  <option value="caja_chica" className="dark:bg-zinc-800">Caja Chica (Extras)</option>
                  <option value="servicios" className="dark:bg-zinc-800">Servicios (Luz, Internet, Gas)</option>
                  <option value="limpieza" className="dark:bg-zinc-800">Personal de Limpieza</option>
                  <option value="otros" className="dark:bg-zinc-800">Otros Gastos</option>
                </select>
              </div>
            )}

            {/* Unidad Asociada */}
            <div>
              <label htmlFor="property" className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold block mb-1">
                Asociar a Unidad (Opcional)
              </label>
              <select
                id="property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer font-medium"
              >
                <option value="" className="dark:bg-zinc-800">General / Todo el Complejo</option>
                {demoState.properties.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-zinc-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de Guardado */}
            <button
              type="submit"
              className={`w-full py-3 text-xs rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                activeType === 'ingreso'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-[#E67E22] border border-orange-200 dark:border-orange-900/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar {activeType === 'ingreso' ? 'Ingreso' : 'Gasto'}</span>
            </button>
          </form>
        </div>

        {/* Tabla de Flujo de Caja (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800 mb-3">
              <div>
                <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold">
                  Registro de Movimientos
                </span>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Historial de Caja Diaria
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  Lectura fluida de cada transacción registrada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar concepto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none font-medium"
                  />
                </div>

                {!isFrontDesk && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 cursor-pointer focus:outline-none font-medium"
                  >
                    <option value="all" className="dark:bg-zinc-800">Todos</option>
                    <option value="ingreso" className="dark:bg-zinc-800">Ingresos</option>
                    <option value="egreso" className="dark:bg-zinc-800">Gastos</option>
                  </select>
                )}
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400 font-medium">
                <p className="text-xs">No hay movimientos registrados para este filtro.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200/80 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                      <th className="py-3 px-2">Fecha / Concepto</th>
                      <th className="py-3 px-2">Canal</th>
                      <th className="py-3 px-2">Categoría</th>
                      <th className="py-3 px-2 text-right">Monto</th>
                      <th className="py-3 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                    {filteredMovements.map((mov) => {
                      const isIncome = mov.type === 'ingreso';

                      return (
                        <tr
                          key={mov.id}
                          className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors text-xs font-medium"
                        >
                          <td className="py-4 px-2 max-w-[210px]">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">
                                {mov.concept}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                {formatDisplayDate(mov.date)} · {getPropertyName(mov.propertyId)}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-2">
                            <span className="capitalize text-gray-600 dark:text-gray-300 font-semibold">
                              {mov.paymentMethod}
                            </span>
                          </td>

                          <td className="py-4 px-2">
                            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 font-semibold">
                              {getCategoryLabel(mov.category)}
                            </span>
                          </td>

                          <td className="py-4 px-2 text-right">
                            {isIncome ? (
                              <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                                +{formatMoney(mov.amount)}
                              </span>
                            ) : (
                              <span className="text-stone-800 dark:text-stone-200 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded font-semibold">
                                <span className="text-orange-600 dark:text-orange-400 mr-0.5">-</span>
                                {formatMoney(mov.amount)}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-2 text-center">
                            <button
                              onClick={() => onDeleteCashMovement(mov.id)}
                              className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium mt-4">
            <span>{filteredMovements.length} movimientos contabilizados</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Arqueo respaldado en tiempo real
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
