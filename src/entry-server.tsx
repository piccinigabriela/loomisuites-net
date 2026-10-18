import { renderToString } from 'react-dom/server';
import { LandingRoot } from './LandingRoot';
import { LandingSeoContent } from './components/landing/LandingSeoContent';

/** Se usa solo al compilar (scripts/prerender.mjs): devuelve el HTML de la landing ya armado. */
export function renderLanding(): string {
  return renderToString(
    <>
      <LandingRoot />
      <LandingSeoContent />
    </>,
  );
}
