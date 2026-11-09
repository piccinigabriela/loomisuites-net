/**
 * Firestore simulado en memoria para las pruebas (REST: get con mask, runQuery con filtros y orden, commit con condiciones).
 * Lo usan scripts/probar-aiosell-receptor.ts y scripts/probar-aiosell-admin.ts.
 */
// @ts-nocheck
import { fromFields, toValue } from '../functions-lib/firestoreAdmin.js';

const ROOT = 'projects/gen-lang-client-0206771016/databases/ai-studio-loomisuitesoftwa-4808a07b-59ca-4c3c-a656-b8a461bf5e08/documents';
const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;

export function fakeFirestore(initial: Record<string, Record<string, unknown>>) {
  const docs = new Map<string, Record<string, unknown>>(Object.entries(initial).map(([k, v]) => [k, structuredClone(v)]));
  const toDoc = (path: string, data: Record<string, unknown>) => ({
    name: `${ROOT}/${path}`,
    fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toValue(v)])),
  });
  const matches = (data: Record<string, unknown>, f: any): boolean => {
    if (f.compositeFilter) return f.compositeFilter.filters.every((x: any) => matches(data, x));
    const { field, op, value } = f.fieldFilter;
    const v = fromFields({ v: value }).v;
    const got = data[field.fieldPath];
    if (op === 'EQUAL') return got === v;
    if (op === 'IN') return (v as unknown[]).includes(got);
    throw new Error('op ' + op);
  };
  const fetchImpl = (async (input: unknown, init: any = {}) => {
    const url = String(input);
    const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
    if (url === 'https://oauth2.googleapis.com/token') return ok({ access_token: 'tok', expires_in: 3600 });
    if (!url.startsWith(BASE)) throw new Error('url inesperada ' + url);
    const rest = url.slice(BASE.length);
    if (rest === ':commit') {
      const { writes } = JSON.parse(init.body);
      const next = new Map(docs);
      for (const w of writes) {
        const name: string = (w.update && w.update.name) || w.delete;
        const path = name.slice(ROOT.length + 1);
        const pre = w.currentDocument;
        if (pre && pre.exists === false && next.has(path)) return new Response('{}', { status: 409 });
        if (pre && pre.exists === true && !next.has(path)) return new Response('{}', { status: 404 });
        if (w.delete) {
          next.delete(path);
          continue;
        }
        const data = fromFields(w.update.fields);
        next.set(path, w.updateMask ? { ...(next.get(path) || {}), ...data } : data);
      }
      docs.clear();
      for (const [k, v] of next) docs.set(k, v);
      return ok({});
    }
    if (rest.endsWith(':runQuery')) {
      const parent = rest.slice(1, -':runQuery'.length);
      const q = JSON.parse(init.body).structuredQuery;
      const col = `${parent}/${q.from[0].collectionId}/`;
      let rows = [...docs.entries()].filter(([p, d]) => p.startsWith(col) && !p.slice(col.length).includes('/') && (!q.where || matches(d, q.where)));
      if (q.orderBy && q.orderBy[0]) {
        const f = q.orderBy[0].field.fieldPath, desc = q.orderBy[0].direction === 'DESCENDING';
        rows.sort((a, b) => (a[1][f] < b[1][f] ? -1 : a[1][f] > b[1][f] ? 1 : 0) * (desc ? -1 : 1));
      }
      if (q.limit) rows = rows.slice(0, q.limit);
      const out = rows.map(([p, d]) => ({ document: toDoc(p, d) }));
      return ok(out.length ? out : [{ readTime: '2026-11-07T12:00:00Z' }]);
    }
    const path = rest.slice(1).split('?')[0];
    const d = docs.get(path);
    return d ? ok(toDoc(path, d)) : new Response('{}', { status: 404 });
  }) as typeof fetch;
  return { docs, fetchImpl };
}

