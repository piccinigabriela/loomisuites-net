/**
 * Comandos para usar desde Cloud Shell (en la consola de Google Cloud):
 *   npm run prueba -- tu@correo.com   → muestra qué cambiaría en esa cuenta, sin escribir nada
 *   npm run prueba -- todas           → lo mismo para todas las cuentas con enlaces iCal
 *   npm run estado                    → modo actual y última sincronización de cada cuenta
 *   npm run activar                   → la función programada empieza a escribir datos reales
 *   npm run pausar                    → vuelve a modo prueba (no escribe nada)
 *
 * Channel manager (Aiosell), docs/channel-manager-aiosell.md:
 *   npm run aiosell -- conectar tu@correo.com sandbox-pms real executive,suite
 *       → conecta esa cuenta al hotel de Aiosell: la 1.ª unidad (por nombre) con la 1.ª habitación, la 2.ª con la 2.ª…
 *         "prueba" solo registra lo que haría; "real" escribe reservas.
 *       Opcional al final, la tarifa de cada habitación: ... executive,suite executive-d-ep,suite-d-ep (sin eso, "STD").
 *   npm run aiosell -- ver tu@correo.com      → los últimos avisos que llegaron de Aiosell y qué se hizo
 *   npm run aiosell -- desconectar tu@correo.com sandbox-pms
 *   npm run aiosell -- credenciales USUARIO CLAVE CODIGO-PMS   → usuario y clave que nos dio Aiosell (sample-pms para pruebas)
 *   npm run aiosell -- precios tu@correo.com si 0             → manda los precios de Tarifas (+0 %); "no" = no mandar precios
 *   npm run aiosell -- enviar tu@correo.com                   → muestra qué se le mandaría a Aiosell, sin mandar nada
 *   npm run aiosell -- enviar tu@correo.com mandar            → lo manda ya (sin esperar los 10 minutos)
 */
import { describeChange } from '../../src/lib/icalCore';
import { cuentasConIcal, getDb, getModo, propiedadesDeCuenta, setModo, sincronizarCuenta, Cuenta } from './sync';
import { AIOSELL_CONFIG_DOC, enviarCuentaAiosell, getAiosellConfig } from './aiosellSend';

const db = getDb();

async function buscarCuentaPorCorreo(correo: string): Promise<string | null> {
  const variantes = [...new Set([correo, correo.toLowerCase()])];
  for (const v of variantes) {
    const snap = await db.collection('tenants').where('ownerEmail', '==', v).limit(1).get();
    if (!snap.empty) return snap.docs[0].id;
  }
  return null;
}

async function prueba(objetivo?: string) {
  if (!objetivo) {
    console.log('\nFalta tu correo. Ejemplo:  npm run prueba -- tu@correo.com\n');
    process.exitCode = 1;
    return;
  }

  let cuentas: Cuenta[];
  if (objetivo === 'todas') {
    cuentas = await cuentasConIcal(db);
  } else {
    const uid = objetivo.includes('@') ? await buscarCuentaPorCorreo(objetivo) : objetivo;
    if (!uid) {
      console.log(`\nNo encontré ninguna cuenta con el correo ${objetivo}.\n`);
      process.exitCode = 1;
      return;
    }
    cuentas = [{ uid, properties: await propiedadesDeCuenta(db, uid) }];
  }

  console.log('\n=== MODO PRUEBA: no se escribe nada ===');
  for (const cuenta of cuentas) {
    const tenant = await db.doc(`tenants/${cuenta.uid}`).get();
    const nombre = tenant.get('complexName') || tenant.get('ownerEmail') || cuenta.uid;
    const r = await sincronizarCuenta(db, cuenta.uid, cuenta.properties, 'prueba');

    console.log(`\nCuenta: ${nombre}  (hoy en Argentina: ${r.hoy})`);
    const conEnlaces = cuenta.properties.filter((p) =>
      [p.icalAirbnbUrl, p.icalBookingUrl, p.icalOtherUrl, p.icalGoogleUrl].some((u) => u && u.trim())
    );
    console.log(`Unidades con enlaces iCal: ${conEnlaces.map((p) => p.name).join(', ') || 'ninguna'}`);

    if (r.cambios.length === 0) {
      console.log('✔ Sin cambios: todo lo que está en los portales ya está en Loomi.');
    } else {
      console.log(`Cambiaría ${r.cambios.length} cosa(s):`);
      for (const c of r.cambios) console.log('  ' + describeChange(c));
    }
    for (const e of r.errores) console.log(`  ⚠ No se pudo leer ${e.portal} de ${e.propertyName}: ${e.error}`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
    for (const c of r.conflictos) {
      console.log(
        `  ⚠ Posible doble reserva en ${c.unitName}: "${c.resA.guestName}" ${c.resA.checkIn}→${c.resA.checkOut} y "${c.resB.guestName}" ${c.resB.checkIn}→${c.resB.checkOut}`
      );
    }
  }
  console.log(`\nModo de la función programada: ${(await getModo(db)).toUpperCase()}\n`);
}

async function estado() {
  console.log(`\nModo actual: ${(await getModo(db)).toUpperCase()}`);
  const cuentas = await cuentasConIcal(db);
  console.log(`Cuentas con enlaces iCal: ${cuentas.length}`);
  for (const c of cuentas) {
    const s = await db.doc(`tenants/${c.uid}/sync/ical`).get();
    const tenant = await db.doc(`tenants/${c.uid}`).get();
    const nombre = tenant.get('complexName') || tenant.get('ownerEmail') || c.uid;
    console.log(
      s.exists
        ? `  ${nombre}: última sincronización del servidor ${s.get('ultimaCorrida')} (nuevas ${s.get('agregadas')}, canceladas ${s.get('canceladas')}, errores ${(s.get('errores') || []).length})`
        : `  ${nombre}: el servidor todavía no escribió nada`
    );
  }
  console.log('');
}

async function aiosell(sub?: string, correo?: string, hotel?: string, modo?: string, habitaciones?: string, tarifas?: string) {
  if (sub === 'credenciales') {
    // acá "correo" es el usuario, "hotel" la clave y "modo" el código de PMS
    const [user, password, pms, baseUrl] = [correo, hotel, modo, habitaciones];
    if (!user || !password || !pms) {
      console.log('\nUso:  npm run aiosell -- credenciales USUARIO CLAVE CODIGO-PMS\n');
      process.exitCode = 1;
      return;
    }
    await db.doc(AIOSELL_CONFIG_DOC).set({ user, password, pms, ...(baseUrl ? { baseUrl } : {}), updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`\n✔ Credenciales de Aiosell guardadas (usuario ${user}, código de PMS ${pms}). La clave no se muestra.\n`);
    return;
  }
  const uid = correo ? (correo.includes('@') ? await buscarCuentaPorCorreo(correo) : correo) : null;
  if (!sub || !uid) {
    console.log('\nUso:  npm run aiosell -- conectar tu@correo.com sandbox-pms real executive,suite');
    console.log('      npm run aiosell -- ver tu@correo.com');
    console.log('      npm run aiosell -- desconectar tu@correo.com sandbox-pms\n');
    if (correo && !uid) console.log(`No encontré ninguna cuenta con el correo ${correo}.\n`);
    process.exitCode = 1;
    return;
  }
  const tenantRef = db.doc(`tenants/${uid}`);
  const tenant = await tenantRef.get();
  const nombre = tenant.get('complexName') || tenant.get('ownerEmail') || uid;

  if (sub === 'ver') {
    const s = await db.doc(`tenants/${uid}/sync/aiosell`).get();
    console.log(`\nCuenta: ${nombre}`);
    console.log(s.exists ? `Último aviso: ${s.get('lastAt')} (${s.get('lastAction')} ${s.get('lastBookingId')}, modo ${s.get('mode')})` : 'Todavía no llegó ningún aviso de Aiosell.');
    const logs = await db.collection(`tenants/${uid}/channelLog`).orderBy('at', 'desc').limit(15).get();
    for (const d of logs.docs) {
      const l = d.data();
      console.log(`\n${l.at}  [${l.mode}] ${l.action} ${l.bookingId} · ${l.channel || ''}${l.checkIn ? ` · ${l.checkIn} a ${l.checkOut}` : ''}`);
      for (const line of l.summary || []) console.log('   ' + line);
    }
    console.log('');
    return;
  }

  if (sub === 'precios') {
    const si = hotel === 'si' || hotel === 'sí';
    if (!si && hotel !== 'no') {
      console.log('\nUso:  npm run aiosell -- precios tu@correo.com si 0   (o "no")\n');
      process.exitCode = 1;
      return;
    }
    const percent = Number(modo || 0) || 0;
    await tenantRef.update({ 'channelManager.rates': { send: si, percent } });
    console.log(si ? `\n✔ ${nombre}: se mandan los precios de Tarifas${percent ? ` ${percent > 0 ? '+' : ''}${percent} %` : ''} y la estadía mínima.\n` : `\n✔ ${nombre}: no se mandan precios (se manejan en cada plataforma).\n`);
    return;
  }

  if (sub === 'enviar') {
    const cm = tenant.get('channelManager') || {};
    if (!cm.hotelCode) {
      console.log(`\n✖ ${nombre} no está conectada a ningún hotel de Aiosell.\n`);
      process.exitCode = 1;
      return;
    }
    const mandar = hotel === 'mandar';
    const cfg = await getAiosellConfig(db);
    if (mandar && !cfg) {
      console.log('\n✖ Faltan las credenciales: npm run aiosell -- credenciales USUARIO CLAVE CODIGO-PMS\n');
      process.exitCode = 1;
      return;
    }
    const r = await enviarCuentaAiosell(db, cfg, uid, cm.hotelCode, { force: true, dryRun: !mandar });
    console.log(`\nCuenta: ${nombre} · hotel ${cm.hotelCode} · ${mandar ? 'ENVÍO REAL' : 'solo muestra, no manda nada'}`);
    for (const [kind, body] of Object.entries(r.bodies || {})) {
      const updates = (body as any).updates || [];
      console.log(`\n${kind === 'availability' ? 'Disponibilidad' : kind === 'rates' ? 'Precios' : 'Estadía mínima'} (${updates.length} tramos):`);
      for (const u of updates.slice(0, 8)) {
        const items = (u.rooms || u.rates || []).map((x: any) => `${x.roomCode}=${x.available ?? x.rate ?? x.restrictions?.minimumStay}${x.rateplanCode ? ` (${x.rateplanCode})` : ''}`);
        console.log(`   ${u.startDate} a ${u.endDate}: ${items.join(', ')}`);
      }
      if (updates.length > 8) console.log(`   … y ${updates.length - 8} tramos más`);
    }
    if (mandar) console.log(r.errors.length ? `\n✖ Errores: ${r.errors.map((e) => `${e.kind}: ${e.error}`).join(' | ')}` : `\n✔ Enviado: ${r.sent.join(', ') || 'nada'}`);
    console.log('');
    return;
  }

  if (!hotel || !/^[A-Za-z0-9_.-]{1,80}$/.test(hotel)) {
    console.log('\nFalta el código del hotel de Aiosell (por ejemplo sandbox-pms).\n');
    process.exitCode = 1;
    return;
  }

  if (sub === 'desconectar') {
    await db.doc(`channelHotels/${hotel}`).delete();
    await tenantRef.update({ 'channelManager.enabled': false });
    console.log(`\n✔ ${nombre} desconectada de ${hotel}. Los avisos que lleguen van a responder "hotel desconocido".\n`);
    return;
  }

  if (sub !== 'conectar' || (modo !== 'real' && modo !== 'prueba') || !habitaciones) {
    console.log('\nUso:  npm run aiosell -- conectar tu@correo.com sandbox-pms real executive,suite\n');
    process.exitCode = 1;
    return;
  }

  const otro = await db.doc(`channelHotels/${hotel}`).get();
  if (otro.exists && otro.get('uid') !== uid) {
    console.log(`\n✖ El hotel ${hotel} ya está conectado a otra cuenta (${otro.get('uid')}). Desconectala primero.\n`);
    process.exitCode = 1;
    return;
  }
  if (modo === 'real' && /sandbox/i.test(hotel)) {
    const reservas = await db.collection(`tenants/${uid}/reservations`).limit(21).get();
    if (reservas.size > 20) {
      console.log(`\n✖ ${nombre} tiene más de 20 reservas: parece una cuenta real. El hotel de prueba de Aiosell manda reservas inventadas;`);
      console.log('  usá una cuenta de prueba, o este complejo en modo "prueba" (solo registra).\n');
      process.exitCode = 1;
      return;
    }
  }

  const rooms = habitaciones.split(',').map((r) => r.trim()).filter(Boolean);
  const unidades = (await propiedadesDeCuenta(db, uid)).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'));
  if (unidades.length < rooms.length) {
    console.log(`\n✖ ${nombre} tiene ${unidades.length} unidad(es) y pediste ${rooms.length} habitaciones. Cargá más unidades en Loomi.\n`);
    process.exitCode = 1;
    return;
  }
  const plans = (tarifas || '').split(',').map((r) => r.trim());
  const units: Record<string, { roomCode: string; enabled: boolean; rateplanCode?: string }> = {};
  rooms.forEach((roomCode, i) => (units[unidades[i].id] = { roomCode, enabled: true, ...(plans[i] ? { rateplanCode: plans[i] } : {}) }));

  await db.doc(`channelHotels/${hotel}`).set({ uid, mode: modo, provider: 'aiosell', updatedAt: new Date().toISOString() });
  const rates = (tenant.get('channelManager') || {}).rates || { send: false, percent: 0 };
  await tenantRef.update({
    channelManager: { enabled: true, provider: 'aiosell', hotelCode: hotel, since: new Date().toISOString(), units, rates },
  });
  console.log(`\n✔ ${nombre} conectada al hotel ${hotel} de Aiosell, en modo ${modo.toUpperCase()}:`);
  rooms.forEach((roomCode, i) => console.log(`   ${unidades[i].name}  ←  ${roomCode}${plans[i] ? ` (tarifa ${plans[i]})` : ''}`));
  console.log(modo === 'real' ? '\nLos avisos de Aiosell crean, cambian y cancelan reservas en esta cuenta.\n' : '\nModo prueba: solo se registra lo que haría (npm run aiosell -- ver ...).\n');
}

async function main() {
  const [cmd, arg, ...rest] = process.argv.slice(2);
  const quien = process.env.USER || 'cloud-shell';
  if (cmd === 'prueba') return prueba(arg);
  if (cmd === 'estado') return estado();
  if (cmd === 'aiosell') return aiosell(arg, rest[0], rest[1], rest[2], rest[3], rest[4]);
  if (cmd === 'activar') {
    await setModo(db, 'real', quien);
    console.log('\n✔ Activado: desde la próxima corrida (máximo 15 minutos) el servidor escribe las reservas.\n');
    return;
  }
  if (cmd === 'pausar') {
    await setModo(db, 'prueba', quien);
    console.log('\n✔ Pausado: el servidor vuelve a modo prueba y no escribe nada. La app sigue sincronizando como antes.\n');
    return;
  }
  console.log('Comandos: prueba <correo|todas>, estado, activar, pausar, aiosell');
}

main()
  .catch((err) => {
  console.error('\n✖ Error:', err?.message || err);
  if (/PERMISSION_DENIED|permission/i.test(String(err?.message))) {
    console.error('  Revisá que estés en el proyecto correcto y que tu usuario sea propietario (Owner).');
  }
  process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
