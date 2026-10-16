import React, { useEffect, useState } from 'react';
import { KeyRound, MessageCircle, Trash2, UserPlus, Users } from 'lucide-react';
import {
  cancelInvite,
  createInvite,
  Invite,
  Membership,
  normalizeEmail,
  removeMember,
  StaffRole,
  STAFF_ROLE_LABEL,
  subscribeToTeam,
} from '../../lib/team';

interface TeamAccessViewProps {
  ownerUid: string;
  ownerEmail: string;
  complexName: string;
  showToast: (msg: string) => void;
}

const card = 'bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5';
const inputCls =
  'w-full text-base font-semibold px-3 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400';
const ghostBtn =
  'inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer';
const waBtn =
  'inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl bg-[#128C5E] hover:bg-[#0E7A51] text-white transition-colors cursor-pointer';

function whatsappInviteUrl(email: string, role: StaffRole, complexName: string): string {
  const text =
    `Hola! Te sumé a ${complexName || 'nuestro complejo'} en Loomi Suite como ${STAFF_ROLE_LABEL[role]}. ` +
    `Entrá a https://app.loomisuite.net con el mail ${email} (con "Continuar con Google" o creando una contraseña) y aceptá la invitación.`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

const ROLE_HELP: Record<StaffRole, string> = {
  recepcion: 'Mostrador y calendario: reservas, check-in y check-out, cobros y caja. No ve Finanzas, Administración ni Configuración.',
  limpieza: 'Solo las limpiezas del día con su checklist, y quién llega a cada unidad (nombre y cuántos son). Nada de teléfonos ni importes.',
};

/** Administración → Equipo y accesos: invitar, ver y quitar accesos de Recepción y Limpieza. */
export const TeamAccessView: React.FC<TeamAccessViewProps> = ({ ownerUid, ownerEmail, complexName, showToast }) => {
  const [members, setMembers] = useState<Array<Membership & { uid: string }>>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('limpieza');
  const [busy, setBusy] = useState(false);
  const [justInvited, setJustInvited] = useState<Invite | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerUid) return;
    return subscribeToTeam(
      ownerUid,
      ({ members, invites }) => {
        setLoadError(false);
        setMembers(members);
        setInvites(invites);
      },
      () => setLoadError(true)
    );
  }, [ownerUid]);

  const cleanEmail = normalizeEmail(email);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const isSelf = cleanEmail === normalizeEmail(ownerEmail);
  const alreadyMember = members.some((m) => normalizeEmail(m.email) === cleanEmail);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || isSelf || alreadyMember) return;
    setBusy(true);
    try {
      await createInvite(ownerUid, cleanEmail, role, complexName);
      setJustInvited({ email: cleanEmail, role, tenantId: ownerUid, complexName });
      setEmail('');
      showToast(`Invitación lista para ${cleanEmail}`);
    } catch (err) {
      console.warn('Error creando invitación:', err);
      showToast('No se pudo crear la invitación. Puede que ese mail ya esté invitado a otro complejo.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (m: Membership & { uid: string }) => {
    setConfirmRemove(null);
    try {
      await removeMember(m.uid);
      showToast(`${m.name || m.email} ya no tiene acceso`);
    } catch (err) {
      console.warn('Error quitando acceso:', err);
      showToast('No se pudo quitar el acceso. Probá de nuevo.');
    }
  };

  const handleCancelInvite = async (inv: Invite) => {
    try {
      await cancelInvite(inv.email);
      if (justInvited?.email === inv.email) setJustInvited(null);
    } catch (err) {
      console.warn('Error cancelando invitación:', err);
      showToast('No se pudo cancelar la invitación.');
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto font-sans">
      <div className={card}>
        <span className="text-xs tracking-widest text-[#E67E22] uppercase font-bold flex items-center gap-1.5">
          <KeyRound className="w-4 h-4" /> Equipo y accesos
        </span>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight mt-1">Invitá a Recepción y Limpieza</h2>
        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
          Cada persona entra con su propia cuenta en app.loomisuite.net y queda fija en su rol. Finanzas, Administración y Configuración las ves solo vos.
        </p>

        {loadError && (
          <p className="mt-3 text-sm font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3">
            Todavía no están publicadas las reglas nuevas de Firestore. Hasta que se publiquen, no se puede invitar.
          </p>
        )}

        <form onSubmit={handleInvite} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
          <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
            <span>Mail de la persona</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: marta@gmail.com"
              className={inputCls}
            />
          </label>
          <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
            <span>Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputCls}>
              <option value="limpieza">Limpieza</option>
              <option value="recepcion">Recepción</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy || !emailValid || isSelf || alreadyMember}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-50 text-white cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Invitar
          </button>
        </form>
        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-2">{ROLE_HELP[role]}</p>
        {isSelf && <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mt-1">Ese es tu propio mail.</p>}
        {alreadyMember && <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mt-1">Esa persona ya tiene acceso.</p>}

        {justInvited && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 space-y-2">
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
              Listo. Ahora avisale a {justInvited.email} que entre a la app con ese mail.
            </p>
            <a
              href={whatsappInviteUrl(justInvited.email, justInvited.role, complexName)}
              target="_blank"
              rel="noreferrer"
              className={waBtn}
            >
              <MessageCircle className="w-4 h-4" /> Avisarle por WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className={card}>
        <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-[#E67E22]" /> Con acceso ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-2">Todavía no entró nadie de tu equipo.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-200 dark:divide-zinc-800">
            {members.map((m) => (
              <li key={m.uid} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{m.name || m.email}</p>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                    {STAFF_ROLE_LABEL[m.role]} · {m.email}
                  </p>
                </div>
                {confirmRemove === m.uid ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-white">¿Quitar acceso?</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(m)}
                      className="text-sm font-bold px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
                    >
                      Sí, quitar
                    </button>
                    <button type="button" onClick={() => setConfirmRemove(null)} className={ghostBtn}>
                      No
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmRemove(m.uid)} className={ghostBtn}>
                    <Trash2 className="w-4 h-4" /> Quitar acceso
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {invites.length > 0 && (
        <div className={card}>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Invitaciones sin aceptar ({invites.length})</h3>
          <ul className="mt-3 divide-y divide-stone-200 dark:divide-zinc-800">
            {invites.map((inv) => (
              <li key={inv.email} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{inv.email}</p>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{STAFF_ROLE_LABEL[inv.role]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={whatsappInviteUrl(inv.email, inv.role, complexName)} target="_blank" rel="noreferrer" className={waBtn}>
                    <MessageCircle className="w-4 h-4" /> Avisar
                  </a>
                  <button type="button" onClick={() => handleCancelInvite(inv)} className={ghostBtn}>
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
