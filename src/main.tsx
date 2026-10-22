import {StrictMode, Suspense, lazy, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { isAppMode } from './lib/appMode';
import { LandingRoot } from './LandingRoot.tsx';

// La app completa (demo, panel, guía, Firebase) se descarga solo cuando hace falta
const App = lazy(() => import('./App.tsx'));
const ManualPage = lazy(() => import('./components/landing/ManualPage.tsx').then((m) => ({ default: m.ManualPage })));
// Tu Web de cada complejo: página liviana, sin la app
const PublicSitePage = lazy(() => import('./components/booking/PublicSitePage.tsx').then((m) => ({ default: m.PublicSitePage })));

const path = window.location.pathname.toLowerCase();
const hash = window.location.hash.toLowerCase();
// Tu Web: /web/{nombre} en cualquier host, o la portada de un dominio propio (un host que no es de Loomi)
const siteSlug = (/^\/web\/([a-z0-9-]+)\/?$/.exec(path) || [])[1] || '';
const host = window.location.hostname.toLowerCase();
const isLoomiHost =
  host === 'loomisuite.net' || host.endsWith('.loomisuite.net') || host.endsWith('.pages.dev') ||
  host === 'localhost' || host === '127.0.0.1' || host === '';
const customSiteHost = !isLoomiHost && (path === '/' || path === '' || path === '/index.html') ? host : '';
// loomisuite.net/manual: página corta del manual (para links en redes)
const isManualPage = !isAppMode() && /^\/manual\/?$/.test(path);
// loomisuite.net a secas: landing liviana (las demás rutas y parámetros siguen yendo a la app)
const isLanding =
  !siteSlug &&
  !customSiteHost &&
  !isAppMode() &&
  (path === '/' || path === '' || path === '/index.html') &&
  !window.location.search &&
  !/app|panel|login|web|limpieza|recepcion|admin|guia|guide/.test(hash);

// index.html esconde la landing prearmada en las páginas que no son la landing (clase no-prerender).
// En cuanto React pinta lo suyo, la landing prearmada ya no está: se vuelve a mostrar el contenido.
function ShowRoot() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('no-prerender');
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShowRoot />
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen w-full bg-[#0B0F17] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#E67E22] border-t-transparent animate-spin" />
          </div>
        }
      >
        {siteSlug || customSiteHost ? (
          <PublicSitePage slug={siteSlug} customHost={customSiteHost} />
        ) : isManualPage ? (
          <ManualPage />
        ) : isLanding ? (
          <LandingRoot />
        ) : (
          <App />
        )}
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
