/**
 * Tu Web en la demo (loomisuite.net): la misma página que ve el huésped, armada con los datos de ejemplo.
 */
import React, { useMemo } from 'react';
import type { DemoState } from '../../types';
import { buildPublicSite, buildSiteBusy, PublicSitePhoto } from '../../lib/publicSite';
import { PublicSiteView } from './PublicSiteView';

export const DemoTuWeb: React.FC<{ demoState: DemoState }> = ({ demoState }) => {
  const { site, photos } = useMemo(() => {
    const properties = demoState.properties || [];
    const data = buildPublicSite({
      settings: {
        slug: 'demo',
        enabled: true,
        theme: 'noche',
        description:
          'Cabañas de madera rodeadas de selva, a minutos de las Cataratas. Desayuno casero, pileta y silencio.',
      },
      guide: demoState.welcomeGuide,
      city: 'Puerto Iguazú, Misiones',
      properties,
      pricing: demoState.pricing,
      currency: demoState.currencySettings?.settlementCurrency || 'ARS',
    });
    if (!data.whatsapp) data.whatsapp = '5491100000000';
    const today = new Date().toISOString().slice(0, 10);
    const busy = buildSiteBusy(data.units.map((u) => u.id), demoState.reservations || [], today);
    const list: PublicSitePhoto[] = [];
    const general = ['/cabanas/cataratas.jpg', '/cabanas/piscina.jpg', '/cabanas/jardin-heliconia.jpg', '/cabanas/mate-jardin.jpg'];
    general.forEach((src, i) => list.push({ id: `g${i}`, data: src, order: i, unitId: '' }));
    properties.forEach((p, i) => {
      if (p.imageUrl) list.push({ id: `u${i}`, data: p.imageUrl, order: 100 + i, unitId: p.id });
    });
    return { site: { ...data, busy }, photos: list };
  }, [demoState]);

  return (
    <div className="-mx-3 sm:-mx-6 rounded-2xl overflow-hidden">
      <PublicSiteView site={site} photos={photos} preview />
    </div>
  );
};
