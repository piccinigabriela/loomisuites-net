import React, { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Check, Download, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';

const PDF_URL = '/manual-hospitalidad-loomi-suite.pdf';
const PDF_NAME = 'Hospitalidad-integral-Loomi-Suite.pdf';

/**
 * Gancho de la landing: el manual de hospitalidad gratis a cambio de nombre y email.
 * Guarda el contacto en "leads" (type: 'manual'), avisa por Web3Forms y descarga el PDF.
 * Se puede linkear directo con loomisuite.net/#manual.
 */
export const ManualLeadMagnet: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.location.hash === '#manual') {
      setTimeout(() => document.getElementById('manual')?.scrollIntoView({ behavior: 'smooth' }), 400);
    }
  }, []);

  const startDownload = () => {
    const a = document.createElement('a');
    a.href = PDF_URL;
    a.download = PDF_NAME;
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
    // Guardar y avisar sin frenar la descarga si algo falla
    const tasks: Promise<unknown>[] = [];
    if (db) {
      tasks.push(
        addDoc(collection(db, 'leads'), {
          type: 'manual',
          fullName: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          planOrTopic: 'Manual de hospitalidad (descarga)',
          createdAt: serverTimestamp(),
        }).catch((err) => console.warn('No se guardó el lead del manual:', err))
      );
    }
    tasks.push(
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '4451c78e-3861-41c1-8c94-f977bbd0c979',
          subject: 'Descarga del manual de hospitalidad',
          from_name: 'Loomi Suite',
          email: cleanEmail,
          message: `${name.trim()} (${cleanEmail}${phone.trim() ? ` · ${phone.trim()}` : ''}) descargó el manual de hospitalidad el ${nowEsAr}.`,
        }),
      }).catch((err) => console.warn('No se envió el aviso del manual:', err))
    );
    await Promise.race([Promise.all(tasks), new Promise((r) => setTimeout(r, 2500))]);
    setSending(false);
    setDone(true);
    startDownload();
  };

  const input =
    'w-full text-base font-medium px-4 py-3 rounded-xl border border-white/15 bg-[#252525] text-[#EFECE5] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#E1500A]';

  return (
    <section id="manual" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="rounded-3xl bg-[#18181B] border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Portada */}
        <div className="lg:col-span-4 bg-[#121214] flex items-center justify-center p-6 sm:p-8">
          <img
            src="/manual-portada.jpg"
            alt="Portada del manual Hospitalidad integral de Loomi Suite"
            className="w-48 sm:w-56 lg:w-full max-w-[260px] rounded-lg shadow-2xl shadow-black/60 rotate-[-2deg]"
            loading="lazy"
          />
        </div>

        {/* Texto y formulario */}
        <div className="lg:col-span-8 p-6 sm:p-10 space-y-5">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#E1500A]">Regalo · PDF gratis</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#EFECE5] tracking-tight font-['Outfit',sans-serif]">
            Hospitalidad integral: las 6 normas de oro del anfitrión
          </h2>
          <p className="text-base text-[#EFECE5] leading-relaxed max-w-2xl">
            Un manual inspirado en la Xenía griega y el Omotenashi japonés, con una aplicación concreta para cada norma:
            del recibimiento a la despedida que hace volver al huésped.
          </p>
          <ul className="text-sm font-medium text-[#EFECE5] space-y-1.5">
            {['6 normas con su principio y su aplicación moderna', 'Ideas concretas para cabañas, departamentos y complejos chicos', '10 páginas para leer en 15 minutos'].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#E1500A] mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>

          {done ? (
            <div className="rounded-2xl border border-[#E1500A]/50 bg-[#E1500A]/10 p-5 space-y-2">
              <p className="text-lg font-semibold text-[#EFECE5]">¡Listo, {name.trim().split(' ')[0]}! Tu manual se está descargando.</p>
              <p className="text-sm text-[#EFECE5]">
                Si no arranca,{' '}
                <a href={PDF_URL} download={PDF_NAME} className="font-bold text-[#FF8A4C] underline">
                  tocá acá para descargarlo
                </a>
                .
              </p>
            </div>
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
                className="sm:col-span-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E1500A] hover:bg-[#C44608] disabled:opacity-60 text-white text-base font-bold cursor-pointer transition-colors"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {sending ? 'Preparando…' : 'Descargar gratis'}
              </button>
              <p className="sm:col-span-2 text-xs text-[#D9D4C9]">
                Te vamos a escribir solo para contarte novedades de Loomi Suite. Sin spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
