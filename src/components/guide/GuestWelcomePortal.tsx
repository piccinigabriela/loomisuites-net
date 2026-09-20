import React, { useState } from 'react';
import {
  MapPin,
  Wifi,
  Navigation,
  ExternalLink,
  Car,
  Compass,
  Utensils,
  ShieldAlert,
  Phone,
  Flame,
  Waves,
  Clock,
  Check,
  Copy,
  Info,
  Calendar,
  Sparkles,
  Ticket,
  ChevronRight,
  Share2,
  Home,
  Camera,
} from 'lucide-react';
import { WelcomeGuideData } from '../../types';

interface GuestWelcomePortalProps {
  guideData: WelcomeGuideData;
  isMobilePreview?: boolean;
}

export const GuestWelcomePortal: React.FC<GuestWelcomePortalProps> = ({
  guideData,
  isMobilePreview = false,
}) => {
  const [activeTab, setActiveTab] = useState<'llegar' | 'cabana' | 'atracciones' | 'comer'>('llegar');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [woodOrdered, setWoodOrdered] = useState(false);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText(guideData.wifiPassword);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  return (
    <div className={`mx-auto bg-stone-900 text-stone-100 min-h-screen ${isMobilePreview ? 'max-w-md rounded-3xl shadow-2xl overflow-hidden border-8 border-stone-800' : 'max-w-4xl rounded-2xl shadow-xl'}`}>
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 p-6 border-b border-stone-800 overflow-hidden">
        {/* Real photo background banner */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/cabanas/cabana-terraza.jpg"
            alt="Wood Cabin Iguazú"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-950/80 to-stone-950" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Portal del Huésped • Guía de Bienvenida
            </span>
            <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 text-[10px]">
              En vivo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
            {guideData.propertyName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {guideData.tagline}
          </p>

          {/* Quick Host Badge */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-800/80 rounded-xl border border-stone-700/60">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                {guideData.hostName[0]}
              </div>
              <div>
                <div className="font-semibold text-white">Anfitrión: {guideData.hostName}</div>
                <div className="text-[11px] text-stone-400">Atención personalizada en el predio</div>
              </div>
            </div>
            <a
              href={`https://wa.me/${guideData.hostPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(guideData.hostName)},%20estoy%20en%20Wood%20Cabin`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Directo</span>
            </a>
          </div>

          {/* Special Announcement if any */}
          {guideData.specialAnnouncement && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{guideData.specialAnnouncement}</p>
            </div>
          )}

          {/* WiFi Fast Access Card */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-stone-800 to-stone-800/90 rounded-xl border border-stone-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Red WiFi</div>
                <div className="font-bold text-white">{guideData.wifiNetwork}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-xs hidden sm:block">
                <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Clave</div>
                <div className="font-mono text-stone-200">{guideData.wifiPassword}</div>
              </div>
              <button
                onClick={copyWifiPassword}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedWifi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Clave</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-md px-4 py-2.5 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('llegar')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'llegar'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Cómo Llegar</span>
        </button>

        <button
          onClick={() => setActiveTab('cabana')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cabana'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Tu Cabaña & Servicios</span>
        </button>

        <button
          onClick={() => setActiveTab('atracciones')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'atracciones'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cataratas & Paseos</span>
        </button>

        <button
          onClick={() => setActiveTab('comer')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'comer'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Dónde Comer & Compras</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 space-y-4">
        {/* TAB 1: CÓMO LLEGAR */}
        {activeTab === 'llegar' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-800/70 rounded-2xl border border-stone-700/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Ubicación Exacta
                </span>
                <a
                  href={guideData.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                {guideData.locationAddress}
              </p>
            </div>

            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider pt-2">
              Modos de Llegada & Traslados
            </h3>

            <div className="space-y-3">
              {guideData.transportation.map((trans) => (
                <div
                  key={trans.id}
                  className="p-4 bg-stone-800/50 hover:bg-stone-800/80 rounded-2xl border border-stone-700/60 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Car className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{trans.title}</span>
                    </h4>
                    {trans.estimatedCost && (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50 shrink-0">
                        {trans.estimatedCost}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {trans.description}
                  </p>
                  {trans.actionUrl && (
                    <div className="pt-1">
                      <a
                        href={trans.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>{trans.actionLabel || 'Ver Información'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CABAÑA & SERVICIOS */}
        {activeTab === 'cabana' && (
          <div className="space-y-4">
            {/* Cabins Photo Gallery */}
            <div className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Nuestras Cabañas (1, 2, 3 y 6)</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Predio Los Bananos</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="group relative rounded-xl overflow-hidden bg-stone-900 border border-stone-700/50">
                  <img
                    src="/cabanas/cabana-terraza.jpg"
                    alt="Cabaña 1"
                    referrerPolicy="no-referrer"
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-stone-900/95">
                    <div className="font-bold text-xs text-white">Cabaña 1</div>
                    <p className="text-[10px] text-stone-400">Hasta 4 pax • Terraza en la Selva</p>
                  </div>
                </div>

                <div className="group relative rounded-xl overflow-hidden bg-stone-900 border border-stone-700/50">
                  <img
                    src="/cabanas/deck-hamaca.jpg"
                    alt="Cabaña 2"
                    referrerPolicy="no-referrer"
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-stone-900/95">
                    <div className="font-bold text-xs text-white">Cabaña 2</div>
                    <p className="text-[10px] text-stone-400">Hasta 5 pax • Deck Familiar</p>
                  </div>
                </div>

                <div className="group relative rounded-xl overflow-hidden bg-stone-900 border border-stone-700/50">
                  <img
                    src="/cabanas/cabana-hamaca.jpg"
                    alt="Cabaña 3"
                    referrerPolicy="no-referrer"
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-stone-900/95">
                    <div className="font-bold text-xs text-white">Cabaña 3</div>
                    <p className="text-[10px] text-stone-400">Parejas • Hamaca paraguaya</p>
                  </div>
                </div>

                <div className="group relative rounded-xl overflow-hidden bg-stone-900 border border-stone-700/50">
                  <img
                    src="/cabanas/jardin-heliconia.jpg"
                    alt="Cabaña 6"
                    referrerPolicy="no-referrer"
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-stone-900/95">
                    <div className="font-bold text-xs text-white">Cabaña 6</div>
                    <p className="text-[10px] text-stone-400">Suite de Troncos • Heliconias</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Check-out</span>
                </div>
                <div className="font-extrabold text-white text-base">{guideData.checkoutHour}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Late check-out sujeto a disponibilidad</div>
              </div>

              <div className="p-3.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <Waves className="w-4 h-4" />
                  <span>Piscina</span>
                </div>
                <div className="font-extrabold text-white text-base">{guideData.poolHours}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Toallones provistos en el placard</div>
              </div>
            </div>

            {/* Firewood Service */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-stone-800 to-stone-800 rounded-2xl border border-amber-600/30 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Leña para Asado & Fogón</span>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Bolsa de leña de monte duro + carbón + iniciador de fuego: <strong>{guideData.woodBagPrice}</strong>
                </p>
              </div>
              <button
                onClick={() => setWoodOrdered(true)}
                disabled={woodOrdered}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  woodOrdered
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
              >
                {woodOrdered ? '✓ Pedida a Fernando' : 'Pedir Leña'}
              </button>
            </div>

            {/* Rules */}
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider pt-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Normas de la Cabaña & Convivencia</span>
            </h3>

            <div className="space-y-2.5">
              {guideData.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-stone-800/40 rounded-xl border border-stone-700/50 text-xs"
                >
                  <h4 className="font-bold text-amber-200 mb-1">{rule.title}</h4>
                  <p className="text-stone-300 leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CATARATAS & QUÉ HACER */}
        {activeTab === 'atracciones' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              💡 <strong>Consejo del Anfitrión (Fernando):</strong> En Cataratas de Argentina las filas para comprar entradas pueden superar los 45 minutos. Compren la entrada con anticipación online para ir directo al molinete de acceso.
            </div>

            <div className="space-y-3">
              {guideData.attractions.map((att) => (
                <div
                  key={att.id}
                  className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{att.title}</h4>
                      <span className="text-[11px] text-stone-400">
                        A {att.distanceMinutes} minutos de Wood Cabin
                      </span>
                    </div>
                    {att.ticketPrice && (
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/40 shrink-0">
                        {att.ticketPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {att.description}
                  </p>
                  <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 text-[11px] text-amber-300/90 leading-snug">
                    {att.tips}
                  </div>
                  {att.officialUrl && (
                    <div className="pt-1">
                      <a
                        href={att.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Comprar Entrada Oficial</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DÓNDE COMER & COMPRAS */}
        {activeTab === 'comer' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Restaurantes & Deliveries a la Cabaña</span>
            </h3>

            <div className="space-y-3">
              {guideData.dining.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                        {item.hasDelivery && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                            🛵 Delivery a Cabaña
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-300 mt-1">{item.specialty}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {item.priceRange}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-700/40">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      {item.address}
                    </span>
                    {item.phone && (
                      <a
                        href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=Hola,%20quería%20hacer%20un%20pedido%20para%20Wood%20Cabin%20Los%20Bananos`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-stone-800 text-[11px] text-stone-500">
        <p>Los Bananos - Wood Cabin Iguazú • Diseñado con Loomi Suite</p>
        <p className="text-[10px] text-stone-600 mt-0.5">
          Guía Digital Autogestionable para Huéspedes
        </p>
      </div>
    </div>
  );
};
