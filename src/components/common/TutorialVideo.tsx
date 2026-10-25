/**
 * Video tutorial de Loomi (YouTube, "no listado"): un botón que lo abre en una ventana encima de la página.
 * Se usa en la bienvenida de la demo, en el panel "Cómo funciona" y en la landing.
 * Para cambiar el video: el id de YouTube en TUTORIAL_VIDEO_ID. Vacío = no se muestra ningún botón.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';

export const TUTORIAL_VIDEO_ID = 'PcUY4rkpnkc';
export const TUTORIAL_VIDEO_LENGTH = '4 min';

const TutorialVideoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    // En captura y frenando a los demás: Escape cierra solo el video, no la ventana que está debajo
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/80 flex justify-center p-3 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-5xl my-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Video: cómo funciona Loomi">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold cursor-pointer"
          >
            <X className="w-5 h-5" /> Cerrar
          </button>
        </div>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
            title="Cómo funciona Loomi Suite"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

type Props = {
  label?: string;
  className?: string;
};

export const TutorialVideoButton: React.FC<Props> = ({ label = 'Ver cómo funciona', className }) => {
  const [open, setOpen] = useState(false);
  if (!TUTORIAL_VIDEO_ID) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          className ||
          'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border-2 border-[#A94F12] dark:border-[#F0A46F] text-[#A94F12] dark:text-[#F0A46F] font-bold text-sm bg-transparent hover:bg-orange-50 dark:hover:bg-zinc-800 cursor-pointer'
        }
      >
        <Play className="w-4 h-4 fill-current" />
        <span>
          {label} ({TUTORIAL_VIDEO_LENGTH})
        </span>
      </button>
      {open && <TutorialVideoModal onClose={() => setOpen(false)} />}
    </>
  );
};
