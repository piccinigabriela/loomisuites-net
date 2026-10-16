/**
 * Comandos para usar desde Cloud Shell (en la consola de Google Cloud):
 *   npm run prueba -- tu@correo.com   → muestra qué cambiaría en esa cuenta, sin escribir nada
 *   npm run prueba -- todas           → lo mismo para todas las cuentas con enlaces iCal
 *   npm run estado                    → modo actual y última sincronización de cada cuenta
 *   npm run activar                   → la función programada empieza a escribir datos reales
 *   npm run pausar                    → vuelve a modo prueba (no escribe nada)
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

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const quien = process.env.USER || 'cloud-shell';
  if (cmd === 'prueba') return prueba(arg);
  if (cmd === 'estado') return estado();
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
  console.log('Comandos: prueba <correo|todas>, estado, activar, pausar');
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
