/**
 * loomisuite.net/funciones: todo lo que hace Loomi, en una página liviana (sin la app).
 * Es la versión pública de la lista de prestaciones. Si se suma, cambia o se saca una función, actualizarla acá
 * (y los precios, si cambian: también están en la landing y en Xenia).
 */
import React, { useEffect } from 'react';
import {
  ArrowRight,
  Ban,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  Globe,
  MessageCircle,
  Play,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  SprayCan,
  Users,
} from 'lucide-react';

type Block = { icon: React.ElementType; title: string; items: React.ReactNode[] };

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;

const BLOCKS: Block[] = [
  {
    icon: CalendarDays,
    title: 'Reservas',
    items: [
      <><B>Hoy:</B> quién llega, quién se va, quién está alojado y qué falta cobrar. Ingresos y salidas con un toque.</>,
      <><B>Nueva reserva:</B> el precio sale solo de tus tarifas. Sumás descuento, early check-in, late check-out, opcionales y notas.</>,
      <><B>Calendario de ocupación:</B> todas las unidades por día, con colores por Airbnb, Booking, directo y VRBO.</>,
      <><B>Lista de reservas:</B> buscador por huésped, unidad o teléfono, filtros, exportación a Excel e impresión.</>,
      <><B>Cobros:</B> seña, saldo y estado de pago de cada reserva.</>,
      <><B>Importar:</B> tus reservas desde Excel, CSV o un archivo de calendario, con vista previa antes de guardar.</>,
    ],
  },
  {
    icon: RefreshCw,
    title: 'Calendarios conectados',
    items: [
      'Se conecta con Airbnb, Booking, otros portales y Google Calendar por iCal.',
      'Se sincroniza cada 15 minutos más o menos, aunque nadie tenga la app abierta. No es instantáneo.',
      'Te avisa si dos reservas se superponen.',
      'Loomi publica su propio calendario para que los portales bloqueen las fechas ocupadas.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Para tus huéspedes',
    items: [
      <><B>Guía digital:</B> cómo llegar, Wi-Fi, horarios, normas, cómo es el ingreso y recomendaciones.</>,
      <><B>Pre check-in online:</B> el huésped carga sus datos desde el celular y te llega un aviso en la app.</>,
      <><B>Cartel con QR</B> por unidad, listo para imprimir.</>,
      'En español, inglés y portugués.',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Mensajes por WhatsApp',
    items: [
      '5 mensajes listos: confirmación, día de llegada, control de confort, check-out y pedido de reseña.',
      'En español, inglés y portugués, y los podés editar. Se abren listos y se envían con un toque: no salen solos.',
      'Avisos al equipo: le mandás a limpieza o mantenimiento quién llega.',
    ],
  },
  {
    icon: Globe,
    title: 'Tu Web de reservas directas',
    items: [
      'Tu página en loomisuite.net/web/tu-lugar, con fotos, buscador de fechas y precio según tus tarifas.',
      'El huésped pide la reserva por WhatsApp y vos confirmás. Sin comisiones.',
      <><B>Seña para reservar:</B> la web avisa el porcentaje y lo suma al pedido; vos pasás tus datos al confirmar.</>,
      'Experiencias para sumar al pedido: excursiones, catas, cabalgatas.',
      <>3 estilos incluidos y 6 diseños especiales. <a href="/disenos" className="font-semibold text-[#F5A35C] underline underline-offset-4">Miralos acá</a>.</>,
    ],
  },
  {
    icon: SprayCan,
    title: 'Limpieza',
    items: [
      'Cada salida genera su limpieza, con checklist.',
      'Quien limpia entra con su cuenta y ve solo lo suyo: sin teléfonos ni importes.',
      'Ve las entradas y salidas de la semana, con la hora de llegada que avisó el huésped.',
      'Notas de ida y vuelta: "falta papel", "la canilla gotea", con aviso en la app.',
    ],
  },
  {
    icon: Users,
    title: 'Tu equipo',
    items: [
      'Cuentas para Recepción y Limpieza: cada persona entra con su mail y ve lo que le toca.',
      'Las invitás desde la app y les avisás por WhatsApp con un toque.',
    ],
  },
  {
    icon: BarChart3,
    title: 'Administración',
    items: [
      <><B>Tarifas:</B> normal, por temporada, de fin de semana y fines de semana largos de Argentina ya cargados.</>,
      <><B>Gastos y caja</B>, y caja de mostrador para Recepción.</>,
      <><B>Rendimiento</B> por unidad y por mes.</>,
      <><B>Informe para el propietario</B>, con la comisión del administrador si corresponde.</>,
      <><B>Unidades:</B> de a una o varias juntas, con fotos, Wi-Fi y calendarios.</>,
    ],
  },
  {
    icon: ShoppingBag,
    title: 'Opcionales y extras',
    items: ['Catálogo de servicios para vender: traslados, desayuno, excursiones, con su precio.'],
  },
  {
    icon: Bot,
    title: 'Xenia, tu asistente',
    items: [
      'Responde dudas de uso de la app.',
      'Te dice qué está libre en tus fechas, cómo viene la ocupación o cuánto entró en el mes.',
      'Te puede contestar con voz.',
      <><B>Para tus huéspedes:</B> si la activás, responde en tu guía y en Tu Web, en español, inglés y portugués, con lo que cargaste. Pagos, cambios y lo que no sabe te lo pasa por WhatsApp. Incluye 1.000 conversaciones por mes; si necesitás más, 1.000 extra por USD 10 por mes, solo si las pedís.</>,
    ],
  },
  {
    icon: Smartphone,
    title: 'En todos lados',
    items: ['Funciona en el celular y en la compu, con modo claro y oscuro.', 'Prueba gratis de 7 días, sin tarjeta.'],
  },
];

const NOT_YET = [
  'No emite facturas.',
  'No cobra online: la seña y los pagos se hacen por transferencia o como acuerdes con tu huésped.',
  'No tiene channel manager instantáneo: la conexión con los portales es por iCal (está en desarrollo).',
  'No trabaja con cerraduras inteligentes: funciona con llaves comunes.',
];

const CTA: React.FC = () => (
  <div className="flex flex-col sm:flex-row gap-3">
    <a
      href="/demo"
      className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-[#E67E22] hover:bg-[#d35400] text-[#111] text-base font-bold"
    >
      <Play className="w-4 h-4 fill-current" /> Probar la demo
    </a>
    <a
      href="https://app.loomisuite.net"
      className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl border-2 border-[#E67E22] text-white text-base font-bold hover:bg-white/5"
    >
      Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
    </a>
  </div>
);

export const FeaturesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Todo lo que hace Loomi · Loomi Suite';
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-stone-100 font-normal">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center justify-between gap-4">
        <a href="/" className="text-xl font-light tracking-widest text-white">
          loomi<span className="font-semibold text-[#E67E22]">suite</span>
        </a>
        <a href="/demo" className="text-sm font-bold text-[#F5A35C] underline underline-offset-4">
          Probar la demo
        </a>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <section className="pt-16 pb-14 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Todo lo que hace Loomi</h1>
          <p className="mt-5 text-lg sm:text-xl leading-relaxed text-stone-100">
            Para cabañas, departamentos y posadas de 4 a 20 unidades. Reservas, calendarios, huéspedes, limpieza y números,
            desde el celular. Sin comisiones por reserva.
          </p>
          <div className="mt-8">
            <CTA />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {BLOCKS.map(({ icon: Icon, title, items }) => (
            <article key={title} className="rounded-3xl bg-[#121826] border border-white/10 p-6 sm:p-8">
              <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="w-10 h-10 rounded-xl bg-[#E67E22]/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#F5A35C]" />
                </span>
                {title}
              </h2>
              <ul className="mt-5 space-y-3">
                {items.map((it, i) => (
                  <li key={i} className="flex gap-3 text-base leading-relaxed text-stone-100">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#E67E22] shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-[#121826] border border-white/10 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Planes</h2>
            <div className="mt-6 space-y-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-lg font-bold text-white">Loomi</p>
                  <p className="text-base text-stone-200">Hasta 5 unidades, para dueños sin personal</p>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums shrink-0">USD 30</p>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-white">Loomi Suite</p>
                  <p className="text-base text-stone-200">Con cuentas para Recepción y Limpieza</p>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums shrink-0">USD 45</p>
              </div>
            </div>
            <p className="mt-6 text-base text-stone-100">
              Por mes, todo el complejo. Se paga en pesos al dólar MEP del día, o en dólares por Payoneer con 10% de descuento.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Lo que todavía no hace</h2>
            <p className="mt-2 text-base text-stone-200">Preferimos que lo sepas antes de empezar.</p>
            <ul className="mt-5 space-y-3">
              {NOT_YET.map((t) => (
                <li key={t} className="flex gap-3 text-base leading-relaxed text-stone-100">
                  <Ban className="w-4 h-4 mt-1 text-stone-300 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-[#E67E22]/10 border border-[#E67E22]/30 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Probala con datos de ejemplo</h2>
            <p className="mt-2 text-base text-stone-100">Sin registrarte. Cuando quieras, creás tu cuenta y tenés 7 días gratis.</p>
          </div>
          <CTA />
        </section>

        <footer className="mt-16 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-stone-200">
          <a href="/" className="hover:text-white">loomisuite.net</a>
          <a href="/privacidad" className="hover:text-white">Privacidad</a>
          <a href="/terminos" className="hover:text-white">Términos</a>
          <a href="mailto:contacto@loomisuite.net" className="hover:text-white">contacto@loomisuite.net</a>
        </footer>
      </main>
    </div>
  );
};
