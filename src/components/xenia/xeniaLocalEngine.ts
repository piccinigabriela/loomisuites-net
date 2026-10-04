import { DemoState } from '../../types';

export function getClientXeniaReply(message: string, demoState: DemoState): string {
  const q = (message || '').toLowerCase().trim();
  const properties = demoState.properties || [];
  const reservations = demoState.reservations || [];
  const cleaningTasks = demoState.cleaningTasks || [];

  // STEMMING & INTENT DETECTION FOR LAYMAN / NON-HOTELIER QUESTIONS
  const isEditingAction =
    q.includes('modific') ||
    q.includes('cambi') ||
    q.includes('edit') ||
    q.includes('cancel') ||
    q.includes('borr') ||
    q.includes('elimin') ||
    q.includes('muev') ||
    q.includes('mov') ||
    q.includes('paso') ||
    q.includes('pasar') ||
    q.includes('pasalo') ||
    q.includes('pasala') ||
    q.includes('traslad') ||
    q.includes('reasign') ||
    q.includes('correg') ||
    q.includes('ajust') ||
    q.includes('anot') ||
    q.includes('registr') ||
    q.includes('marcar') ||
    q.includes('agreg') ||
    q.includes('sumar') ||
    q.includes('sacar') ||
    q.includes('restar') ||
    q.includes('quedarse mas') ||
    q.includes('un dia mas') ||
    q.includes('cobro mas') ||
    q.includes('cobrar mas') ||
    q.includes('cobro menos') ||
    q.includes('cobrar menos');

  const isReservationTarget =
    q.includes('reserva') ||
    q.includes('estadia') ||
    q.includes('estadía') ||
    q.includes('fecha') ||
    q.includes('dia') ||
    q.includes('días') ||
    q.includes('noche') ||
    q.includes('noches') ||
    q.includes('pasajero') ||
    q.includes('huesped') ||
    q.includes('huésped') ||
    q.includes('cliente') ||
    q.includes('cabaña') ||
    q.includes('depto') ||
    q.includes('habitacion') ||
    q.includes('unidad') ||
    q.includes('tarifa') ||
    q.includes('precio') ||
    q.includes('seña') ||
    q.includes('saldo') ||
    q.includes('pago');

  // 1. MODIFICAR, EDITAR, MOVER, CANCELAR O CAMBIAR DATOS DE UNA RESERVA (MÁXIMA PRIORIDAD)
  if (
    (isEditingAction && isReservationTarget) ||
    q.includes('como cancelo') ||
    q.includes('cómo cancelo') ||
    q.includes('como modifico') ||
    q.includes('cómo modifico') ||
    q.includes('como edito') ||
    q.includes('cómo edito') ||
    q.includes('como muevo') ||
    q.includes('cómo muevo') ||
    q.includes('como cambio') ||
    q.includes('cómo cambio') ||
    q.includes('como borro') ||
    q.includes('cómo borro') ||
    q.includes('modificar reserva') ||
    q.includes('cambiar reserva') ||
    q.includes('cancelar reserva') ||
    q.includes('mover reserva') ||
    q.includes('editar reserva') ||
    q.includes('cambiar fechas') ||
    q.includes('cambiar fecha') ||
    q.includes('un dia mas') ||
    q.includes('quedarse mas dias') ||
    q.includes('otra cabaña') ||
    q.includes('otro depto')
  ) {
    return `### ✏️ Cómo modificar, mover o actualizar una reserva en Loomi Suite

En Loomi lo hacés en segundos, sin complicaciones técnicas ni términos difíciles:

1. **Abrir la reserva:**
   - En el **Rack Calendario**, hacé clic sobre la barra de la estadía que querés modificar (o buscala por nombre en la pestaña **Reservas & Pasajeros**).
   - Se abrirá la ficha completa con todos los datos del huésped.

2. **Tocá el ícono del Lápiz (✏️ Editar):**
   - **Cambiar Fechas o Noches:** Ajustás el check-in, check-out o sumás noches si el huésped se queda más tiempo. *(¡En el calendario también podés arrastrar la barra directamente con el mouse!)*.
   - **Mover de Cabaña o Departamento:** Si necesitás cambiarlo de unidad por mantenimiento o preferencia, seleccionás la nueva cabaña desde el menú desplegable.
   - **Modificar la Tarifa o Precio:** Podés cambiar el importe total facturado (si le hiciste descuento o cobraste extras). Loomi recalcula al instante la comisión real y tu ingreso neto limpio.
   - **Anotar Señas y Cobros de Saldo:** Cambiás el estado de *"Seña Pendiente"* a *"Seña 50%"* o *"100% Abonado"* cuando el huésped te transfiera o pague en recepción.
   - **Early Check-in o Late Check-out:** Marcás si llega antes o sale más tarde para coordinar con la mucama.
   - **Cancelar o Dar de Baja:** Si el pasajero cancela, cambiás el estado a *"Cancelada"* y las fechas se liberan al instante.

3. **Guardar:**
   - Tocás **Guardar Cambios** y automáticamente se actualizan tu calendario, tus números contables y el módulo de limpieza.

💡 *Si el cambio lo hizo el huésped directamente en Airbnb o Booking, el enlace iCal actualiza el calendario solo sin que tengas que hacer nada a mano.*`;
  }

  // 2. FINANZAS, GANANCIAS, RECAUDACIÓN, MESES (OCTUBRE, NOVIEMBRE, ETC.) Y COMISIONES
  const isFinanceIntent =
    q.includes('ganancia') ||
    q.includes('ganancias') ||
    q.includes('gane') ||
    q.includes('gané') ||
    q.includes('gano') ||
    q.includes('plata') ||
    q.includes('dinero') ||
    q.includes('guita') ||
    q.includes('factur') ||
    q.includes('ingreso') ||
    q.includes('ingresos') ||
    q.includes('rentabilidad') ||
    q.includes('beneficio') ||
    q.includes('balance') ||
    q.includes('cobre') ||
    q.includes('cobré') ||
    q.includes('cobro') ||
    q.includes('recaud') ||
    q.includes('seña') ||
    q.includes('saldo') ||
    q.includes('comision') ||
    q.includes('comisión') ||
    q.includes('ahorr') ||
    q.includes('cuanto gano') ||
    q.includes('cuánto gano') ||
    q.includes('cuanto entra') ||
    q.includes('cuánto entra') ||
    q.includes('cuanto me queda') ||
    q.includes('cuánto me queda') ||
    q.includes('como viene') ||
    q.includes('cómo viene') ||
    q.includes('octubre') ||
    q.includes('noviembre') ||
    q.includes('diciembre') ||
    q.includes('este mes') ||
    q.includes('mes actual');

  if (isFinanceIntent && !isEditingAction) {
    const monthsMap: Record<string, { num: string; name: string }> = {
      octubre: { num: '10', name: 'Octubre' },
      noviembre: { num: '11', name: 'Noviembre' },
      diciembre: { num: '12', name: 'Diciembre' },
      enero: { num: '01', name: 'Enero' },
      febrero: { num: '02', name: 'Febrero' },
      marzo: { num: '03', name: 'Marzo' },
      abril: { num: '04', name: 'Abril' },
      mayo: { num: '05', name: 'Mayo' },
      junio: { num: '06', name: 'Junio' },
      julio: { num: '07', name: 'Julio' },
      agosto: { num: '08', name: 'Agosto' },
      septiembre: { num: '09', name: 'Septiembre' },
    };

    let targetMonth: { num: string; name: string } | null = null;
    for (const [key, val] of Object.entries(monthsMap)) {
      if (q.includes(key)) {
        targetMonth = val;
        break;
      }
    }

    if (!targetMonth && (q.includes('este mes') || q.includes('mes actual'))) {
      targetMonth = { num: '10', name: 'Octubre' };
    }

    if (targetMonth) {
      const monthReservations = reservations.filter((r: any) => {
        const inMatch = r.checkIn && (r.checkIn.includes(`-${targetMonth.num}-`) || r.checkIn.startsWith(`2026-${targetMonth.num}`));
        const outMatch = r.checkOut && (r.checkOut.includes(`-${targetMonth.num}-`) || r.checkOut.startsWith(`2026-${targetMonth.num}`));
        return inMatch || outMatch;
      });

      const monthGross = monthReservations.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0);
      const monthCommissions = monthReservations.reduce((acc: number, r: any) => acc + (r.commissionPaid || 0), 0);
      const monthNet = monthReservations.reduce((acc: number, r: any) => acc + (r.netRevenue || 0), 0);
      const monthNights = monthReservations.reduce((acc: number, r: any) => acc + (r.nights || 0), 0);
      const monthDirectSaved = monthReservations
        .filter((r: any) => r.platform === 'direct')
        .reduce((sum: number, r: any) => sum + (r.totalAmount || 0) * 0.18, 0);

      const snippet = monthReservations.slice(0, 6).map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || 'Cabaña';
        return `• **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${r.checkIn} al ${r.checkOut} — **$${r.totalAmount} USD** (Neto: $${r.netRevenue} USD)`;
      }).join('\n');

      return `### 📊 Ganancias y Facturación de ${targetMonth.name} (Loomi Suite)

Aquí tenés el desglose exacto de tu negocio para **${targetMonth.name}**:

- 💰 **Ganancia Neta Real en Mano:** **$${monthNet.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD** *(lo que te queda limpio en el bolsillo después de descontar comisiones)*.
- 💵 **Facturación Bruta Total:** **$${monthGross.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD** sobre **${monthReservations.length} reservas registradas** (${monthNights} noches vendidas).
- 🏷️ **Comisiones Deducidas por OTAs (Airbnb/Booking):** **-$${monthCommissions.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD**.
- 🌟 **Ahorro por Reservas Directas:** **+$${Math.round(monthDirectSaved).toLocaleString('en-US')} USD** ahorrados sin intermediarios.

${monthReservations.length > 0 ? `📋 **Estadías del mes de ${targetMonth.name}:**\n${snippet}\n${monthReservations.length > 6 ? `*(y ${monthReservations.length - 6} reservas más en el sistema)*` : ''}` : `ℹ️ *Aún no hay reservas registradas específicamente para ${targetMonth.name}.*`}

💡 *Podés ver el informe detallado y liquidaciones en la pestaña **Finanzas**.*`;
    }

    // General financial overview
    const totalGross = reservations.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0);
    const totalCommissions = reservations.reduce((acc: number, r: any) => acc + (r.commissionPaid || 0), 0);
    const totalNet = reservations.reduce((acc: number, r: any) => acc + (r.netRevenue || 0), 0);
    const totalNights = reservations.reduce((acc: number, r: any) => acc + (r.nights || 0), 0);
    const directSaved = reservations
      .filter((r: any) => r.platform === 'direct')
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0) * 0.18, 0);

    const pendingPayments = reservations.filter(
      (r: any) => r.paymentStatus === 'pending' || r.paymentStatus === 'deposit_only'
    );

    return `### 📊 Rendición Financiera y Ganancias de tu Negocio

Aquí tenés el balance económico actualizado en tiempo real:

- 💰 **Ganancia Neta Real en Mano:** **$${totalNet.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD** *(después de tasas y comisiones de canales)*.
- 💵 **Facturación Bruta Total:** **$${totalGross.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD** sobre **${reservations.length} reservas registradas** (${totalNights} noches).
- 🏷️ **Comisiones Deducidas por Plataformas (OTAs):** **-$${totalCommissions.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD** (Booking, Airbnb).
- 🌟 **Ahorro por Reservas Directas:** **+$${Math.round(directSaved).toLocaleString('en-US')} USD** ahorrados gracias a reservas directas sin comisiones.

${pendingPayments.length > 0 ? `⚠️ **Cobros y Saldos Pendientes:** Tenés ${pendingPayments.length} reservas con saldo pendiente de cobro en mostrador.` : '✅ *Todos los cobros de reservas confirmadas están al día.*'}

💡 *Pregúntame por un mes específico (ej: "¿Cuál es mi ganancia en octubre?") para ver el detalle mensual.*`;
  }

  // 3. PLANES, PRECIOS Y FORMAS DE PAGO DE LOOMI SUITE (SOFTWARE)
  if (
    (q.includes('precio') ||
      q.includes('costo') ||
      q.includes('cuanto cuesta') ||
      q.includes('cuánto cuesta') ||
      q.includes('cuanto sale') ||
      q.includes('cuánto sale') ||
      q.includes('abono') ||
      q.includes('tarifa') ||
      q.includes('planes') ||
      q.includes('plan ') ||
      q.includes(' plan') ||
      q === 'plan' ||
      q.includes('ipc') ||
      q.includes('inflacion') ||
      q.includes('inflación') ||
      q.includes('mercado pago') ||
      q.includes('transferencia') ||
      q.includes('cbu') ||
      q.includes('alias') ||
      q.includes('tarjeta') ||
      q.includes('paypal')) &&
    !isEditingAction
  ) {
    return `### 🏷️ Planes, Precios y Formas de Pago de Loomi Suite

En Loomi tenemos **precios transparentes en pesos argentinos (ARS)** y ajustados por **IPC (inflación oficial)**, para que no tengas sobresaltos con el dólar:

- **Plan 4 a 10 Propiedades:** **$45.000 / mes** *(ideal para anfitriones y pequeños complejos)*.
- **Plan 10 a 20 Propiedades:** **$60.000 / mes** *(complejos medianos, aparts y posadas)*.
- **Plan 20 a 30 Propiedades:** **$80.000 / mes** *(operaciones profesionales de alto flujo)*.
- **Más de 30 Propiedades:** Cotización personalizada a medida.

**Formas de Pago y Cobro:**
- 💳 **Tu abono a Loomi:** Se abona mensualmente mediante **Transferencia Bancaria directa** (CBU/CVU o Alias) en Argentina, o por **PayPal** para el exterior. Sin comisiones extras ni intermediarios.
- 💰 **Cobros a tus Huéspedes:** Tus huéspedes te pagan directo a tus cuentas: podés vincular tu **Mercado Pago** (links de pago o QR), transferencias por **CBU/Alias bancario** o **PayPal** para extranjeros. Loomi no retiene tus fondos ni cobra comisiones por reserva (0% comisión).
- ✅ **Sin tarjeta de crédito para arrancar:** Probás la demo interactiva sin ingresar datos de pago.
- ✅ **Sin permanencia:** Podés pausar o dar de baja el servicio cuando quieras.
- 👥 **Modo Día a Día para Empleados:** Modo operativo restringido para que el personal atienda check-ins y limpieza sin ver números de facturación ni finanzas.`;
  }

  // 4. LLAVES FÍSICAS vs CERRADURAS DIGITALES
  if (
    q.includes('llave') ||
    q.includes('cerradura') ||
    q.includes('candado') ||
    q.includes('digital') ||
    q.includes('electronica') ||
    q.includes('electrónica') ||
    q.includes('tuya') ||
    q.includes('yale') ||
    q.includes('ttlock') ||
    q.includes('conserj') ||
    q.includes('buzon') ||
    q.includes('buzón')
  ) {
    return `### 🔑 Llaves Físicas Tradicionales vs. Cerraduras Digitales en Loomi

¡Tranquilo/a! En Loomi **no necesitás gastar en cerraduras caras ni cambiar una sola puerta**:

1. **100% pensado para Llaves Físicas Tradicionales:**
   - La enorme mayoría de cabañas y posadas entregan la llave en mano o usan un candado/buzón de llaves.
   - En la ficha de cada reserva figura claramente: *"Llave física en conserjería"* para que todo tu equipo lo sepa.

2. **¿Tenés o querés cerraduras electrónicas con código PIN?**
   - El módulo de cerraduras inteligentes es un **Add-on opcional**.
   - Si tenés cerraduras tipo Teclado/Touch (Tuya, TTLock, Yale), podés asociar el código PIN del huésped para que le llegue automáticamente por WhatsApp.

En resumen: podés empezar hoy mismo con tus llaves de toda la vida y nunca estás obligado a cambiar nada.`;
  }

  // 5. LIMPIEZA Y MUCAMAS
  if (
    q.includes('limpieza') ||
    q.includes('mucama') ||
    q.includes('limpiar') ||
    q.includes('chica') ||
    q.includes('ropa blanca') ||
    q.includes('sabana') ||
    q.includes('sábana') ||
    q.includes('toalla') ||
    q.includes('desinfeccion') ||
    q.includes('desinfección')
  ) {
    return `### 🧹 Módulo de Limpieza y Mucamas en el Celular

Así funciona la coordinación diaria sin mensajes perdidos en WhatsApp:

1. **Automático:** Al concretarse un check-out, la unidad pasa automáticamente a estado **Pendiente (Sucia)** en tu rack.
2. **Enlace móvil para el personal:** Tu personal de limpieza tiene su enlace móvil propio (sin contraseñas) con el listado del día y checklist:
   - Sábanas y toallas limpias.
   - Sanitización de baños y reposición de amenities.
   - Comprobación de llaves o cerradura.
3. **Control en tiempo real:** Cuando terminan, tocan **"Marcar como Lista"** y tu calendario pasa a verde de inmediato para el próximo ingreso.`;
  }

  // 6. WHATSAPP, PLANTILLAS, GUÍA DIGITAL Y WI-FI
  if (
    q.includes('whatsapp') ||
    q.includes('mensaje') ||
    q.includes('mensajeria') ||
    q.includes('mensajería') ||
    q.includes('plantilla') ||
    q.includes('guia digital') ||
    q.includes('guía digital') ||
    q.includes('wifi') ||
    q.includes('wi-fi') ||
    q.includes('internet') ||
    q.includes('clave') ||
    q.includes('llegada') ||
    q.includes('ubicacion') ||
    q.includes('ubicación') ||
    q.includes('blindaje') ||
    q.includes('queja') ||
    q.includes('resena') ||
    q.includes('reseña')
  ) {
    return `### 💬 WhatsApp Inteligente y Blindaje Anti-Quejas en Loomi Suite

En Loomi enviás mensajes a tus pasajeros en 1 solo toque, con los datos ya cargados:

1. **Las 6 Plantillas Automáticas:**
   - 👋 **Bienvenida y Guía Digital (Día 1):** Envía el mapa interactivo de ruta y recomendaciones locales.
   - 🚗 **Coordinación en Ruta:** Para coordinar la hora exacta de llegada en viajes largos.
   - 🔑 **Acceso y Clave Wi-Fi:** Entrega automáticamente la red y contraseña de esa cabaña específica.
   - 🛡️ **Control de Confort (2hs Post-Ingreso):** Desactiva reclamos en privado en 10 minutos, antes de que se transformen en una queja pública.
   - ⏰ **Recordatorio de Check-out:** Aviso cordial para coordinar la salida.
   - 🌟 **Solicitud de Reseña 5 Estrellas:** Para conseguir mejores calificaciones e invitar a reservar directo la próxima vez.

2. **⚡ Envío en 1 Clic:**
   - Podés enviarlas desde la pestaña **"Avisos & WhatsApp"** o tocando el botón verde **"Chatear"** en la ficha de cualquier reserva.`;
  }

  // 7. SINCRONIZACIÓN Y OVERBOOKING / DOBLES RESERVAS
  if (
    q.includes('sincroniz') ||
    q.includes('airbnb') ||
    q.includes('booking') ||
    q.includes('ical') ||
    q.includes('overbooking') ||
    q.includes('doble reserva') ||
    q.includes('dos veces') ||
    q.includes('se pisen') ||
    q.includes('pisar') ||
    q.includes('conectar') ||
    q.includes('vincular') ||
    q.includes('canal') ||
    q.includes('canales')
  ) {
    return `### 🔄 Cómo sincronizar Booking y Airbnb para evitar dobles reservas

Loomi conecta tus calendarios mediante sincronización bidireccional (iCal oficial) para que **nunca se pisen dos reservas en la misma cabaña**:

1. **Obtener el enlace iCal en Airbnb/Booking:**
   - En tu cuenta de anfitrión de Airbnb, vas a tu anuncio ➔ **Precios y disponibilidad** ➔ **Exportar calendario** y copias el enlace.
2. **Pegarlo en Loomi Suite:**
   - En Loomi vas a **Cabañas & Habitaciones** ➔ Tocás **"Sincronizar Canales"** en la cabaña y pegás el enlace.
3. **Copiar el enlace de Loomi hacia el canal:**
   - Copiás el link de exportación de Loomi y lo pegás en **Importar calendario** en Airbnb y Booking.

✅ **¡Listo!** Cuando entra una reserva en Airbnb, las fechas se bloquean automáticamente en Booking y en Loomi en tiempo real.`;
  }

  // 8. OCUPACIÓN, QUIÉN LLEGA HOY, QUIÉN SALE HOY
  if (
    q.includes('ocupad') ||
    q.includes('ocupacion') ||
    q.includes('ocupación') ||
    q.includes('disponib') ||
    q.includes('libre') ||
    q.includes('quien llega') ||
    q.includes('quién llega') ||
    q.includes('quien sale') ||
    q.includes('quién sale') ||
    q.includes('check in hoy') ||
    q.includes('check-in hoy') ||
    q.includes('check out hoy') ||
    q.includes('check-out hoy') ||
    q.includes('hoy') ||
    q.includes('alojado') ||
    q.includes('pasajeros') ||
    q.includes('huespedes') ||
    q.includes('huéspedes') ||
    q.includes('reserva') ||
    q.includes('reservas')
  ) {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalProps = properties.length || 6;
    const occupiedCount = Math.min(
      totalProps,
      reservations.filter((r: any) => r.status === 'confirmed' || r.status === 'checked_in').length
    );
    const occupancyRate = Math.round((occupiedCount / Math.max(1, totalProps)) * 100);

    const checkInsToday = reservations.filter(
      (r: any) => r.checkIn === todayStr || (r.checkIn <= todayStr && r.checkOut > todayStr)
    );
    const checkOutsToday = reservations.filter((r: any) => r.checkOut === todayStr);

    const listSnippet = reservations
      .slice(0, 5)
      .map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || 'Cabaña';
        return `• **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${r.checkIn} al ${r.checkOut} ($${r.totalAmount} USD)`;
      })
      .join('\n');

    return `### 🛏️ Estado de Ocupación y Reservas en Tiempo Real

📊 **Ocupación Actual:**
- **Nivel de Ocupación:** **${occupancyRate}%** (${occupiedCount} de ${totalProps} unidades ocupadas).
- **Total de Reservas Activas:** **${reservations.length} reservas registradas**.
- **Ingresos hoy (Check-in):** ${checkInsToday.length > 0 ? `${checkInsToday.length} pasajeros ingresando` : 'Sin ingresos previstos para hoy'}.
- **Salidas hoy (Check-out):** ${checkOutsToday.length > 0 ? `${checkOutsToday.length} salidas previstas` : 'Sin salidas para hoy'}.

📋 **Próximas Estadías Registradas:**
${listSnippet}

💡 *Podés ver y mover reservas directamente en el **Rack Calendario**.*`;
  }

  // DEFAULT
  return `### 👋 Hola, soy Xenia, tu copiloto en Loomi Suite

Puedo responderte al instante sobre cualquier tema operativo o comercial:

1. **✏️ Gestión de Reservas:** Pregúntame cómo modificar una reserva, cambiar fechas, mover de cabaña o anotar cobros y señas.
2. **💰 Ganancias y Finanzas:** Pregúntame *"¿Cuál es mi ganancia en octubre?"*, cuánta plata ingresó o cuánto ahorraste en comisiones de Airbnb y Booking.
3. **🔑 Llaves y Limpieza:** Pregúntame cómo operar con llaves comunes tradicionales o cómo coordinar con la mucama.
4. **🔄 Sincronización:** Pregúntame cómo conectar Booking y Airbnb para evitar dobles reservas.
5. **🏷️ Planes y Precios:** Pregúntame cuánto cuesta Loomi ($45.000 ARS) y cómo se paga por transferencia o Mercado Pago.

*¿Qué te gustaría consultar o resolver?*`;
}
