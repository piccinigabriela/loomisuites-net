// @ts-nocheck -- pruebas sobre JS sin tipos
/**
 * Pruebas de la encuesta por charla de Xenia en WhatsApp (functions/api/whatsapp/zernio.js). Sin red.
 * Se corre con: npm run probar:encuesta
 */
import assert from 'node:assert/strict';
import { arHour, isAutoReply, isSurveyOpener, needsNudge, missingSurvey, parseSurveyReply, senderPhone, surveyState, startedByHuman } from '../functions/api/whatsapp/zernio.js';

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

prueba('un número que ya había chateado antes: cuenta desde el último mensaje de encuesta', () => {
  const h = [ellos('Hola, quiero la demo'), xenia('¡Acá la tenés!'), gabi('Gracias por escribir'), gabi(opener), ellos('sí')];
  const s = surveyState(h);
  assert.equal(s.survey, true);
  assert.equal(s.takenOver, false);
  assert.equal(s.ended, false);
  assert.deepEqual(s.after.map((m: any) => m.message), ['sí']);
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
  const r = parseSurveyReply('¡Genial! ¿Y sin lactosa?\n<<DATOS:{"p1":1,"p2":2,"p10":3,"p3":"x","resumen":"Desayuno incluido, sin TACC envasado"}>>');
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

prueba('bienvenidas automáticas de WhatsApp Business: no se contestan', () => {
  assert.equal(
    isAutoReply('🌲🌳🌊 Gracias por comunicarse con Cabañas Bosque y Mar, ubicado a 2 cuadras del mar 🏖️ y a 3 del Centro Comercial. Contamos con cabañas de 2 y 3 ambientes. Nuestro horario de atención es de 9 hs a 21 hs. En breve le respondemos.😊'),
    true
  );
  assert.equal(isAutoReply('Hola! Gracias por tu mensaje, en breve te respondemos'), true, 'saludo automático corto');
  assert.equal(isAutoReply('Gracias por comunicarse! Sí, tenemos desayuno incluido'), false, 'una señal sola: es una persona');
  assert.equal(isAutoReply('Este es un mensaje automático. Te contestamos a la brevedad.'), true);
  assert.equal(isAutoReply('Sí, el desayuno está incluido'), false);
  assert.equal(
    isAutoReply('Gracias por comunicarse con Carilo Village Hotel Apart & Spa 🦚 Para conocernos visitá: www.carilovillage.com Las consultas serán respondidas desde este contacto de lunes a lunes de 8am a 22pm. ¡Los esperamos!'),
    true
  );
  assert.equal(isAutoReply('Buenos dias, si ofrecemos desayunos sin tacc tambien'), false);
  assert.equal(
    isAutoReply('¡Hola! 👋 Gracias por comunicarte con *GROW* Si estás alojado y necesitas ayuda escribinos al: 👉🏻 2255601371 de 8:00 a 20:00hs Desde las 20:00 hs en adelante podés comunicarte con nuestra guardia al: 1136882242 Para averiguar por estadías: 1131794028 Muchas gracias 🛎️'),
    true
  );
  assert.equal(isAutoReply('Sí, desayuno incluido de 8 a 11 hs'), false, 'un horario solo no alcanza');
  assert.equal(isAutoReply('Hola, sí ofrecemos desayuno. Gracias por comunicarse, cualquier cosa estamos.'), false);
});

prueba('no cierra sin preguntar el sistema y, si sirven comida, la guía', () => {
  assert.deepEqual(missingSurvey({ p1: 1, p2: 3, p3: 1, p4: 2, p5: 2, p7: 2 }), ['p8', 'p9', 'p6']);
  assert.deepEqual(missingSurvey({ p1: 1, p7: 3, p8: 2, p6: 1 }), [], 'si ya tienen pre check-in, no va la 9');
  assert.deepEqual(missingSurvey({ p1: 4 }), ['p8']);
  assert.deepEqual(missingSurvey({ p1: 4, p8: 1 }), []);
  assert.deepEqual(missingSurvey({ p1: 2, p8: 2, p6: 1 }), []);
});

prueba('bienvenida con botones ("[Unsupported message]"): es automática', () => {
  assert.equal(isAutoReply('[Unsupported message]'), true);
});

prueba('recordatorio: solo si después de la encuesta llegaron cosas automáticas y nadie más escribió', () => {
  const auto = ellos('Gracias por comunicarte con Cabañas X. En breve te respondemos');
  assert.equal(needsNudge(surveyState([gabi(opener), auto])), true);
  assert.equal(needsNudge(surveyState([gabi(opener), auto, ellos('[Unsupported message]')])), true);
  assert.equal(needsNudge(surveyState([gabi(opener)])), false, 'sin respuesta automática no hay ventana de 24 h');
  assert.equal(needsNudge(surveyState([gabi(opener), auto, ellos('sí, incluido'), xenia('¡Bárbaro! ¿Y sin TACC?')])), false, 'ya contestó una persona');
  assert.equal(needsNudge(surveyState([gabi(opener), auto, gabi('Hola, ¿me atienden?')])), false, 'escribió Gabi');
  assert.equal(needsNudge(surveyState([gabi(opener), auto, xenia('Hola de nuevo 😊 ¿Me podría responder una persona?')])), false, 'ya se mandó');
  assert.equal(arHour(Date.parse('2026-11-11T12:00:00Z')), 9);
  assert.equal(arHour(Date.parse('2026-11-11T23:30:00Z')), 20);
});

prueba('teléfono de quien escribe', () => {
  assert.equal(senderPhone({ message: { sender: { phoneNumber: '5492254123456' } } }), '5492254123456');
  assert.equal(senderPhone({ message: { sender: { id: 'whatsapp:+54 9 2254 12-3456' } } }), '5492254123456');
  assert.equal(senderPhone({ message: {} }), '');
});

console.log(process.exitCode ? '\nHay pruebas de la encuesta que fallaron' : `\n${pasadas} pruebas de la encuesta pasaron`);
