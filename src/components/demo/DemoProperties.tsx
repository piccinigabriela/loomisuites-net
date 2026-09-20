import React, { useState } from 'react';
import {
  Building2,
  Users,
  Bed,
  Bath,
  Wifi,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  DollarSign,
  Star,
  RefreshCw,
} from 'lucide-react';
import { DemoState, Property } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';

interface DemoPropertiesProps {
  demoState: DemoState;
  onUpdatePropertyPrice: (propertyId: string, newPrice: number) => void;
}

export const DemoProperties: React.FC<DemoPropertiesProps> = ({
  demoState,
  onUpdatePropertyPrice,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handleCopyDirectLink = (propertyId: string) => {
    const link = `https://loomisuite.com/reserva-directa/${propertyId}`;
    copyToClipboard(link);
    setCopiedId(propertyId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSavePrice = (propertyId: string) => {
    if (tempPrice > 0) {
      onUpdatePropertyPrice(propertyId, tempPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-600" />
            <span>Cabañas y Habitaciones ({demoState.properties.length})</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tarifas base, accesos (llaves/cerradura) y enlaces de reserva directa para enviar por WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoState.properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {prop.neighborhood}, {prop.city}
                </div>

                <div className="absolute top-3 right-3 bg-white/95 text-zinc-900 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{prop.rating} ({prop.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-zinc-900 mb-1">{prop.name}</h4>
                <p className="text-xs text-zinc-500 mb-4">{prop.address} • {prop.type}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mb-4 pb-4 border-b border-zinc-100">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    Hasta {prop.maxGuests} huéspedes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-zinc-400" />
                    {prop.bedrooms} hab.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-zinc-400" />
                    {prop.bathrooms} baños
                  </span>
                </div>

                {/* Price editor */}
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">Tarifa por noche</span>
                    {editingPriceId === prop.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 text-xs border rounded bg-white font-bold"
                        />
                        <button
                          onClick={() => handleSavePrice(prop.id)}
                          className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-zinc-900">${prop.basePrice} USD</span>
                        <button
                          onClick={() => {
                            setEditingPriceId(prop.id);
                            setTempPrice(prop.basePrice);
                          }}
                          className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                          title="Editar tarifa"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 font-medium block">Tarifa Limpieza</span>
                    <span className="text-sm font-bold text-zinc-700">${prop.cleaningFee} USD</span>
                  </div>
                </div>

                {/* Smart lock & Wi-Fi details */}
                <div className="space-y-2 text-xs text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      Cerradura inteligente:
                    </span>
                    <span className="font-semibold text-zinc-800">{prop.smartLock.brand}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Wifi className="w-3.5 h-3.5 text-purple-600" />
                      Wi-Fi Huéspedes:
                    </span>
                    <span className="font-mono text-zinc-800">{prop.wifiNetwork}</span>
                  </div>
                </div>

                {/* Sync Channels Status */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 text-[11px]">Sincronización activa:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.airbnb ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-400'}`}>
                      Airbnb
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.booking ? 'bg-blue-100 text-blue-800' : 'bg-zinc-100 text-zinc-400'}`}>
                      Booking
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.syncStatus.vrbo ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-100 text-zinc-400'}`}>
                      VRBO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-600 font-medium truncate">
                Web directa (0% comisiones)
              </span>
              <button
                onClick={() => handleCopyDirectLink(prop.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {copiedId === prop.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace Directo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
