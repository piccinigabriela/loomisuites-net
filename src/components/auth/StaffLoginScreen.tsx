/**
 * Ingreso del equipo con usuario y clave (sin mail): app.loomisuite.net/?equipo={código del complejo}.
 * El usuario y la clave los crea el dueño en Administración → Equipo y accesos (ver src/lib/staffUsers.ts).
 */
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../../lib/firebase';
import { cleanAlias, cleanUsername, staffEmail } from '../../lib/staffUsers';

export const StaffLoginScreen: React.FC<{ alias: string; onOwnerLogin: () => void }> = ({ alias: initialAlias, onOwnerLogin }) => {
  const [alias, setAlias] = useState(cleanAlias(initialAlias));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasAlias = Boolean(cleanAlias(initialAlias));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const u = cleanUsername(username);
    const a = cleanAlias(alias);
    if (!a) return setError('Falta el código del complejo: está en el link que te mandaron.');
    if (!u || !password) return setError('Escribí tu usuario y tu clave.');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, staffEmail(u, a), password);
    } catch (err: any) {
      const code = String(err?.code || '');
      setError(
        code.includes('too-many-requests')
          ? 'Demasiados intentos. Esperá unos minutos y probá de nuevo.'
          : code.includes('network')
          ? 'No hay conexión. Revisá internet y probá de nuevo.'
          : 'Usuario o clave incorrectos. Revisalos en el mensaje que te mandaron.'
      );
      setBusy(false);
    }
  };

  const input =
    'w-full min-h-[52px] px-4 rounded-2xl bg-[#0B0F17] border border-slate-600 text-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E67E22]';

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-white flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg viewBox="0 0 1000 1000" className="w-10 h-10" aria-hidden="true">
            <rect width="1000" height="1000" rx="220" fill="#0B0F17" />
            <path d="M 809.3 385 A 330 330 0 1 1 612.9 189.9" fill="none" stroke="#EFECE5" strokeWidth="110" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-bold">
            Loomi <span className="text-[#E67E22]">Suite</span>
          </span>
        </div>

        <form onSubmit={submit} className="bg-[#121622] border border-slate-700 rounded-3xl p-7 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Entrá a tu trabajo</h1>
            <p className="mt-1 text-base text-slate-100">Con el usuario y la clave que te dieron.</p>
          </div>

          {!hasAlias && (
            <label className="block space-y-1.5">
              <span className="text-sm font-bold">Código del complejo</span>
              <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="ej: catalinas-x7k2" className={input} autoCapitalize="none" autoComplete="off" />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-bold">Usuario</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: rosa"
              className={input}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold">Clave</span>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${input} pr-14`}
                autoCapitalize="none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-100 cursor-pointer"
                aria-label={show ? 'Ocultar clave' : 'Ver clave'}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </label>

          {error && <p className="text-base font-semibold text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[56px] rounded-2xl bg-[#E67E22] hover:bg-[#d35400] text-[#111] text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {busy && <Loader2 className="w-5 h-5 animate-spin" />}
            Entrar
          </button>

          <p className="text-sm text-slate-100 text-center">
            Si te olvidaste la clave, pedile una nueva a quien te dio el usuario.
          </p>
        </form>

        <button type="button" onClick={onOwnerLogin} className="mt-6 w-full text-center text-sm font-semibold text-[#F5A35C] underline underline-offset-4 cursor-pointer">
          Soy dueño o tengo cuenta con mail
        </button>
      </div>
    </div>
  );
};
