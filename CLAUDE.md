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
  (si las cambiás, avisale). Se prueban con `rules-test/` y se publican desde Cloud Shell con
  `firebase deploy --only firestore:rules` (la base con nombre está en `firebase.json`).
- Cloudflare Pages: cada push a `main` de GitHub (piccinigabriela/loomisuites-net) se publica solo.
  Functions en `functions/` (proxy de login en `functions/__/`, OG de `/guia` y `/manual`); rutas en `public/_routes.json`.
- Sincronización iCal en el servidor: `server-sync/` (Firebase Function programada cada 15 min, codebase `ical`,
  config en `firebase.json`). La lógica está en `src/lib/icalCore.ts` y la comparten la app y el servidor: no duplicarla.
  Modo en Firestore `sistema/icalSync.modo` ("prueba" no escribe; "real" escribe). Estado por cuenta en `tenants/{uid}/sync/ical`.
  Se publica desde Cloud Shell (`firebase deploy --only functions`), no con el push. Comandos: `npm run prueba|estado|activar|pausar` en `server-sync/`.
- Xenia: `src/lib/xeniaClient.ts` (`askXenia`) prueba en orden 1) Claude, `functions/api/xenia/chat.js` (solo app real y con sesión:
  verifica el token de Firebase; modelo claude-haiku-5-5; instrucciones con el mapa de pantallas dentro de la función: si cambia un menú,
  actualizarlas ahí), 2) el backend viejo de AI Studio con Gemini (`server.ts`, sus instrucciones están desactualizadas; no borrar ese
  proyecto hasta probar Claude), 3) las respuestas fijas de `xeniaLocalEngine.ts`. La función necesita la variable `ANTHROPIC_API_KEY`
  en Cloudflare Pages; sin ella responde 503 y se sigue con 2 y 3. Contexto que se manda: `src/lib/xeniaContext.ts` (sin teléfonos ni wifi).
- `isAppMode()` = hostname `app.` o `?mode=app`. Sin eso, la app muestra la demo con datos de ejemplo.
- Roles: el dueño puede ver las tres vistas (`/admin`, `/recepcion`, `/limpieza`). El personal entra con su cuenta:
  `invites/{mail}` (lo crea el dueño en Administración → Equipo y accesos) → al aceptar se crea `memberships/{uid}`
  {tenantId, role: recepcion|limpieza}. `tenantUid` en App.tsx es el complejo cuyos datos se usan (no siempre el usuario).
  Limpieza no lee reservas ni `tenants/{uid}`: ve `tenants/{uid}/staff/llegadas` (sin teléfonos ni importes; lo reescribe
  entero también el servidor) y `tenants/{uid}/staff/complejo` (nombre, horarios y fecha de alta; lo escriben el dueño y Recepción desde la app). Reglas probadas con `rules-test/` (`npm run probar` en Cloud Shell).
  Notas de limpieza: `cleaningTasks/{id}.messages` (Administración/Recepción y Limpieza; Limpieza solo suma una nota suya, con `arrayUnion`)
  y `notesSeen`; aviso arriba en la app para Administración y Recepción (`src/lib/cleaningNotes.ts`, `components/common/CleaningNotes.tsx`).

- Tarifas: `tenants/{uid}.pricing` (se guarda entero con `savePricingDoc`). Cálculo en `src/lib/pricing.ts` (`quoteStay`):
  finde largo > temporada > normal; fin de semana = noches marcadas (por defecto vie, sáb, dom). Findes largos de
  Argentina precargados hasta oct 2027 (faltan los días turísticos 2027, sin decreto todavía). Pantalla: Administración → Tarifas.

- Tu Web (reservas directas): `src/lib/publicSite.ts` (modelo y lógica, compartida con el servidor) y `publicSiteStore.ts`.
  Link `loomisuite.net/web/{slug}` (se arma en `main.tsx`, sin la app). Usa un nombre y NO el uid: con el uid se llega a la guía (wifi).
  `siteOwners/{slug}` {uid} (privado) · `publicSites/{slug}` (público: textos, unidades, tarifas, `busy` = rangos ocupados sin datos de huéspedes)
  · `publicSites/{slug}/photos` (data URL JPEG < 950 KB) · `siteDomains/{host}` {slug} (dominio propio, lo carga la administración).
  Config del dueño en `tenants/{uid}.webSite`. App.tsx publica sola los cambios; `busy` lo escriben la app (dueño o Recepción) y server-sync.
  Pantalla: Tu Web y Guía → pestaña Tu Web (`TuWebSettings.tsx`). Vista previa del link: `functions/web/`.
  Dominio propio (a mano): Cloudflare Pages → Custom domains; documento `siteDomains/{dominio sin www}` {slug}; sumar el dominio a la clave de reCAPTCHA (App Check).
  Estilos: Noche, Día y Clara incluidos; diseños especiales de pago (hoy Tierra) en `SPECIAL_THEMES`, se habilitan por cuenta en
  `subscriptions/{uid}.webDesigns` desde el Panel de clientes (solo administración). Sin habilitar, se publica Noche.
  `DirectBookingLanding.tsx` es la maqueta vieja: ya no se usa en la app ni en la demo.

- Cobro del abono: `src/lib/billing.ts`. `config/billing` (precios en pesos por plan, datos de transferencia, mail de Payoneer,
  descuento, días de gracia, MEP de respaldo; precios en dólares) lo edita la administración en Panel de clientes → Cobro y precios; lo leen usuarios con sesión.
  Los datos bancarios NO van en el código (el repo es público). Pantalla "Mi plan" (`components/billing/MyPlanView.tsx`): menú de la
  cuenta, Más (celular), avisos de vencimiento y pantalla de cuenta pausada. "Ya pagué" crea `paymentNotices/{id}`; el Panel lo muestra
  con "Renovar 1 mes". Transferencia en pesos = precio en USD × MEP del día (`functions/api/mep.js`, lee dolarapi.com); Payoneer = USD − descuento.
  Días de gracia: `getAccessStatus(..., graceDays)` devuelve `grace` (sigue entrando, con aviso) antes de `expired`.
  Precios de la landing (`BentoLanding.tsx`, `LeadModal.tsx`, `DemoPlanFunctionalBar.tsx`) y de Xenia están fijos en el código: si cambian, actualizarlos también ahí.

## Verificar antes de subir
1. `npx tsc --noEmit`
2. `npm run build` (incluye la landing prearmada; `npx vite build` solo no la prueba)
3. `npm run probar`: abre las pantallas principales en celular y compu y falla si alguna queda vacía o en negro,
   tiene errores de JavaScript o se desborda. No subir si falla.
4. Para ver pantallas a mano: `npx vite preview --port 4173` y Playwright con
   `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` (viewport 390×844 para celular).
   Matar el preview con `pkill -f "vite preview"` en una llamada aparte.

## Commits
`git -c user.name=Claude -c user.email=noreply@anthropic.com commit` con mensaje en español,
más las líneas de atribución que indique la sesión. Después `git push origin main`.

## Decisiones tomadas
- Prueba de 7 días; la activación se hace desde el Panel de clientes (`subscriptions/{uid}`).
- Precios en dólares (USD 30 y USD 45 por mes, 23/10). Se pagan por transferencia en pesos al dólar MEP del día (redondeado a $100) o por Payoneer en dólares con 10% de descuento. Sin IPC, Mercado Pago ni PayPal por ahora.
- Una moneda de liquidación por complejo. AFIP no interesa.
- "Tu Web": consulta de disponibilidad + precio + pedido por WhatsApp (sin cobro ni confirmación automática: con iCal cada
  15 min habría riesgo de doble reserva). Probada con Catalinas el 23/10: la landing ya no dice "próximamente".
- Textos de la landing: honestos con iCal (no es instantáneo) y WhatsApp (mensajes listos, se envían con un toque).

## Pendientes
La lista viva está en la checklist "Pendientes Loomi" (artifact de Gabi), no acá.
