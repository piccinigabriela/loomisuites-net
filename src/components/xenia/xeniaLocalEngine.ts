import { DemoState } from '../../types';

function formatFriendlyDates(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return `${checkIn || ''} al ${checkOut || ''}`;
  const pIn = checkIn.split('-');
  const pOut = checkOut.split('-');
  if (pIn.length === 3 && pOut.length === 3) {
    const months = [
      '',
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const dIn = parseInt(pIn[2], 10);
    const mIn = parseInt(pIn[1], 10);
    const dOut = parseInt(pOut[2], 10);
    const mOut = parseInt(pOut[1], 10);
    const yIn = parseInt(pIn[0], 10);
    const yOut = parseInt(pOut[0], 10);

    if (mIn === mOut && yIn === yOut) {
      return `del ${dIn} al ${dOut} de ${months[mIn] || pIn[1]}`;
    }
    if (yIn === yOut) {
      return `del ${dIn} de ${months[mIn] || pIn[1]} al ${dOut} de ${months[mOut] || pOut[1]}`;
    }
    return `del ${dIn} de ${months[mIn] || pIn[1]} de ${yIn} al ${dOut} de ${months[mOut] || pOut[1]} de ${yOut}`;
  }
  return `${checkIn} al ${checkOut}`;
}

export function getClientXeniaReply(message: string, demoState: DemoState): string {
  const q = (message || '').toLowerCase().trim();
  const properties = demoState.properties || [];
  const reservations = demoState.reservations || [];
  const cleaningTasks = demoState.cleaningTasks || [];
  const p0 = properties[0];

  // =========================================================================
  // DIRECTIVAS OMOTENASHI: 1. CASOS CRÍTICOS & RECLAMOS (DERIVACIÓN HUMANA)
  // =========================================================================
  if (
    q.includes('rompio') ||
    q.includes('rompió') ||
    q.includes('roto') ||
    q.includes('no anda') ||
    q.includes('no funciona') ||
    q.includes('reclamo') ||
    q.includes('queja') ||
    q.includes('no hay agua') ||
    q.includes('sin agua') ||
    q.includes('sin luz') ||
    q.includes('corte de luz') ||
    q.includes('aire acondicionado') ||
    q.includes('no enfria') ||
    q.includes('no enfría') ||
    q.includes('ruido') ||
    q.includes('ruidos') ||
    q.includes('llave trabada') ||
    q.includes('cerradura trabada') ||
    q.includes('urgencia') ||
    q.includes('emergencia') ||
    q.includes('mancha') ||
    q.includes('olor')
  ) {
    return `Lamento sinceramente este inconveniente durante tu estadía.

Ya mismo le di aviso prioritario a nuestro anfitrión y equipo del complejo para que se acerque y se comunique con vos de forma inmediata para resolverlo juntos.

Quedamos a tu completa disposición para asistirte en lo que precises.`;
  }

  // =========================================================================
  // DIRECTIVAS OMOTENASHI: 2. AUTONOMÍA (CHECK-IN/OUT, WI-FI, CERRADURA, MAPA)
  // =========================================================================
  if (
    q.includes('horario') ||
    q.includes('a que hora') ||
    q.includes('a qué hora') ||
    q.includes('check in') ||
    q.includes('check-in') ||
    q.includes('check out') ||
    q.includes('check-out') ||
    q.includes('ingreso') ||
    q.includes('salida') ||
    q.includes('wifi') ||
    q.includes('wi-fi') ||
    q.includes('clave') ||
    q.includes('contraseña') ||
    q.includes('cerradura') ||
    q.includes('pin') ||
    q.includes('codigo') ||
    q.includes('código') ||
    q.includes('como llego') ||
    q.includes('cómo llego') ||
    q.includes('ubicacion') ||
    q.includes('ubicación') ||
    q.includes('direccion') ||
    q.includes('dirección')
  ) {
    const wifiNet = p0?.wifiNetwork || 'Loomi_Fibra_Optica';
    const wifiPass = p0?.wifiPassword || 'Bienvenido2026';
    const pin = '4820';
    const address = p0?.address || 'Tres Sargentos 435, CABA';

    return `¡Hola! Con gusto te paso los datos para tu llegada y estancia:

• **Horarios:** Check-in a partir de las 14:00 hs | Check-out hasta las 10:00 hs.
• **Acceso autónomo:** Cerradura digital touch con PIN **${pin}#**.
• **Wi-Fi:** Red **${wifiNet}** (Clave: **${wifiPass}**).
• **Dirección:** ${address}.

Podés consultar el mapa interactivo y todos los detalles en tu **Portal del Huésped**:
👉 https://loomisuite.net/guia/${p0?.id || 'departamento'}`;
  }

  // =========================================================================
  // DIRECTIVAS OMOTENASHI: 3. SERVICIOS ADICIONALES (COCHERAS, LATE CHECK-OUT, TRANSFERS)
  // =========================================================================
  if (
    q.includes('cochera') ||
    q.includes('estacionamiento') ||
    q.includes('auto') ||
    q.includes('late check') ||
    q.includes('salida tarde') ||
    q.includes('quedarme mas') ||
    q.includes('quedarme más') ||
    q.includes('transfer') ||
    q.includes('traslado') ||
    q.includes('aeropuerto') ||
    q.includes('desayuno') ||
    q.includes('spa') ||
    q.includes('masaje')
  ) {
    return `¡Por supuesto! Contamos con los siguientes servicios adicionales en el complejo:

• **Cochera privada cubierta:** Vigilada 24hs (USD 15 / día).
• **Late Check-out:** Salida extendida hasta las 16:00 hs sujeta a disponibilidad (USD 20).
• **Transfer Aeropuerto (AEP/EZE):** Recepción personalizada en arribos (USD 30 por viaje).
• **Canasta de Desayuno Artesanal:** Medialunas, tostadas y café de especialidad (USD 14 / persona).

Si querés sumar alguno de estos servicios a tu reserva, avisanos y te lo dejamos coordinado de inmediato.`;
  }

  // 0. CAMBIAR O SALIR DEL MODO LIGHT / MODO CELULAR / VISTA ESCRITORIO
  if (
    q.includes('modo light') ||
    q.includes('salir del modo light') ||
    q.includes('pasar del modo light') ||
    q.includes('cambiar de modo') ||
    q.includes('modo escritorio') ||
    q.includes('vista completa') ||
    q.includes('modo pc') ||
    q.includes('computadora') ||
    q.includes('pantalla grande') ||
    q.includes('modo oscuro') ||
    q.includes('modo claro') ||
    q.includes('modo celular') ||
    q.includes('modo móvil') ||
    q.includes('modo movil') ||
    q.includes('volver a la pc') ||
    q.includes('volver al escritorio') ||
    q.includes('volver a la compu') ||
    q.includes('como paso del modo') ||
    q.includes('cómo paso del modo') ||
    q.includes('como salir del modo') ||
    q.includes('cómo salir del modo')
  ) {
    return `### 📱 Cómo alternar entre el Modo Light (Móvil) y la Vista Completa (PC)

Para pasar del **Modo Light** al **Panel Completo de Escritorio (PMS)** tenés 2 opciones rápidas:

1. **Botón en la barra superior:**
   - En la esquina superior derecha de la pantalla, tocá el botón **"💻 Vista Completa"** (con el ícono de la notebook).
   - Inmediatamente se abre el panel completo con el **Rack de Calendario**, las finanzas detalladas, la configuración de canales iCal y la web de reservas.

2. **Desde la pestaña "⚡ Atajos / Más":**
   - Tocá la pestaña **"Atajos"** en la barra inferior y seleccioná **"Cambiar a Vista Completa de Escritorio"**.

3. **Para volver al Modo Light cuando estés en la PC:**
   - En la barra superior del panel tocás el botón **"📱 Vista Móvil"** y regresás a la versión simplificada de bolsillo.

💡 *El Modo Light está pensado para la operación diaria en la calle o mientras recorrés las cabañas, mientras que la Vista Completa es ideal para sentarte a ver los números y el calendario general.*`;
  }

  // 0.1 DETENER, PARAR O SILENCIAR A XENIA
  if (
    q.includes('detener') ||
    q.includes('parar') ||
    q.includes('silenciar') ||
    q.includes('callar') ||
    q.includes('frenar') ||
    q.includes('apagar voz') ||
    q.includes('desactivar voz') ||
    q.includes('como te detengo') ||
    q.includes('cómo te detengo') ||
    q.includes('como detener') ||
    q.includes('cómo detener') ||
    q.includes('tardas mucho') ||
    q.includes('tarda mucho') ||
    q.includes('tardas bastante') ||
    q.includes('tarda bastante')
  ) {
    return `### ⏹️ Cómo detener, pausar o silenciar a Xenia

Tenés 3 formas sencillas de controlar mis respuestas y la voz:

1. **Botón de Detener (⏹️ PARAR):**
   - Mientras estoy respondiendo o hablando por voz, aparece un **banner rojo brillante superior con el botón ⏹️ PARAR / Silenciar**. Al tocarlo me detengo en el milisegundo.

2. **Apagar la Voz (Modo Lectura Silenciosa):**
   - Tocá el botón **"Voz ON / Voz Mute"** (ícono de parlante 🔊/🔇) arriba a la derecha. Así podés leerme en texto sin que se reproduzca el audio.

3. **Detener el Micrófono 🎙️:**
   - Si tocaste el micrófono para hablar, podés tocarlo nuevamente cuando termines para enviar tu consulta o cancelarla.

💡 *¡Todas mis respuestas ahora se generan de forma ultra rápida e instantánea!*`;
  }

  // 0.2 ENVIAR BIENVENIDA Y GUÍA DIGITAL AL HUÉSPED
  if (
    q.includes('bienvenida') ||
    q.includes('bienvenido') ||
    q.includes('guia digital') ||
    q.includes('guía digital') ||
    q.includes('guia del huesped') ||
    q.includes('guía del huésped') ||
    q.includes('guia del pasajero') ||
    q.includes('guía del pasajero') ||
    q.includes('portal de bienvenida') ||
    q.includes('enviar guia') ||
    q.includes('enviar guía') ||
    q.includes('mandar guia') ||
    q.includes('mandar guía') ||
    q.includes('como envio la bienvenida') ||
    q.includes('cómo envío la bienvenida') ||
    q.includes('como mandar la bienvenida') ||
    q.includes('cómo mandar la bienvenida') ||
    q.includes('como se envia la bienvenida') ||
    q.includes('cómo se envía la bienvenida') ||
    q.includes('como le mando la bienvenida') ||
    q.includes('cómo le mando la bienvenida') ||
    q.includes('mensaje de bienvenida') ||
    q.includes('carta de bienvenida')
  ) {
    return `### 👋 Cómo enviar la Bienvenida y Guía Digital al Huésped

En Loomi Suite enviás la bienvenida personalizada por WhatsApp en **1 solo toque**, sin tener que redactar nada a mano:

---

#### 📱 1. Si estás en el Modo Light (Móvil / Bolsillo):
1. **Andá a la pestaña "Huéspedes"** en la barra inferior (o en la tarjeta del pasajero en la pestaña "Hoy").
2. **Tocá los 3 puntitos (⚡ Acciones Rápidas)** al lado del huésped que querés contactar.
3. Se abrirá la ventana de acciones. Tocá **"2. Enviar Bienvenida & Guía Digital"**.
4. Se abrirá directamente **WhatsApp con el mensaje listo**:
   - Saludo con el nombre real del huésped.
   - Enlace directo a su **Guía Digital interactiva** (con mapa GPS de llegada, recomendaciones de restaurantes y paseos).
   - Nombre de la red Wi-Fi y contraseña de su cabaña.
   - Horario de check-in.
5. Tocás **Enviar en WhatsApp** y ¡listo!

---

#### 💻 2. Si estás en la Vista Completa (PC / Escritorio):
1. En el **Rack Calendario**, hacé clic sobre la estadía del huésped.
2. En la ficha de la reserva, tocá el botón verde **"Chatear por WhatsApp"** o andá a la pestaña **"Avisos & WhatsApp"**.
3. Seleccioná la plantilla **"👋 Bienvenida y Guía Digital (Día 1)"**.
4. Hacé clic en **"Abrir WhatsApp"** para enviar el mensaje con 1 clic.

💡 *La Guía Digital no requiere que el huésped descargue ninguna app: se abre directamente en el navegador de su celular como una web moderna y elegante.*`;
  }

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
        return `• **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${formatFriendlyDates(r.checkIn, r.checkOut)} — **${r.totalAmount} USD** (Neto: ${r.netRevenue} USD)`;
      }).join('\n');

      return `### 📊 Ganancias y Facturación de ${targetMonth.name} (Loomi Suite)

Aquí tenés el desglose exacto de tu negocio para **${targetMonth.name}**:

- 💰 **Ganancia Neta Real en Mano:** **${Math.round(monthNet)} USD** *(lo que te queda limpio en el bolsillo después de descontar comisiones)*.
- 💵 **Facturación Bruta Total:** **${Math.round(monthGross)} USD** sobre **${monthReservations.length} reservas registradas** (${monthNights} noches vendidas).
- 🏷️ **Comisiones Deducidas por OTAs (Airbnb/Booking):** **-${Math.round(monthCommissions)} USD**.
- 🌟 **Ahorro por Reservas Directas:** **+${Math.round(monthDirectSaved)} USD** ahorrados sin intermediarios.

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

- 💰 **Ganancia Neta Real en Mano:** **${Math.round(totalNet)} USD** *(después de tasas y comisiones de canales)*.
- 💵 **Facturación Bruta Total:** **${Math.round(totalGross)} USD** sobre **${reservations.length} reservas registradas** (${totalNights} noches).
- 🏷️ **Comisiones Deducidas por Plataformas (OTAs):** **-${Math.round(totalCommissions)} USD** (Booking, Airbnb).
- 🌟 **Ahorro por Reservas Directas:** **+${Math.round(directSaved)} USD** ahorrados gracias a reservas directas sin comisiones.

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
    return `### 🏷️ Planes y Precios Transparentes de Loomi Suite (Complejo Entero)

En Loomi tenemos **2 planes fijos por complejo entero** en **pesos argentinos (ARS)** (sin cobrar por habitación y sin comisiones por reserva):

1. **🏡 Plan Loomi:** **$45.000 / mes (Final ARS)**
   - Enfocado en dueños de 4 o 5 cabañas sin personal.
   - Incluye calendario en modo light (optimizado para celular), gestión de reservas directas, sincronización iCal con portales y reportes de rendimiento básicos.
   - *No incluye módulo de housekeeping ni modo recepción multiusuario.*

2. **🏢 Plan Loomi Suite:** **$60.000 / mes (Final ARS)**
   - Todo el ecosistema ilimitado para complejos medianos y grandes.
   - Incluye Módulo Housekeeping en vivo (semáforo y tareas de mucamas), Modo Recepción con roles separados, Asistente Xenia AI (voz y copiloto 24/7) y web propia con Portal de Bienvenida del Huésped.

**Formas de Pago y Cobro:**
- 💳 **Tu abono a Loomi:** Se abona mensualmente mediante **Transferencia Bancaria directa** (CBU/CVU o Alias) en Argentina, o por **PayPal** para el exterior. Precio fijo por todo el complejo sin costos sorpresa.
- 💰 **Cobros a tus Huéspedes:** Tus pasajeros te pagan directo a tu cuenta: **Mercado Pago**, CBU/Alias bancario o efectivo. Loomi no cobra ningún porcentaje sobre tus ventas (0% comisión).
- ✅ **Sin tarjeta de crédito para arrancar:** Probás 15 días gratis sin ingresar datos de pago.`;
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
    q.includes('plantillas') ||
    q.includes('textos máster') ||
    q.includes('textos master') ||
    q.includes('omotenashi') ||
    q.includes('guia digital') ||
    q.includes('guía digital') ||
    q.includes('simulador') ||
    q.includes('wifi') ||
    q.includes('wi-fi') ||
    q.includes('internet') ||
    q.includes('clave') ||
    q.includes('llegada') ||
    q.includes('en ruta') ||
    q.includes('viaje') ||
    q.includes('ubicacion') ||
    q.includes('ubicación') ||
    q.includes('blindaje') ||
    q.includes('queja') ||
    q.includes('resena') ||
    q.includes('reseña')
  ) {
    return `### 💬 WhatsApp Inteligente y las 3 Plantillas Máster Omotenashi en Loomi Suite

Sí, en Loomi Suite el sistema de WhatsApp y el **Simulador en Celular** están diseñados con filosofía **Omotenashi** (atención cálida, ultra profesional y preventiva) para atender al huésped sin fricciones:

---

### 📱 1. Las 3 Plantillas Máster Pre-cargadas

1. **🌲 Plantilla 1: Confirmación & Bienvenida Anticipada** *(Al confirmarse la reserva)*:
   - Envía automáticamente el saludo cordial con el nombre del pasajero, confirma las fechas exactas y entrega el enlace directo a la **Guía Digital de Bienvenida interactiva** con el mapa GPS de acceso, claves de Wi-Fi y ficha digital de registro.
2. **🚗 Plantilla 2: Coordinación en Ruta / Día de Viaje** *(La mañana del Check-In)*:
   - Recuerda el horario de ingreso (a partir de las 14:00 hs), reactiva el GPS en 1 toque y pide que avisen cuando estén cerca para esperarlos con el alojamiento climatizado y las llaves listas.
3. **✨ Plantilla 3: Control de Confort y Blindaje Anti-Quejas** *(2 Horas Post Check-In)*:
   - Consulta amablemente si encontraron todo impecable, si el Wi-Fi y la temperatura están confortables, y ofrece toallas extra o recomendaciones de gastronomía local. ¡Esto desactiva cualquier eventual reclamo en privado en 10 minutos antes de que surja una queja!

---

### ⚡ 2. ¿Cómo funciona el Simulador de WhatsApp?

- **Variables Dinámicas Automáticas:** Las etiquetas como \`{{nombre_huésped}}\`, \`{{unidad_alojamiento}}\`, \`{{fecha_checkin}}\`, \`{{fecha_checkout}}\` y \`{{link_guia_digital}}\` se reemplazan solas con los datos reales de la reserva elegida.
- **Renderizado en Tiempo Real:** En el teléfono móvil simulado a la derecha ves exactamente cómo le llega el mensaje al huésped, con hipervínculos activos en tono óxido pastel y estética limpia Zen.
- **Envío en 1 Clic:** Podés **Copiar** el texto formateado, pulsar **Simular** o tocar **"Abrir en WhatsApp Real"** para disparar la conversación directamente al número del pasajero.

💡 *Podés acceder desde el menú lateral en **Avisos & WhatsApp**, desde la lista de reservas en el acordeón de cada fila, o desde la vista móvil en **Acciones Rápidas**.*`;
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

  // 8. OCUPACIÓN, QUIÉN LLEGA HOY, PRÓXIMO CHECK-IN, SALIDAS
  if (
    q.includes('proximo') ||
    q.includes('próximo') ||
    q.includes('siguiente') ||
    q.includes('ocupad') ||
    q.includes('ocupacion') ||
    q.includes('ocupación') ||
    q.includes('disponib') ||
    q.includes('libre') ||
    q.includes('quien llega') ||
    q.includes('quién llega') ||
    q.includes('quien sale') ||
    q.includes('quién sale') ||
    q.includes('check in') ||
    q.includes('check-in') ||
    q.includes('check out') ||
    q.includes('check-out') ||
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
    const activeRes = reservations.filter((r: any) => r.status !== 'cancelled');

    const occupiedCount = Math.min(
      totalProps,
      activeRes.filter((r: any) => r.checkIn <= todayStr && r.checkOut > todayStr).length
    );
    const occupancyRate = Math.round((occupiedCount / Math.max(1, totalProps)) * 100);

    const checkInsToday = activeRes.filter((r: any) => r.checkIn === todayStr);
    const checkOutsToday = activeRes.filter((r: any) => r.checkOut === todayStr);
    
    // Future check-ins sorted chronologically
    const upcomingCheckIns = activeRes
      .filter((r: any) => r.checkIn >= todayStr)
      .sort((a: any, b: any) => a.checkIn.localeCompare(b.checkIn));

    const nextCheckIn = upcomingCheckIns[0];

    // If query specifically asks about next check-in or who arrives
    if (
      q.includes('proximo') ||
      q.includes('próximo') ||
      q.includes('siguiente') ||
      q.includes('quien llega') ||
      q.includes('quién llega') ||
      (q.includes('check in') && !q.includes('todos'))
    ) {
      if (checkInsToday.length > 0) {
        const first = checkInsToday[0];
        const pName = properties.find((p: any) => p.id === first.propertyId)?.name || 'Cabaña';
        return `### 🛏️ Próximo Check-In: ¡Ingresa Hoy!

Hoy ingresa **${first.guestName}** en *${pName}* (${first.platform.toUpperCase()}):
- 📅 **Fechas:** ${formatFriendlyDates(first.checkIn, first.checkOut)} (${first.nights} noches).
- 💰 **Total:** ${first.totalAmount} USD (Estado de cobro: ${first.paymentStatus === 'paid' ? '100% Abonado' : 'Saldo pendiente'}).
- 📞 **Contacto:** ${first.guestPhone || 'Sin teléfono'}.

${upcomingCheckIns.length > 1 ? `📋 **Siguientes ingresos programados:**\n` + upcomingCheckIns.slice(1, 4).map((r: any) => {
  const p = properties.find((prop: any) => prop.id === r.propertyId)?.name || 'Cabaña';
  return `• **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
}).join('\n') : ''}`;
      }

      if (nextCheckIn) {
        const pName = properties.find((p: any) => p.id === nextCheckIn.propertyId)?.name || 'Cabaña';
        return `### 🛏️ Próximo Check-In Programado

El próximo ingreso es **${nextCheckIn.guestName}** en *${pName}* (${nextCheckIn.platform.toUpperCase()}):
- 📅 **Fechas de estadía:** ${formatFriendlyDates(nextCheckIn.checkIn, nextCheckIn.checkOut)} (${nextCheckIn.nights} noches).
- 💰 **Importe:** ${nextCheckIn.totalAmount} USD (Neto: ${nextCheckIn.netRevenue} USD).
- 📞 **Contacto:** ${nextCheckIn.guestPhone || 'Sin teléfono'}.

📋 **Siguientes ingresos confirmados:**
${upcomingCheckIns.slice(1, 4).map((r: any) => {
  const p = properties.find((prop: any) => prop.id === r.propertyId)?.name || 'Cabaña';
  return `• **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
}).join('\n')}

💡 *Podés ver y modificar reservas directamente en el **Rack Calendario**.*`;
      }
    }

    const listSnippet = upcomingCheckIns
      .slice(0, 4)
      .map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || 'Cabaña';
        return `• **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
      })
      .join('\n');

    return `### 🛏️ Estado de Ocupación y Reservas en Tiempo Real

📊 **Ocupación Actual:**
- **Nivel de Ocupación:** **${occupancyRate}%** (${occupiedCount} de ${totalProps} unidades ocupadas).
- **Total de Reservas Activas:** **${activeRes.length} reservas registradas**.
- **Ingresos hoy (Check-in):** ${checkInsToday.length > 0 ? `${checkInsToday.length} pasajeros ingresando hoy` : 'Sin ingresos previstos para hoy'}.
- **Salidas hoy (Check-out):** ${checkOutsToday.length > 0 ? `${checkOutsToday.length} salidas previstas hoy` : 'Sin salidas para hoy'}.

📋 **Próximos Ingresos Programados:**
${listSnippet || 'ℹ️ *No hay reservas futuras inmediatas.*'}

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
