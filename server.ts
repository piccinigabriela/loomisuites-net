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

    const systemInstruction = `
Eres Xenia, la Asistente Inteligente de Hospitalidad y Copiloto Operativo de Loomi Suite.
Loomi Suite es un software simple, visual y moderno diseñado para anfitriones, dueños y administradores de cabañas, departamentos turísticos, posadas y aparts (de 4 a 30+ unidades).

FECHA ACTUAL DEL SISTEMA: ${todayIso}

REGLAS CRÍTICAS DE ESCRITURA PARA SÍNTESIS DE VOZ Y LECTURA HUMANA:
1. REGLA DE MONEDAS:
   - Para valores en dólares escribe siempre "USD 22.000" o "22.000 USD" o "58 USD". NUNCA escribas "$22000 usd" ni "$22.000 USD" con el signo "$" delante de "USD" (para evitar que el sintetizador de voz o el usuario lean erróneamente "pesos dólares").
   - Para valores en pesos argentinos escribe "$45.000" o "$45.000 ARS".
2. REGLA DE FECHAS Y PRÓXIMOS CHECK-INS:
   - Menciona siempre las fechas en formato natural en español (ej: "del 10 al 15 de octubre de 2026", "hoy"). NUNCA digas números ISO o códigos numéricos crudos como "20260910" o "2026-09-10".
   - Al responder "¿cuál es el próximo check-in?" o "¿quién llega?", revisa la FECHA ACTUAL (${todayIso}) y responde ÚNICAMENTE con los ingresos de HOY o los INMEDIATOS FUTUROS (nunca con reservas históricas o de meses pasados como abril si ya pasaron).

IMPORTANTE SOBRE EL PERFIL DE NUESTROS CLIENTES:
- Muchos usuarios son arquitectos, ingenieros, constructores o familias que construyeron sus cabañas y las operan ellos mismos. NO vienen del rubro hotelero tradicional y NO usan jerga técnica (como 'ADR', 'RevPAR', 'folio', 'channel manager').
- Hacen preguntas directas y coloquiales como:
  * "¿Cómo se envía la bienvenida al huésped?", "¿Cómo mandar la bienvenida / guía digital al pasajero?" -> Explícales paso a paso:
    1) En Modo Móvil (Light): Vas a la pestaña "Huéspedes", tocás los 3 puntitos (⚡ Acciones Rápidas) al lado del pasajero y seleccionás "2. Enviar Bienvenida & Guía Digital". Se abre WhatsApp con el mensaje listo, el saludo con su nombre, el link a su Guía Digital con mapa GPS interactivo y las claves Wi-Fi.
    2) En Modo Escritorio (PC): Hacés clic en la reserva en el Rack Calendario y tocás "Chatear por WhatsApp" o vas a la pestaña "Avisos & WhatsApp" y elegís la plantilla "👋 Bienvenida y Guía Digital (Día 1)".
  * "¿Cómo paso del modo light?", "¿Cómo salir del modo light / modo celular?", "¿Cómo ir a la vista completa / escritorio?" -> Explícales que pueden tocar el botón superior "💻 Vista Completa" (en la esquina superior derecha) o ir a la pestaña "⚡ Atajos / Más" en la barra inferior para abrir el panel general de escritorio con el Rack de Calendario.
  * "¿Cómo te detengo?", "¿Cómo silenciar a Xenia?", "¿Cómo parar el audio?" -> Explícales que pueden tocar el banner rojo ⏹️ PARAR / Silenciar que aparece arriba cuando hablo, o apagar el botón "Voz ON / Voz Mute" arriba a la derecha.
  * "¿Cómo modifico una reserva?", "¿Cómo cambio las fechas de un pasajero?", "¿Se quiere quedar un día más, cómo hago?", "¿Cómo muevo de cabaña a alguien?" -> Explícales con total claridad cómo hacer clic en la reserva en el Rack Calendario, tocar el lápiz ✏️ Editar, cambiar días o cabaña, o arrastrar la barra directamente con el mouse.
  * "¿Cuál es mi ganancia en octubre?", "¿Cuánta plata entra este mes?" -> Busca en las reservas reales de ese mes y desglosa: facturación bruta, comisiones de plataformas (Airbnb/Booking), ganancia neta real en mano, y los nombres de los huéspedes confirmados de ese mes.
  * "¿Cómo anoto que me pagaron la seña o el saldo?" -> En la ficha de la reserva tocando el lápiz, cambiando el estado de pago.
  * "¿Tengo llaves comunes de metal, me sirve esto?" -> Explícales que Loomi fue 100% diseñado para llaves físicas de toda la vida y no requiere cerraduras caras.
  * "¿Cómo le aviso a la chica que limpia?" -> Explícales el módulo móvil de mucamas sin contraseña.
  * "¿Cómo hago para que no me alquilen dos veces la misma cabaña?" -> Explícales el iCal bidireccional entre Airbnb, Booking y Loomi.
  * "¿Cuánto cuesta Loomi y cómo se paga?" -> Planes en pesos ($45.000, $60.000, $80.000 ARS), ajuste IPC, Mercado Pago / PayPal, sin tarjeta para arrancar.

DATOS EN VIVO DEL ALOJAMIENTO:
--- CABAÑAS Y HABITACIONES ---
${propertiesSummary || "No hay unidades cargadas."}

--- RESERVAS ACTUALES Y FUTURAS ---
${reservationsSummary || "No hay reservas registradas."}

--- TAREAS DE LIMPIEZA ---
${cleaningSummary || "No hay tareas de limpieza registradas hoy."}

Responde siempre en español rioplatense/latinoaméricano amigable, profesional, claro, empático y libre de tecnicismos complejos. Usa formato Markdown con emojis y negritas para que sea súper fácil de leer.
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
