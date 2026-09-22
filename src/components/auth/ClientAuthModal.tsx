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
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';
import {
  saveRegisteredAccountToCloud,
  findRegisteredAccountInCloud,
  findComplexByAdminEmailInCloud,
  loadComplexFromCloud,
} from '../../lib/firebase';
import { saveDemoState } from '../../data/initialData';

export interface ComplexProfile {
  id: string;
  name: string;
  type: string;
  city: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  password?: string;
  authProvider?: 'password' | 'google';
  createdAt: string;
}

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplex: (complexId: string, isNew?: boolean) => void;
  onOpenDemo: () => void;
  currentComplexId?: string;
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectComplex,
  onOpenDemo,
  currentComplexId = 'default',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Registration form
  const [fullName, setFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [complexName, setComplexName] = useState('');
  const [complexType, setComplexType] = useState('deptos');
  const [city, setCity] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Retrieve saved complexes / registered users from localStorage
  const getSavedComplexes = (): ComplexProfile[] => {
    try {
      const raw = localStorage.getItem('loomi_registered_complexes');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [
      {
        id: 'catalinas',
        name: 'Catalinas Apartamentos',
        type: 'Departamentos Turísticos',
        city: 'Buenos Aires, CABA',
        adminName: 'Administración Catalinas',
        adminEmail: 'contacto@catalinas.com',
        authProvider: 'password',
        createdAt: new Date().toISOString(),
      },
    ];
  };

  const savedComplexes = getSavedComplexes();

  // Handler: Register New Account & Complex
  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!fullName.trim()) {
        setErrorMsg('Por favor ingresá tu nombre y apellido.');
        setIsLoading(false);
        return;
      }

      if (!adminEmail.trim() || !adminEmail.includes('@')) {
        setErrorMsg('Ingresá un correo electrónico válido para tu cuenta.');
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }

      if (!complexName.trim()) {
        setErrorMsg('Por favor ingresá el nombre de tu complejo o alojamiento.');
        setIsLoading(false);
        return;
      }

      // Check if user already exists in local or cloud
      const existingLocal = savedComplexes.find(
        (c) => c.adminEmail?.toLowerCase() === adminEmail.trim().toLowerCase()
      );
      if (existingLocal) {
        setErrorMsg('Ya existe una cuenta con este correo. Iniciá sesión.');
        setTab('login');
        setLoginEmail(adminEmail.trim());
        setIsLoading(false);
        return;
      }

      const cloudCheck = await findRegisteredAccountInCloud(adminEmail.trim());
      if (cloudCheck) {
        setErrorMsg('Ya existe una cuenta registrada en la nube con este correo. Iniciá sesión.');
        setTab('login');
        setLoginEmail(adminEmail.trim());
        setIsLoading(false);
        return;
      }

      const newId = 'complex-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const typeLabel =
        complexType === 'cabanas'
          ? 'Complejo de Cabañas'
          : complexType === 'deptos'
          ? 'Departamentos Turísticos'
          : complexType === 'posada'
          ? 'Posada & Apart Hotel'
          : 'Hostal / B&B';

      const newProfile: ComplexProfile = {
        id: newId,
        name: complexName.trim(),
        type: typeLabel,
        city: city.trim() || 'Buenos Aires, Argentina',
        adminName: fullName.trim(),
        adminEmail: adminEmail.trim(),
        adminPhone: adminPhone.trim(),
        password,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
      };

      // Save to Cloud Firestore
      await saveRegisteredAccountToCloud(newProfile);

      // Save locally
      const current = getSavedComplexes();
      const updated = [newProfile, ...current.filter((c) => c.id !== newId)];
      localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
      localStorage.setItem('loomi_active_complex', newId);
      localStorage.setItem('loomi_logged_user', JSON.stringify({
        name: fullName.trim(),
        email: adminEmail.trim(),
        complexId: newId,
        complexName: complexName.trim(),
      }));

      setSuccessMsg('¡Cuenta creada exitosamente!');
      onSelectComplex(newId, true);
      onClose();
    } catch (err: any) {
      setErrorMsg('Error al registrar la cuenta: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Google Sign Up / Sign In
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const userEmail = 'piccini.gabriela@gmail.com';
    const userName = 'Gabriela Piccini';
    const cName = complexName.trim() || 'Mis Departamentos';

    try {
      // 1. Search local complexes first
      let matchedProfile = savedComplexes.find((c) => c.adminEmail?.toLowerCase() === userEmail.toLowerCase());

      // 2. If not local, search the registered_complexes cloud registry
      if (!matchedProfile) {
        const cloudAcc = await findRegisteredAccountInCloud(userEmail);
        if (cloudAcc) {
          matchedProfile = cloudAcc;
        }
      }

      // 3. If still not found, do a deep scan fallback in /complexes
      if (!matchedProfile) {
        const deepScanned = await findComplexByAdminEmailInCloud(userEmail);
        if (deepScanned) {
          matchedProfile = {
            id: deepScanned.id,
            name: deepScanned.data?.welcomeGuide?.propertyName || 'Mis Departamentos',
            type: 'Departamentos Turísticos',
            city: deepScanned.data?.welcomeGuide?.locationAddress || 'Buenos Aires, Argentina',
            adminName: userName,
            adminEmail: userEmail,
            authProvider: 'google',
            createdAt: deepScanned.data?.createdAt || new Date().toISOString(),
          };
          // Re-sync account mapping back to Cloud registry
          await saveRegisteredAccountToCloud(matchedProfile);
        }
      }

      // 4. If we found a profile (either local, registry cloud, or deep scanned fallback)
      if (matchedProfile) {
        // Fetch complex state from Cloud Firestore
        const cloudState = await loadComplexFromCloud(matchedProfile.id);
        if (cloudState) {
          // Sync state to local storage so the phone gets her exact desktop data!
          saveDemoState(cloudState, matchedProfile.id);
        }

        // Save local session keys
        const current = getSavedComplexes();
        const updated = [matchedProfile, ...current.filter((c) => c.id !== matchedProfile!.id)];
        localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
        localStorage.setItem('loomi_active_complex', matchedProfile.id);
        localStorage.setItem('loomi_logged_user', JSON.stringify({
          name: matchedProfile.adminName || userName,
          email: matchedProfile.adminEmail,
          complexId: matchedProfile.id,
          complexName: matchedProfile.name,
        }));

        setSuccessMsg('¡Bienvenido de vuelta! Sincronizando datos...');
        onSelectComplex(matchedProfile.id, false);
        onClose();
        return;
      }

      // 5. If brand new Google registration
      const newId = 'complex-' + Date.now().toString(36);
      const newProfile: ComplexProfile = {
        id: newId,
        name: cName,
        type: 'Departamentos Turísticos',
        city: 'Buenos Aires, Argentina',
        adminName: userName,
        adminEmail: userEmail,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };

      await saveRegisteredAccountToCloud(newProfile);

      const current = getSavedComplexes();
      const updated = [newProfile, ...current.filter((c) => c.id !== newId)];
      localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
      localStorage.setItem('loomi_active_complex', newId);
      localStorage.setItem('loomi_logged_user', JSON.stringify({
        name: userName,
        email: userEmail,
        complexId: newId,
        complexName: cName,
      }));

      setSuccessMsg('¡Cuenta de Google registrada con éxito!');
      onSelectComplex(newId, true);
      onClose();
    } catch (err: any) {
      setErrorMsg('Error en autenticación Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const emailQuery = loginEmail.trim().toLowerCase();
    if (!emailQuery) {
      setErrorMsg('Ingresá tu correo electrónico registrado.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Search local complexes first
      let matched = savedComplexes.find(
        (c) =>
          (c.adminEmail && c.adminEmail.toLowerCase() === emailQuery) ||
          c.name.toLowerCase().includes(emailQuery) ||
          c.id.toLowerCase() === emailQuery
      );

      // 2. Search cloud registry by email
      if (!matched && emailQuery.includes('@')) {
        const cloudAcc = await findRegisteredAccountInCloud(emailQuery);
        if (cloudAcc) {
          matched = cloudAcc;
        }
      }

      // 3. Search via deep scanning of complexes inside /complexes
      if (!matched) {
        const deepScanned = await findComplexByAdminEmailInCloud(emailQuery);
        if (deepScanned) {
          matched = {
            id: deepScanned.id,
            name: deepScanned.data?.welcomeGuide?.propertyName || 'Mis Departamentos',
            type: 'Departamentos Turísticos',
            city: deepScanned.data?.welcomeGuide?.locationAddress || 'Buenos Aires, Argentina',
            adminName: emailQuery.split('@')[0],
            adminEmail: emailQuery,
            password: '', // cloud matches passwordless or standard
            createdAt: deepScanned.data?.createdAt || new Date().toISOString(),
          };
          await saveRegisteredAccountToCloud(matched);
        }
      }

      if (matched) {
        if (matched.password && loginPassword && matched.password !== loginPassword) {
          setErrorMsg('Contraseña incorrecta. Por favor verificá.');
          setIsLoading(false);
          return;
        }

        // Fetch complex state from Cloud Firestore
        const cloudState = await loadComplexFromCloud(matched.id);
        if (cloudState) {
          saveDemoState(cloudState, matched.id);
        }

        const current = getSavedComplexes();
        const updated = [matched, ...current.filter((c) => c.id !== matched!.id)];
        localStorage.setItem('loomi_registered_complexes', JSON.stringify(updated));
        localStorage.setItem('loomi_active_complex', matched.id);
        localStorage.setItem('loomi_logged_user', JSON.stringify({
          name: matched.adminName || matched.name,
          email: matched.adminEmail || emailQuery,
          complexId: matched.id,
          complexName: matched.name,
        }));

        setSuccessMsg('¡Sincronizando sesión en la nube...');
        onSelectComplex(matched.id, false);
        onClose();
      } else {
        setErrorMsg('No encontramos una cuenta con ese correo. Podés crear tu cuenta en la pestaña "Registrarse".');
      }
    } catch (err: any) {
      setErrorMsg('Error al iniciar sesión: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="client-auth-modal"
        className="bg-[#141414] border border-[#2a2a2a] text-[#f4f2ee] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#252525] flex items-center justify-between bg-gradient-to-r from-[#1c1917] to-[#141414]">
          <div className="flex items-center gap-3">
            <LoomiLogo size="sm" theme="dark" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Acceso a Clientes Loomi Suite
              </h3>
              <p className="text-[11px] text-[#8e8c87]">
                Ingresá con tu cuenta o creá tu usuario para comenzar
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
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                  : 'text-[#8e8c87] hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#2a221b] text-[#d88d5e] shadow-xs border border-[#d88d5e]/30'
                  : 'text-[#8e8c87] hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta (Registro)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* GOOGLE CONTINUATION BUTTON */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#1f1f1f] hover:bg-[#282828] disabled:opacity-50 text-white border border-[#333] hover:border-[#444] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#d88d5e]/30 border-t-[#d88d5e] rounded-full animate-spin" />
                <span>Sincronizando con Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#262626] w-full" />
            <span className="bg-[#141414] px-3 text-[11px] text-[#706c64] uppercase tracking-wider font-semibold absolute">
              o con tu correo
            </span>
          </div>

          {tab === 'login' ? (
            /* TAB: INICIAR SESIÓN */
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#c8c5c0] mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#706c64] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="tunombre@tudominio.com"
                      className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#c8c5c0]">
                      Contraseña
                    </label>
                    <span className="text-[10px] text-[#d88d5e] cursor-pointer hover:underline">
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#706c64] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#706c64] hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#141414] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                      <span>Buscando tu cuenta en la nube...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Ingresar a Mi Panel</span>
                    </>
                  )}
                </button>
              </form>

              {/* Saved accounts in this browser */}
              {savedComplexes.length > 0 && (
                <div className="pt-3 border-t border-[#252525] space-y-2">
                  <label className="text-xs font-semibold text-[#c8c5c0] flex items-center justify-between">
                    <span>Cuentas guardadas en este equipo:</span>
                    <span className="text-[10px] text-[#8e8c87] font-normal">Acceso rápido</span>
                  </label>
                  <div className="space-y-1.5">
                    {savedComplexes.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          localStorage.setItem('loomi_active_complex', c.id);
                          onSelectComplex(c.id, false);
                          onClose();
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          c.id === currentComplexId
                            ? 'bg-[#221c17] border-[#d88d5e]/50 shadow-xs'
                            : 'bg-[#181818] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#2a221b] text-[#d88d5e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d88d5e]/20">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{c.name}</p>
                            <p className="text-[10px] text-[#8e8c87] truncate">
                              {c.adminEmail || `${c.type} • ${c.city}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-[#d88d5e]">
                          <span>Entrar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo fallback */}
              <div className="pt-2 border-t border-[#252525] flex items-center justify-between text-xs text-[#8e8c87]">
                <span>¿Querés explorar antes de registrarte?</span>
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
            </div>
          ) : (
            /* TAB: CREAR CUENTA NUEVA (REGISTRO REAL) */
            <form onSubmit={handleRegisterNew} className="space-y-3.5">
              <div className="bg-[#1c1a18] border border-[#2c221b] rounded-xl p-3 text-xs text-[#c8c5c0] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#d88d5e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Registro de Propietario / Administrador:</strong>
                  <p className="text-[11px] text-[#8e8c87] mt-0.5">
                    Creá tu cuenta de usuario protegida para gestionar tus alquileres y configurar tus departamentos.
                  </p>
                </div>
              </div>

              {/* User: Full Name */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Tu Nombre y Apellido *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#706c64] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Gabriela Piccini"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* User: Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#706c64] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Crear Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#706c64] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#706c64] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Complex Name */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Nombre de tu Complejo o Propiedad *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#706c64] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={complexName}
                    onChange={(e) => setComplexName(e.target.value)}
                    placeholder="Ej: Catalinas Apartamentos, Deptos Centro"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Type & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Tipo de Alojamiento</label>
                  <select
                    value={complexType}
                    onChange={(e) => setComplexType(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d88d5e] focus:outline-hidden cursor-pointer"
                  >
                    <option value="deptos">Departamentos Turísticos</option>
                    <option value="cabanas">Complejo de Cabañas</option>
                    <option value="posada">Posada & Apart Hotel</option>
                    <option value="hostel">Hostal / B&B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Ciudad / Localidad</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#706c64] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej: Buenos Aires, CABA"
                      className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp phone */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1">WhatsApp para Avisos y Recepción</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-[#706c64] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+54 9 11 4455-6677"
                    className="w-full bg-[#181818] border border-[#333333] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#d88d5e] hover:bg-[#c27c4f] disabled:bg-zinc-800 disabled:text-zinc-500 text-[#141414] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#d88d5e]/20"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                      <span>Creando tu cuenta en la nube...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cuenta y Configurar Mis Departamentos</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-[#706c64] leading-relaxed">
                Al registrarte, tus datos quedan protegidos bajo tu cuenta. Podrás iniciar sesión en cualquier momento.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
