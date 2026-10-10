import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithGooglePopup,
  getAuthErrorMessage,
} from '../../lib/firebase';

interface AppAuthScreenProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AppAuthScreen: React.FC<AppAuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetFormState = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Login with Email & Password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Por favor completá tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Email & Password
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Por favor completá todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verificalas e intentá de nuevo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password via Email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Ingresá tu correo electrónico para que podamos enviarte el enlace de recuperación.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(
        '¡Listo! Te enviamos un enlace para restablecer tu contraseña. Revisá tu bandeja de entrada o spam.'
      );
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google Sign-In with Firebase Popup
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      await signInWithGooglePopup();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(getAuthErrorMessage(err?.code || ''));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient background glow accents matching landing aesthetics */}
      <div className="absolute top-[-15%] left-[20%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[550px] h-[550px] bg-[#E67E22]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar / Brand */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E67E22] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Loomi <span className="text-[#E67E22]">Suite</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              App Oficial
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Acceso seguro encriptado</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Glassmorphic */}
          <div className="bg-[#121622]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl relative">
            
            {/* Header Titles */}
            <div className="text-center space-y-2 mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                <Sparkles className="w-3 h-3 text-[#E67E22]" />
                <span>Panel de Gestión y Operaciones</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                {mode === 'login' && (
                  <>
                    Ingresá a tu <span className="font-semibold text-white">Complejo</span>
                  </>
                )}
                {mode === 'register' && (
                  <>
                    Creá tu <span className="font-semibold text-white">Cuenta</span>
                  </>
                )}
                {mode === 'forgot_password' && (
                  <>
                    Recuperá tu <span className="font-semibold text-white">Contraseña</span>
                  </>
                )}
              </h1>

              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {mode === 'login' && 'Gestioná tus cabañas, reservas y cobros en un solo lugar'}
                {mode === 'register' && 'Comenzá a operar tu complejo de forma profesional y autónoma'}
                {mode === 'forgot_password' && 'Te enviaremos un correo para que puedas crear una nueva contraseña'}
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Message Box */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Google Authentication Button (For Login & Register) */}
            {mode !== 'forgot_password' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs sm:text-sm border border-slate-700/80 transition-all shadow-sm hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  )}
                  <span>Continuar con Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-[#121622] text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                    o con tu correo
                  </span>
                </div>
              </>
            )}

            {/* FORM: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@tucomplejo.com"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => resetFormState('forgot_password')}
                      className="text-[11px] text-[#E67E22] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E67E22] hover:bg-[#d36d16] text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center">
                  <span className="text-xs text-slate-400">
                    ¿Todavía no tenés cuenta?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => resetFormState('register')}
                    className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
                  >
                    Crear cuenta
                  </button>
                </div>
              </form>
            )}

            {/* FORM: REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@tucomplejo.com"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetí tu contraseña"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E67E22] hover:bg-[#d36d16] text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Crear Cuenta e Ingresar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center">
                  <span className="text-xs text-slate-400">
                    ¿Ya tenés una cuenta registrada?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => resetFormState('login')}
                    className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </form>
            )}

            {/* FORM: FORGOT PASSWORD */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Correo electrónico asociado a tu cuenta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@tucomplejo.com"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E67E22] hover:bg-[#d36d16] text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Enviar enlace de recuperación</span>
                  )}
                </button>

                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => resetFormState('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 max-w-7xl mx-auto text-center text-xs text-slate-600">
        <p>Loomi Suite • Sistema Operativo para Alojamientos Temporarios y Complejos Turísticos</p>
      </footer>
    </div>
  );
};
