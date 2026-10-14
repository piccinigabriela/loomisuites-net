import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { ManualPage } from './components/landing/ManualPage.tsx';
import { isAppMode } from './lib/appMode';

// loomisuite.net/manual: página corta del manual (para links en redes)
const isManualPage = !isAppMode() && /^\/manual\/?$/i.test(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isManualPage ? <ManualPage /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);

