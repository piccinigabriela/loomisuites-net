import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Home,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Wifi,
  KeyRound,
  DollarSign,
  Users,
  Bed,
  Bath,
  ShoppingBag,
  Layers,
  MapPin,
  Clock,
  X,
  Compass,
} from 'lucide-react';
import { DemoState, Property, AddonService, WelcomeGuideData } from '../../types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newComplexState: {
    complexName: string;
    city: string;
    address: string;
    wifiNetwork: string;
    wifiPassword: string;
    properties: Property[];
    addons: AddonService[];
  }) => void;
}

interface TempProperty {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  cleaningFee: number;
  hasSmartLock: boolean;
  smartLockBrand: string;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Complex info
  const [complexName, setComplexName] = useState('Mis Departamentos Reales');
  const [city, setCity] = useState('Buenos Aires, Argentina');
  const [address, setAddress] = useState('Av. Corrientes 1234');
  const [wifiNetwork, setWifiNetwork] = useState('MiComplejo_Wifi_5G');
  const [wifiPassword, setWifiPassword] = useState('Bienvenido2026');
  const [hostName, setHostName] = useState('Administración');
  const [hostPhone, setHostPhone] = useState('+54 9 11 1234-5678');

  // Step 2: Units / Properties
  const [units, setUnits] = useState<TempProperty[]>([
    {
      id: 'unit-1',
      name: 'Depto 101 - 2 Ambientes',
      type: 'Departamento luminoso con balcón y cocina completa',
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      basePrice: 60,
      cleaningFee: 20,
      hasSmartLock: true,
      smartLockBrand: 'Cerradura Digital Teclado / Tuya / TTlock',
    },
    {
      id: 'unit-2',
      name: 'Depto 102 - Monoambiente Studio',
      type: 'Estudio moderno equipado para ejecutivos o parejas',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      basePrice: 45,
      cleaningFee: 15,
      hasSmartLock: false,
      smartLockBrand: 'Llave física tradicional',
    },
  ]);

  // Step 3: Addons
  const [selectedAddonPresets, setSelectedAddonPresets] = useState<{
    transfers: boolean;
    frigobar: boolean;
    desayuno: boolean;
    cochera: boolean;
    lateCheck: boolean;
  }>({
    transfers: true,
    frigobar: true,
    desayuno: false,
    cochera: true,
    lateCheck: true,
  });

  if (!isOpen) return null;

  const handleAddUnit = () => {
    const nextNum = units.length + 1;
    const newUnit: TempProperty = {
      id: `unit-${Date.now()}`,
      name: `Departamento / Cabaña ${nextNum}`,
      type: 'Unidad totalmente equipada',
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      basePrice: 50,
      cleaningFee: 15,
      hasSmartLock: true,
      smartLockBrand: 'Cerradura Digital Teclado',
    };
    setUnits([...units, newUnit]);
  };

  const handleRemoveUnit = (id: string) => {
    if (units.length <= 1) {
      alert('Debes tener al menos 1 unidad para configurar tu complejo.');
      return;
    }
    setUnits(units.filter((u) => u.id !== id));
  };

  const handleUpdateUnit = (id: string, updates: Partial<TempProperty>) => {
    setUnits(units.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const handleFinishOnboarding = () => {
    // Generate standard Property objects
    const finalProperties: Property[] = units.map((u, idx) => ({
      id: `prop-real-${idx + 1}`,
      name: u.name,
      type: u.type,
      address,
      neighborhood: 'Centro / Zona Residencial',
      city,
      bedrooms: Number(u.bedrooms) || 1,
      bathrooms: Number(u.bathrooms) || 1,
      maxGuests: Number(u.maxGuests) || 2,
      basePrice: Number(u.basePrice) || 50,
      cleaningFee: Number(u.cleaningFee) || 15,
      imageUrl: idx % 2 === 0 ? '/cabanas/cabana-terraza.jpg' : '/cabanas/deck-hamaca.jpg',
      rating: 5.0,
      reviewsCount: 12,
      status: 'active',
      syncStatus: { airbnb: true, booking: true, vrbo: false },
      smartLock: {
        enabled: u.hasSmartLock,
        brand: u.hasSmartLock ? u.smartLockBrand : 'Llave física tradicional (Sin cerradura digital)',
      },
      wifiNetwork,
      wifiPassword,
    }));

    // Build Addons
    const finalAddons: AddonService[] = [];
    if (selectedAddonPresets.transfers) {
      finalAddons.push({
        id: 'addon-transfers-custom',
        name: 'Transfer Aeropuerto / Terminal',
        category: 'transfers',
        price: 25,
        unitLabel: 'por viaje',
        description: 'Traslado privado directo coordinado con la llegada o salida del huésped.',
      });
    }
    if (selectedAddonPresets.frigobar) {
      finalAddons.push({
        id: 'addon-frigobar-custom',
        name: 'Vino de Bienvenida + Bebidas Frías',
        category: 'frigobar',
        price: 15,
        unitLabel: 'por pack',
        description: 'Bebidas frescas y snacks listos en el refrigerador al momento del check-in.',
      });
    }
    if (selectedAddonPresets.cochera) {
      finalAddons.push({
        id: 'addon-cochera-custom',
        name: 'Cochera / Estacionamiento Techado',
        category: 'experiencias',
        price: 10,
        unitLabel: 'por noche',
        description: 'Lugar exclusivo techado y con portón automatizado.',
      });
    }
    if (selectedAddonPresets.desayuno) {
      finalAddons.push({
        id: 'addon-desayuno-custom',
        name: 'Canasta de Desayuno Seco / Fresco',
        category: 'desayuno',
        price: 12,
        unitLabel: 'por persona / día',
        description: 'Panificados caseros, mermeladas, café y jugo fresco entregado por la mañana.',
      });
    }

    onComplete({
      complexName,
      city,
      address,
      wifiNetwork,
      wifiPassword,
      properties: finalProperties,
      addons: finalAddons,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#181818] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#2e2a26] overflow-hidden flex flex-col max-h-[90vh] transition-colors text-[#e2ded9]">
        {/* Header */}
        <div className="bg-[#141414] text-white p-5 flex items-center justify-between border-b border-[#282522] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c46d45] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-2">
                <span>Configurar Mis Departamentos / Cabañas</span>
                <span className="text-[10px] bg-[#3a271e] text-[#e89f78] font-semibold px-2 py-0.5 rounded-full border border-[#5a3a2a]">
                  Paso a Paso
                </span>
              </h3>
              <p className="text-xs text-[#9e9a94]">
                Paso {currentStep} de 3 — En 3 minutos tienes todo tu complejo listo para operar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8e8a84] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-[#161616] border-b border-[#282522] px-6 py-3 shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  currentStep >= 1
                    ? 'bg-[#c46d45] text-white'
                    : 'bg-[#282828] text-[#8e8a84]'
                }`}
              >
                1
              </span>
              <span className="text-xs font-bold text-[#dcd8d2]">Datos Complejo</span>
            </div>
            <div className="w-10 h-0.5 bg-[#2c2825]"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  currentStep >= 2
                    ? 'bg-[#c46d45] text-white'
                    : 'bg-[#282828] text-[#8e8a84]'
                }`}
              >
                2
              </span>
              <span className="text-xs font-bold text-[#dcd8d2]">Unidades ({units.length})</span>
            </div>
            <div className="w-10 h-0.5 bg-[#2c2825]"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  currentStep >= 3
                    ? 'bg-[#c46d45] text-white'
                    : 'bg-[#282828] text-[#8e8a84]'
                }`}
              >
                3
              </span>
              <span className="text-xs font-bold text-[#dcd8d2]">Servicios & Extras</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Complex Basics */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#f4eee7] dark:bg-[#2c221a] p-3.5 rounded-xl border border-[#e4d6c9] dark:border-[#533928] text-xs text-[#9c512a] dark:text-[#d88d5e]">
                <p className="font-semibold">
                  Ingresa el nombre de tu complejo o grupo de departamentos y los datos de acceso para tus huéspedes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre de tu Complejo / Alojamiento:
                </label>
                <input
                  type="text"
                  value={complexName}
                  onChange={(e) => setComplexName(e.target.value)}
                  placeholder="Ej: Departamentos Palermo Suites / Cabañas El Pinar"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ciudad / Localidad:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Buenos Aires, Bariloche, Mendoza..."
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Dirección física:
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Av. Santa Fe 2345"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Wifi Setup */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <Wifi className="w-4 h-4 text-[#c46d45] dark:text-[#d88d5e]" />
                  <span>WiFi para la Guía Digital del Huésped</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Nombre de Red WiFi (SSID):
                    </label>
                    <input
                      type="text"
                      value={wifiNetwork}
                      onChange={(e) => setWifiNetwork(e.target.value)}
                      placeholder="MiComplejo_Wifi"
                      className="w-full text-xs font-medium p-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Contraseña WiFi:
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="clave1234"
                      className="w-full text-xs font-medium p-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Manage Units / Properties */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#e8e5e0]">
                    Carga tus departamentos o cabañas individuales
                  </h4>
                  <p className="text-[11px] text-[#9c9994]">
                    Configura la capacidad, tarifa base por noche y si tienen cerradura digital o llave física.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="flex items-center gap-1 text-xs font-bold text-[#d88d5e] hover:text-[#f0a578] bg-[#2e241e] hover:bg-[#3d2f26] px-3 py-1.5 rounded-lg border border-[#523d2e] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Otra Unidad</span>
                </button>
              </div>

              <div className="space-y-3">
                {units.map((unit, idx) => (
                  <div
                    key={unit.id}
                    className="p-3.5 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#2c2c2c] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#2a2622] text-[11px] font-bold text-[#d88d5e] flex items-center justify-center border border-[#48372b]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={unit.name}
                          onChange={(e) => handleUpdateUnit(unit.id, { name: e.target.value })}
                          placeholder="Nombre o Número de Unidad"
                          className="text-xs font-bold text-[#f0eeeb] bg-transparent border-b border-dashed border-[#444] focus:outline-none focus:border-[#d88d5e]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(unit.id)}
                        className="text-[#888] hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Eliminar unidad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e8c87] mb-0.5">
                          Capacidad máx:
                        </label>
                        <div className="flex items-center gap-1 bg-[#181818] px-2 py-1.5 rounded-lg border border-[#333]">
                          <Users className="w-3.5 h-3.5 text-[#777]" />
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={unit.maxGuests}
                            onChange={(e) => handleUpdateUnit(unit.id, { maxGuests: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-transparent focus:outline-none text-[#e0deda]"
                          />
                          <span className="text-[10px] text-[#777]">pax</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e8c87] mb-0.5">
                          Tarifa Base / Noche:
                        </label>
                        <div className="flex items-center gap-1 bg-[#181818] px-2 py-1.5 rounded-lg border border-[#333]">
                          <DollarSign className="w-3.5 h-3.5 text-[#78b37e]" />
                          <input
                            type="number"
                            min="0"
                            value={unit.basePrice}
                            onChange={(e) => handleUpdateUnit(unit.id, { basePrice: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-transparent focus:outline-none text-[#a4cca8]"
                          />
                          <span className="text-[10px] text-[#777]">USD</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e8c87] mb-0.5">
                          Costo Limpieza:
                        </label>
                        <div className="flex items-center gap-1 bg-[#181818] px-2 py-1.5 rounded-lg border border-[#333]">
                          <DollarSign className="w-3.5 h-3.5 text-[#777]" />
                          <input
                            type="number"
                            min="0"
                            value={unit.cleaningFee}
                            onChange={(e) => handleUpdateUnit(unit.id, { cleaningFee: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-transparent focus:outline-none text-[#e0deda]"
                          />
                          <span className="text-[10px] text-[#777]">USD</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e8c87] mb-0.5">
                          Acceso / Cerradura:
                        </label>
                        <select
                          value={unit.hasSmartLock ? 'smart' : 'traditional'}
                          onChange={(e) =>
                            handleUpdateUnit(unit.id, {
                              hasSmartLock: e.target.value === 'smart',
                            })
                          }
                          className="w-full text-[11px] font-semibold p-1.5 rounded-lg border border-[#333] bg-[#181818] text-[#e0deda]"
                        >
                          <option value="smart">🔑 Teclado / Digital</option>
                          <option value="traditional">🗝️ Llave Tradicional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Addons & Extras Selection */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Selecciona los servicios opcionales que ofreces en tu complejo
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Podrás venderlos directamente a los huéspedes o sumarlos a cualquier reserva.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-[#c46d45]/60 dark:hover:border-[#c46d45]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedAddonPresets.cochera}
                    onChange={(e) =>
                      setSelectedAddonPresets({ ...selectedAddonPresets, cochera: e.target.checked })
                    }
                    className="mt-1 rounded text-[#c46d45] focus:ring-[#c46d45]"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      🚗 Cochera / Estacionamiento
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Alquiler diario de cochera techada o privada ($10 USD / noche)
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-[#c46d45]/60 dark:hover:border-[#c46d45]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedAddonPresets.transfers}
                    onChange={(e) =>
                      setSelectedAddonPresets({ ...selectedAddonPresets, transfers: e.target.checked })
                    }
                    className="mt-1 rounded text-[#c46d45] focus:ring-[#c46d45]"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      ✈️ Traslados & Transfers
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Búsqueda en aeropuerto o terminal coordinada ($25 USD)
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-[#c46d45]/60 dark:hover:border-[#c46d45]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedAddonPresets.frigobar}
                    onChange={(e) =>
                      setSelectedAddonPresets({ ...selectedAddonPresets, frigobar: e.target.checked })
                    }
                    className="mt-1 rounded text-[#c46d45] focus:ring-[#c46d45]"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      🍷 Frigobar & Bebidas de Bienvenida
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Vinos, cervezas o aguas listas en la heladera ($15 USD)
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-[#c46d45]/60 dark:hover:border-[#c46d45]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedAddonPresets.desayuno}
                    onChange={(e) =>
                      setSelectedAddonPresets({ ...selectedAddonPresets, desayuno: e.target.checked })
                    }
                    className="mt-1 rounded text-[#c46d45] focus:ring-[#c46d45]"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      ☕ Canasta de Desayuno
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Panificados, mermeladas y café para la mañana ($12 USD)
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Todo listo para crear tu espacio real!</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  Al hacer clic en <strong>"Finalizar y Activar Mi Complejo"</strong>, tu panel, calendario, guía digital y tareas de limpieza se inicializarán de forma instantánea con tus <strong>{units.length} unidades reales</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#c46d45] hover:bg-[#b55e37] text-white px-5 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <span>Siguiente: {currentStep === 1 ? 'Cargar Unidades' : 'Servicios Opcionales'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex items-center gap-2 text-xs font-bold bg-[#3e6645] hover:bg-[#34563a] text-white px-6 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Finalizar y Activar Mi Complejo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
