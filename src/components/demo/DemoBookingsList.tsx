import React, { useState } from 'react';
import {
  Search,
  X,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Trash2,
  Calendar,
  DollarSign,
  ChevronDown,
  Eye,
  Building2,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { DemoState, Reservation, ReservationStatus, PaymentStatus, BookingPlatform } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../data/initialData';

interface DemoBookingsListProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onUpdateReservationStatus: (resId: string, status: ReservationStatus) => void;
  onUpdateReservation: (res: Reservation) => void;
  onDeleteReservation: (resId: string) => void;
}

export const DemoBookingsList: React.FC<DemoBookingsListProps> = ({
  demoState,
  onSelectReservation,
  onUpdateReservationStatus,
  onUpdateReservation,
  onDeleteReservation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [propertyFilter, setPropertyFilter] = useState<string>('todos');
  const [checkInStart, setCheckInStart] = useState('');
  const [checkInEnd, setCheckInEnd] = useState('');

  // Dropdown states for inline editing
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);
  const [activePaymentDropdown, setActivePaymentDropdown] = useState<string | null>(null);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setPropertyFilter('todos');
    setCheckInStart('');
    setCheckInEnd('');
  };

  const getPropertyBadge = (propertyId: string) => {
    const prop = demoState.properties.find((p) => p.id === propertyId);
    if (!prop) return { code: '??', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' };

    const mapping: Record<string, { code: string; color: string }> = {
      'cat-a': {
        code: 'A',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30',
      },
      'cat-b': {
        code: 'B',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30',
      },
      'cat-c': {
        code: 'C',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-900/30',
      },
      'cat-d': {
        code: 'D',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/30',
      },
      'prop-1': {
        code: 'A',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30',
      },
      'prop-2': {
        code: 'B',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30',
      },
      'prop-3': {
        code: 'C',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-900/30',
      },
      'prop-4': {
        code: 'D',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/30',
      },
    };

    return (
      mapping[propertyId] || {
        code: prop.name.substring(0, 3).toUpperCase(),
        color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700',
      }
    );
  };

  // Filter reservations
  const filteredReservations = demoState.reservations.filter((res) => {
    // Search filter
    const matchesSearch =
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestPhone.includes(searchTerm);

    // Status filter
    const matchesStatus = statusFilter === 'todos' || res.status === statusFilter;

    // Property filter
    const matchesProperty = propertyFilter === 'todos' || res.propertyId === propertyFilter;

    // Check-in Date range filter
    const matchesStartDate = !checkInStart || res.checkIn >= checkInStart;
    const matchesEndDate = !checkInEnd || res.checkIn <= checkInEnd;

    return matchesSearch && matchesStatus && matchesProperty && matchesStartDate && matchesEndDate;
  });

  // Calculate totals of current filtered reservations
  const totalSubtotal = filteredReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCommission = filteredReservations.reduce((sum, r) => sum + r.commissionPaid, 0);
  const totalNet = filteredReservations.reduce((sum, r) => sum + r.netRevenue, 0);

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = ['#', 'Unidad', 'Huesped', 'Check-In', 'Check-Out', 'Noches', 'Monto Total (USD)', 'Comision (USD)', 'Neto (USD)', 'Estado', 'Pago'];
    const rows = filteredReservations.map((res, index) => {
      const prop = demoState.properties.find((p) => p.id === res.propertyId);
      return [
        index + 1,
        prop?.name || 'Cabaña',
        res.guestName,
        res.checkIn,
        res.checkOut,
        res.nights,
        res.totalAmount,
        res.commissionPaid,
        res.netRevenue,
        res.status,
        res.paymentStatus,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'LoomiSuite_Reservas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPlatformIcon = (platform: BookingPlatform) => {
    switch (platform) {
      case 'airbnb':
        return <span className="text-rose-500 font-black text-[10px] tracking-tight">Airbnb</span>;
      case 'booking':
        return <span className="text-blue-600 font-extrabold text-[10px] tracking-tight">Booking</span>;
      case 'vrbo':
        return <span className="text-teal-600 font-bold text-[10px] tracking-tight">VRBO</span>;
      case 'direct':
        return <span className="text-emerald-600 font-black text-[10px] tracking-tight">Directa</span>;
      default:
        return <span className="text-zinc-500 font-medium text-[10px]">iCal</span>;
    }
  };

  const getStatusLabelAndStyles = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmada', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
      case 'checked_in':
        return { label: 'En Cabaña', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
      case 'checked_out':
        return { label: 'Salida', color: 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' };
      default:
        return { label: status, color: 'bg-zinc-100 text-zinc-800' };
    }
  };

  const getPaymentStatusLabelAndStyles = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return { label: 'Pagado', color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
      case 'pending':
        return { label: 'Pendiente', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
      case 'deposit_only':
        return { label: 'Seña Cobrada', color: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
      default:
        return { label: paymentStatus, color: 'bg-zinc-100 text-zinc-800' };
    }
  };

  const handleUpdatePaymentStatusInline = (resId: string, newPaymentStatus: PaymentStatus) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      onUpdateReservation({
        ...res,
        paymentStatus: newPaymentStatus,
      });
    }
    setActivePaymentDropdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs space-y-4 print:hidden transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#1c1b18] dark:text-[#f4f2ee] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c46d45] dark:text-[#d88d5e]" />
              <span>Lista de Reservas del Complejo</span>
            </h3>
            <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
              Gestión total, filtros de estado, buscador de clientes y registración de cobros.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-[#1c1b18] dark:text-[#c8c5c0] bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2c2c2c] border border-[#ded9cd] dark:border-[#333] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-[#1c1b18] dark:text-[#c8c5c0] bg-[#f8f6f2] dark:bg-[#242424] hover:bg-[#edeae2] dark:hover:bg-[#2c2c2c] border border-[#ded9cd] dark:border-[#333] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#c46d45] dark:text-[#d88d5e]" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Property Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Propiedad</label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-[#fbf9f5] dark:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-xl px-3 py-2 text-[#1c1b18] dark:text-[#e0deda] focus:outline-none focus:border-[#c46d45] transition-colors"
            >
              <option value="todos">Todas las unidades</option>
              {demoState.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Estado Reserva</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-[#fbf9f5] dark:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-xl px-3 py-2 text-[#1c1b18] dark:text-[#e0deda] focus:outline-none focus:border-[#c46d45] transition-colors"
            >
              <option value="todos">Todos los Estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="checked_in">En Cabaña (Check-in)</option>
              <option value="checked_out">Salida (Check-out)</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Check-In Start */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Check-in Desde</label>
            <div className="relative">
              <input
                type="date"
                value={checkInStart}
                onChange={(e) => setCheckInStart(e.target.value)}
                className="w-full text-xs font-semibold bg-[#fbf9f5] dark:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-xl px-3 py-2 text-[#1c1b18] dark:text-[#e0deda] focus:outline-none focus:border-[#c46d45] transition-colors"
              />
            </div>
          </div>

          {/* Check-In End */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Check-in Hasta</label>
            <div className="relative">
              <input
                type="date"
                value={checkInEnd}
                onChange={(e) => setCheckInEnd(e.target.value)}
                className="w-full text-xs font-semibold bg-[#fbf9f5] dark:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-xl px-3 py-2 text-[#1c1b18] dark:text-[#e0deda] focus:outline-none focus:border-[#c46d45] transition-colors"
              />
            </div>
          </div>

          {/* Search Term */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Buscar Huésped</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold bg-[#fbf9f5] dark:bg-[#222] border border-[#ded9cd] dark:border-[#333] rounded-xl pl-9 pr-8 py-2 text-[#1c1b18] dark:text-[#e0deda] focus:outline-none focus:border-[#c46d45] transition-colors"
              />
              {(searchTerm || statusFilter !== 'todos' || propertyFilter !== 'todos' || checkInStart || checkInEnd) && (
                <button
                  onClick={handleClearFilters}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  title="Limpiar Filtros"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Bookings Table Card */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs overflow-hidden transition-colors">
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ded9cd] dark:border-[#2a2a2a] bg-[#fbf9f5] dark:bg-[#1e1e1e] text-[#78746c] dark:text-[#8e8c87] text-[10px] font-bold uppercase tracking-wider transition-colors">
                <th className="py-3 px-4 text-center w-10">#</th>
                <th className="py-3 px-4 w-16">Depto</th>
                <th className="py-3 px-4">Huésped</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-3 text-center w-12">Noches</th>
                <th className="py-3 px-4 text-right">USD/N</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-center">Canal</th>
                <th className="py-3 px-4 text-right">Neto</th>
                <th className="py-3 px-4 text-center">Cobro</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center print:hidden">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded9cd]/60 dark:divide-[#2a2a2a]/60 text-xs text-[#1c1b18] dark:text-[#e0deda] transition-colors">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-[#78746c] dark:text-[#8e8c87]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-zinc-300" />
                      <span className="font-semibold text-sm">No se encontraron reservas con los filtros aplicados</span>
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-[#c46d45] dark:text-[#d88d5e] hover:underline font-bold"
                      >
                        Limpiar todos los filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res, index) => {
                  const badge = getPropertyBadge(res.propertyId);
                  const statusInfo = getStatusLabelAndStyles(res.status);
                  const paymentInfo = getPaymentStatusLabelAndStyles(res.paymentStatus);
                  const nightlyRate = res.nights > 0 ? res.totalAmount / res.nights : 0;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-[#fbf9f5]/50 dark:hover:bg-[#222]/30 transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-4 text-center font-medium text-[#7a7874]">
                        {index + 1}
                      </td>

                      {/* Depto badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-[10px] font-black rounded-lg ${badge.color}`}>
                          {badge.code}
                        </span>
                      </td>

                      {/* Guest info */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-[#f4f2ee]">
                        <div>
                          <p className="font-bold">{res.guestName}</p>
                          <p className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-500 transition-colors">
                            {res.guestPhone}
                          </p>
                        </div>
                      </td>

                      {/* Check-In */}
                      <td className="py-3.5 px-4 font-medium font-mono text-zinc-700 dark:text-zinc-300">
                        {formatDisplayDate(res.checkIn)}
                      </td>

                      {/* Check-Out */}
                      <td className="py-3.5 px-4 font-medium font-mono text-zinc-700 dark:text-zinc-300">
                        {formatDisplayDate(res.checkOut)}
                      </td>

                      {/* Noches count */}
                      <td className="py-3.5 px-3 text-center font-extrabold text-zinc-800 dark:text-zinc-200">
                        {res.nights}
                      </td>

                      {/* Nightly rate in USD */}
                      <td className="py-3.5 px-4 text-right font-medium font-mono text-zinc-600 dark:text-zinc-400">
                        USD {nightlyRate.toFixed(2)}
                      </td>

                      {/* Subtotal amount */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-zinc-900 dark:text-[#f4f2ee]">
                        USD {res.totalAmount.toFixed(2)}
                      </td>

                      {/* Platform / Canal */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-[#fcfaf7] dark:bg-[#1a1a1a] border border-[#ded9cd]/40 dark:border-[#333]">
                          {getPlatformIcon(res.platform)}
                        </div>
                      </td>

                      {/* Neto revenue after agency fee */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-zinc-900 dark:text-[#f4f2ee]">
                        USD {res.netRevenue.toFixed(2)}
                      </td>

                      {/* Cobro / payment dropdown selector */}
                      <td className="py-3.5 px-4 text-center relative print:pointer-events-none">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => {
                              setActivePaymentDropdown(activePaymentDropdown === res.id ? null : res.id);
                              setActiveStatusDropdown(null);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${paymentInfo.color}`}
                          >
                            <span>{paymentInfo.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {activePaymentDropdown === res.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg z-50 overflow-hidden text-left py-1 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'paid')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                              >
                                Pagado
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'pending')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                              >
                                Pendiente
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'deposit_only')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                              >
                                Seña Cobrada
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status select dropdown */}
                      <td className="py-3.5 px-4 text-center relative print:pointer-events-none">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => {
                              setActiveStatusDropdown(activeStatusDropdown === res.id ? null : res.id);
                              setActivePaymentDropdown(null);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${statusInfo.color}`}
                          >
                            <span>{statusInfo.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {activeStatusDropdown === res.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg z-50 overflow-hidden text-left py-1 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'confirmed');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                              >
                                Confirmada
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'checked_in');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                              >
                                En Cabaña
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'checked_out');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                Salida
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'cancelled');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectReservation(res)}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha / Editar Cobros"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Seguro que deseas eliminar permanentemente la reserva de ${res.guestName}?`)) {
                                onDeleteReservation(res.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Reserva"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Total Footer row for high-contrast overview */}
            {filteredReservations.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#ded9cd] dark:border-[#2a2a2a] bg-[#fbf9f5]/80 dark:bg-[#1a1a1a] font-bold text-xs text-[#1c1b18] dark:text-[#f4f2ee] transition-colors">
                  <td colSpan={3} className="py-3 px-4 font-bold text-left text-[#78746c] dark:text-[#8e8c87]">
                    Totales Filtrados
                  </td>
                  <td colSpan={2} className="py-3 px-4"></td>
                  <td className="py-3 px-3 text-center font-black">
                    {filteredReservations.reduce((sum, r) => sum + r.nights, 0)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-black font-mono text-[#1c1b18] dark:text-[#f4f2ee]">
                    USD {totalSubtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-black font-mono text-emerald-700 dark:text-emerald-400">
                    USD {totalNet.toFixed(2)}
                  </td>
                  <td colSpan={3} className="py-3 px-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
