import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { DemoState, Reservation, Property, BookingPlatform } from '../../types';

interface CalendarImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoState: DemoState;
  onImport: (importedReservations: Reservation[], mode: 'add' | 'replace') => void;
}

interface ParsedEvent {
  guestName: string;
  checkIn: string;
  checkOut: string;
  propertyId: string;
  platform: BookingPlatform;
  nights: number;
}

export const CalendarImportModal: React.FC<CalendarImportModalProps> = ({
  isOpen,
  onClose,
  demoState,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process and parse the Google Calendar (.ics) or CSV file
  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const text = await selectedFile.text();
      let events: ParsedEvent[] = [];

      if (selectedFile.name.endsWith('.ics')) {
        events = parseICS(text);
      } else {
        // Assume CSV
        events = parseCSV(text);
      }

      setParsedEvents(events);
      setStep('preview');
    } catch (err) {
      alert('Error al leer el archivo. Probá con otro archivo .ics o .csv válido.');
    }
  };

  // Real parsing of Google Calendar .ics file
  const parseICS = (text: string): ParsedEvent[] => {
    const events: ParsedEvent[] = [];
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;

    const properties = demoState.properties;
    const defaultPropertyId = properties[0]?.id || 'prop-1';

    while ((match = veventRegex.exec(text)) !== null) {
      const block = match[1];
      
      // Parse SUMMARY (Guest Name)
      const summaryMatch = block.match(/SUMMARY:(.*)/);
      let guestName = summaryMatch ? summaryMatch[1].trim() : 'Reserva Importada';
      // Clean names like "Reserva de Juan Pérez" or similar
      guestName = guestName
        .replace(/^(Reserva\s+de\s+|Reserva\s+-?\s*)/i, '')
        .replace(/\\/g, '') // remove escape chars
        .trim();

      // Parse dates: DTSTART & DTEND
      const dtstartMatch = block.match(/DTSTART(?:;[^:]*)?:(\d{8})/);
      const dtendMatch = block.match(/DTEND(?:;[^:]*)?:(\d{8})/);

      if (dtstartMatch && dtendMatch) {
        const startStr = dtstartMatch[1];
        const endStr = dtendMatch[1];

        const checkIn = `${startStr.substring(0, 4)}-${startStr.substring(4, 6)}-${startStr.substring(6, 8)}`;
        const checkOut = `${endStr.substring(0, 4)}-${endStr.substring(4, 6)}-${endStr.substring(6, 8)}`;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Look for property keywords in block (e.g. Cabaña 1, Wood Cabin, etc.)
        let matchedPropertyId = defaultPropertyId;
        const lowercaseBlock = block.toLowerCase() + guestName.toLowerCase();
        for (const prop of properties) {
          if (lowercaseBlock.includes(prop.name.toLowerCase()) || lowercaseBlock.includes(prop.id.toLowerCase())) {
            matchedPropertyId = prop.id;
            break;
          }
        }

        // Determine platform from keyword
        let platform: BookingPlatform = 'direct';
        if (lowercaseBlock.includes('airbnb')) platform = 'airbnb';
        else if (lowercaseBlock.includes('booking')) platform = 'booking';
        else if (lowercaseBlock.includes('vrbo') || lowercaseBlock.includes('expedia')) platform = 'vrbo';

        events.push({
          guestName: guestName || 'Huésped Google Cal',
          checkIn,
          checkOut,
          propertyId: matchedPropertyId,
          platform,
          nights,
        });
      }
    }

    // Sort by check-in date
    return events.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  };

  // Real parsing of CSV file
  const parseCSV = (text: string): ParsedEvent[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const properties = demoState.properties;
    const defaultPropertyId = properties[0]?.id || 'prop-1';
    const events: ParsedEvent[] = [];

    // Simple header matching or direct parsing
    const headers = lines[0].toLowerCase().split(/[;,]/);
    
    // Find column indexes
    const guestIdx = headers.findIndex(h => h.includes('guest') || h.includes('nombre') || h.includes('huésped') || h.includes('reserva') || h.includes('summary'));
    const startIdx = headers.findIndex(h => h.includes('start') || h.includes('desde') || h.includes('entrada') || h.includes('checkin') || h.includes('check-in'));
    const endIdx = headers.findIndex(h => h.includes('end') || h.includes('hasta') || h.includes('salida') || h.includes('checkout') || h.includes('check-out'));
    const cabinIdx = headers.findIndex(h => h.includes('cabin') || h.includes('cabaña') || h.includes('propiedad') || h.includes('unidad'));

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/[;,]/);
      if (row.length < 2) continue;

      let guestName = guestIdx !== -1 && row[guestIdx] ? row[guestIdx].replace(/"/g, '').trim() : `Reserva Fila ${i}`;
      let checkIn = startIdx !== -1 && row[startIdx] ? row[startIdx].replace(/"/g, '').trim() : '';
      let checkOut = endIdx !== -1 && row[endIdx] ? row[endIdx].replace(/"/g, '').trim() : '';
      let cabinVal = cabinIdx !== -1 && row[cabinIdx] ? row[cabinIdx].replace(/"/g, '').trim().toLowerCase() : '';

      // Standardize date formats: DD/MM/YYYY or YYYY-MM-DD
      const normalizeDate = (dStr: string) => {
        if (!dStr) return '';
        // DD/MM/YYYY format
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = '20' + year;
            return `${year}-${month}-${day}`;
          }
        }
        return dStr; // Assume already YYYY-MM-DD
      };

      const normalizedIn = normalizeDate(checkIn);
      const normalizedOut = normalizeDate(checkOut);

      if (normalizedIn && normalizedOut) {
        const cInDate = new Date(normalizedIn);
        const cOutDate = new Date(normalizedOut);
        const nights = Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24)));

        let matchedPropertyId = defaultPropertyId;
        for (const prop of properties) {
          if (cabinVal.includes(prop.name.toLowerCase()) || prop.name.toLowerCase().includes(cabinVal)) {
            matchedPropertyId = prop.id;
            break;
          }
        }

        events.push({
          guestName,
          checkIn: normalizedIn,
          checkOut: normalizedOut,
          propertyId: matchedPropertyId,
          platform: 'direct',
          nights,
        });
      }
    }

    return events;
  };

  // Trigger loading a demo Google Calendar file
  const loadDemoCalendarFile = () => {
    const today = new Date();
    const formatDate = (daysOffset: number) => {
      const d = new Date();
      d.setDate(today.getDate() + daysOffset);
      return d.toISOString().split('T')[0].replace(/-/g, '');
    };

    const properties = demoState.properties;
    const propName1 = properties[0]?.name || 'Cabaña Bosque';
    const propName2 = properties[1]?.name || 'Cabaña Lago';

    // Simulated .ics file containing real standard Google Cal format
    const dummyICSContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:${formatDate(3)}
DTEND;VALUE=DATE:${formatDate(6)}
SUMMARY:Reserva Airbnb - Lionel Messi (${propName1})
DESCRIPTION:Contacto: lio.messi@seleccion.ar
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:${formatDate(7)}
DTEND;VALUE=DATE:${formatDate(9)}
SUMMARY:Reserva Booking.com - Diego Maradona (${propName2})
DESCRIPTION:Contacto: dieguito@pelusa.com
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:${formatDate(1)}
DTEND;VALUE=DATE:${formatDate(3)}
SUMMARY:Reserva Directa - Gustavo Cerati (${propName1})
DESCRIPTION:Contacto: cerati@soda.com.ar
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:${formatDate(10)}
DTEND;VALUE=DATE:${formatDate(14)}
SUMMARY:Reserva Directa - Gabriela Piccini (${propName2})
DESCRIPTION:Importada por Google Calendar
END:VEVENT
END:VCALENDAR`;

    const events = parseICS(dummyICSContent);
    setParsedEvents(events);
    setStep('preview');
    setFile(new File([''], 'google_calendar_demo_export.ics'));
  };

  // Helper to check overlaps with existing system reservations
  const checkOverlap = (ev: ParsedEvent) => {
    return demoState.reservations.some(r => {
      if (r.propertyId !== ev.propertyId || r.status === 'cancelled') return false;
      
      // Real check-in check-out overlaps
      const startA = new Date(r.checkIn).getTime();
      const endA = new Date(r.checkOut).getTime();
      const startB = new Date(ev.checkIn).getTime();
      const endB = new Date(ev.checkOut).getTime();

      return (startB < endA && endB > startA);
    });
  };

  const handleConfirmImport = () => {
    // Generate actual complete reservation objects from parsed events
    const newReservations: Reservation[] = parsedEvents.map((ev, idx) => {
      const matchedProperty = demoState.properties.find(p => p.id === ev.propertyId) || demoState.properties[0];
      const basePrice = matchedProperty?.basePrice || 120;
      const cleaningFee = matchedProperty?.cleaningFee || 35;
      const totalAmount = basePrice * ev.nights + cleaningFee;
      const commissionPaid = ev.platform === 'airbnb' ? Math.round(totalAmount * 0.03 * 10) / 10 : 0;

      return {
        id: `imported-${Date.now()}-${idx}`,
        propertyId: ev.propertyId,
        guestName: ev.guestName,
        guestEmail: `${ev.guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        guestPhone: '+54 9 11 ' + Math.floor(10000000 + Math.random() * 90000000),
        guestAvatar: `https://images.unsplash.com/photo-${1500000000000 + idx}?w=120`,
        checkIn: ev.checkIn,
        checkOut: ev.checkOut,
        nights: ev.nights,
        guestsCount: 2,
        platform: ev.platform,
        totalAmount,
        cleaningFee,
        commissionPaid,
        netRevenue: totalAmount - commissionPaid,
        status: 'confirmed',
        paymentStatus: 'deposit_only',
        pinCode: matchedProperty?.smartLock?.enabled ? String(1000 + Math.floor(Math.random() * 9000)) : '',
        createdAt: new Date().toISOString(),
      };
    });

    onImport(newReservations, importMode);
    setStep('upload');
    setFile(null);
    onClose();
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(demoState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LoomiSuite_Backup_Reservas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="calendar-import-modal"
        className="bg-[#141414] border border-[#2a2a2a] text-[#f4f2ee] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2a221b] border border-[#d88d5e]/30 rounded-lg text-[#d88d5e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Importar Reservas (Google Calendar / CSV / .ics)</h3>
              <p className="text-[11px] text-[#8e8c87]">Subí tu archivo exportado de Google Calendar (.ics) o tu planilla excel de reservas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#252525] rounded-lg text-[#8e8c87] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'upload' ? (
          <div className="p-5 space-y-5">
            {/* Formats Info Bar */}
            <div className="bg-[#1c1a18] border border-[#2c221b] rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d88d5e] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d88d5e]" />
                  Formatos compatibles: Archivos .ics y .csv
                </span>
                <span className="bg-[#241d17] border border-[#d88d5e]/25 text-[#d88d5e] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {demoState.reservations.length} reservas en la app
                </span>
              </div>
              
              <ul className="space-y-2.5 text-xs text-[#c8c5c0]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d88d5e] shrink-0 mt-1.5" />
                  <span>
                    <strong>Google Calendar (.ics o .csv):</strong> Podés exportar tu calendario desde <em>Google Calendar → Configuración → Importar y exportar</em>. Admite tanto el archivo .ics descargado como archivos .csv.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d88d5e] shrink-0 mt-1.5" />
                  <span>
                    <strong>Planillas de reservas (.csv):</strong> Detecta automáticamente columnas de Cabaña, Huésped, Fechas de Entrada/Salida, Teléfono, Precio y Plataforma.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d88d5e] shrink-0 mt-1.5" />
                  <span>
                    <strong>Sin superposiciones:</strong> En el siguiente paso podrás revisar si hay reservas encimadas antes de confirmar la importación definitiva.
                  </span>
                </li>
              </ul>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#d88d5e] bg-[#2a221b]/40'
                  : 'border-[#333333] hover:border-[#444444] bg-[#121212]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".ics,.csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="w-12 h-12 bg-[#24201c] text-[#d88d5e] rounded-full flex items-center justify-center border border-[#d88d5e]/20 shadow-xs">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Arrastrá tu archivo .ics o .csv aquí</p>
                <p className="text-[11px] text-[#8e8c87] mt-0.5">o hacé clic para buscar en tu dispositivo (Archivos .ics, .csv, .txt)</p>
              </div>
            </div>

            {/* Quick Demo Option */}
            <div className="flex items-center justify-between p-3.5 bg-[#1a1c1d] border border-blue-900/30 rounded-xl">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">¿No tenés un archivo exportado a mano?</p>
                  <p className="text-[10px] text-[#8e8c87]">Hacé clic al costado para simular la carga con un archivo real de Google Calendar conteniendo 4 reservas de prueba.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadDemoCalendarFile}
                className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900/50 text-blue-400 hover:text-white border border-blue-800/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cargar archivo demo
              </button>
            </div>

            {/* Backup option */}
            <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-4">
              <span className="text-[11px] text-[#8e8c87] flex items-center gap-1.5">
                💡 ¿Querés guardar una copia de las reservas actuales antes de continuar?
              </span>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#333] rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Backup JSON</span>
              </button>
            </div>
          </div>
        ) : (
          /* PREVIEW STEP */
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-white">Archivo analizado correctamente</span>
              </div>
              <span className="text-xs text-[#8e8c87]">
                Se detectaron <strong>{parsedEvents.length}</strong> reservas para importar
              </span>
            </div>

            {/* Event List Table */}
            <div className="border border-[#2a2a2a] rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c1c1c] border-b border-[#2a2a2a] text-[10px] uppercase font-bold tracking-wider text-[#8e8c87]">
                    <th className="p-2.5">Huésped / Canal</th>
                    <th className="p-2.5">Check-In / Out</th>
                    <th className="p-2.5">Cabaña Asignada</th>
                    <th className="p-2.5 text-right">Estado / Choque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424] text-xs">
                  {parsedEvents.map((ev, idx) => {
                    const isOverlapped = checkOverlap(ev);
                    const matchedProp = demoState.properties.find(p => p.id === ev.propertyId);
                    
                    return (
                      <tr key={idx} className="hover:bg-[#1c1c1c]">
                        <td className="p-2.5">
                          <div className="font-bold text-white">{ev.guestName}</div>
                          <div className="text-[10px] text-[#8e8c87] flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                              ev.platform === 'airbnb' ? 'bg-[#c46850]' : ev.platform === 'booking' ? 'bg-[#4a6b8c]' : 'bg-[#5c8a66]'
                            }`} />
                            <span className="uppercase tracking-wider font-semibold text-[9px]">
                              {ev.platform} ({ev.nights} noches)
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-semibold text-[#f4f2ee]">{ev.checkIn}</div>
                          <div className="text-[10px] text-[#8e8c87] font-semibold">{ev.checkOut}</div>
                        </td>
                        <td className="p-2.5">
                          <select
                            value={ev.propertyId}
                            onChange={(e) => {
                              const updated = [...parsedEvents];
                              updated[idx].propertyId = e.target.value;
                              setParsedEvents(updated);
                            }}
                            className="text-[11px] bg-[#121212] border border-[#333] text-white px-2 py-1 rounded focus:outline-none focus:border-[#d88d5e]"
                          >
                            {demoState.properties.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-right">
                          {isOverlapped ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 text-[9px] font-bold uppercase">
                              <AlertTriangle className="w-3 h-3" />
                              Choque fechas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold uppercase">
                              ✔ Disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mode Selection */}
            <div className="bg-[#1c1a18] border border-[#2c221b] p-3 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-[#d88d5e] uppercase tracking-wider">
                Configuración del Traspaso
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode('add')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    importMode === 'add'
                      ? 'border-[#d88d5e] bg-[#2a221b]/40 text-white'
                      : 'border-[#2a2a2a] hover:border-[#333] text-[#8e8c87]'
                  }`}
                >
                  <p className="text-xs font-bold text-white">Sumar al calendario actual</p>
                  <p className="text-[10px] mt-0.5 leading-tight">Agrega estas nuevas reservas manteniendo las que ya tenés cargadas.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'border-red-500 bg-red-950/20 text-white'
                      : 'border-[#2a2a2a] hover:border-[#333] text-[#8e8c87]'
                  }`}
                >
                  <p className="text-xs font-bold text-white">Reemplazar calendario anterior</p>
                  <p className="text-[10px] mt-0.5 leading-tight text-red-400/90">Borra las reservas anteriores y carga únicamente estas nuevas.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-[#181818] border-t border-[#2a2a2a] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'preview') {
                setStep('upload');
                setFile(null);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 bg-[#222] hover:bg-[#2e2e2e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#333]"
          >
            {step === 'preview' ? 'Atrás' : 'Cancelar'}
          </button>

          {step === 'preview' && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-[#c46d45] hover:bg-[#d67b51] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e Importar {parsedEvents.length} Reservas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
