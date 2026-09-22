import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint to permanently save Xenia's avatar to disk at public/xenia.jpeg
app.post("/api/xenia/avatar", (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, "xenia.jpeg");
    fs.writeFileSync(filePath, buffer);

    console.log("Xenia avatar saved permanently to disk:", filePath);
    res.json({ success: true, url: "/xenia.jpeg?t=" + Date.now() });
  } catch (error: any) {
    console.error("Error saving Xenia avatar:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper for fallback rule-based response if GEMINI_API_KEY is not configured
function generateRuleBasedXeniaResponse(
  message: string,
  contextData?: any
): string {
  const q = message.toLowerCase();
  const properties = contextData?.properties || [];
  const reservations = contextData?.reservations || [];
  const cleaningTasks = contextData?.cleaningTasks || [];

  // 1. Landing Page, Precios, Planes y Métodos de Pago
  if (
    q.includes("precio") ||
    q.includes("plan") ||
    q.includes("planes") ||
    q.includes("tarifa") ||
    q.includes("cuanto cuesta") ||
    q.includes("cuánto cuesta") ||
    q.includes("abono") ||
    q.includes("mercado pago") ||
    q.includes("paypal") ||
    q.includes("tarjeta") ||
    q.includes("ipc") ||
    q.includes("inflacion") ||
    q.includes("inflación") ||
    q.includes("costo")
  ) {
    return `### 🏷️ Planes, Precios y Formas de Pago de Loomi

En Loomi tenemos **precios transparentes en pesos argentinos (ARS)** y ajustados por **IPC (inflación oficial)**, para que no tengas sobresaltos con el dólar:

- **Plan 4 a 10 Propiedades:** **$45.000 / mes** *(el más elegido por anfitriones y pequeños complejos)*.
- **Plan 10 a 20 Propiedades:** **$60.000 / mes** *(complejos medianos, aparts y posadas)*.
- **Plan 20 a 30 Propiedades:** **$80.000 / mes** *(operaciones profesionales de alto flujo)*.
- **Plan Personalizado (+30 Propiedades):** Tarifa a medida con migración asistida de reservas.

#### 💳 ¿Cómo se paga y qué requisitos hay?
- **¡Cero tarjeta de crédito para comenzar!** Podés probar la demo interactiva gratis y sin compromiso.
- **Suscripción mensual automática:** Se abona a través de **Mercado Pago** (con dinero en cuenta, débito o tarjetas nacionales en ARS) o mediante **PayPal**.
- **0% de comisiones por reserva:** Todo lo que cobres de tus huéspedes es 100% tuyo.
- **Mismo sistema completo para todos:** No te recortamos funciones según el plan.`;
  }

  // 2. Servicios de Loomi, Qué hace y Módulos Opcionales
  if (
    q.includes("servicio") ||
    q.includes("que hace") ||
    q.includes("qué hace") ||
    q.includes("cerradura") ||
    q.includes("llave") ||
    q.includes("desayuno") ||
    q.includes("frigobar") ||
    q.includes("minibar") ||
    q.includes("modulo") ||
    q.includes("módulo") ||
    q.includes("add-on") ||
    q.includes("para que sirve") ||
    q.includes("para qué sirve") ||
    q.includes("incluye")
  ) {
    return `### 🏨 ¿Qué resuelve Loomi Suite en tu día a día?

Loomi centraliza la gestión de tus alquileres para que no vivas atado al celular ni a planillas de Excel:

1. **Sincronización instantánea con Airbnb y Booking:** Cero overbooking o dobles reservas accidentales.
2. **Asistente Xenia IA 24/7:** Responde dudas recurrentes de huéspedes por WhatsApp (Wi-Fi, horarios, llegada).
3. **Módulo de limpieza para mucamas:** Checklist en el celular del personal para saber qué cabaña preparar.
4. **Motor propio de reservas directas:** Link personal para cobrar señas al 0% de comisión.
5. **Guía digital interactiva para el huésped:** Con mapa de llegada por ruta y recomendaciones turísticas.

#### 🔑 Llaves Físicas vs. Módulos Opcionales (Add-ons):
- **Funciona 100% con tu llave física tradicional:** No necesitás gastar en cerraduras caras ni cambiar nada en tus cabañas.
- **Módulo Frigobar, Desayunos & Consumos Extras (Opcional):** Para posadas y aparts que venden minibar, confitería o leña.
- **Módulo Cerraduras Electrónicas (Opcional):** Solo para departamentos urbanos que ya cuenten con teclados digitales (Tuya, TTLock, Yale).
- **Dominio Propio (.com / .com.ar) para Motor Directo (Opcional):** El cliente puede conectar su propio dominio (ej: \`reservas.misalojamientos.com\`) o Loomi gestiona el alta y certificado SSL con costo directo al cliente.
- **Modo Día a Día para Empleados:** Los colaboradores operan el rack, check-in y mucamas sin tener acceso a los números de facturación ni finanzas.`;
  }

  // 3. Financial / Rendición de cuentas queries
  if (
    q.includes("ingreso") ||
    q.includes("plata") ||
    q.includes("dinero") ||
    q.includes("factur") ||
    q.includes("seña") ||
    q.includes("saldo") ||
    q.includes("cuanto") ||
    q.includes("rendir") ||
    q.includes("cuenta") ||
    q.includes("balance") ||
    q.includes("comision")
  ) {
    const totalGross = reservations.reduce(
      (sum: number, r: any) => sum + (r.totalAmount || 0),
      0
    );
    const totalNet = reservations.reduce(
      (sum: number, r: any) => sum + (r.netRevenue || 0),
      0
    );
    const totalCommission = reservations.reduce(
      (sum: number, r: any) => sum + (r.commissionPaid || 0),
      0
    );
    const directCount = reservations.filter(
      (r: any) => r.platform === "direct"
    ).length;
    const directSaved = reservations
      .filter((r: any) => r.platform === "direct")
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0) * 0.18, 0);

    const pendingPayments = reservations.filter(
      (r: any) => r.paymentStatus === "pending" || r.paymentStatus === "deposit_only"
    );

    return `### 📊 Rendición de Cuentas Financieras (Xenia Copilot)

Aquí tienes el balance actualizado de tus alojamientos en tiempo real:

- **Facturación Bruta Total:** **$${totalGross.toLocaleString()} USD** (${reservations.length} reservas registradas).
- **Ingresos Netos en Mano:** **$${totalNet.toLocaleString()} USD** (después de tasas y comisiones).
- **Comisiones Pagadas a OTAs (Booking/Airbnb):** **$${totalCommission.toLocaleString()} USD**.
- **Ahorro por Reservas Directas:** **$${Math.round(directSaved).toLocaleString()} USD** gracias a ${directCount} reservas directas sin pagar el 18%.

${
  pendingPayments.length > 0
    ? `#### ⚠️ Cobros y Saldos Pendientes al Check-in:
${pendingPayments
  .map(
    (p: any) =>
      `• **${p.guestName}** (${p.platform.toUpperCase()}): Saldo pendiente de cobro en recepción de aprox. **$${Math.round(
        p.totalAmount * (p.paymentStatus === "deposit_only" ? 0.5 : 1)
      )} USD**.`
  )
  .join("\n")}`
    : "✅ *No tienes cobros de saldo pendientes registrados actualmente.*"
}

*¿Deseas que te desglose los ingresos por cabaña específica o ver el reporte de liquidación para propietarios?*`;
  }

  // 4. Check-ins / Guests / Huéspedes / Ocupación queries
  if (
    q.includes("huesped") ||
    q.includes("huésped") ||
    q.includes("check-in") ||
    q.includes("checkin") ||
    q.includes("check-out") ||
    q.includes("checkout") ||
    q.includes("ocupad") ||
    q.includes("ocupacion") ||
    q.includes("ocupación") ||
    q.includes("reserva") ||
    q.includes("reservas") ||
    q.includes("disponib") ||
    q.includes("libre") ||
    q.includes("llega") ||
    q.includes("sale") ||
    q.includes("hoy") ||
    q.includes("early") ||
    q.includes("late")
  ) {
    const todayStr = new Date().toISOString().split("T")[0];
    const totalProps = properties.length || 6;
    const occupiedCount = Math.min(
      totalProps,
      reservations.filter((r: any) => r.status === "confirmed" || r.status === "checked_in").length
    );
    const occupancyRate = Math.round((occupiedCount / Math.max(1, totalProps)) * 100);

    const checkInsToday = reservations.filter(
      (r: any) => r.checkIn === todayStr || (r.checkIn <= todayStr && r.checkOut > todayStr)
    );
    const checkOutsToday = reservations.filter((r: any) => r.checkOut === todayStr);

    const listSnippet = reservations
      .slice(0, 5)
      .map((r: any) => {
        const pName = properties.find((p: any) => p.id === r.propertyId)?.name || "Cabaña";
        const feeInfo = r.airbnbFeeMode === "traditional_3" ? " (Airbnb 3% tradicional)" : "";
        const earlyLateInfo = r.earlyCheckIn ? " [Early Check-in]" : r.lateCheckOut ? " [Late Check-out]" : "";
        return `• **${r.guestName}** en *${pName}* (${r.platform.toUpperCase()}${feeInfo}): ${r.checkIn} al ${r.checkOut} ($${r.totalAmount} USD)${earlyLateInfo}`;
      })
      .join("\n");

    return `### 🛏️ Estado de Ocupación y Reservas en Tiempo Real

📊 **Ocupación Actual:**
- **Nivel de Ocupación:** **${occupancyRate}%** (${occupiedCount} de ${totalProps} unidades con reservas confirmadas).
- **Total de Reservas Activas:** **${reservations.length} reservas registradas**.
- **Ingresos hoy:** ${checkInsToday.length > 0 ? `${checkInsToday.length} ingresos en curso o previstos` : "Sin ingresos nuevos hoy"}.
- **Salidas hoy:** ${checkOutsToday.length > 0 ? `${checkOutsToday.length} salidas previstas` : "Sin check-outs para hoy"}.

📋 **Próximas Estadías Registradas:**
${listSnippet}

💡 *Acciones operativas:* Podés filtrar reservas por canal, ver accesos con clave o llave física, y coordinar con el personal de limpieza desde el Rack de Disponibilidad.`;
  }

  // 5. Instructions / Cómo usar la plataforma
  if (
    q.includes("como") ||
    q.includes("cómo") ||
    q.includes("sincroniz") ||
    q.includes("ical") ||
    q.includes("booking") ||
    q.includes("airbnb") ||
    q.includes("conectar") ||
    q.includes("paso") ||
    q.includes("tutorial") ||
    q.includes("manual") ||
    q.includes("usar") ||
    q.includes("funciona") ||
    q.includes("mucama") ||
    q.includes("limpieza") ||
    q.includes("directa")
  ) {
    if (q.includes("sincroniz") || q.includes("booking") || q.includes("airbnb") || q.includes("ical")) {
      return `### 🔄 Instrucciones: Cómo sincronizar Booking.com y Airbnb sin dobles reservas

Loomi Suite utiliza sincronización bidireccional iCal para que nunca tengas un overbooking. Sigue estos 3 pasos:

1. **Obtener el enlace iCal de tu canal:**
   - En **Airbnb**: Ve a tu *Anuncio > Disponibilidad y precios > Sincronización de calendarios > Exportar calendario* y copia el enlace webcal/https.
   - En **Booking.com**: Ve a la *Extranet > Tarifas y Disponibilidad > Sincronizar calendarios > Añadir conexión* y copia el link.
2. **Pegarlo en Loomi Suite:**
   - Ve a la pestaña **Cabañas & Habitaciones**, haz clic en **Editar / Sincronizar** de la unidad correspondiente y pega el enlace en el campo del canal.
3. **¡Listo!**
   - A partir de ese segundo, cada vez que entra una reserva en Booking, Loomi Suite bloquea las fechas en Airbnb y en tu rack en tiempo real.`;
    }

    if (q.includes("limpieza") || q.includes("mucama")) {
      return `### 🧹 Instrucciones: Cómo coordinar la limpieza sin grupos de WhatsApp caóticos

1. Ve a la pestaña **Limpieza & Operaciones**.
2. Al registrarse un check-out, la unidad pasa automáticamente a estado **Pendiente (Sucia)**.
3. Puedes hacer clic en **"Compartir link a Mucama por WhatsApp"**: se genera un enlace web móvil sencillo donde el personal ve su lista de cabañas a limpiar hoy, con checklist de sábanas, toallas y leña.
4. Cuando terminan, tocan **"Marcar como Lista"** y tu rack se actualiza a verde al instante sin que tengan que llamarte ni escribirte.`;
    }

    if (q.includes("directa") || q.includes("seña") || q.includes("link")) {
      return `### 💰 Instrucciones: Cómo cobrar reservas directas y ahorrar 18% de comisiones

1. Ve a la pestaña **Cabañas & Habitaciones**.
2. Cada unidad tiene su botón **"Copiar Link de Reserva Directa"** (por ejemplo: \`loomisuite.com/reserva/cabana-1\`).
3. Comparte ese enlace en tu perfil de Instagram, en Google Maps o en tu respuesta automática de WhatsApp Business.
4. El huésped selecciona sus fechas, ve tus fotos y te envía la solicitud con el comprobante de transferencia de la seña (50%).
5. Te ahorras los $35 a $70 USD que Booking o Airbnb te descuentan por estadía.`;
    }

    return `### 📘 Guía Rápida de Loomi Suite (Instrucciones de Uso)

Loomi Suite está diseñado para ser tan simple que lo domines en 5 minutos:

- **Rack Calendario:** Arrastra o haz clic en cualquier fecha para cargar reservas telefónicas o directas en 1 clic.
- **Cabañas & Habitaciones:** Configura precios por noche, capacidad de camas, clave de WiFi y tipo de cerradura/llave.
- **Limpieza & Mucamas:** Asigna tareas del día con checklist de ropa blanca y reposición.
- **WhatsApp & Mensajería:** Plantillas prediseñadas con datos de llegada y bienvenida para enviar en un clic sin tipear lo mismo 50 veces.
- **Finanzas:** Mira tu facturación neta, comisiones deducidas y saldo de señas.

*¿Tienes alguna duda sobre alguna función en particular? Pregúntame lo que necesites.*`;
  }

  // Default response
  return `### 👋 Hola, soy Xenia, tu copiloto en Loomi Suite

Estoy aquí para ayudarte en tres áreas clave:

1. **Precios y Servicios de Loomi:** Pregúntame sobre los planes en pesos ($45.000, $60.000, $80.000 ARS), ajuste por IPC, suscripción por Mercado Pago / PayPal, sin tarjeta para arrancar y módulos opcionales.
2. **Rendición de Cuentas y Finanzas:** Pregúntame sobre ingresos del mes, recaudación por canal (Booking vs Airbnb vs Directo), señas cobradas o saldos a cobrar al check-in.
3. **Instrucciones de Uso:** Pregúntame cómo sincronizar calendarios, cómo crear reservas directas, cómo avisarle a las mucamas o cómo configurar los mensajes automáticos.

**Prueba preguntarme:**
- *"¿Cuánto cuesta Loomi y cómo se paga?"*
- *"¿Qué servicios incluye y cómo funciona con llaves físicas?"*
- *"¿Cuánto dinero ingresó este mes y cuánto ahorré en comisiones?"*
- *"¿Cómo sincronizo el calendario con Booking y Airbnb paso a paso?"*`;
}

// Xenia Chat API Endpoint
app.post("/api/xenia/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], contextData } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "El mensaje es obligatorio" });
      return;
    }

    const ai = getGeminiClient();

    // If Gemini client is not configured, gracefully use the enriched rule-based assistant
    if (!ai) {
      const fallbackReply = generateRuleBasedXeniaResponse(message, contextData);
      res.json({
        reply: fallbackReply,
        source: "xenia_local_engine",
      });
      return;
    }

    // Build context summary for Gemini
    const propertiesSummary = (contextData?.properties || [])
      .map(
        (p: any) =>
          `- ${p.name} (${p.type}): Capacidad ${p.maxGuests} huéspedes, $${p.basePrice} USD/noche. WiFi: "${p.wifiNetwork}", Clave: "${p.wifiPassword}". Cerradura: ${p.smartLock?.enabled ? `Digital (${p.smartLock?.brand})` : "Llave física en recepción"}.`
      )
      .join("\n");

    const reservationsSummary = (contextData?.reservations || [])
      .map(
        (r: any) =>
          `- Huésped: ${r.guestName} | Canal: ${r.platform.toUpperCase()} | Fechas: ${r.checkIn} al ${r.checkOut} (${r.nights} noches) | Total: $${r.totalAmount} USD | Neto: $${r.netRevenue} USD | Comisión OTA: $${r.commissionPaid} USD | Pago: ${r.paymentStatus} | Estado: ${r.status}`
      )
      .join("\n");

    const cleaningSummary = (contextData?.cleaningTasks || [])
      .map(
        (c: any) =>
          `- Tarea: ${c.cleanerName} asignada a las ${c.scheduledTime} | Estado: ${c.status} | Daños/Notas: ${c.notes || "Ninguno"}`
      )
      .join("\n");

    const systemInstruction = `
Eres Xenia, la Asistente Inteligente de Hospitalidad y Copiloto Operativo de Loomi Suite.
Loomi Suite es un software simple, visual y moderno diseñado para anfitriones, dueños y administradores de cabañas, departamentos turísticos, posadas y aparts (de 4 a 30+ unidades).

TUS CAPACIDADES CENTRALES SON:
1. EXPLICAR LA PROPUESTA COMERCIAL, PRECIOS Y SERVICIOS DE LOOMI:
   - Planes claros en pesos argentinos (ARS) con ajuste por IPC (inflación oficial):
     * 4 a 10 propiedades: $45.000 / mes (el más elegido).
     * 10 a 20 propiedades: $60.000 / mes.
     * 20 a 30 propiedades: $80.000 / mes.
     * +30 propiedades: Plan personalizado a medida.
   - Tranquilidad de pago:
     * ¡No se requiere tarjeta de crédito para comenzar a probar la plataforma!
     * Se paga mediante suscripción mensual automática con Mercado Pago (en ARS, débito, dinero en cuenta o tarjetas locales) o PayPal.
     * 0% de comisión por reservas directas.
     * Mismo servicio integral para todos (sincronización Airbnb/Booking, Xenia IA, módulo de limpieza móvil, motor de reservas directas, reportes a propietarios).
   - Filosofía de accesos:
     * Funciona 100% con llaves físicas tradicionales. No se obliga a nadie a comprar cerraduras inteligentes.
     * Módulos opcionales (Add-ons): Módulo Frigobar/Desayunos/Extras (para posadas/aparts) y Módulo Cerraduras Electrónicas (para quien ya tenga teclados digitales).

2. RENDIR CUENTAS FINANCIERAS Y DE HUÉSPEDES:
   - Responde con exactitud sobre ingresos brutos, ingresos netos, comisiones pagadas a OTAs (Booking, Airbnb), comisiones ahorradas por reservas directas (18% habitual).
   - Huéspedes que ingresan hoy (check-in), que salen hoy (check-out), ocupación actual y saldos pendientes de cobro (señas vs saldos en mostrador).
   - Usa los datos reales proporcionados a continuación en el contexto.

3. SINCRONIZACIÓN iCAL Y PRECIOS MANUALES:
   - Explica con total claridad que cuando se sincronizan calendarios por iCal (.ics estándar) con Airbnb o Booking, el enlace SOLO bloquea fechas para evitar overbooking. Las plataformas NO transmiten por iCal la tarifa cobrada ni el email o teléfono del huésped.
   - Por esa razón, en Loomi la tarifa manual y la edición de importes está habilitada para TODAS las reservas (Directa, Airbnb, Booking, VRBO).
   - El anfitrión puede abrir cualquier reserva y tocar el lápiz ✏️ para colocar el importe real facturado, y el sistema recalcula automáticamente comisiones (3% o 15% Airbnb, 15% Booking) e ingreso neto.

4. INSTRUCCIONES DE USO DE LA PLATAFORMA (AUTONOMÍA & GUÍA OPERATIVA):
   - Explicar paso a paso cómo usar cada módulo de Loomi Suite (sincronización iCal con Booking/Airbnb, mucamas, link de reservas directas, carga de reservas).
   - Redactar mensajes listos para copiar y pegar para enviar a huéspedes por WhatsApp (llegada por ruta, clave de wifi, recordatorio de seña).

DATOS EN VIVO DEL ALOJAMIENTO:
--- CABAÑAS Y HABITACIONES ---
${propertiesSummary || "No hay unidades cargadas."}

--- RESERVAS ACTUALES Y FUTURAS ---
${reservationsSummary || "No hay reservas registradas."}

--- TAREAS DE LIMPIEZA ---
${cleaningSummary || "No hay tareas de limpieza registradas hoy."}

Responde siempre en español rioplatense/latinoaméricano amigable, profesional, claro y empático. Usa formato Markdown con emojis y negritas para que sea súper fácil de leer.
`;

    // Transform chat history for Gemini
    const contents = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = response.text || "No pude generar una respuesta en este momento.";

    res.json({
      reply,
      source: "gemini_api",
    });
  } catch (error: any) {
    console.error("Error en endpoint /api/xenia/chat:", error);
    // Graceful fallback to rule-based engine on any error
    const fallbackReply = generateRuleBasedXeniaResponse(
      req.body?.message || "",
      req.body?.contextData
    );
    res.json({
      reply: fallbackReply,
      source: "xenia_local_engine_fallback",
    });
  }
});

// Setup server middleware & listening
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loomi Suite dev server running on port ${PORT}`);
  });
}

startServer();
