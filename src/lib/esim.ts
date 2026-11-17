/**
 * Datos móviles con eSIM (17/11): cada anfitrión pega su link de afiliado en la guía (`welcomeGuide.esimLink`).
 * La sección de la bienvenida y la línea de los mensajes aparecen solo si el link está cargado.
 * En Airbnb no se pueden mandar links: ahí el mensaje solo avisa que está en la guía.
 */

export const ESIM_TEXT = {
  titleEs: 'Datos móviles',
  titleEn: 'Mobile data',
  es: 'Podés comprar una eSIM antes de salir de casa, para Argentina o para cualquier país de tu viaje. Hay planes de Sudamérica que cubren varios países con una sola eSIM. Se instala con wifi y el plan arranca recién cuando te conectás en destino. Para saber si tu celular acepta eSIM, marcá *#06#: si aparece un número llamado EID, está todo listo.',
  en: "You can get an eSIM before leaving home, for Argentina or any country on your trip. South America plans cover several countries with a single eSIM. Install it over Wi-Fi; the plan only starts when you connect at your destination. To check if your phone accepts eSIM, dial *#06#: if a number called EID appears, you're all set.",
};

const clean = (v?: string) => (v || '').trim();

/** Link válido (con https). Si no empieza con http, se completa. */
export function normalizeEsimLink(v?: string): string {
  const t = clean(v);
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/**
 * Links para cada idioma: si el anfitrión pegó la versión en español (con /es/ en la ruta, como esim-hub.com/es/destinations),
 * el botón en inglés usa la misma sin /es/. Si no, los dos botones van al mismo link.
 */
export function esimLinks(v?: string): { es: string; en: string } | null {
  const link = normalizeEsimLink(v);
  if (!link) return null;
  const en = link.replace(/^(https?:\/\/[^/]+)\/es\//i, '$1/');
  return { es: link, en };
}

/** Línea para los mensajes al huésped (antes de la llegada). En Airbnb, sin link: remite a la guía. */
export function esimMessageLine(v: string | undefined, lang: 'es' | 'en' | 'pt', isAirbnb: boolean): string {
  const links = esimLinks(v);
  if (!links) return '';
  if (isAirbnb) {
    if (lang === 'en') return '📶 Mobile data: in the welcome guide you will find how to get an eSIM for your trip.';
    if (lang === 'pt') return '📶 Dados móveis: no guia de boas-vindas você encontra como comprar um eSIM para a viagem.';
    return '📶 Datos móviles: en la guía de bienvenida te contamos cómo conseguir una eSIM para tu viaje.';
  }
  if (lang === 'en') return `📶 Mobile data: you can get an eSIM before your trip. See plans: ${links.en}`;
  if (lang === 'pt') return `📶 Dados móveis: você pode comprar um eSIM antes da viagem. Veja os planos: ${links.en}`;
  return `📶 Datos móviles: podés comprar una eSIM antes de viajar. Ver planes: ${links.es}`;
}
