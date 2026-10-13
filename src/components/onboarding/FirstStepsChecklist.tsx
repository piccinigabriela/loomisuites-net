import React from 'react';
import {
  CheckCircle2,
  Circle,
  Building2,
  Home,
  Calendar,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight,
  EyeOff,
  Check,
} from 'lucide-react';
import { WelcomeGuideData, Property, Reservation } from '../../types';

interface FirstStepsChecklistProps {
  welcomeGuide?: WelcomeGuideData;
  properties: Property[];
  reservations: Reservation[];
  onboardingChecklist?: {
    calendarios?: boolean;
    guia?: boolean;
    diaADia?: boolean;
  };
  checklistDismissed?: boolean;
  onOpenOnboarding: () => void;
  onNavigateToProperties: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToGuide: () => void;
  onUpdateChecklist: (update: { calendarios?: boolean; guia?: boolean; diaADia?: boolean }) => void;
  onDismissChecklist: () => void;
}

export const FirstStepsChecklist: React.FC<FirstStepsChecklistProps> = ({
  welcomeGuide,
  properties = [],
  reservations = [],
  onboardingChecklist = {},
  checklistDismissed = false,
  onOpenOnboarding,
  onNavigateToProperties,
  onNavigateToCalendar,
  onNavigateToGuide,
  onUpdateChecklist,
  onDismissChecklist,
}) => {
  if (checklistDismissed) {
    return null;
  }

  // 1. Tu complejo
  const isComplexDone = Boolean(
    welcomeGuide?.propertyName &&
      welcomeGuide.propertyName.trim() !== '' &&
      welcomeGuide.propertyName.trim() !== 'Mi Complejo' &&
      welcomeGuide.propertyName.trim() !== 'Mi complejo' &&
      welcomeGuide?.locationAddress &&
      welcomeGuide.locationAddress.trim() !== ''
  );

  // 2. Tus unidades
  const isUnitsDone = properties.length > 0;

  // 3. Tus calendarios
  const hasSyncConfigured = properties.some(
    (p) =>
      Boolean(p.syncStatus?.airbnb || p.syncStatus?.booking || p.syncStatus?.vrbo || p.icalGoogleUrl)
  );
  const isCalendarsDone = Boolean(onboardingChecklist.calendarios || hasSyncConfigured);

  // 4. Tus reservas
  const isReservationsDone = reservations.length > 0;

  // 5. La guía de tus huéspedes
  const isGuideConfigured = Boolean(
    welcomeGuide?.hostPhone &&
      welcomeGuide.hostPhone.trim() !== '' &&
      welcomeGuide?.wifiNetwork &&
      welcomeGuide.wifiNetwork.trim() !== ''
  );
  const isGuideDone = Boolean(onboardingChecklist.guia || isGuideConfigured);

  // 6. Tu día a día
  const isDailyDone = Boolean(onboardingChecklist.diaADia);

  const steps = [
    {
      id: 'complex',
      num: '1',
      title: 'Tu complejo',
      subtitle: 'Configurá el nombre, dirección y horarios de check-in / check-out',
      icon: Building2,
      isDone: isComplexDone,
      actionText: 'Configurar complejo',
      onAction: onOpenOnboarding,
    },
    {
      id: 'units',
      num: '2',
      title: 'Tus unidades',
      subtitle: 'Registrá tus cabañas o departamentos con capacidad y fotos',
      icon: Home,
      isDone: isUnitsDone,
      actionText: 'Configurar unidades',
      onAction: onNavigateToProperties,
    },
    {
      id: 'calendars',
      num: '3',
      title: 'Tus calendarios',
      subtitle: 'Sincronizá Airbnb y Booking para evitar doble reserva',
      icon: Calendar,
      isDone: isCalendarsDone,
      actionText: 'Unidades & Calendarios',
      onAction: onNavigateToProperties,
      secondaryText: 'No uso Airbnb/Booking',
      onSecondary: () => onUpdateChecklist({ calendarios: true }),
    },
    {
      id: 'reservations',
      num: '4',
      title: 'Tus reservas',
      subtitle: 'Cargá las reservas confirmadas para ver tu ocupación',
      icon: Calendar,
      isDone: isReservationsDone,
      actionText: 'Ver Ocupación',
      onAction: onNavigateToCalendar,
    },
    {
      id: 'guide',
      num: '5',
      title: 'La guía de tus huéspedes',
      subtitle: 'Personalizá el teléfono de WhatsApp y datos de Wi-Fi',
      icon: BookOpen,
      isDone: isGuideDone,
      actionText: 'Tu Web & Guía',
      onAction: onNavigateToGuide,
      secondaryText: 'Listo',
      onSecondary: () => onUpdateChecklist({ guia: true }),
    },
    {
      id: 'daily',
      num: '6',
      title: 'Tu día a día',
      subtitle: 'El Panel Hoy te muestra ingresos, salidas, limpiezas y cobros',
      icon: Clock,
      isDone: isDailyDone,
      secondaryText: 'Entendido',
      onSecondary: () => onUpdateChecklist({ diaADia: true }),
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPercent = Math.round((completedCount / 6) * 100);
  const isAllDone = completedCount === 6;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-amber-500/25 dark:border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-md space-y-4 font-sans text-stone-900 dark:text-zinc-100 transition-colors mb-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#E67E22]/15 text-[#E67E22] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-stone-900 dark:text-white">
              Primeros pasos · {completedCount} de 6 completados
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Completá esta guía inicial para tener tu complejo operando al 100%.
          </p>
        </div>

        <button
          onClick={onDismissChecklist}
          className="text-xs text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          title="Ocultar esta lista de primeros pasos"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Ocultar por ahora</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#E67E22] to-amber-500 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* All Done Banner */}
      {isAllDone && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>¡Tu complejo está listo! 🎉</span>
          </div>
          <button
            onClick={onDismissChecklist}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
          >
            Ocultar
          </button>
        </div>
      )}

      {/* 6 Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                step.isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-stone-800 dark:text-zinc-200'
                  : 'bg-stone-50/80 dark:bg-zinc-800/60 border-stone-200/80 dark:border-zinc-700/60 text-stone-900 dark:text-zinc-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {step.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-xs flex items-center gap-1.5">
                      <span className="opacity-60">{step.num}.</span>
                      <span>{step.title}</span>
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/50 dark:border-zinc-700/50">
                {step.onAction && (
                  <button
                    onClick={step.onAction}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-zinc-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>{step.actionText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {step.secondaryText && step.onSecondary && !step.isDone && (
                  <button
                    onClick={step.onSecondary}
                    className="px-3 py-1.5 rounded-xl bg-stone-200/80 dark:bg-zinc-700 hover:bg-stone-300 dark:hover:bg-zinc-600 text-stone-700 dark:text-zinc-200 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{step.secondaryText}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
