/**
 * Pre check-in digital del huésped.
 *
 * El huésped lo completa desde su guía (link con ?res=ID_RESERVA). Se guarda en
 * precheckins/{uidAnfitrión}/items/{idReserva}: cualquiera puede CREAR (con validación en las reglas),
 * solo el anfitrión puede leerlo, editarlo o borrarlo. Sin foto del documento: si el dueño la necesita,
 * la pide por WhatsApp.
 */
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GuestLanguage } from '../data/initialData';
import type { PreCheckin } from '../types';

export type { PreCheckin };

/** Los IDs de Firestore no admiten "/" */
export const precheckinDocId = (reservationId: string) => reservationId.replace(/\//g, '_').slice(0, 300);

export async function submitPreCheckin(hostUid: string, data: PreCheckin): Promise<void> {
  if (!db) throw new Error('Sin conexión');
  await setDoc(doc(db, 'precheckins', hostUid, 'items', precheckinDocId(data.reservationId)), {
    ...data,
    submittedAt: serverTimestamp(),
  });
}

export function subscribeToPreCheckins(hostUid: string, onData: (map: Record<string, PreCheckin>) => void): () => void {
  if (!hostUid || !db) return () => {};
  return onSnapshot(
    collection(db, 'precheckins', hostUid, 'items'),
    (snap) => {
      const map: Record<string, PreCheckin> = {};
      snap.docs.forEach((d) => {
        const v = d.data() as PreCheckin;
        map[v.reservationId || d.id] = v;
      });
      onData(map);
    },
    (err) => console.warn('Error leyendo pre check-ins:', err)
  );
}

export const DOC_TYPE_LABEL: Record<PreCheckin['docType'], string> = { dni: 'DNI', pasaporte: 'Pasaporte', otro: 'Documento' };

/** Resumen corto para la ficha, recepción y avisos al equipo. */
export function preCheckinSummary(p: PreCheckin): string {
  const parts = [
    p.fullName,
    `${DOC_TYPE_LABEL[p.docType] || 'Doc.'} ${p.docNumber}`,
    p.nationality,
    `${p.guests} ${p.guests === 1 ? 'persona' : 'personas'}`,
    p.arrivalTime ? `llega ${p.arrivalTime}` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}

export function buildPreCheckinRequest(opts: {
  guestFirstName: string;
  complexName: string;
  link: string;
  lang: GuestLanguage;
}): string {
  const name = opts.guestFirstName ? ` ${opts.guestFirstName}` : '';
  if (opts.lang === 'en') {
    return `Hi${name}! To make your arrival quick${opts.complexName ? ` at ${opts.complexName}` : ''}, please complete your online pre check-in (takes 1 minute):\n${opts.link}\n\nWhen you arrive you'll only need to show your ID. Thank you!`;
  }
  if (opts.lang === 'pt') {
    return `Olá${name}! Para agilizar sua chegada${opts.complexName ? ` em ${opts.complexName}` : ''}, complete seu pré check-in online (leva 1 minuto):\n${opts.link}\n\nAo chegar, você só precisará mostrar seu documento. Obrigado!`;
  }
  return `¡Hola${name}! Para que tu llegada${opts.complexName ? ` a ${opts.complexName}` : ''} sea rápida, completá tu pre check-in online (lleva 1 minuto):\n${opts.link}\n\nAl llegar solo vas a tener que mostrar tu documento. ¡Gracias!`;
}

/** Link de la guía de una reserva, con el parámetro que habilita el pre check-in. */
export function reservationGuideLink(opts: {
  origin: string;
  hostUid?: string;
  propertyId: string;
  reservationId: string;
  guestFirstName?: string;
  unitName?: string;
}): string {
  const q = [
    opts.guestFirstName ? `huesped=${encodeURIComponent(opts.guestFirstName)}` : '',
    opts.unitName ? `unidad=${encodeURIComponent(opts.unitName)}` : '',
    `res=${encodeURIComponent(opts.reservationId)}`,
  ]
    .filter(Boolean)
    .join('&');
  return opts.hostUid
    ? `${opts.origin}/guia/${opts.hostUid}/${opts.propertyId}?${q}`
    : `${opts.origin}/guia/${opts.propertyId}?${q}`;
}
