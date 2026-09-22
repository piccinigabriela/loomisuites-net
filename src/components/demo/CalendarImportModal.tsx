import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Sliders,
  ChevronDown,
  Building,
  Check,
  HelpCircle,
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
  rawCabin: string;
  totalAmount?: number;
  guestPhone?: string;
  guestEmail?: string;
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

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Universal Date Normalizer
function parseAnyDate(raw: any): string | null {
  if (!raw) return null;

  // If number (e.g. Excel timestamp or epoch)
  if (typeof raw === 'number') {
    if (raw > 25000 && raw < 65000) {
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

// Smart Property Matcher that handles single letters (A, B, C), numbers (1, 2, 101), words, and avoids false greedy fallbacks
function smartMatchProperty(
  rawCabin: string,
  otherRowValues: string[],
  properties: Property[]
): string {
  if (!properties || properties.length === 0) return 'prop-1';
  const defaultPropertyId = properties[0]?.id || 'prop-1';

  // Sort properties by name length descending so specific names like "Depto A", "Cabaña 102", "1A" match BEFORE single characters
  const sortedByLength = [...properties].sort((a, b) => b.name.length - a.name.length);

  const cleanRaw = rawCabin ? rawCabin.trim() : '';

  // 1. If explicit cabin string was provided
  if (cleanRaw) {
    const normRaw = normalizeString(cleanRaw);

    // 1a. Exact full string match with property name or ID (normalized)
    for (const prop of properties) {
      const propNorm = normalizeString(prop.name);
      const propIdNorm = normalizeString(prop.id);
      if (normRaw === propNorm || normRaw === propIdNorm) {
        return prop.id;
      }
    }

    // 1b. Single letter or single character match (e.g., CSV has "A", "B", "C" or "Depto A" -> properties "1A", "Cabaña A", "A", etc.)
    const cleanLetterOnly = cleanRaw.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleanLetterOnly.length === 1) {
      // Find property whose name or id has that single letter isolated or ending
      const letterMatch = sortedByLength.find(p => {
        const pLetters = p.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
        const pEndsWithLetter = p.name.toUpperCase().endsWith(cleanLetterOnly);
        const pRegex = new RegExp(`(^|[^a-zA-Z])${cleanLetterOnly}($|[^a-zA-Z])`, 'i');
        return pLetters === cleanLetterOnly || pEndsWithLetter || pRegex.test(p.name);
      });
      if (letterMatch) {
        return letterMatch.id;
      }
    }

    // 1c. Exact numeric extraction (e.g., "102" or "C-102" or "C102" -> "102")
    const rawDigits = cleanRaw.replace(/\D/g, '');
    if (rawDigits) {
      // Find property whose digits match rawDigits exactly
      const exactDigitMatch = sortedByLength.find(p => {
        const pDigits = p.name.replace(/\D/g, '') || p.id.replace(/\D/g, '');
        return pDigits === rawDigits;
      });
      if (exactDigitMatch) {
        return exactDigitMatch.id;
      }
    }

    // 1d. Word boundary / exact token containment (tested on longest names first!)
    for (const prop of sortedByLength) {
      const propNorm = normalizeString(prop.name);
      if (propNorm.length >= 2) {
        const regex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(propNorm)}($|[^a-z0-9])`, 'i');
        if (regex.test(normRaw)) {
          return prop.id;
        }
      }
    }

    // 1e. Fuzzy token match
    for (const prop of sortedByLength) {
      const words = cleanRaw.split(/[\s,\-_/]+/);
      for (const w of words) {
        const normW = normalizeString(w);
        if (normW && normW.length >= 2 && normW === normalizeString(prop.name)) {
          return prop.id;
        }
      }
    }
  }

  // 2. Fallback: Search other cells in this row (guest name, description, etc.)
  for (const cell of otherRowValues) {
    const cellStr = String(cell || '').trim();
    if (!cellStr) continue;

    // Check exact digits in cell
    const cellDigits = cellStr.replace(/\D/g, '');
    if (cellDigits && cellDigits.length >= 1 && cellDigits.length <= 4) {
      const matchByDigit = sortedByLength.find(p => {
        const pDigits = p.name.replace(/\D/g, '') || p.id.replace(/\D/g, '');
        return pDigits && pDigits === cellDigits;
      });
      if (matchByDigit) {
        return matchByDigit.id;
      }
    }

    const cellNorm = normalizeString(cellStr);
    for (const prop of sortedByLength) {
      const propNorm = normalizeString(prop.name);
      if (propNorm.length >= 2) {
        const regex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(propNorm)}($|[^a-z0-9])`, 'i');
        if (regex.test(cellNorm)) {
          return prop.id;
        }
      }
    }
  }

  return defaultPropertyId;
}

// Universal Platform Detector with comprehensive channel detection and rawVal prioritization
function detectPlatform(rawVal: string, fallbackRow: string[] = []): BookingPlatform {
  const cleanVal = (rawVal || '').toLowerCase().trim();
  const cleanFallback = fallbackRow.join(' ').toLowerCase();

  // 1. First check explicit platform column value
  if (cleanVal) {
    if (
      cleanVal.includes('airbnb') ||
      cleanVal.includes('abnb') ||
      cleanVal.includes('air bnb') ||
      cleanVal.includes('air-bnb') ||
      cleanVal.includes('air')
    ) {
      return 'airbnb';
    }

    if (
      cleanVal.includes('booking') ||
      cleanVal.includes('bdc') ||
      cleanVal.includes('bkg') ||
      cleanVal.includes('agoda') ||
      cleanVal.includes('priceline') ||
      cleanVal.includes('book')
    ) {
      return 'booking';
    }

    if (
      cleanVal.includes('vrbo') ||
      cleanVal.includes('expedia') ||
      cleanVal.includes('homeaway') ||
      cleanVal.includes('abritel') ||
      cleanVal.includes('stayz') ||
      cleanVal.includes('despegar')
    ) {
      return 'vrbo';
    }

    if (
      cleanVal.includes('direct') ||
      cleanVal.includes('directa') ||
      cleanVal.includes('whatsapp') ||
      cleanVal.includes('wsp') ||
      cleanVal.includes('particular') ||
      cleanVal.includes('telefono') ||
      cleanVal.includes('teléfono') ||
      cleanVal.includes('propio') ||
      cleanVal.includes('mostrador')
    ) {
      return 'direct';
    }
  }

  // 2. Check fallback row cells
  if (
    cleanFallback.includes('airbnb') ||
    cleanFallback.includes('abnb') ||
    cleanFallback.includes('air bnb')
  ) {
    return 'airbnb';
  }

  if (
    cleanFallback.includes('booking.com') ||
    cleanFallback.includes('booking') ||
    cleanFallback.includes('bdc')
  ) {
    return 'booking';
  }

  if (
    cleanFallback.includes('vrbo') ||
    cleanFallback.includes('expedia') ||
    cleanFallback.includes('despegar')
  ) {
    return 'vrbo';
  }

  return 'direct';
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

  // Raw tabular data for interactive column mapping
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [selectedGuestCol, setSelectedGuestCol] = useState<number>(-1);
  const [selectedCheckInCol, setSelectedCheckInCol] = useState<number>(-1);
  const [selectedCheckOutCol, setSelectedCheckOutCol] = useState<number>(-1);
  const [selectedCabinCol, setSelectedCabinCol] = useState<number>(-1);
  const [selectedPlatformCol, setSelectedPlatformCol] = useState<number>(-1);
  const [selectedAmountCol, setSelectedAmountCol] = useState<number>(-1);

  // Unique values in the detected cabin column and their mapped propertyId
  const [unitValueMapping, setUnitValueMapping] = useState<Record<string, string>>({});
  const [showMappingSettings, setShowMappingSettings] = useState(false);

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

  // Re-generate parsed events based on column selections & unitValueMapping
  const recomputeEvents = (
    rows: string[][],
    gIdx: number,
    inIdx: number,
    outIdx: number,
    cIdx: number,
    pIdx: number,
    amtIdx: number,
    valueMap: Record<string, string>,
    platMap: Record<string, BookingPlatform> = {}
  ) => {
    const events: ParsedEvent[] = [];
    const properties = demoState.properties;
    const defaultPropertyId = properties[0]?.id || 'prop-1';

    rows.forEach((row, i) => {
      if (row.length < 1 || row.every(v => !v)) return;

      let checkIn: string | null = null;
      let checkOut: string | null = null;
      let guestName = '';
      let rawCabin = '';
      let platformVal = '';
      let totalAmount: number | undefined = undefined;

      // Dates
      if (inIdx !== -1 && row[inIdx]) checkIn = parseAnyDate(row[inIdx]);
      if (outIdx !== -1 && row[outIdx]) checkOut = parseAnyDate(row[outIdx]);

      // If dates not found in mapped columns, attempt scan
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

      if (!checkIn || !checkOut) return;

      // Guest Name
      if (gIdx !== -1 && row[gIdx]) {
        guestName = row[gIdx].trim();
      } else {
        const candidate = row.find(v => v && !parseAnyDate(v) && isNaN(Number(v)) && v.length > 2);
        guestName = candidate ? candidate.trim() : `Huésped #${i + 1}`;
      }

      // Cabin / Unit
      if (cIdx !== -1 && row[cIdx]) {
        rawCabin = row[cIdx].trim();
      }

      // Platform value
      if (pIdx !== -1 && row[pIdx]) {
        platformVal = row[pIdx].trim();
      }

      // Amount
      if (amtIdx !== -1 && row[amtIdx]) {
        const cleanAmt = String(row[amtIdx]).replace(/[^0-9.,]/g, '').replace(',', '.');
        const num = parseFloat(cleanAmt);
        if (!isNaN(num) && num > 0) totalAmount = num;
      }

      const cInDate = new Date(checkIn);
      const cOutDate = new Date(checkOut);
      const nights = Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24))) || 1;

      // Property assignment: check unitValueMapping first, otherwise smart match
      let matchedPropertyId = defaultPropertyId;
      if (rawCabin && valueMap[rawCabin]) {
        matchedPropertyId = valueMap[rawCabin];
      } else {
        matchedPropertyId = smartMatchProperty(rawCabin, row, properties);
      }

      // Platform assignment: check platMap first, otherwise detectPlatform
      let platform: BookingPlatform = 'direct';
      if (platformVal && platMap[platformVal]) {
        platform = platMap[platformVal];
      } else {
        platform = detectPlatform(platformVal, row);
      }

      events.push({
        guestName: guestName || `Reserva #${i + 1}`,
        checkIn,
        checkOut,
        propertyId: matchedPropertyId,
        platform,
        nights,
        rawCabin,
        totalAmount,
      });
    });

    return events.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
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

    if (filename.endsWith('.ics') || clean.includes('BEGIN:VCALENDAR')) {
      const events = parseICS(clean);
      if (events.length === 0) {
        setParseErrorNotice('No se encontraron reservas con fechas válidas en el archivo .ics de calendario.');
        return;
      }
      setParsedEvents(events);
      setStep('preview');
      return;
    }

    if (clean.startsWith('{') || clean.startsWith('[') || filename.endsWith('.json')) {
      const events = parseJSON(clean);
      if (events.length === 0) {
        setParseErrorNotice('No se encontraron reservas en el archivo JSON.');
        return;
      }
      setParsedEvents(events);
      setStep('preview');
      return;
    }

    // CSV / TSV Parsing
    parseCSV(clean);
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
      if (Array.isArray(data)) rawList = data;
      else if (data && typeof data === 'object') {
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
          );

          const matchedPropertyId = smartMatchProperty(propRef, [guestName, JSON.stringify(item)], properties);

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
            rawCabin: propRef,
            totalAmount: item.totalAmount || item.total || item.price,
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

        const locationMatch = block.match(/LOCATION:(.*)/);
        const loc = locationMatch ? locationMatch[1].trim() : '';

        const matchedPropertyId = smartMatchProperty(loc, [guestName, block], properties);

        let platform: BookingPlatform = 'direct';
        const lowercaseBlock = block.toLowerCase() + guestName.toLowerCase();
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
          rawCabin: loc,
        });
      }
    }

    return events.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  };

  // Ultra-flexible CSV / TSV / Delimited Parser with interactive column mapping
  const parseCSV = (text: string) => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 1) {
      setParseErrorNotice('El archivo está vacío.');
      return;
    }

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
    if (parsedRows.length === 0) return;

    const headerRow = parsedRows[0];
    const headers = headerRow.map(h => h.toLowerCase());

    // Header index detection with comprehensive synonyms
    let guestIdx = headers.findIndex(h =>
      h.includes('guest') || h.includes('nombre') || h.includes('huésped') || h.includes('huesped') ||
      h.includes('cliente') || h.includes('pasajero') || h.includes('titular') || h.includes('viajero') ||
      h.includes('reserva') || h.includes('summary') || h.includes('name') || h.includes('booker')
    );

    let startIdx = headers.findIndex(h =>
      h.includes('start') || h.includes('desde') || h.includes('entrada') || h.includes('ingreso') ||
      h.includes('llegada') || h.includes('checkin') || h.includes('check-in') || h.includes('check in') ||
      h.includes('in') || h.includes('f.desde') || h.includes('f. desde') || h.includes('fecha in') ||
      h.includes('fecha_in') || h.includes('arribo') || h.includes('arrival') || h.includes('inicio')
    );

    let endIdx = headers.findIndex(h =>
      h.includes('end') || h.includes('hasta') || h.includes('salida') || h.includes('egreso') ||
      h.includes('partida') || h.includes('checkout') || h.includes('check-out') || h.includes('check out') ||
      h.includes('out') || h.includes('f.hasta') || h.includes('f. hasta') || h.includes('fecha out') ||
      h.includes('fecha_out') || h.includes('fin') || h.includes('departure')
    );

    let cabinIdx = headers.findIndex(h =>
      h.includes('cabin') || h.includes('cabaña') || h.includes('cabana') || h.includes('cabañas') ||
      h.includes('depto') || h.includes('departamento') || h.includes('departamentos') || h.includes('dpto') ||
      h.includes('dto') || h.includes('unidad') || h.includes('unidades') || h.includes('unit') ||
      h.includes('propiedad') || h.includes('property') || h.includes('listing') || h.includes('anuncio') ||
      h.includes('habitacion') || h.includes('habitación') || h.includes('room') || h.includes('alojamiento') ||
      h.includes('espacio') || h.includes('inmueble') || h.includes('pms') || h.includes('code') || h.includes('codigo')
    );

    let platformIdx = headers.findIndex(h =>
      h.includes('plataforma') || h.includes('canal') || h.includes('channel') || h.includes('origen') ||
      h.includes('source') || h.includes('portal') || h.includes('medio')
    );

    let amountIdx = headers.findIndex(h =>
      h.includes('total') || h.includes('precio') || h.includes('importe') || h.includes('monto') ||
      h.includes('amount') || h.includes('price') || h.includes('tarifa') || h.includes('earnings')
    );

    // Fallback date scan
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

    let startRowIndex = 1;
    if (parsedRows.length === 1 || (startIdx !== -1 && parseAnyDate(parsedRows[0][startIdx]))) {
      startRowIndex = 0;
    }

    const dataRows = parsedRows.slice(startRowIndex);
    const displayHeaders = headerRow.map((h, i) => h.trim() || `Columna ${i + 1}`);

    setRawHeaders(displayHeaders);
    setRawRows(dataRows);
    setSelectedGuestCol(guestIdx);
    setSelectedCheckInCol(startIdx);
    setSelectedCheckOutCol(endIdx);
    setSelectedCabinCol(cabinIdx);
    setSelectedPlatformCol(platformIdx);
    setSelectedAmountCol(amountIdx);

    // Pre-calculate unique cabin values and initial mapping
    const initialValueMap: Record<string, string> = {};
    if (cabinIdx !== -1) {
      dataRows.forEach(row => {
        const val = row[cabinIdx]?.trim();
        if (val && !initialValueMap[val]) {
          initialValueMap[val] = smartMatchProperty(val, row, demoState.properties);
        }
      });
    }
    setUnitValueMapping(initialValueMap);

    const initialEvents = recomputeEvents(
      dataRows,
      guestIdx,
      startIdx,
      endIdx,
      cabinIdx,
      platformIdx,
      amountIdx,
      initialValueMap
    );

    if (initialEvents.length === 0) {
      setRawFileSnippet(lines.slice(0, 8).join('\n'));
      setParseErrorNotice(
        'No pudimos identificar automáticamente las fechas de entrada y salida en el archivo. Podés revisar el formato de fechas o pegar las filas directamente.'
      );
      return;
    }

    setParsedEvents(initialEvents);
    setStep('preview');
  };

  // Handle column change from UI dropdowns
  const handleColumnChange = (
    type: 'guest' | 'checkIn' | 'checkOut' | 'cabin' | 'platform' | 'amount',
    colIdx: number
  ) => {
    let g = selectedGuestCol;
    let ci = selectedCheckInCol;
    let co = selectedCheckOutCol;
    let c = selectedCabinCol;
    let p = selectedPlatformCol;
    let a = selectedAmountCol;

    if (type === 'guest') { g = colIdx; setSelectedGuestCol(colIdx); }
    if (type === 'checkIn') { ci = colIdx; setSelectedCheckInCol(colIdx); }
    if (type === 'checkOut') { co = colIdx; setSelectedCheckOutCol(colIdx); }
    if (type === 'cabin') {
      c = colIdx;
      setSelectedCabinCol(colIdx);
      // Rebuild value mapping for new cabin column
      const newValueMap: Record<string, string> = {};
      if (colIdx !== -1) {
        rawRows.forEach(row => {
          const val = row[colIdx]?.trim();
          if (val && !newValueMap[val]) {
            newValueMap[val] = smartMatchProperty(val, row, demoState.properties);
          }
        });
      }
      setUnitValueMapping(newValueMap);
      const updated = recomputeEvents(rawRows, g, ci, co, c, p, a, newValueMap);
      setParsedEvents(updated);
      return;
    }
    if (type === 'platform') { p = colIdx; setSelectedPlatformCol(colIdx); }
    if (type === 'amount') { a = colIdx; setSelectedAmountCol(colIdx); }

    const updated = recomputeEvents(rawRows, g, ci, co, c, p, a, unitValueMapping);
    setParsedEvents(updated);
  };

  // Handle mass mapping change for a detected unit value (e.g. "C102" -> Property C102)
  const handleUnitValueMapChange = (rawUnitValue: string, targetPropertyId: string) => {
    const nextMap = { ...unitValueMapping, [rawUnitValue]: targetPropertyId };
    setUnitValueMapping(nextMap);

    // Update parsed events matching this raw unit
    setParsedEvents(prev =>
      prev.map(ev => {
        if (ev.rawCabin === rawUnitValue) {
          return { ...ev, propertyId: targetPropertyId };
        }
        return ev;
      })
    );
  };

  // Generate and download a sample CSV formatted with current properties
  const handleDownloadSampleCSV = () => {
    const props = demoState.properties;
    const lines = [
      'Huesped,Fecha Entrada,Fecha Salida,Departamento,Plataforma,Monto Total',
      `Juan Perez,2026-10-01,2026-10-05,${props[0]?.name || 'C1'},Airbnb,220`,
      `Maria Rodriguez,2026-10-03,2026-10-07,${props[1]?.name || 'C102'},Booking,190`,
      `Carlos Gomez,2026-10-06,2026-10-10,${props[2]?.name || 'C3'},Directo,250`,
      `Lucia Fernandez,2026-10-08,2026-10-12,${props[3]?.name || props[0]?.name || 'C4'},Directo,210`,
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const complexName = (demoState.welcomeGuide?.propertyName || 'complejo')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `plantilla_reservas_${complexName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    const newReservations: Reservation[] = parsedEvents.map((ev, idx) => {
      const matchedProperty = demoState.properties.find(p => p.id === ev.propertyId) || demoState.properties[0];
      const basePrice = matchedProperty?.basePrice || 120;
      const cleaningFee = matchedProperty?.cleaningFee || 35;
      const totalAmount = ev.totalAmount && ev.totalAmount > 0 ? ev.totalAmount : basePrice * ev.nights + cleaningFee;
      const commissionPaid = ev.platform === 'airbnb' ? Math.round(totalAmount * 0.03 * 10) / 10 : 0;

      return {
        id: `imported-${Date.now()}-${idx}`,
        propertyId: ev.propertyId,
        guestName: ev.guestName,
        guestEmail: ev.guestEmail || `${ev.guestName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
        guestPhone: ev.guestPhone || '+54 9 11 ' + Math.floor(10000000 + Math.random() * 90000000),
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

  // Count reservations assigned to each property in preview
  const propertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    parsedEvents.forEach(ev => {
      counts[ev.propertyId] = (counts[ev.propertyId] || 0) + 1;
    });
    return counts;
  }, [parsedEvents]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="calendar-import-modal"
        className="bg-[#141414] border border-[#2a2a2a] text-[#f4f2ee] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2a221b] border border-[#d88d5e]/30 rounded-lg text-[#d88d5e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Importador Universal de Reservas</span>
                <span className="text-[10px] font-semibold bg-[#d88d5e]/20 text-[#d88d5e] px-2 py-0.5 rounded-full border border-[#d88d5e]/30">
                  CSV · Excel · iCal
                </span>
              </h3>
              <p className="text-[11px] text-[#8e8c87]">
                Importá tu calendario o planilla con asignación inteligente a tus departamentos reales
              </p>
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                      : 'border-[#333333] hover:border-[#d88d5e]/60 bg-[#121212]'
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

                {/* Compatibility & Template Download */}
                <div className="bg-[#1c1a18] border border-[#2c221b] rounded-xl p-3.5 text-xs text-[#c8c5c0] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#d88d5e] text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#d88d5e]" />
                      Compatibilidad con tus Departamentos
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCSV}
                      className="text-[11px] font-bold text-[#d88d5e] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Descargar Plantilla CSV
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9c9a95]">
                    Loomi Suite reconoce automáticamente los nombres de tus unidades actuales ({demoState.properties.map(p => p.name).join(', ')}), fechas en formato DD/MM/AAAA o AAAA-MM-DD y canales como Airbnb, Booking y Directo.
                  </p>
                </div>
              </>
            ) : (
              /* Direct Text Paste Area */
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clipboard className="w-3.5 h-3.5 text-[#d88d5e]" />
                      Pegá el contenido copiado de Excel o tu CSV:
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCSV}
                      className="text-[11px] font-bold text-[#d88d5e] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Descargar Plantilla
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder={`Ejemplo:\nHuésped, Entrada, Salida, Departamento, Plataforma\nJuan Perez, 15/10/2026, 20/10/2026, ${demoState.properties[0]?.name || 'C1'}, Airbnb\nMaria Gomez, 22/10/2026, 25/10/2026, ${demoState.properties[1]?.name || 'C102'}, Booking\n\n(o pega tus filas copiadas directamente de Excel)`}
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
          /* Step 2: Preview, Column Mapping & Confirmation */
          <div className="p-5 space-y-4">
            {/* Top Summary & Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#252525]">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {parsedEvents.length} reservas identificadas
                </span>
                <p className="text-[11px] text-[#8e8c87] mt-0.5">
                  Revisá cómo se asignaron a tus departamentos antes de confirmar
                </p>
              </div>

              {/* Mode Switcher (Add vs Replace) */}
              <div className="flex bg-[#1c1c1c] p-1 rounded-lg border border-[#2c2c2c] text-[11px]">
                <button
                  type="button"
                  onClick={() => setImportMode('add')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-red-950 text-red-300 border border-red-800/40'
                      : 'text-[#8e8c87] hover:text-white'
                  }`}
                >
                  Reemplazar todo
                </button>
              </div>
            </div>

            {/* Distribution Badges by Property */}
            <div className="bg-[#181818] p-3 rounded-xl border border-[#2a2a2a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#d88d5e]" />
                  Distribución en tus Departamentos:
                </span>
                {rawHeaders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMappingSettings(!showMappingSettings)}
                    className="text-[11px] font-bold text-[#d88d5e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{showMappingSettings ? 'Ocultar Mapeo de Columnas' : 'Ajustar Mapeo de Columnas'}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {demoState.properties.map(p => {
                  const count = propertyCounts[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        count > 0
                          ? 'bg-[#2a221b] border-[#d88d5e]/40 text-white font-medium'
                          : 'bg-[#1e1e1e] border-[#333333] text-[#706e6a]'
                      }`}
                    >
                      <span className="font-bold text-[#d88d5e]">{p.name}:</span>
                      <span>{count} reservas</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Column Mapping Panel (If CSV has headers) */}
            {showMappingSettings && rawHeaders.length > 0 && (
              <div className="bg-[#1c1a17] border border-[#d88d5e]/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#d88d5e]" />
                  <h4 className="text-xs font-bold text-white">Mapeo de Columnas de tu Archivo</h4>
                </div>
                <p className="text-[11px] text-[#a09d96]">
                  Si tu CSV tiene nombres de columnas específicos, podés asignarlos aquí directamente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Huésped</label>
                    <select
                      value={selectedGuestCol}
                      onChange={e => handleColumnChange('guest', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Entrada (Check-In)</label>
                    <select
                      value={selectedCheckInCol}
                      onChange={e => handleColumnChange('checkIn', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Salida (Check-Out)</label>
                    <select
                      value={selectedCheckOutCol}
                      onChange={e => handleColumnChange('checkOut', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Depto / Unidad</label>
                    <select
                      value={selectedCabinCol}
                      onChange={e => handleColumnChange('cabin', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar en texto</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Plataforma / Canal</label>
                    <select
                      value={selectedPlatformCol}
                      onChange={e => handleColumnChange('platform', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar en texto</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Columna Monto / Precio</label>
                    <select
                      value={selectedAmountCol}
                      onChange={e => handleColumnChange('amount', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Calcular según tarifa base</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detected Unit Values Mapping */}
                {Object.keys(unitValueMapping).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2d2822]">
                    <span className="text-[11px] font-bold text-zinc-300 block mb-2">
                      Mapeo masivo de valores encontrados en tu columna de departamentos:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.keys(unitValueMapping).map(rawVal => (
                        <div key={rawVal} className="flex items-center justify-between gap-2 bg-[#141414] p-2 rounded-lg border border-[#333]">
                          <span className="text-[11px] text-zinc-300 truncate max-w-[120px] font-mono">
                            "{rawVal}"
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#d88d5e] shrink-0" />
                          <select
                            value={unitValueMapping[rawVal] || demoState.properties[0]?.id}
                            onChange={e => handleUnitValueMapChange(rawVal, e.target.value)}
                            className="bg-[#242424] text-white border border-[#444] text-[11px] rounded-md px-2 py-1 focus:border-[#d88d5e]"
                          >
                            {demoState.properties.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List of parsed events with individual property selector */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                      {ev.rawCabin && (
                        <span className="text-[10px] text-[#9e9c97] bg-[#242424] px-1.5 py-0.5 rounded border border-[#333]">
                          En CSV: {ev.rawCabin}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8e8c87] mt-0.5 flex items-center gap-2">
                      <span>
                        📅 {ev.checkIn} → {ev.checkOut}
                      </span>
                      <span className="text-[#d88d5e] font-semibold">({ev.nights} noches)</span>
                      {ev.totalAmount && (
                        <span className="text-emerald-400 font-semibold">${ev.totalAmount}</span>
                      )}
                    </div>
                  </div>

                  {/* Platform & Property Selectors for this reservation */}
                  <div className="shrink-0 flex items-center gap-2">
                    {/* Platform Selector */}
                    <select
                      value={ev.platform}
                      onChange={e => {
                        const newPlat = e.target.value as BookingPlatform;
                        setParsedEvents(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, platform: newPlat } : item))
                        );
                      }}
                      className="bg-[#242424] text-[#f4f2ee] font-medium border border-[#383838] text-[11px] rounded-lg px-2 py-1.5 focus:border-[#d88d5e] focus:outline-hidden cursor-pointer"
                      title="Cambiar plataforma / canal"
                    >
                      <option value="airbnb">Airbnb</option>
                      <option value="booking">Booking.com</option>
                      <option value="direct">Directa / Web</option>
                      <option value="vrbo">VRBO / Expedia</option>
                    </select>

                    {/* Property Selector */}
                    <select
                      value={ev.propertyId}
                      onChange={e => {
                        const newId = e.target.value;
                        setParsedEvents(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, propertyId: newId } : item))
                        );
                      }}
                      className="bg-[#242424] text-[#f4f2ee] font-medium border border-[#48372b] text-[11px] rounded-lg px-2.5 py-1.5 focus:border-[#d88d5e] focus:outline-hidden cursor-pointer"
                      title="Asignar a departamento"
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
                className="px-5 py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
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
