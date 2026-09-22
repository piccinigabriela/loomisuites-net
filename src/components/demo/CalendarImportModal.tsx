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
  Clipboard,
  ArrowRight,
  RefreshCw,
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

const MONTH_MAP: Record<string, string> = {
  ene: '01', enero: '01', jan: '01', january: '01',
  feb: '02', febrero: '02', february: '02',
  mar: '03', marzo: '03', march: '03',
  abr: '04', abril: '04', apr: '04', april: '04',
  may: '05', mayo: '05',
  jun: '06', junio: '06', june: '06',
  jul: '07', julio: '07', july: '07',
  ago: '08', agosto: '08', aug: '08', august: '08',
  sep: '09', set: '09', septiembre: '09', setiembre: '09', sept: '09', september: '09',
  oct: '10', octubre: '10', october: '10',
  nov: '11', noviembre: '11', november: '11',
  dic: '12', diciembre: '12', dec: '12', december: '12',
};

// Universal Date Normalizer
function parseAnyDate(raw: any): string | null {
  if (!raw) return null;

  // If number (e.g. Excel timestamp or epoch)
  if (typeof raw === 'number') {
    if (raw > 25000 && raw < 65000) {
      // Excel serial date number
      const excelEpoch = new Date(1899, 11, 30);
      const targetDate = new Date(excelEpoch.getTime() + raw * 86400000);
      return targetDate.toISOString().split('T')[0];
    }
    if (raw > 1000000000000) {
      return new Date(raw).toISOString().split('T')[0];
    }
  }

  let str = String(raw).trim();
  // Remove quotes, time portions, and leading/trailing noise
  str = str.replace(/^["']|["']$/g, '').split('T')[0].split(' ')[0].trim();
  if (!str) return null;

  // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. Latin / Standard: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const latin4Match = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (latin4Match) {
    const day = latin4Match[1].padStart(2, '0');
    const month = latin4Match[2].padStart(2, '0');
    const year = latin4Match[3];
    return `${year}-${month}-${day}`;
  }

  // 3. 2-digit year: DD/MM/YY or DD-MM-YY or DD.MM.YY
  const latin2Match = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
  if (latin2Match) {
    const day = latin2Match[1].padStart(2, '0');
    const month = latin2Match[2].padStart(2, '0');
    let year = Number(latin2Match[3]);
    year = year < 50 ? 2000 + year : 1900 + year;
    return `${year}-${month}-${day}`;
  }

  // 4. Words like "15-Ene-2025" or "15/Ene/25" or "15 de enero de 2025"
  const wordClean = str.toLowerCase().replace(/ de /g, '-').replace(/[ /.]/g, '-');
  const wordMatch = wordClean.match(/^(\d{1,2})-([a-z]{3,12})-(\d{2,4})$/);
  if (wordMatch) {
    const day = wordMatch[1].padStart(2, '0');
    const mStr = wordMatch[2].substring(0, 3);
    const mNum = MONTH_MAP[mStr] || MONTH_MAP[wordMatch[2]] || '01';
    let year = wordMatch[3];
    if (year.length === 2) {
      year = String(Number(year) < 50 ? 2000 + Number(year) : 1900 + Number(year));
    }
    return `${year}-${mNum}-${day}`;
  }

  return null;
}

export const CalendarImportModal: React.FC<CalendarImportModalProps> = ({
  isOpen,
  onClose,
  demoState,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parseErrorNotice, setParseErrorNotice] = useState<string | null>(null);
  const [rawFileSnippet, setRawFileSnippet] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

  // Process text from file or paste
  const processTextContent = (text: string, filename = 'reservas.csv') => {
    setParseErrorNotice(null);
    setRawFileSnippet(null);

    const clean = text.trim();
    if (!clean) {
      setParseErrorNotice('El archivo o texto está vacío.');
      return;
    }

    let events: ParsedEvent[] = [];

    if (filename.endsWith('.ics') || clean.includes('BEGIN:VCALENDAR')) {
      events = parseICS(clean);
    } else if (clean.startsWith('{') || clean.startsWith('[') || filename.endsWith('.json')) {
      events = parseJSON(clean);
    } else {
      events = parseCSV(clean);
    }

    if (events.length === 0) {
      setRawFileSnippet(clean.split('\n').slice(0, 10).join('\n'));
      setParseErrorNotice(
        'No pudimos identificar automáticamente las fechas de entrada y salida en el archivo. Podés revisar las primeras filas abajo o pegar el texto directamente.'
      );
      return;
    }

    setParsedEvents(events);
    setStep('preview');
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const text = await selectedFile.text();
      processTextContent(text, selectedFile.name);
    } catch (err: any) {
      setParseErrorNotice(`Error al leer el archivo: ${err?.message || 'Formato no legible'}`);
    }
  };

  // Real parsing of JSON backup files
  const parseJSON = (text: string): ParsedEvent[] => {
    try {
      const data = JSON.parse(text);
      const properties = demoState.properties;
      const defaultPropertyId = properties[0]?.id || 'prop-1';
      const events: ParsedEvent[] = [];

      let rawList: any[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.reservations)) rawList = data.reservations;
        else if (Array.isArray(data.bookings)) rawList = data.bookings;
        else if (Array.isArray(data.events)) rawList = data.events;
        else if (Array.isArray(data.records)) rawList = data.records;
        else if (Array.isArray(data.data)) rawList = data.data;
        else if (Array.isArray(data.items)) rawList = data.items;
        else if (Array.isArray(data.alquileres)) rawList = data.alquileres;
        else {
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              rawList = data[key];
              break;
            }
          }
        }
      }

      rawList.forEach((item, idx) => {
        if (!item || typeof item !== 'object') return;

        const guestName =
          item.guestName ||
          item.guest_name ||
          item.name ||
          item.guest ||
          item.huesped ||
          item.pasajero ||
          item.cliente ||
          item.titular ||
          item.summary ||
          item.title ||
          `Huésped #${idx + 1}`;

        const checkInRaw =
          item.checkIn ||
          item.check_in ||
          item.startDate ||
          item.start_date ||
          item.start ||
          item.entrada ||
          item.ingreso ||
          item.llegada ||
          item.desde ||
          item.from;

        const checkOutRaw =
          item.checkOut ||
          item.check_out ||
          item.endDate ||
          item.end_date ||
          item.end ||
          item.salida ||
          item.egreso ||
          item.hasta ||
          item.to;

        const checkIn = parseAnyDate(checkInRaw);
        const checkOut = parseAnyDate(checkOutRaw);

        if (checkIn && checkOut) {
          const propRef = String(
            item.propertyId ||
            item.property_id ||
            item.cabin ||
            item.cabinName ||
            item.unit ||
            item.depto ||
            item.departamento ||
            item.room ||
            ''
          ).toLowerCase();

          let matchedPropertyId = defaultPropertyId;
          for (const prop of properties) {
            if (
              propRef &&
              (propRef.includes(prop.name.toLowerCase()) ||
                prop.name.toLowerCase().includes(propRef) ||
                propRef.includes(prop.id.toLowerCase()))
            ) {
              matchedPropertyId = prop.id;
              break;
            }
          }

          let platform: BookingPlatform = 'direct';
          const platStr = String(item.platform || item.source || item.canal || item.channel || '').toLowerCase();
          if (platStr.includes('air') || guestName.toLowerCase().includes('airbnb')) platform = 'airbnb';
          else if (platStr.includes('book') || guestName.toLowerCase().includes('booking')) platform = 'booking';
          else if (platStr.includes('vrbo') || platStr.includes('expedia')) platform = 'vrbo';

          const cInDate = new Date(checkIn);
          const cOutDate = new Date(checkOut);
          const nights =
            item.nights ||
            Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24))) ||
            1;

          events.push({
            guestName,
            checkIn,
            checkOut,
            propertyId: matchedPropertyId,
            platform,
            nights,
          });
        }
      });

      return events;
    } catch (e) {
      console.error('Error parsing JSON backup:', e);
      return [];
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

      const summaryMatch = block.match(/SUMMARY:(.*)/);
      let guestName = summaryMatch ? summaryMatch[1].trim() : 'Reserva Importada';
      guestName = guestName
        .replace(/^(Reserva\s+de\s+|Reserva\s+-?\s*)/i, '')
        .replace(/\\/g, '')
        .trim();

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

        let matchedPropertyId = defaultPropertyId;
        const lowercaseBlock = block.toLowerCase() + guestName.toLowerCase();
        for (const prop of properties) {
          if (lowercaseBlock.includes(prop.name.toLowerCase()) || lowercaseBlock.includes(prop.id.toLowerCase())) {
            matchedPropertyId = prop.id;
            break;
          }
        }

        let platform: BookingPlatform = 'direct';
        if (lowercaseBlock.includes('airbnb')) platform = 'airbnb';
        else if (lowercaseBlock.includes('booking')) platform = 'booking';
        else if (lowercaseBlock.includes('vrbo') || lowercaseBlock.includes('expedia')) platform = 'vrbo';

        events.push({
          guestName: guestName || 'Huésped Cal',
          checkIn,
          checkOut,
          propertyId: matchedPropertyId,
          platform,
          nights,
        });
      }
    }

    return events.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  };

  // Ultra-flexible CSV / TSV / Delimited Parser
  const parseCSV = (text: string): ParsedEvent[] => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 1) return [];

    const properties = demoState.properties;
    const defaultPropertyId = properties[0]?.id || 'prop-1';
    const events: ParsedEvent[] = [];

    // Auto-detect separator
    const firstFew = lines.slice(0, 5).join('\n');
    const commaCount = (firstFew.match(/,/g) || []).length;
    const semiCount = (firstFew.match(/;/g) || []).length;
    const tabCount = (firstFew.match(/\t/g) || []).length;
    const pipeCount = (firstFew.match(/\|/g) || []).length;

    let sep = ',';
    if (semiCount > commaCount && semiCount >= tabCount) sep = ';';
    else if (tabCount > commaCount && tabCount >= semiCount) sep = '\t';
    else if (pipeCount > commaCount && pipeCount > semiCount) sep = '|';

    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === sep && !insideQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      return values;
    };

    const parsedRows = lines.map(parseRow);
    if (parsedRows.length === 0) return [];

    const headerRow = parsedRows[0];
    const headers = headerRow.map(h => h.toLowerCase());

    // 1. Try finding by column names
    let guestIdx = headers.findIndex(h =>
      h.includes('guest') || h.includes('nombre') || h.includes('huésped') || h.includes('huesped') ||
      h.includes('cliente') || h.includes('pasajero') || h.includes('titular') || h.includes('reserva') ||
      h.includes('summary') || h.includes('name')
    );

    let startIdx = headers.findIndex(h =>
      h.includes('start') || h.includes('desde') || h.includes('entrada') || h.includes('ingreso') ||
      h.includes('llegada') || h.includes('checkin') || h.includes('check-in') || h.includes('in') ||
      h.includes('f.desde') || h.includes('fecha in') || h.includes('fecha_in')
    );

    let endIdx = headers.findIndex(h =>
      h.includes('end') || h.includes('hasta') || h.includes('salida') || h.includes('egreso') ||
      h.includes('partida') || h.includes('checkout') || h.includes('check-out') || h.includes('out') ||
      h.includes('f.hasta') || h.includes('fecha out') || h.includes('fecha_out')
    );

    let cabinIdx = headers.findIndex(h =>
      h.includes('cabin') || h.includes('cabaña') || h.includes('cabana') || h.includes('depto') ||
      h.includes('departamento') || h.includes('unidad') || h.includes('propiedad') || h.includes('habitacion') ||
      h.includes('room') || h.includes('alojamiento')
    );

    let platformIdx = headers.findIndex(h =>
      h.includes('plataforma') || h.includes('canal') || h.includes('channel') || h.includes('origen') || h.includes('source')
    );

    // 2. If start or end not identified by header names, scan column values for date patterns
    const sampleRows = parsedRows.slice(0, 10);
    const dateColCandidates: number[] = [];

    if (startIdx === -1 || endIdx === -1) {
      const colCount = Math.max(...sampleRows.map(r => r.length));
      for (let c = 0; c < colCount; c++) {
        let validDatesInCol = 0;
        for (const row of sampleRows) {
          if (row[c] && parseAnyDate(row[c])) {
            validDatesInCol++;
          }
        }
        if (validDatesInCol >= Math.min(2, sampleRows.length)) {
          dateColCandidates.push(c);
        }
      }

      if (dateColCandidates.length >= 2) {
        if (startIdx === -1) startIdx = dateColCandidates[0];
        if (endIdx === -1) endIdx = dateColCandidates[1];
      } else if (dateColCandidates.length === 1 && startIdx === -1) {
        startIdx = dateColCandidates[0];
      }
    }

    // Determine starting row: row 0 might be a header or data
    let startRowIndex = 1;
    if (parsedRows.length === 1 || (startIdx !== -1 && parseAnyDate(parsedRows[0][startIdx]))) {
      // First row itself contains valid dates -> no header row
      startRowIndex = 0;
    }

    for (let i = startRowIndex; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      if (row.length < 1 || row.every(v => !v)) continue;

      let checkIn: string | null = null;
      let checkOut: string | null = null;
      let guestName = '';
      let cabinVal = '';
      let platformVal = '';

      // Check In & Out
      if (startIdx !== -1 && row[startIdx]) {
        checkIn = parseAnyDate(row[startIdx]);
      }
      if (endIdx !== -1 && row[endIdx]) {
        checkOut = parseAnyDate(row[endIdx]);
      }

      // If still missing, check any column in this row
      if (!checkIn || !checkOut) {
        const foundDates: string[] = [];
        row.forEach(val => {
          const d = parseAnyDate(val);
          if (d && !foundDates.includes(d)) foundDates.push(d);
        });
        if (foundDates.length >= 2) {
          checkIn = foundDates[0];
          checkOut = foundDates[1];
        }
      }

      // Guest Name
      if (guestIdx !== -1 && row[guestIdx]) {
        guestName = row[guestIdx];
      } else {
        // Pick first non-date, non-empty cell
        const candidate = row.find(v => v && !parseAnyDate(v) && isNaN(Number(v)) && v.length > 2);
        guestName = candidate || `Huésped #${i + 1}`;
      }

      if (cabinIdx !== -1 && row[cabinIdx]) {
        cabinVal = row[cabinIdx].toLowerCase();
      }
      if (platformIdx !== -1 && row[platformIdx]) {
        platformVal = row[platformIdx].toLowerCase();
      }

      if (checkIn && checkOut) {
        const cInDate = new Date(checkIn);
        const cOutDate = new Date(checkOut);
        const nights = Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24))) || 1;

        let matchedPropertyId = defaultPropertyId;
        for (const prop of properties) {
          if (
            cabinVal &&
            (cabinVal.includes(prop.name.toLowerCase()) ||
              prop.name.toLowerCase().includes(cabinVal) ||
              cabinVal.includes(prop.id.toLowerCase()))
          ) {
            matchedPropertyId = prop.id;
            break;
          }
        }

        let platform: BookingPlatform = 'direct';
        if (platformVal.includes('air') || guestName.toLowerCase().includes('airbnb')) platform = 'airbnb';
        else if (platformVal.includes('book') || guestName.toLowerCase().includes('booking')) platform = 'booking';
        else if (platformVal.includes('vrbo') || platformVal.includes('expedia')) platform = 'vrbo';

        events.push({
          guestName: guestName || `Reserva #${i + 1}`,
          checkIn,
          checkOut,
          propertyId: matchedPropertyId,
          platform,
          nights,
        });
      }
    }

    return events.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  };

  const handleConfirmImport = () => {
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
        guestEmail: `${ev.guestName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
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
    setPastedText('');
    onClose();
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
              <h3 className="text-sm font-bold text-white">Importador de Reservas y Backups</h3>
              <p className="text-[11px] text-[#8e8c87]">Subí tu archivo .csv, .json o pegá las filas de tu Excel</p>
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
          <div className="p-5 space-y-4">
            {/* Tabs: Upload vs Paste */}
            <div className="flex bg-[#1c1c1c] p-1 rounded-xl border border-[#2c2c2c]">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                    : 'text-[#8e8c87] hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Subir Archivo (.csv / .json / .ics)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'paste'
                    ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                    : 'text-[#8e8c87] hover:text-white'
                }`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                Pegar Texto / Filas de Excel
              </button>
            </div>

            {/* Error diagnostic banner */}
            {parseErrorNotice && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3.5 text-xs text-red-200 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-300">Aviso de lectura:</strong>
                    <p className="mt-0.5">{parseErrorNotice}</p>
                  </div>
                </div>

                {rawFileSnippet && (
                  <div className="mt-2 bg-black/40 p-2.5 rounded-lg border border-red-900/30">
                    <p className="text-[10px] text-red-400 font-mono mb-1 font-bold">Primeras líneas leídas del archivo:</p>
                    <pre className="text-[10px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-24">
                      {rawFileSnippet}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' ? (
              <>
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
                    accept=".json,.csv,.tsv,.txt,.ics"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-[#24201c] text-[#d88d5e] rounded-full flex items-center justify-center border border-[#d88d5e]/20 shadow-xs">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Arrastrá tu archivo .csv, .json o .ics aquí</p>
                    <p className="text-[11px] text-[#8e8c87] mt-0.5">o hacé clic para buscarlo en tu dispositivo</p>
                  </div>
                </div>

                {/* Compatibility hints */}
                <div className="bg-[#1c1a18] border border-[#2c221b] rounded-xl p-3 text-xs text-[#c8c5c0] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#d88d5e] text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#d88d5e]" />
                    Compatibilidad Universal
                  </div>
                  <p className="text-[11px] text-[#9c9a95]">
                    Reconoce fechas en formato argentino (DD/MM/AAAA), ISO (AAAA-MM-DD), nombres de meses en español y cualquier separador (coma, punto y coma o tabulación).
                  </p>
                </div>
              </>
            ) : (
              /* Direct Text Paste Area */
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clipboard className="w-3.5 h-3.5 text-[#d88d5e]" />
                    Pegá el contenido de tu archivo o las filas copiadas de Excel:
                  </label>
                  <textarea
                    rows={7}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder={`Ejemplo:\nHuésped, Entrada, Salida, Departamento\nJuan Perez, 15/10/2025, 20/10/2025, Depto 1\nMaria Gomez, 22/10/2025, 25/10/2025, Depto 2\n\n(o pega tu JSON/CSV directamente acá)`}
                    className="w-full bg-[#121212] border border-[#333333] rounded-xl p-3 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => processTextContent(pastedText, 'pasted_data.csv')}
                  disabled={!pastedText.trim()}
                  className="w-full py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] disabled:opacity-40 disabled:cursor-not-allowed text-[#141414] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Procesar Texto y Ver Vista Previa
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Preview & Confirmation */
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {parsedEvents.length} reservas listas para importar
                </span>
                <p className="text-[11px] text-[#8e8c87] mt-0.5">
                  Revisá la asignación de cada departamento antes de guardar
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-[#1c1c1c] p-1 rounded-lg border border-[#2c2c2c] text-[11px]">
                <button
                  type="button"
                  onClick={() => setImportMode('add')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    importMode === 'add'
                      ? 'bg-[#2a221b] text-[#d88d5e] border border-[#d88d5e]/30'
                      : 'text-[#8e8c87] hover:text-white'
                  }`}
                >
                  Sumar al calendario
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    importMode === 'replace'
                      ? 'bg-red-950 text-red-300 border border-red-800/40'
                      : 'text-[#8e8c87] hover:text-white'
                  }`}
                >
                  Reemplazar todo
                </button>
              </div>
            </div>

            {/* List of parsed events */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {parsedEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#191919] border border-[#2a2a2a] rounded-xl flex items-center justify-between gap-3 text-xs hover:border-[#383838] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{ev.guestName}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          ev.platform === 'airbnb'
                            ? 'bg-red-950/60 text-red-400 border border-red-800/30'
                            : ev.platform === 'booking'
                            ? 'bg-blue-950/60 text-blue-400 border border-blue-800/30'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/30'
                        }`}
                      >
                        {ev.platform}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8e8c87] mt-0.5 flex items-center gap-2">
                      <span>
                        📅 {ev.checkIn} → {ev.checkOut}
                      </span>
                      <span className="text-[#d88d5e] font-semibold">({ev.nights} noches)</span>
                    </div>
                  </div>

                  {/* Property Selector */}
                  <div className="shrink-0">
                    <select
                      value={ev.propertyId}
                      onChange={e => {
                        const newId = e.target.value;
                        setParsedEvents(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, propertyId: newId } : item))
                        );
                      }}
                      className="bg-[#242424] text-white border border-[#383838] text-[11px] rounded-lg px-2.5 py-1.5 focus:border-[#d88d5e] focus:outline-hidden"
                    >
                      {demoState.properties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#252525]">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8e8c87] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
              >
                ← Volver a elegir archivo
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Importar {parsedEvents.length} Reservas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
