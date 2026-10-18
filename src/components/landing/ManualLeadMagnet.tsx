import React, { useEffect, useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';

type ManualId = 'hospitalidad' | 'fotografia';

const MANUALS: Record<
  ManualId,
  { title: string; subtitle: string; cover: string; alt: string; pdf: string; fileName: string; bullets: string[] }
> = {
  hospitalidad: {
    title: 'Hospitalidad plena',
    subtitle: 'Las 6 normas de oro del anfitrión, inspiradas en la Xenía griega y el Omotenashi japonés.',
    cover: '/manual-portada.jpg',
    alt: 'Portada del manual Hospitalidad plena de Loomi Suite',
    pdf: '/manual-hospitalidad-loomi-suite.pdf',
    fileName: 'Hospitalidad-plena-Loomi-Suite.pdf',
    bullets: ['6 normas con una aplicación concreta cada una', 'Del recibimiento a la despedida que hace volver'],
  },
  fotografia: {
    title: 'En su mejor día',
    subtitle: 'Guía de fotografía para alojamientos: con el celular o con cámara, fotos que hacen que te reserven.',
    cover: '/manual-fotografia-portada.jpg',
    alt: 'Portada del manual En su mejor día, guía de fotografía de Loomi Suite',
    pdf: '/manual-fotografia-loomi-suite.pdf',
    fileName: 'En-su-mejor-dia-Loomi-Suite.pdf',
    bullets: ['Luz, preparación y las tomas que no pueden faltar', 'Checklists para imprimir y llevar a la sesión'],
  },
};

const ORDER: ManualId[] = ['hospitalidad', 'fotografia'];

/**
 * Gancho de la landing: los manuales gratis a cambio de nombre y email.
 * Guarda el contacto en "leads" (type: 'manual'), avisa por Web3Forms y deja descargar los PDF.
 * Links directos: loomisuite.net/#manual y loomisuite.net/manual (?m=fotos destaca el de fotografía).
 */
export const ManualLeadMagnet: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [first, setFirst] = useState<ManualId>('hospitalidad');

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('m') === 'fotos') setFirst('fotografia');
    } catch {}
    if (window.location.hash === '#manual') {
      setTimeout(() => document.getElementById('manual')?.scrollIntoView({ behavior: 'smooth' }), 400);
    }
  }, []);

  const order = first === 'fotografia' ? ['fotografia', 'hospitalidad'] as ManualId[] : ORDER;

  const download = (id: ManualId) => {
    const m = MANUALS[id];
    const a = document.createElement('a');
    a.href = m.pdf;
    a.download = m.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError('Completá tu nombre y un email válido.');
      return;
    }
    setSending(true);
    const nowEsAr = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    const tasks: Promise<unknown>[] = [];
    tasks.push(
      Promise.all([import('../../lib/firebase'), import('firebase/firestore')]).then(([{ db }, { addDoc, collection, serverTimestamp }]) => {
        if (!db) return;
        return addDoc(collection(db, 'leads'), {
          type: 'manual',
          fullName: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          planOrTopic: 'Manuales gratis (hospitalidad y fotografía)',
          source: window.location.pathname === '/' ? 'landing' : window.location.pathname + window.location.search,
          createdAt: serverTimestamp(),
        });
      }).catch((err) => console.warn('No se guardó el lead del manual:', err))
    );
    tasks.push(
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '4451c78e-3861-41c1-8c94-f977bbd0c979',
          subject: 'Descarga de manuales',
          from_name: 'Loomi Suite',
          email: cleanEmail,
          message: `${name.trim()} (${cleanEmail}${phone.trim() ? ` · ${phone.trim()}` : ''}) pidió los manuales el ${nowEsAr}.`,
        }),
      }).catch((err) => console.warn('No se envió el aviso del manual:', err))
    );
    await Promise.race([Promise.all(tasks), new Promise((r) => setTimeout(r, 2500))]);
    setSending(false);
    setDone(true);
  };

  const input =
    'w-full text-base font-medium px-4 py-3 rounded-xl border border-white/15 bg-[#252525] text-[#EFECE5] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#E1500A]';

  return (
    <section id="manual" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <div className="rounded-3xl bg-[#18181B] border border-white/10 p-6 sm:p-10 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#FF8A4C]">Regalo · 2 manuales en PDF</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#EFECE5] tracking-tight font-['Outfit',sans-serif]">
            Manuales gratis para anfitriones
          </h2>
          <p className="text-base text-[#EFECE5] leading-relaxed">Dejá tu nombre y tu email y descargá los dos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.map((id) => {
            const m = MANUALS[id];
            return (
              <div key={id} className="flex gap-5 items-start rounded-2xl bg-[#121214] border border-white/10 p-5">
                <img
                  src={m.cover}
                  alt={m.alt}
                  width={636}
                  height={900}
                  className="w-24 sm:w-28 rounded-md shadow-xl shadow-black/60 shrink-0"
                  loading="lazy"
                />
                <div className="space-y-2 min-w-0">
                  <h3 className="text-lg font-semibold text-[#EFECE5] font-['Outfit',sans-serif]">{m.title}</h3>
                  <p className="text-sm text-[#EFECE5] leading-relaxed">{m.subtitle}</p>
                  <ul className="text-sm text-[#EFECE5] space-y-1">
                    {m.bullets.map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF8A4C] mt-0.5 shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  {done && (
                    <button
                      type="button"
                      onClick={() => download(id)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#A8380A] text-white text-sm font-bold cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" /> Descargar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {done ? (
          <p className="text-lg font-semibold text-[#EFECE5]">
            ¡Listo, {name.trim().split(' ')[0]}! Tocá "Descargar" en cada manual.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <input aria-label="Nombre" className={input} placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <input aria-label="Email" type="email" className={input} placeholder="Tu email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input
              aria-label="WhatsApp (opcional)"
              type="tel"
              className={`${input} sm:col-span-2`}
              placeholder="WhatsApp (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            {error && <p className="sm:col-span-2 text-sm font-bold text-[#FF8A4C]">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="sm:col-span-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C2410C] hover:bg-[#A8380A] disabled:opacity-60 text-white text-base font-bold cursor-pointer transition-colors"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {sending ? 'Preparando…' : 'Quiero los manuales'}
            </button>
            <p className="sm:col-span-2 text-xs text-[#D9D4C9]">Te vamos a escribir solo para contarte novedades de Loomi Suite. Sin spam.</p>
          </form>
        )}
      </div>
    </section>
  );
};
