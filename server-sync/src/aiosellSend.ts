/**
 * Channel manager (Aiosell): lo que Loomi le manda a Aiosell (disponibilidad y, si el dueño quiere, precios y estadía mínima).
 * La lógica de qué se manda está en src/lib/aiosell.ts (channelSendBodies); acá se lee, se compara y se envía.
 *
 * - Solo cuentas cuyo hotel está en modo real (channelHotels/{hotelCode}.mode === 'real'): en prueba no se manda nada,
 *   así un complejo que se está probando no les cambia nada a las plataformas.
 * - Cada 10 minutos: se arma todo (365 días) y se manda solo lo que cambió desde el último envío (huella en
 *   tenants/{uid}/sync/aiosell.sent). Una vez por día se manda todo igual, por si algo se perdió.
 * - Credenciales y código de PMS en sistema/aiosell {user, password, pms, baseUrl} (sin acceso desde la app;
 *   se cargan con `npm run aiosell -- credenciales ...` en Cloud Shell).
 */
import type { Firestore } from 'firebase-admin/firestore';
import type { Property, Reservation } from '../../src/types';
import type { PricingSettings } from '../../src/lib/pricing';
import { bodyFingerprint, channelSendBodies, type ChannelManagerSettings } from '../../src/lib/aiosell';
import { getDateStringInTimeZone } from '../../src/lib/icalCore';

export const AIOSELL_CONFIG_DOC = 'sistema/aiosell';
const DEFAULT_BASE = 'https://live.aiosell.com/api/v2/cm';
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const DAYS = 365;
const FULL_EVERY_MS = 24 * 3600 * 1000;

export interface AiosellConfig {
  user: string;
  password: string;
  pms: string;
  baseUrl: string;
}

export async function getAiosellConfig(db: Firestore): Promise<AiosellConfig | null> {
  const snap = await db.doc(AIOSELL_CONFIG_DOC).get();
  if (!snap.exists) return null;
  const user = String(snap.get('user') || '');
  const password = String(snap.get('password') || '');
  const pms = String(snap.get('pms') || '');
  if (!user || !password || !pms) return null;
  return { user, password, pms, baseUrl: String(snap.get('baseUrl') || DEFAULT_BASE).replace(/\/+$/, '') };
}

type Kind = 'availability' | 'rates' | 'restrictions';
const PATH: Record<Kind, string> = { availability: 'update', rates: 'update-rates', restrictions: 'update' };

/** POST a Aiosell. Devuelve '' si salió bien o el error. */
export async function postAiosell(cfg: AiosellConfig, kind: Kind, body: unknown, fetchImpl: typeof fetch = fetch): Promise<string> {
  try {
    const res = await fetchImpl(`${cfg.baseUrl}/${PATH[kind]}/${encodeURIComponent(cfg.pms)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Basic ' + Buffer.from(`${cfg.user}:${cfg.password}`).toString('base64'),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    let ok = res.ok;
    try {
      const j = JSON.parse(text);
      if (j && j.success === false) ok = false;
    } catch {
      /* respuesta que no es JSON: vale el código HTTP */
    }
    return ok ? '' : `HTTP ${res.status}: ${text.slice(0, 300)}`;
  } catch (err: any) {
    return err?.message || String(err);
  }
}

/** Cuentas que mandan a Aiosell: las de los hoteles en modo real */
export async function cuentasAiosellReales(db: Firestore): Promise<Array<{ uid: string; hotelCode: string }>> {
  const snap = await db.collection('channelHotels').where('mode', '==', 'real').get();
  return snap.docs.map((d) => ({ uid: String(d.get('uid') || ''), hotelCode: d.id })).filter((c) => c.uid);
}

export interface EnvioResult {
  uid: string;
  hotelCode: string;
  sent: Kind[];
  skipped: Kind[];
  errors: Array<{ kind: Kind; error: string }>;
  /** Lo que se mandó o se mandaría (para el comando de Cloud Shell) */
  bodies?: Partial<Record<Kind, unknown>>;
}

/**
 * Arma y manda lo de una cuenta. dryRun: solo devuelve lo que mandaría. force: manda todo aunque no haya cambiado.
 */
export async function enviarCuentaAiosell(
  db: Firestore,
  cfg: AiosellConfig | null,
  uid: string,
  hotelCode: string,
  opts: { force?: boolean; dryRun?: boolean; fetchImpl?: typeof fetch; now?: Date } = {}
): Promise<EnvioResult> {
  const now = opts.now || new Date();
  const result: EnvioResult = { uid, hotelCode, sent: [], skipped: [], errors: [] };
  const tenant = await db.doc(`tenants/${uid}`).get();
  const cm = (tenant.get('channelManager') || {}) as ChannelManagerSettings;
  if (cm.hotelCode !== hotelCode) {
    result.errors.push({ kind: 'availability', error: `La cuenta tiene hotelCode ${cm.hotelCode || '(ninguno)'} y el hotel es ${hotelCode}` });
    return result;
  }

  const today = getDateStringInTimeZone(ZONA_HORARIA, now);
  const [resSnap, propSnap] = await Promise.all([
    db.collection(`tenants/${uid}/reservations`).where('checkOut', '>', today).get(),
    db.collection(`tenants/${uid}/properties`).get(),
  ]);
  const reservations = resSnap.docs.map((d) => ({ ...(d.data() as Reservation), id: d.id }));
  const properties = propSnap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
  const bodies = channelSendBodies({
    cm,
    reservations,
    properties,
    pricing: (tenant.get('pricing') || null) as PricingSettings | null,
    from: today,
    days: DAYS,
  });
  if (!bodies) return result;

  const syncRef = db.doc(`tenants/${uid}/sync/aiosell`);
  const sync = await syncRef.get();
  const prev = (sync.get('sent') || {}) as Partial<Record<Kind, { fp: string; at: string }>>;
  const next: Partial<Record<Kind, { fp: string; at: string }>> = { ...prev };
  result.bodies = {};

  for (const kind of ['availability', 'rates', 'restrictions'] as Kind[]) {
    const body = bodies[kind];
    if (!body || body.updates.length === 0) continue;
    result.bodies[kind] = body;
    // La huella no incluye las fechas de hoy (cambian cada día); si solo pasó el día, alcanza con el envío diario
    const fp = bodyFingerprint(body.updates.map((u: any) => ({ ...u, startDate: u.startDate <= today ? 'HOY' : u.startDate })));
    const last = prev[kind];
    const stale = !last || now.getTime() - new Date(last.at).getTime() > FULL_EVERY_MS;
    if (!opts.force && last && last.fp === fp && !stale) {
      result.skipped.push(kind);
      continue;
    }
    if (opts.dryRun || !cfg) {
      result.sent.push(kind);
      continue;
    }
    const error = await postAiosell(cfg, kind, body, opts.fetchImpl);
    if (error) result.errors.push({ kind, error });
    else {
      result.sent.push(kind);
      next[kind] = { fp, at: now.toISOString() };
    }
  }

  if (!opts.dryRun && cfg) {
    await syncRef.set(
      {
        sent: next,
        lastSendAt: now.toISOString(),
        lastSendError: result.errors.length ? result.errors.map((e) => `${e.kind}: ${e.error}`).join(' | ') : '',
      },
      { merge: true }
    );
  }
  return result;
}
