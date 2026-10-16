import React, { useState } from 'react';
import { Building2, LogOut, MailCheck, UserCheck } from 'lucide-react';
import type { User } from 'firebase/auth';
import { acceptInvite, declineInvite, Invite, Membership, STAFF_ROLE_LABEL } from '../../lib/team';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-[#0B0F17] text-white flex flex-col">
    <header className="w-full px-6 py-6 max-w-3xl mx-auto flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E67E22] to-amber-500 flex items-center justify-center">
        <Building2 className="w-5 h-5" />
      </div>
      <span className="text-lg font-bold tracking-tight">
        Loomi <span className="text-[#E67E22]">Suite</span>
      </span>
    </header>
    <main className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-md bg-[#121622] border border-slate-700 rounded-3xl p-7 sm:p-9 text-center space-y-6">
        {children}
      </div>
    </main>
  </div>
);

interface InviteAcceptScreenProps {
  user: User;
  invite: Invite;
  emailVerified: boolean;
  onAccepted: (membership: Membership) => void;
  onDeclined: () => void;
  onSignOut: () => void;
  onResendVerification: () => void;
  onCheckVerified: () => void;
}

/** Primera entrada de alguien invitado: acepta y queda fijo en su rol. */
export const InviteAcceptScreen: React.FC<InviteAcceptScreenProps> = ({
  user,
  invite,
  emailVerified,
  onAccepted,
  onDeclined,
  onSignOut,
  onResendVerification,
  onCheckVerified,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const role = STAFF_ROLE_LABEL[invite.role] || invite.role;
  const complex = invite.complexName || 'un complejo';

  const handleAccept = async () => {
    setBusy(true);
    setError('');
    try {
      onAccepted(await acceptInvite(user, invite));
    } catch (err) {
      console.warn('Error aceptando invitación:', err);
      setError('No se pudo aceptar. Probá de nuevo en un momento; si sigue, avisale a quien te invitó.');
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    setBusy(true);
    try {
      await declineInvite(user);
    } catch (err) {
      console.warn('Error rechazando invitación:', err);
    }
    onDeclined();
  };

  return (
    <Shell>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E67E22]/15 border border-[#E67E22]/40 text-[#F5A35C] flex items-center justify-center">
        <UserCheck className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Te invitaron a {complex}</h1>
        <p className="text-sm text-slate-200">
          Vas a entrar como <strong className="text-[#F5A35C]">{role}</strong> con tu cuenta {user.email}.
        </p>
      </div>

      {!emailVerified ? (
        <div className="space-y-3 text-left bg-sky-950/60 border border-sky-700 rounded-2xl p-4">
          <p className="text-sm text-sky-100 flex gap-2">
            <MailCheck className="w-5 h-5 shrink-0 text-sky-300" />
            <span>Antes de aceptar, confirmá tu correo con el link que te mandamos. Revisá también Spam.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResendVerification}
              className="px-3 py-2 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-sm font-semibold cursor-pointer"
            >
              Reenviar mail
            </button>
            <button
              type="button"
              onClick={onCheckVerified}
              className="px-3 py-2 rounded-xl bg-white text-sky-950 text-sm font-bold cursor-pointer"
            >
              Ya lo confirmé
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAccept}
          disabled={busy}
          className="w-full py-3.5 px-4 rounded-xl bg-[#E67E22] hover:bg-[#d35400] text-white font-bold text-base disabled:opacity-60 cursor-pointer"
        >
          {busy ? 'Entrando…' : `Entrar como ${role}`}
        </button>
      )}

      {error && <p className="text-sm text-rose-300 font-medium">{error}</p>}

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-700">
        <button
          type="button"
          onClick={handleDecline}
          disabled={busy}
          className="py-2 text-sm font-semibold text-slate-200 hover:text-white underline cursor-pointer"
        >
          No es para mí: quiero administrar mi propio complejo
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="py-2 text-sm font-semibold text-slate-200 hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>
    </Shell>
  );
};

/** El complejo del que forma parte no tiene el plan activo. */
export const StaffBlockedScreen: React.FC<{ complexName: string; onSignOut: () => void }> = ({ complexName, onSignOut }) => (
  <Shell>
    <h1 className="text-2xl font-semibold tracking-tight">{complexName || 'El complejo'} no está activo</h1>
    <p className="text-sm text-slate-200">
      La cuenta del complejo no tiene el plan activo, así que por ahora no podés entrar. Avisale a quien administra.
    </p>
    <button
      type="button"
      onClick={onSignOut}
      className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold cursor-pointer inline-flex items-center justify-center gap-2"
    >
      <LogOut className="w-4 h-4" /> Salir
    </button>
  </Shell>
);
