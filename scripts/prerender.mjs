// Después de compilar: arma el HTML de la landing y lo deja dentro de dist/index.html.
// Así quien no ejecuta JavaScript (buscadores, asistentes de IA, vistas previas) lee todo el texto.
// Si algo falla, avisa y deja el index.html como estaba: la landing sigue funcionando igual.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'dist', 'index.html');
const ssrPath = path.join(root, 'dist-ssr', 'entry-server.js');

try {
  const { renderLanding } = await import(pathToFileURL(ssrPath).href);
  const html = renderLanding();
  const index = readFileSync(indexPath, 'utf8');
  if (!index.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div> en dist/index.html');
  if (html.length < 2000) throw new Error('El HTML generado es demasiado corto');
  writeFileSync(indexPath, index.replace('<div id="root"></div>', `<div id="root"><div id="prerendered">${html}</div></div>`));
  console.log(`✔ Landing prearmada en dist/index.html (${Math.round(html.length / 1024)} KB de HTML)`);
} catch (err) {
  console.warn('⚠ No se pudo prearmar la landing; queda la versión normal.', err?.message || err);
} finally {
  rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
}
