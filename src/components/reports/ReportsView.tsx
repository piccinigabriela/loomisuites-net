/**
 * Administración → Informes (5/11). Reemplaza la página larga de "Rendimiento financiero".
 * Molde copiado de Areca: una grilla de tarjetas y, en cada informe, período + 4 números + tabla + descargar e imprimir.
 * Cálculos en src/lib/reports.ts. "Resultado del mes" es el informe de siempre (OwnerReport) y "Moneda y cotización" la configuración.
 */
import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, BedDouble, Coins, Download, Printer, Receipt, ShoppingBag, Split, Wallet } from 'lucide-react';
import type { CurrencyCode, DemoState } from '../../types';
import { formatCurrency } from '../../data/initialData';
import { normalizeAddonCategories } from '../../lib/addonCategories';
import { normalizeOrigins } from '../../lib/origins';
import {
  addonsReport,
  channelReport,
  daysIn,
  type DateRange,
  occupancyReport,
  paymentsReport,
  parseYmd,
  type PresetId,
  PRESETS,
  presetRange,
  unitReport,
} from '../../lib/reports';
import { OwnerReport } from '../demo/OwnerReport';
import type { ManagementSettings, ReportPeriod } from '../../lib/ownerReport';
import { CurrencySettings, type CurrencySettingsValue } from './CurrencySettings';

type ReportId = 'resultado' | 'ocupacion' | 'canales' | 'unidades' | 'cobros' | 'opcionales' | 'moneda';

const CARDS: { id: ReportId; title: string; desc: string; icon: React.ElementType }[] = [
  { id: 'resultado', title: 'Resultado del mes', desc: 'Ingresos, comisiones, gastos y lo que queda. Para mandar al propietario.', icon: Receipt },
  { id: 'ocupacion', title: 'Ocupación', desc: 'Noche por noche y por unidad, con el precio promedio por noche.', icon: BarChart3 },
  { id: 'canales', title: 'Ingresos por canal', desc: 'Airbnb, Booking y directas, con la comisión ya descontada.', icon: Split },
  { id: 'unidades', title: 'Por unidad', desc: 'Cuál rinde más y cuánto deja cada noche.', icon: BedDouble },
  { id: 'cobros', title: 'Cobros y saldos', desc: 'Lo cobrado por medio de pago y quién debe todavía.', icon: Wallet },
  { id: 'opcionales', title: 'Opcionales vendidos', desc: 'Qué extras se venden y cuánto dejan.', icon: ShoppingBag },
  { id: 'moneda', title: 'Moneda y cotización', desc: 'En qué moneda se muestran los informes y a cuánto el dólar.', icon: Coins },
];

interface Props {
  demoState: DemoState;
  onUpdateCurrencySettings?: (s: CurrencySettingsValue) => void;
  onUpdateManagementSettings?: (s: ManagementSettings) => void;
}

type Cell = string | number;
interface TableData {
  title?: string;
  head: string[];
  rows: Cell[][];
  foot?: Cell[];
  /** Columnas alineadas a la izquierda (el resto, a la derecha). Por defecto, la primera. */
  left?: number[];
  empty?: string;
}
interface Kpi {
  label: string;
  value: string;
  sub?: string;
}

const money = (n: number) => formatCurrency(n);
const pct = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString('es-AR')} %`;
const fmtDay = (s: string) => {
  const d = parseYmd(s);
  return d ? d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : s;
};
const fmtDate = (s: string) => s.split('-').reverse().join('/');

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

function downloadCsv(fileName: string, tables: TableData[]) {
  const esc = (v: Cell) => {
    const s = String(v ?? '');
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const parts: string[] = [];
  for (const t of tables) {
    if (t.title) parts.push(esc(t.title));
    parts.push(t.head.map(esc).join(';'));
    for (const r of t.rows) parts.push(r.map(esc).join(';'));
    if (t.foot) parts.push(t.foot.map(esc).join(';'));
    parts.push('');
  }
  const blob = new Blob(['﻿' + parts.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function printReport(title: string, subtitle: string, kpis: Kpi[], tables: TableData[]) {
  const w = window.open('', '_blank');
  if (!w) return;
  const table = (t: TableData) => {
    const left = new Set(t.left || [0]);
    const cell = (v: Cell, i: number, tag = 'td') => `<${tag} class="${left.has(i) ? 'l' : ''}">${escapeHtml(String(v ?? ''))}</${tag}>`;
    return `${t.title ? `<h2>${escapeHtml(t.title)}</h2>` : ''}<table><thead><tr>${t.head.map((h, i) => cell(h, i, 'th')).join('')}</tr></thead><tbody>${
      t.rows.length ? t.rows.map((r) => `<tr>${r.map((v, i) => cell(v, i)).join('')}</tr>`).join('') : `<tr><td class="l" colspan="${t.head.length}">${escapeHtml(t.empty || 'Sin datos en el período')}</td></tr>`
    }</tbody>${t.foot ? `<tfoot><tr>${t.foot.map((v, i) => cell(v, i)).join('')}</tr></tfoot>` : ''}</table>`;
  };
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1a1918;margin:28px;font-size:12px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:22px 0 8px}.sub{margin-top:4px;color:#3d3a36}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}.kpi{border:1px solid #d9d3c7;border-radius:8px;padding:10px}
.kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:bold;color:#4a4540}.kpi .v{font-size:17px;font-weight:bold;margin-top:4px}.kpi .s{font-size:11px;margin-top:2px;color:#3d3a36}
table{width:100%;border-collapse:collapse;margin-top:6px}th{background:#1a1918;color:#fff;padding:6px;font-size:11px;text-align:right}td{padding:5px 6px;border-bottom:1px solid #e6e1d4;text-align:right}
.l{text-align:left}tfoot td{font-weight:bold;border-top:2px solid #1a1918}.foot{margin-top:24px;font-size:10px;color:#4a4540}@media print{body{margin:12mm}}
</style></head><body><h1>${escapeHtml(title)}</h1><div class="sub">${escapeHtml(subtitle)}</div>
<div class="kpis">${kpis.map((k) => `<div class="kpi"><div class="l">${escapeHtml(k.label)}</div><div class="v">${escapeHtml(k.value)}</div>${k.sub ? `<div class="s">${escapeHtml(k.sub)}</div>` : ''}</div>`).join('')}</div>
${tables.map(table).join('')}<div class="foot">Hecho con Loomi Suite · ${new Date().toLocaleDateString('es-AR')}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`);
  w.document.close();
}

// ---------------------------------------------------------------- piezas

const btn =
  'inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer';

const KpiRow: React.FC<{ kpis: Kpi[] }> = ({ kpis }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] divide-x divide-y lg:divide-y-0 divide-stone-200 dark:divide-zinc-800 overflow-hidden">
    {kpis.map((k) => (
      <div key={k.label} className="p-4 sm:p-5 min-w-0">
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{k.label}</p>
        <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-stone-900 dark:text-white truncate">{k.value}</p>
        {k.sub && <p className="mt-1 text-sm text-stone-800 dark:text-stone-200">{k.sub}</p>}
      </div>
    ))}
  </div>
);

const Table: React.FC<{ t: TableData }> = ({ t }) => {
  const left = new Set(t.left || [0]);
  const align = (i: number) => (left.has(i) ? 'text-left' : 'text-right');
  return (
    <section className="space-y-2">
      {t.title && <h3 className="text-base font-bold text-stone-900 dark:text-white">{t.title}</h3>}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] overflow-x-auto">
        <table className="w-full text-sm sm:text-base">
          <thead>
            <tr className="border-b border-stone-200 dark:border-zinc-800">
              {t.head.map((h, i) => (
                <th key={h + i} className={`px-4 py-3 font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap ${align(i)}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
            {t.rows.length === 0 ? (
              <tr>
                <td colSpan={t.head.length} className="px-4 py-6 text-base font-semibold text-stone-800 dark:text-stone-200">
                  {t.empty || 'No hay datos en este período.'}
                </td>
              </tr>
            ) : (
              t.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((v, i) => (
                    <td key={i} className={`px-4 py-3 whitespace-nowrap tabular-nums text-stone-900 dark:text-white ${i === 0 ? 'font-bold' : ''} ${align(i)}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {t.foot && t.rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-stone-300 dark:border-zinc-600">
                {t.foot.map((v, i) => (
                  <td key={i} className={`px-4 py-3 font-bold whitespace-nowrap tabular-nums text-stone-900 dark:text-white ${align(i)}`}>
                    {v}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};

const PeriodBar: React.FC<{ range: DateRange; preset: PresetId | null; onPreset: (p: PresetId) => void; onRange: (r: DateRange) => void }> = ({
  range,
  preset,
  onPreset,
  onRange,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPreset(p.id)}
          aria-pressed={preset === p.id}
          className={`min-h-[40px] px-3.5 rounded-xl text-sm font-bold cursor-pointer border-2 ${
            preset === p.id ? 'bg-[#E67E22] border-[#E67E22] text-[#111]' : 'border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        aria-label="Desde"
        value={range.from}
        max={range.to}
        onChange={(e) => e.target.value && onRange({ ...range, from: e.target.value })}
        className="min-h-[40px] px-2.5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-bold text-stone-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
      />
      <span className="font-bold">–</span>
      <input
        type="date"
        aria-label="Hasta"
        value={range.to}
        min={range.from}
        onChange={(e) => e.target.value && onRange({ ...range, to: e.target.value })}
        className="min-h-[40px] px-2.5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-bold text-stone-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
      />
    </div>
  </div>
);

/** Barras de ocupación noche por noche */
const NightBars: React.FC<{ nights: { date: string; pct: number; sold: number }[] }> = ({ nights }) => (
  <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-4 sm:p-5">
    <h3 className="text-base font-bold mb-3">Ocupación por noche</h3>
    <div className="flex items-end gap-px h-36" role="img" aria-label="Ocupación noche por noche">
      {nights.map((n) => (
        <div key={n.date} className="flex-1 h-full flex items-end" title={`${fmtDay(n.date)}: ${n.pct} % (${n.sold} ${n.sold === 1 ? 'unidad' : 'unidades'})`}>
          <div className={`w-full rounded-t-sm ${n.pct > 0 ? 'bg-[#E67E22]' : 'bg-stone-200 dark:bg-zinc-800'}`} style={{ height: `${Math.max(n.pct, 2)}%` }} />
        </div>
      ))}
    </div>
    {nights.length > 0 && (
      <div className="mt-2 flex justify-between text-sm font-semibold text-stone-800 dark:text-stone-200">
        <span>{fmtDay(nights[0].date)}</span>
        <span>{fmtDay(nights[nights.length - 1].date)}</span>
      </div>
    )}
  </section>
);

// ---------------------------------------------------------------- vista

export const ReportsView: React.FC<Props> = ({ demoState, onUpdateCurrencySettings, onUpdateManagementSettings }) => {
  const [open, setOpen] = useState<ReportId | null>(null);
  const [preset, setPreset] = useState<PresetId | null>('este-mes');
  const [range, setRange] = useState<DateRange>(() => presetRange('este-mes'));
  const [ownerPeriod, setOwnerPeriod] = useState<ReportPeriod>(() => ({ month: new Date().getMonth(), year: new Date().getFullYear() }));

  const reservations = demoState.reservations || [];
  const properties = demoState.properties || [];
  const categories = useMemo(() => normalizeAddonCategories(demoState.addonCategories), [demoState.addonCategories]);
  const currency: CurrencyCode = demoState.currencySettings?.settlementCurrency || 'USD';
  const complexName = demoState.welcomeGuide?.propertyName || '';

  const pickPreset = (p: PresetId) => {
    setPreset(p);
    setRange(presetRange(p));
  };
  const pickRange = (r: DateRange) => {
    setPreset(null);
    setRange(r);
  };
  const rangeLabel = `${fmtDate(range.from)} al ${fmtDate(range.to)}`;
  const presetLabel = PRESETS.find((p) => p.id === preset)?.label;

  const report = useMemo(() => {
    if (!open || open === 'resultado' || open === 'moneda') return null;
    if (open === 'ocupacion') {
      const o = occupancyReport(reservations, properties, range);
      return {
        note: 'Cuenta cada noche ocupada dentro del período, aunque la estadía haya empezado antes.',
        kpis: [
          { label: 'Ocupación', value: pct(o.pct), sub: `${o.sold} de ${o.capacity} noches` },
          { label: 'Ingresos de esas noches', value: money(o.revenue), sub: 'solo alojamiento' },
          { label: 'Precio promedio por noche', value: money(o.avgNight), sub: 'de las noches vendidas' },
          { label: 'Por noche disponible', value: money(o.perAvailable), sub: 'ingresos ÷ noches posibles' },
        ],
        extra: daysIn(range) <= 400 ? <NightBars nights={o.nights} /> : null,
        tables: [
          {
            title: 'Por unidad',
            head: ['Unidad', 'Noches vendidas', 'Noches posibles', 'Ocupación', 'Ingresos'],
            rows: o.units.map((u) => [u.name, u.sold, u.capacity, pct(u.pct), money(u.revenue)]),
            foot: ['Total', o.sold, o.capacity, pct(o.pct), money(o.revenue)],
          },
        ] as TableData[],
      };
    }
    if (open === 'canales') {
      const c = channelReport(reservations, range, normalizeOrigins(demoState.reservationOrigins));
      const direct = c.rows.find((r) => r.key === 'direct');
      return {
        note: 'Cuentan las reservas que entran en el período. Neto = lo que paga el huésped menos la comisión. Tus orígenes propios (Instagram, agencias…) van en su fila.',
        kpis: [
          { label: 'Ingresos', value: money(c.totals.gross), sub: `${c.totals.reservations} reservas` },
          { label: 'Comisiones', value: money(c.totals.fees), sub: 'de plataformas y agencias' },
          { label: 'Neto', value: money(c.totals.net), sub: `${c.totals.nights} noches` },
          { label: 'Directas', value: direct ? pct(direct.share) : '0 %', sub: 'del neto, sin comisión' },
        ],
        tables: [
          {
            head: ['Canal', 'Reservas', 'Noches', 'Ingresos', 'Comisión', 'Neto', 'Del total'],
            rows: c.rows.map((r) => [r.label, r.reservations, r.nights, money(r.gross), money(r.fees), money(r.net), pct(r.share)]),
            foot: ['Total', c.totals.reservations, c.totals.nights, money(c.totals.gross), money(c.totals.fees), money(c.totals.net), c.rows.length ? '100 %' : ''],
          },
        ] as TableData[],
      };
    }
    if (open === 'unidades') {
      const u = unitReport(reservations, properties, range);
      const best = u.rows.find((r) => r.net > 0);
      return {
        note: 'Cuentan las reservas que entran en el período. Montos netos, con la comisión de la plataforma descontada.',
        kpis: [
          { label: 'Neto total', value: money(u.totalNet), sub: `${u.totalNights} noches` },
          { label: 'La que más dejó', value: best ? best.name : '—', sub: best ? money(best.net) : 'sin reservas' },
          { label: 'Promedio por noche', value: money(u.totalNights ? u.totalNet / u.totalNights : 0), sub: 'neto' },
          { label: 'Unidades', value: String(properties.length), sub: `${u.rows.filter((r) => r.reservations > 0).length} con reservas` },
        ],
        tables: [
          {
            head: ['Unidad', 'Reservas', 'Noches', 'Neto', 'Por noche', 'Del total'],
            rows: u.rows.map((r) => [r.name, r.reservations, r.nights, money(r.net), money(r.avgNight), pct(r.share)]),
          },
        ] as TableData[],
      };
    }
    if (open === 'cobros') {
      const p = paymentsReport(reservations, properties, range);
      return {
        note: 'Cobrado: los pagos registrados en el período (si una reserva está marcada pagada sin detalle, cuenta el día que entra). Saldos: reservas que entran en el período y todavía deben.',
        kpis: [
          { label: 'Cobrado', value: money(p.collected), sub: `${p.paymentsCount} ${p.paymentsCount === 1 ? 'pago' : 'pagos'}` },
          { label: 'Falta cobrar', value: money(p.pendingTotal), sub: 'de las reservas del período' },
          { label: 'Reservas con saldo', value: String(p.owing.length) },
          { label: 'Medio más usado', value: p.byMethod.filter((m) => m.method !== 'sin-detalle').sort((a, b) => b.amount - a.amount)[0]?.label || '—' },
        ],
        tables: [
          {
            title: 'Cobrado por medio de pago',
            head: ['Medio', 'Pagos', 'Monto'],
            rows: p.byMethod.map((m) => [m.label, m.count, money(m.amount)]),
            foot: ['Total', p.paymentsCount, money(p.collected)],
            empty: 'No hay pagos registrados en este período.',
          },
          {
            title: 'Quién debe',
            head: ['Huésped', 'Unidad', 'Entra', 'Total', 'Pagado', 'Saldo'],
            rows: p.owing.map((o) => [o.guest, o.unit, fmtDate(o.checkIn), money(o.total), money(o.paid), money(o.balance)]),
            foot: ['Total', '', '', '', '', money(p.pendingTotal)],
            left: [0, 1],
            empty: 'Nadie debe nada en este período.',
          },
        ] as TableData[],
      };
    }
    // opcionales
    const a = addonsReport(reservations, range, categories);
    return {
      note: 'Cuentan los opcionales de las reservas que entran en el período.',
      kpis: [
        { label: 'Vendidos', value: String(a.quantity) },
        { label: 'Total', value: money(a.total) },
        { label: 'El más pedido', value: a.rows.slice().sort((x, y) => y.quantity - x.quantity)[0]?.name || '—' },
        { label: 'Reservas con opcionales', value: String(a.reservationsWith) },
      ],
      tables: [
        {
          head: ['Opcional', 'Categoría', 'Cantidad', 'Total'],
          rows: a.rows.map((r) => [r.name, r.category, r.quantity, money(r.total)]),
          foot: ['Total', '', a.quantity, money(a.total)],
          left: [0, 1],
          empty: 'No se vendieron opcionales en este período.',
        },
      ] as TableData[],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reservations, properties, range.from, range.to, categories, currency, demoState.reservationOrigins]);

  const card = CARDS.find((c) => c.id === open);

  // ---- grilla
  if (!open || !card) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 font-sans text-stone-900 dark:text-white">
        <div>
          <h2 className="text-2xl font-bold">Informes</h2>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Elegí uno. Todos se pueden descargar o imprimir.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setOpen(c.id)}
                className="group text-left rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-5 sm:p-6 hover:border-[#E67E22] transition-colors cursor-pointer flex flex-col"
              >
                <span className="w-11 h-11 rounded-xl bg-[#E67E22]/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#E67E22]" />
                </span>
                <span className="mt-4 text-lg font-bold">{c.title}</span>
                <span className="mt-1 text-base text-stone-800 dark:text-stone-200 flex-1">{c.desc}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#A94F12] dark:text-[#F5A35C]">
                  {c.id === 'moneda' ? 'Configurar' : 'Ver informe'} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const header = (
    <div className="space-y-1">
      <button type="button" onClick={() => setOpen(null)} className="inline-flex items-center gap-1.5 min-h-[40px] text-base font-bold text-[#A94F12] dark:text-[#F5A35C] cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Informes
      </button>
      <h2 className="text-2xl font-bold">{card.title}</h2>
    </div>
  );

  if (open === 'resultado') {
    return (
      <div className="max-w-7xl mx-auto space-y-4 font-sans text-stone-900 dark:text-white">
        {header}
        <OwnerReport demoState={demoState} period={ownerPeriod} onPeriodChange={setOwnerPeriod} onUpdateManagementSettings={onUpdateManagementSettings} />
      </div>
    );
  }

  if (open === 'moneda') {
    return (
      <div className="max-w-3xl mx-auto space-y-4 font-sans text-stone-900 dark:text-white">
        {header}
        <CurrencySettings demoState={demoState} onSave={onUpdateCurrencySettings} />
      </div>
    );
  }

  const r = report!;
  const fileName = `${card.title}_${complexName || 'complejo'}_${range.from}_${range.to}`.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '_');
  const subtitle = `${complexName ? `${complexName} · ` : ''}${presetLabel ? `${presetLabel} · ` : ''}${rangeLabel}`;

  return (
    <div className="max-w-6xl mx-auto space-y-5 font-sans text-stone-900 dark:text-white">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        {header}
        <div className="flex gap-2">
          <button type="button" onClick={() => downloadCsv(fileName, r.tables)} className={btn}>
            <Download className="w-4 h-4" /> Descargar
          </button>
          <button type="button" onClick={() => printReport(card.title, subtitle, r.kpis, r.tables)} className={btn}>
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>
      <PeriodBar range={range} preset={preset} onPreset={pickPreset} onRange={pickRange} />
      <p className="text-base text-stone-800 dark:text-stone-200">
        <span className="font-bold text-stone-900 dark:text-white">{rangeLabel}.</span> {r.note}
      </p>
      <KpiRow kpis={r.kpis} />
      {'extra' in r && r.extra}
      {r.tables.map((t, i) => (
        <Table key={i} t={t} />
      ))}
    </div>
  );
};

export default ReportsView;
