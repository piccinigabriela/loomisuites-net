import React from 'react';

/**
 * Texto de la landing para quien no ejecuta JavaScript (buscadores, asistentes de IA, vistas previas).
 * Se arma al compilar (scripts/prerender.mjs) y va dentro de index.html; cuando carga la app, la landing de siempre lo reemplaza.
 * Dice lo mismo que la landing y la demo: si cambia una función o un plan, actualizá también este texto.
 * Precios: no se repiten acá (están en la sección Planes), para que no queden desactualizados.
 */
const FEATURES: Array<[string, string]> = [
  ['Calendario único', 'Reúne en una pantalla las reservas de Airbnb, Booking.com y las reservas directas. Se sincroniza por iCal cada 15 minutos (no es instantáneo) y avisa si dos reservas se superponen.'],
  ['Pagos y saldos', 'Cada estadía muestra lo cobrado, la seña y el saldo pendiente. Incluye caja, gastos y el rendimiento mensual del complejo.'],
  ['Guía digital del huésped', 'Una página propia de cada alojamiento con cómo llegar, Wi-Fi, horarios, normas y recomendaciones, y pre check-in online. Con títulos en español, inglés y portugués.'],
  ['Mensajes de WhatsApp listos', 'Textos preparados para cada momento de la estadía (confirmación, llegada, check-out, pedido de reseña). Se abren listos en WhatsApp y se envían con un toque. Cada complejo puede editarlos, por idioma.'],
  ['Limpieza y equipo', 'Agenda de limpiezas con checklist desde el celular. El personal de Recepción y de Limpieza entra con su propia cuenta y ve solo lo que le corresponde.'],
  ['Tarifas', 'Precios por tipo de alojamiento, temporada, fin de semana y fin de semana largo.'],
  ['Tu Web', 'Página propia de reservas directas con fotos, disponibilidad al día y precio de la estadía. El pedido llega por WhatsApp con los datos armados. En español, inglés y portugués.'],
  ['Liquidación al propietario', 'Para quien administra departamentos de terceros: reporte mensual con la comisión de administración descontada.'],
  ['Xenia, asistente con IA', 'Responde consultas sobre la operación del complejo dentro de la app.'],
];

const FAQ: Array<[string, string]> = [
  ['¿Reemplaza a Airbnb o Booking.com?', 'No. Seguís recibiendo reservas en esos portales; Loomi Suite sincroniza los calendarios por iCal (cada 15 minutos) para evitar reservas dobles y las muestra juntas.'],
  ['¿Necesito cerraduras inteligentes?', 'No. Funciona con la llave de siempre; la forma de ingresar se explica en la guía digital del huésped.'],
  ['¿Cuánto dura la prueba?', '7 días gratis desde que se crea la cuenta en app.loomisuite.net. La demo con datos de ejemplo se puede usar sin registrarse.'],
  ['¿Cobra comisión por reserva?', 'No. Los huéspedes pagan directamente al anfitrión; Loomi Suite no interviene en esos cobros.'],
  ['¿Hay una web propia de reservas directas?', 'Sí: "Tu Web". El huésped elige fechas, ve qué unidades están libres y el precio de la estadía según tus tarifas, y te manda el pedido por WhatsApp. No cobra ni confirma sola: el anfitrión confirma y cobra directo, sin comisiones.'],
];

export const LandingSeoContent: React.FC = () => (
  <section id="resumen" aria-label="Resumen de Loomi Suite" style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, color: '#1c1917', background: '#ffffff' }}>
    <h1>Loomi Suite: sistema de gestión para cabañas, departamentos temporarios, glampings y domos</h1>
    <p>
      Loomi Suite es un sistema de gestión (PMS) para alojamientos chicos de Argentina y Latinoamérica: complejos de cabañas, departamentos temporarios, glampings, domos y posadas. Está en español y se usa desde el navegador, en computadora o celular. No está pensado para grandes cadenas ni inmobiliarias con cientos de unidades.
    </p>
    <h2>Qué incluye</h2>
    <ul>
      {FEATURES.map(([title, text]) => (
        <li key={title}>
          <strong>{title}.</strong> {text}
        </li>
      ))}
    </ul>
    <h2>Planes y prueba gratis</h2>
    <p>
      Hay dos planes mensuales en pesos argentinos, sin comisión por reserva: uno para propietarios que atienden solos y otro para complejos con personal de recepción y limpieza. Los valores vigentes están en la sección Planes de <a href="https://loomisuite.net/">loomisuite.net</a>. La prueba es gratis por 7 días.
    </p>
    <h2>Preguntas frecuentes</h2>
    {FAQ.map(([q, a]) => (
      <div key={q}>
        <h3>{q}</h3>
        <p>{a}</p>
      </div>
    ))}
    <h2>Probar y contactar</h2>
    <ul>
      <li><a href="https://loomisuite.net/demo">Demo interactiva con datos de ejemplo</a>, sin registrarse.</li>
      <li><a href="https://app.loomisuite.net/">Crear cuenta o ingresar</a>.</li>
      <li><a href="https://loomisuite.net/manual">Manual gratuito de hospitalidad</a>: las 6 normas de oro del anfitrión.</li>
      <li><a href="https://loomisuite.net/manual?m=fotos">Manual gratuito de fotografía</a>: fotos de alojamientos con el celular o con cámara.</li>
      <li>WhatsApp: +54 9 11 4092-5939. Email: contacto@loomisuite.net.</li>
    </ul>
  </section>
);
