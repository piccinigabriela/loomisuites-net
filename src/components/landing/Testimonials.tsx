import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Gonzalo Marecos',
      role: 'B&B Cascada Verde (Sierras)',
      propertiesCount: '4 habitaciones privadas',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      metric: 'Cero overbookings en 18 meses',
      text: 'Antes vivía pegado al teléfono bloqueando el cuaderno a mano cada vez que me entraba una reserva en Booking o Airbnb. Con Loomi Suite, la sincronización es instantánea y recuperé la paz los fines de semana.',
    },
    {
      name: 'Lucía Fernández',
      role: 'Complejo Cabañas del Bosque',
      propertiesCount: '5 cabañas turísticas',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      metric: '+$1.400 USD/mes en reservas directas',
      text: 'Buscaba algo simple para mis cabañas sin tener que contratar sistemas hoteleros gigantescos que me cobraban fortunas. Loomi Suite es justo lo necesario: reservas directas por WhatsApp y calendario ordenado.',
    },
    {
      name: 'Matías Rossi',
      role: 'Posada Colonial & Apart Suites',
      propertiesCount: '8 habitaciones y aparts sencillos',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      metric: '10 horas ahorradas por semana',
      text: 'Lo que más me gusta es la limpieza y los códigos de acceso. El personal ve qué habitación toca limpiar sin aplicaciones raras y los huéspedes reciben su clave en el celular. Cero complicaciones.',
    },
  ];

  return (
    <section className="py-20 bg-zinc-50 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Casos Reales
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            La herramienta preferida para alojamientos independientes
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Descubre por qué anfitriones de departamentos, cabañas y pequeños hostales eligen la simplicidad de Loomi Suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4 border border-emerald-200">
                  {t.metric}
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{t.name}</h4>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                  <span className="text-[11px] font-medium text-rose-600">{t.propertiesCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
