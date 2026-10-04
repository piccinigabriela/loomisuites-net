/**
 * API configuration helper to resolve backend endpoint URLs
 * across local development, Cloudflare Pages, and Google Cloud Run.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If a custom API base URL is provided via environment variable
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');
    return `${baseUrl}${cleanEndpoint}`;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If the frontend is hosted on Cloudflare Pages or custom domain, point to Cloud Run backend
    if (hostname.includes('loomisuite.net') || hostname.includes('pages.dev')) {
      return `https://ais-dev-cvij35elxz36fvviooc5t3-448410991248.us-east5.run.app${cleanEndpoint}`;
    }
  }

  // In local dev, relative path goes through Vite dev proxy
  return cleanEndpoint;
}
