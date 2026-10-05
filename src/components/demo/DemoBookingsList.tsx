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
    const code = prop ? (prop.name.match(/\b([0-9][A-Za-z]|[0-9]+)\b/)?.[1] || prop.name.substring(0, 2)).toUpperCase() : '??';

    return {
      code,
      color: 'bg-[#FAF8F5] text-zinc-900 dark:bg-[#18191E] dark:text-white border border-[#C8C4B7]/80 dark:border-[#2E303A] font-black',
    };
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
        return { label: 'Confirmada', color: 'bg-zinc-100 text-zinc-900 dark:bg-[#1E2028] dark:text-[#E4E4E7] border border-zinc-300 dark:border-[#343744]' };
      case 'checked_in':
        return { label: 'En Cabaña', color: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-900 dark:border-white font-black' };
      case 'checked_out':
        return { label: 'Salida', color: 'bg-zinc-50 text-zinc-600 dark:bg-[#15161A] dark:text-zinc-400 border border-zinc-200 dark:border-[#24262E]' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-zinc-100 text-zinc-500 dark:bg-[#15161A] dark:text-zinc-500 line-through border border-zinc-200 dark:border-[#24262E]' };
      default:
        return { label: status, color: 'bg-zinc-100 text-zinc-800 dark:bg-[#1C1E24] dark:text-zinc-200 border border-zinc-200 dark:border-[#2E303B]' };
    }
  };

  const getPaymentStatusLabelAndStyles = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return { label: 'Pagado', color: 'bg-zinc-100 text-zinc-900 dark:bg-[#1C1E24] dark:text-white border border-zinc-300 dark:border-[#323540]' };
      case 'pending':
        return { label: 'Pendiente', color: 'bg-[#FAF8F5] text-[#E1500A] dark:bg-[#201C1A] dark:text-[#F37A3D] border border-amber-300 dark:border-[#4A291A]' };
      case 'deposit_only':
        return { label: 'Seña Cobrada', color: 'bg-zinc-100 text-zinc-800 dark:bg-[#1A1C22] dark:text-[#C5C8D4] border border-zinc-300 dark:border-[#2E323E]' };
      default:
        return { label: paymentStatus, color: 'bg-zinc-100 text-zinc-800 dark:bg-[#1C1E24] dark:text-zinc-200' };
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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Search and Filters Header */}
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] p-4 sm:p-5 shadow-2xs space-y-4 print:hidden transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#18181B] dark:text-[#EFECE5] flex items-center gap-2 tracking-tight">
              <Calendar className="w-5 h-5 text-[#E1500A]" />
              <span>Lista de Reservas del Complejo</span>
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#8E8E93] mt-0.5">
              Gestión total, filtros de estado, buscador de clientes y registración de cobros.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-[#EFECE5] bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#222328] border border-[#C8C4B7] dark:border-[#222328] px-3.5 py-2 rounded-none transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#71717A] dark:text-[#8E8E93]" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-[#EFECE5] bg-white dark:bg-[#18181B] hover:bg-[#DCD8CE] dark:hover:bg-[#222328] border border-[#C8C4B7] dark:border-[#222328] px-3.5 py-2 rounded-none transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#E1500A]" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Property Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Propiedad</label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full text-xs font-bold bg-[#F4F2EE] dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328] rounded-none px-3 py-2 text-[#18181B] dark:text-[#EFECE5] focus:outline-none focus:border-[#E1500A] transition-colors cursor-pointer"
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
            <label className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Estado Reserva</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-bold bg-[#F4F2EE] dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328] rounded-none px-3 py-2 text-[#18181B] dark:text-[#EFECE5] focus:outline-none focus:border-[#E1500A] transition-colors cursor-pointer"
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
            <label className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Check-in Desde</label>
            <div className="relative">
              <input
                type="date"
                value={checkInStart}
                onChange={(e) => setCheckInStart(e.target.value)}
                className="w-full text-xs font-bold bg-[#F4F2EE] dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328] rounded-none px-3 py-2 text-[#18181B] dark:text-[#EFECE5] focus:outline-none focus:border-[#E1500A] transition-colors font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Check-In End */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Check-in Hasta</label>
            <div className="relative">
              <input
                type="date"
                value={checkInEnd}
                onChange={(e) => setCheckInEnd(e.target.value)}
                className="w-full text-xs font-bold bg-[#F4F2EE] dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328] rounded-none px-3 py-2 text-[#18181B] dark:text-[#EFECE5] focus:outline-none focus:border-[#E1500A] transition-colors font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Search Term */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#71717A] dark:text-[#8E8E93] uppercase tracking-wider block">Buscar Huésped</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] dark:text-[#8E8E93] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-bold bg-[#F4F2EE] dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328] rounded-none pl-9 pr-8 py-2 text-[#18181B] dark:text-[#EFECE5] focus:outline-none focus:border-[#E1500A] transition-colors"
              />
              {(searchTerm || statusFilter !== 'todos' || propertyFilter !== 'todos' || checkInStart || checkInEnd) && (
                <button
                  onClick={handleClearFilters}
                  className="absolute right-2.5 top-2.5 text-[#71717A] dark:text-[#8E8E93] hover:text-[#18181B] dark:hover:text-white cursor-pointer"
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
      <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-2xs overflow-hidden transition-colors">
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#C8C4B7] dark:border-[#222328] bg-[#DEDBD2] dark:bg-[#141518] text-[#71717A] dark:text-[#8E8E93] text-[10px] font-black uppercase tracking-wider transition-colors">
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
            <tbody className="divide-y divide-[#C8C4B7]/40 dark:divide-[#222328] text-xs text-[#18181B] dark:text-[#EFECE5] transition-colors">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-[#71717A] dark:text-[#8E8E93]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-[#71717A] dark:text-[#8E8E93]" />
                      <span className="font-bold text-sm">No se encontraron reservas con los filtros aplicados</span>
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-[#E1500A] hover:underline font-bold"
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
                      className="hover:bg-[#DEDBD2]/30 dark:hover:bg-[#141518]/60 transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-[#71717A] dark:text-[#8E8E93]">
                        {index + 1}
                      </td>

                      {/* Depto badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-[10px] font-black rounded-none ${badge.color}`}>
                          {badge.code}
                        </span>
                      </td>

                      {/* Guest info */}
                      <td className="py-3.5 px-4 font-semibold text-[#18181B] dark:text-[#EFECE5]">
                        <div>
                          <p className="font-black tracking-tight">{res.guestName}</p>
                          <p className="text-[10px] text-[#71717A] dark:text-[#8E8E93] font-mono group-hover:text-[#18181B] dark:group-hover:text-white transition-colors">
                            {res.guestPhone}
                          </p>
                        </div>
                      </td>

                      {/* Check-In */}
                      <td className="py-3.5 px-4 font-bold font-mono text-[#18181B] dark:text-[#EFECE5]">
                        {formatDisplayDate(res.checkIn)}
                      </td>

                      {/* Check-Out */}
                      <td className="py-3.5 px-4 font-bold font-mono text-[#18181B] dark:text-[#EFECE5]">
                        {formatDisplayDate(res.checkOut)}
                      </td>

                      {/* Noches count */}
                      <td className="py-3.5 px-3 text-center font-black text-[#18181B] dark:text-[#EFECE5]">
                        {res.nights}
                      </td>

                      {/* Nightly rate in USD */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#71717A] dark:text-[#8E8E93]">
                        USD {nightlyRate.toFixed(2)}
                      </td>

                      {/* Subtotal amount */}
                      <td className="py-3.5 px-4 text-right font-black font-mono text-[#18181B] dark:text-[#EFECE5]">
                        USD {res.totalAmount.toFixed(2)}
                      </td>

                      {/* Platform / Canal */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-none bg-white dark:bg-[#141518] border border-[#C8C4B7] dark:border-[#222328]">
                          {getPlatformIcon(res.platform)}
                        </div>
                      </td>

                      {/* Neto revenue */}
                      <td className="py-3.5 px-4 text-right font-black font-mono text-[#18181B] dark:text-[#EFECE5]">
                        USD {res.netRevenue.toFixed(2)}
                      </td>

                      {/* Cobro / payment dropdown */}
                      <td className="py-3.5 px-4 text-center relative print:pointer-events-none">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => {
                              setActivePaymentDropdown(activePaymentDropdown === res.id ? null : res.id);
                              setActiveStatusDropdown(null);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-bold border transition-all cursor-pointer ${paymentInfo.color}`}
                          >
                            <span>{paymentInfo.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {activePaymentDropdown === res.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#141518] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-lg z-50 overflow-hidden text-left py-1 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'paid')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
                              >
                                Pagado
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'pending')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
                              >
                                Pendiente
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatusInline(res.id, 'deposit_only')}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-bold border transition-all cursor-pointer ${statusInfo.color}`}
                          >
                            <span>{statusInfo.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {activeStatusDropdown === res.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#141518] rounded-none border border-[#C8C4B7] dark:border-[#222328] shadow-lg z-50 overflow-hidden text-left py-1 animate-in fade-in slide-in-from-top-1">
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'confirmed');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
                              >
                                Confirmada
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'checked_in');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
                              >
                                En Cabaña
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'checked_out');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#71717A] hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
                              >
                                Salida
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, 'cancelled');
                                  setActiveStatusDropdown(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-[#DEDBD2] dark:hover:bg-[#222328] transition-colors"
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
                            className="p-1.5 text-[#71717A] dark:text-[#8E8E93] hover:bg-[#DEDBD2] dark:hover:bg-[#222328] rounded-none transition-colors cursor-pointer"
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
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-none transition-colors cursor-pointer"
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
            {/* Total Footer row */}
            {filteredReservations.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#C8C4B7] dark:border-[#222328] bg-[#DEDBD2] dark:bg-[#141518] font-bold text-xs text-[#18181B] dark:text-[#EFECE5] transition-colors">
                  <td colSpan={3} className="py-3 px-4 font-black uppercase text-left text-[#71717A] dark:text-[#8E8E93]">
                    Totales Filtrados
                  </td>
                  <td colSpan={2} className="py-3 px-4"></td>
                  <td className="py-3 px-3 text-center font-black">
                    {filteredReservations.reduce((sum, r) => sum + r.nights, 0)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-black font-mono text-[#18181B] dark:text-[#EFECE5]">
                    USD {totalSubtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
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
