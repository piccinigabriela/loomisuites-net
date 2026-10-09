var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_genai = require("@google/genai");

// src/components/xenia/xeniaLocalEngine.ts
function formatFriendlyDates(checkIn, checkOut) {
  if (!checkIn || !checkOut) return `${checkIn || ""} al ${checkOut || ""}`;
  const pIn = checkIn.split("-");
  const pOut = checkOut.split("-");
  if (pIn.length === 3 && pOut.length === 3) {
    const months = [
      "",
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre"
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
function getClientXeniaReply(message, demoState) {
  const q = (message || "").toLowerCase().trim();
  const safeState = demoState || {};
  const properties = safeState.properties || [];
  const reservations = safeState.reservations || [];
  const cleaningTasks = safeState.cleaningTasks || [];
  const p0 = properties[0];
  if (q.includes("rompio") || q.includes("rompi\xF3") || q.includes("roto") || q.includes("no anda") || q.includes("no funciona") || q.includes("reclamo") || q.includes("queja") || q.includes("no hay agua") || q.includes("sin agua") || q.includes("sin luz") || q.includes("corte de luz") || q.includes("aire acondicionado") || q.includes("no enfria") || q.includes("no enfr\xEDa") || q.includes("ruido") || q.includes("ruidos") || q.includes("llave trabada") || q.includes("cerradura trabada") || q.includes("urgencia") || q.includes("emergencia") || q.includes("mancha") || q.includes("olor")) {
    return `Lamento sinceramente este inconveniente durante tu estad\xEDa.

Ya mismo le di aviso prioritario a nuestro anfitri\xF3n y equipo del complejo para que se acerque y se comunique con vos de forma inmediata para resolverlo juntos.

Quedamos a tu completa disposici\xF3n para asistirte en lo que precises.`;
  }
  if (q.includes("horario") || q.includes("a que hora") || q.includes("a qu\xE9 hora") || q.includes("check in") || q.includes("check-in") || q.includes("check out") || q.includes("check-out") || q.includes("ingreso") || q.includes("salida") || q.includes("wifi") || q.includes("wi-fi") || q.includes("clave") || q.includes("contrase\xF1a") || q.includes("cerradura") || q.includes("pin") || q.includes("codigo") || q.includes("c\xF3digo") || q.includes("como llego") || q.includes("c\xF3mo llego") || q.includes("ubicacion") || q.includes("ubicaci\xF3n") || q.includes("direccion") || q.includes("direcci\xF3n")) {
    const wifiNet = p0?.wifiNetwork || "Loomi_Fibra_Optica";
    const wifiPass = p0?.wifiPassword || "Bienvenido2026";
    const pin = demoState?.reservations?.[0]?.pinCode || "1024";
    const address = p0?.address || "Tres Sargentos 400, Retiro / Catalinas Norte, CABA";
    return `\xA1Hola! Con gusto te paso los datos para tu llegada y estancia:

\u2022 **Horarios:** Check-in a partir de las 14:00 hs | Check-out hasta las 10:00 hs.
\u2022 **Acceso aut\xF3nomo:** Cerradura digital touch con PIN **${pin}#**.
\u2022 **Wi-Fi:** Red **${wifiNet}** (Clave: **${wifiPass}**).
\u2022 **Direcci\xF3n:** ${address}.

Pod\xE9s consultar el mapa interactivo y todos los detalles en tu **Portal del Hu\xE9sped**:
\u{1F449} https://loomisuite.net/guia/${p0?.id || "departamento"}`;
  }
  if (q.includes("cochera") || q.includes("estacionamiento") || q.includes("auto") || q.includes("late check") || q.includes("salida tarde") || q.includes("quedarme mas") || q.includes("quedarme m\xE1s") || q.includes("transfer") || q.includes("traslado") || q.includes("aeropuerto") || q.includes("desayuno") || q.includes("spa") || q.includes("masaje")) {
    return `\xA1Por supuesto! Contamos con los siguientes servicios adicionales en el complejo:

\u2022 **Cochera privada cubierta:** Vigilada 24hs (USD 15 / d\xEDa).
\u2022 **Late Check-out:** Salida extendida hasta las 16:00 hs sujeta a disponibilidad (USD 20).
\u2022 **Transfer Aeropuerto (AEP/EZE):** Recepci\xF3n personalizada en arribos (USD 30 por viaje).
\u2022 **Canasta de Desayuno Artesanal:** Medialunas, tostadas y caf\xE9 de especialidad (USD 14 / persona).

Si quer\xE9s sumar alguno de estos servicios a tu reserva, avisanos y te lo dejamos coordinado de inmediato.`;
  }
  if (q.includes("modo light") || q.includes("salir del modo light") || q.includes("pasar del modo light") || q.includes("cambiar de modo") || q.includes("modo escritorio") || q.includes("vista completa") || q.includes("modo pc") || q.includes("computadora") || q.includes("pantalla grande") || q.includes("modo oscuro") || q.includes("modo claro") || q.includes("modo celular") || q.includes("modo m\xF3vil") || q.includes("modo movil") || q.includes("volver a la pc") || q.includes("volver al escritorio") || q.includes("volver a la compu") || q.includes("como paso del modo") || q.includes("c\xF3mo paso del modo") || q.includes("como salir del modo") || q.includes("c\xF3mo salir del modo")) {
    return `### \u{1F4F1} C\xF3mo alternar entre el Modo Light (M\xF3vil) y la Vista Completa (PC)

Para pasar del **Modo Light** al **Panel Completo de Escritorio (PMS)** ten\xE9s 2 opciones r\xE1pidas:

1. **Bot\xF3n en la barra superior:**
   - En la esquina superior derecha de la pantalla, toc\xE1 el bot\xF3n **"\u{1F4BB} Vista Completa"** (con el \xEDcono de la notebook).
   - Inmediatamente se abre el panel completo con el **Rack de Calendario**, las finanzas detalladas, la configuraci\xF3n de canales iCal y la web de reservas.

2. **Desde la pesta\xF1a "\u26A1 Atajos / M\xE1s":**
   - Toc\xE1 la pesta\xF1a **"Atajos"** en la barra inferior y seleccion\xE1 **"Cambiar a Vista Completa de Escritorio"**.

3. **Para volver al Modo Light cuando est\xE9s en la PC:**
   - En la barra superior del panel toc\xE1s el bot\xF3n **"\u{1F4F1} Vista M\xF3vil"** y regres\xE1s a la versi\xF3n simplificada de bolsillo.

\u{1F4A1} *El Modo Light est\xE1 pensado para la operaci\xF3n diaria en la calle o mientras recorr\xE9s las caba\xF1as, mientras que la Vista Completa es ideal para sentarte a ver los n\xFAmeros y el calendario general.*`;
  }
  if (q.includes("detener") || q.includes("parar") || q.includes("silenciar") || q.includes("callar") || q.includes("frenar") || q.includes("apagar voz") || q.includes("desactivar voz") || q.includes("como te detengo") || q.includes("c\xF3mo te detengo") || q.includes("como detener") || q.includes("c\xF3mo detener") || q.includes("tardas mucho") || q.includes("tarda mucho") || q.includes("tardas bastante") || q.includes("tarda bastante")) {
    return `### \u23F9\uFE0F C\xF3mo detener, pausar o silenciar a Xenia

Ten\xE9s 3 formas sencillas de controlar mis respuestas y la voz:

1. **Bot\xF3n de Detener (\u23F9\uFE0F PARAR):**
   - Mientras estoy respondiendo o hablando por voz, aparece un **banner rojo brillante superior con el bot\xF3n \u23F9\uFE0F PARAR / Silenciar**. Al tocarlo me detengo en el milisegundo.

2. **Apagar la Voz (Modo Lectura Silenciosa):**
   - Toc\xE1 el bot\xF3n **"Voz ON / Voz Mute"** (\xEDcono de parlante \u{1F50A}/\u{1F507}) arriba a la derecha. As\xED pod\xE9s leerme en texto sin que se reproduzca el audio.

3. **Detener el Micr\xF3fono \u{1F399}\uFE0F:**
   - Si tocaste el micr\xF3fono para hablar, pod\xE9s tocarlo nuevamente cuando termines para enviar tu consulta o cancelarla.

\u{1F4A1} *\xA1Todas mis respuestas ahora se generan de forma ultra r\xE1pida e instant\xE1nea!*`;
  }
  if (q.includes("bienvenida") || q.includes("bienvenido") || q.includes("guia digital") || q.includes("gu\xEDa digital") || q.includes("guia del huesped") || q.includes("gu\xEDa del hu\xE9sped") || q.includes("guia del pasajero") || q.includes("gu\xEDa del pasajero") || q.includes("portal de bienvenida") || q.includes("enviar guia") || q.includes("enviar gu\xEDa") || q.includes("mandar guia") || q.includes("mandar gu\xEDa") || q.includes("como envio la bienvenida") || q.includes("c\xF3mo env\xEDo la bienvenida") || q.includes("como mandar la bienvenida") || q.includes("c\xF3mo mandar la bienvenida") || q.includes("como se envia la bienvenida") || q.includes("c\xF3mo se env\xEDa la bienvenida") || q.includes("como le mando la bienvenida") || q.includes("c\xF3mo le mando la bienvenida") || q.includes("mensaje de bienvenida") || q.includes("carta de bienvenida")) {
    return `### \u{1F44B} C\xF3mo enviar la Bienvenida y Gu\xEDa Digital al Hu\xE9sped

En Loomi Suite envi\xE1s la bienvenida personalizada por WhatsApp en **1 solo toque**, sin tener que redactar nada a mano:

---

#### \u{1F4F1} 1. Si est\xE1s en el Modo Light (M\xF3vil / Bolsillo):
1. **And\xE1 a la pesta\xF1a "Hu\xE9spedes"** en la barra inferior (o en la tarjeta del pasajero en la pesta\xF1a "Hoy").
2. **Toc\xE1 los 3 puntitos (\u26A1 Acciones R\xE1pidas)** al lado del hu\xE9sped que quer\xE9s contactar.
3. Se abrir\xE1 la ventana de acciones. Toc\xE1 **"2. Enviar Bienvenida & Gu\xEDa Digital"**.
4. Se abrir\xE1 directamente **WhatsApp con el mensaje listo**:
   - Saludo con el nombre real del hu\xE9sped.
   - Enlace directo a su **Gu\xEDa Digital interactiva** (con mapa GPS de llegada, recomendaciones de restaurantes y paseos).
   - Nombre de la red Wi-Fi y contrase\xF1a de su caba\xF1a.
   - Horario de check-in.
5. Toc\xE1s **Enviar en WhatsApp** y \xA1listo!

---

#### \u{1F4BB} 2. Si est\xE1s en la Vista Completa (PC / Escritorio):
1. En el **Rack Calendario**, hac\xE9 clic sobre la estad\xEDa del hu\xE9sped.
2. En la ficha de la reserva, toc\xE1 el bot\xF3n verde **"Chatear por WhatsApp"** o and\xE1 a la pesta\xF1a **"Avisos & WhatsApp"**.
3. Seleccion\xE1 la plantilla **"\u{1F44B} Bienvenida y Gu\xEDa Digital (D\xEDa 1)"**.
4. Hac\xE9 clic en **"Abrir WhatsApp"** para enviar el mensaje con 1 clic.

\u{1F4A1} *La Gu\xEDa Digital no requiere que el hu\xE9sped descargue ninguna app: se abre directamente en el navegador de su celular como una web moderna y elegante.*`;
  }
  const isEditingAction = q.includes("modific") || q.includes("cambi") || q.includes("edit") || q.includes("cancel") || q.includes("borr") || q.includes("elimin") || q.includes("muev") || q.includes("mov") || q.includes("paso") || q.includes("pasar") || q.includes("pasalo") || q.includes("pasala") || q.includes("traslad") || q.includes("reasign") || q.includes("correg") || q.includes("ajust") || q.includes("anot") || q.includes("registr") || q.includes("marcar") || q.includes("agreg") || q.includes("sumar") || q.includes("sacar") || q.includes("restar") || q.includes("quedarse mas") || q.includes("un dia mas") || q.includes("cobro mas") || q.includes("cobrar mas") || q.includes("cobro menos") || q.includes("cobrar menos");
  const isReservationTarget = q.includes("reserva") || q.includes("estadia") || q.includes("estad\xEDa") || q.includes("fecha") || q.includes("dia") || q.includes("d\xEDas") || q.includes("noche") || q.includes("noches") || q.includes("pasajero") || q.includes("huesped") || q.includes("hu\xE9sped") || q.includes("cliente") || q.includes("caba\xF1a") || q.includes("depto") || q.includes("habitacion") || q.includes("unidad") || q.includes("tarifa") || q.includes("precio") || q.includes("se\xF1a") || q.includes("saldo") || q.includes("pago");
  if (isEditingAction && isReservationTarget || q.includes("como cancelo") || q.includes("c\xF3mo cancelo") || q.includes("como modifico") || q.includes("c\xF3mo modifico") || q.includes("como edito") || q.includes("c\xF3mo edito") || q.includes("como muevo") || q.includes("c\xF3mo muevo") || q.includes("como cambio") || q.includes("c\xF3mo cambio") || q.includes("como borro") || q.includes("c\xF3mo borro") || q.includes("modificar reserva") || q.includes("cambiar reserva") || q.includes("cancelar reserva") || q.includes("mover reserva") || q.includes("editar reserva") || q.includes("cambiar fechas") || q.includes("cambiar fecha") || q.includes("un dia mas") || q.includes("quedarse mas dias") || q.includes("otra caba\xF1a") || q.includes("otro depto")) {
    return `### \u270F\uFE0F C\xF3mo modificar, mover o actualizar una reserva en Loomi Suite

En Loomi lo hac\xE9s en segundos, sin complicaciones t\xE9cnicas ni t\xE9rminos dif\xEDciles:

1. **Abrir la reserva:**
   - En el **Rack Calendario**, hac\xE9 clic sobre la barra de la estad\xEDa que quer\xE9s modificar (o buscala por nombre en la pesta\xF1a **Reservas & Pasajeros**).
   - Se abrir\xE1 la ficha completa con todos los datos del hu\xE9sped.

2. **Toc\xE1 el \xEDcono del L\xE1piz (\u270F\uFE0F Editar):**
   - **Cambiar Fechas o Noches:** Ajust\xE1s el check-in, check-out o sum\xE1s noches si el hu\xE9sped se queda m\xE1s tiempo. *(\xA1En el calendario tambi\xE9n pod\xE9s arrastrar la barra directamente con el mouse!)*.
   - **Mover de Caba\xF1a o Departamento:** Si necesit\xE1s cambiarlo de unidad por mantenimiento o preferencia, seleccion\xE1s la nueva caba\xF1a desde el men\xFA desplegable.
   - **Modificar la Tarifa o Precio:** Pod\xE9s cambiar el importe total facturado (si le hiciste descuento o cobraste extras). Loomi recalcula al instante la comisi\xF3n real y tu ingreso neto limpio.
   - **Anotar Se\xF1as y Cobros de Saldo:** Cambi\xE1s el estado de *"Se\xF1a Pendiente"* a *"Se\xF1a 50%"* o *"100% Abonado"* cuando el hu\xE9sped te transfiera o pague en recepci\xF3n.
   - **Early Check-in o Late Check-out:** Marc\xE1s si llega antes o sale m\xE1s tarde para coordinar con la mucama.
   - **Cancelar o Dar de Baja:** Si el pasajero cancela, cambi\xE1s el estado a *"Cancelada"* y las fechas se liberan al instante.

3. **Guardar:**
   - Toc\xE1s **Guardar Cambios** y autom\xE1ticamente se actualizan tu calendario, tus n\xFAmeros contables y el m\xF3dulo de limpieza.

\u{1F4A1} *Si el cambio lo hizo el hu\xE9sped directamente en Airbnb o Booking, el enlace iCal actualiza el calendario solo sin que tengas que hacer nada a mano.*`;
  }
  const isFinanceIntent = q.includes("ganancia") || q.includes("ganancias") || q.includes("gane") || q.includes("gan\xE9") || q.includes("gano") || q.includes("plata") || q.includes("dinero") || q.includes("guita") || q.includes("factur") || q.includes("ingreso") || q.includes("ingresos") || q.includes("rentabilidad") || q.includes("beneficio") || q.includes("balance") || q.includes("cobre") || q.includes("cobr\xE9") || q.includes("cobro") || q.includes("recaud") || q.includes("se\xF1a") || q.includes("saldo") || q.includes("comision") || q.includes("comisi\xF3n") || q.includes("ahorr") || q.includes("cuanto gano") || q.includes("cu\xE1nto gano") || q.includes("cuanto entra") || q.includes("cu\xE1nto entra") || q.includes("cuanto me queda") || q.includes("cu\xE1nto me queda") || q.includes("como viene") || q.includes("c\xF3mo viene") || q.includes("octubre") || q.includes("noviembre") || q.includes("diciembre") || q.includes("este mes") || q.includes("mes actual");
  if (isFinanceIntent && !isEditingAction) {
    const monthsMap = {
      octubre: { num: "10", name: "Octubre" },
      noviembre: { num: "11", name: "Noviembre" },
      diciembre: { num: "12", name: "Diciembre" },
      enero: { num: "01", name: "Enero" },
      febrero: { num: "02", name: "Febrero" },
      marzo: { num: "03", name: "Marzo" },
      abril: { num: "04", name: "Abril" },
      mayo: { num: "05", name: "Mayo" },
      junio: { num: "06", name: "Junio" },
      julio: { num: "07", name: "Julio" },
      agosto: { num: "08", name: "Agosto" },
      septiembre: { num: "09", name: "Septiembre" }
    };
    let targetMonth = null;
    for (const [key, val] of Object.entries(monthsMap)) {
      if (q.includes(key)) {
        targetMonth = val;
        break;
      }
    }
    if (!targetMonth && (q.includes("este mes") || q.includes("mes actual"))) {
      targetMonth = { num: "10", name: "Octubre" };
    }
    if (targetMonth) {
      const monthReservations = reservations.filter((r) => {
        const inMatch = r.checkIn && (r.checkIn.includes(`-${targetMonth.num}-`) || r.checkIn.startsWith(`2026-${targetMonth.num}`));
        const outMatch = r.checkOut && (r.checkOut.includes(`-${targetMonth.num}-`) || r.checkOut.startsWith(`2026-${targetMonth.num}`));
        return inMatch || outMatch;
      });
      const monthGross = monthReservations.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
      const monthCommissions = monthReservations.reduce((acc, r) => acc + (r.commissionPaid || 0), 0);
      const monthNet = monthReservations.reduce((acc, r) => acc + (r.netRevenue || 0), 0);
      const monthNights = monthReservations.reduce((acc, r) => acc + (r.nights || 0), 0);
      const monthDirectSaved = monthReservations.filter((r) => r.platform === "direct").reduce((sum, r) => sum + (r.totalAmount || 0) * 0.18, 0);
      const snippet = monthReservations.slice(0, 6).map((r) => {
        const pName = properties.find((p) => p.id === r.propertyId)?.name || "Caba\xF1a";
        return `\u2022 **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${formatFriendlyDates(r.checkIn, r.checkOut)} \u2014 **${r.totalAmount} USD** (Neto: ${r.netRevenue} USD)`;
      }).join("\n");
      return `### \u{1F4CA} Ganancias y Facturaci\xF3n de ${targetMonth.name} (Loomi Suite)

Aqu\xED ten\xE9s el desglose exacto de tu negocio para **${targetMonth.name}**:

- \u{1F4B0} **Ganancia Neta Real en Mano:** **${Math.round(monthNet)} USD** *(lo que te queda limpio en el bolsillo despu\xE9s de descontar comisiones)*.
- \u{1F4B5} **Facturaci\xF3n Bruta Total:** **${Math.round(monthGross)} USD** sobre **${monthReservations.length} reservas registradas** (${monthNights} noches vendidas).
- \u{1F3F7}\uFE0F **Comisiones Deducidas por OTAs (Airbnb/Booking):** **-${Math.round(monthCommissions)} USD**.
- \u{1F31F} **Ahorro por Reservas Directas:** **+${Math.round(monthDirectSaved)} USD** ahorrados sin intermediarios.

${monthReservations.length > 0 ? `\u{1F4CB} **Estad\xEDas del mes de ${targetMonth.name}:**
${snippet}
${monthReservations.length > 6 ? `*(y ${monthReservations.length - 6} reservas m\xE1s en el sistema)*` : ""}` : `\u2139\uFE0F *A\xFAn no hay reservas registradas espec\xEDficamente para ${targetMonth.name}.*`}

\u{1F4A1} *Pod\xE9s ver el informe detallado y liquidaciones en la pesta\xF1a **Finanzas**.*`;
    }
    const totalGross = reservations.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalCommissions = reservations.reduce((acc, r) => acc + (r.commissionPaid || 0), 0);
    const totalNet = reservations.reduce((acc, r) => acc + (r.netRevenue || 0), 0);
    const totalNights = reservations.reduce((acc, r) => acc + (r.nights || 0), 0);
    const directSaved = reservations.filter((r) => r.platform === "direct").reduce((sum, r) => sum + (r.totalAmount || 0) * 0.18, 0);
    const pendingPayments = reservations.filter(
      (r) => r.paymentStatus === "pending" || r.paymentStatus === "deposit_only"
    );
    return `### \u{1F4CA} Rendici\xF3n Financiera y Ganancias de tu Negocio

Aqu\xED ten\xE9s el balance econ\xF3mico actualizado en tiempo real:

- \u{1F4B0} **Ganancia Neta Real en Mano:** **${Math.round(totalNet)} USD** *(despu\xE9s de tasas y comisiones de canales)*.
- \u{1F4B5} **Facturaci\xF3n Bruta Total:** **${Math.round(totalGross)} USD** sobre **${reservations.length} reservas registradas** (${totalNights} noches).
- \u{1F3F7}\uFE0F **Comisiones Deducidas por Plataformas (OTAs):** **-${Math.round(totalCommissions)} USD** (Booking, Airbnb).
- \u{1F31F} **Ahorro por Reservas Directas:** **+${Math.round(directSaved)} USD** ahorrados gracias a reservas directas sin comisiones.

${pendingPayments.length > 0 ? `\u26A0\uFE0F **Cobros y Saldos Pendientes:** Ten\xE9s ${pendingPayments.length} reservas con saldo pendiente de cobro en mostrador.` : "\u2705 *Todos los cobros de reservas confirmadas est\xE1n al d\xEDa.*"}

\u{1F4A1} *Preg\xFAntame por un mes espec\xEDfico (ej: "\xBFCu\xE1l es mi ganancia en octubre?") para ver el detalle mensual.*`;
  }
  if ((q.includes("precio") || q.includes("costo") || q.includes("cuanto cuesta") || q.includes("cu\xE1nto cuesta") || q.includes("cuanto sale") || q.includes("cu\xE1nto sale") || q.includes("abono") || q.includes("tarifa") || q.includes("planes") || q.includes("plan ") || q.includes(" plan") || q === "plan" || q.includes("ipc") || q.includes("inflacion") || q.includes("inflaci\xF3n") || q.includes("mercado pago") || q.includes("transferencia") || q.includes("cbu") || q.includes("alias") || q.includes("tarjeta") || q.includes("paypal")) && !isEditingAction) {
    return `### \u{1F3F7}\uFE0F Planes y Precios Transparentes de Loomi Suite (Complejo Entero)

En Loomi tenemos **2 planes fijos por complejo entero** en **pesos argentinos (ARS)** (sin cobrar por habitaci\xF3n y sin comisiones por reserva):

1. **\u{1F3E1} Plan Loomi:** **$45.000 / mes (Final ARS)**
   - Enfocado en due\xF1os de 4 o 5 caba\xF1as sin personal.
   - Incluye calendario en modo light (optimizado para celular), gesti\xF3n de reservas directas, sincronizaci\xF3n iCal con portales y reportes de rendimiento b\xE1sicos.
   - *No incluye m\xF3dulo de housekeeping ni modo recepci\xF3n multiusuario.*

2. **\u{1F3E2} Plan Loomi Suite:** **$60.000 / mes (Final ARS)**
   - Todo el ecosistema ilimitado para complejos medianos y grandes.
   - Incluye M\xF3dulo Housekeeping en vivo (sem\xE1foro y tareas de mucamas), Modo Recepci\xF3n con roles separados, Asistente Xenia AI (voz y copiloto 24/7) y web propia con Portal de Bienvenida del Hu\xE9sped.

**Formas de Pago y Cobro:**
- \u{1F4B3} **Tu abono a Loomi:** Se abona mensualmente mediante **Transferencia Bancaria directa** (CBU/CVU o Alias) en Argentina, o por **PayPal** para el exterior. Precio fijo por todo el complejo sin costos sorpresa.
- \u{1F4B0} **Cobros a tus Hu\xE9spedes:** Tus pasajeros te pagan directo a tu cuenta: **Mercado Pago**, CBU/Alias bancario o efectivo. Loomi no cobra ning\xFAn porcentaje sobre tus ventas (0% comisi\xF3n).
- \u2705 **Sin tarjeta de cr\xE9dito para arrancar:** Prob\xE1s 15 d\xEDas gratis sin ingresar datos de pago.`;
  }
  if (q.includes("llave") || q.includes("cerradura") || q.includes("candado") || q.includes("digital") || q.includes("electronica") || q.includes("electr\xF3nica") || q.includes("tuya") || q.includes("yale") || q.includes("ttlock") || q.includes("conserj") || q.includes("buzon") || q.includes("buz\xF3n")) {
    return `### \u{1F511} Llaves F\xEDsicas Tradicionales vs. Cerraduras Digitales en Loomi

\xA1Tranquilo/a! En Loomi **no necesit\xE1s gastar en cerraduras caras ni cambiar una sola puerta**:

1. **100% pensado para Llaves F\xEDsicas Tradicionales:**
   - La enorme mayor\xEDa de caba\xF1as y posadas entregan la llave en mano o usan un candado/buz\xF3n de llaves.
   - En la ficha de cada reserva figura claramente: *"Llave f\xEDsica en conserjer\xEDa"* para que todo tu equipo lo sepa.

2. **\xBFTen\xE9s o quer\xE9s cerraduras electr\xF3nicas con c\xF3digo PIN?**
   - El m\xF3dulo de cerraduras inteligentes es un **Add-on opcional**.
   - Si ten\xE9s cerraduras tipo Teclado/Touch (Tuya, TTLock, Yale), pod\xE9s asociar el c\xF3digo PIN del hu\xE9sped para que le llegue autom\xE1ticamente por WhatsApp.

En resumen: pod\xE9s empezar hoy mismo con tus llaves de toda la vida y nunca est\xE1s obligado a cambiar nada.`;
  }
  if (q.includes("limpieza") || q.includes("mucama") || q.includes("limpiar") || q.includes("chica") || q.includes("ropa blanca") || q.includes("sabana") || q.includes("s\xE1bana") || q.includes("toalla") || q.includes("desinfeccion") || q.includes("desinfecci\xF3n")) {
    return `### \u{1F9F9} M\xF3dulo de Limpieza y Mucamas en el Celular

As\xED funciona la coordinaci\xF3n diaria sin mensajes perdidos en WhatsApp:

1. **Autom\xE1tico:** Al concretarse un check-out, la unidad pasa autom\xE1ticamente a estado **Pendiente (Sucia)** en tu rack.
2. **Enlace m\xF3vil para el personal:** Tu personal de limpieza tiene su enlace m\xF3vil propio (sin contrase\xF1as) con el listado del d\xEDa y checklist:
   - S\xE1banas y toallas limpias.
   - Sanitizaci\xF3n de ba\xF1os y reposici\xF3n de amenities.
   - Comprobaci\xF3n de llaves o cerradura.
3. **Control en tiempo real:** Cuando terminan, tocan **"Marcar como Lista"** y tu calendario pasa a verde de inmediato para el pr\xF3ximo ingreso.`;
  }
  if (q.includes("whatsapp") || q.includes("mensaje") || q.includes("mensajeria") || q.includes("mensajer\xEDa") || q.includes("plantilla") || q.includes("plantillas") || q.includes("textos m\xE1ster") || q.includes("textos master") || q.includes("omotenashi") || q.includes("guia digital") || q.includes("gu\xEDa digital") || q.includes("simulador") || q.includes("wifi") || q.includes("wi-fi") || q.includes("internet") || q.includes("clave") || q.includes("llegada") || q.includes("en ruta") || q.includes("viaje") || q.includes("ubicacion") || q.includes("ubicaci\xF3n") || q.includes("blindaje") || q.includes("queja") || q.includes("resena") || q.includes("rese\xF1a")) {
    return `### \u{1F4AC} WhatsApp Inteligente y las 3 Plantillas M\xE1ster Omotenashi en Loomi Suite

S\xED, en Loomi Suite el sistema de WhatsApp y el **Simulador en Celular** est\xE1n dise\xF1ados con filosof\xEDa **Omotenashi** (atenci\xF3n c\xE1lida, ultra profesional y preventiva) para atender al hu\xE9sped sin fricciones:

---

### \u{1F4F1} 1. Las 3 Plantillas M\xE1ster Pre-cargadas

1. **\u{1F332} Plantilla 1: Confirmaci\xF3n & Bienvenida Anticipada** *(Al confirmarse la reserva)*:
   - Env\xEDa autom\xE1ticamente el saludo cordial con el nombre del pasajero, confirma las fechas exactas y entrega el enlace directo a la **Gu\xEDa Digital de Bienvenida interactiva** con el mapa GPS de acceso, claves de Wi-Fi y ficha digital de registro.
2. **\u{1F697} Plantilla 2: Coordinaci\xF3n en Ruta / D\xEDa de Viaje** *(La ma\xF1ana del Check-In)*:
   - Recuerda el horario de ingreso (a partir de las 14:00 hs), reactiva el GPS en 1 toque y pide que avisen cuando est\xE9n cerca para esperarlos con el alojamiento climatizado y las llaves listas.
3. **\u2728 Plantilla 3: Control de Confort y Blindaje Anti-Quejas** *(2 Horas Post Check-In)*:
   - Consulta amablemente si encontraron todo impecable, si el Wi-Fi y la temperatura est\xE1n confortables, y ofrece toallas extra o recomendaciones de gastronom\xEDa local. \xA1Esto desactiva cualquier eventual reclamo en privado en 10 minutos antes de que surja una queja!

---

### \u26A1 2. \xBFC\xF3mo funciona el Simulador de WhatsApp?

- **Variables Din\xE1micas Autom\xE1ticas:** Las etiquetas como \`{{nombre_hu\xE9sped}}\`, \`{{unidad_alojamiento}}\`, \`{{fecha_checkin}}\`, \`{{fecha_checkout}}\` y \`{{link_guia_digital}}\` se reemplazan solas con los datos reales de la reserva elegida.
- **Renderizado en Tiempo Real:** En el tel\xE9fono m\xF3vil simulado a la derecha ves exactamente c\xF3mo le llega el mensaje al hu\xE9sped, con hiperv\xEDnculos activos en tono \xF3xido pastel y est\xE9tica limpia Zen.
- **Env\xEDo en 1 Clic:** Pod\xE9s **Copiar** el texto formateado, pulsar **Simular** o tocar **"Abrir en WhatsApp Real"** para disparar la conversaci\xF3n directamente al n\xFAmero del pasajero.

\u{1F4A1} *Pod\xE9s acceder desde el men\xFA lateral en **Avisos & WhatsApp**, desde la lista de reservas en el acorde\xF3n de cada fila, o desde la vista m\xF3vil en **Acciones R\xE1pidas**.*`;
  }
  if (q.includes("sincroniz") || q.includes("airbnb") || q.includes("booking") || q.includes("ical") || q.includes("overbooking") || q.includes("doble reserva") || q.includes("dos veces") || q.includes("se pisen") || q.includes("pisar") || q.includes("conectar") || q.includes("vincular") || q.includes("canal") || q.includes("canales")) {
    return `### \u{1F504} C\xF3mo sincronizar Booking y Airbnb para evitar dobles reservas

Loomi conecta tus calendarios mediante sincronizaci\xF3n bidireccional (iCal oficial) para que **nunca se pisen dos reservas en la misma caba\xF1a**:

1. **Obtener el enlace iCal en Airbnb/Booking:**
   - En tu cuenta de anfitri\xF3n de Airbnb, vas a tu anuncio \u2794 **Precios y disponibilidad** \u2794 **Exportar calendario** y copias el enlace.
2. **Pegarlo en Loomi Suite:**
   - En Loomi vas a **Caba\xF1as & Habitaciones** \u2794 Toc\xE1s **"Sincronizar Canales"** en la caba\xF1a y peg\xE1s el enlace.
3. **Copiar el enlace de Loomi hacia el canal:**
   - Copi\xE1s el link de exportaci\xF3n de Loomi y lo peg\xE1s en **Importar calendario** en Airbnb y Booking.

\u2705 **\xA1Listo!** Cuando entra una reserva en Airbnb, las fechas se bloquean autom\xE1ticamente en Booking y en Loomi en tiempo real.`;
  }
  if (q.includes("proximo") || q.includes("pr\xF3ximo") || q.includes("siguiente") || q.includes("ocupad") || q.includes("ocupacion") || q.includes("ocupaci\xF3n") || q.includes("disponib") || q.includes("libre") || q.includes("quien llega") || q.includes("qui\xE9n llega") || q.includes("quien sale") || q.includes("qui\xE9n sale") || q.includes("check in") || q.includes("check-in") || q.includes("check out") || q.includes("check-out") || q.includes("hoy") || q.includes("alojado") || q.includes("pasajeros") || q.includes("huespedes") || q.includes("hu\xE9spedes") || q.includes("reserva") || q.includes("reservas")) {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const totalProps = properties.length || 6;
    const activeRes = reservations.filter((r) => r.status !== "cancelled");
    const occupiedCount = Math.min(
      totalProps,
      activeRes.filter((r) => r.checkIn <= todayStr && r.checkOut > todayStr).length
    );
    const occupancyRate = Math.round(occupiedCount / Math.max(1, totalProps) * 100);
    const checkInsToday = activeRes.filter((r) => r.checkIn === todayStr);
    const checkOutsToday = activeRes.filter((r) => r.checkOut === todayStr);
    const upcomingCheckIns = activeRes.filter((r) => r.checkIn >= todayStr).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    const nextCheckIn = upcomingCheckIns[0];
    if (q.includes("proximo") || q.includes("pr\xF3ximo") || q.includes("siguiente") || q.includes("quien llega") || q.includes("qui\xE9n llega") || q.includes("check in") && !q.includes("todos")) {
      if (checkInsToday.length > 0) {
        const first = checkInsToday[0];
        const pName = properties.find((p) => p.id === first.propertyId)?.name || "Caba\xF1a";
        return `### \u{1F6CF}\uFE0F Pr\xF3ximo Check-In: \xA1Ingresa Hoy!

Hoy ingresa **${first.guestName}** en *${pName}* (${first.platform.toUpperCase()}):
- \u{1F4C5} **Fechas:** ${formatFriendlyDates(first.checkIn, first.checkOut)} (${first.nights} noches).
- \u{1F4B0} **Total:** ${first.totalAmount} USD (Estado de cobro: ${first.paymentStatus === "paid" ? "100% Abonado" : "Saldo pendiente"}).
- \u{1F4DE} **Contacto:** ${first.guestPhone || "Sin tel\xE9fono"}.

${upcomingCheckIns.length > 1 ? `\u{1F4CB} **Siguientes ingresos programados:**
` + upcomingCheckIns.slice(1, 4).map((r) => {
          const p = properties.find((prop) => prop.id === r.propertyId)?.name || "Caba\xF1a";
          return `\u2022 **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
        }).join("\n") : ""}`;
      }
      if (nextCheckIn) {
        const pName = properties.find((p) => p.id === nextCheckIn.propertyId)?.name || "Caba\xF1a";
        return `### \u{1F6CF}\uFE0F Pr\xF3ximo Check-In Programado

El pr\xF3ximo ingreso es **${nextCheckIn.guestName}** en *${pName}* (${nextCheckIn.platform.toUpperCase()}):
- \u{1F4C5} **Fechas de estad\xEDa:** ${formatFriendlyDates(nextCheckIn.checkIn, nextCheckIn.checkOut)} (${nextCheckIn.nights} noches).
- \u{1F4B0} **Importe:** ${nextCheckIn.totalAmount} USD (Neto: ${nextCheckIn.netRevenue} USD).
- \u{1F4DE} **Contacto:** ${nextCheckIn.guestPhone || "Sin tel\xE9fono"}.

\u{1F4CB} **Siguientes ingresos confirmados:**
${upcomingCheckIns.slice(1, 4).map((r) => {
          const p = properties.find((prop) => prop.id === r.propertyId)?.name || "Caba\xF1a";
          return `\u2022 **${r.guestName}** en *${p}*: ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
        }).join("\n")}

\u{1F4A1} *Pod\xE9s ver y modificar reservas directamente en el **Rack Calendario**.*`;
      }
    }
    const listSnippet = upcomingCheckIns.slice(0, 4).map((r) => {
      const pName = properties.find((p) => p.id === r.propertyId)?.name || "Caba\xF1a";
      return `\u2022 **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}): ${formatFriendlyDates(r.checkIn, r.checkOut)} (${r.totalAmount} USD)`;
    }).join("\n");
    return `### \u{1F6CF}\uFE0F Estado de Ocupaci\xF3n y Reservas en Tiempo Real

\u{1F4CA} **Ocupaci\xF3n Actual:**
- **Nivel de Ocupaci\xF3n:** **${occupancyRate}%** (${occupiedCount} de ${totalProps} unidades ocupadas).
- **Total de Reservas Activas:** **${activeRes.length} reservas registradas**.
- **Ingresos hoy (Check-in):** ${checkInsToday.length > 0 ? `${checkInsToday.length} pasajeros ingresando hoy` : "Sin ingresos previstos para hoy"}.
- **Salidas hoy (Check-out):** ${checkOutsToday.length > 0 ? `${checkOutsToday.length} salidas previstas hoy` : "Sin salidas para hoy"}.

\u{1F4CB} **Pr\xF3ximos Ingresos Programados:**
${listSnippet || "\u2139\uFE0F *No hay reservas futuras inmediatas.*"}

\u{1F4A1} *Pod\xE9s ver y mover reservas directamente en el **Rack Calendario**.*`;
  }
  return `### \u{1F44B} Hola, soy Xenia, tu copiloto en Loomi Suite

Puedo responderte al instante sobre cualquier tema operativo o comercial:

1. **\u270F\uFE0F Gesti\xF3n de Reservas:** Preg\xFAntame c\xF3mo modificar una reserva, cambiar fechas, mover de caba\xF1a o anotar cobros y se\xF1as.
2. **\u{1F4B0} Ganancias y Finanzas:** Preg\xFAntame *"\xBFCu\xE1l es mi ganancia en octubre?"*, cu\xE1nta plata ingres\xF3 o cu\xE1nto ahorraste en comisiones de Airbnb y Booking.
3. **\u{1F511} Llaves y Limpieza:** Preg\xFAntame c\xF3mo operar con llaves comunes tradicionales o c\xF3mo coordinar con la mucama.
4. **\u{1F504} Sincronizaci\xF3n:** Preg\xFAntame c\xF3mo conectar Booking y Airbnb para evitar dobles reservas.
5. **\u{1F3F7}\uFE0F Planes y Precios:** Preg\xFAntame cu\xE1nto cuesta Loomi ($45.000 ARS/mes) o Loomi Suite ($60.000 ARS/mes) y c\xF3mo se paga por transferencia o Mercado Pago.

*\xBFQu\xE9 te gustar\xEDa consultar o resolver?*`;
}

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://loomisuite.net",
    "https://www.loomisuite.net",
    "https://loomisuites-net.pages.dev",
    "http://localhost:3000",
    "http://localhost:5173"
  ];
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".pages.dev") || origin.endsWith(".run.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(import_express.default.json({ limit: "10mb" }));
var aiClient = null;
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var STATE_FILE_PATH = import_path.default.join(process.cwd(), "data", "app_state.json");
function generateRuleBasedXeniaResponse(message, contextData) {
  let demoState = contextData || {};
  if (!demoState.reservations || demoState.reservations.length === 0) {
    try {
      if (import_fs.default.existsSync(STATE_FILE_PATH)) {
        demoState = JSON.parse(import_fs.default.readFileSync(STATE_FILE_PATH, "utf-8"));
      }
    } catch (_e) {
    }
  }
  return getClientXeniaReply(message, demoState);
}
var ipRateLimits = /* @__PURE__ */ new Map();
var RATE_LIMIT_WINDOW_MS = 60 * 1e3;
var RATE_LIMIT_MAX_REQUESTS = 25;
function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { timestamps: [] };
  const recentTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRateLimits.set(ip, { timestamps: recentTimestamps });
    return false;
  }
  recentTimestamps.push(now);
  ipRateLimits.set(ip, { timestamps: recentTimestamps });
  if (ipRateLimits.size > 500) {
    for (const [key, val] of ipRateLimits.entries()) {
      if (val.timestamps.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        ipRateLimits.delete(key);
      }
    }
  }
  return true;
}
app.post("/api/xenia/chat", async (req, res) => {
  try {
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "client-ip";
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        error: "L\xEDmite de solicitudes alcanzado. Por favor, aguard\xE1 un minuto antes de enviar m\xE1s consultas a Xenia.",
        reply: "Has realizado varias consultas consecutivas. Por favor aguard\xE1 un momento para continuar nuestra conversaci\xF3n.",
        source: "rate_limit_exceeded"
      });
      return;
    }
    const { message, history = [], contextData: rawContextData, context: rawContext } = req.body;
    let contextData = rawContextData || rawContext || {};
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "El mensaje es obligatorio." });
      return;
    }
    if (!contextData.reservations || contextData.reservations.length === 0) {
      try {
        if (import_fs.default.existsSync(STATE_FILE_PATH)) {
          const fileData = JSON.parse(import_fs.default.readFileSync(STATE_FILE_PATH, "utf-8"));
          contextData = {
            properties: contextData.properties?.length > 0 ? contextData.properties : fileData.properties || [],
            reservations: fileData.reservations || [],
            cleaningTasks: contextData.cleaningTasks?.length > 0 ? contextData.cleaningTasks : fileData.cleaningTasks || [],
            addons: contextData.addons?.length > 0 ? contextData.addons : fileData.addons || []
          };
        }
      } catch (_e) {
      }
    }
    const ai = getGeminiClient();
    if (!ai) {
      const fallbackReply = generateRuleBasedXeniaResponse(message, contextData);
      res.json({
        reply: fallbackReply,
        source: "xenia_local_engine"
      });
      return;
    }
    const todayIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const propertiesSummary = (contextData?.properties || []).map(
      (p) => `- ${p.name} (${p.type}): Capacidad ${p.maxGuests} hu\xE9spedes, ${p.basePrice} USD/noche. WiFi: "${p.wifiNetwork}", Clave: "${p.wifiPassword}". Cerradura: ${p.smartLock?.enabled ? `Digital (${p.smartLock?.brand})` : "Llave f\xEDsica en recepci\xF3n"}.`
    ).join("\n");
    const sortedReservations = [...contextData?.reservations || []].filter((r) => r.status !== "cancelled").sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));
    const reservationsSummary = sortedReservations.map(
      (r) => `- Hu\xE9sped: ${r.guestName} | Caba\xF1a ID: ${r.propertyId} | Canal: ${r.platform.toUpperCase()} | Fechas: ${r.checkIn} al ${r.checkOut} (${r.nights} noches) | Total: ${r.totalAmount} USD | Neto: ${r.netRevenue} USD | Comisi\xF3n OTA: ${r.commissionPaid} USD | Pago: ${r.paymentStatus} | Estado: ${r.status} ${r.checkIn === todayIso ? "[CHECK-IN HOY]" : r.checkIn > todayIso ? "[FUTURA/PR\xD3XIMA]" : "[HIST\xD3RICA/PASADA]"}`
    ).join("\n");
    const cleaningSummary = (contextData?.cleaningTasks || []).map(
      (c) => `- Tarea: ${c.cleanerName} asignada a las ${c.scheduledTime} | Estado: ${c.status} | Da\xF1os/Notas: ${c.notes || "Ninguno"}`
    ).join("\n");
    const addonsSummary = (contextData?.addons || []).map(
      (a) => `- ${a.name} (${a.category}): ${a.price} USD (${a.unitLabel}). ${a.description}`
    ).join("\n");
    const systemInstruction = `
ERES XENIA, LA CONSERJE DIGITAL Y ASISTENTE INTELIGENTE DE HOSPITALIDAD DE LOOMI SUITE.
Loomi Suite es el ecosistema de hospitalidad serena y eficiente para caba\xF1as, domos, departamentos tur\xEDsticos y posadas.

FECHA ACTUAL DEL SISTEMA: ${todayIso}

=============================================================================
DIRECTIVAS MAESTRAS DE HOSPITALIDAD OMOTENASHI (REGLAS OBLIGATORIAS):
=============================================================================

1. IDENTIDAD Y TONO:
   - Eres la conserje digital del complejo.
   - Tu tono es sereno, emp\xE1tico, pulcro y sumamente conciso.
   - Respondes en espa\xF1ol rioplatense neutro ("te esperamos", "pod\xE9s ingresar con", "quedamos a disposici\xF3n") o en el idioma en que te escriba el hu\xE9sped (ingl\xE9s, portugu\xE9s, franc\xE9s, etc.).
   - Tu trato transmite hospitalidad Omotenashi: calidez sin abrumar, anticipaci\xF3n y serenidad japonesa adaptada a nuestra regi\xF3n.

2. RESPUESTAS BREVES (ESTILO WHATSAPP):
   - Cada mensaje debe tener un M\xC1XIMO DE 2 A 3 P\xC1RRAFOS CORTOS, amables, claros y directos.
   - Evita respuestas interminables, introducciones de relleno o listas abrumadoras. Lo que env\xEDas debe poder leerse en la pantalla de un celular en 10 segundos.

3. AUTONOM\xCDA EN INFORMACI\xD3N CLAVE:
   - Responde con total autonom\xEDa y precisi\xF3n sobre:
     * Horarios oficiales: Check-in (a partir de las 14:00 hs) y Check-out (hasta las 10:00 hs).
     * Clave y nombre de red Wi-Fi de la unidad asignada.
     * C\xF3digo de cerradura digital o retiro de llaves f\xEDsicas en recepci\xF3n.
     * Ubicaci\xF3n, direcci\xF3n y ruta de llegada.
   - Proporciona siempre los datos concretos de la reserva y el enlace al Portal del Hu\xE9sped (GuestWelcomePortal / https://loomisuite.net/guia/[unidad]).

4. SERVICIOS ADICIONALES (ADDONS):
   - Informa sobre servicios extras disponibles en el complejo seg\xFAn los datos de addons:
     * Estacionamiento / cocheras privadas cubiertas.
     * Late check-out (salida extendida) y early check-in.
     * Traslados y transfers aeropuerto/terminal in y out.
     * Experiencias, degustaci\xF3n de vino, canastas de desayuno y spa.
   - Brinda los precios transparentes en USD o ARS si el hu\xE9sped lo solicita.

5. CASOS CR\xCDTICOS, RECLAMOS Y L\xCDMITES ESTRICTOS (DERIVACI\xD3N HUMANA):
   - Ante roturas, reclamos, falta de agua, problemas de climatizaci\xF3n, ruidos molestos o cualquier situaci\xF3n imprevista:
     * NO inventes soluciones t\xE9cnicas ni hagas promesas de reparaci\xF3n f\xEDsica.
     * Responde con profunda empat\xEDa y serenidad: "Lamento mucho el inconveniente. Ya mismo le di aviso prioritario a nuestro anfitri\xF3n y equipo del complejo para que se comunique contigo a la brevedad y lo resolvamos juntos."
     * Deriva de inmediato al anfitri\xF3n humano responsable.
   - NUNCA menciones t\xE9rminos t\xE9cnicos de software, bases de datos, APIs, prompts, JSON ni PMS. Para el hu\xE9sped eres la conserje del alojamiento.

=============================================================================
REGLAS CR\xCDTICAS DE MONEDAS Y FECHAS:
=============================================================================
1. REGLA DE MONEDAS:
   - Para valores en d\xF3lares escribe siempre "USD 22.000", "22.000 USD" o "58 USD". NUNCA escribas "$22000 usd" ni "$22.000 USD" con el signo "$" delante de "USD".
   - Para valores en pesos argentinos escribe "$45.000" o "$45.000 ARS".
2. REGLA DE FECHAS:
   - Fechas en formato natural en espa\xF1ol (ej: "del 10 al 15 de octubre de 2026", "hoy"). NUNCA n\xFAmeros ISO o c\xF3digos crudos como "20260910".
   - Revisa la FECHA ACTUAL (${todayIso}) y responde con los ingresos de HOY o los INMEDIATOS FUTUROS.

=============================================================================
PLANES COMERCIALES DE LOOMI SUITE (SI CONSULTA EL ANFITRI\xD3N):
=============================================================================
- 2 planes fijos por complejo entero (sin costos por habitaci\xF3n y sin comisiones):
  1) Plan Loomi: $45.000 ARS/mes. Para due\xF1os de 4 a 10 unidades (Rack Modo Light m\xF3vil, gesti\xF3n directa y sincronizaci\xF3n de calendarios).
  2) Plan Loomi Suite: $60.000 ARS/mes. Ecosistema ilimitado para todo el complejo (Housekeeping en vivo para mucamas, modo recepci\xF3n con roles, asistente Xenia AI 24/7 y 3 Modelos Web Oficiales con Portal del Hu\xE9sped).

=============================================================================
DATOS EN VIVO DEL ALOJAMIENTO:
=============================================================================
--- CABA\xD1AS Y HABITACIONES ---
${propertiesSummary || "No hay unidades cargadas."}

--- RESERVAS ACTUALES Y FUTURAS ---
${reservationsSummary || "No hay reservas registradas."}

--- TAREAS DE LIMPIEZA & HOUSEKEEPING ---
${cleaningSummary || "No hay tareas de limpieza registradas hoy."}

--- SERVICIOS ADICIONALES (ADDONS) ---
${addonsSummary || "No hay servicios adicionales registrados."}
`;
    const contents = [];
    let expectsRole = "user";
    for (const h of history) {
      if (!h || !h.content) continue;
      const r = h.role === "assistant" || h.role === "model" ? "model" : "user";
      if (r === expectsRole) {
        contents.push({ role: r, parts: [{ text: String(h.content) }] });
        expectsRole = r === "user" ? "model" : "user";
      }
    }
    if (expectsRole === "user") {
      contents.push({ role: "user", parts: [{ text: message }] });
    } else {
      contents.push({ role: "model", parts: [{ text: "Entendido." }] });
      contents.push({ role: "user", parts: [{ text: message }] });
    }
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });
    } catch (_geminiErr) {
      console.error("Gemini API Error al consultar modelo:", _geminiErr);
      const fallbackReply = generateRuleBasedXeniaResponse(message, contextData);
      res.json({
        reply: fallbackReply,
        source: "xenia_local_engine_fallback"
      });
      return;
    }
    const reply = response.text || "No pude generar una respuesta en este momento.";
    res.json({
      reply,
      source: "gemini_api"
    });
  } catch (_error) {
    console.error("Error interno al procesar /api/xenia/chat:", _error);
    const fallbackReply = generateRuleBasedXeniaResponse(
      typeof req.body?.message === "string" ? req.body.message : "",
      req.body?.contextData
    );
    res.json({
      reply: fallbackReply,
      source: "xenia_local_engine_fallback"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loomi Suite dev server running on port ${PORT}`);
  });
}
startServer();
