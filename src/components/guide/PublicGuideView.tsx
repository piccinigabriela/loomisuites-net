import { PreCheckinCard } from './PreCheckinCard';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GuestWelcomePortal, PortalTheme } from './GuestWelcomePortal';
import { WelcomeGuideData } from '../../types';

export const PublicGuideView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [guideDoc, setGuideDoc] = useState<{
    guide: WelcomeGuideData;
    template: PortalTheme;
    units: Array<{ id: string; name: string; address?: string; wifiNetwork?: string; wifiPassword?: string }>;
  } | null>(null);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  // Extract uid and propertyId from /guia/{uid}/{propertyId}
  const parts = pathname.split('/').filter(Boolean);
  // parts[0] is "guia"
  const uid = parts[1] || '';
  const propertyId = parts[2] || '';

  useEffect(() => {
    if (!uid || !db) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchGuide = async () => {
      try {
        const ref = doc(db, 'publicGuides', uid);
        const snap = await getDoc(ref);
        if (isMounted) {
          if (snap.exists()) {
            setGuideDoc(snap.data() as any);
          } else {
            setGuideDoc(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error fetching public guide:', err);
        if (isMounted) {
          setGuideDoc(null);
          setLoading(false);
        }
      }
    };

    fetchGuide();
    return () => {
      isMounted = false;
    };
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0F12] flex items-center justify-center p-4">
        <div className="text-stone-600 dark:text-stone-300 text-sm font-light flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando tu guía…</span>
        </div>
      </div>
    );
  }

  if (!guideDoc) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0F12] flex items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white dark:bg-[#18191E] p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-100">Esta guía no está disponible</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">Consultá con tu anfitrión.</p>
        </div>
      </div>
    );
  }

  const { guide, template, units = [] } = guideDoc;
  const searchParams = new URLSearchParams(search);
  const unidadParam = searchParams.get('unidad');

  const matchedUnit = propertyId ? units.find((u) => u.id === propertyId) : null;
  const unitName = unidadParam || matchedUnit?.name || undefined;

  const mergedGuide: WelcomeGuideData = { ...guide };
  if (matchedUnit) {
    if (matchedUnit.wifiNetwork) mergedGuide.wifiNetwork = matchedUnit.wifiNetwork;
    if (matchedUnit.wifiPassword) mergedGuide.wifiPassword = matchedUnit.wifiPassword;
    if (matchedUnit.address) mergedGuide.locationAddress = matchedUnit.address;
  }

  const reservationParam = searchParams.get('res') || '';
  const guestParam = searchParams.get('huesped') || '';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0F12] py-4 sm:py-8 px-2 sm:px-4">
      {reservationParam && uid && (
        <PreCheckinCard
          hostUid={uid}
          reservationId={reservationParam}
          defaultName={guestParam}
          rules={guide?.rules || []}
        />
      )}
      <GuestWelcomePortal
        guideData={mergedGuide}
        template={template || 'dos-aguas'}
        isPublicView={true}
        unitName={unitName}
      />
    </div>
  );
};
