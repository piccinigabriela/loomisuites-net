import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  User,
  KeyRound,
  CheckCheck,
  Search,
  Calendar,
  Phone,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { DemoState, Reservation, MessageTemplate } from '../../types';
import { formatDisplayDate, INITIAL_TEMPLATES } from '../../data/initialData';
import { copyToClipboard } from '../../utils/clipboard';

interface DemoMessagesProps {
  demoState: DemoState;
}

type FilterScope = 'upcoming' | 'today' | 'next7' | 'all';

export const DemoMessages: React.FC<DemoMessagesProps> = ({ demoState }) => {
  // Ensure we always have full list of templates including tpl-5 and tpl-6
  const templatesList = useMemo(() => {
    if (!demoState.templates || demoState.templates.length < INITIAL_TEMPLATES.length) {
      return INITIAL_TEMPLATES;
    }
    return demoState.templates;
  }, [demoState.templates]);

  const [filterScope, setFilterScope] = useState<FilterScope>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templatesList[0]?.id || 'tpl-1'
  );
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  // Today reference (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter and group reservations
  const { filteredReservations, categorizedReservations } = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    // Categorize
    const activeToday: Reservation[] = [];
    const upcoming: Reservation[] = [];
    const past: Reservation[] = [];

    demoState.reservations.forEach((r) => {
      const prop = demoState.properties.find((p) => p.id === r.propertyId);
      const matchesSearch =
        !term ||
        r.guestName.toLowerCase().includes(term) ||
        r.guestPhone?.toLowerCase().includes(term) ||
        prop?.name.toLowerCase().includes(term) ||
        r.platform.toLowerCase().includes(term);

      if (!matchesSearch) return;

      const isCurrentStay = r.checkIn <= todayStr && r.checkOut >= todayStr;
      const isFutureArrival = r.checkIn > todayStr;
      const isPast = r.checkOut < todayStr;

      if (isCurrentStay) {
        activeToday.push(r);
      } else if (isFutureArrival) {
        upcoming.push(r);
      } else if (isPast) {
        past.push(r);
      }
    });

    // Sort upcoming by closest checkIn first
    upcoming.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    // Sort past by most recent checkOut first
    past.sort((a, b) => b.checkOut.localeCompare(a.checkOut));

    // Next 7 days
    const next7Date = new Date();
    next7Date.setDate(next7Date.getDate() + 7);
    const next7Str = next7Date.toISOString().split('T')[0];

    let result: Reservation[] = [];
    if (filterScope === 'today') {
      result = activeToday;
    } else if (filterScope === 'next7') {
      result = [
        ...activeToday,
        ...upcoming.filter((r) => r.checkIn <= next7Str),
      ];
    } else if (filterScope === 'upcoming') {
      result = [...activeToday, ...upcoming];
    } else {
      result = [...activeToday, ...upcoming, ...past];
    }

    return {
      filteredReservations: result,
      categorizedReservations: { activeToday, upcoming, past },
    };
  }, [demoState.reservations, demoState.properties, searchTerm, filterScope, todayStr]);

  // Selected reservation ID
  const [selectedResId, setSelectedResId] = useState<string>(() => {
    return filteredReservations[0]?.id || demoState.reservations[0]?.id || '';
  });

  // Ensure selectedResId is valid if filtered list changes
  const activeSelectedResId = filteredReservations.some((r) => r.id === selectedResId)
    ? selectedResId
    : filteredReservations[0]?.id || demoState.reservations[0]?.id || '';

  const selectedReservation = demoState.reservations.find(
    (r) => r.id === activeSelectedResId
  );
  const selectedProperty = demoState.properties.find(
    (p) => p.id === selectedReservation?.propertyId
  );
  const selectedTemplate = templatesList.find(
    (t) => t.id === selectedTemplateId
  );

  // Compute interpolated message content
  const getInterpolatedMessage = () => {
    if (!selectedTemplate || !selectedReservation || !selectedProperty) return '';

    const guestFirstName = selectedReservation.guestName.split(' ')[0];
    const personalizedGuideUrl = `https://loomisuite.com/guia/${selectedProperty.id}?huesped=${encodeURIComponent(guestFirstName)}&unidad=${encodeURIComponent(selectedProperty.name)}&pin=${encodeURIComponent(selectedReservation.pinCode || '')}`;

    let content = selectedTemplate.content;
    content = content.replace(/{nombre_huesped}/g, guestFirstName);
    content = content.replace(/{nombre_propiedad}/g, selectedProperty.name);
    content = content.replace(/{propiedad_id}/g, selectedProperty.id);
    content = content.replace(/https:\/\/loomisuite\.com\/guia\/{propiedad_id}/g, personalizedGuideUrl);
    content = content.replace(/{link_guia}/g, personalizedGuideUrl);
    content = content.replace(/{direccion_propiedad}/g, `${selectedProperty.address}, ${selectedProperty.neighborhood}`);
    content = content.replace(/{fecha_llegada}/g, formatDisplayDate(selectedReservation.checkIn));
    content = content.replace(/{fecha_salida}/g, formatDisplayDate(selectedReservation.checkOut));
    content = content.replace(/{codigo_cerradura}/g, selectedReservation.pinCode || '1234#');
    content = content.replace(/{nombre_wifi}/g, selectedProperty.wifiNetwork || 'WiFi-Complejo');
    content = content.replace(/{clave_wifi}/g, selectedProperty.wifiPassword || 'Bienvenido2026');

    return content;
  };

  const handleCopy = () => {
    copyToClipboard(getInterpolatedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulate = () => {
    setSimulatedSent(true);
    setTimeout(() => setSimulatedSent(false), 3000);
  };

  // WhatsApp Web / App direct launch URL
  const getWhatsAppLaunchUrl = () => {
    if (!selectedReservation?.guestPhone) return '#';
    const cleanPhone = selectedReservation.guestPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(getInterpolatedMessage());
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
            MENSAJERÍA & WHATSAPP • AUTOMATIZACIONES
          </span>
        </div>
        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 tracking-tight mt-0.5">
          <MessageSquare className="w-5 h-5 text-[#E67E22]" />
          <span>Simulador y Envío Directo de WhatsApp</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
          Elegí el huésped y la plantilla inteligente. Los datos de la reserva, wifi, fechas y cerraduras se rellenan automáticamente listos para enviar en 1 toque.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Side: Selectors (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Reservation Selector with Smart Filters */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                1. Selecciona el Huésped o Reserva
              </label>
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                {filteredReservations.length} {filteredReservations.length === 1 ? 'reserva' : 'reservas'}
              </span>
            </div>

            {/* Scope Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100/70 dark:bg-zinc-800/60 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
              <button
                type="button"
                onClick={() => setFilterScope('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterScope === 'upcoming'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Próximas & Hoy ({categorizedReservations.activeToday.length + categorizedReservations.upcoming.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterScope === 'today'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                En Estadía ({categorizedReservations.activeToday.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('next7')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterScope === 'next7'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                7 Días
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Todas
              </button>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nombre de huésped, teléfono o depto..."
                className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-stone-800 dark:text-stone-200 focus:outline-none"
              />
            </div>

            {/* Clean Dropdown with Optgroups */}
            {filteredReservations.length > 0 ? (
              <select
                value={activeSelectedResId}
                onChange={(e) => setSelectedResId(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                {categorizedReservations.activeToday.length > 0 && (
                  <optgroup label="📍 EN ESTADÍA HOY">
                    {categorizedReservations.activeToday.map((r) => {
                      const prop = demoState.properties.find((p) => p.id === r.propertyId);
                      return (
                        <option key={r.id} value={r.id}>
                          [HOY] {r.guestName} ({r.platform.toUpperCase()}) • {prop?.name || 'Alojamiento'} ({formatDisplayDate(r.checkIn)} al {formatDisplayDate(r.checkOut)})
                        </option>
                      );
                    })}
                  </optgroup>
                )}

                {categorizedReservations.upcoming.length > 0 && (
                  <optgroup label="🚀 PRÓXIMAS LLEGADAS">
                    {categorizedReservations.upcoming.map((r) => {
                      const prop = demoState.properties.find((p) => p.id === r.propertyId);
                      return (
                        <option key={r.id} value={r.id}>
                          {r.guestName} ({r.platform.toUpperCase()}) • {prop?.name || 'Alojamiento'} ({formatDisplayDate(r.checkIn)} al {formatDisplayDate(r.checkOut)})
                        </option>
                      );
                    })}
                  </optgroup>
                )}

                {filterScope === 'all' && categorizedReservations.past.length > 0 && (
                  <optgroup label="📜 HISTORIAL PASADO">
                    {categorizedReservations.past.map((r) => {
                      const prop = demoState.properties.find((p) => p.id === r.propertyId);
                      return (
                        <option key={r.id} value={r.id}>
                          [PASADA] {r.guestName} ({r.platform.toUpperCase()}) • {prop?.name || 'Alojamiento'} ({formatDisplayDate(r.checkIn)} al {formatDisplayDate(r.checkOut)})
                        </option>
                      );
                    })}
                  </optgroup>
                )}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 text-center font-medium">
                No hay reservas para este filtro. Probá con <strong>"Todas"</strong> o limpiá la búsqueda.
              </div>
            )}

            {selectedReservation && (
              <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp: <strong className="text-stone-900 dark:text-white font-mono">{selectedReservation.guestPhone || 'No cargado'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>PIN: <strong className="font-mono text-[#E67E22]">{selectedReservation.pinCode || '—'}</strong></span>
                  {selectedReservation.guestPhone && (
                    <a
                      href={getWhatsAppLaunchUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Abrir chat en WhatsApp"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template Selector with all Templates */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
            <div className="flex items-center justify-between mb-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                2. Elige el Disparador o Plantilla
              </label>
              <span className="text-[10px] font-bold text-[#E67E22] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-md border border-orange-200/50">
                {templatesList.length} Plantillas
              </span>
            </div>

            <div className="space-y-2.5">
              {templatesList.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-orange-50/70 dark:bg-orange-950/30 border-[#E67E22]/60 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'bg-stone-50/50 dark:bg-zinc-800/40 border-stone-200/70 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-semibold flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                      {tpl.id === 'tpl-5' && '🚗'}
                      {tpl.id === 'tpl-6' && '🛡️'}
                      {tpl.id === 'tpl-1' && '👋'}
                      {tpl.id === 'tpl-2' && '🔑'}
                      {tpl.id === 'tpl-3' && '⏰'}
                      {tpl.id === 'tpl-4' && '🌟'}
                      <span>{tpl.title}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-zinc-700 border border-stone-200/80 dark:border-zinc-600 text-stone-500 dark:text-stone-400 shrink-0">
                      {tpl.triggerEvent}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">{tpl.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: WhatsApp Phone Mockup (6 cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-stone-900 dark:bg-zinc-950 p-3 shadow-2xl border-4 border-stone-700 dark:border-zinc-800 relative">
            {/* Screen */}
            <div className="bg-[#EFEAE2] rounded-[2rem] overflow-hidden flex flex-col h-[540px] shadow-inner text-zinc-900 font-sans">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-300 overflow-hidden">
                    <img
                      src={selectedReservation?.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold leading-none">{selectedReservation?.guestName || 'Huésped'}</h5>
                    <span className="text-[10px] text-emerald-200 font-mono">
                      {selectedReservation?.guestPhone || 'En línea'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  Loomi Bot
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-3">
                <div className="text-center">
                  <span className="text-[10px] font-semibold bg-white/80 text-zinc-500 px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                    Hoy
                  </span>
                </div>

                {/* Sent Bubble */}
                <div className="self-end bg-[#DCF8C6] rounded-2xl rounded-tr-xs p-3.5 max-w-[88%] shadow-xs text-xs text-zinc-800 leading-relaxed relative">
                  <div className="whitespace-pre-line text-xs font-medium">
                    {getInterpolatedMessage()}
                  </div>
                  <div className="text-right mt-1.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-mono">
                    <span>10:14</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Bottom Actions inside mockup */}
              <div className="p-3 bg-white border-t border-zinc-200 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleSendSimulate}
                    className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{simulatedSent ? '¡Simulado!' : 'Simular'}</span>
                  </button>
                </div>

                {/* Real 1-Click WhatsApp Send Button */}
                <a
                  href={getWhatsAppLaunchUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp Real</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
