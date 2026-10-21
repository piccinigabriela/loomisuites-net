# Pedido: pasar Xenia de AI Studio (Gemini) a Claude

Para la sesión de Opus. Leer también `CLAUDE.md`. Gabi no programa: explicarle en corto y con voseo.

## Cómo funciona hoy
- La app llama a `POST /api/xenia/chat` vía `getApiUrl()` (`src/utils/apiConfig.ts`). En loomisuite.net apunta al backend de
  AI Studio: `https://ais-dev-cvij35elxz36fvviooc5t3-448410991248.us-east5.run.app` (Gemini).
- Envía `{ message, history: [{role, content}], contextData: { properties, reservations, cleaningTasks, ... } }` y espera `{ reply }`.
- Llamadas desde `XeniaFloatingWidget.tsx`, `XeniaCopilotView.tsx` y `MobileLightView.tsx`. Si falla o tarda más de 15 s,
  contesta `xeniaLocalEngine.ts` (respuestas fijas por palabras clave).
- Problema detectado el 19/10: con un límite de 1,2 s casi siempre respondía el motor local ("Xenia responde cualquier cosa").
  Ya se subió a 15 s en los tres lugares.

## Qué hacer
1. Pages Function `functions/api/xenia/chat.js` (sumar `/api/*` a `public/_routes.json`) que llame a la API de Claude con
   `claude-haiku-5-5` (verificar el nombre del modelo y los precios en docs.claude.com antes de escribirlo).
   La clave va en la variable de entorno `ANTHROPIC_API_KEY` de Cloudflare Pages (la carga Gabi en el panel; guiarla paso a paso).
   Nunca poner la clave en el código ni en el repo.
2. Instrucciones de sistema: español rioplatense con voseo, 2 a 4 frases, sin "o/a". Menús actuales (verificarlos contra el código):
   Administración → Unidades y calendarios / Tarifas / Equipo y accesos; Reservas → Tu Web y Guía; Reservas → Ocupación → Importar;
   Recepción entra al calendario; Limpieza ve su agenda y el checklist. iCal no es instantáneo (cada 15 min aprox.).
   Si no sabe: derivar al WhatsApp de soporte +54 9 11 4092-5939 (8 a 22 hs). Nunca inventar menús ni funciones.
   Nunca presentar la baja ocupación como un fracaso: empezar por la solución.
3. Mandar solo el contexto necesario (sin teléfonos ni importes si no hacen falta), limitar el tamaño del historial y
   poner un tope de uso por cuenta para que el costo no se dispare. Costo estimado: menos de USD 1 por mes por complejo.
4. Cambiar `getApiUrl` para que `/api/xenia/chat` vaya a la función nueva. Dejar AI Studio funcionando hasta probar
   (no borrar ese proyecto).
5. Probar en app.loomisuite.net con preguntas reales ("¿dónde cargo las tarifas?", "¿cómo invito a mi personal de limpieza?")
   y después repasar las respuestas de `xeniaLocalEngine.ts`, que sigue siendo el respaldo.
6. Verificar como dice `CLAUDE.md` (tsc, build, `npm run probar`) y marcar en la checklist "Pendientes Loomi"
   los ítems de Xenia (`prod-xenia`, `prod-xenia-menu`).
