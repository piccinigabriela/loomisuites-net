import React, { useMemo, useState } from 'react';
import { BarChart3, Copy, Check, FileDown, FileSpreadsheet, Briefcase } from 'lucide-react';
import { CurrencyCode, DemoState } from '../../types';
import { computeOwnerReport, ManagementSettings, ReportPeriod } from '../../lib/ownerReport';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const CURRENCY_PREFIX: Record<CurrencyCode, string> = { ARS: '$', USD: 'US$', BRL: 'R$', EUR: '€' };
const UNIT_COLORS = ['#6E9A55', '#C0703A', '#D08A3E', '#7A5BA6', '#3D8FA6', '#B5566B', '#8C8A3E', '#4F7A9A'];
const CHANNEL_COLORS: Record<string, string> = { airbnb: '#E0565B', booking: '#3B6FD4', direct: '#3E9B6A', vrbo: '#2F7EA8' };

interface OwnerReportProps {
  demoState: DemoState;
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  onUpdateManagementSettings?: (s: ManagementSettings) => void;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export const OwnerReport: React.FC<OwnerReportProps> = ({ demoState, period, onPeriodChange, onUpdateManagementSettings }) => {
  const currency: CurrencyCode = demoState.currencySettings?.settlementCurrency || 'USD';
  const saved: ManagementSettings = demoState.managementSettings || { enabled: false, percent: 12 };
  const [enabledInput, setEnabledInput] = useState<boolean>(saved.enabled);
  const [percentInput, setPercentInput] = useState<string>(String(saved.percent ?? 12));
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setEnabledInput(saved.enabled);
    setPercentInput(String(saved.percent ?? 12));
  }, [saved.enabled, saved.percent]);

  const parsedPercent = Number(String(percentInput).replace(',', '.'));
  const percentValid = Number.isFinite(parsedPercent) && parsedPercent >= 0 && parsedPercent <= 100;
  const settingsDirty = enabledInput !== saved.enabled || (enabledInput && parsedPercent !== saved.percent);

  const money = (n: number) => {
    const decimals = currency === 'ARS' ? 0 : 2;
    const v = (n || 0).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return `${CURRENCY_PREFIX[currency] || '$'} ${v}`;
  };

  // La caja va siempre en pesos: los gastos se pasan a la moneda de liquidación con la cotización cargada
  const arsRate = demoState.currencySettings?.rates?.ARS;
  const arsFactor: number | null = currency === 'ARS' ? 1 : arsRate && arsRate > 0 ? arsRate : null;

  const report = useMemo(
    () => computeOwnerReport(demoState.reservations, demoState.properties, demoState.cashMovements, period, saved, arsFactor),
    [demoState.reservations, demoState.properties, demoState.cashMovements, period.month, period.year, saved.enabled, saved.percent, arsFactor]
  );

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const r of demoState.reservations) {
      const y = Number((r.checkIn || '').slice(0, 4));
      if (y > 2000) set.add(y);
    }
    return [...set].sort((a, b) => b - a);
  }, [demoState.reservations]);

  const managed = saved.enabled;
  const periodLabel = period.month === 'all' ? `Año ${period.year}` : `${MONTHS[period.month]} ${period.year}`;
  const complexName = demoState.welcomeGuide?.propertyName || '';
  const t = report.totals;
  const maxUnitValue = Math.max(1, ...report.units.map((u) => (managed ? u.ownerNet : u.net)));
  const maxChannel = Math.max(1, ...report.byChannel.map((c) => c.gross));
  const unitsWithData = report.units.filter((u) => u.reservations > 0 || report.units.length <= 8);

  const handleSaveSettings = () => {
    if (enabledInput && !percentValid) return;
    onUpdateManagementSettings?.({ enabled: enabledInput, percent: enabledInput ? parsedPercent : saved.percent || 12 });
  };

  // ── Texto para mandar al propietario ──
  const buildSummaryText = () => {
    const lines: string[] = [];
    lines.push(`Rendimiento ${periodLabel}${complexName ? ` · ${complexName}` : ''}`);
    lines.push(`Reservas: ${t.reservations} · Noches: ${t.nights}`);
    lines.push('');
    lines.push(`Ingresos brutos: ${money(t.gross)}`);
    lines.push(`Comisiones plataformas: -${money(t.platformFees)}`);
    lines.push(`Neto: ${money(t.net)}`);
    if (managed) {
      lines.push(`Comisión de gestión ${saved.percent}%: -${money(t.management)}`);
      lines.push(`Líquido propietario: ${money(t.ownerNet)}`);
    }
    if (report.expenses > 0) lines.push(`Gastos del período: -${money(report.expenses)}`);
    lines.push(`Resultado neto: ${money(report.result)}`);
    const active = report.units.filter((u) => u.reservations > 0);
    if (active.length > 1) {
      lines.push('');
      lines.push('Por unidad:');
      for (const u of active) {
        lines.push(
          `- ${u.name}: ${u.reservations} reservas · ${u.nights} noches · ${managed ? 'líquido' : 'neto'} ${money(managed ? u.ownerNet : u.net)}`
        );
      }
    }
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildSummaryText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileSlug = `rendimiento_${(complexName || 'complejo').toLowerCase().replace(/[^a-z0-9]+/gi, '_')}_${periodLabel.toLowerCase().replace(/\s+/g, '_')}`;

  const handleCsv = () => {
    const num = (n: number) => (n || 0).toFixed(2).replace('.', ',');
    const head = managed
      ? ['Unidad', 'Reservas', 'Noches', 'Bruto', 'Com. plataforma', 'Neto', `Gestión ${saved.percent}%`, 'Líquido', 'Ticket prom.']
      : ['Unidad', 'Reservas', 'Noches', 'Bruto', 'Com. plataforma', 'Neto', 'Ticket prom.'];
    const row = (name: string, u: typeof t) => {
      const base = [name, String(u.reservations), String(u.nights), num(u.gross), num(u.platformFees), num(u.net)];
      if (managed) base.push(num(u.management), num(u.ownerNet));
      base.push(u.reservations ? num(u.gross / u.reservations) : '0');
      return base;
    };
    const rows = [head, ...report.units.map((u) => row(u.name, u)), row('TOTAL', t)];
    if (report.expenses > 0) rows.push(['Gastos del período', '', '', '', '', '', ...(managed ? ['', ''] : []), num(report.expenses)]);
    const csv = rows.map((r) => r.map((v) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileSlug}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // PDF: abre una hoja limpia lista para imprimir o "Guardar como PDF"
  const handlePdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const kpi = (label: string, value: string, sub = '') =>
      `<div class="kpi"><div class="l">${label}</div><div class="v">${value}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
    const unitRows = report.units
      .map(
        (u) => `<tr><td>${escapeHtml(u.name)}</td><td class="c">${u.reservations}</td><td class="c">${u.nights}</td><td>${money(u.gross)}</td><td>${money(u.platformFees)}</td><td>${money(u.net)}</td>${
          managed ? `<td>${money(u.management)}</td><td class="b">${money(u.ownerNet)}</td>` : ''
        }</tr>`
      )
      .join('');
    const resRows = report.included
      .map((r) => {
        const unit = demoState.properties.find((p) => p.id === r.propertyId)?.name || '';
        const net = r.totalAmount - (r.commissionPaid || 0);
        const mg = managed ? (net * saved.percent) / 100 : 0;
        return `<tr><td>${escapeHtml(unit)}</td><td>${escapeHtml(r.guestName)}</td><td class="c">${r.checkIn.split('-').reverse().join('/')}</td><td class="c">${r.checkOut.split('-').reverse().join('/')}</td><td class="c">${r.nights}</td><td>${money(r.totalAmount)}</td><td>${money(r.commissionPaid || 0)}</td>${
          managed ? `<td>${money(mg)}</td><td class="b">${money(net - mg)}</td>` : `<td class="b">${money(net)}</td>`
        }</tr>`;
      })
      .join('');
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(fileSlug)}</title>
<style>
*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1a1918;margin:28px;font-size:12px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:22px 0 8px}.sub{color:#3d3a36;margin-top:4px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.kpi{border:1px solid #d9d3c7;border-radius:8px;padding:10px}.kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#4a4540;font-weight:bold}
.kpi .v{font-size:17px;font-weight:bold;margin-top:4px}.kpi .s{font-size:11px;color:#3d3a36;margin-top:2px}
.kpi.dark{background:#1a1918;color:#fff;border-color:#1a1918}.kpi.dark .l,.kpi.dark .s{color:#f0d9c4}
table{width:100%;border-collapse:collapse}th{background:#1a1918;color:#fff;text-align:right;padding:6px;font-size:11px}
th:first-child,th:nth-child(2){text-align:left}td{padding:5px 6px;border-bottom:1px solid #e6e1d4;text-align:right}
td:first-child,td:nth-child(2){text-align:left}td.c,th.c{text-align:center}td.b{font-weight:bold}tfoot td{font-weight:bold;border-top:2px solid #1a1918}
.foot{margin-top:24px;font-size:10px;color:#4a4540}@media print{body{margin:12mm}}
</style></head><body>
<h1>Rendimiento · ${escapeHtml(periodLabel)}</h1>
<div class="sub">${complexName ? `${escapeHtml(complexName)} · ` : ''}${t.reservations} reservas · ${t.nights} noches · reservas con check-in en el período</div>
<div class="kpis">
${kpi('Ingresos brutos', money(t.gross), `${t.reservations} reservas`)}
${kpi('Comisiones plataformas', money(t.platformFees))}
${managed ? kpi(`Comisión gestión ${saved.percent}%`, money(t.management), 'sobre el neto') : kpi('Neto', money(t.net))}
${managed ? kpi('Líquido propietario', money(t.ownerNet), `${t.nights} noches`) : ''}
${kpi('Gastos del período', money(report.expenses), `${report.expensesCount} registros`)}
<div class="kpi dark"><div class="l">Resultado neto</div><div class="v">${money(report.result)}</div><div class="s">${report.marginPct !== null ? `margen ${report.marginPct}%` : ''}</div></div>
</div>
<h2>Por unidad</h2>
<table><thead><tr><th>Unidad</th><th class="c">Reservas</th><th class="c">Noches</th><th>Bruto</th><th>Plataforma</th><th>Neto</th>${managed ? `<th>Gestión</th><th>Líquido</th>` : ''}</tr></thead>
<tbody>${unitRows}</tbody>
<tfoot><tr><td>TOTAL</td><td class="c">${t.reservations}</td><td class="c">${t.nights}</td><td>${money(t.gross)}</td><td>${money(t.platformFees)}</td><td>${money(t.net)}</td>${managed ? `<td>${money(t.management)}</td><td>${money(t.ownerNet)}</td>` : ''}</tr></tfoot></table>
<h2>Detalle de reservas</h2>
<table><thead><tr><th>Unidad</th><th>Huésped</th><th class="c">Check-in</th><th class="c">Check-out</th><th class="c">Noches</th><th>Bruto</th><th>Plataforma</th>${managed ? '<th>Gestión</th><th>Líquido</th>' : '<th>Neto</th>'}</tr></thead>
<tbody>${resRows || `<tr><td colspan="9">Sin reservas en el período</td></tr>`}</tbody></table>
<div class="foot">Generado con Loomi Suite · ${new Date().toLocaleDateString('es-AR')}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const card = 'bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5';
  const label = 'text-[10px] tracking-widest uppercase font-bold text-stone-700 dark:text-stone-300';
  const sub = 'text-xs font-semibold mt-1';
  const selectCls =
    'text-sm font-bold px-3 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white cursor-pointer';
  const btn =
    'flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer';

  return (
    <div id="owner-report" className="space-y-4">
      {/* Encabezado + período */}
      <div className={`${card} space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Rendimiento
            </span>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight mt-0.5">
              {periodLabel}
            </h2>
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-0.5">
              Ingresos, comisiones y resultado · reservas con check-in en el período
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="space-y-1">
              <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200">Mes</span>
              <select
                aria-label="Mes"
                value={period.month === 'all' ? 'all' : String(period.month)}
                onChange={(e) =>
                  onPeriodChange({ ...period, month: e.target.value === 'all' ? 'all' : Number(e.target.value) })
                }
                className={selectCls}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
                <option value="all">Todo el año</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200">Año</span>
              <select
                aria-label="Año"
                value={period.year}
                onChange={(e) => onPeriodChange({ ...period, year: Number(e.target.value) })}
                className={selectCls}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleCopy} className={btn} title="Copiar el resumen para mandarlo por WhatsApp">
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar resumen'}
            </button>
            <button type="button" onClick={handleCsv} className={btn}>
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </button>
            <button
              type="button"
              onClick={handlePdf}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Comisión de gestión */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-stone-900 dark:text-white">
            <input
              type="checkbox"
              checked={enabledInput}
              onChange={(e) => setEnabledInput(e.target.checked)}
              className="w-4 h-4 accent-[#E67E22] cursor-pointer"
            />
            <Briefcase className="w-4 h-4 text-[#E67E22]" />
            Administro para un propietario y cobro comisión
          </label>
          {enabledInput && (
            <div className="flex items-center gap-1.5">
              <input
                aria-label="Porcentaje de comisión de gestión"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={percentInput}
                onChange={(e) => setPercentInput(e.target.value)}
                className="w-20 text-sm font-bold px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white"
              />
              <span className="text-sm font-bold text-stone-900 dark:text-white">% sobre el neto</span>
            </div>
          )}
          {settingsDirty && (
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={enabledInput && !percentValid}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-50 text-white cursor-pointer"
            >
              Guardar
            </button>
          )}
          {enabledInput && (
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300 basis-full">
              Neto = bruto menos comisión de la plataforma. Tu comisión se descuenta del neto y el resto es el líquido del propietario.
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className={`grid grid-cols-2 ${managed ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-3`}>
        <div className={card}>
          <div className={label}>Ingresos brutos</div>
          <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(t.gross)}</div>
          <div className={`${sub} text-stone-700 dark:text-stone-300`}>{t.reservations} reservas</div>
        </div>
        <div className={card}>
          <div className={label}>Comisiones plataformas</div>
          <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(t.platformFees)}</div>
          <div className={`${sub} text-rose-700 dark:text-rose-300`}>Airbnb / Booking</div>
        </div>
        {managed ? (
          <>
            <div className={card}>
              <div className={label}>Comisión gestión</div>
              <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(t.management)}</div>
              <div className={`${sub} text-amber-700 dark:text-amber-300`}>{saved.percent}% sobre neto</div>
            </div>
            <div className={card}>
              <div className={label}>Líquido propietario</div>
              <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(t.ownerNet)}</div>
              <div className={`${sub} text-emerald-700 dark:text-emerald-300`}>{t.nights} noches</div>
            </div>
          </>
        ) : (
          <div className={card}>
            <div className={label}>Neto</div>
            <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(t.net)}</div>
            <div className={`${sub} text-emerald-700 dark:text-emerald-300`}>{t.nights} noches</div>
          </div>
        )}
        <div className={card}>
          <div className={label}>Gastos del período</div>
          <div className="text-xl font-bold text-stone-900 dark:text-white mt-1">{money(report.expenses)}</div>
          <div className={`${sub} text-rose-700 dark:text-rose-300`}>
            {report.expensesNeedRate
              ? `${report.expensesCount} registros en pesos: cargá la cotización del peso en Finanzas para descontarlos`
              : `${report.expensesCount} registros${currency !== 'ARS' && report.expensesCount > 0 ? ' (pesos convertidos)' : ''}`}
          </div>
        </div>
        <div className="rounded-2xl p-5 bg-[#2A1E14] border border-[#E67E22]/50">
          <div className="text-[10px] tracking-widest uppercase font-bold text-orange-100">Resultado neto</div>
          <div className="text-xl font-bold text-white mt-1">{money(report.result)}</div>
          <div className="text-xs font-semibold mt-1 text-orange-300">
            {report.marginPct !== null ? `margen ${report.marginPct}%` : 'sin ingresos'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Por unidad */}
        <div className={`${card} lg:col-span-7`}>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Ingresos por unidad</h3>
          <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
            {managed ? 'Líquido del propietario' : 'Neto'} del período · {report.units.length} unidades
          </p>
          <div className="mt-4 space-y-3">
            {unitsWithData.map((u, i) => {
              const value = managed ? u.ownerNet : u.net;
              return (
                <div key={u.propertyId} className="grid grid-cols-[minmax(80px,140px)_1fr_auto] items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: UNIT_COLORS[i % UNIT_COLORS.length] }} />
                    <span className="text-sm font-bold text-stone-900 dark:text-white truncate">{u.name}</span>
                  </div>
                  <div className="h-6 rounded-lg bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-lg"
                      style={{
                        width: `${value > 0 ? Math.max(3, Math.round((value / maxUnitValue) * 100)) : 0}%`,
                        background: UNIT_COLORS[i % UNIT_COLORS.length],
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{money(value)}</div>
                    <div className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      {u.reservations} res. · {u.nights} noches
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por canal + cobros */}
        <div className="lg:col-span-5 space-y-4">
          <div className={card}>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Ingresos por canal</h3>
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300">Bruto del período</p>
            <div className="mt-4 space-y-3">
              {report.byChannel.length === 0 && (
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Sin reservas en el período</p>
              )}
              {report.byChannel.map((c) => (
                <div key={c.platform}>
                  <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-white">
                    <span>{c.label}</span>
                    <span>
                      {money(c.gross)}{' '}
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        ({t.gross > 0 ? Math.round((c.gross / t.gross) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 mt-1 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round((c.gross / maxChannel) * 100)}%`, background: CHANNEL_COLORS[c.platform] || '#8A8580' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${card} space-y-2 text-sm`}>
            <div className="flex justify-between font-bold text-stone-900 dark:text-white">
              <span>Neto operativo</span>
              <span>{money(t.net)}</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 dark:text-white">
              <span>Ticket promedio</span>
              <span>{t.reservations ? money(t.gross / t.reservations) : '—'}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
              <span>Cobrado</span>
              <span>{money(report.collected)}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-700 dark:text-amber-300">
              <span>Falta cobrar</span>
              <span>{money(report.pending)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
