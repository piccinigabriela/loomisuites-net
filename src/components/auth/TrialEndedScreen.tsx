import React from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';

interface TrialEndedScreenProps {
  email: string;
  onSignOut: () => void;
  /** true si tenía un plan pago que venció (o se suspendió); false si terminó la prueba gratis */
  paused?: boolean;
  /** Mi plan: cómo pagar para volver a usar la app */
  planSlot?: React.ReactNode;
}

export const TrialEndedScreen: React.FC<TrialEndedScreenProps> = ({ email, onSignOut, paused, planSlot }) => (
  <div className="min-h-screen w-full bg-[#0B0F17] text-white">
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <div className="space-y-3">
        <div className="text-lg font-bold">
          Loomi <span className="text-[#F0A46F]">Suite</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{paused ? 'Tu cuenta está en pausa' : 'Tu prueba gratis terminó'}</h1>
        <p className="flex items-start gap-2 text-base font-medium text-stone-100">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          Tus datos están guardados y seguros. Cuando confirmemos el pago, todo vuelve a funcionar como antes.
        </p>
      </div>

      {planSlot && <div className="dark rounded-3xl bg-[#101114] border border-zinc-800 p-5 sm:p-6">{planSlot}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-base font-medium text-stone-100">
        <span className="truncate max-w-[60%]" title={email}>
          {email}
        </span>
        <button type="button" onClick={onSignOut} className="inline-flex items-center gap-2 font-bold hover:text-rose-300 cursor-pointer">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </main>
  </div>
);
