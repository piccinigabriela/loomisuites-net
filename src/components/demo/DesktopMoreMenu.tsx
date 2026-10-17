import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface MoreItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  /** Texto suelto (por ejemplo el mail de la cuenta), sin acción */
  note?: boolean;
}

/** Botón "Más" (tres puntitos) que junta lo que se usa poco, para dejar la barra limpia. */
export const DesktopMoreMenu: React.FC<{ items: MoreItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="min-h-[40px] px-3 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-50 text-[14px] font-semibold flex items-center gap-2 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
      >
        <MoreHorizontal className="w-5 h-5" aria-hidden />
        <span>Más</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-50 min-w-[260px] bg-white dark:bg-[#1A1B20] border border-stone-300 dark:border-zinc-600 rounded-2xl shadow-xl p-2 flex flex-col">
          {items.map((i) =>
            i.note ? (
              <div key={i.label} className="px-3.5 py-2 text-[14px] font-medium text-stone-700 dark:text-stone-200 truncate">{i.label}</div>
            ) : (
              <button
                key={i.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  i.onClick();
                }}
                className={`min-h-[44px] px-3.5 rounded-xl text-left text-[15px] font-semibold cursor-pointer ${
                  i.danger
                    ? 'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-stone-900 dark:text-stone-50 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {i.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
