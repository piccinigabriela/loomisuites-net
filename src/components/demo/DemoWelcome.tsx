import React, { useEffect, useRef, useState } from 'react';

/** Bienvenida del demo: el mapa de la app en un minuto. Se muestra sola la primera vez. */

interface Props {
  onClose: (dontShowAgain: boolean) => void;
}

const BLOCKS: Array<{ title: string; line: string; items: string[] }> = [
  {
    title: 'Reservas',
    line: 'Todo lo que pasa con tus huéspedes.',
    items: ['Hoy / Estado', 'Ocupación (calendario)', 'Lista de reservas', 'Avisos y WhatsApp', 'Tu Web y Guía'],
  },
  {
    title: 'Limpieza',
    line: 'Que cada unidad esté lista a tiempo.',
    items: ['Agenda de limpiezas', 'Checklist por unidad'],
  },
  {
    title: 'Administración',
    line: 'Tus números y tu complejo.',
    items: ['Gastos y caja', 'Rendimiento financiero', 'Unidades y calendarios', 'Tarifas'],
  },
];

export const DemoWelcome: React.FC<Props> = ({ onClose }) => {
  const [dontShow, setDontShow] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    enterRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(dontShow);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dontShow, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-welcome-title"
        className="w-full max-w-[760px] my-auto bg-white dark:bg-[#18191E] border border-stone-300 dark:border-zinc-600 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col gap-7"
      >
        <header className="flex flex-col gap-2">
          <h2 id="demo-welcome-title" className="text-[28px] leading-tight font-bold text-stone-900 dark:text-white tracking-tight">
            Te damos la bienvenida a Loomi Suite
          </h2>
          <p className="text-[17px] font-medium text-stone-800 dark:text-stone-100">
            Un minuto para ver cómo está organizado todo, antes de entrar al demo.
          </p>
        </header>

        <div className="flex flex-wrap gap-4">
          {BLOCKS.map((b) => (
            <section key={b.title} className="flex-1 basis-[200px] min-w-0 rounded-2xl border border-stone-300 dark:border-zinc-600 bg-stone-50 dark:bg-[#1F2025] p-5 flex flex-col gap-2">
              <h3 className="text-[19px] font-bold text-stone-900 dark:text-white">{b.title}</h3>
              <p className="text-[15px] font-semibold text-stone-800 dark:text-stone-100">{b.line}</p>
              <ul className="mt-1 flex flex-col gap-1.5 text-[15px] font-medium text-stone-900 dark:text-stone-50">
                {b.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#A94F12] dark:bg-[#F0A46F] shrink-0" aria-hidden />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <ul className="flex flex-col gap-3 text-[16px] font-medium text-stone-900 dark:text-stone-50">
          <li>
            <strong className="font-bold">Los datos son de ejemplo:</strong> tocá todo sin miedo. Para empezar de nuevo, en <strong className="font-bold">Más</strong> elegí{' '}
            <strong className="font-bold">Restablecer demo</strong>.
          </li>
          <li>
            <strong className="font-bold">¿Querés saber más?</strong> El botón <strong className="font-bold">Cómo funciona</strong>, arriba a la derecha, explica cada parte y los planes.
          </li>
          <li>
            <strong className="font-bold">Xenia</strong>, el círculo de abajo a la derecha, responde tus dudas.
          </li>
        </ul>

        <footer className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-stone-300 dark:border-zinc-600">
          <label className="flex items-center gap-3 cursor-pointer text-[16px] font-semibold text-stone-900 dark:text-stone-50 min-h-[44px]">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="w-6 h-6 accent-[#A94F12] cursor-pointer"
            />
            <span>Entendido, no mostrar de nuevo</span>
          </label>
          <button
            ref={enterRef}
            type="button"
            onClick={() => onClose(dontShow)}
            className="min-h-[48px] px-7 rounded-xl bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] text-[17px] font-bold cursor-pointer hover:opacity-90"
          >
            Entrar al demo
          </button>
        </footer>
      </div>
    </div>
  );
};
