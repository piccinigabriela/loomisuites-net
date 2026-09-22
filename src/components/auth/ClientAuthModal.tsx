import React, { useState } from 'react';
import {
  X,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Play,
  KeyRound,
  ShieldCheck,
  Smartphone,
  MapPin,
  Mail,
  User,
} from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';

export interface ComplexProfile {
  id: string;
  name: string;
  type: string;
  city: string;
  adminEmail?: string;
  adminPhone?: string;
  createdAt: string;
}

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplex: (complexId: string, isNew?: boolean) => void;
  onOpenDemo: () => void;
  onOpenSuperAdmin?: () => void;
  currentComplexId?: string;
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectComplex,
  onOpenDemo,
  onOpenSuperAdmin,
  currentComplexId = 'default',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Registration form
  const [complexName, setComplexName] = useState('');
  const [complexType, setComplexType] = useState('cabanas');
  const [city, setCity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Retrieve saved complexes from localStorage
  const getSavedComplexes = (): ComplexProfile[] => {
    try {
      const raw = localStorage.getItem('loomi_registered_complexes');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [
      {
        id: 'default',
        name: 'Catalinas Apartamentos',
        type: 'Departamentos Turísticos',
        city: 'Buenos Aires, CABA',
        createdAt: new Date().toISOString(),
      },
    ];
  };

  const savedComplexes = getSavedComplexes();

  const handleRegisterNew = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!complexName.trim()) {
      setErrorMsg('Por favor ingresá el nombre de tu complejo o alojamiento.');
      return;
    }

    const newId = 'complex-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const typeLabel =
      complexType === 'cabanas'
        ? 'Complejo de Cabañas'
        : complexType === 'deptos'
        ? 'Departamentos Turísticos'
        : complexType === 'posada'
        ? 'Posada & Aparts'
        : 'Hostal / B&B';

    const newProfile: ComplexProfile = {
      id: newId,
      name: complexName.trim(),
      type: typeLabel,
      city: city.trim() || 'Argentina',
      adminEmail: adminEmail.trim(),
      adminPhone: adminPhone.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const current = getSavedComplexes();
      const updated = [newProfile, ...current.filter((c) => c.id !== newId)];
      localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
      localStorage.setItem('loomi_active_complex', newId);
    } catch {}

    onSelectComplex(newId, true);
    onClose();
  };

  const handleLoginWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = accessCode.trim().toLowerCase();
    if (!query) {
      setErrorMsg('Ingresá el nombre o código de tu complejo.');
      return;
    }

    const matched = savedComplexes.find(
      (c) =>
        c.id.toLowerCase() === query ||
        c.name.toLowerCase().includes(query) ||
        (c.adminEmail && c.adminEmail.toLowerCase() === query)
    );

    if (matched) {
      localStorage.setItem('loomi_active_complex', matched.id);
      onSelectComplex(matched.id, false);
      onClose();
    } else {
      // Auto-create or login with the specified name
      const customId = 'complex-' + query.replace(/[^a-z0-9]/g, '-');
      const customProfile: ComplexProfile = {
        id: customId,
        name: accessCode.trim(),
        type: 'Alojamiento Turístico',
        city: 'Argentina',
        createdAt: new Date().toISOString(),
      };
      const updated = [customProfile, ...savedComplexes];
      localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
      localStorage.setItem('loomi_active_complex', customId);
      onSelectComplex(customId, true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="client-auth-modal"
        className="bg-[#141414] border border-[#2a2a2a] text-[#f4f2ee] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[#252525] flex items-center justify-between bg-gradient-to-r from-[#1c1917] to-[#141414]">
          <div className="flex items-center gap-3">
            <LoomiLogo size="sm" theme="dark" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Acceso a Clientes Loomi Suite
              </h3>
              <p className="text-[11px] text-[#8e8c87]">
                Ingresá a tu panel operativo o registrá tu complejo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#252525] rounded-lg text-[#8e8c87] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4">
          <div className="flex bg-[#1c1c1c] p-1 rounded-xl border border-[#2c2c2c]">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                  : 'text-[#8e8c87] hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ingresar a mi Complejo
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                  : 'text-[#8e8c87] hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Complejo (Self-Onboarding)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {tab === 'login' ? (
            <div className="space-y-4">
              {/* Saved complexes on this browser */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#c8c5c0] flex items-center justify-between">
                  <span>Tus complejos en este dispositivo:</span>
                  <span className="text-[10px] text-[#8e8c87] font-normal">Acceso directo en 1 clic</span>
                </label>
                <div className="space-y-2">
                  {savedComplexes.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        localStorage.setItem('loomi_active_complex', c.id);
                        onSelectComplex(c.id, false);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        c.id === currentComplexId
                          ? 'bg-[#221c17] border-[#d88d5e]/50 shadow-xs'
                          : 'bg-[#181818] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#2a221b] text-[#d88d5e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d88d5e]/20">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-[#8e8c87] truncate">
                            {c.type} • {c.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-[#d88d5e]">
                        <span>Entrar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login with Access Code or Email */}
              <div className="pt-2 border-t border-[#252525]">
                <form onSubmit={handleLoginWithCode} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#c8c5c0] mb-1">
                      O ingresá el nombre / código de tu complejo:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="Ej: Cabañas Los Pinos o admin@micomplejo.com"
                        className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Abrir Mi Panel
                  </button>
                </form>
              </div>

              {/* Demo fallback */}
              <div className="pt-2 border-t border-[#252525] flex items-center justify-between text-xs text-[#8e8c87]">
                <span>¿Aún no tenés complejo activo?</span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenDemo();
                    onClose();
                  }}
                  className="text-[#d88d5e] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Ver Demo Pública
                </button>
              </div>

              {onOpenSuperAdmin && (
                <div className="pt-2 border-t border-[#202020] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSuperAdmin();
                      onClose();
                    }}
                    className="text-[11px] text-[#6d6b67] hover:text-[#e88863] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Acceso Administrador Plataforma (Loomi Master)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Register New Complex Form (Self-Onboarding) */
            <form onSubmit={handleRegisterNew} className="space-y-3.5">
              <div className="bg-[#1c1a18] border border-[#2c221b] rounded-xl p-3 text-xs text-[#c8c5c0] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#d88d5e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Puesta en marcha Self-Onboarding:</strong>
                  <p className="text-[11px] text-[#8e8c87] mt-0.5">
                    Al registrar tu complejo, se abrirá el Asistente en 3 pasos para cargar tus cabañas, fotos y Wi-Fi.
                  </p>
                </div>
              </div>

              {/* Complex Name */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Nombre del Complejo / Alojamiento *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={complexName}
                    onChange={(e) => setComplexName(e.target.value)}
                    placeholder="Ej: Cabañas del Bosque, Posada Santa Lucía, Deptos Centro"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Type & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Tipo de Alojamiento</label>
                  <select
                    value={complexType}
                    onChange={(e) => setComplexType(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d88d5e] focus:outline-hidden"
                  >
                    <option value="cabanas">Complejo de Cabañas</option>
                    <option value="deptos">Departamentos Turísticos</option>
                    <option value="posada">Posada & Apart Hotel</option>
                    <option value="hostel">Hostal / B&B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Ciudad / Localidad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Villa La Angostura, CABA, Bariloche"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Email del Administrador</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@micomplejo.com"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">WhatsApp para Notificaciones</label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+54 9 11 ..."
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#d88d5e]/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Crear Complejo y Comenzar Setup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
