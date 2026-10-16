/**
 * Función programada: cada 15 minutos recorre las cuentas con enlaces iCal y trae las reservas.
 * Mientras sistema/icalSync.modo no sea "real", solo registra en los logs lo que cambiaría.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { describeChange } from '../../src/lib/icalCore';
import { cuentasConIcal, getDb, getModo, sincronizarCuenta, ZONA_HORARIA } from './sync';

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
