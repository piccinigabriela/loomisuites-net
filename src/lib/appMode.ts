/**
 * App Mode detection
 * 
 * Activates when:
 * 1. window.location.hostname starts with 'app.' (e.g. app.loomisuite.net)
 * 2. import.meta.env.VITE_APP_MODE === 'app' (local development)
 * 3. query param ?mode=app or ?app_mode=true (preview testing)
 */
export function isAppMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('app.')) return true;
    if (import.meta.env.VITE_APP_MODE === 'app') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'app' || params.get('app_mode') === 'true') return true;
  } catch {}
  return false;
}
