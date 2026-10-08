import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  CheckCheck,
  Search,
  Calendar,
  Phone,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { DemoState, Reservation, MessageTemplate } from '../../types';
import { formatDisplayDate, INITIAL_TEMPLATES } from '../../data/initialData';
import { copyToClipboard } from '../../utils/clipboard';
import { WebTemplatesManager } from '../WebTemplatesManager';
import { GuestWelcomeCard } from '../GuestWelcomeCard';

interface DemoMessagesProps {
  demoState: DemoState;
}

type FilterScope = 'upcoming' | 'today' | 'next7' | 'all';
type MessagesSubTab = 'simulator' | 'templates' | 'card';

export const DemoMessages: React.FC<DemoMessagesProps> = ({ demoState }) => {
  const [subTab, setSubTab] = useState<MessagesSubTab>('simulator');
  const [phoneViewMode, setPhoneViewMode] = useState<'chat' | 'card'>('chat');
  // Ensure we always have full list of master templates
  const templatesList = useMemo(() => {
    if (!demoState.templates || demoState.templates.length < INITIAL_TEMPLATES.length || !demoState.templates.some((t) => t.title?.includes('Blindaje Anti-Quejas'))) {
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

  // Compute interpolated message content (replacing double curly braces and single curly braces)
  const getInterpolatedMessage = () => {
    if (!selectedTemplate || !selectedReservation || !selectedProperty) return '';

    const guestFirstName = selectedReservation.guestName.split(' ')[0];
    const personalizedGuideUrl = `https://loomisuite.com/guia/${selectedProperty.id}?huesped=${encodeURIComponent(guestFirstName)}&unidad=${encodeURIComponent(selectedProperty.name)}&pin=${encodeURIComponent(selectedReservation.pinCode || '')}`;

    let content = selectedTemplate.content;

    // Double curly braces {{...}}
    content = content.replace(/\{\{nombre_huésped\}\}/gi, guestFirstName);
    content = content.replace(/\{\{nombre_huesped\}\}/gi, guestFirstName);
    content = content.replace(/\{\{unidad_alojamiento\}\}/gi, selectedProperty.name);
    content = content.replace(/\{\{fecha_checkin\}\}/gi, formatDisplayDate(selectedReservation.checkIn));
    content = content.replace(/\{\{fecha_checkout\}\}/gi, formatDisplayDate(selectedReservation.checkOut));
    content = content.replace(/\{\{link_guia_digital\}\}/gi, personalizedGuideUrl);
    content = content.replace(/\{\{link_guia\}\}/gi, personalizedGuideUrl);

    // Single curly braces {...} for backwards compatibility
    content = content.replace(/\{nombre_huesped\}/gi, guestFirstName);
    content = content.replace(/\{nombre_huésped\}/gi, guestFirstName);
    content = content.replace(/\{nombre_propiedad\}/gi, selectedProperty.name);
    content = content.replace(/\{propiedad_id\}/gi, selectedProperty.id);
    content = content.replace(/https:\/\/loomisuite\.com\/guia\/\{propiedad_id\}/gi, personalizedGuideUrl);
    content = content.replace(/\{link_guia\}/gi, personalizedGuideUrl);
    content = content.replace(/\{direccion_propiedad\}/gi, `${selectedProperty.address}, ${selectedProperty.neighborhood}`);
    content = content.replace(/\{fecha_llegada\}/gi, formatDisplayDate(selectedReservation.checkIn));
    content = content.replace(/\{fecha_salida\}/gi, formatDisplayDate(selectedReservation.checkOut));
    content = content.replace(/\{codigo_cerradura\}/gi, selectedReservation.pinCode || '1234#');
    content = content.replace(/\{nombre_wifi\}/gi, selectedProperty.wifiNetwork || 'WiFi-Complejo');
    content = content.replace(/\{clave_wifi\}/gi, selectedProperty.wifiPassword || 'Bienvenido2026');

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

  // Helper to render text with highlighted variables {{...}} and links styled in oxide pastel
  const renderTemplateBlockContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, lIdx) => {
          // Tokenize line by {{...}} and URLs
          const parts = line.split(/(\{\{[^}]+\}\}|https?:\/\/[^\s]+)/g);
          return (
            <p key={lIdx} className="leading-relaxed font-light text-stone-600 dark:text-stone-300">
              {parts.map((part, pIdx) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                  return (
                    <span
                      key={pIdx}
                      className="font-normal text-[#D86F35] bg-[#FDF3E7] dark:bg-orange-950/40 px-1 py-0.5 rounded text-[11px] font-mono border border-orange-200/40"
                    >
                      {part}
                    </span>
                  );
                }
                if (part.startsWith('http://') || part.startsWith('https://')) {
                  return (
                    <span
                      key={pIdx}
                      className="font-normal text-[#D86F35] underline decoration-orange-300 underline-offset-2 break-all"
                    >
                      {part}
                    </span>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to render phone bubble with live URLs and oxide pastel links
  const renderLivePhoneBubbleContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, lIdx) => {
          const parts = line.split(/(https?:\/\/[^\s]+)/g);
          return (
            <p key={lIdx} className="leading-relaxed font-light text-[11.5px] text-stone-800">
              {parts.map((part, pIdx) => {
                if (part.startsWith('http://') || part.startsWith('https://')) {
                  return (
                    <a
                      key={pIdx}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-normal text-[#C55A1B] underline decoration-orange-300 underline-offset-2 break-all hover:text-[#A8450F] transition-colors"
                    >
                      {part}
                    </a>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-['Inter',sans-serif] font-light">
      {/* Header Banner - Zen Style */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-5 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.005)] transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              MENSAJERÍA & WHATSAPP • SIMULADOR ZEN OMOTENASHI
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            Inter 300 • Óxido Pastel
          </span>
        </div>
        <h3 className="text-xl font-light text-gray-800 dark:text-stone-100 flex items-center gap-2 tracking-tight mt-0.5">
          <MessageSquare className="w-4 h-4 text-[#E67E22]" />
          <span>Simulador y Envío Directo de WhatsApp</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-stone-400 mt-1 font-light leading-relaxed">
          Plantillas preestablecidas con tono cercano y cálido (Omotenashi). Los datos de la reserva, links y fechas se reemplazan automáticamente en 1 toque.
        </p>

        {/* Selector de Vistas / Componentes */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            onClick={() => setSubTab('simulator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-light transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'simulator'
                ? 'bg-[#E67E22] text-white shadow-xs font-normal'
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Simulador WhatsApp</span>
          </button>

          <button
            onClick={() => setSubTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-light transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'templates'
                ? 'bg-[#E67E22] text-white shadow-xs font-normal'
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestor de Plantillas Web (WebTemplatesManager)</span>
          </button>

          <button
            onClick={() => setSubTab('card')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-light transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'card'
                ? 'bg-[#E67E22] text-white shadow-xs font-normal'
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarjeta de Bienvenida Digital (GuestWelcomeCard)</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: GESTOR DE PLANTILLAS WEB */}
      {subTab === 'templates' && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-gray-100 dark:border-zinc-800 p-2 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <WebTemplatesManager />
        </div>
      )}

      {/* VISTA 2: TARJETA DE BIENVENIDA DIGITAL */}
      {subTab === 'card' && (
        <div className="space-y-6">
          {/* Selector de huésped para previsualizar su ficha */}
          <div className="max-w-md mx-auto bg-white dark:bg-[#18191E] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs space-y-2">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Seleccionar huésped para la tarjeta:
            </label>
            <select
              value={activeSelectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full text-xs font-light rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 p-2.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {filteredReservations.map((r) => {
                const prop = demoState.properties.find((p) => p.id === r.propertyId);
                return (
                  <option key={r.id} value={r.id}>
                    {r.guestName} • {prop?.name || 'Alojamiento'} ({formatDisplayDate(r.checkIn)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Render del componente GuestWelcomeCard */}
          <GuestWelcomeCard
            guestName={selectedReservation?.guestName || 'Huésped'}
            propertyName={selectedProperty?.name || 'Departamento'}
            checkInDate={selectedReservation ? formatDisplayDate(selectedReservation.checkIn) : '15 de Octubre'}
            checkOutDate={selectedReservation ? formatDisplayDate(selectedReservation.checkOut) : '19 de Octubre'}
            checkInTime="14:00 hs"
            accessCode={selectedReservation?.pinCode || '4820'}
            wifiNetwork={selectedProperty?.wifiNetwork || 'Catalinas_Guest_5G'}
            wifiPassword={selectedProperty?.wifiPassword || 'bienvenidoscatalinas'}
            address={selectedProperty ? `${selectedProperty.address}, ${selectedProperty.neighborhood}` : 'Tres Sargentos 435, Retiro / Catalinas Norte, CABA'}
            guideUrl={`https://loomisuite.com/guia/${selectedProperty?.id || 'cat-b'}?huesped=${encodeURIComponent(selectedReservation?.guestName || 'Huesped')}`}
            hostPhone={selectedReservation?.guestPhone?.replace(/[^0-9]/g, '') || '5491140506070'}
          />
        </div>
      )}

      {/* VISTA 3: SIMULADOR WHATSAPP & PHONE MOCKUP */}
      {subTab === 'simulator' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Side: Selectors & Master Templates Blocks (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Reservation Selector with Zen Capsule Filters */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.005)] transition-colors space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-800 dark:text-stone-200">
                1. Seleccioná el Huésped o Reserva
              </label>
              <span className="text-[11px] font-light text-gray-400 dark:text-zinc-500">
                {filteredReservations.length} {filteredReservations.length === 1 ? 'reserva' : 'reservas'}
              </span>
            </div>

            {/* Scope Filter Capsules */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-100 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setFilterScope('upcoming')}
                className={`px-3 py-1 rounded-lg text-xs font-light transition-all cursor-pointer ${
                  filterScope === 'upcoming'
                    ? 'bg-white dark:bg-zinc-700 text-[#D86F35] shadow-xs font-normal'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                Próximas & Hoy ({categorizedReservations.activeToday.length + categorizedReservations.upcoming.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('today')}
                className={`px-3 py-1 rounded-lg text-xs font-light transition-all cursor-pointer ${
                  filterScope === 'today'
                    ? 'bg-white dark:bg-zinc-700 text-[#D86F35] shadow-xs font-normal'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                En Estadía ({categorizedReservations.activeToday.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('next7')}
                className={`px-3 py-1 rounded-lg text-xs font-light transition-all cursor-pointer ${
                  filterScope === 'next7'
                    ? 'bg-white dark:bg-zinc-700 text-[#D86F35] shadow-xs font-normal'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                7 Días
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('all')}
                className={`px-3 py-1 rounded-lg text-xs font-light transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-[#D86F35] shadow-xs font-normal'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                Todas
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por huésped, teléfono o unidad..."
                className="w-full pl-8 pr-3 py-2 text-xs font-light rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/60 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-orange-300 transition-colors"
              />
            </div>

            {/* Dropdown with Optgroups */}
            {filteredReservations.length > 0 ? (
              <select
                value={activeSelectedResId}
                onChange={(e) => setSelectedResId(e.target.value)}
                className="w-full text-xs font-light p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/60 text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
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
              <div className="p-3 bg-stone-50 dark:bg-zinc-800/40 rounded-xl border border-stone-200/60 text-xs text-stone-500 text-center font-light">
                No hay reservas para este filtro. Probá con <strong>"Todas"</strong> o limpiá la búsqueda.
              </div>
            )}

            {/* Quick metadata pills */}
            {selectedReservation && selectedProperty && (
              <div className="p-3 bg-[#FDFBF9] dark:bg-zinc-800/40 rounded-xl border border-orange-100/60 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-light">
                    WhatsApp:{' '}
                    <strong className="font-normal font-mono text-stone-800 dark:text-stone-200">
                      {selectedReservation.guestPhone || 'No cargado'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-light">
                    Unidad:{' '}
                    <strong className="font-normal text-stone-800 dark:text-stone-200">
                      {selectedProperty.name}
                    </strong>
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="font-light">
                    Fechas:{' '}
                    <strong className="font-normal text-stone-800 dark:text-stone-200">
                      {formatDisplayDate(selectedReservation.checkIn)} → {formatDisplayDate(selectedReservation.checkOut)}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Plantillas de Mensajes Máster para Loomisuite */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.005)] transition-colors space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-gray-800 dark:text-stone-200">
                  2. Plantillas de Mensajes Máster
                </label>
                <p className="text-[10px] text-gray-400 font-light mt-0.5">
                  Tono ultra profesional y cercano (Omotenashi) con variables dinámicas
                </p>
              </div>
              <span className="text-[10px] font-normal text-[#D86F35] bg-[#FDF3E7] dark:bg-orange-950/40 px-2.5 py-0.5 rounded-md border border-orange-200/50">
                {templatesList.length} Plantillas
              </span>
            </div>

            {/* Template Blocks Accordion / Selection */}
            <div className="space-y-3">
              {templatesList.map((tpl, idx) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDFBF9] dark:bg-orange-950/20 border-orange-200 shadow-[0_4px_12px_rgba(230,126,34,0.03)]'
                        : 'bg-white dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-800 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]"></span>
                        <h4 className="text-xs font-medium text-stone-800 dark:text-stone-100">
                          Plantilla {idx + 1}: {tpl.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-light bg-stone-50 dark:bg-zinc-700 text-stone-500 dark:text-stone-400 border border-stone-200/60 shrink-0">
                        Disparo: {tpl.triggerEvent}
                      </span>
                    </div>

                    {/* Preloaded Template Text Block with Highlighted Variables */}
                    <div className="text-xs bg-white dark:bg-zinc-900/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-stone-600 dark:text-stone-300">
                      {renderTemplateBlockContent(tpl.content)}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50 dark:border-zinc-800/50 text-[11px]">
                      <span className="text-stone-400 font-light flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#D86F35]" />
                        <span>Clic para activar en el simulador</span>
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-normal text-[#D86F35] bg-[#FDF3E7] px-2 py-0.5 rounded-full">
                          ✓ Activa en Simulador
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: WhatsApp Phone Mockup (6 cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-stone-900 dark:bg-zinc-950 p-3 shadow-2xl border-4 border-stone-700 dark:border-zinc-800 relative self-start sticky top-6">
            {/* Screen */}
            <div className="bg-[#EFEAE2] rounded-[2rem] overflow-hidden flex flex-col h-[580px] shadow-inner text-zinc-900 font-['Inter',sans-serif]">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] p-3 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-300 overflow-hidden ring-1 ring-white/20">
                    <img
                      src={selectedReservation?.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-normal leading-none text-white tracking-tight">
                      {selectedReservation?.guestName || 'Huésped'}
                    </h5>
                    <span className="text-[10px] text-emerald-200 font-mono font-light">
                      {selectedReservation?.guestPhone || 'En línea'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-light bg-white/20 px-2 py-0.5 rounded-full">
                  Loomi Suite
                </div>
              </div>

              {/* Toggle de Modo dentro del Celular (Chat vs Tarjeta Digital) */}
              <div className="bg-[#054c43] px-3 py-1.5 flex items-center justify-center gap-1.5 border-t border-white/10 text-[10px]">
                <button
                  onClick={() => setPhoneViewMode('chat')}
                  className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    phoneViewMode === 'chat'
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-emerald-200/80 hover:text-white'
                  }`}
                >
                  💬 Chat WhatsApp
                </button>
                <button
                  onClick={() => setPhoneViewMode('card')}
                  className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    phoneViewMode === 'card'
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-emerald-200/80 hover:text-white'
                  }`}
                >
                  🪪 Ficha de Bienvenida
                </button>
              </div>

              {/* Pantalla del Celular: Modo Ficha o Modo Chat */}
              {phoneViewMode === 'card' ? (
                <div className="flex-1 p-2 overflow-y-auto bg-[#FAF8F5]">
                  <GuestWelcomeCard
                    guestName={selectedReservation?.guestName || 'Huésped'}
                    propertyName={selectedProperty?.name || 'Departamento'}
                    checkInDate={selectedReservation ? formatDisplayDate(selectedReservation.checkIn) : '15 de Octubre'}
                    checkOutDate={selectedReservation ? formatDisplayDate(selectedReservation.checkOut) : '19 de Octubre'}
                    checkInTime="14:00 hs"
                    accessCode={selectedReservation?.pinCode || '4820'}
                    wifiNetwork={selectedProperty?.wifiNetwork || 'Catalinas_Guest_5G'}
                    wifiPassword={selectedProperty?.wifiPassword || 'bienvenidoscatalinas'}
                    address={selectedProperty ? `${selectedProperty.address}, ${selectedProperty.neighborhood}` : 'Tres Sargentos 435, Retiro / Catalinas Norte, CABA'}
                    guideUrl={`https://loomisuite.com/guia/${selectedProperty?.id || 'cat-b'}?huesped=${encodeURIComponent(selectedReservation?.guestName || 'Huesped')}`}
                    hostPhone={selectedReservation?.guestPhone?.replace(/[^0-9]/g, '') || '5491140506070'}
                  />
                </div>
              ) : (
                /* Chat Canvas with Wallpaper & Master Message Bubble */
                <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-3 bg-[#EFEAE2]">
                  <div className="text-center">
                    <span className="text-[10px] font-light bg-white/80 text-zinc-500 px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                      Hoy • Mensaje Pre-cargado
                    </span>
                  </div>

                  {/* Sent Bubble - Clean Zen Look with Oxide Pastel Links */}
                  <div className="self-end bg-[#DCF8C6] rounded-2xl rounded-tr-xs p-3.5 max-w-[92%] shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-xs text-zinc-800 leading-relaxed relative">
                    <div className="whitespace-pre-line text-xs font-light">
                      {renderLivePhoneBubbleContent(getInterpolatedMessage())}
                    </div>
                    <div className="text-right mt-1.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-mono font-light">
                      <span>10:14</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions inside mockup */}
              <div className="p-3 bg-white border-t border-zinc-200 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 text-xs font-light py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                    <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    onClick={handleSendSimulate}
                    className="flex-1 text-xs font-light py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-stone-300" />
                    <span>{simulatedSent ? '¡Simulado!' : 'Simular Envío'}</span>
                  </button>
                </div>

                {/* Real 1-Click WhatsApp Send Button */}
                <a
                  href={getWhatsAppLaunchUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en WhatsApp Real</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
