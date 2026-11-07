/**
 * Firestore desde Cloudflare con una cuenta de servicio de Google (sin App Check: las cuentas de servicio no lo necesitan).
 *
 * La cuenta va en la variable secreta FIREBASE_SERVICE_ACCOUNT de Cloudflare Pages: el JSON entero de la clave,
 * pegado directo desde la consola de Google Cloud (nunca por el chat ni en el repo).
 * Rol mínimo: "Usuario de Cloud Datastore" (roles/datastore.user).
 */
export const PROJECT_ID = 'gen-lang-client-0206771016';
export const DATABASE_ID = 'ai-studio-loomisuitesoftwa-4808a07b-59ca-4c3c-a656-b8a461bf5e08';
const ROOT = `projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;

let cached = { token: '', exp: 0, email: '' };

const b64url = (bytes) => {
  let s = '';
  const arr = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function pemToDer(pem) {
  const body = String(pem).replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Lee el JSON de la cuenta de servicio. Devuelve null si falta o está mal pegado. */
export function readServiceAccount(env) {
  try {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || '');
    return sa && sa.client_email && sa.private_key ? sa : null;
  } catch {
    return null;
  }
}

/** Token de acceso (se guarda ~50 minutos en memoria). */
export async function getAccessToken(sa, fetchImpl = fetch) {
  const now = Math.floor(Date.now() / 1000);
  if (cached.token && cached.email === sa.client_email && cached.exp - 300 > now) return cached.token;
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`)));
  const res = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claims}.${b64url(sig)}`,
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, exp: now + Number(data.expires_in || 3600), email: sa.client_email };
  return cached.token;
}

/** Valor de Firestore (REST) → valor de JS */
export function fromValue(v) {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  return null;
}
export const fromFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, fromValue(v)]));

/** Valor de JS → valor de Firestore (solo lo que usamos: texto, número, booleano, mapas) */
export function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
}

export const docName = (path) => `${ROOT}/${path}`;

/** Lee un documento. null si no existe. mask: lista de campos a traer (opcional; para no bajar documentos grandes). */
export async function getDoc(token, path, fetchImpl = fetch, mask = null) {
  const q = Array.isArray(mask) && mask.length ? '?' + mask.map((f) => `mask.fieldPaths=${encodeURIComponent(f)}`).join('&') : '';
  const res = await fetchImpl(`${BASE}/${path}${q}`, { headers: { authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`get ${path} ${res.status}`);
  return fromFields((await res.json()).fields || {});
}

/** Filtro de igualdad (op 'IN' con una lista) para runQuery */
export const where = (field, value, op = 'EQUAL') => ({ fieldFilter: { field: { fieldPath: field }, op, value: toValue(value) } });

/**
 * Consulta una colección. parentPath: documento padre ("tenants/{uid}") o '' para la raíz.
 * Devuelve [{ id, ...campos }].
 */
export async function runQuery(token, parentPath, collectionId, filters, fetchImpl = fetch, limit = 200) {
  const structuredQuery = { from: [{ collectionId }], limit };
  if (filters.length === 1) structuredQuery.where = filters[0];
  else if (filters.length > 1) structuredQuery.where = { compositeFilter: { op: 'AND', filters } };
  const url = parentPath ? `${BASE}/${parentPath}:runQuery` : `${BASE}:runQuery`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
  });
  if (!res.ok) throw new Error(`query ${collectionId} ${res.status}`);
  const rows = await res.json();
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r && r.document)
    .map((r) => ({ id: r.document.name.split('/').pop(), ...fromFields(r.document.fields || {}) }));
}

/** Escrituras atómicas. Devuelve true si se aplicaron; false si falló una condición (por ejemplo, el documento ya existía). */
export async function commit(token, writes, fetchImpl = fetch) {
  const res = await fetchImpl(`${BASE}:commit`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ writes }),
  });
  if (res.ok) return true;
  if (res.status === 409 || res.status === 400) return false;
  throw new Error(`commit ${res.status}`);
}

/** Suma a campos numéricos (crea el documento si no existe). */
export const incrementWrite = (path, fields) => ({
  transform: {
    document: docName(path),
    fieldTransforms: Object.entries(fields).map(([fieldPath, n]) => ({ fieldPath, increment: { integerValue: String(n) } })),
  },
});

/** Clave pública de la app web (la misma que va en el navegador; no es secreta). */
const PUBLIC_API_KEY = 'AIzaSyACFYyOeSuKNQfXR5Pk8uP1ZrRa4y_rgDI';

/**
 * GET de la API REST de Firestore para documentos públicos (vistas previas de links).
 * Con la cuenta de servicio si está configurada; si no, o si falla, con la clave pública
 * (que desde que se exige App Check, 1/11, ya no deja leer).
 * pathAndQuery: por ejemplo "publicGuides/{uid}?mask.fieldPaths=complexName". Devuelve la Response.
 */
export async function publicGet(env, pathAndQuery, fetchImpl = fetch) {
  const sa = readServiceAccount(env || {});
  if (sa) {
    try {
      const token = await getAccessToken(sa, fetchImpl);
      const res = await fetchImpl(`${BASE}/${pathAndQuery}`, { headers: { authorization: `Bearer ${token}` } });
      if (res.ok || res.status === 404) return res;
    } catch {
      /* sigue con la clave pública */
    }
  }
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  return fetchImpl(`${BASE}/${pathAndQuery}${sep}key=${PUBLIC_API_KEY}`, { cf: { cacheTtl: 300, cacheEverything: true } });
}
