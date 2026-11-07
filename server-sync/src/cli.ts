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
 *   npm run aiosell -- ver tu@correo.com      → los últimos avisos que llegaron de Aiosell y qué se hizo
 *   npm run aiosell -- desconectar tu@correo.com sandbox-pms
 */
import { describeChange } from '../../src/lib/icalCore';
import { cuentasConIcal, getDb, getModo, propiedadesDeCuenta, setModo, sincronizarCuenta, Cuenta } from './sync';

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

async function aiosell(sub?: string, correo?: string, hotel?: string, modo?: string, habitaciones?: string) {
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
  const units: Record<string, { roomCode: string; enabled: boolean }> = {};
  rooms.forEach((roomCode, i) => (units[unidades[i].id] = { roomCode, enabled: true }));

  await db.doc(`channelHotels/${hotel}`).set({ uid, mode: modo, provider: 'aiosell', updatedAt: new Date().toISOString() });
  await tenantRef.update({
    channelManager: { enabled: true, provider: 'aiosell', hotelCode: hotel, since: new Date().toISOString(), units },
  });
  console.log(`\n✔ ${nombre} conectada al hotel ${hotel} de Aiosell, en modo ${modo.toUpperCase()}:`);
  rooms.forEach((roomCode, i) => console.log(`   ${unidades[i].name}  ←  ${roomCode}`));
  console.log(modo === 'real' ? '\nLos avisos de Aiosell crean, cambian y cancelan reservas en esta cuenta.\n' : '\nModo prueba: solo se registra lo que haría (npm run aiosell -- ver ...).\n');
}

async function main() {
  const [cmd, arg, ...rest] = process.argv.slice(2);
  const quien = process.env.USER || 'cloud-shell';
  if (cmd === 'prueba') return prueba(arg);
  if (cmd === 'estado') return estado();
  if (cmd === 'aiosell') return aiosell(arg, rest[0], rest[1], rest[2], rest[3]);
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
