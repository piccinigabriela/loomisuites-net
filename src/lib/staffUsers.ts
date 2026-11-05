/**
 * Usuarios del equipo sin mail (idea de Areca, 5/11): el dueño crea "usuario + clave" para Recepción o Limpieza.
 *
 * - Por dentro es una cuenta de Firebase con un mail que no existe: {usuario}--{código}@personal.loomisuite.net.
 *   El código es del complejo (tenants/{uid}.staffAlias) y va en el link de ingreso: app.loomisuite.net/?equipo={código}.
 * - Se crea así, en este orden, para que nadie pueda adelantarse con el mismo mail:
 *   1) se crea la cuenta (Identity Toolkit, con la clave pública de la app) y nos quedamos con su sesión;
 *   2) el dueño crea la invitación (invites/{mail});
 *   3) con la sesión de la cuenta nueva se acepta la invitación (memberships/{uid}), por REST, con App Check.
 *   Las reglas dejan aceptar sin mail confirmado solo a los mails @personal.loomisuite.net.
 * - Si algo falla en el medio, se borra la invitación y la cuenta nueva.
 * - La clave no se guarda en ningún lado: si se olvida, el dueño quita el acceso y crea otro usuario.
 */
import { getToken } from 'firebase/app-check';
import { appCheck, databaseId, firebaseConfig } from './firebase';
import { cancelInvite, createInvite, type StaffRole } from './team';

export const STAFF_DOMAIN = 'personal.loomisuite.net';

export const isStaffLoginEmail = (email?: string | null) => (email || '').toLowerCase().endsWith(`@${STAFF_DOMAIN}`);

/** "rosa--catalinas-x7k2@personal.loomisuite.net" → "rosa" */
export const staffUsernameFromEmail = (email?: string | null) =>
  isStaffLoginEmail(email) ? (email || '').split('@')[0].split('--')[0] : '';

export function cleanUsername(raw: string): string {
  return (raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}

export const cleanAlias = (raw: string) =>
  (raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);

export const staffEmail = (username: string, alias: string) => `${cleanUsername(username)}--${cleanAlias(alias)}@${STAFF_DOMAIN}`;

/** Código del complejo para el link del equipo: "catalinas-x7k2" */
export function makeStaffAlias(complexName: string): string {
  const base =
    (complexName || 'complejo')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 18) || 'complejo';
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
  return `${base}-${rnd}`;
}

export const staffLoginLink = (alias: string) => `https://app.loomisuite.net/?equipo=${encodeURIComponent(alias)}`;

/** Clave fácil de dictar: dos sílabas + 4 números (ej. "lomasol4821") */
export function suggestPassword(): string {
  const syl = ['la', 'lo', 'ma', 'mi', 'sol', 'ra', 'ti', 'pa', 'no', 'ca', 've', 'du'];
  const r = crypto.getRandomValues(new Uint32Array(4));
  return syl[r[0] % syl.length] + syl[r[1] % syl.length] + syl[r[2] % syl.length] + String(1000 + (r[3] % 9000));
}

const IDT = 'https://identitytoolkit.googleapis.com/v1';

const AUTH_ERRORS: Record<string, string> = {
  EMAIL_EXISTS: 'Ese usuario ya existe en tu complejo. Elegí otro nombre.',
  WEAK_PASSWORD: 'La clave tiene que tener al menos 8 caracteres.',
  OPERATION_NOT_ALLOWED: 'El ingreso con usuario y clave no está habilitado. Avisale al equipo de Loomi.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
};

export async function createStaffUser(input: {
  ownerUid: string;
  alias: string;
  username: string;
  password: string;
  role: StaffRole;
  complexName: string;
  /** Nombre para mostrar (ej. "Rosa") */
  name: string;
}): Promise<{ username: string; email: string }> {
  const username = cleanUsername(input.username);
  if (username.length < 3) throw new Error('El usuario tiene que tener al menos 3 letras o números.');
  if ((input.password || '').length < 8) throw new Error(AUTH_ERRORS.WEAK_PASSWORD);
  const email = staffEmail(username, input.alias);

  // 1) La cuenta nueva
  const res = await fetch(`${IDT}/accounts:signUp?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: input.password, returnSecureToken: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = String(data?.error?.message || '').split(' ')[0];
    throw new Error(AUTH_ERRORS[code] || 'No se pudo crear el usuario. Probá de nuevo.');
  }
  const idToken: string = data.idToken;
  const newUid: string = data.localId;

  const undo = async () => {
    await cancelInvite(email).catch(() => {});
    await fetch(`${IDT}/accounts:delete?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).catch(() => {});
  };

  try {
    // 2) La invitación, como dueño
    await createInvite(input.ownerUid, email, input.role, input.complexName);

    // 3) La cuenta nueva acepta: crea su acceso y borra la invitación, en una sola escritura
    const headers: Record<string, string> = { 'content-type': 'application/json', authorization: `Bearer ${idToken}` };
    if (appCheck) {
      const { token } = await getToken(appCheck, false);
      headers['X-Firebase-AppCheck'] = token;
    }
    const root = `projects/${firebaseConfig.projectId}/databases/${databaseId}/documents`;
    const str = (v: string) => ({ stringValue: v });
    const commit = await fetch(`https://firestore.googleapis.com/v1/${root}:commit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: `${root}/memberships/${newUid}`,
              fields: {
                tenantId: str(input.ownerUid),
                role: str(input.role),
                email: str(email),
                name: str((input.name || username).trim().slice(0, 60)),
                complexName: str(input.complexName || ''),
              },
            },
            updateTransforms: [{ fieldPath: 'joinedAt', setToServerValue: 'REQUEST_TIME' }],
            currentDocument: { exists: false },
          },
          { delete: `${root}/invites/${email}` },
        ],
      }),
    });
    if (!commit.ok) throw new Error(`commit ${commit.status}`);
  } catch (err) {
    console.warn('Error creando usuario del equipo:', err);
    await undo();
    throw new Error('No se pudo terminar de crear el usuario. Probá de nuevo en un momento.');
  }
  return { username, email };
}

/** Texto para mandar por WhatsApp con el link, el usuario y la clave */
export function staffWelcomeText(p: { name: string; complexName: string; roleLabel: string; alias: string; username: string; password: string }) {
  return (
    `Hola${p.name ? ` ${p.name}` : ''}! Te creé un usuario en Loomi para ${p.complexName || 'el complejo'} (${p.roleLabel}).\n\n` +
    `Entrá desde el celular acá: ${staffLoginLink(p.alias)}\n` +
    `Usuario: ${p.username}\nClave: ${p.password}\n\n` +
    `Guardá este mensaje. Si te olvidás la clave, avisame y te hago otra.`
  );
}
