/**
 * Diseños especiales de Tu Web con estructura propia (no solo colores).
 * Para sumar uno: su componente acá, su id en SiteTheme y SPECIAL_THEMES (lib/publicSite.ts) y en el selector de TuWebSettings.
 */
import type React from 'react';
import type { SiteViewProps } from '../siteKit';
import { RefugioSite } from './Refugio';
import { EstudioSite } from './Estudio';

export const SPECIAL_LAYOUTS: Partial<Record<string, React.FC<SiteViewProps>>> = {
  refugio: RefugioSite,
  estudio: EstudioSite,
};
