# Channel manager con Aiosell — plan de la conexión (5/11)

Estado: esperando respuesta de Aiosell (esquema de cobro, marca blanca, credenciales de prueba). Nada programado todavía.
Documentación pública: https://support.aiosell.com/portal/en/kb/aiosell-kb/api-documentation/aiosell-channel-manager-to-3rd-party-property-management-system

## Cómo funciona su API (lo que está publicado)

Loomi → Aiosell (POST a `https://live.aiosell.com/api/v2/cm/...{nuestro-código-de-PMS}`; en la doc el código es `sample-pms`, el hotel de prueba es `SANDBOX-PMS`):
- **Disponibilidad**: `update/{pms}` → `{hotelCode, updates: [{startDate, endDate, rooms: [{roomCode, available}]}]}`.
- **Precios**: `update-rates/{pms}` → `{hotelCode, updates: [{startDate, endDate, rates: [{roomCode, rateplanCode, rate}]}]}`.
- **Restricciones**: mismo `update/{pms}` con `rooms[].restrictions` {stopSell, minimumStay, maximumStay, closeOnArrival, closeOnDeparture, …} y `toChannels` opcional.
- **No show** (lo pide Booking) y restricciones de tarifa (cancelación, no reembolsable): hay endpoints, no los necesitamos al principio.
- Respuesta: `{success: true, message}`.

Aiosell → Loomi (POST a una URL nuestra):
- `action: "book"` y `"modify"`: hotelCode, channel, bookingId, cmBookingId, bookedOn, checkin, checkout, segment, specialRequests,
  pah (true = paga en el alojamiento), amount {amountAfterTax, amountBeforeTax, tax, currency}, guest {firstName, lastName, email, phone, address},
  rooms[] {roomCode, rateplanCode, guestName, occupancy {adults, children}, prices[] {date, sellRate}}.
- `action: "cancel"`: hotelCode, channel, bookingId.
- Hay que contestar `{success: true, message: "..."}`.

No dice: autenticación (en ningún sentido), reintentos si nuestra URL falla, si endDate es inclusivo, monedas aceptadas (ARS/USD).

## Cómo encaja en Loomi

Esquema decidido (Gabi, 5/11): cada complejo = 1 "hotel" en Aiosell (`hotelCode`), cada unidad = su propio tipo con 1 unidad
(`roomCode` = id de la unidad), una tarifa (`rateplanCode` = "STD"). Modo hotel (cupo por tipo, asignar después) queda para más adelante.

1. **Datos**
   - `channelHotels/{hotelCode}` {uid} privado (solo servidor y administración), como `siteOwners`.
   - `tenants/{uid}.channelManager` {enabled, hotelCode, provider: 'aiosell', since, units: {propertyId: {roomCode, enabled}}}.
   - Reserva: id `cm-{hotelCode}-{bookingId}`, `source: 'channel'`, `platform` según `channel` (Airbnb → airbnb, Booking.com → booking,
     Expedia/Vrbo → vrbo, el resto → origen propio con su comisión), `channelBookingId`, importes de `amount`, `pah` → estado de pago.
     Limpieza al check-out con `buildCleaningChecklist` (igual que la reserva manual y `icalCore`).
2. **Recibir reservas**: Cloudflare Pages Function `functions/api/channel/aiosell.js` (POST). Verifica la clave que acordemos con Aiosell,
   busca el uid por `hotelCode`, escribe con la cuenta de servicio (`functions-lib/firestoreAdmin.js`, ya existe) en una transacción
   (reserva + limpieza). `modify`: cambia fechas/unidad/importes y mueve la limpieza pendiente. `cancel`: cancela y borra la limpieza pendiente.
   Si la unidad ya está ocupada esas fechas: se guarda igual y queda como conflicto (como hoy con iCal), nunca se pierde una reserva.
   Contesta rápido; si algo falla devuelve error para que Aiosell reintente.
3. **Mandar disponibilidad**: función de Firebase en `server-sync/` (codebase `ical`) con disparador `onDocumentWritten` en
   `tenants/{uid}/reservations/{id}`: si el complejo tiene channel manager, recalcula las fechas afectadas de esa unidad (0 o 1 por noche,
   contando reservas no canceladas y bloqueos) y hace `update/{pms}`. Así sirve para todo lo que cambia una reserva: la app, Recepción,
   la función de arriba y el iCal. Además, una pasada diaria que manda los próximos 365 días completos (por si algo se perdió).
4. **Mandar precios y estadía mínima**: disparador en `tenants/{uid}` cuando cambia `pricing` + pasada diaria. Por noche y por unidad con
   `quoteStay` (`src/lib/pricing.ts`), agrupando noches iguales en rangos. `minNights` de la temporada → `minimumStay`.
5. **iCal en la transición**: al activar el channel manager en una unidad, el iCal de Airbnb/Booking de esa unidad deja de crear reservas
   nuevas (las trae Aiosell) pero sigue cancelando y cambiando fechas de las que ya había entrado por iCal, hasta que pasen todas.
   Necesita un modo "solo seguimiento" por portal en `icalCore` (+ que el dueño deje de exportar el iCal de Loomi a esa plataforma).
6. **Pantalla**: Administración → Unidades y calendarios → "Channel manager": estado, unidades conectadas, último envío, errores.
   La conexión de cada canal (Airbnb con su cuenta, Booking agregando a Aiosell en la extranet) depende de cómo sea su marca blanca.
7. **Pruebas**: hotel de prueba de Aiosell primero; después Catalinas con el iCal de respaldo, mirando que no haya dobles reservas.
   Reglas de Firestore: `channelHotels` sin acceso desde la app (salvo administración). Probar con `rules-test/`.

## Decidido con Gabi (5/11)

- Precio en las plataformas: lo decide cada cliente. Ajuste por complejo en la pantalla del channel manager:
  "igual que Tarifas" o "Tarifas + X %" (libre). Y la opción de no mandar precios desde Loomi (los maneja en cada plataforma o en Aiosell).
- Loomi manda un solo precio por noche y por unidad (el de `quoteStay`) y la estadía mínima. Nada de precios por cantidad de huéspedes
  ni gestión de tarifas: quien la quiera contrata el revenue manager de Aiosell aparte.

## Para preguntar a Aiosell (técnico)

1. Autenticación: ¿cómo firmamos lo que les mandamos y cómo firman ellos lo que nos mandan (clave en el encabezado, usuario y clave)?
2. ¿Cuál es nuestro código de PMS en la URL y nos dan un hotel de prueba (sandbox)?
3. Si nuestra URL falla, ¿reintentan? ¿Cuántas veces?
4. Al conectar un complejo, ¿mandan las reservas futuras que ya existían en Airbnb/Booking o solo las nuevas?
5. ¿endDate es inclusivo? ¿Aceptan precios en pesos argentinos y en dólares?
6. ¿Precio por cantidad de huéspedes (occupancy) o un solo precio por noche?
