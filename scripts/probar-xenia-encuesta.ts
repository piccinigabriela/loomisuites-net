// @ts-nocheck -- pruebas sobre JS sin tipos
/**
 * Pruebas de la encuesta por charla de Xenia en WhatsApp (functions/api/whatsapp/zernio.js). Sin red.
 * Se corre con: npm run probar:encuesta
 */
import assert from 'node:assert/strict';
import { isSurveyOpener, parseSurveyReply, senderPhone, surveyState, startedByHuman } from '../functions/api/whatsapp/zernio.js';

const MARK = '​';
const END = '⁠';
let pasadas = 0;
const prueba = (nombre: string, fn: () => void) => {
  try {
    fn();
    pasadas++;
    console.log(`  ok  ${nombre}`);
  } catch (e) {
    console.error(`  FALLÓ  ${nombre}\n`, e);
    process.exitCode = 1;
  }
};

const opener = 'Hola, ¿cómo están? Estamos relevando alojamientos aptos para celíacos e intolerantes a la lactosa en Cariló. ¿Ofrecen desayuno?\n\nMaría · Loomi Suite';
const gabi = (message: string) => ({ direction: 'outgoing', message, sentVia: 'app' });
const xenia = (message: string) => ({ direction: 'outgoing', message: message + MARK, sentVia: 'api' });
const ellos = (message: string) => ({ direction: 'incoming', message });

prueba('reconoce el primer mensaje de la encuesta (nueva y vieja)', () => {
  assert.equal(isSurveyOpener(opener), true);
  assert.equal(isSurveyOpener('Relevamiento: alojamientos aptos para celíacos e intolerantes a la lactosa en Argentina.'), true);
  assert.equal(isSurveyOpener('Hola, ¿cuánto pagás por tu sistema de gestión?'), false);
});

prueba('chat de encuesta: Xenia sigue mientras Gabi no escriba otra cosa', () => {
  const h = [gabi(opener), ellos('sí, incluido'), xenia('¡Bárbaro! ¿Tienen opciones sin TACC?'), ellos('envasados')];
  const s = surveyState(h);
  assert.equal(s.survey, true);
  assert.equal(s.takenOver, false);
  assert.equal(s.ended, false);
  assert.match(s.opener, /relevando/);
  assert.equal(startedByHuman(h), true, 'para el resto de los chats empezados por Gabi, Xenia sigue callada');
});

prueba('si Gabi escribe a mano después, Xenia deja ese chat', () => {
  const s = surveyState([gabi(opener), ellos('sí'), gabi('¡Hola! Te llamo en un rato')]);
  assert.equal(s.takenOver, true);
});

prueba('terminada o pasada al equipo: no sigue', () => {
  const s = surveyState([gabi(opener), ellos('sí'), xenia('¡Gracias! Acá tenés el manual: loomisuite.net/manual?m=sintacc' + END)]);
  assert.equal(s.ended, true);
});

prueba('un chat que no es de encuesta no entra', () => {
  assert.equal(surveyState([gabi('Hola, ¿cuánto pagás por tu sistema?'), ellos('mucho')]).survey, false);
  assert.equal(surveyState([ellos('Hola, quiero info'), xenia('¡Hola!')]).survey, false);
});

prueba('lee los datos y las marcas de la respuesta de Claude', () => {
  const r = parseSurveyReply('¡Genial! ¿Y sin lactosa?\n<<DATOS:{"p1":1,"p2":2,"p9":3,"p3":"x","resumen":"Desayuno incluido, sin TACC envasado"}>>');
  assert.equal(r.text, '¡Genial! ¿Y sin lactosa?');
  assert.deepEqual(r.answers, { p1: 1, p2: 2 });
  assert.equal(r.summary, 'Desayuno incluido, sin TACC envasado');
  assert.equal(r.done, false);
  const f = parseSurveyReply('¡Gracias! Te dejo el manual: loomisuite.net/manual?m=sintacc <<FIN>>\n<<DATOS:{"p1":2,"p8":2,"resumen":"Usan Pxsol"}>>');
  assert.equal(f.done, true);
  assert.equal(f.text, '¡Gracias! Te dejo el manual: loomisuite.net/manual?m=sintacc');
  assert.equal(parseSurveyReply('Te escribe el equipo por acá. <<EQUIPO>>').handoff, true);
  assert.equal(parseSurveyReply('<<SILENCIO>>').silent, true);
  assert.deepEqual(parseSurveyReply('Hola <<DATOS:{roto}>>').answers, {});
});

prueba('teléfono de quien escribe', () => {
  assert.equal(senderPhone({ message: { sender: { phoneNumber: '5492254123456' } } }), '5492254123456');
  assert.equal(senderPhone({ message: { sender: { id: 'whatsapp:+54 9 2254 12-3456' } } }), '5492254123456');
  assert.equal(senderPhone({ message: {} }), '');
});

console.log(process.exitCode ? '\nHay pruebas de la encuesta que fallaron' : `\n${pasadas} pruebas de la encuesta pasaron`);
