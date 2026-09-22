import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Sparkles,
  Clipboard,
  ArrowRight,
  Sliders,
  Building,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DemoState, Reservation, Property, BookingPlatform } from '../../types';
import { INITIAL_PROPERTIES } from '../../data/initialData';

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

function normalizeString(str: any): string {
  try {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  } catch {
    return '';
  }
}

// Universal Date Normalizer
function parseAnyDate(raw: any): string | null {
  if (raw === null || raw === undefined) return null;

  try {
    // If Date object
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      return raw.toISOString().split('T')[0];
    }

    // If number (Excel serial timestamp or epoch)
    if (typeof raw === 'number') {
      if (raw > 25000 && raw < 65000) {
        // Excel base date Dec 30 1899
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const targetDate = new Date(excelEpoch.getTime() + raw * 86400000);
        if (!isNaN(targetDate.getTime())) {
          return targetDate.toISOString().split('T')[0];
        }
      }
      if (raw > 1000000000000) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
    }

    let str = String(raw).trim();
    str = str.replace(/^["']|["']$/g, '').split('T')[0].split(' ')[0].trim();
    if (!str) return null;

    // Numeric string from Excel (e.g. "45580")
    const numVal = Number(str);
    if (!isNaN(numVal) && numVal > 25000 && numVal < 65000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const targetDate = new Date(excelEpoch.getTime() + numVal * 86400000);
      if (!isNaN(targetDate.getTime())) {
        return targetDate.toISOString().split('T')[0];
      }
    }

    // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 2. Latin: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
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

    // 4. Text like "15-Ene-2025" or "15 de enero de 2025"
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
  } catch {
    return null;
  }

  return null;
}

// Smart Property Matcher that handles units, letters, and avoid false greedy matches
function smartMatchProperty(
  rawCabin: string,
  otherRowValues: string[] = [],
  properties: Property[] = []
): string {
  try {
    const safeProps = Array.isArray(properties) && properties.length > 0
      ? properties.filter(Boolean)
      : (INITIAL_PROPERTIES || [{ id: 'prop-1', name: 'Unidad 1' } as any]);
    const defaultPropertyId = safeProps[0]?.id || 'prop-1';

    const cleanRaw = rawCabin ? String(rawCabin).trim() : '';

    if (cleanRaw) {
      const normRaw = normalizeString(cleanRaw);

      // Exact name or ID match
      for (const prop of safeProps) {
        const propNorm = normalizeString(prop?.name || '');
        const propIdNorm = normalizeString(prop?.id || '');
        if (normRaw && (normRaw === propNorm || normRaw === propIdNorm)) {
          return prop.id;
        }
      }

      // Single letter match
      const cleanLetterOnly = cleanRaw.replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (cleanLetterOnly.length === 1) {
        const letterMatch = safeProps.find(p => {
          const pLetters = (p?.name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
          return pLetters.includes(cleanLetterOnly);
        });
        if (letterMatch) return letterMatch.id;
      }

      // Numeric match
      const rawNumbers = cleanRaw.match(/\d+/g);
      if (rawNumbers && rawNumbers.length > 0) {
        const targetNum = rawNumbers[0];
        const numMatch = safeProps.find(p => {
          const pNums = (p?.name || '').match(/\d+/g);
          return pNums && pNums.includes(targetNum);
        });
        if (numMatch) return numMatch.id;
      }
    }

    // Secondary scan across other row cells
    for (const cell of otherRowValues) {
      if (!cell || typeof cell !== 'string') continue;
      const cellNorm = normalizeString(cell);
      for (const prop of safeProps) {
        const propNorm = normalizeString(prop?.name || '');
        if (propNorm.length >= 3 && cellNorm.includes(propNorm)) {
          return prop.id;
        }
      }
    }

    return defaultPropertyId;
  } catch {
    return 'prop-1';
  }
}

// Universal Platform Detector
function detectPlatform(rawVal: string, fallbackRow: string[] = []): BookingPlatform {
  try {
    const cleanVal = (rawVal || '').toLowerCase().trim();
    const cleanFallback = (fallbackRow || []).join(' ').toLowerCase();

    if (
      cleanVal.includes('airbnb') ||
      cleanVal.includes('abnb') ||
      cleanVal.includes('air bnb') ||
      cleanVal.includes('air') ||
      cleanFallback.includes('airbnb')
    ) {
      return 'airbnb';
    }

    if (
      cleanVal.includes('booking') ||
      cleanVal.includes('bdc') ||
      cleanVal.includes('bkg') ||
      cleanVal.includes('agoda') ||
      cleanFallback.includes('booking')
    ) {
      return 'booking';
    }

    if (
      cleanVal.includes('vrbo') ||
      cleanVal.includes('expedia') ||
      cleanVal.includes('homeaway') ||
      cleanFallback.includes('vrbo')
    ) {
      return 'vrbo';
    }

    return 'direct';
  } catch {
    return 'direct';
  }
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

  // Safe properties fallback
  const safeProperties = useMemo<Property[]>(() => {
    if (Array.isArray(demoState?.properties) && demoState.properties.length > 0) {
      return demoState.properties.filter(Boolean);
    }
    return (INITIAL_PROPERTIES || []).filter(Boolean);
  }, [demoState?.properties]);

  // Raw tabular data for interactive column mapping
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [selectedGuestCol, setSelectedGuestCol] = useState<number>(-1);
  const [selectedCheckInCol, setSelectedCheckInCol] = useState<number>(-1);
  const [selectedCheckOutCol, setSelectedCheckOutCol] = useState<number>(-1);
  const [selectedCabinCol, setSelectedCabinCol] = useState<number>(-1);
  const [selectedPlatformCol, setSelectedPlatformCol] = useState<number>(-1);
  const [selectedAmountCol, setSelectedAmountCol] = useState<number>(-1);

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
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Process File using SheetJS (XLSX) or plain text
  const processSelectedFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseErrorNotice(null);
    setRawFileSnippet(null);

    const fileName = selectedFile.name.toLowerCase();

    try {
      if (fileName.endsWith('.ics')) {
        const text = await selectedFile.text();
        const events = parseICS(text);
        if (events.length === 0) {
          setParseErrorNotice('No se encontraron reservas válidas en el archivo .ics de calendario.');
          return;
        }
        setParsedEvents(events);
        setStep('preview');
        return;
      }

      if (fileName.endsWith('.json')) {
        const text = await selectedFile.text();
        const events = parseJSON(text);
        if (events.length === 0) {
          setParseErrorNotice('No se encontraron reservas en el archivo JSON.');
          return;
        }
        setParsedEvents(events);
        setStep('preview');
        return;
      }

      // Read Excel (.xlsx, .xls) or CSV via SheetJS
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

      if (!sheetData || sheetData.length === 0) {
        setParseErrorNotice('La hoja de cálculo está vacía.');
        return;
      }

      processSheetMatrix(sheetData);
    } catch (err: any) {
      console.warn('Fallback reading as text:', err);
      try {
        const text = await selectedFile.text();
        processCSVText(text);
      } catch (fallbackErr: any) {
        setParseErrorNotice(`No se pudo leer el archivo: ${err?.message || 'Formato desconocido'}. Podés pegar las filas directamente.`);
      }
    }
  };

  const processSheetMatrix = (matrix: any[][]) => {
    try {
      const stringRows: string[][] = matrix
        .map(row => (Array.isArray(row) ? row.map(cell => (cell !== null && cell !== undefined ? String(cell).trim() : '')) : []))
        .filter(row => row.some(cell => cell.length > 0));

      if (stringRows.length === 0) {
        setParseErrorNotice('No se encontraron filas con datos en la planilla.');
        return;
      }

      const headerRow = stringRows[0] || [];
      const headers = headerRow.map(h => (h || '').toLowerCase());

      let guestIdx = headers.findIndex(h =>
        h.includes('guest') || h.includes('nombre') || h.includes('huésped') || h.includes('huesped') ||
        h.includes('cliente') || h.includes('pasajero') || h.includes('titular') || h.includes('name')
      );

      let startIdx = headers.findIndex(h =>
        h.includes('start') || h.includes('desde') || h.includes('entrada') || h.includes('ingreso') ||
        h.includes('llegada') || h.includes('checkin') || h.includes('check-in') || h.includes('in')
      );

      let endIdx = headers.findIndex(h =>
        h.includes('end') || h.includes('hasta') || h.includes('salida') || h.includes('egreso') ||
        h.includes('checkout') || h.includes('check-out') || h.includes('out')
      );

      let cabinIdx = headers.findIndex(h =>
        h.includes('cabin') || h.includes('cabaña') || h.includes('cabana') || h.includes('depto') ||
        h.includes('departamento') || h.includes('dpto') || h.includes('unidad') || h.includes('unit') ||
        h.includes('habitacion') || h.includes('habitación') || h.includes('room')
      );

      let platformIdx = headers.findIndex(h =>
        h.includes('plataforma') || h.includes('canal') || h.includes('channel') || h.includes('origen') ||
        h.includes('source')
      );

      let amountIdx = headers.findIndex(h =>
        h.includes('total') || h.includes('precio') || h.includes('importe') || h.includes('monto') ||
        h.includes('amount') || h.includes('price') || h.includes('tarifa')
      );

      // Fallback date scan
      const sampleRows = stringRows.slice(0, 10);
      if (startIdx === -1 || endIdx === -1) {
        const lengths = sampleRows.map(r => r.length);
        const colCount = lengths.length > 0 ? Math.max(...lengths) : 0;
        const dateCandidates: number[] = [];

        for (let c = 0; c < colCount; c++) {
          let datesInCol = 0;
          for (const row of sampleRows) {
            if (row && row[c] && parseAnyDate(row[c])) datesInCol++;
          }
          if (datesInCol >= Math.min(2, sampleRows.length)) {
            dateCandidates.push(c);
          }
        }

        if (dateCandidates.length >= 2) {
          if (startIdx === -1) startIdx = dateCandidates[0];
          if (endIdx === -1) endIdx = dateCandidates[1];
        } else if (dateCandidates.length === 1 && startIdx === -1) {
          startIdx = dateCandidates[0];
        }
      }

      let startRowIndex = 1;
      if (stringRows.length === 1 || (startIdx !== -1 && stringRows[0] && parseAnyDate(stringRows[0][startIdx]))) {
        startRowIndex = 0;
      }

      const dataRows = stringRows.slice(startRowIndex);
      const displayHeaders = headerRow.map((h, i) => (h || '').trim() || `Columna ${i + 1}`);

      setRawHeaders(displayHeaders);
      setRawRows(dataRows);
      setSelectedGuestCol(guestIdx);
      setSelectedCheckInCol(startIdx);
      setSelectedCheckOutCol(endIdx);
      setSelectedCabinCol(cabinIdx);
      setSelectedPlatformCol(platformIdx);
      setSelectedAmountCol(amountIdx);

      const initialValueMap: Record<string, string> = {};
      if (cabinIdx !== -1) {
        dataRows.forEach(row => {
          const val = row[cabinIdx]?.trim();
          if (val && !initialValueMap[val]) {
            initialValueMap[val] = smartMatchProperty(val, row, safeProperties);
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
        setRawFileSnippet(stringRows.slice(0, 6).map(r => r.join(' | ')).join('\n'));
        setParseErrorNotice('No pudimos detectar fechas de entrada y salida válidas. Podés revisar el formato o pegar el texto directamente.');
        return;
      }

      setParsedEvents(initialEvents);
      setStep('preview');
    } catch (err: any) {
      console.error('Error processing matrix:', err);
      setParseErrorNotice(`Error al procesar los datos: ${err?.message || 'Error desconocido'}`);
    }
  };

  const processCSVText = (text: string) => {
    try {
      const clean = text.replace(/^\uFEFF/, '').trim();
      if (!clean) {
        setParseErrorNotice('El texto está vacío.');
        return;
      }

      const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) return;

      const firstFew = lines.slice(0, 5).join('\n');
      const commaCount = (firstFew.match(/,/g) || []).length;
      const semiCount = (firstFew.match(/;/g) || []).length;
      const tabCount = (firstFew.match(/\t/g) || []).length;
      const pipeCount = (firstFew.match(/\|/g) || []).length;

      let sep = ',';
      if (semiCount > commaCount && semiCount >= tabCount) sep = ';';
      else if (tabCount > commaCount && tabCount >= semiCount) sep = '\t';
      else if (pipeCount > commaCount && pipeCount > semiCount) sep = '|';

      const matrix = lines.map(line => {
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
      });

      processSheetMatrix(matrix);
    } catch (err: any) {
      setParseErrorNotice(`Error al procesar CSV: ${err?.message}`);
    }
  };

  const parseICS = (text: string): ParsedEvent[] => {
    const events: ParsedEvent[] = [];
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;

    while ((match = veventRegex.exec(text)) !== null) {
      const block = match[1];
      const summaryMatch = block.match(/SUMMARY:(.*)/);
      let guestName = summaryMatch ? summaryMatch[1].trim() : 'Reserva Cal';
      guestName = guestName.replace(/^(Reserva\s+de\s+|Reserva\s+-?\s*)/i, '').replace(/\\/g, '').trim();

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
        const matchedPropertyId = smartMatchProperty(loc, [guestName, block], safeProperties);

        let platform: BookingPlatform = 'direct';
        const lower = (block + guestName).toLowerCase();
        if (lower.includes('airbnb')) platform = 'airbnb';
        else if (lower.includes('booking')) platform = 'booking';
        else if (lower.includes('vrbo') || lower.includes('expedia')) platform = 'vrbo';

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

  const parseJSON = (text: string): ParsedEvent[] => {
    try {
      const data = JSON.parse(text);
      const events: ParsedEvent[] = [];
      const list = Array.isArray(data) ? data : data.reservations || data.bookings || [];

      list.forEach((item: any, idx: number) => {
        if (!item || typeof item !== 'object') return;
        const guestName = item.guestName || item.name || item.huesped || `Huésped #${idx + 1}`;
        const checkIn = parseAnyDate(item.checkIn || item.startDate || item.entrada);
        const checkOut = parseAnyDate(item.checkOut || item.endDate || item.salida);

        if (checkIn && checkOut) {
          const propRef = String(item.propertyId || item.cabin || item.unit || item.depto || '');
          const matchedPropertyId = smartMatchProperty(propRef, [guestName], safeProperties);
          const cInDate = new Date(checkIn);
          const cOutDate = new Date(checkOut);
          const nights = Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24))) || 1;

          events.push({
            guestName,
            checkIn,
            checkOut,
            propertyId: matchedPropertyId,
            platform: detectPlatform(item.platform || item.source || ''),
            nights,
            rawCabin: propRef,
            totalAmount: item.totalAmount || item.total,
          });
        }
      });

      return events;
    } catch {
      return [];
    }
  };

  const recomputeEvents = (
    rows: string[][],
    gIdx: number,
    inIdx: number,
    outIdx: number,
    cIdx: number,
    pIdx: number,
    amtIdx: number,
    valueMap: Record<string, string>
  ) => {
    try {
      const events: ParsedEvent[] = [];
      const defaultPropertyId = safeProperties[0]?.id || 'prop-1';

      if (!Array.isArray(rows)) return [];

      rows.forEach((row, i) => {
        if (!Array.isArray(row) || row.length < 1 || row.every(v => !v)) return;

        let checkIn: string | null = null;
        let checkOut: string | null = null;
        let guestName = '';
        let rawCabin = '';
        let platformVal = '';
        let totalAmount: number | undefined = undefined;

        if (inIdx !== -1 && row[inIdx]) checkIn = parseAnyDate(row[inIdx]);
        if (outIdx !== -1 && row[outIdx]) checkOut = parseAnyDate(row[outIdx]);

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

        if (gIdx !== -1 && row[gIdx]) {
          guestName = String(row[gIdx]).trim();
        } else {
          const candidate = row.find(v => v && !parseAnyDate(v) && isNaN(Number(v)) && String(v).length > 2);
          guestName = candidate ? String(candidate).trim() : `Huésped #${i + 1}`;
        }

        if (cIdx !== -1 && row[cIdx]) rawCabin = String(row[cIdx]).trim();
        if (pIdx !== -1 && row[pIdx]) platformVal = String(row[pIdx]).trim();

        if (amtIdx !== -1 && row[amtIdx]) {
          const cleanAmt = String(row[amtIdx]).replace(/[^0-9.,]/g, '').replace(',', '.');
          const num = parseFloat(cleanAmt);
          if (!isNaN(num) && num > 0) totalAmount = num;
        }

        const cInDate = new Date(checkIn);
        const cOutDate = new Date(checkOut);
        let nights = 1;
        if (!isNaN(cInDate.getTime()) && !isNaN(cOutDate.getTime())) {
          nights = Math.max(1, Math.round((cOutDate.getTime() - cInDate.getTime()) / (1000 * 60 * 60 * 24))) || 1;
        }

        let matchedPropertyId = defaultPropertyId;
        if (rawCabin && valueMap && valueMap[rawCabin]) {
          matchedPropertyId = valueMap[rawCabin];
        } else {
          matchedPropertyId = smartMatchProperty(rawCabin, row, safeProperties);
        }

        const platform = detectPlatform(platformVal, row);

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
    } catch {
      return [];
    }
  };

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
      const newValueMap: Record<string, string> = {};
      if (colIdx !== -1) {
        rawRows.forEach(row => {
          const val = row[colIdx]?.trim();
          if (val && !newValueMap[val]) {
            newValueMap[val] = smartMatchProperty(val, row, safeProperties);
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

  const handleUnitValueMapChange = (rawUnitValue: string, targetPropertyId: string) => {
    const nextMap = { ...unitValueMapping, [rawUnitValue]: targetPropertyId };
    setUnitValueMapping(nextMap);

    setParsedEvents(prev =>
      prev.map(ev => (ev.rawCabin === rawUnitValue ? { ...ev, propertyId: targetPropertyId } : ev))
    );
  };

  const handleDownloadSampleCSV = () => {
    const props = safeProperties;
    const lines = [
      'Huesped,Fecha Entrada,Fecha Salida,Departamento,Plataforma,Monto Total',
      `Juan Perez,2026-10-01,2026-10-05,${props[0]?.name || 'Depto 101'},Airbnb,220`,
      `Maria Rodriguez,2026-10-03,2026-10-07,${props[1]?.name || 'Depto 102'},Booking,190`,
      `Carlos Gomez,2026-10-06,2026-10-10,${props[2]?.name || 'Depto 103'},Directo,250`,
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `plantilla_reservas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    const newReservations: Reservation[] = parsedEvents.map((ev, idx) => {
      const matchedProperty = safeProperties.find(p => p.id === ev.propertyId) || safeProperties[0];
      const basePrice = matchedProperty?.basePrice || 65;
      const cleaningFee = matchedProperty?.cleaningFee || 15;
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

  const propertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    parsedEvents.forEach(ev => {
      counts[ev.propertyId] = (counts[ev.propertyId] || 0) + 1;
    });
    return counts;
  }, [parsedEvents]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        id="calendar-import-modal"
        className="bg-[#141414] border border-[#2a2a2a] text-[#f4f2ee] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2a221b] border border-[#d88d5e]/30 rounded-lg text-[#d88d5e]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Importador Universal de Reservas</span>
                <span className="text-[10px] font-semibold bg-[#d88d5e]/20 text-[#d88d5e] px-2 py-0.5 rounded-full border border-[#d88d5e]/30">
                  Excel · CSV · iCal
                </span>
              </h3>
              <p className="text-[11px] text-[#8e8c87]">
                Importá tu planilla (.xlsx / .csv) o calendario con auto-asignación a tus departamentos
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
                Subir Archivo (.xlsx / .csv / .ics)
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
                Pegar Filas Copiadas de Excel
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
                    <p className="text-[10px] text-red-400 font-mono mb-1 font-bold">Líneas leídas:</p>
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
                    accept=".xlsx,.xls,.csv,.tsv,.txt,.ics,.json"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-[#24201c] text-[#d88d5e] rounded-full flex items-center justify-center border border-[#d88d5e]/20 shadow-xs">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Arrastrá tu archivo Excel (.xlsx), CSV o .ics aquí</p>
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
                    Loomi Suite reconoce automáticamente tus departamentos ({safeProperties.map(p => p.name).join(', ')}), fechas estándar (DD/MM/AAAA o AAAA-MM-DD) y plataformas (Airbnb, Booking, Directo).
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
                      Pegá las celdas copiadas de tu Excel o archivo de texto:
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
                    placeholder="Huésped, Entrada, Salida, Departamento, Plataforma, Monto&#10;Juan Perez, 15/10/2026, 20/10/2026, Depto 101, Airbnb, 250&#10;Maria Gomez, 22/10/2026, 25/10/2026, Depto 102, Booking, 180"
                    className="w-full bg-[#121212] border border-[#333333] rounded-xl p-3 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => processCSVText(pastedText)}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#252525]">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {parsedEvents.length} reservas identificadas
                </span>
                <p className="text-[11px] text-[#8e8c87] mt-0.5">
                  Revisá la asignación antes de confirmar la importación
                </p>
              </div>

              {/* Mode Switcher */}
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

            {/* Distribution Badges */}
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
                {safeProperties.map(p => {
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

            {/* Interactive Column Mapping */}
            {showMappingSettings && rawHeaders.length > 0 && (
              <div className="bg-[#1c1a17] border border-[#d88d5e]/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#d88d5e]" />
                  <h4 className="text-xs font-bold text-white">Mapeo de Columnas de tu Archivo</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Huésped</label>
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
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Check-In</label>
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
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Check-Out</label>
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
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Depto / Unidad</label>
                    <select
                      value={selectedCabinCol}
                      onChange={e => handleColumnChange('cabin', Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#383838] text-white text-[11px] rounded-lg p-1.5 focus:border-[#d88d5e]"
                    >
                      <option value={-1}>Auto-detectar</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {Object.keys(unitValueMapping).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2d2822]">
                    <span className="text-[11px] font-bold text-zinc-300 block mb-2">
                      Mapeo de valores encontrados en tu columna de departamentos:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.keys(unitValueMapping).map(rawVal => (
                        <div key={rawVal} className="flex items-center justify-between gap-2 bg-[#141414] p-2 rounded-lg border border-[#333]">
                          <span className="text-[11px] text-zinc-300 truncate max-w-[120px] font-mono">
                            "{rawVal}"
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#d88d5e] shrink-0" />
                          <select
                            value={unitValueMapping[rawVal] || safeProperties[0]?.id}
                            onChange={e => handleUnitValueMapChange(rawVal, e.target.value)}
                            className="bg-[#242424] text-white border border-[#444] text-[11px] rounded-md px-2 py-1 focus:border-[#d88d5e]"
                          >
                            {safeProperties.map(p => (
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

            {/* List of parsed events */}
            <div className="space-y-2">
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {parsedEvents.slice(0, 50).map((ev, idx) => (
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
                            En archivo: {ev.rawCabin}
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

                    <div className="shrink-0 flex items-center gap-2">
                      <select
                        value={ev.platform}
                        onChange={e => {
                          const newPlat = e.target.value as BookingPlatform;
                          setParsedEvents(prev =>
                            prev.map((item, i) => (i === idx ? { ...item, platform: newPlat } : item))
                          );
                        }}
                        className="bg-[#242424] text-[#f4f2ee] font-medium border border-[#383838] text-[11px] rounded-lg px-2 py-1.5 focus:border-[#d88d5e]"
                      >
                        <option value="airbnb">Airbnb</option>
                        <option value="booking">Booking.com</option>
                        <option value="direct">Directa / Web</option>
                        <option value="vrbo">VRBO / Expedia</option>
                      </select>

                      <select
                        value={ev.propertyId}
                        onChange={e => {
                          const newId = e.target.value;
                          setParsedEvents(prev =>
                            prev.map((item, i) => (i === idx ? { ...item, propertyId: newId } : item))
                          );
                        }}
                        className="bg-[#242424] text-[#f4f2ee] font-medium border border-[#48372b] text-[11px] rounded-lg px-2.5 py-1.5 focus:border-[#d88d5e]"
                      >
                        {safeProperties.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {parsedEvents.length > 50 && (
                <div className="bg-[#1a1815] border border-[#d88d5e]/20 rounded-xl p-2.5 text-center text-[11px] text-[#c49b78]">
                  Mostrando las primeras 50 de <strong className="text-white">{parsedEvents.length}</strong> reservas detectadas en tu archivo. Al hacer clic en <em>Confirmar e Importar</em> se guardarán las <strong>{parsedEvents.length}</strong> reservas completas en el sistema.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#252525]">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8e8c87] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
              >
                ← Elegir otro archivo
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
