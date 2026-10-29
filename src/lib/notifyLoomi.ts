/**
 * Aviso por mail a Loomi (a Gabi) con Web3Forms: registro nuevo y "Ya pagué".
 * El mail llega a la casilla de la cuenta de Web3Forms dueña de la clave.
 * keepalive: el aviso sale aunque la pantalla cambie o se recargue enseguida.
 */
const WEB3FORMS_KEY = '4451c78e-3861-41c1-8c94-f977bbd0c979';

export function notifyLoomi(subject: string, message: string, replyTo?: string): void {
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: 'Loomi Suite',
      ...(replyTo ? { email: replyTo } : {}),
      message,
    }),
  })
    .then(async (r) => {
      if (!r.ok) console.warn('Aviso a Loomi no enviado:', r.status, await r.text().catch(() => ''));
    })
    .catch((err) => console.warn('Aviso a Loomi no enviado:', err));
}
