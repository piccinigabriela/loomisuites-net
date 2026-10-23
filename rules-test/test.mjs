// Prueba las reglas de Firestore con datos de mentira en el emulador. No toca la base real.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-loomi',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8085 },
});

let ok = 0;
let fail = 0;
async function caso(nombre, debe, fn) {
  try {
    await (debe ? assertSucceeds(fn()) : assertFails(fn()));
    ok++;
    console.log(`  ✔ ${nombre}`);
  } catch (err) {
    fail++;
    console.log(`  ✖ ${nombre}  → esperaba ${debe ? 'PERMITIR' : 'BLOQUEAR'}  (${err?.message?.split('\n')[0] || err})`);
  }
}

// Datos de mentira: complejo "dueno", otro complejo "otro"
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'tenants/dueno'), {
    ownerEmail: 'dueno@x.com', complexName: 'Catalinas',
    pricing: { base: 100 }, managementSettings: { enabled: true, percent: 20 },
    teamContacts: [{ name: 'Fer', phone: '11' }], templates: [],
  });
  await setDoc(doc(db, 'tenants/dueno/properties/a'), { id: 'a', name: 'Dept A' });
  await setDoc(doc(db, 'tenants/dueno/reservations/r1'), { id: 'r1', propertyId: 'a', guestName: 'Ana', guestPhone: '11', totalAmount: 100 });
  await setDoc(doc(db, 'tenants/dueno/cleaningTasks/t1'), { id: 't1', propertyId: 'a', date: '2026-10-20', status: 'pending', checklist: [] });
  await setDoc(doc(db, 'tenants/dueno/cashMovements/c1'), { id: 'c1', amount: 50 });
  await setDoc(doc(db, 'tenants/dueno/reminders/m1'), { id: 'm1', text: 'x' });
  await setDoc(doc(db, 'tenants/dueno/staff/llegadas'), { unidades: {} });
  await setDoc(doc(db, 'tenants/dueno/staff/complejo'), { complexName: 'Catalinas', checkinHour: '14:00', checkoutHour: '10:00' });
  await setDoc(doc(db, 'tenants/dueno/sync/ical'), { ultimaCorrida: 'x' });
  await setDoc(doc(db, 'subscriptions/dueno'), { status: 'active' });
  await setDoc(doc(db, 'precheckins/dueno/items/p1'), { reservationId: 'r1', fullName: 'Ana' });
  await setDoc(doc(db, 'tenants/otro'), { ownerEmail: 'otro@x.com' });
  await setDoc(doc(db, 'tenants/otro/reservations/r9'), { id: 'r9' });
});

const as = (uid, email, verified = true) => env.authenticatedContext(uid, { email, email_verified: verified }).firestore();
const dueno = as('dueno', 'dueno@x.com');
const otro = as('otro', 'otro@x.com');
const marta = as('marta', 'marta@x.com');
const martaSinConfirmar = as('marta', 'marta@x.com', false);
const juan = as('juan', 'juan@x.com');
const intruso = as('intruso', 'intruso@x.com');

console.log('\nDueño');
await caso('lee sus reservas', true, () => getDoc(doc(dueno, 'tenants/dueno/reservations/r1')));
await caso('escribe sus reservas', true, () => setDoc(doc(dueno, 'tenants/dueno/reservations/r2'), { id: 'r2' }));
await caso('lee su caja y recordatorios', true, () => getDocs(collection(dueno, 'tenants/dueno/cashMovements')));
await caso('escribe sus llegadas para Limpieza', true, () => setDoc(doc(dueno, 'tenants/dueno/staff/llegadas'), { unidades: {} }));
await caso('escribe nombre y horarios para Limpieza', true, () => setDoc(doc(dueno, 'tenants/dueno/staff/complejo'), { complexName: 'Catalinas', checkinHour: '14:00', checkoutHour: '10:00' }));
await caso('lee su complejo', true, () => getDoc(doc(dueno, 'tenants/dueno')));
await caso('NO lee otro complejo', false, () => getDoc(doc(dueno, 'tenants/otro/reservations/r9')));
await caso('ve su propio acceso aunque no exista', true, () => getDoc(doc(dueno, 'memberships/dueno')));
await caso('ve si tiene invitación aunque no exista', true, () => getDoc(doc(dueno, 'invites/dueno@x.com')));

console.log('\nInvitaciones');
const inv = (tenantId, email, role) => ({ email, tenantId, role, complexName: 'Catalinas', invitedAt: serverTimestamp() });
await caso('el dueño invita a Limpieza', true, () => setDoc(doc(dueno, 'invites/marta@x.com'), inv('dueno', 'marta@x.com', 'limpieza')));
await caso('el dueño invita a Recepción', true, () => setDoc(doc(dueno, 'invites/juan@x.com'), inv('dueno', 'juan@x.com', 'recepcion')));
await caso('NO invita a nombre de otro complejo', false, () => setDoc(doc(dueno, 'invites/x@x.com'), inv('otro', 'x@x.com', 'limpieza')));
await caso('NO se invita a sí mismo', false, () => setDoc(doc(dueno, 'invites/dueno@x.com'), inv('dueno', 'dueno@x.com', 'limpieza')));
await caso('NO inventa roles', false, () => setDoc(doc(dueno, 'invites/y@x.com'), inv('dueno', 'y@x.com', 'admin')));
await caso('otro dueño NO pisa la invitación', false, () => setDoc(doc(otro, 'invites/marta@x.com'), inv('otro', 'marta@x.com', 'recepcion')));
await caso('el dueño ve sus invitaciones', true, () => getDocs(query(collection(dueno, 'invites'), where('tenantId', '==', 'dueno'))));
await caso('otro NO ve las invitaciones del dueño', false, () => getDocs(query(collection(otro, 'invites'), where('tenantId', '==', 'dueno'))));
await caso('la invitada ve su invitación', true, () => getDoc(doc(marta, 'invites/marta@x.com')));
await caso('un extraño NO ve la invitación', false, () => getDoc(doc(intruso, 'invites/marta@x.com')));

console.log('\nAceptar');
const mem = (tenantId, role, email) => ({ tenantId, role, email, name: '', complexName: 'Catalinas', joinedAt: serverTimestamp() });
await caso('sin confirmar el mail NO puede aceptar', false, () => setDoc(doc(martaSinConfirmar, 'memberships/marta'), mem('dueno', 'limpieza', 'marta@x.com')));
await caso('NO puede subirse el rol', false, () => setDoc(doc(marta, 'memberships/marta'), mem('dueno', 'recepcion', 'marta@x.com')));
await caso('NO puede elegir otro complejo', false, () => setDoc(doc(marta, 'memberships/marta'), mem('otro', 'limpieza', 'marta@x.com')));
await caso('un extraño sin invitación NO entra', false, () => setDoc(doc(intruso, 'memberships/intruso'), mem('dueno', 'recepcion', 'intruso@x.com')));
await caso('Limpieza acepta su invitación', true, () => {
  const b = writeBatch(marta);
  b.set(doc(marta, 'memberships/marta'), mem('dueno', 'limpieza', 'marta@x.com'));
  b.delete(doc(marta, 'invites/marta@x.com'));
  return b.commit();
});
await caso('Recepción acepta su invitación', true, () => {
  const b = writeBatch(juan);
  b.set(doc(juan, 'memberships/juan'), mem('dueno', 'recepcion', 'juan@x.com'));
  b.delete(doc(juan, 'invites/juan@x.com'));
  return b.commit();
});
await caso('NO puede cambiar su propio acceso después', false, () => updateDoc(doc(marta, 'memberships/marta'), { role: 'recepcion' }));
await caso('el dueño ve a su equipo', true, () => getDocs(query(collection(dueno, 'memberships'), where('tenantId', '==', 'dueno'))));
await caso('otro NO ve el equipo del dueño', false, () => getDocs(query(collection(otro, 'memberships'), where('tenantId', '==', 'dueno'))));

console.log('\nLimpieza');
await caso('NO lee el documento del complejo (tarifas, comisión, teléfonos, plantillas)', false, () => getDoc(doc(marta, 'tenants/dueno')));
await caso('ve el nombre del complejo y los horarios', true, () => getDoc(doc(marta, 'tenants/dueno/staff/complejo')));
await caso('ve las unidades', true, () => getDocs(collection(marta, 'tenants/dueno/properties')));
await caso('ve las limpiezas', true, () => getDocs(collection(marta, 'tenants/dueno/cleaningTasks')));
await caso('ve quién llega', true, () => getDoc(doc(marta, 'tenants/dueno/staff/llegadas')));
await caso('ve si el plan está activo', true, () => getDoc(doc(marta, 'subscriptions/dueno')));
await caso('marca una limpieza como lista', true, () => updateDoc(doc(marta, 'tenants/dueno/cleaningTasks/t1'), { status: 'inspected', checklist: [] }));
await caso('NO cambia la fecha de una limpieza', false, () => updateDoc(doc(marta, 'tenants/dueno/cleaningTasks/t1'), { date: '2026-10-25' }));
await caso('NO crea limpiezas', false, () => setDoc(doc(marta, 'tenants/dueno/cleaningTasks/t2'), { id: 't2' }));
await caso('NO ve reservas (teléfonos, importes)', false, () => getDoc(doc(marta, 'tenants/dueno/reservations/r1')));
await caso('NO lista reservas', false, () => getDocs(collection(marta, 'tenants/dueno/reservations')));
await caso('NO ve la caja', false, () => getDocs(collection(marta, 'tenants/dueno/cashMovements')));
await caso('NO ve recordatorios', false, () => getDocs(collection(marta, 'tenants/dueno/reminders')));
await caso('NO ve pre check-ins', false, () => getDoc(doc(marta, 'precheckins/dueno/items/p1')));
await caso('NO edita unidades', false, () => setDoc(doc(marta, 'tenants/dueno/properties/a'), { name: 'X' }));
await caso('NO edita el complejo', false, () => setDoc(doc(marta, 'tenants/dueno'), { complexName: 'X' }, { merge: true }));
await caso('NO escribe las llegadas', false, () => setDoc(doc(marta, 'tenants/dueno/staff/llegadas'), { unidades: {} }));
await caso('NO cambia el nombre ni los horarios', false, () => setDoc(doc(marta, 'tenants/dueno/staff/complejo'), { complexName: 'X' }));
await caso('NO ve el complejo de otro', false, () => getDoc(doc(marta, 'tenants/otro/staff/complejo')));
await caso('NO entra a otro complejo', false, () => getDoc(doc(marta, 'tenants/otro')));

console.log('\nRecepción');
await caso('lee el documento del complejo', true, () => getDoc(doc(juan, 'tenants/dueno')));
await caso('actualiza nombre y horarios para Limpieza', true, () => setDoc(doc(juan, 'tenants/dueno/staff/complejo'), { complexName: 'Catalinas', checkinHour: '14:00', checkoutHour: '10:00' }));
await caso('ve y edita reservas', true, () => setDoc(doc(juan, 'tenants/dueno/reservations/r1'), { status: 'checked_in' }, { merge: true }));
await caso('lista reservas', true, () => getDocs(collection(juan, 'tenants/dueno/reservations')));
await caso('registra caja', true, () => setDoc(doc(juan, 'tenants/dueno/cashMovements/c2'), { id: 'c2', amount: 10 }));
await caso('crea limpiezas', true, () => setDoc(doc(juan, 'tenants/dueno/cleaningTasks/t3'), { id: 't3' }));
await caso('actualiza llegadas para Limpieza', true, () => setDoc(doc(juan, 'tenants/dueno/staff/llegadas'), { unidades: {} }));
await caso('actualiza el calendario público', true, () => setDoc(doc(juan, 'publicCalendars/dueno/units/a'), { busy: [] }));
await caso('ve pre check-ins', true, () => getDoc(doc(juan, 'precheckins/dueno/items/p1')));
await caso('ve el estado de la sincronización', true, () => getDoc(doc(juan, 'tenants/dueno/sync/ical')));
await caso('NO edita unidades', false, () => setDoc(doc(juan, 'tenants/dueno/properties/a'), { name: 'X' }));
await caso('NO edita la configuración del complejo', false, () => setDoc(doc(juan, 'tenants/dueno'), { complexName: 'X' }, { merge: true }));
await caso('NO edita la guía pública', false, () => setDoc(doc(juan, 'publicGuides/dueno'), { x: 1 }));
await caso('NO entra a otro complejo', false, () => getDoc(doc(juan, 'tenants/otro/reservations/r9')));

console.log('\nTu Web');
const anon = env.unauthenticatedContext().firestore();
const foto = (data) => ({ data, order: 1, unitId: '' });
await caso('el dueño reserva el nombre de su link', true, () => setDoc(doc(dueno, 'siteOwners/catalinas'), { uid: 'dueno' }));
await caso('otro NO le saca el nombre', false, () => setDoc(doc(otro, 'siteOwners/catalinas'), { uid: 'otro' }));
await caso('NO reserva un nombre a nombre de otro', false, () => setDoc(doc(intruso, 'siteOwners/ajeno'), { uid: 'dueno' }));
await caso('NO usa nombres con mayúsculas o símbolos', false, () => setDoc(doc(dueno, 'siteOwners/Mal_Nombre'), { uid: 'dueno' }));
await caso('el dueño publica su página', true, () => setDoc(doc(dueno, 'publicSites/catalinas'), { enabled: true, name: 'Catalinas', units: [] }));
await caso('cualquiera ve la página (sin cuenta)', true, () => getDoc(doc(anon, 'publicSites/catalinas')));
await caso('nadie lista todas las páginas', false, () => getDocs(collection(anon, 'publicSites')));
await caso('nadie ve de quién es un nombre', false, () => getDoc(doc(intruso, 'siteOwners/catalinas')));
await caso('otro NO edita la página', false, () => setDoc(doc(otro, 'publicSites/catalinas'), { name: 'X' }, { merge: true }));
await caso('otro NO crea una página con un nombre que no reservó', false, () => setDoc(doc(otro, 'publicSites/libre'), { name: 'X' }));
await caso('Recepción ve de quién es el nombre', true, () => getDoc(doc(juan, 'siteOwners/catalinas')));
await caso('Recepción actualiza las fechas ocupadas', true, () => updateDoc(doc(juan, 'publicSites/catalinas'), { busy: { a: [{ s: '2026-11-01', e: '2026-11-03' }] }, busyUpdatedAt: serverTimestamp() }));
await caso('Recepción NO cambia los textos', false, () => updateDoc(doc(juan, 'publicSites/catalinas'), { name: 'X' }));
await caso('Limpieza NO toca la página', false, () => updateDoc(doc(marta, 'publicSites/catalinas'), { busy: {} }));
await caso('el dueño sube una foto', true, () => setDoc(doc(dueno, 'publicSites/catalinas/photos/f1'), foto('data:image/jpeg;base64,AAAA')));
await caso('NO sube algo que no es una foto', false, () => setDoc(doc(dueno, 'publicSites/catalinas/photos/f2'), foto('<script>alert(1)</script>')));
await caso('otro NO sube fotos', false, () => setDoc(doc(otro, 'publicSites/catalinas/photos/f3'), foto('data:image/jpeg;base64,AAAA')));
await caso('cualquiera ve las fotos', true, () => getDocs(collection(anon, 'publicSites/catalinas/photos')));
await caso('otro NO borra fotos', false, () => deleteDoc(doc(otro, 'publicSites/catalinas/photos/f1')));
await caso('otro NO borra el nombre', false, () => deleteDoc(doc(otro, 'siteOwners/catalinas')));
await caso('cualquiera busca un dominio propio', true, () => getDoc(doc(anon, 'siteDomains/catalinas.com.ar')));
await caso('un dueño NO carga dominios', false, () => setDoc(doc(dueno, 'siteDomains/catalinas.com.ar'), { slug: 'catalinas' }));
await caso('administración carga un dominio', true, () => setDoc(doc(as('admin', 'piccini.gabriela@gmail.com'), 'siteDomains/catalinas.com.ar'), { slug: 'catalinas' }));
await caso('el dueño borra su página y libera el nombre', true, async () => {
  await deleteDoc(doc(dueno, 'publicSites/catalinas/photos/f1'));
  await deleteDoc(doc(dueno, 'publicSites/catalinas'));
  return deleteDoc(doc(dueno, 'siteOwners/catalinas'));
});

console.log('\nCobro del abono');
const adminCobro = as('admin', 'piccini.gabriela@gmail.com');
const aviso = (uid, extra = {}) => ({ uid, complexName: 'Catalinas', email: 'dueno@x.com', plan: 'propietario', method: 'transferencia', amount: 45000, currency: 'ARS', rate: 0, createdAt: serverTimestamp(), ...extra });
await caso('administración guarda precios y datos de cobro', true, () => setDoc(doc(adminCobro, 'config/billing'), { alias: 'loomi.suite', graceDays: 5 }));
await caso('un cliente con sesión lee los datos de cobro', true, () => getDoc(doc(dueno, 'config/billing')));
await caso('sin sesión NO se leen los datos de cobro', false, () => getDoc(doc(env.unauthenticatedContext().firestore(), 'config/billing')));
await caso('un cliente NO cambia los precios', false, () => setDoc(doc(dueno, 'config/billing'), { alias: 'otro' }, { merge: true }));
await caso('el cliente avisa que pagó', true, () => setDoc(doc(dueno, 'paymentNotices/a1'), aviso('dueno')));
await caso('NO avisa a nombre de otro', false, () => setDoc(doc(otro, 'paymentNotices/a2'), aviso('dueno')));
await caso('NO se marca solo como resuelto', false, () => setDoc(doc(dueno, 'paymentNotices/a3'), { ...aviso('dueno'), handled: true }));
await caso('NO inventa medios de pago', false, () => setDoc(doc(dueno, 'paymentNotices/a4'), aviso('dueno', { method: 'bitcoin' })));
await caso('el cliente ve sus avisos', true, () => getDocs(query(collection(dueno, 'paymentNotices'), where('uid', '==', 'dueno'))));
await caso('otro NO ve los avisos del cliente', false, () => getDoc(doc(otro, 'paymentNotices/a1')));
await caso('el cliente NO edita su aviso', false, () => updateDoc(doc(dueno, 'paymentNotices/a1'), { amount: 1 }));
await caso('administración ve todos los avisos', true, () => getDocs(collection(adminCobro, 'paymentNotices')));
await caso('administración archiva un aviso', true, () => updateDoc(doc(adminCobro, 'paymentNotices/a1'), { handled: true }));

console.log('\nQuitar acceso');
await caso('un extraño NO puede quitar accesos', false, () => deleteDoc(doc(intruso, 'memberships/juan')));
await caso('el dueño le quita el acceso a Recepción', true, () => deleteDoc(doc(dueno, 'memberships/juan')));
await caso('sin acceso, ya NO ve reservas', false, () => getDoc(doc(juan, 'tenants/dueno/reservations/r1')));

console.log('\nAdministración de la plataforma (panel de clientes)');
const admin = as('admin', 'piccini.gabriela@gmail.com');
const adminSinConfirmar = as('admin', 'piccini.gabriela@gmail.com', false);
await caso('la administración lee todos los complejos', true, () => getDocs(collection(admin, 'tenants')));
await caso('la administración lee todas las suscripciones', true, () => getDocs(collection(admin, 'subscriptions')));
await caso('la administración activa un cliente', true, () => setDoc(doc(admin, 'subscriptions/otro'), { status: 'active', plan: 'complejo', updatedAt: serverTimestamp() }, { merge: true }));
await caso('la administración suspende un cliente', true, () => setDoc(doc(admin, 'subscriptions/dueno'), { status: 'suspended', updatedAt: serverTimestamp() }, { merge: true }));
await caso('la administración NO inventa estados', false, () => setDoc(doc(admin, 'subscriptions/dueno'), { status: 'gratis' }, { merge: true }));
await caso('la administración NO escribe otros campos', false, () => setDoc(doc(admin, 'subscriptions/dueno'), { status: 'active', extra: 1 }, { merge: true }));
await caso('la administración NO lee reservas de los clientes', false, () => getDoc(doc(admin, 'tenants/dueno/reservations/r1')));
await caso('la administración NO edita datos de un complejo', false, () => setDoc(doc(admin, 'tenants/dueno'), { complexName: 'X' }, { merge: true }));
await caso('sin mail confirmado NO es administración (lectura)', false, () => getDocs(collection(adminSinConfirmar, 'subscriptions')));
await caso('sin mail confirmado NO es administración (escritura)', false, () => setDoc(doc(adminSinConfirmar, 'subscriptions/otro'), { status: 'active' }, { merge: true }));
await caso('un dueño NO lee la lista de clientes', false, () => getDocs(collection(dueno, 'subscriptions')));
await caso('administración habilita un diseño especial', true, () => setDoc(doc(admin, 'subscriptions/dueno'), { webDesigns: ['clara'] }, { merge: true }));
await caso('un dueño NO se habilita diseños especiales', false, () => setDoc(doc(dueno, 'subscriptions/dueno'), { webDesigns: ['clara'] }, { merge: true }));
await caso('un dueño NO se activa a sí mismo', false, () => setDoc(doc(dueno, 'subscriptions/dueno'), { status: 'active' }, { merge: true }));
await caso('un extraño NO suspende a nadie', false, () => setDoc(doc(intruso, 'subscriptions/dueno'), { status: 'suspended' }, { merge: true }));

console.log(`\n${fail === 0 ? '✔ TODO BIEN' : '✖ HAY PROBLEMAS'}: ${ok} pruebas pasaron, ${fail} fallaron.\n`);
await env.cleanup();
process.exit(fail === 0 ? 0 : 1);
