import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Check,
  ShieldCheck,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
  MapPin,
  Flame,
  Waves,
  Wifi,
  Phone,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { WelcomeGuideData, Property } from '../../types';

interface DirectBookingLandingProps {
  guideData: WelcomeGuideData;
  properties: Property[];
}

export const DirectBookingLanding: React.FC<DirectBookingLandingProps> = ({
  guideData,
  properties,
}) => {
  const [selectedCabinId, setSelectedCabinId] = useState<string>(properties[0]?.id || 'prop-1');
  const [nights, setNights] = useState<number>(3);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [showSelfOnboardExplain, setShowSelfOnboardExplain] = useState<boolean>(false);

  const selectedCabin = properties.find((p) => p.id === selectedCabinId) || properties[0];

  // Pricing math
  const pricePerNight = selectedCabin?.basePrice || 95;
  const rawTotal = pricePerNight * nights;
  const discountPercent = guideData.directBookingSettings.directDiscountPercent || 15;
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const finalTotal = rawTotal - discountAmount;
  const depositPercent = guideData.directBookingSettings.depositPercentage || 50;
  const depositAmount = Math.round((finalTotal * depositPercent) / 100);
  const balanceOnArrival = finalTotal - depositAmount;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Fernando! Quiero confirmar mi reserva directa en ${guideData.propertyName}:\n` +
    `• Cabaña: ${selectedCabin?.name}\n` +
    `• Estadía: ${nights} noches (${guestsCount} personas)\n` +
    `• Total con 15% desc directo: $${finalTotal} USD\n` +
    `• Seña 50% ($${depositAmount} USD) a transferir a ${guideData.directBookingSettings.bankAlias}\n` +
    `• Mi nombre: ${guestName || 'Huésped'} - Tel: ${guestPhone}`
  );

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
      {/* Browser mockup bar with custom domain */}
      <div className="bg-stone-950 px-4 py-2 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <div className="ml-3 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 flex items-center gap-2 text-stone-200 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">🔒 https://</span>
            <span className="text-white font-bold">woodcabiniguazu.com.ar</span>
            <span className="text-stone-500 text-[10px] hidden sm:inline">(Dominio Propio de Fernando)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://woodcabiniguazu.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
          >
            <span>Abrir en nueva pestaña</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Banner de Modo Self-Onboard para el Hotelero */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 px-6 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4" />
          <span>
            <strong>Motor de Reservas Directas conectado a tu dominio:</strong> Funciona directamente en <code>woodcabiniguazu.com.ar</code> sin comisiones de Booking ni Airbnb.
          </span>
        </div>
        <button
          onClick={() => setShowSelfOnboardExplain(!showSelfOnboardExplain)}
          className="bg-black/30 hover:bg-black/50 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
        >
          {showSelfOnboardExplain ? 'Ocultar Cómo Funciona' : '¿Cómo se Conecta tu Dominio? (Self-Onboard)'}
        </button>
      </div>

      {showSelfOnboardExplain && (
        <div className="bg-stone-950 p-6 border-b border-stone-800 text-xs text-stone-300 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-900/80 rounded-xl border border-stone-800">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs mb-2">1</div>
            <h4 className="font-bold text-white mb-1">Cargas tus Cabañas en 2 min</h4>
            <p className="text-stone-400">Pones fotos, tarifa base por noche y capacidad máxima. Sin programar nada.</p>
          </div>
          <div className="p-4 bg-stone-900/80 rounded-xl border border-stone-800">
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs mb-2">2</div>
            <h4 className="font-bold text-white mb-1">Pones tu Alias o CBU</h4>
            <p className="text-stone-400">Indicas el % de seña (ej. 50%) y el descuento de venta directa (ej. 15%).</p>
          </div>
          <div className="p-4 bg-stone-900/80 rounded-xl border border-stone-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mb-2">3</div>
            <h4 className="font-bold text-white mb-1">Tu Link Listo para Instagram & Maps</h4>
            <p className="text-stone-400">Copias el link y lo pones en tu perfil. Las reservas llegan directo a tu WhatsApp con la seña depositada.</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative p-6 sm:p-10 border-b border-stone-800 bg-gradient-to-b from-stone-950 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <img
            src="/cabanas/piscina.jpg"
            alt="Piscina y Selva Iguazú"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-transparent" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold mb-4">
            <Percent className="w-3.5 h-3.5" />
            <span>Mejor Precio Garantizado • 15% Menos que en Booking o Airbnb</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            {guideData.propertyName}
          </h1>
          <p className="text-sm sm:text-base text-stone-400 mt-2">
            {guideData.tagline} • Ubicado en Selva Yriapú, a minutos del Parque Nacional Iguazú.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <Waves className="w-4 h-4 text-cyan-400" />
              Piscina en la Selva
            </span>
            <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <Flame className="w-4 h-4 text-orange-400" />
              Parrilla & Leña
            </span>
            <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <Wifi className="w-4 h-4 text-emerald-400" />
              WiFi 5G Gratis
            </span>
            <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <MapPin className="w-4 h-4 text-amber-400" />
              Estacionamiento Privado
            </span>
          </div>
        </div>
      </div>

      {/* Main Booking Engine Grid */}
      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Cabin Selection & Amenities */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Selecciona tu Cabaña en Wood Cabin</span>
          </h2>

          <div className="space-y-4">
            {properties.map((cabin) => (
              <div
                key={cabin.id}
                onClick={() => setSelectedCabinId(cabin.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedCabinId === cabin.id
                    ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                    <img
                      src={cabin.imageUrl}
                      alt={cabin.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{cabin.name}</h3>
                    <p className="text-xs text-stone-400">{cabin.type}</p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-300 mt-1">
                      <span>Hasta {cabin.maxGuests} personas</span>
                      <span>•</span>
                      <span>{cabin.bedrooms} dorm.</span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-700/40">
                  <div className="text-xs text-stone-400 line-through">
                    ${Math.round(cabin.basePrice * 1.18)} USD
                  </div>
                  <div className="text-base font-extrabold text-amber-400 font-mono">
                    ${cabin.basePrice} <span className="text-xs text-stone-300 font-normal">/ noche</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Directo sin comisión
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Value props */}
          <div className="p-4 bg-stone-800/50 rounded-2xl border border-stone-700/60 space-y-2 text-xs text-stone-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía de Reserva Directa con Fernando</span>
            </h4>
            <p>
              Al reservar directamente desde esta web oficial, tratas en todo momento con <strong>Fernando (dueño de Los Bananos)</strong>. No hay intermediarios, obtienes el 15% de descuento, recibes la Guía de Bienvenida digital completa para no perder tiempo en Cataratas y congelas la tarifa con el 50% de seña.
            </p>
          </div>
        </div>

        {/* Right Col: Interactive Calculator & Direct Booking Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 p-6 bg-stone-800 rounded-3xl border border-stone-700/80 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-700/80 pb-4">
              <div>
                <span className="text-xs text-stone-400">Cotizador en Vivo</span>
                <h3 className="font-bold text-white text-base font-['Outfit']">Tu Estadía en Misiones</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold">
                15% OFF
              </span>
            </div>

            {/* Stay inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Noches</label>
                <div className="flex items-center bg-stone-900 rounded-xl border border-stone-700 px-3 py-2">
                  <Calendar className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={nights}
                    onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-transparent text-white font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Huéspedes</label>
                <div className="flex items-center bg-stone-900 rounded-xl border border-stone-700 px-3 py-2">
                  <Users className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                  <input
                    type="number"
                    min={1}
                    max={selectedCabin?.maxGuests || 6}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-transparent text-white font-bold focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Selected cabin visual card */}
            {selectedCabin && (
              <div className="flex items-center gap-3 p-3 bg-stone-900/80 rounded-2xl border border-stone-700/60">
                <img
                  src={selectedCabin.imageUrl}
                  alt={selectedCabin.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-700/80 shrink-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-white text-sm">{selectedCabin.name}</div>
                  <div className="text-stone-400 text-[11px]">{selectedCabin.type}</div>
                  <div className="text-amber-400 font-semibold text-[11px] mt-0.5">${selectedCabin.basePrice} USD / noche</div>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="p-4 bg-stone-900/90 rounded-2xl border border-stone-700/80 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>{selectedCabin?.name} ({nights} noches)</span>
                <span>${rawTotal} USD</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Descuento Reserva Directa (-15%)</span>
                <span>-${discountAmount} USD</span>
              </div>
              <div className="border-t border-stone-800 pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Estadía</span>
                <span className="text-amber-400 font-mono text-base">${finalTotal} USD</span>
              </div>
              <div className="pt-2 border-t border-stone-800/80 flex justify-between text-stone-300 text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  Seña a transferir hoy (50%)
                </span>
                <span className="text-emerald-400 font-mono">${depositAmount} USD</span>
              </div>
              <div className="text-[10px] text-stone-400 text-right">
                Saldo restante al ingresar en la cabaña: ${balanceOnArrival} USD
              </div>
            </div>

            {/* Form */}
            {!bookingConfirmed ? (
              <form onSubmit={handleBook} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Gómez"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: +54 9 11 5555-8888"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Reservar con 15% Descuento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>¡Pre-Reserva Generada!</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  Para congelar tu fecha, transfiere la seña de <strong>${depositAmount} USD</strong> (o equivalente en pesos al cambio oficial):
                </p>

                <div className="p-3 bg-stone-900 rounded-xl font-mono text-[11px] space-y-1 text-stone-300 border border-stone-800">
                  <div>Alias: <strong className="text-amber-400">{guideData.directBookingSettings.bankAlias}</strong></div>
                  <div>CBU: <strong className="text-stone-200">{guideData.directBookingSettings.cbu}</strong></div>
                  <div>Banco: <strong>{guideData.directBookingSettings.bankName}</strong></div>
                  <div>Titular: <strong>{guideData.directBookingSettings.accountHolder}</strong></div>
                </div>

                <a
                  href={`https://wa.me/${guideData.hostPhone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar Comprobante a Fernando por WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
