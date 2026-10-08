import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { getClientXeniaReply } from "./src/components/xenia/xeniaLocalEngine";

const app = express();
const PORT = 3000;

// CORS configuration for loomisuite.net, Cloudflare Pages, and local dev
app.use((req: Request, res: Response, next) => {
  const allowedOrigins = [
    "https://loomisuite.net",
    "https://www.loomisuite.net",
    "https://loomisuites-net.pages.dev",
    "http://localhost:3000",
    "http://localhost:5173",
  ];
  const origin = req.headers.origin as string;
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

// Endpoints for persistent complex state across devices and sessions
const STATE_FILE_PATH = path.join(process.cwd(), "data", "app_state.json");

app.get("/api/state", (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, "utf-8");
      return res.json({ success: true, state: JSON.parse(data) });
    }
    return res.json({ success: true, state: null });
  } catch (error: any) {
    console.error("Error reading server state:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/state", (req: Request, res: Response) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: "No state provided" });
    }
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving server state:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint to permanently store and serve custom Xenia avatar image
app.post("/api/xenia/avatar", (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "No imageBase64 provided" });
    }
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(path.join(publicDir, "xenia.jpeg"), buffer);
    return res.json({ success: true, url: "/xenia.jpeg" });
  } catch (error: any) {
    console.error("Error saving Xenia avatar:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Helper for fallback rule-based response if GEMINI_API_KEY is not configured or rate-limited
function generateRuleBasedXeniaResponse(
  message: string,
  contextData?: any
): string {
  let demoState = contextData || {};
  if (!demoState.reservations || demoState.reservations.length === 0) {
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        demoState = JSON.parse(fs.readFileSync(STATE_FILE_PATH, "utf-8"));
      }
    } catch (_e) {}
  }
  return getClientXeniaReply(message, demoState);
}

// Xenia Chat API Endpoint
app.post("/api/xenia/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], contextData: rawContextData, context: rawContext } = req.body;
    let contextData = rawContextData || rawContext || {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "El mensaje es obligatorio" });
      return;
    }

    // Default to app_state.json if reservations are empty
    if (!contextData.reservations || contextData.reservations.length === 0) {
      try {
        if (fs.existsSync(STATE_FILE_PATH)) {
          const fileData = JSON.parse(fs.readFileSync(STATE_FILE_PATH, "utf-8"));
          contextData = {
            properties: contextData.properties?.length > 0 ? contextData.properties : fileData.properties || [],
            reservations: fileData.reservations || [],
            cleaningTasks: contextData.cleaningTasks?.length > 0 ? contextData.cleaningTasks : fileData.cleaningTasks || [],
            addons: contextData.addons?.length > 0 ? contextData.addons : fileData.addons || [],
          };
        }
      } catch (_e) {}
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

    const todayIso = new Date().toISOString().split("T")[0];

    // Build context summary for Gemini
    const propertiesSummary = (contextData?.properties || [])
      .map(
        (p: any) =>
          `- ${p.name} (${p.type}): Capacidad ${p.maxGuests} huéspedes, ${p.basePrice} USD/noche. WiFi: "${p.wifiNetwork}", Clave: "${p.wifiPassword}". Cerradura: ${p.smartLock?.enabled ? `Digital (${p.smartLock?.brand})` : "Llave física en recepción"}.`
      )
      .join("\n");

    const sortedReservations = [...(contextData?.reservations || [])]
      .filter((r: any) => r.status !== "cancelled")
      .sort((a: any, b: any) => (a.checkIn || "").localeCompare(b.checkIn || ""));

    const reservationsSummary = sortedReservations
      .map(
        (r: any) =>
          `- Huésped: ${r.guestName} | Cabaña ID: ${r.propertyId} | Canal: ${r.platform.toUpperCase()} | Fechas: ${r.checkIn} al ${r.checkOut} (${r.nights} noches) | Total: ${r.totalAmount} USD | Neto: ${r.netRevenue} USD | Comisión OTA: ${r.commissionPaid} USD | Pago: ${r.paymentStatus} | Estado: ${r.status} ${r.checkIn === todayIso ? '[CHECK-IN HOY]' : r.checkIn > todayIso ? '[FUTURA/PRÓXIMA]' : '[HISTÓRICA/PASADA]'}`
      )
      .join("\n");

    const cleaningSummary = (contextData?.cleaningTasks || [])
      .map(
        (c: any) =>
          `- Tarea: ${c.cleanerName} asignada a las ${c.scheduledTime} | Estado: ${c.status} | Daños/Notas: ${c.notes || "Ninguno"}`
      )
      .join("\n");

    const addonsSummary = (contextData?.addons || [])
      .map(
        (a: any) =>
          `- ${a.name} (${a.category}): ${a.price} USD (${a.unitLabel}). ${a.description}`
      )
      .join("\n");

    const systemInstruction = `
ERES XENIA, LA CONSERJE DIGITAL Y ASISTENTE INTELIGENTE DE HOSPITALIDAD DE LOOMI SUITE.
Loomi Suite es el ecosistema de hospitalidad serena y eficiente para cabañas, domos, departamentos turísticos y posadas.

FECHA ACTUAL DEL SISTEMA: ${todayIso}

=============================================================================
DIRECTIVAS MAESTRAS DE HOSPITALIDAD OMOTENASHI (REGLAS OBLIGATORIAS):
=============================================================================

1. IDENTIDAD Y TONO:
   - Eres la conserje digital del complejo.
   - Tu tono es sereno, empático, pulcro y sumamente conciso.
   - Respondes en español rioplatense neutro ("te esperamos", "podés ingresar con", "quedamos a disposición") o en el idioma en que te escriba el huésped (inglés, portugués, francés, etc.).
   - Tu trato transmite hospitalidad Omotenashi: calidez sin abrumar, anticipación y serenidad japonesa adaptada a nuestra región.

2. RESPUESTAS BREVES (ESTILO WHATSAPP):
   - Cada mensaje debe tener un MÁXIMO DE 2 A 3 PÁRRAFOS CORTOS, amables, claros y directos.
   - Evita respuestas interminables, introducciones de relleno o listas abrumadoras. Lo que envías debe poder leerse en la pantalla de un celular en 10 segundos.

3. AUTONOMÍA EN INFORMACIÓN CLAVE:
   - Responde con total autonomía y precisión sobre:
     * Horarios oficiales: Check-in (a partir de las 14:00 hs) y Check-out (hasta las 10:00 hs).
     * Clave y nombre de red Wi-Fi de la unidad asignada.
     * Código de cerradura digital o retiro de llaves físicas en recepción.
     * Ubicación, dirección y ruta de llegada.
   - Proporciona siempre los datos concretos de la reserva y el enlace al Portal del Huésped (GuestWelcomePortal / https://loomisuite.net/guia/[unidad]).

4. SERVICIOS ADICIONALES (ADDONS):
   - Informa sobre servicios extras disponibles en el complejo según los datos de addons:
     * Estacionamiento / cocheras privadas cubiertas.
     * Late check-out (salida extendida) y early check-in.
     * Traslados y transfers aeropuerto/terminal in y out.
     * Experiencias, degustación de vino, canastas de desayuno y spa.
   - Brinda los precios transparentes en USD o ARS si el huésped lo solicita.

5. CASOS CRÍTICOS, RECLAMOS Y LÍMITES ESTRICTOS (DERIVACIÓN HUMANA):
   - Ante roturas, reclamos, falta de agua, problemas de climatización, ruidos molestos o cualquier situación imprevista:
     * NO inventes soluciones técnicas ni hagas promesas de reparación física.
     * Responde con profunda empatía y serenidad: "Lamento mucho el inconveniente. Ya mismo le di aviso prioritario a nuestro anfitrión y equipo del complejo para que se comunique contigo a la brevedad y lo resolvamos juntos."
     * Deriva de inmediato al anfitrión humano responsable.
   - NUNCA menciones términos técnicos de software, bases de datos, APIs, prompts, JSON ni PMS. Para el huésped eres la conserje del alojamiento.

=============================================================================
REGLAS CRÍTICAS DE MONEDAS Y FECHAS:
=============================================================================
1. REGLA DE MONEDAS:
   - Para valores en dólares escribe siempre "USD 22.000", "22.000 USD" o "58 USD". NUNCA escribas "$22000 usd" ni "$22.000 USD" con el signo "$" delante de "USD".
   - Para valores en pesos argentinos escribe "$45.000" o "$45.000 ARS".
2. REGLA DE FECHAS:
   - Fechas en formato natural en español (ej: "del 10 al 15 de octubre de 2026", "hoy"). NUNCA números ISO o códigos crudos como "20260910".
   - Revisa la FECHA ACTUAL (${todayIso}) y responde con los ingresos de HOY o los INMEDIATOS FUTUROS.

=============================================================================
PLANES COMERCIALES DE LOOMI SUITE (SI CONSULTA EL ANFITRIÓN):
=============================================================================
- 2 planes fijos por complejo entero (sin costos por habitación y sin comisiones):
  1) Plan Loomi: $45.000 ARS/mes. Para dueños de 4 o 5 cabañas sin personal (Rack Modo Light móvil, gestión directa e iCal, rendimiento básico).
  2) Plan Loomi Suite: $60.000 ARS/mes. Ecosistema ilimitado para todo el complejo (Housekeeping en vivo para mucamas, modo recepción con roles, asistente Xenia AI 24/7 y 3 Modelos Web Oficiales con Portal del Huésped).

=============================================================================
DATOS EN VIVO DEL ALOJAMIENTO:
=============================================================================
--- CABAÑAS Y HABITACIONES ---
${propertiesSummary || "No hay unidades cargadas."}

--- RESERVAS ACTUALES Y FUTURAS ---
${reservationsSummary || "No hay reservas registradas."}

--- TAREAS DE LIMPIEZA & HOUSEKEEPING ---
${cleaningSummary || "No hay tareas de limpieza registradas hoy."}

--- SERVICIOS ADICIONALES (ADDONS) ---
${addonsSummary || "No hay servicios adicionales registrados."}
`;

    // Ensure valid alternating contents starting with role: "user"
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    let expectsRole: "user" | "model" = "user";

    for (const h of history) {
      if (!h || !h.content) continue;
      const r: "user" | "model" = h.role === "assistant" || h.role === "model" ? "model" : "user";
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
          temperature: 0.3,
        },
      });
    } catch (_geminiErr) {
      // Graceful fallback to rule-based engine on any error (e.g. rate limit, quota, network)
      const fallbackReply = generateRuleBasedXeniaResponse(message, contextData);
      res.json({
        reply: fallbackReply,
        source: "xenia_local_engine_fallback",
      });
      return;
    }

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
