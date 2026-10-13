import React from 'react';
import {
  Sparkles,
  Laptop,
  Building2,
  Home,
  Calendar,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Bot,
  ArrowRight,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const steps = [
    {
      num: '1',
      title: 'Tu complejo',
      desc: 'nombre, dirección, horarios de check-in y check-out.',
      icon: Building2,
    },
    {
      num: '2',
      title: 'Tus unidades',
      desc: 'cada cabaña o departamento, con su capacidad, wifi y fotos.',
      icon: Home,
    },
    {
      num: '3',
      title: 'Tus calendarios',
      desc: 'conectá Airbnb y Booking para que nunca se superpongan reservas.',
      icon: Calendar,
    },
    {
      num: '4',
      title: 'Tus reservas',
      desc: 'cargá las que ya tenés tomadas, o mandanos tu planilla y te las cargamos nosotros.',
      icon: CheckCircle2,
    },
    {
      num: '5',
      title: 'La guía de tus huéspedes',
      desc: 'revisá lo que van a ver al llegar y los mensajes de WhatsApp.',
      icon: BookOpen,
    },
    {
      num: '6',
      title: 'Tu día a día',
      desc: 'el Panel Hoy te muestra entradas, salidas, limpiezas y cobros.',
      icon: Clock,
    },
  ];

  const waHelpUrl = `https://wa.me/5491140925939?text=${encodeURIComponent(
    'Hola, necesito ayuda con la configuración de mi complejo en Loomi Suite.'
  )}`;

  return (
    <div className="min-h-screen w-full bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-sans antialiased flex flex-col justify-center items-center p-4 sm:p-8 selection:bg-[#E67E22] selection:text-white transition-colors py-12">
      <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header Header Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#E67E22] dark:text-amber-400 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Loomi Suite • Prueba Gratis 7 Días</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Te damos la bienvenida a Loomi Suite
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Qué bueno tenerte acá. Durante los próximos 7 días vas a poder usar todo, sin límites.
          </p>
        </div>

        {/* Destacado: Recomendación Computadora */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 shadow-sm">
          <Laptop className="w-5 h-5 text-[#E67E22] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 dark:text-amber-100">
              Te recomendamos hacer esta primera configuración desde una computadora.
            </span>{' '}
            Es más cómodo para cargar datos y fotos. Después, el día a día lo manejás tranquilo desde el celular.
          </div>
        </div>

        {/* Lista de Pasos */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-5 sm:p-7 border border-stone-200/80 dark:border-zinc-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-mono flex items-center gap-2">
            <span>Te proponemos este orden para dejar tu complejo funcionando:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {steps.map((s) => {
              const IconComp = s.icon;
              return (
                <div
                  key={s.num}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 flex items-start gap-3 transition-colors hover:border-amber-500/40"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#E67E22]/15 text-[#E67E22] font-black text-xs flex items-center justify-center shrink-0">
                    {s.num}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 dark:text-zinc-100 block text-xs flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-[#E67E22]" />
                      {s.title}
                    </span>
                    <p className="text-stone-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      — {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ayuda y Asistencia */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-stone-200/80 dark:border-zinc-800 shadow-md space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
            <HelpCircle className="w-4 h-4 text-[#E67E22]" />
            <h3>¿Te trabás en algún paso?</h3>
          </div>

          <ul className="space-y-2.5 text-stone-600 dark:text-zinc-300">
            <li className="flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Preguntale a <strong>Xenia, tu asistente</strong>. La encontrás abajo a la derecha (el círculo con su foto) o en el menú, en "Asistente Xenia". Para hablar con Xenia por voz argentina, usá Microsoft Edge.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              <span>
                O escribinos por WhatsApp:{' '}
                <a
                  href={waHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  estamos para ayudarte.
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E67E22] hover:bg-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Empezar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
