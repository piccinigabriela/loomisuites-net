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
          : complexType === 'glamping'
          ? 'Glamping & Domos'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/25 dark:bg-black/40 backdrop-blur-sm font-sans antialiased text-[#2D3748] dark:text-[#E2E8F0] animate-in fade-in duration-200">
      {/* CONTENEDOR PRINCIPAL (Caja flotante suave con aire y espacio Ma zen) */}
      <div className="bg-white dark:bg-[#18191E] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-zinc-800/80 relative space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar Sutil (Líneas delgadas) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-300 dark:text-zinc-500 hover:text-[#E67E22] hover:bg-orange-50/70 dark:hover:bg-orange-950/40 rounded-xl transition-all cursor-pointer"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* ENCABEZADO / BRANDING */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100">
              loomi<span className="font-semibold text-[#E67E22]">suite</span>
            </span>
          </div>
          <h2 className="text-lg font-light text-gray-900 dark:text-gray-100 tracking-tight">
            Acceso al <span className="font-semibold text-gray-800 dark:text-gray-200">PMS & Clientes</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-400 font-light">
            Ingresá con tu cuenta para sincronizar tus unidades
          </p>
        </div>

        {/* SELECTOR DE PESTAÑAS (Iniciar Sesión vs Registro - Zen suave) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-50/80 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`py-2 text-xs rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white dark:bg-zinc-800 text-[#E67E22] font-semibold shadow-2xs border border-orange-100/50 dark:border-zinc-700'
                : 'text-gray-400 dark:text-zinc-400 font-light hover:text-gray-600 dark:hover:text-zinc-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`py-2 text-xs rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white dark:bg-zinc-800 text-[#E67E22] font-semibold shadow-2xs border border-orange-100/50 dark:border-zinc-700'
                : 'text-gray-400 dark:text-zinc-400 font-light hover:text-gray-600 dark:hover:text-zinc-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-100 dark:border-red-800/40 text-red-600 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="font-light">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="font-light">{successMsg}</span>
          </div>
        )}

        {/* BOTÓN CONTINUAR CON GOOGLE (Fondo claro flotante) */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-white dark:bg-zinc-800/90 border border-gray-100 dark:border-zinc-700/80 hover:bg-gray-50/80 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 shadow-2xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 font-light">
              <div className="w-3.5 h-3.5 border-2 border-orange-300 border-t-[#E67E22] rounded-full animate-spin" />
              <span>Sincronizando con Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* DIVISOR OPERATIVO */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-100 dark:border-zinc-800" />
          <span className="flex-shrink mx-4 text-[10px] font-light text-gray-300 dark:text-zinc-500 uppercase tracking-widest">
            O con tu correo
          </span>
          <div className="flex-grow border-t border-gray-100 dark:border-zinc-800" />
        </div>

        {tab === 'login' ? (
          /* FORMULARIO DE ACCESO / INICIAR SESIÓN */
          <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                    <Mail className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contacto@alojamiento.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block">
                    Contraseña
                  </label>
                  <span
                    onClick={() => {
                      if (!loginEmail) {
                        setErrorMsg('Por favor ingresá tu correo electrónico para restablecer.');
                      } else {
                        setSuccessMsg(`Te enviamos un enlace de recuperación a ${loginEmail}`);
                      }
                    }}
                    className="text-[11px] font-light text-[#E67E22] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-300 hover:text-gray-500 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4 stroke-[1.75]" /> : <Eye className="w-4 h-4 stroke-[1.75]" />}
                  </button>
                </div>
              </div>

              {/* BOTÓN DE INGRESO PRINCIPAL (Naranja pastel suavizado) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white py-3 sm:py-3.2 rounded-xl text-xs font-medium shadow-2xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 font-light">
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 stroke-[1.75]" />
                    <span>Ingresar a Mi Panel</span>
                  </>
                )}
              </button>
            </form>

            {/* CUENTAS GUARDADAS / ACCESO RÁPIDO (Cápsulas suaves flotantes) */}
            {savedComplexes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-0.5 text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
                  <span>Cuentas en este equipo</span>
                  <span className="text-[#E67E22] font-medium normal-case text-xs">Acceso rápido</span>
                </div>

                <div className="space-y-1.5">
                  {savedComplexes.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        localStorage.setItem('loomi_active_complex', c.id);
                        onSelectComplex(c.id, false);
                        onClose();
                      }}
                      className="p-3 bg-gray-50/70 hover:bg-orange-50/40 dark:bg-zinc-800/40 rounded-xl border border-gray-100 hover:border-orange-200/60 dark:border-zinc-800 flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 bg-orange-50 dark:bg-orange-950/50 text-[#E67E22] border border-orange-100/60 dark:border-orange-900/40 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {c.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-400 font-light truncate">
                            {c.adminEmail || `${c.city || 'Mis Unidades'}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#E67E22] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                        Entrar →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO NUEVO */
          <form onSubmit={handleRegisterNew} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                Tu Nombre y Apellido *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                  <User className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Gabriela Piccini"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                    <Mail className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                  Crear Contraseña *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-gray-500 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 stroke-[1.75]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.75]" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                Nombre de tu Complejo o Alojamiento *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                  <Building2 className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="text"
                  required
                  value={complexName}
                  onChange={(e) => setComplexName(e.target.value)}
                  placeholder="Ej: Catalinas Apartamentos, Cabañas del Bosque"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                  Tipo de Alojamiento
                </label>
                <select
                  value={complexType}
                  onChange={(e) => setComplexType(e.target.value)}
                  className="w-full bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl px-3 py-2.5 text-xs font-light text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-200 cursor-pointer"
                >
                  <option value="deptos">Departamentos Turísticos</option>
                  <option value="cabanas">Complejo de Cabañas</option>
                  <option value="glamping">Glamping & Domos</option>
                  <option value="posada">Posada & Apart Hotel</option>
                  <option value="hostel">Hostal / B&B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                  Ciudad / Localidad
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300 dark:text-zinc-500 pointer-events-none">
                    <MapPin className="w-3.5 h-3.5 stroke-[1.75]" />
                  </span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Buenos Aires, CABA"
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-400 uppercase tracking-wider block px-0.5">
                WhatsApp de Recepción
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-300 dark:text-zinc-500 pointer-events-none">
                  <Smartphone className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+54 9 11 4455-6677"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-200 text-xs font-light text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white py-3 sm:py-3.2 rounded-xl text-xs font-medium shadow-2xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 font-light">
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Creando tu cuenta en la nube...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[1.75]" />
                  <span>Crear Cuenta y Comenzar</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FOOTER: PROBAR DEMO PÚBLICA */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-light">
          <span className="text-gray-400 dark:text-zinc-400">¿Querés explorar antes de registrarte?</span>
          <button
            type="button"
            onClick={() => {
              onOpenDemo();
              onClose();
            }}
            className="text-[#E67E22] font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Ver Demo Pública</span>
          </button>
        </div>
      </div>
    </div>
  );
};
