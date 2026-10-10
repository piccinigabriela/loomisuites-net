import React from 'react';
import { Building2, ShieldCheck, LogOut, MessageCircle, Mail } from 'lucide-react';

interface TrialEndedScreenProps {
  email: string;
  onSignOut: () => void;
}

export const TrialEndedScreen: React.FC<TrialEndedScreenProps> = ({ email, onSignOut }) => {
  const whatsappUrl = `https://wa.me/5491140925939?text=${encodeURIComponent(
    `Hola, quiero activar mi plan de Loomi Suite. Mi email: ${email}`
  )}`;

  const mailtoUrl = `mailto:contacto@loomisuite.net?subject=${encodeURIComponent(
    'Activar plan Loomi Suite'
  )}&body=${encodeURIComponent(
    `Hola, quiero activar mi plan de Loomi Suite. Mi email: ${email}`
  )}`;

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient background glow accents matching auth screen */}
      <div className="absolute top-[-15%] left-[20%] w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[550px] h-[550px] bg-[#E67E22]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar / Brand */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E67E22] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Loomi <span className="text-[#E67E22]">Suite</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Prueba Finalizada
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Tus datos están resguardados</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Glassmorphic */}
          <div className="bg-[#121622]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl relative text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                Tu prueba gratuita <span className="font-semibold text-amber-400">terminó</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                Tus datos están guardados y seguros. Para seguir usando Loomi Suite, escribinos y activamos tu plan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Activar plan por WhatsApp</span>
              </a>

              <a
                href={mailtoUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-medium text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>contacto@loomisuite.net</span>
              </a>
            </div>

            {/* User details and sign out */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span className="truncate max-w-[200px]" title={email}>
                {email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 max-w-7xl mx-auto text-center text-xs text-slate-600">
        <p>Loomi Suite • Sistema Operativo para Alojamientos Temporarios y Complejos Turísticos</p>
      </footer>
    </div>
  );
};
