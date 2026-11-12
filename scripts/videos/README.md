# Grabación de pantallas para los videos de Loomi

Videos verticales 1080×1920, mudos, en partes de 9,9 s (Flow genera voces de hasta 10 s; Gabi pone la voz después).
Se graban sobre la demo, con un cursor naranja visible, en modo oscuro y en español (fechas día/mes).

## Cómo se usa
1. En la raíz del repo: `npm run build` (la demo sale de `dist/`).
2. Servidor: `setsid nohup node scripts/videos/srv.cjs &` (sirve `dist/` en el puerto 4180).
   Chromium abre `http://loomisuite.net` y lo manda a ese servidor (así los links de la demo dicen loomisuite.net).
3. Desde esta carpeta: `NODE_PATH=$(npm root -g) node r01-pedir-pago.cjs` → `videos-out/Loomi_pedir-pago_parte1..3.mp4`.

## Piezas
- `lib.cjs`: `open({url, w, h})` abre la demo (por defecto 820×1458 = tablet; Limpieza usa 390×693, celular) y graba con el
  screencast de Chrome. Métodos: `start`, `mark(nombre)`, `click`, `moveTo`, `type`, `scroll`, `scrollTo`, `wait`, `stop(archivo)`.
- `cut.cjs`: `cut(video, [0, m.b, m.c], base)` corta en partes de 9,9 s: si una parte dura más la acelera, si dura menos congela el final.
  Que ninguna parte pase de ~12 s reales (más de 1,3× se nota apurado).
- `compose.cjs`: versión con texto grande arriba y cierre "Probá la demo" (la primera prueba; Gabi eligió sin texto).
- `setup.cjs`: `createDirect` carga una reserva directa antes de grabar (lo que pasa antes de `start()` no sale en el video).
- `r01`…`r11`: un guion por tema (pedir pago, cerradura, facturar, huéspedes, informes, checklist, diseños, nota de check-in,
  orígenes, opcionales, roles). Cada uno marca dónde empieza cada parte; los textos para Flow están en la conversación con Gabi
  y deberían coincidir con lo que muestra cada parte (~20 palabras por parte).

## Cuidados
- Si cambia una pantalla, el guion puede fallar (no encuentra un botón): mirar el error, sacar una captura y ajustar el selector.
- Revisar cada video con una tira de cuadros: `ffmpeg -i x.mp4 -vf "fps=1/2.5,scale=240:-1,tile=12x1" -frames:v 1 tira.jpg`.
- En la demo no aparecen Xenia para huéspedes ni Equipo y accesos: esos se graban en la app real (Gabi, desde el celular).
