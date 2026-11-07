/**
 * Funciones programadas:
 * - sincronizarCalendarios: cada 15 minutos recorre las cuentas con enlaces iCal y trae las reservas.
 *   Mientras sistema/icalSync.modo no sea "real", solo registra en los logs lo que cambiaría.
 * - enviarChannelManager: cada 10 minutos manda disponibilidad (y precios) a Aiosell (abajo).
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { describeChange } from '../../src/lib/icalCore';
import { cuentasConIcal, getDb, getModo, sincronizarCuenta, ZONA_HORARIA } from './sync';
import { cuentasAiosellReales, enviarCuentaAiosell, getAiosellConfig } from './aiosellSend';

export const sincronizarCalendarios = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: ZONA_HORARIA,
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    maxInstances: 1,
    retryCount: 0,
  },
  async () => {
    const db = getDb();
    const modo = await getModo(db);
    const cuentas = await cuentasConIcal(db);
    let totalCambios = 0;

    for (const cuenta of cuentas) {
      try {
        const r = await sincronizarCuenta(db, cuenta.uid, cuenta.properties, modo);
        totalCambios += r.cambios.length;
        const resumen = {
          uid: cuenta.uid,
          modo,
          agregadas: r.agregadas,
          actualizadas: r.actualizadas,
          canceladas: r.canceladas,
          errores: r.errores.length,
          conflictos: r.conflictos.length,
        };
        if (r.cambios.length || r.errores.length || r.avisos.length) {
          logger.info(`iCal ${modo === 'prueba' ? '(PRUEBA, no se escribió nada)' : ''} cuenta ${cuenta.uid}`, {
            ...resumen,
            cambios: r.cambios.map(describeChange),
            detalleErrores: r.errores,
            avisos: r.avisos,
          });
        } else {
          logger.debug('iCal sin cambios', resumen);
        }
      } catch (err: any) {
        // Un error en una cuenta no frena a las demás
        logger.error(`iCal: error sincronizando la cuenta ${cuenta.uid}`, { error: err?.message || String(err) });
      }
    }

    logger.info(`iCal: ${cuentas.length} cuenta(s) revisadas en modo ${modo}, ${totalCambios} cambio(s)`);
  }
);

/**
 * Channel manager (Aiosell): cada 10 minutos manda la disponibilidad (y los precios, si el dueño lo eligió) de las cuentas
 * cuyo hotel está en modo real. Solo manda lo que cambió; una vez por día, todo. Ver server-sync/src/aiosellSend.ts.
 */
export const enviarChannelManager = onSchedule(
  {
    schedule: 'every 10 minutes',
    timeZone: ZONA_HORARIA,
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    maxInstances: 1,
    retryCount: 0,
  },
  async () => {
    const db = getDb();
    const cuentas = await cuentasAiosellReales(db);
    if (!cuentas.length) return;
    const cfg = await getAiosellConfig(db);
    if (!cfg) {
      logger.warn('Aiosell: hay hoteles en modo real pero faltan las credenciales (sistema/aiosell)');
      return;
    }
    for (const c of cuentas) {
      try {
        const r = await enviarCuentaAiosell(db, cfg, c.uid, c.hotelCode);
        if (r.errors.length) logger.error(`Aiosell: error enviando ${c.hotelCode}`, { uid: c.uid, errores: r.errors });
        else if (r.sent.length) logger.info(`Aiosell: enviado ${c.hotelCode}`, { uid: c.uid, enviado: r.sent });
      } catch (err: any) {
        logger.error(`Aiosell: error en la cuenta ${c.uid}`, { error: err?.message || String(err) });
      }
    }
  }
);
