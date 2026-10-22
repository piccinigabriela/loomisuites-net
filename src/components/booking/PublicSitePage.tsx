/**
 * Tu Web publicada: loomisuite.net/web/{nombre} o el dominio propio del complejo.
 * Carga publicSites/{nombre} y sus fotos (lectura pública) y muestra PublicSiteView.
 */
import React, { useEffect, useState } from 'react';
import type { PublicSiteDoc, PublicSitePhoto } from '../../lib/publicSite';
import { fetchPublicSite, fetchSitePhotos, resolveSiteDomain } from '../../lib/publicSiteStore';
import { PublicSiteView } from './PublicSiteView';

/** Nombre del link a partir de la URL: /web/{nombre}. Vacío si es un dominio propio. */
export function slugFromPath(pathname: string): string {
  const m = /^\/web\/([a-z0-9-]+)\/?/i.exec(pathname || '');
  return m ? m[1].toLowerCase() : '';
}

export const PublicSitePage: React.FC<{ slug?: string; customHost?: string }> = ({ slug, customHost }) => {
  const [state, setState] = useState<{ loading: boolean; site: PublicSiteDoc | null; photos: PublicSitePhoto[] }>({
    loading: true,
    site: null,
    photos: [],
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const name = slug || (customHost ? await resolveSiteDomain(customHost) : '');
        if (!name) {
          if (alive) setState({ loading: false, site: null, photos: [] });
          return;
        }
        const [site, photos] = await Promise.all([fetchPublicSite(name), fetchSitePhotos(name).catch(() => [])]);
        if (alive) setState({ loading: false, site, photos });
      } catch (err) {
        console.warn('Tu Web no se pudo cargar:', err);
        if (alive) setState({ loading: false, site: null, photos: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, customHost]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#12100E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8913A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!state.site) {
    return (
      <div className="min-h-screen bg-[#12100E] text-[#F5F0E8] flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <p className="text-xl font-semibold">Esta página no existe.</p>
          <p className="text-base">This page does not exist · Esta página não existe</p>
        </div>
      </div>
    );
  }

  return <PublicSiteView site={state.site} photos={state.photos} />;
};
