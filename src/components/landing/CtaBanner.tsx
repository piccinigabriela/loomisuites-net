import React from 'react';
import { Play, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface CtaBannerProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-6 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Puesta en marcha en 15 minutos</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          ¿Listo para ordenar tus cabañas y habitaciones sin sistemas pesados?
        </h2>

        <p className="mt-4 text-base sm:text-xl text-rose-100 max-w-2xl mx-auto font-normal">
          Pasa del cuaderno o Excel a un rack ágil sincronizado con Booking y Airbnb. Prueba la demo interactiva en 1 segundo y comprueba lo simple que es.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-bold text-rose-700 bg-white hover:bg-zinc-100 active:scale-98 px-8 py-4 rounded-xl shadow-xl transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-rose-600" />
            <span>Probar la Demo Interactiva Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-white bg-black/20 hover:bg-black/30 border border-white/30 px-6 py-4 rounded-xl transition-all cursor-pointer"
          >
            Hablar con un Especialista
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-rose-100 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Sin tarjeta ni suscripción previa
          </span>
          <span>•</span>
          <span>Datos de ejemplo interactivos en localStorage</span>
        </div>
      </div>
    </section>
  );
};
