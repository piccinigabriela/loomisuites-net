import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const PainVersusGain: React.FC = () => {
  const pains = [
    'Doble reserva (overbooking) de una cabaña en temporada alta: tener que reubicar a una familia y pagar multas.',
    'Llevar las reservas en un cuaderno o Excel que no puedes consultar ni actualizar cuando estás recorriendo el predio.',
    'La mucama no sabe qué cabaña preparar primero ni cuántas camas armar porque los mensajes se pierden en WhatsApp.',
    'Pagar 18% a 20% de comisión a las plataformas cuando un huésped recurrente quiere volver el próximo fin de semana.',
    'Sistemas hoteleros tradicionales o de inmobiliarias incomprensibles, con 200 botones que jamás vas a necesitar.',
  ];

  const gains = [
    'Sincronización automática entre Booking, Airbnb y reservas directas: Cero dobles reservas.',
    'Rack visual en tu celular: miras en 2 segundos qué cabañas o habitaciones están ocupadas, libres o sucias.',
    'Gestión de limpieza y mucamas con checklist por unidad: sábanas, toallas, leña y control en un clic.',
    'Página propia de reservas directas con seña para ahorrar comisiones y ganar hasta 20% más por noche.',
    'Simplicidad total estilo BananaDesk: listo para usar en 15 minutos sin técnicos ni manuales de 100 páginas.',
  ];

  return (
    <section className="py-20 bg-zinc-50 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            La transformación en tu complejo o posada
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            Dejar el cuaderno y el Excel para tener el control total en tu celular
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            La diferencia entre vivir estresado respondiendo mensajes y gestionar tus cabañas o habitaciones con serenidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pain Column */}
          <div className="bg-white rounded-2xl p-7 border border-red-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-400" />
            <div className="flex items-center gap-2.5 mb-6 text-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-zinc-900">El Caos del Cuaderno y Sistemas Antiguos</h3>
            </div>
            <ul className="space-y-4">
              {pains.map((pain, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gain Column */}
          <div className="bg-white rounded-2xl p-7 border border-emerald-300 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
            <div className="flex items-center gap-2.5 mb-6 text-emerald-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-zinc-900">Con Loomi Suite Ágil y Visual</h3>
            </div>
            <ul className="space-y-4">
              {gains.map((gain, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{gain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
