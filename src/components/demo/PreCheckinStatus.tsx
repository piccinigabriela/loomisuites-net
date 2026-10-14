import React, { useState } from 'react';
import { Check, ClipboardCheck, Copy, MessageCircle } from 'lucide-react';
import { PreCheckin, Reservation } from '../../types';
import { guessGuestLanguage, isGenericGuestName } from '../../data/initialData';
import { isAppMode } from '../../lib/appMode';
import { auth } from '../../lib/firebase';
import { buildPreCheckinRequest, DOC_TYPE_LABEL, reservationGuideLink } from '../../lib/precheckin';
import { whatsAppUrl } from '../../lib/teamNotices';

interface PreCheckinStatusProps {
  reservation: Reservation;
  precheckin?: PreCheckin;
  unitName?: string;
  complexName?: string;
}

export function preCheckinLinkFor(reservation: Reservation, unitName?: string): string {
  const first = isGenericGuestName(reservation.guestName) ? '' : reservation.guestName.split(' ')[0];
  return reservationGuideLink({
    origin: window.location.origin,
    hostUid: isAppMode() ? auth?.currentUser?.uid : undefined,
    propertyId: reservation.propertyId,
    reservationId: reservation.id,
    guestFirstName: first,
    unitName,
  });
}

export const PreCheckinStatus: React.FC<PreCheckinStatusProps> = ({ reservation, precheckin, unitName, complexName = '' }) => {
  const [copied, setCopied] = useState(false);
  const link = preCheckinLinkFor(reservation, unitName);

  if (precheckin) {
    const sent = precheckin.submittedAt?.toDate ? precheckin.submittedAt.toDate() : null;
    const rows: Array<[string, string]> = [
      ['Nombre', precheckin.fullName],
      [DOC_TYPE_LABEL[precheckin.docType] || 'Documento', precheckin.docNumber],
      ['Nacionalidad', precheckin.nationality],
      ['Personas', String(precheckin.guests)],
      ['Llegada', precheckin.arrivalTime || '—'],
      ['WhatsApp', precheckin.phone || '—'],
    ];
    if (precheckin.companions) rows.push(['Acompañantes', precheckin.companions]);
    if (precheckin.comments) rows.push(['Comentarios', precheckin.comments]);
    return (
      <div className="p-4 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30 text-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
            <Check className="w-4 h-4" /> Pre check-in completo
          </span>
          {sent && (
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              {sent.getDate()}/{sent.getMonth() + 1} {String(sent.getHours()).padStart(2, '0')}:{String(sent.getMinutes()).padStart(2, '0')}
            </span>
          )}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-bold text-stone-800 dark:text-stone-200">{k}</dt>
              <dd className="font-semibold text-stone-900 dark:text-white break-words">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Aceptó las normas de la casa. Al llegar, pedile el documento y entregale las llaves.</p>
      </div>
    );
  }

  const lang = guessGuestLanguage(reservation.guestPhone);
  const first = isGenericGuestName(reservation.guestName) ? '' : reservation.guestName.split(' ')[0];
  const text = buildPreCheckinRequest({ guestFirstName: first, complexName, link, lang });

  return (
    <div className="p-4 rounded-2xl border border-amber-400/70 bg-amber-50 dark:bg-amber-950/30 text-sm space-y-2.5">
      <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
        <ClipboardCheck className="w-4 h-4" /> Pre check-in pendiente
      </span>
      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
        Mandale el link para que complete sus datos antes de llegar (va en {lang === 'en' ? 'inglés' : lang === 'pt' ? 'portugués' : 'español'}).
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsAppUrl(text, reservation.guestPhone)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#128C5E] hover:bg-[#0E7A51] text-white"
        >
          <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado' : 'Copiar link'}
        </button>
      </div>
    </div>
  );
};
