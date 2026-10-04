import { DemoState } from '../../types';

export function getClientXeniaReply(message: string, demoState: DemoState): string {
  const q = message.toLowerCase();
  const properties = demoState.properties || [];
  const reservations = demoState.reservations || [];
  const cleaningTasks = demoState.cleaningTasks || [];

  // 1. WhatsApp, Mensajería, Plantillas y Blindaje Anti-Quejas (PRIORIDAD ALTA)
  if (
    q.includes('whatsapp') ||
    q.includes('mensaje') ||
    q.includes('mensajeria') ||
    q.includes('mensajería') ||
    q.includes('plantilla') ||
    q.includes('plantillas') ||
    q.includes('queja') ||
    q.includes('reseña') ||
    q.includes('resena') ||
    q.includes('viaje') ||
    q.includes('ruta') ||
    q.includes('blindaje') ||
    q.includes('comunicacion') ||
    q.includes('comunicación')
  ) {
    return `### 💬 WhatsApp y Blindaje Anti-Quejas en Loomi Suite

¡Hola! Te explico cómo funciona el sistema de mensajería inteligente y para qué sirve cada plantilla:

1. **📱 ¿Para qué sirven las 6 Plantillas Inteligentes?**
   - 👋 **Confirmación y Bienvenida (Día 1):** Envía el link a la Guía Digital del complejo con el mapa y recomendaciones locales.
   - 🚗 **Coordinación en Ruta / Día de Viaje:** Para coordinar el horario de llegada en viajes largos y pedir ubicación en tiempo real.
   - 🔑 **Acceso y Clave Wi-Fi:** Entrega la dirección exacta, el código de puerta/cerradura y los datos del Wi-Fi.
   - 🛡️ **Control de Confort (2hs Post-Ingreso):** Mensaje clave para chequear que todo esté impecable y desactivar reclamos en privado en 10 minutos, antes de que se conviertan en una mala reseña.
   - ⏰ **Recordatorio de Check-out:** Aviso cordial para coordinar la salida y las tareas de limpieza.
   - 🌟 **Solicitud de Reseña 5 Estrellas:** Enviado a los huéspedes satisfechos para que califiquen con 5 estrellas e invitarlos a reservar directo.

2. **⚡ Envío en 1 Toque:**
   - No tenés que escribir nada: las plantillas toman solas el nombre del huésped, su cabaña, sus fechas y el PIN de acceso.
   - Podés enviarlas desde la pestaña **"Avisos & WhatsApp"** o tocando el botón verde **"Chatear"** en la ficha de cualquier reserva.

3. **⭐ Filtro Inteligente:**
   - La pantalla oculta las reservas viejas y te muestra solo **"Próximas & Hoy"** o **"En Estadía"** para elegir al huésped en un segundo.`;
  }

  // 2. Precios, Planes y Métodos de Pago
  if (
    q.includes('precio') ||
    q.includes('cuanto cuesta') ||
    q.includes('cuánto cuesta') ||
    q.includes('abono') ||
    q.includes('transferencia') ||
    q.includes('cbu') ||
    q.includes('cvu') ||
    q.includes('alias') ||
    q.includes('banco') ||
    q.includes('mercado pago') ||
    q.includes('paypal') ||
    q.includes('stripe') ||
    q.includes('tarjeta') ||
    q.includes('ipc') ||
    q.includes('costo') ||
    ((q.includes('plan ') || q.includes('planes') || q.includes(' plan') || q === 'plan') &&
      !q.includes('plantilla') &&
      !q.includes('planilla')) ||
    (q.includes('tarifa') && !q.includes('manual') && !q.includes('ical'))
  ) {
    return `### 🏷️ Planes, Precios y Formas de Pago de Loomi

En Loomi tenemos **precios transparentes en pesos argentinos (ARS)** y ajustados por **IPC (inflación oficial)**, para que no tengas sobresaltos con el dólar:

- **Plan 4 a 10 Propiedades:** **$45.000 / mes** *(ideal para anfitriones y pequeños complejos)*.
- **Plan 10 a 20 Propiedades:** **$60.000 / mes** *(complejos medianos, aparts y posadas)*.
- **Plan 20 a 30 Propiedades:** **$80.000 / mes** *(operaciones profesionales de alto flujo)*.
- **Más de 30 Propiedades:** Cotización personalizada a medida.

**Formas de Pago y Cobro:**
- 💳 **Tu abono a Loomi:** Se abona mensualmente mediante **Transferencia Bancaria directa** (CBU/CVU o Alias) en Argentina, o por **PayPal** para el exterior. Sin comisiones extras ni intermediarios.
- 💰 **Cobros a tus Huéspedes:** Tus huéspedes te pagan directo a tus cuentas: podés vincular tu **Mercado Pago** (links de pago o QR, el estándar local más usado), transferencias por **CBU/Alias bancario** o **PayPal** para extranjeros. Loomi no retiene tus fondos.
- ✅ **Sin tarjeta para arrancar:** Probás la demo interactiva sin ingresar datos de pago.
- ✅ **Sin permanencia:** Podés pausar o dar de baja el servicio cuando quieras.
- ✅ **100% compatible con llaves físicas tradicionales:** No requiere cerraduras digitales ni cambiar puertas.
- 🧩 **Módulos Opcionales (Add-ons):** Quien necesite Cerraduras Digitales con PIN, Frigobar / Consumos extras o Turnos de Spa los activa de forma modular con costo diferencial.
- 🌐 **Dominio Propio para Motor Directo:** Opcional con pago directo a cargo del cliente (ej: \`reservas.tucabana.com.ar\`) con SSL incluido.
- 👥 **Modo Día a Día para Empleados:** Modo operativo restringido para que el personal atienda check-ins y limpieza sin ver ingresos ni finanzas.`;
  }

  // 2. Ingresos y Finanzas
  if (
    q.includes('ingreso') ||
    q.includes('facturacion') ||
    q.includes('facturación') ||
    q.includes('dinero') ||
    q.includes('cuanto gane') ||
    q.includes('cuánto gané') ||
    q.includes('plata') ||
    q.includes('recaud') ||
    q.includes('finanza') ||
    q.includes('comision') ||
    q.includes('comisión')
  ) {
    const totalGross = reservations.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalCommissions = reservations.reduce((acc, r) => acc + (r.commissionPaid || 0), 0);
    const totalNet = reservations.reduce((acc, r) => acc + (r.netRevenue || 0), 0);
    const totalNights = reservations.reduce((acc, r) => acc + (r.nights || 0), 0);
    const adr = totalNights > 0 ? Math.round(totalGross / totalNights) : 0;

    return `### 📊 Rendición Financiera de tu Negocio

Aquí tienes el balance operativo consolidado en tiempo real:

- 💵 **Facturación Bruta:** **$${totalGross.toLocaleString('en-US')} USD** (${reservations.length} reservas registradas).
- 🏷️ **Comisiones a Plataformas (OTAs):** **-$${totalCommissions.toLocaleString('en-US')} USD** (Airbnb, Booking, etc.).
- 💰 **Ingresos Netos Reales en Mano:** **$${totalNet.toLocaleString('en-US')} USD**.
- 📈 **Tarifa Promedio por Noche (ADR):** **$${adr} USD** sobre ${totalNights} noches vendidas.

*Resumen:* Cuentas con un flujo equilibrado entre canales con control preciso de ingresos netos.`;
  }

  // 3. Sincronización iCal, Conexión de Canales y Doble Reserva (PRIORIDAD ALTA)
  if (
    q.includes('conect') ||
    q.includes('vincul') ||
    q.includes('sincroniz') ||
    q.includes('ical') ||
    q.includes('airbnb') ||
    q.includes('arbnb') ||
    q.includes('arnb') ||
    q.includes('abnb') ||
    q.includes('airnb') ||
    q.includes('booking') ||
    q.includes('overbooking') ||
    ((q.includes('como') || q.includes('cómo')) && (q.includes('calendario') || q.includes('canal')))
  ) {
    if (
      q.includes('airbnb') ||
      q.includes('arbnb') ||
      q.includes('arnb') ||
      q.includes('abnb') ||
      q.includes('airnb') ||
      q.includes('conect') ||
      q.includes('vincul') ||
      q.includes('sincroniz') ||
      q.includes('como') ||
      q.includes('cómo') ||
      q.includes('paso')
    ) {
      return `### 🔄 Cómo conectar Airbnb y sincronizar calendarios sin dobles reservas

Para conectar tu anuncio de Airbnb con Loomi Suite y evitar cualquier overbooking, sigue estos 3 pasos simples:

1. **Obtener el enlace iCal de Airbnb:**
   - Entra a tu cuenta de anfitrión en **Airbnb**.
   - Ve a **Anuncios** ➔ Selecciona tu cabaña o depto ➔ **Precios y disponibilidad**.
   - Baja hasta **Sincronización del calendario** ➔ Toca **Exportar calendario** y copia el enlace que te da Airbnb (termina en \`.ics\`).

2. **Vincularlo en Loomi Suite:**
   - En tu panel de Loomi, ve a la pestaña **Cabañas & Habitaciones**.
   - En la tarjeta de la cabaña correspondiente, toca el botón **"Sincronizar Canales"** (o el lápiz ✏️).
   - Pega el enlace de Airbnb en el campo **URL iCal de Airbnb** y guarda.

3. **Copiar el enlace de Loomi hacia Airbnb:**
   - En esa misma pantalla de Loomi, copia tu enlace de exportación de Loomi.
   - En Airbnb, toca **Importar calendario** y pégalo ahí con el nombre *"Loomi Suite"*.

✅ **¡Listo!** A partir de ese momento, cada vez que entre una reserva en Airbnb, las fechas se bloquean en Loomi y en Booking en tiempo real.`;
    }

    return `### 🔄 Sincronización Oficial en Tiempo Real

Loomi Suite mantiene tu disponibilidad conectada de forma bidireccional:

- **Booking.com & Airbnb:** Conexión oficial directa para actualizar disponibilidad en menos de 3 segundos y sincronizar tarifas.
- **VRBO / Expedia:** Conexión iCal bidireccional incluida sin costos ocultos de API, además de soporte para cuentas profesionales.
- **Sin dobles reservas (Overbooking):** Cada bloqueo ingresado en un canal actualiza automáticamente el resto en segundos.`;
  }

  // 4. Huéspedes, Reservas y Ocupación
  if (
    q.includes('huesped') ||
    q.includes('huésped') ||
    q.includes('ocupad') ||
    q.includes('ocupacion') ||
    q.includes('ocupación') ||
    q.includes('reserva') ||
    q.includes('reservas') ||
    q.includes('disponib') ||
    q.includes('libre') ||
    q.includes('hoy') ||
    q.includes('checkin') ||
    q.includes('check in') ||
    q.includes('checkout') ||
    q.includes('check out') ||
    q.includes('early') ||
    q.includes('late') ||
    q.includes('llega') ||
    q.includes('sale') ||
    q.includes('calendario') ||
    q.includes('alojado') ||
    q.includes('pasajero')
  ) {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalProps = properties.length || 6;
    
    // Check-ins hoy y check-outs hoy
    const checkInsToday = reservations.filter((r) => r.checkIn === todayStr || r.checkIn <= todayStr && r.checkOut > todayStr);
    const checkOutsToday = reservations.filter((r) => r.checkOut === todayStr);
    const occupiedCount = Math.min(totalProps, reservations.filter((r) => r.status === 'confirmed' || r.status === 'checked_in').length);
    const occupancyRate = Math.round((occupiedCount / Math.max(1, totalProps)) * 100);

    const activeGuests = reservations.slice(0, 6);

    return `### 🛎️ Estado de Ocupación y Reservas en Tiempo Real

📊 **Resumen Operativo:**
- **Nivel de Ocupación:** **${occupancyRate}%** (${occupiedCount} de ${totalProps} unidades con estadías activas/confirmadas).
- **Total de Reservas en Sistema:** **${reservations.length} reservas registradas**.
- **Ingresos de Hoy (Check-in):** ${checkInsToday.length > 0 ? `${checkInsToday.length} ingresos programados` : 'Sin ingresos previstos para hoy'}.
- **Salidas de Hoy (Check-out):** ${checkOutsToday.length > 0 ? `${checkOutsToday.length} salidas previstas` : 'Sin salidas previstas para hoy'}.

📋 **Detalle de Reservas y Pasajeros:**
${activeGuests
  .map((r) => {
    const propName = properties.find((p) => p.id === r.propertyId)?.name || 'Cabaña';
    const earlyBadge = r.earlyCheckIn ? ' • ⏰ Early Check-in (10hs)' : '';
    const lateBadge = r.lateCheckOut ? ' • ⏰ Late Check-out (18hs)' : '';
    const discBadge = r.customDiscountPercent ? ` • 🏷️ Descuento: ${r.customDiscountPercent}%` : '';
    const feeBadge = r.airbnbFeeMode === 'traditional_3' ? ' (Airbnb 3% tradicional)' : '';
    return `- **${r.guestName}** en *${propName}*
  • Canal: **${r.platform.toUpperCase()}${feeBadge}** | Del **${r.checkIn}** al **${r.checkOut}** (${r.nights} noches)
  • Pago: **$${r.totalAmount} USD** (${r.paymentStatus === 'paid' ? '100% Abonado' : 'Seña pagada'})
  • Acceso: ${r.pinCode ? `PIN Teclado ${r.pinCode}` : 'Llave física en conserjería'}${earlyBadge}${lateBadge}${discBadge}`;
  })
  .join('\n\n')}

💡 *Tip:* Podés generar una nueva reserva con tarifas especiales o enviar la tarjeta de bienvenida por WhatsApp desde el Rack o la pestaña de Reservas.`;
  }

  // 4. Limpieza y Mucamas
  if (q.includes('limpieza') || q.includes('mucama') || q.includes('ropa') || q.includes('sabana') || q.includes('toalla')) {
    return `### 🧹 Módulo de Limpieza y Mucamas en el Celular

Así funciona la coordinación sin mensajes perdidos en WhatsApp:

1. Al concretarse un check-out, la unidad pasa automáticamente a estado **Pendiente (Sucia)** en tu rack.
2. Tu personal de limpieza tiene su enlace móvil propio (sin contraseñas) con el listado del día y checklist:
   - Sábanas y toallas limpias.
   - Sanitización de baños y reposición de amenities.
   - Comprobación de cerradura o llaves.
3. Cuando terminan, tocan **"Marcar como Lista"** y tu calendario pasa a verde de inmediato.`;
  }

  // 5. Precios manuales e iCal
  if (
    (q.includes('manual') || q.includes('tarifa') || q.includes('precio') || q.includes('bloquea')) &&
    (q.includes('ical') || q.includes('airbnb') || q.includes('booking') || q.includes('todas las reservas'))
  ) {
    return `### 💡 Sincronización por Calendario (iCal) y Tarifas Manuales

¡Es exactamente así! Cuando conectás calendarios mediante **enlaces iCal (.ics estándar)** con Airbnb, Booking, VRBO o Google:

1. **¿Qué datos viajan por iCal?**
   - ✅ **Fechas (Entrada y Salida):** Bloquea de inmediato las noches en todos tus portales para **evitar el overbooking (doble reserva)**.
   - ❌ **Lo que NO viaja por iCal:** Las plataformas no transmiten la tarifa cobrada, desglose de comisiones, ni el email o teléfono real del huésped por limitaciones y privacidad del protocolo .ics.

2. **¿Por qué la tarifa manual aplica a TODAS las reservas?**
   - **En Loomi Suite, el precio manual está disponible para cualquier reserva** (Directa, Airbnb, Booking o VRBO).
   - Cuando entra un bloqueo por iCal, el sistema toma como base el valor configurado de la cabaña, y vos podés:
     • Tocar el lápiz **(✏️ Editar)** en el detalle de la reserva para colocar el **importe real exacto** que te pagó el huésped.
     • El sistema recalcula en tiempo real las comisiones (ej. **Airbnb 3% tradicional** vs 15%, o Booking 15%) y tu ingreso neto real.
     • Al cargar una reserva a mano, activar **"Fijar Tarifa Manual"** para cualquier canal.

Así tus balances contables y reportes mensuales reflejan la realidad exacta de tu negocio.`;
  }

  // 6. Conexión de Canales y Doble Reserva
  if (
    q.includes('booking') ||
    q.includes('airbnb') ||
    q.includes('vrbo') ||
    q.includes('tripadvisor') ||
    q.includes('google') ||
    q.includes('canal') ||
    q.includes('canales') ||
    q.includes('sincroniz') ||
    q.includes('ical') ||
    q.includes('overbooking') ||
    q.includes('conectar') ||
    q.includes('vincular')
  ) {
    if (q.includes('airbnb') || q.includes('conectar') || q.includes('como') || q.includes('cómo') || q.includes('paso')) {
      return `### 🔄 Cómo conectar Airbnb y sincronizar calendarios sin dobles reservas

Para conectar tu anuncio de Airbnb con Loomi Suite y evitar cualquier overbooking, sigue estos 3 pasos simples:

1. **Obtener el enlace iCal de Airbnb:**
   - Entra a tu cuenta de anfitrión en **Airbnb**.
   - Ve a **Anuncios** ➔ Selecciona tu cabaña o depto ➔ **Precios y disponibilidad**.
   - Baja hasta **Sincronización del calendario** ➔ Toca **Exportar calendario** y copia el enlace que te da Airbnb (termina en \`.ics\`).

2. **Vincularlo en Loomi Suite:**
   - En tu panel de Loomi, ve a la pestaña **Cabañas & Habitaciones**.
   - En la tarjeta de la cabaña correspondiente, toca el botón **"Sincronizar Canales"** (o el lápiz ✏️).
   - Pega el enlace de Airbnb en el campo **URL iCal de Airbnb** y guarda.

3. **Copiar el enlace de Loomi hacia Airbnb:**
   - En esa misma pantalla de Loomi, copia tu enlace de exportación de Loomi.
   - En Airbnb, toca **Importar calendario** y pégalo ahí con el nombre *"Loomi Suite"*.

✅ **¡Listo!** A partir de ese momento, cada vez que entre una reserva en Airbnb, las fechas se bloquean en Loomi y en Booking en tiempo real.`;
    }

    return `### 🔄 Sincronización Oficial en Tiempo Real

Loomi Suite mantiene tu disponibilidad conectada de forma bidireccional:

- **Booking.com & Airbnb:** Conexión oficial directa para actualizar disponibilidad en menos de 3 segundos y sincronizar tarifas.
- **VRBO / Expedia:** Conexión iCal bidireccional incluida sin costos ocultos de API, además de soporte para cuentas profesionales.
- **TripAdvisor & Portales iCal:** Conexión para sincronizar disponibilidad en TripAdvisor y portales regionales vía iCal bidireccional.
- **Cero Overbooking:** Cuando un huésped confirma en cualquier plataforma, Loomi bloquea automáticamente las demás sin intervención manual.`;
  }

  // Default
  return `### 👋 Hola, soy Xenia, tu asistente en Loomi Suite

Puedo responderte al instante sobre:

1. **WhatsApp & Mensajería:** Las 6 plantillas automáticas, blindaje anti-quejas y coordinación en ruta.
2. **Precios y Planes:** Planes desde $45.000 ARS/mes en pesos, ajuste IPC, pago por Transferencia Bancaria o Mercado Pago.
3. **Finanzas y Rendición:** Ingresos brutos, comisiones de plataformas y ahorro por reservas directas.
4. **Operaciones & Limpieza:** Huéspedes de hoy, llaves físicas vs cerraduras digitales y asignación de mucamas.
5. **Sincronización:** Cómo conectar Booking, Airbnb y portales sin dobles reservas.

*¿Qué te gustaría consultar?*`;
}
