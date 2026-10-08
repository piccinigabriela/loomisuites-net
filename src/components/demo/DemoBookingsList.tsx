import React, { useState } from 'react';
import {
  Search,
  X,
  Download,
  Printer,
  Calendar,
  ChevronDown,
  Eye,
  Trash2,
  Phone,
  Mail,
  Car,
  Coffee,
  MessageCircle,
  Copy,
  Check,
  User,
  KeyRound,
  FileText,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Table,
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

  // Accordion state: ID of the currently expanded reservation (defaults to first reservation or null)
  const [expandedReservationId, setExpandedReservationId] = useState<string | null>(() => {
    return demoState.reservations.length > 0 ? demoState.reservations[0].id : null;
  });

  // Display mode: 'zen-cards' (accordion cards per the user's template) vs 'table' (full tabular view)
  const [viewMode, setViewMode] = useState<'zen-cards' | 'table'>('zen-cards');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dropdown states for inline editing
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);
  const [activePaymentDropdown, setActivePaymentDropdown] = useState<string | null>(null);

  const toggleRowAccordion = (id: string) => {
    setExpandedReservationId((prev) => (prev === id ? null : id));
  };

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  // Helper for property badges
  const getPropertyInfo = (propertyId: string) => {
    const prop = demoState.properties.find((p) => p.id === propertyId);
    if (!prop) {
      return {
        name: 'Departamento A',
        code: 'A',
        color: 'bg-orange-50 text-[#E67E22] border border-orange-100',
        dotColor: 'bg-orange-400',
      };
    }
    const codeMatch = prop.name.match(/\b([A-Z0-9]+)\b/);
    const code = codeMatch ? codeMatch[0] : prop.name.substring(0, 2).toUpperCase();
    return {
      name: prop.name,
      code,
      color: 'bg-orange-50 text-[#E67E22] border border-orange-100',
      dotColor: 'bg-orange-400',
    };
  };

  // Filter reservations
  const filteredReservations = demoState.reservations.filter((res) => {
    if (statusFilter !== 'todos' && res.status !== statusFilter) return false;
    if (propertyFilter !== 'todos' && res.propertyId !== propertyFilter) return false;
    if (checkInStart && res.checkIn < checkInStart) return false;
    if (checkInEnd && res.checkIn > checkInEnd) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const guestMatch = res.guestName.toLowerCase().includes(q);
      const emailMatch = res.guestEmail.toLowerCase().includes(q);
      const phoneMatch = res.guestPhone.toLowerCase().includes(q);
      const carMatch = res.carPlate ? res.carPlate.toLowerCase().includes(q) : false;
      const propMatch = demoState.properties
        .find((p) => p.id === res.propertyId)
        ?.name.toLowerCase()
        .includes(q);

      return Boolean(guestMatch || emailMatch || phoneMatch || carMatch || propMatch);
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setPropertyFilter('todos');
    setCheckInStart('');
    setCheckInEnd('');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Huésped',
      'Unidad',
      'Check-In',
      'Check-Out',
      'Noches',
      'Plataforma',
      'Monto Total',
      'Moneda',
      'Estado Cobro',
      'Estado Reserva',
      'Teléfono',
      'Patente',
    ];

    const rows = filteredReservations.map((r) => {
      const prop = demoState.properties.find((p) => p.id === r.propertyId);
      return [
        r.id,
        `"${r.guestName.replace(/"/g, '""')}"`,
        `"${(prop?.name || '').replace(/"/g, '""')}"`,
        r.checkIn,
        r.checkOut,
        r.nights,
        r.platform,
        r.totalAmount,
        'USD',
        r.paymentStatus,
        r.status,
        r.guestPhone,
        r.carPlate || '',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

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

  const getPlatformLabel = (platform: BookingPlatform) => {
    switch (platform) {
      case 'airbnb':
        return 'airbnb API';
      case 'booking':
        return 'Booking.com';
      case 'vrbo':
        return 'VRBO Sync';
      case 'direct':
        return 'Directa Web';
      default:
        return 'iCal Sync';
    }
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return {
          label: 'PAGADO',
          className: 'bg-green-50 text-green-600',
        };
      case 'deposit_only':
        return {
          label: 'SEÑA 50%',
          className: 'bg-blue-50 text-blue-600',
        };
      case 'pending':
      default:
        return {
          label: 'PENDIENTE',
          className: 'bg-amber-50 text-amber-600',
        };
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'CONFIRMADA',
          className: 'bg-emerald-50 text-emerald-700',
        };
      case 'checked_in':
        return {
          label: 'EN CABAÑA',
          className: 'bg-orange-50 text-[#E67E22]',
        };
      case 'checked_out':
        return {
          label: 'CHECK-OUT',
          className: 'bg-stone-100 text-stone-600',
        };
      case 'cancelled':
        return {
          label: 'CANCELADA',
          className: 'bg-rose-50 text-rose-500 line-through',
        };
      default:
        return {
          label: String(status).toUpperCase(),
          className: 'bg-stone-100 text-stone-600',
        };
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

  const getWhatsAppLink = (res: Reservation) => {
    const cleanPhone = res.guestPhone.replace(/[^0-9]/g, '');
    const prop = demoState.properties.find((p) => p.id === res.propertyId);
    const propName = prop?.name || 'nuestro alojamiento';
    const text = encodeURIComponent(
      `¡Hola ${res.guestName.split(' ')[0]}! Te escribimos desde ${propName} (Loomi Suite) respecto a tu estadía del ${formatDisplayDate(res.checkIn)} al ${formatDisplayDate(res.checkOut)}. ¿En qué podemos ayudarte para tu llegada?`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.005)] space-y-4 print:hidden transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-block bg-orange-50 text-[#E67E22] text-[10px] font-semibold tracking-widest px-2.5 py-0.5 rounded-md uppercase">
                Rack & Reservas • En Tiempo Real
              </span>
              <span className="text-xs font-light text-gray-400">
                {filteredReservations.length} {filteredReservations.length === 1 ? 'reserva' : 'reservas'}
              </span>
            </div>
            <h3 className="text-xl font-light text-gray-800 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E67E22]" />
              <span>Lista de Reservas</span>
            </h3>
            <p className="text-xs text-gray-400 font-light">
              Haz clic en cualquier fila para desplegar su ficha rápida, consumos y WhatsApp con transición suave.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            {/* View switcher */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setViewMode('zen-cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'zen-cards'
                    ? 'bg-white text-gray-800 shadow-sm font-medium'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Vista de Acordeón Zen"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Acordeón Zen</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-800 shadow-sm font-medium'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Vista Tabla Completa"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabla PMS</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Unidad
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full text-xs font-light bg-[#FDFBF9] border border-gray-200/70 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#E67E22] transition-colors cursor-pointer"
            >
              <option value="todos">Todas las unidades</option>
              {demoState.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-light bg-[#FDFBF9] border border-gray-200/70 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#E67E22] transition-colors cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="checked_in">En Cabaña</option>
              <option value="checked_out">Salida</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Desde
            </label>
            <input
              type="date"
              value={checkInStart}
              onChange={(e) => setCheckInStart(e.target.value)}
              className="w-full text-xs font-light bg-[#FDFBF9] border border-gray-200/70 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#E67E22] transition-colors font-mono cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Hasta
            </label>
            <input
              type="date"
              value={checkInEnd}
              onChange={(e) => setCheckInEnd(e.target.value)}
              className="w-full text-xs font-light bg-[#FDFBF9] border border-gray-200/70 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#E67E22] transition-colors font-mono cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Buscar
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Nombre, auto o mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-light bg-[#FDFBF9] border border-gray-200/70 rounded-xl pl-9 pr-8 py-2 text-gray-800 focus:outline-none focus:border-[#E67E22] transition-colors"
              />
              {(searchTerm || statusFilter !== 'todos' || propertyFilter !== 'todos' || checkInStart || checkInEnd) && (
                <button
                  onClick={handleClearFilters}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Limpiar Filtros"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
           SECCIÓN: LISTA DE RESERVAS CON FILAS EXPANDIBLES (ACORDEÓN ZEN)
           ========================================================================= */}
      {viewMode === 'zen-cards' && (
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.005)] border border-gray-100 space-y-4">
          {/* Encabezado de la Tabla */}
          <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
            <div className="w-1/4">Huésped / Unidad</div>
            <div className="w-1/4 text-center">Fechas</div>
            <div className="w-1/4 text-center">Estado / Canal</div>
            <div className="w-1/4 text-right">Monto Real</div>
          </div>

          {/* CONTENEDOR DE FILAS */}
          <div className="space-y-2">
            {filteredReservations.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-light text-sm">No se encontraron reservas con los filtros aplicados</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 text-xs text-[#E67E22] hover:underline font-light cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              filteredReservations.map((res) => {
                const propInfo = getPropertyInfo(res.propertyId);
                const isExpanded = expandedReservationId === res.id;
                const paymentBadge = getPaymentStatusBadge(res.paymentStatus);
                const channelLabel = getPlatformLabel(res.platform);
                const guestCarPlate = res.carPlate || 'AF 729 ZX';

                return (
                  <div
                    key={res.id}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? 'border border-orange-100 shadow-[0_4px_12px_rgba(230,126,34,0.02)]'
                        : 'border border-transparent hover:border-gray-100'
                    }`}
                  >
                    {/* Fila Principal (Gatillo de Clic) */}
                    <div
                      onClick={() => toggleRowAccordion(res.id)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        isExpanded
                          ? 'bg-[#FDFBF9] hover:bg-orange-50/20'
                          : 'bg-white hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Nombre y Cabaña */}
                      <div className="w-1/4 space-y-0.5">
                        <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          <span>{res.guestName.split(' ')[0]}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${propInfo.dotColor}`} />
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{propInfo.name}</div>
                      </div>

                      {/* Fechas */}
                      <div className="w-1/4 text-center text-xs font-medium text-gray-600">
                        {formatDisplayDate(res.checkIn)}{' '}
                        <span className="text-gray-300 mx-1">→</span>{' '}
                        {formatDisplayDate(res.checkOut)}
                      </div>

                      {/* Estado / Canal */}
                      <div className="w-1/4 flex flex-col items-center space-y-1">
                        <span
                          className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{channelLabel}</span>
                      </div>

                      {/* Monto e Indicador de Apertura */}
                      <div className="w-1/4 flex items-center justify-end space-x-3 text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {formatCurrency(res.totalAmount)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowAccordion(res.id);
                          }}
                          className={`text-gray-400 hover:text-gray-600 transition-transform duration-300 p-1 cursor-pointer ${
                            isExpanded ? 'rotate-180 text-[#E67E22]' : ''
                          }`}
                          aria-label={isExpanded ? 'Cerrar detalles' : 'Abrir detalles'}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* BLOQUE EXPANDIDO (ESTRUCTURA TRIPARTITA) */}
                    {isExpanded && (
                      <div className="bg-[#FDFBF9] px-6 pb-6 pt-2 border-t border-orange-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100/60">
                          {/* COLUMNA 1: FICHA DEL HUÉSPED */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Ficha del Huésped
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">Tel:</span>
                                <span className="font-medium text-gray-800 font-mono">
                                  {res.guestPhone}
                                </span>
                                <button
                                  onClick={(e) => handleCopy(res.guestPhone, `phone-${res.id}`, e)}
                                  className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                                  title="Copiar teléfono"
                                >
                                  {copiedKey === `phone-${res.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-gray-400">Email:</span>
                                <span className="font-light text-gray-600 truncate" title={res.guestEmail}>
                                  {res.guestEmail}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">Patente:</span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[10px] font-mono text-gray-700">
                                  {guestCarPlate}
                                </span>
                                <button
                                  onClick={(e) => handleCopy(guestCarPlate, `plate-${res.id}`, e)}
                                  className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                                  title="Copiar patente"
                                >
                                  {copiedKey === `plate-${res.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[11px] text-gray-400 pt-0.5">
                                Huéspedes: <span className="text-gray-600">{res.guestsCount} personas</span> • PIN Cerradura:{' '}
                                <span className="font-mono text-gray-700">{res.pinCode}</span>
                              </div>
                            </div>
                          </div>

                          {/* COLUMNA 2: SERVICIOS ADICIONALES */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Servicios Adicionales
                            </h4>
                            <div className="space-y-2 text-xs">
                              {res.addons && res.addons.length > 0 ? (
                                <div className="space-y-1">
                                  {res.addons.map((ad, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100"
                                    >
                                      <span className="text-gray-700 flex items-center gap-1.5">
                                        <Coffee className="w-3 h-3 text-emerald-600" />
                                        <span>{ad.name}</span>
                                      </span>
                                      <span className="text-gray-400 font-medium font-mono text-[11px]">
                                        x{ad.quantity} ({formatCurrency(ad.total)})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 text-gray-400">
                                  <span>Desayuno Seco / Extras</span>
                                  <span className="text-gray-400 font-medium">No contratado</span>
                                </div>
                              )}
                              <div className="bg-white p-2 rounded-xl border border-gray-100 text-gray-500 font-light text-[11px] leading-relaxed">
                                <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">
                                  Nota Interna:
                                </span>
                                {res.specialNotes || 'Sin notas especiales para esta estadía.'}
                              </div>
                            </div>
                          </div>

                          {/* COLUMNA 3: ACCIONES RÁPIDAS */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Acciones Rápidas
                            </h4>
                            <div className="space-y-2">
                              {/* Botón WhatsApp Suavizado */}
                              <a
                                href={getWhatsAppLink(res)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Avisar por WhatsApp</span>
                              </a>

                              {/* Botón Ver Ficha Completa */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectReservation(res);
                                }}
                                className="w-full bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50 p-2.5 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                              >
                                <span>Ver Ficha Completa</span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                              </button>

                              {/* Atajos de cobro rápido */}
                              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                                <span>Neto alojamiento:</span>
                                <span className="font-mono text-emerald-600 font-medium">
                                  {formatCurrency(res.netRevenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
           VISTA ALTERNATIVA: TABLA PMS TRADICIONAL
           ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-stone-400 text-[10px] font-medium uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4 w-16">Depto</th>
                  <th className="py-3 px-4">Huésped</th>
                  <th className="py-3 px-4 font-mono">Check-In</th>
                  <th className="py-3 px-4 font-mono">Check-Out</th>
                  <th className="py-3 px-3 text-center w-12">Noches</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-center">Canal</th>
                  <th className="py-3 px-4 text-right">Neto</th>
                  <th className="py-3 px-4 text-center">Cobro</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center print:hidden">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/80 text-xs text-stone-700">
                {filteredReservations.map((res, index) => {
                  const propInfo = getPropertyInfo(res.propertyId);
                  const statusBadge = getStatusBadge(res.status);
                  const paymentBadge = getPaymentStatusBadge(res.paymentStatus);
                  const channelLabel = getPlatformLabel(res.platform);

                  return (
                    <tr
                      key={res.id}
                      onClick={() => onSelectReservation(res)}
                      className="cursor-pointer hover:bg-stone-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center font-mono text-[11px] text-stone-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] rounded-md ${propInfo.color}`}>
                          {propInfo.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-normal text-stone-800">
                        <div>{res.guestName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{res.guestPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {formatDisplayDate(res.checkIn)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {formatDisplayDate(res.checkOut)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-stone-700">{res.nights}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-stone-800">
                        {formatCurrency(res.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {channelLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                        {formatCurrency(res.netRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReservation(res);
                            }}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Eliminar reserva de ${res.guestName}?`)) {
                                onDeleteReservation(res.id);
                              }
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
