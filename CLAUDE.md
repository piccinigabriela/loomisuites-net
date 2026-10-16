# Loomi Suite — notas para Claude

PMS para complejos chicos (4–20 unidades). Dueña: Gabi. La app real es app.loomisuite.net; la landing, loomisuite.net.
Gabi usa Loomi con su propio complejo (Catalinas, unidades A–D). Hay datos reales: cuidado con cualquier cambio de datos o reglas.

## Cómo hablarle a Gabi
- Español rioplatense con voseo. Nada de "o/a": roles neutros (Limpieza, Recepción, Administración).
- Respuestas cortas y claras; ella no programa en el día a día.
- UI: alto contraste, modo oscuro; nada de textos grises claros.

## Stack
- React 19 + TypeScript + Vite + Tailwind 4 (`@custom-variant dark`).
- Firebase Auth + Firestore (proyecto gen-lang-client-0206771016, base con nombre en `firebase-applet-config.json`).
  Datos por cuenta en `tenants/{uid}` y subcolecciones; también `subscriptions/{uid}`, `publicGuides/{uid}`,
  `publicCalendars/{uid}/units`, `precheckins/{hostUid}/items`, `leads`. Reglas en `firestore.rules`
  (Gabi las pega a mano en la consola: si las cambiás, avisale).
- Cloudflare Pages: cada push a `main` de GitHub (piccinigabriela/loomisuites-net) se publica solo.
  Functions en `functions/` (proxy de login en `functions/__/`, OG de `/guia` y `/manual`); rutas en `public/_routes.json`.
- Xenia (asistente IA) corre en un backend de AI Studio con Gemini. No borrar ese proyecto de AI Studio.
- `isAppMode()` = hostname `app.` o `?mode=app`. Sin eso, la app muestra la demo con datos de ejemplo.
- Roles (`/admin`, `/recepcion`, `/limpieza`) hoy son solo vistas de la misma cuenta, no permisos.

## Verificar antes de subir
1. `npx tsc --noEmit`
2. `npx vite build`
3. Para ver pantallas: `npx vite preview --port 4173` y Playwright con
   `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` (viewport 390×844 para celular).
   Matar el preview con `pkill -f "vite preview"` en una llamada aparte.

## Commits
`git -c user.name=Claude -c user.email=noreply@anthropic.com commit` con mensaje en español,
más las líneas de atribución que indique la sesión. Después `git push origin main`.

## Decisiones tomadas
- Prueba de 7 días; la activación se hace a mano en Firestore (`subscriptions/{uid}`).
- Una moneda de liquidación por complejo. AFIP no interesa.
- "Tu Web" todavía no es pública (la landing dice "próximamente").
- Textos de la landing: honestos con iCal (no es instantáneo) y WhatsApp (mensajes listos, se envían con un toque).

## Pendientes
La lista viva está en la checklist "Pendientes Loomi" (artifact de Gabi), no acá.
