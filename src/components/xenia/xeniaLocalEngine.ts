import { DemoState } from '../../types';
import { toLocalDateStr, formatCurrency, withHs } from '../../data/initialData';
import { isAppMode } from '../../lib/appMode';
import { auth } from '../../lib/firebase';
import { findUnitInText, parseDateRange } from '../../lib/xeniaDates';

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

function platformLabel(platform: string): string {
  const map: Record<string, string> = { direct: 'Directa', airbnb: 'Airbnb', booking: 'Booking', vrbo: 'VRBO' };
  return map[platform] || platform;
}

export function getClientXeniaReply(message: string, demoState?: DemoState | any): string {
  const q = (message || '').toLowerCase().trim();
  const safeState = demoState || {};
  const properties = safeState.properties || [];
  const reservations = safeState.reservations || [];
  const cleaningTasks = safeState.cleaningTasks || [];
  const p0 = properties[0];
  // En la app real Xenia es el copiloto del anfitrión: nunca responde como si hablara con un huésped
  const isApp = isAppMode();
  // Preguntas operativas del anfitrión sobre reservas ("¿cuándo es el próximo check-in?", "¿quién llega hoy?")
  const isHostOpsQuery =
    /pr[oó]xim|siguiente|qui[eé]n (llega|sale|entra|se va|ingresa)|cu[aá]ndo (llega|es el|entra|ingresa|sale)|llegadas|salidas|ocupaci|ocupad|cu[aá]nt[oa]s (reservas|huéspedes|huespedes)|reservas (de|para) (hoy|mañana|esta semana)|check.?ins? de hoy|check.?outs? de hoy/.test(
      q
    );

  // =========================================================================
  // RESPUESTAS RÁPIDAS DE PRIMEROS PASOS EN MODO APP
  // =========================================================================
  if (
    q.includes('cargo mis unidades') ||
    q.includes('cargar mis unidades') ||
    q.includes('cargar unidades') ||
    q.includes('cargo una unidad') ||
    q.includes('agregar una unidad') ||
    q.includes('agregar cabaña') ||
    q.includes('cargar cabañas') ||
    q.includes('editar mis unidades') ||
    q.includes('configurar unidades')
  ) {
    return 'Para cargar o editar tus unidades andá a Administración → Unidades y calendarios. Ahí ponés nombre, capacidad, wifi y fotos de cada una.';
  }

  if (
    q.includes('paso las reservas') ||
    q.includes('pasar reservas') ||
    q.includes('importar reservas') ||
    q.includes('importar ical') ||
    q.includes('excel') ||
    q.includes('planilla')
  ) {
    return 'Podés importarlas desde Reservas → Ocupación (Calendario) → Importar iCal / CSV. Si preferís, mandanos tu planilla por WhatsApp al +54 9 11 4092-5939 y te la cargamos nosotros en 72 hs hábiles.';
  }

  if (
    q.includes('edito la guía') ||
    q.includes('edito la guia') ||
    q.includes('editar la guía') ||
    q.includes('editar la guia') ||
    q.includes('guía de mis huéspedes') ||
    q.includes('guia de mis huéspedes') ||
    q.includes('guía de mis huespedes') ||
    q.includes('guia de mis huespedes')
  ) {
    return 'La guía de tus huéspedes se edita en Reservas → Tu Web y Guía → Ajustes & Edición de Datos. Cargá tu teléfono de anfitrión, el wifi y las normas.';
  }

  if (
    q.includes('primeros pasos') ||
    q.includes('como empiezo') ||
    q.includes('cómo empiezo') ||
    q.includes('por donde empiezo') ||
    q.includes('por dónde empiezo')
  ) {
    return 'Te recomiendo seguir los Primeros pasos que ves arriba del Panel Hoy, en orden. Si te trabás, escribinos por WhatsApp al +54 9 11 4092-5939.';
  }

  // =========================================================================
  // DISPONIBILIDAD ENTRE FECHAS ("¿qué hay libre del 5 al 10 de noviembre?")
  // =========================================================================
  const asksAvailability = /libre|disponib|vacante|desocupad|hay lugar|tengo lugar|tenes lugar|tenés lugar|ocupad/.test(q);
  if (asksAvailability && properties.length > 0) {
    const range = parseDateRange(q, toLocalDateStr(new Date()));
    if (range) {
      const nights = Math.round((Date.parse(range.checkOut + 'T00:00:00Z') - Date.parse(range.checkIn + 'T00:00:00Z')) / 86400000);
      const asked: any = findUnitInText(q, properties);
      const list = asked ? [asked] : properties;
      const active = reservations.filter((r: any) => r.status !== 'cancelled');
      const free: string[] = [];
      const busy: string[] = [];
      for (const p of list as any[]) {
        const clash = active
          .filter((r: any) => r.propertyId === p.id && r.checkIn < range.checkOut && r.checkOut > range.checkIn)
          .sort((a: any, b: any) => a.checkIn.localeCompare(b.checkIn));
        if (clash.length === 0) free.push(p.name);
        else
          busy.push(
            `• **${p.name}**: ${clash
              .map((r: any) => `${(r.guestName || 'Reserva').split(' ')[0]} ${formatFriendlyDates(r.checkIn, r.checkOut)}`)
              .join(' · ')}`
          );
      }
      const when = `${formatFriendlyDates(range.checkIn, range.checkOut)} (${nights} ${nights === 1 ? 'noche' : 'noches'})`;
      if (asked) {
        return free.length
          ? `**${asked.name}** está libre ${when}.`
          : `**${asked.name}** no está libre ${when}. Ocupada por ${busy.join(' ').replace(/^• \*\*[^*]+\*\*: /, '')}.`;
      }
      return `### 🗓️ Disponibilidad ${when}

${free.length ? `**Libres:** ${free.join(', ')}.` : '**No queda ninguna unidad libre todas esas noches.**'}
${busy.length ? `\n**Ocupadas en parte o del todo:**\n${busy.join('\n')}` : ''}

La salida es el día que se van: esa noche ya queda libre.`;
    }
    if (/fecha|del |desde|hasta|cu[aá]ndo/.test(q)) {
      return 'Decime las fechas y te digo qué unidades están libres. Por ejemplo: "¿qué hay libre del 5 al 10 de noviembre?" o "¿el Dept A está libre el 20/12?".';
    }
  }

  // =========================================================================
  // FUNCIONES DE LA APP (temas concretos, antes que las búsquedas generales)
  // =========================================================================
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has('tu web', 'pagina web', 'página web', 'sitio web', 'web propia', 'reservas directas', 'reserva directa', 'motor de reserva')) {
    return `### 🌐 Tu Web

Es tu página de reservas directas: fotos, tus alojamientos, buscador de fechas y el precio de la estadía según tus Tarifas. El huésped elige fechas y te escribe por WhatsApp con el pedido armado; vos confirmás y cobrás directo, sin comisiones.

**Dónde se arma:** Reservas → **Tu Web y Guía** → pestaña **Tu Web**. Elegís el nombre del link (loomisuite.net/web/tu-complejo), cargás frase, presentación, WhatsApp y fotos, y elegís el estilo (Noche, Día o Clara). Con **Ver cómo queda** la ves antes de publicarla.

La disponibilidad se actualiza sola con tus reservas y calendarios. No cobra ni confirma sola: eso lo hacés vos.`;
  }

  if (has('tarifa', 'temporada', 'finde largo', 'fin de semana largo', 'precio por noche', 'precios por noche', 'cargar precios', 'cargo los precios')) {
    return `### 💲 Tarifas

Se cargan en **Administración → Tarifas**:
1. Creá los tipos de alojamiento (por ejemplo "Depto 2 personas") y asigná cada unidad a su tipo.
2. Cargá la tarifa normal (entre semana y fin de semana) y, si querés, temporadas con sus fechas y mínimo de noches.
3. Los fines de semana largos de Argentina ya vienen cargados: solo ponés el precio.

Con eso Loomi calcula el precio de cada estadía al cargar una reserva y en Tu Web.`;
  }

  if (has('invit', 'mi personal', 'empleado', 'equipo y accesos', 'darle acceso', 'dar acceso', 'usuario para', 'cuenta para mi', 'recepcionista')) {
    return `### 👥 Equipo y accesos

En **Administración → Equipo y accesos** tocás **Invitar**, ponés el mail de la persona y elegís el rol:
- **Recepción:** reservas, calendario, cobros y caja (sin finanzas ni configuración).
- **Limpieza:** sus limpiezas con el checklist y quién llega (sin teléfonos ni importes).

Le llega la invitación, entra con su propia cuenta y ve solo lo suyo. El acceso se quita desde la misma pantalla.`;
  }

  if (has('pre check', 'precheck', 'pre-check', 'datos del huesped', 'datos del huésped', 'documento del huesped', 'documento del huésped', 'dni')) {
    return `### 📋 Pre check-in

El huésped completa sus datos (documento, cantidad de personas, hora de llegada y acompañantes) desde el link de su guía, antes de llegar.

En la ficha de la reserva ves si está **Pre check-in completo** o **pendiente**; si falta, el botón **Pedir por WhatsApp** le manda el link listo.`;
  }

  if (has('recordatorio', 'recordarme', 'que no me olvide', 'avisame el', 'avisame cuando')) {
    return `### ⏰ Recordatorios

En la **Agenda** del celular tocás **+ Recordatorio**: ponés la fecha, el texto y si se repite (nunca, semanal, cada 15 días, mensual o anual). Los atrasados aparecen arriba en rojo y los tildás cuando están hechos.`;
  }

  if (has('vuelo', 'hora de llegada', 'nota de la reserva', 'notas de la reserva', 'anotar algo en la reserva')) {
    return `### ✈️ Llegada y notas

En la ficha de cada reserva está el recuadro **Llegada y notas**: vuelo, aeropuerto o terminal, hora estimada de llegada y notas libres. Se edita directo, sin entrar a "Editar". Si el huésped dejó su hora en el pre check-in, Loomi te la ofrece.`;
  }

  if (has('pedir pago', 'pedir el pago', 'pedir el saldo', 'pedir la seña', 'pedir la sena', 'cobrar el saldo', 'cobrar la seña', 'datos de cobro', 'mandar el cbu', 'pasar el alias')) {
    return `### 💳 Pedir un pago

1. Cargá una sola vez tus datos de cobro: en el celular, **Más → Datos de cobro** (alias, CBU, link de Mercado Pago, PayPal o Payoneer).
2. En la **Agenda**, tocá al huésped → **Acciones Rápidas** → **1. Pedir pago / saldo**. Se arma el mensaje de WhatsApp con el saldo y solo las formas de pago que cargaste.

Cuando te paga, lo anotás en la ficha de la reserva con **Registrar Pago**: Loomi calcula sola la seña y el saldo.`;
  }

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
    if (isApp) {
      return `Si un huésped te reporta un problema en la unidad, lo mejor es responderle rápido por WhatsApp y coordinar quién se acerca. Podés abrir su reserva desde el calendario y tocar **Enviar Plantilla por WhatsApp** para escribirle.

Si lo que no funciona es algo de Loomi Suite (calendarios, pagos, la guía), contame qué pasa o escribinos por WhatsApp al +54 9 11 4092-5939 y lo revisamos.`;
    }
    return `Lamento sinceramente este inconveniente durante tu estadía.

Ya mismo le di aviso prioritario a nuestro anfitrión y equipo del complejo para que se acerque y se comunique con vos de forma inmediata para resolverlo juntos.

Quedamos a tu completa disposición para asistirte en lo que precises.`;
  }

  // =========================================================================
  // DIRECTIVAS OMOTENASHI: 2. AUTONOMÍA (CHECK-IN/OUT, WI-FI, CERRADURA, MAPA)
  // =========================================================================
  if (
    !isHostOpsQuery &&
    (q.includes('horario') ||
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
    q.includes('dirección'))
  ) {
    if (isApp) {
      const guide = safeState.welcomeGuide || {};
      const uid = auth?.currentUser?.uid;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.loomisuite.net';
      const unitsInfo = properties
        .slice(0, 6)
        .map(
          (p: any) =>
            `• **${p.name}:** Wi-Fi ${p.wifiNetwork ? `**${p.wifiNetwork}**` : '_sin cargar_'}${
              p.wifiPassword ? ` (clave **${p.wifiPassword}**)` : ''
            } · Dirección: ${p.address || '_sin cargar_'}`
        )
        .join('\n');
      return `Estos son los datos que ven tus huéspedes en su guía:

• **Check-in:** ${guide.checkinHour ? `desde las ${withHs(String(guide.checkinHour).replace(/\s*hs\.?$/i, ''))}` : '_sin cargar_ (se carga en Reservas → Tu Web y Guía)'}
• **Check-out:** ${guide.checkoutHour ? `hasta las ${withHs(String(guide.checkoutHour).replace(/\s*hs\.?$/i, ''))}` : '_sin cargar_ (se carga en Reservas → Tu Web y Guía)'}
${unitsInfo || '• Todavía no cargaste unidades.'}

Para cambiarlos: Wi-Fi y dirección en **Administración → Unidades y calendarios**; horarios y normas en **Reservas → Tu Web y Guía → Ajustes & Edición de Datos**.${
        uid ? `\n\nLink de tu guía: ${origin}/guia/${uid}` : ''
      }

Si querías saber cuándo llega tu próximo huésped, preguntame *"¿cuándo es el próximo check-in?"*.`;
    }
    const wifiNet = p0?.wifiNetwork || '(a confirmar)';
    const wifiPass = p0?.wifiPassword || '(a confirmar)';
    const rawPin = demoState?.reservations?.[0]?.pinCode;
    const pinText = rawPin
      ? `Cerradura digital con PIN **${rawPin}**.`
      : 'Tu código de acceso te lo enviamos antes de tu llegada.';
    const address = p0?.address || '(a confirmar)';

    return `¡Hola! Con gusto te paso los datos para tu llegada y estancia:

• **Horarios:** Check-in a partir de las 14:00 hs | Check-out hasta las 10:00 hs.
• **Acceso autónomo:** ${pinText}
• **Wi-Fi:** Red **${wifiNet}** (Clave: **${wifiPass}**).
• **Dirección:** ${address}.

Podés consultar el mapa interactivo y todos los detalles en tu **Portal del Huésped**:
👉 https://loomisuite.net/guia/${p0?.id || 'cab-lapacho'}`;
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
    if (isApp) {
      const addons: any[] = safeState.availableAddons || safeState.addons || [];
      if (addons.length === 0) {
        return 'Todavía no cargaste servicios opcionales (cochera, late check-out, traslados, desayuno…). Los agregás en **Reservas → Opcionales y extras**, con el precio que vos definas.';
      }
      return `Tus servicios opcionales cargados:

${addons
  .map((a: any) => `• **${a.name}:** ${a.price > 0 ? formatCurrency(a.price) : '_sin precio_'}`)
  .join('\n')}

Los editás en **Reservas → Opcionales y extras**. Para sumar uno a una reserva, abrila y agregalo en la ficha.`;
    }
    return `¡Por supuesto! Contamos con los siguientes servicios adicionales en el complejo:

• **Estacionamiento privado techado:** Incluido sin cargo en cada cabaña.
• **Late Check-out:** Salida extendida hasta las 17:00 hs sujeta a disponibilidad (USD 20).
• **Transfer Aeropuerto Cataratas (IGR):** Recepción personalizada en arribos y traslados (USD 25 por viaje).
• **Canasta de Desayuno Misionero:** Chipitas caseras de almidón calientes, mermeladas de frutos de la selva y café (USD 12 / persona).
• **Bolsa de Leña Seca & Carbón:** Lista en el parrillero de tu cabaña (USD 5).
• **Excursión guiada Parque Nacional Iguazú:** Traslado y guía bilingüe (USD 40 / persona).

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
    return `### 📱 Vista de celular y vista completa

- **De la compu al celular:** arriba a la derecha, **Más → Modo Celular Ágil**. Es la vista simple para el día a día: Agenda, Calendario, Avisos, Xenia y Más.
- **Del celular a la vista completa:** en la pestaña **Más**, **Cambiar a vista completa (PC)**, o el ícono de la computadora arriba.

La vista completa es la mejor para mirar el calendario general, las finanzas y la configuración.`;
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
    return `### ⏹️ Pausar o silenciar a Xenia

- Mientras hablo, tocá **⏹️ PARAR** para cortar la respuesta.
- Con **Voz ON / Voz Mute** apagás o prendés la voz: así me leés sin audio.
- Si tocaste el micrófono, tocalo de nuevo para terminar.`;
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
    return `### 👋 Enviar la bienvenida y la guía al huésped

**En el celular:** en la **Agenda**, tocá al huésped → **Acciones Rápidas** → **2. Enviar Bienvenida & Guía Digital**. Se abre WhatsApp con el mensaje listo: saludo con su nombre, el link de su guía (cómo llegar, wifi, horarios, recomendaciones) y el horario de ingreso.

**En la compu:** abrí la reserva y tocá **Enviar Plantilla por WhatsApp**, o andá a **Reservas → Avisos y WhatsApp**, y elegí **Confirmación & Bienvenida Anticipada**.

La guía se abre en el navegador del celular: el huésped no tiene que bajar ninguna app.`;
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
    return `### ✏️ Modificar una reserva

1. Abrila desde **Reservas → Ocupación (Calendario)** o buscala en **Reservas → Lista de reservas**.
2. Tocá el **lápiz (✏️)** para editar: fechas, unidad, precio, cantidad de personas y estado. Para cancelarla, elegí el estado **Cancelada** y las fechas quedan libres.
3. Los pagos se anotan con **Registrar Pago** (monto, moneda y medio): la seña y el saldo se calculan solos.
4. Guardá: se actualizan el calendario, los números y la limpieza.

Si el cambio lo hizo el huésped en Airbnb o Booking, se actualiza solo con la sincronización de calendarios (cada 15 minutos más o menos).`;
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
      const now = new Date();
      const num = String(now.getMonth() + 1).padStart(2, '0');
      targetMonth = Object.values(monthsMap).find((m) => m.num === num) || null;
    }

    if (targetMonth) {
      const unitAsked: any = findUnitInText(q, properties);
      const monthReservations = reservations.filter((r: any) => {
        if (unitAsked && r.propertyId !== unitAsked.id) return false;
        // Mes pedido del año en curso; si quedó hace más de medio año, se entiende que es el del año que viene
        const now = new Date();
        const year = Number(targetMonth.num) < now.getMonth() + 1 - 6 ? now.getFullYear() + 1 : now.getFullYear();
        const prefix = `${year}-${targetMonth.num}`;
        return r.status !== 'cancelled' && r.checkIn && r.checkIn.startsWith(prefix);
      });

      const monthGross = monthReservations.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0);
      const monthCommissions = monthReservations.reduce((acc: number, r: any) => acc + (r.commissionPaid || 0), 0);
      const monthNet = monthReservations.reduce((acc: number, r: any) => acc + (r.netRevenue || 0), 0);
      const monthNights = monthReservations.reduce((acc: number, r: any) => acc + (r.nights || 0), 0);
      const monthDirect = monthReservations.filter((r: any) => r.platform === 'direct').length;

      const snippet = monthReservations.slice(0, 6).map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
        return `• **${r.guestName}** en *${pName}* (${platformLabel(r.platform)}): ${formatFriendlyDates(r.checkIn, r.checkOut)} — **${formatCurrency(r.totalAmount)}** (Neto: ${formatCurrency(r.netRevenue)})`;
      }).join('\n');

      // Por unidad (solo si se pregunta por todo el complejo y hay más de una)
      const perUnit =
        !unitAsked && properties.length > 1
          ? properties
              .map((p: any) => {
                const list = monthReservations.filter((r: any) => r.propertyId === p.id);
                const nights = list.reduce((acc: number, r: any) => acc + (r.nights || 0), 0);
                const total = list.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0);
                return `• **${p.name}:** ${list.length} ${list.length === 1 ? 'reserva' : 'reservas'}, ${nights} noches, ${formatCurrency(total)}`;
              })
              .join('\n')
          : '';

      return `### 📊 ${unitAsked ? `${unitAsked.name} en ${targetMonth.name}` : `Ganancias y facturación de ${targetMonth.name}`}

${unitAsked ? `Esto es lo de **${unitAsked.name}** en **${targetMonth.name}**:` : `Aquí tenés el desglose de tu negocio para **${targetMonth.name}**:`}

- 💰 **Ganancia Neta Real en Mano:** **${formatCurrency(monthNet)}** *(lo que te queda limpio en el bolsillo después de descontar comisiones)*.
- 💵 **Facturación Bruta Total:** **${formatCurrency(monthGross)}** sobre **${monthReservations.length} reservas registradas** (${monthNights} noches vendidas).
- 🏷️ **Comisiones Deducidas por OTAs (Airbnb/Booking):** **-${formatCurrency(monthCommissions)}**.
- 🌟 **Reservas directas (sin comisión):** ${monthDirect} de ${monthReservations.length}.
${perUnit ? `\n🏠 **Por unidad:**\n${perUnit}\n` : ''}
${monthReservations.length > 0 ? `📋 **Estadías del mes de ${targetMonth.name}:**\n${snippet}\n${monthReservations.length > 6 ? `*(y ${monthReservations.length - 6} reservas más en el sistema)*` : ''}` : `ℹ️ *Aún no hay reservas registradas específicamente para ${targetMonth.name}.*`}

💡 *Podés ver el informe detallado y liquidaciones en **Administración → Rendimiento financiero**.*`;
    }

    // General financial overview
    const totalGross = reservations.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0);
    const totalCommissions = reservations.reduce((acc: number, r: any) => acc + (r.commissionPaid || 0), 0);
    const totalNet = reservations.reduce((acc: number, r: any) => acc + (r.netRevenue || 0), 0);
    const totalNights = reservations.reduce((acc: number, r: any) => acc + (r.nights || 0), 0);
    const directCount = reservations.filter((r: any) => r.platform === 'direct').length;

    const pendingPayments = reservations.filter(
      (r: any) => r.paymentStatus === 'pending' || r.paymentStatus === 'deposit_only'
    );

    return `### 📊 Rendición Financiera y Ganancias de tu Negocio

Aquí tenés el balance económico actualizado en tiempo real:

- 💰 **Ganancia Neta Real en Mano:** **${formatCurrency(totalNet)}** *(después de tasas y comisiones de canales)*.
- 💵 **Facturación Bruta Total:** **${formatCurrency(totalGross)}** sobre **${reservations.length} reservas registradas** (${totalNights} noches).
- 🏷️ **Comisiones Deducidas por Plataformas (OTAs):** **-${formatCurrency(totalCommissions)}** (Booking, Airbnb).
- 🌟 **Reservas directas (sin comisión):** ${directCount} de ${reservations.length}.

${pendingPayments.length > 0 ? `⚠️ **Cobros y Saldos Pendientes:** Tenés ${pendingPayments.length} reservas con saldo pendiente de cobro en mostrador.` : '✅ *Todos los cobros de reservas confirmadas están al día.*'}

💡 *Preguntame por un mes (por ejemplo "¿cuánto gané en noviembre?") para ver el detalle.*`;
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
    return `### 🏷️ Planes de Loomi Suite

Dos planes con precio fijo por todo el complejo, en dólares (sin cobro por unidad ni comisiones por reserva):

1. **Loomi:** **USD 30 por mes.** Para dueños de hasta 5 unidades sin personal.
2. **Loomi Suite:** **USD 45 por mes.** Para complejos con recepción y limpieza: cada persona entra con su cuenta.

La prueba gratis dura **7 días**.

**Cómo se paga:** por **transferencia en pesos**, al dólar MEP del día, o en dólares por **Payoneer**, con 10% de descuento. Los datos están en **Mi plan**, en el menú de tu cuenta; cuando pagás, tocás **"Ya pagué"** y lo confirmamos.

**Cobros a tus huéspedes:** te pagan directo a vos. Loomi no cobra ningún porcentaje sobre tus reservas.`;
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
    return `### 🔑 Llaves y forma de ingreso

Loomi funciona con la llave de siempre: no hace falta ninguna cerradura especial.

Cargá **cómo es el ingreso** en Reservas → **Tu Web y Guía → 3. Ajustes & Edición de Datos** (por ejemplo "Anunciate en la casa de al lado, ahí te dan las llaves"). Aparece destacado en la guía del huésped y se agrega a los mensajes de confirmación y del día de llegada.`;
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
    return `### 🧹 Limpieza

- Cada reserva genera sola la limpieza del día de salida, también las que llegan de Airbnb o Booking.
- Las ves en **Limpieza → Agenda de limpiezas**, con su checklist.
- Tu personal de limpieza entra con **su propia cuenta** (lo invitás en Administración → Equipo y accesos) y ve solo sus limpiezas y quién llega, sin teléfonos ni importes.
- Cuando terminan, marcan el checklist y la pasan a **Inspeccionado / Listo**.`;
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
    return `### 💬 Mensajes de WhatsApp

Loomi trae **5 mensajes listos** para cada momento de la estadía:
1. Confirmación & Bienvenida Anticipada
2. Coordinación del Día de Llegada
3. Control de Confort (unas horas después de llegar)
4. Recordatorio de Check-out
5. Solicitud de Reseña

Se completan solos con el nombre del huésped, las fechas, la unidad y el link de su guía, en español, inglés o portugués. Se abren en WhatsApp **listos para enviar con un toque**: no se mandan solos.

Cada mensaje se puede editar con **Editar** en **Reservas → Avisos y WhatsApp**. En el celular, están en el botón de WhatsApp de cada huésped en la **Agenda**.`;
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
    return `### 🔄 Sincronizar Airbnb y Booking

1. En Airbnb o Booking buscá **Exportar calendario** y copiá el link que termina en .ics.
2. En Loomi andá a **Administración → Unidades y calendarios**, tocá el lápiz de la unidad y, en **Calendarios conectados**, pegalo en el campo del portal.
3. En esa misma pantalla copiá **Tu calendario de Loomi** y pegalo en Airbnb y Booking, en **Importar calendario**.

Loomi trae las reservas cada 15 minutos más o menos. No es instantáneo (así funciona el iCal en todos los sistemas), por eso te avisa si dos reservas se superponen.`;
  }

  // 7.5 CARGAR RESERVA NUEVA / TELEFÓNICA
  if (
    q.includes('reserva telefónica') ||
    q.includes('reserva telefonica') ||
    q.includes('cargo una reserva') ||
    q.includes('cargar una reserva') ||
    q.includes('nueva reserva') ||
    q.includes('agendar una reserva')
  ) {
    return 'Para cargar una reserva tocá **+ Nueva reserva** en el menú Reservas (o tocá un día libre en el calendario). Elegí la unidad y las fechas, completá el nombre y el teléfono del huésped, y si dejó seña marcala como pagada. La reserva aparece al instante en el calendario y se genera sola la limpieza del día de salida.';
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
    const totalProps = properties.length;
    if (totalProps === 0) {
      return 'Todavía no cargaste unidades. Empezá por Administración → Unidades y calendarios y después te muestro la ocupación.';
    }

    const todayStr = toLocalDateStr(new Date());
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
        const pName = properties.find((p: any) => p.id === first.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
        return `### 🛏️ Próximo Check-In: ¡Ingresa Hoy!

Hoy ingresa **${first.guestName}** en *${pName}* (${platformLabel(first.platform)}):
- 📅 **Fechas:** ${formatFriendlyDates(first.checkIn, first.checkOut)} (${first.nights} noches).
- 💰 **Total:** ${formatCurrency(first.totalAmount)} (Estado de cobro: ${first.paymentStatus === 'paid' ? '100% Abonado' : 'Saldo pendiente'}).
- 📞 **Contacto:** ${first.guestPhone || 'Sin teléfono'}.

${upcomingCheckIns.length > 1 ? `📋 **Siguientes ingresos programados:**\n` + upcomingCheckIns.slice(1, 4).map((r: any) => {
  const p = properties.find((prop: any) => prop.id === r.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
  return `• **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${formatCurrency(r.totalAmount)})`;
}).join('\n') : ''}`;
      }

      if (nextCheckIn) {
        const pName = properties.find((p: any) => p.id === nextCheckIn.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
        const following = upcomingCheckIns.slice(1, 4);
        return `### 🛏️ Próximo Check-In Programado
${q.includes('hoy') ? '\nHoy no hay ingresos.\n' : ''}
El próximo ingreso es **${nextCheckIn.guestName}** en *${pName}* (${platformLabel(nextCheckIn.platform)}):
- 📅 **Fechas de estadía:** ${formatFriendlyDates(nextCheckIn.checkIn, nextCheckIn.checkOut)} (${nextCheckIn.nights} noches).
- 💰 **Importe:** ${formatCurrency(nextCheckIn.totalAmount)} (Neto: ${formatCurrency(nextCheckIn.netRevenue)}).
- 📞 **Contacto:** ${nextCheckIn.guestPhone || 'Sin teléfono'}.

${following.length > 0 ? `📋 **Siguientes ingresos confirmados:**\n${following.map((r: any) => {
  const p = properties.find((prop: any) => prop.id === r.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
  return `• **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${formatCurrency(r.totalAmount)})`;
}).join('\n')}\n\n` : ''}💡 *Las ves y las modificás en **Reservas → Ocupación (Calendario)**.*`;
      }
    }

    const listSnippet = upcomingCheckIns
      .slice(0, 4)
      .map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || (isApp ? 'Unidad' : 'Cabaña');
        return `• **${r.guestName}** en *${pName}* (${platformLabel(r.platform)}): ${formatFriendlyDates(r.checkIn, r.checkOut)} (${formatCurrency(r.totalAmount)})`;
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

💡 *Las ves y las modificás en **Reservas → Ocupación (Calendario)**.*`;
  }

  // DEFAULT
  return `### 👋 Hola, soy Xenia

Te puedo ayudar con:
1. **Reservas:** quién llega, cómo cargar o modificar una reserva, pedir un pago.
2. **Tu Web y la guía del huésped.**
3. **Tarifas** y **Equipo y accesos.**
4. **Calendarios:** cómo conectar Airbnb y Booking.
5. **Números:** por ejemplo "¿cuánto gané este mes?".

Si no sé algo, escribinos por WhatsApp al +54 9 11 4092-5939 (de 8 a 22 hs).

*¿Qué te gustaría consultar o resolver?*`;
}
