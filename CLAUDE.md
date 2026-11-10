# Loomi Suite — notas para Claude

PMS para complejos chicos (4–20 unidades). Dueña: Gabi. La app real es app.loomisuite.net; la landing, loomisuite.net.
Gabi usa Loomi con su propio complejo (Catalinas, unidades A–D). Hay datos reales: cuidado con cualquier cambio de datos o reglas.

## Cómo hablarle a Gabi
- Español rioplatense con voseo. Nada de "o/a": roles neutros (Limpieza, Recepción, Administración).
- Hacia afuera, Loomi es "el equipo de Loomi": ningún texto ni Xenia nombra a una persona. Si hace falta un nombre, es María
  (nunca Gabi). Xenia para huéspedes habla siempre de "el alojamiento", nunca del nombre del anfitrión.
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
  Reserva cargada a mano (o traída de CheckInn) con la misma unidad, fechas y canal que un evento que no es bloqueo: queda atada
  (`icalLinkId` + `icalSource`) y se le cambian fechas y se cancela como a una importada (5/11). Los bloqueos nunca atan.
  Modo en Firestore `sistema/icalSync.modo` ("prueba" no escribe; "real" escribe). Estado por cuenta en `tenants/{uid}/sync/ical`.
  Se publica desde Cloud Shell (`firebase deploy --only functions`), no con el push. Comandos: `npm run prueba|estado|activar|pausar` en `server-sync/`.
- Xenia: `src/lib/xeniaClient.ts` (`askXenia`) prueba en orden 1) Claude, `functions/api/xenia/chat.js` (solo app real y con sesión:
  verifica el token de Firebase; modelo claude-haiku-5-5; instrucciones con el mapa de pantallas dentro de la función: si cambia un menú,
  actualizarlas ahí), 2) el backend viejo de AI Studio con Gemini (`server.ts`, sus instrucciones están desactualizadas; no borrar ese
  proyecto hasta probar Claude), 3) las respuestas fijas de `xeniaLocalEngine.ts`. La función necesita la variable `ANTHROPIC_API_KEY`
  en Cloudflare Pages; sin ella responde 503 y se sigue con 2 y 3. Contexto que se manda: `src/lib/xeniaContext.ts` (sin teléfonos ni wifi).
- Xenia en el WhatsApp de Loomi (+54 9 11 4092-5939, coexistencia vía Zernio, cartera de Meta "Loomi Suite" desde el 1/11; el número no puede estar cargado como WhatsApp de otra página de Facebook): `functions/api/whatsapp/zernio.js`
  recibe el webhook `message.received` (firma HMAC con `ZERNIO_WEBHOOK_SECRET`), contesta 200 y en segundo plano responde con Claude
  (instrucciones de venta dentro de la función: si cambian precios o funciones, actualizarlas ahí). No contesta en un chat donde Gabi escribió
  en las últimas 12 h (lo de Xenia lleva una marca invisible al final), ni en uno que empezó Gabi (`startedByHuman`), ni a proveedores, publicidad o bots
  (Claude responde `<<SILENCIO>>` y no se manda nada; 6/11, le había contestado al bot de Aiosell). Audios: pide que escriban. Secrets: `ZERNIO_API_KEY`, `ZERNIO_WEBHOOK_SECRET`.
  Para apagarla: desactivar el webhook en Zernio.
- Xenia para huéspedes (guía y Tu Web): `functions/api/xenia/huesped.js` (POST `/api/xenia/huesped`). El navegador manda solo la pregunta;
  la información la lee el servidor de `publicGuides/{uid}` o `publicSites/{slug}` con una cuenta de servicio (`functions-lib/firestoreAdmin.js`,
  secret `FIREBASE_SERVICE_ACCOUNT` = JSON de la clave, rol "Usuario de Cloud Datastore"; las cuentas de servicio no pasan por App Check).
  Responde solo si `xeniaGuest: true` en lo publicado (lo activa el dueño en Tu Web y Guía; `tenants/{uid}.xeniaGuest.enabled`).
  Topes: 1.000 conversaciones por mes (`subscriptions/{uid}.xeniaGuestLimit` lo cambia), 100 por día, 20 mensajes por conversación.
  Uso en `xeniaUsage/{uid}/months/{AAAA-MM}` (el dueño lo lee; escribe solo el servidor). No se guarda el texto de las conversaciones;
  sí los temas que no supo responder (marca `<<FALTA: …>>`, sin datos personales) en `xeniaUsage/{uid}/questions/{tema}` {topic, count}: el dueño los ve en la tarjeta y los borra con "Listo".
  Pagos, cambios y lo que no sabe: marca `<<ANFITRION: …>>` → botón de WhatsApp al anfitrión. Chat: `components/guest/GuestXenia.tsx`;
  tarjeta del dueño: `GuestXeniaSettings.tsx`; incluida en el plan (1.000/mes); 1.000 extra por USD 10/mes solo si el cliente lo pide (subir `xeniaGuestLimit`; hoy a mano, las reglas no dejan que el Panel lo escriba).
  La guía pública ya no publica `directBookingSettings` (datos de cobro).
- `isAppMode()` = hostname `app.` o `?mode=app`. Sin eso, la app muestra la demo con datos de ejemplo.
- Roles: el dueño puede ver las tres vistas (`/admin`, `/recepcion`, `/limpieza`). El personal entra con su cuenta:
  `invites/{mail}` (lo crea el dueño en Administración → Equipo y accesos) → al aceptar se crea `memberships/{uid}`
  {tenantId, role: recepcion|limpieza}. `tenantUid` en App.tsx es el complejo cuyos datos se usan (no siempre el usuario).
  Limpieza no lee reservas ni `tenants/{uid}`: ve `tenants/{uid}/staff/llegadas` (sin teléfonos ni importes; lo reescribe
  entero también el servidor) y `tenants/{uid}/staff/complejo` (nombre, horarios y fecha de alta; lo escriben el dueño y Recepción desde la app). Reglas probadas con `rules-test/` (`npm run probar` en Cloud Shell).
  Notas de limpieza: `cleaningTasks/{id}.messages` (Administración/Recepción y Limpieza; Limpieza solo suma una nota suya, con `arrayUnion`)
  y `notesSeen`; aviso arriba en la app para Administración y Recepción (`src/lib/cleaningNotes.ts`, `components/common/CleaningNotes.tsx`).

- Equipo con usuario y clave (sin mail, idea de Areca 5/11): `src/lib/staffUsers.ts`. El dueño crea "usuario + clave" en Equipo y accesos;
  por dentro es una cuenta de Firebase con mail inventado `{usuario}--{código}@personal.loomisuite.net` (código = `tenants/{uid}.staffAlias`).
  Orden: alta de la cuenta (Identity Toolkit REST) → invitación (dueño) → la cuenta nueva acepta por REST con App Check. Las reglas de
  memberships aceptan sin mail confirmado solo ese dominio. Ingreso: `app.loomisuite.net/?equipo={código}` (`components/auth/StaffLoginScreen.tsx`).
  La clave no se guarda: si se olvida, se quita el acceso y se crea otro usuario.
- Cuentas trabadas: la app guarda `tenants/{uid}.unitCount`; el Panel de clientes marca "Necesitan ayuda" (en prueba, más de 24 h y 0 unidades)
  con un mail listo para ofrecer la carga sin costo (`needsHelp` y `helpMailto` en `lib/adminClients.ts`). Idea copiada de Areca (4/11).
- "Cómo configurar Loomi" (primeros pasos, arriba de Hoy en la app real): `components/onboarding/FirstStepsChecklist.tsx`. 6 pasos que se tildan
  solos (complejo, unidades, tarifas, Airbnb/Booking, reservas, guía) + opcionales (equipo, Tu Web, Xenia huéspedes, checklist, mensajes).
  Marcas a mano en `tenants/{uid}.onboardingChecklist`; "Ocultar" = `checklistDismissed` (se vuelve a abrir desde el menú de la cuenta).
  Paso "Tu complejo" (5/11, idea de Areca): `components/onboarding/ComplexSetup.tsx`, 4 pantallas (nombre, ubicación, WhatsApp, horarios y moneda),
  arranca con lo cargado y guarda solo eso (`handleSaveComplexSetup` en App.tsx). En la app real reemplaza a `OnboardingWizardModal`
  (lo abren `isOnboardingModalOpen` y `?configurar`), que pisaba la guía entera y la fecha de alta: ese queda solo para la demo.
- Checklist de limpieza: `tenants/{uid}.cleaningChecklist` {items, units: {propertyId: [tareas]}} (`src/lib/cleaningChecklist.ts`,
  `buildCleaningChecklist`; sin `items` = las 4 de siempre). Lo usan todas las limpiezas nuevas: reserva manual, importación y
  `icalCore` (la app y server-sync le pasan `cleaningChecklist`). Editor del dueño arriba de la Agenda de limpiezas
  (`components/housekeeping/CleaningChecklistEditor.tsx`); al guardar puede rehacer las limpiezas pendientes que no empezaron.

- Opcionales y extras (`components/demo/DemoAddons.tsx`, rediseño 5/11 con idea de Areca): lista por categoría. Categorías propias en
  `tenants/{uid}.addonCategories` [{id, label}] (`src/lib/addonCategories.ts`; sin el campo = las 6 de siempre). Si se borra una categoría,
  sus opcionales quedan en "Sin categoría". Los opcionales siguen en `tenants/{uid}.availableAddons`.

- Informes (Administración → Informes, pestaña `finances`; 5/11, molde de Areca): `components/reports/ReportsView.tsx` (grilla de tarjetas y,
  en cada informe, período + 4 números + tabla + Descargar CSV / Imprimir). Cálculos en `src/lib/reports.ts`. "Resultado del mes" es
  `OwnerReport` (criterio de Catalinas: mes del check-in). "Moneda y cotización": `reports/CurrencySettings.tsx`. Se borró `DemoFinances.tsx`.

- Nota de check-in (5/11, idea de Areca): `tenants/{uid}.checkinNote` (demo: `demoState.checkinNote`, con un ejemplo). Si hay nota, todo ingreso
  pasa por `requestReservationStatus` en App.tsx y muestra `CheckInNoteModal` (`components/common/CheckInNote.tsx`); se edita en Equipo y accesos
  o desde la misma ventana (solo el dueño). Paso opcional "Tu Web en Google Maps" en Cómo configurar Loomi (`onboardingChecklist.googleMaps`).

- Huéspedes (Reservas → Huéspedes, pestaña `guests`; 5/11, idea de Areca): `components/guests/GuestsView.tsx` + `src/lib/guests.ts`. Se arma
  sola con las reservas (no guarda nada): junta por teléfono (últimos 8 dígitos), mail o nombre; ignora nombres de iCal tipo "Reserva Airbnb".
  En la ficha de la reserva, "Vuelve · Nª vez" (`previousStays`). La demo tiene dos huéspedes que vuelven (res-090 y res-091).
  Nota del huésped (5/11): `Reservation.guestNote` + `guestNoteAt`; vale la última escrita entre las reservas de esa persona (`guestNoteFor`),
  así no hace falta colección nueva ni cambiar reglas. Se ve y edita en la ficha (`components/guests/GuestNote.tsx`) y en la lista (botón Nota).
  "Que vuelvan": filtro "Para invitar a volver" (vino hace más de 30 días, sin otra reserva, con teléfono) y botón "Invitar a volver" con
  mensaje armado (`returnInviteMessage`, es/en/pt según el teléfono; descuento directo y link de Tu Web si están publicados). Demo: res-092.

- Orígenes de reserva propios (5/11, idea de Areca): `tenants/{uid}.reservationOrigins` [{id, label, commission %}] (`src/lib/origins.ts`).
  Una reserva con origen propio lleva `platform: 'direct'` + `origin` (id; '' = ninguno), así calendario, iCal y colores no cambian.
  Selector compartido `components/common/ChannelSelect.tsx` (alta "+ Nuevo origen…" y cambio de comisión) en Nueva reserva y en la ficha.
  Informes → Ingresos por canal los muestra en su fila (`channelReport(..., origins)`). Las comisiones de Airbnb/Booking/Vrbo siguen fijas.

- Pedir pago (10/11): sin pasarela, Loomi no toca la plata. Datos de cobro del dueño en `welcomeGuide.directBookingSettings` (alias, CBU, su link de
  Mercado Pago, PayPal, Payoneer; no van a la guía pública). Modo celular: `MobileLightView` + `mobile/PaymentSettingsSheet.tsx`. Compu: botón
  "Pedir pago" en Pagos y Saldo de la ficha (`components/common/PaymentRequest.tsx`; no en reservas de Airbnb); si es directa, sin pagos y Tu Web
  tiene seña, ofrece "Seña X%" o "Total". Mensaje: `composePaymentMessage` (`concept: 'seña' | 'saldo'`). Solo el dueño cambia los datos.

- Tarifas: `tenants/{uid}.pricing` (se guarda entero con `savePricingDoc`). Cálculo en `src/lib/pricing.ts` (`quoteStay`):
  finde largo > temporada > normal; fin de semana = noches marcadas (por defecto vie, sáb, dom). Findes largos de
  Argentina precargados hasta oct 2027 (faltan los días turísticos 2027, sin decreto todavía). Pantalla: Administración → Tarifas.

- Tu Web (reservas directas): `src/lib/publicSite.ts` (modelo y lógica, compartida con el servidor) y `publicSiteStore.ts`.
  Link `loomisuite.net/web/{slug}` (se arma en `main.tsx`, sin la app). Usa un nombre y NO el uid: con el uid se llega a la guía (wifi).
  `siteOwners/{slug}` {uid} (privado) · `publicSites/{slug}` (público: textos, unidades, tarifas, `busy` = rangos ocupados sin datos de huéspedes)
  · `publicSites/{slug}/photos` (data URL JPEG < 950 KB) · `siteDomains/{host}` {slug} (dominio propio, lo carga la administración).
  Config del dueño en `tenants/{uid}.webSite`. App.tsx publica sola los cambios; `busy` lo escriben la app (dueño o Recepción) y server-sync.
  Pantalla: Tu Web y Guía → pestaña Tu Web (`TuWebSettings.tsx`). Vista previa del link: `functions/web/` (lee con la cuenta de servicio, `publicGet` de `functions-lib/firestoreAdmin.js`; con App Check la clave pública ya no lee).
  Dominio propio (a mano): Cloudflare Pages → Custom domains; documento `siteDomains/{dominio sin www}` {slug}; sumar el dominio a la clave de reCAPTCHA (App Check).
  Estilos: Noche, Día y Clara incluidos; diseños especiales de pago (Tierra, Refugio, Estudio, Calma, Hacienda, Revista) en `SPECIAL_THEMES`, se habilitan por cuenta en
  `subscriptions/{uid}.webDesigns` desde el Panel de clientes (solo administración). Sin habilitar, se publica Noche.
  Noche, Día, Clara y Tierra se arman en `PublicSiteView.tsx`; los que tienen estructura propia están en `booking/designs/` (registro en
  `designs/index.ts`) y comparten textos, buscador e idioma de `booking/siteKit.tsx` (`useSiteBooking`). Para sumar uno: su componente,
  su id en `SiteTheme` y `SPECIAL_THEMES`, y en el selector de `TuWebSettings.tsx`.
  Seña: `webSite.deposit` {enabled, percent} → `publicSites/{slug}.depositPercent`; la nota de confirmación y el pedido de WhatsApp muestran
  el porcentaje y el monto. Los datos bancarios NO van a la web: el anfitrión los pasa por WhatsApp al confirmar (pedido de Roxana, 1/11).
  Condiciones de la reserva (5/11, idea de Areca): `webSite.terms` → `publicSites/{slug}.terms`; `TermsBox` de `siteKit.tsx` debajo de los
  resultados en todos los diseños, los botones de pedido usan `b.guardRequest` (sin tildar "Leí y acepto" no abre WhatsApp) y el mensaje lo dice.
  Descuento por reservar directo (5/11; acá es lo usual, no el recargo por canal): `webSite.directDiscount` {enabled, percent libre 1–90} →
  `publicSites/{slug}.directDiscount`; `useSiteBooking` da `total` con descuento y `full` sin descuento, `WasPrice` muestra el normal tachado
  en todos los diseños y el WhatsApp aclara el descuento. La seña se calcula sobre el precio con descuento.
  Logo: foto con `unitId: 'logo'` (`LOGO_KEY`, PNG con `compressLogo`); `PublicSiteView` la separa de las fotos y la pasa como `site.logoUrl` (`SiteLogo`).
  `SITE_FIELDS` de `publicSiteStore.ts` es la lista de campos que se publican: todo campo nuevo de `PublicSiteDoc` tiene que estar ahí
  (hasta el 5/11 faltaban experiences, depositPercent y xeniaGuest, y no llegaban a la web).
  Experiencias: `webSite.experiences[addonId]` {show, text, showPrice} elige qué opcionales se publican (`publicSites/{slug}.experiences`, fotos con
  unitId `exp-{addonId}`); sección `ExperiencesSection` en todos los diseños y "Sumar a mi pedido" agrega la línea al WhatsApp de la reserva.
  Muestrario: loomisuite.net/disenos (`components/showcase/DesignShowcase.tsx`, complejo inventado en `lib/sampleSite.ts`, fotos y miniaturas
  en `public/muestra/`; vista previa del link en `functions/disenos/`). Si se suma un diseño, agregarlo ahí y su miniatura `d-{id}.jpg`.
  `DirectBookingLanding.tsx` es la maqueta vieja: ya no se usa en la app ni en la demo.

- Manuales gratis (loomisuite.net/manual, `ManualLeadMagnet.tsx`; vista previa en `functions/manual.js`): hospitalidad, fotografía (`?m=fotos`) y
  "Sin gluten, sin lactosa" (`?m=sintacc`, 9/11; PDF y portada en `public/manual-sin-tacc-*`, armado desde un HTML con Chrome; es el premio de la
  encuesta de relevamiento por WhatsApp del CRM de prospectos). Si se suma uno: `MANUALS`, `ORDER`, el texto "Regalo · N manuales" y `functions/manual.js`.

- Video tutorial (YouTube, oculto): `components/common/TutorialVideo.tsx` (`TUTORIAL_VIDEO_ID`; vacío = no se muestra). Botón en la bienvenida de la demo,
  el panel "Cómo funciona" y la landing. Las cerraduras inteligentes están ocultas (Loomi funciona con llaves comunes; el campo `smartLock` sigue en los datos).

- Todo lo que hace Loomi: loomisuite.net/funciones (`components/landing/FeaturesPage.tsx`, página liviana; links en el menú y el pie de la landing,
  y Xenia en WhatsApp la manda). Si se suma, cambia o se saca una función, o cambian los precios, actualizarla.

- Privacidad y términos: `components/legal/LegalPage.tsx` (loomisuite.net/privacidad y /terminos; texto revisado por la abogada el 29/10).
  Links en el pie de la landing, la pantalla de ingreso y el pre check-in. Si cambia un proveedor (IA, WhatsApp, mails), un precio,
  un plazo o se suma un píxel o analítica, actualizar el texto y la fecha ahí.

- Cobro del abono: `src/lib/billing.ts`. `config/billing` (precios en pesos por plan, datos de transferencia, mail de Payoneer,
  descuento, días de gracia, MEP de respaldo; precios en dólares) lo edita la administración en Panel de clientes → Cobro y precios; lo leen usuarios con sesión.
  Los datos bancarios NO van en el código (el repo es público). Pantalla "Mi plan" (`components/billing/MyPlanView.tsx`): menú de la
  cuenta, Más (celular), avisos de vencimiento y pantalla de cuenta pausada. "Ya pagué" crea `paymentNotices/{id}`; el Panel lo muestra
  con "Renovar 1 mes". Transferencia en pesos = precio en USD × MEP del día (`functions/api/mep.js`, lee dolarapi.com); Payoneer = USD − descuento.
  Días de gracia: `getAccessStatus(..., graceDays)` devuelve `grace` (sigue entrando, con aviso) antes de `expired`.
  Precios de la landing (`BentoLanding.tsx`, `LeadModal.tsx`, `DemoPlanFunctionalBar.tsx`) y de Xenia están fijos en el código: si cambian, actualizarlos también ahí.

- Channel manager (Aiosell): plan y respuestas de Aiosell en `docs/channel-manager-aiosell.md` (todo respondido el 7/11; se paga con tarjeta).
  Lógica pura y probada: `src/lib/aiosell.ts` (validar lo que manda Aiosell, `planChannelPush` decide crear / atar / modificar / cancelar,
  disponibilidad, precios y estadía mínima a enviar). Receptor: `functions/api/channel/aiosell.js` (POST `/api/channel/aiosell`, basic auth con
  secrets `AIOSELL_WEBHOOK_USER` y `AIOSELL_WEBHOOK_PASSWORD`, escribe con `FIREBASE_SERVICE_ACCOUNT`). `channelHotels/{hotelCode}` {uid, mode}
  (solo servidor; `mode: 'real'` escribe, si no es prueba y solo registra) y `tenants/{uid}.channelManager.units` {propertyId: {roomCode, enabled}}.
  Registro de cada aviso en `tenants/{uid}/channelLog` y estado en `tenants/{uid}/sync/aiosell`. Una reserva que ya estaba (a mano o por iCal,
  mismas fechas, unidad y canal) se ata en vez de duplicarse; el iCal a su vez ata las del canal (no hay duplicados en ningún orden).
  Pruebas: `npm run probar:aiosell` (lógica + receptor con Firestore simulado). Sandbox: hotel `sandbox-pms`, roomCode `executive` y `suite`;
  código de PMS definitivo `loomi-suites`.
  Envío (Loomi → Aiosell): `server-sync/src/aiosellSend.ts` + función programada `enviarChannelManager` (cada 10 min, solo hoteles con `mode: 'real'`):
  arma 365 días con `channelSendBodies` (disponibilidad siempre; precios y estadía mínima solo si `channelManager.rates.send`, con `percent`),
  manda solo lo que cambió (huellas en `tenants/{uid}/sync/aiosell.sent`) y todo una vez por día. Tarifa por unidad: `units[pid].rateplanCode`.
  Credenciales en `sistema/aiosell` {user, password, pms, baseUrl} (sin reglas = sin acceso desde la app). Todo se maneja con
  `npm run aiosell -- conectar|ver|desconectar|credenciales|precios|enviar` en `server-sync/` (Cloud Shell), o desde el Panel de clientes:
  cada cliente tiene "Channel manager (Aiosell)" (`components/admin/ChannelManagerAdmin.tsx` + `lib/channelAdmin.ts`) que llama a
  `functions/api/channel/admin.js` (verifica que el token sea de la administración con mail verificado y escribe con la cuenta de servicio:
  así no hizo falta tocar reglas). Credenciales de Aiosell siguen por Cloud Shell. Pruebas del Panel en `scripts/probar-aiosell-admin.ts`
  (Firestore simulado compartido: `scripts/fakeFirestore.ts`). El dueño ve "Conexión directa con las plataformas" arriba de Unidades
  (`components/common/ChannelConnectionCard.tsx`, solo si `channelManager.enabled` y hay `hotelCode`): unidades conectadas, lo último que llegó
  (channelLog) y si se mandan los precios (`saveChannelRatesDoc`, solo toca `channelManager.rates`). Hacia el cliente nunca se nombra a Aiosell.

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
- Precios en dólares (10/11; antes Loomi USD 25 hasta 4 unidades y Loomi Suite USD 45 de 5 a 20 con channel manager incluido): los planes se
  separan por la conexión, no por tamaño (los dos hasta 20 unidades). Loomi = por calendario (iCal), USD 35. Loomi Suite = con channel manager,
  USD 45 + USD 6 por unidad conectada (`CHANNEL_UNIT_USD`: costo de Aiosell + USD 1; Aiosell cobra USD 5 por cabaña con aviso propio y USD 10 por
  complejo si figura como hotel → ahí serían USD 11 por complejo). Mientras no haya channel manager, Loomi Suite figura "próximamente" y en Mi plan
  no se puede elegir (salvo `channelManager.enabled` o plan ya cargado). Promo fin de año (nombre elegido por Gabi; nada de "lanzamiento" ni
  "fundador"): cuentas creadas hasta el 31/12/2026 pagan Loomi USD 25 y Loomi Suite USD 35, para siempre (`YEAR_END_PROMO.usd`, `hasYearEndPromo`
  con la fecha de alta, `planPriceUsd` en `billing.ts`). No hay plan Signature.
  Los precios base salen de `config/billing` (Panel → Cobro y precios); la promo está en el código. Se pagan por transferencia en pesos al dólar MEP del día (redondeado a $100) o por Payoneer en dólares con 10% de descuento. Sin IPC, Mercado Pago ni PayPal por ahora.
- Diseños especiales de Tu Web: pago único de USD 70 cada uno (23/10), se cobra a mano y se habilita en el Panel; los tiene quien los quiere.
- Una moneda de liquidación por complejo. AFIP no interesa.
- "Tu Web": consulta de disponibilidad + precio + pedido por WhatsApp (sin cobro ni confirmación automática: con iCal cada
  15 min habría riesgo de doble reserva). Probada con Catalinas el 23/10: la landing ya no dice "próximamente".
- Textos de la landing: honestos con iCal (no es instantáneo) y WhatsApp (mensajes listos, se envían con un toque).

## Pendientes
La lista viva está en la checklist "Pendientes Loomi" (artifact de Gabi), no acá.
