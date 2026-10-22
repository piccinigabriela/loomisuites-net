/**
 * Prueba rápida de pantallas antes de subir: arma un servidor con lo compilado (dist/),
 * abre las rutas principales en celular y compu, y falla si alguna queda vacía o en negro,
 * tiene errores de JavaScript o se desborda hacia el costado.
 *
 * Uso: npm run build && npm run probar
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const RUTAS = ['/', '/demo', '/recepcion', '/limpieza', '/manual', '/manual?m=fotos', '/?mode=app', '/?tab=direct-booking'];
const VISTAS = [
  { nombre: 'celular', width: 390, height: 844 },
  { nombre: 'compu', width: 1366, height: 860 },
];
// Errores de red de Firebase/Google en local no cuentan: la prueba mira la pantalla, no los datos.
const IGNORAR = /firestore|firebase|googleapis|gstatic|recaptcha|Failed to load resource|net::|ERR_/i;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    // Playwright instalado de forma global (NODE_PATH): import() no lo ve, require sí
    const { createRequire } = await import('node:module');
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    console.error('Falta Playwright: npm i -D playwright (no hace falta bajar navegadores si ya hay Chromium).');
    process.exit(1);
  }
}

const chromePath = process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOpts = existsSync(chromePath) ? { executablePath: chromePath } : {};

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const cerrar = () => { try { server.kill(); } catch {} };

async function esperarServidor() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('El servidor de prueba no arrancó');
}

const fallas = [];
try {
  await esperarServidor();
  const browser = await chromium.launch(launchOpts);
  for (const v of VISTAS) {
    for (const ruta of RUTAS) {
      const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, colorScheme: 'dark' });
      const errores = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !IGNORAR.test(m.text())) errores.push(m.text()); });
      await page.goto(BASE + ruta, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      const { texto, ancho } = await page.evaluate(() => ({
        texto: document.body.innerText.replace(/\s+/g, ' ').trim().length,
        ancho: document.documentElement.scrollWidth,
      }));
      const problemas = [];
      if (texto < 80) problemas.push(`pantalla vacía o en negro (${texto} caracteres visibles)`);
      if (ancho > v.width + 2) problemas.push(`se desborda hacia el costado (${ancho}px)`);
      for (const e of errores.filter((e) => !IGNORAR.test(e)).slice(0, 3)) problemas.push(`error: ${e.slice(0, 160)}`);
      console.log(`${problemas.length ? '✗' : '✓'} ${v.nombre.padEnd(7)} ${ruta}${problemas.length ? '  → ' + problemas.join(' | ') : ''}`);
      if (problemas.length) fallas.push(`${v.nombre} ${ruta}`);
      await page.close();
    }
  }
  await browser.close();
} catch (err) {
  console.error('La prueba no pudo correr:', err?.message || err);
  fallas.push('prueba');
} finally {
  cerrar();
}

if (fallas.length) {
  console.error(`\n${fallas.length} pantalla(s) con problemas. No subir hasta revisarlas.`);
  process.exit(1);
}
console.log('\nTodas las pantallas cargan bien.');
process.exit(0);
