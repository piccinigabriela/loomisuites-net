// Arma el reel vertical 1080×1920: franja de texto arriba (400 px) + pantalla grabada (1080×1520) + cierre.
// Uso: compose({ app: 'x.mp4', out: 'reel.mp4', label: 'Pedir pago', captions: [{from, to, text}], endSecs: 3 })
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const BG = '#15161A';

async function renderPngs(items) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 400 } });
  for (const it of items) {
    await p.setViewportSize({ width: 1080, height: it.h || 400 });
    await p.setContent(`<html><body style="margin:0;background:${BG};font-family:Inter,sans-serif;">${it.html}</body></html>`);
    await p.screenshot({ path: it.file });
  }
  await b.close();
}

const captionHtml = (label, text) => `
<div style="height:400px;box-sizing:border-box;padding:46px 64px 0;display:flex;flex-direction:column;gap:22px">
  <div style="display:flex;align-items:center;gap:14px">
    <span style="width:14px;height:14px;border-radius:50%;background:#FF8A5B;display:inline-block"></span>
    <span style="font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#FFB27F">${esc(label)}</span>
  </div>
  <div style="font-size:${text.length > 70 ? 54 : 62}px;line-height:1.16;font-weight:800;color:#FFFFFF;letter-spacing:-.01em">${esc(text)}</div>
</div>`;

const endHtml = (line1, line2) => `
<div style="height:1920px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center;padding:0 80px">
  <div style="font-size:120px;font-weight:800;color:#fff;letter-spacing:-.02em">Loomi<span style="color:#FF8A5B">.</span></div>
  <div style="font-size:64px;font-weight:800;color:#fff;line-height:1.15">${esc(line1)}</div>
  <div style="font-size:52px;font-weight:700;color:#FFB27F">${esc(line2)}</div>
</div>`;

async function compose({ app, out, label, captions, end = ['Probá la demo, sin registrarte', 'loomisuite.net'], endSecs = 3 }) {
  const dir = out + '.parts';
  fs.mkdirSync(dir, { recursive: true });
  const items = captions.map((c, i) => ({ file: path.join(dir, `c${i}.png`), html: captionHtml(label, c.text) }));
  items.push({ file: path.join(dir, 'blank.png'), html: captionHtml(label, '') });
  items.push({ file: path.join(dir, 'end.png'), html: endHtml(end[0], end[1]), h: 1920 });
  await renderPngs(items);
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', app]).toString());
  const args = ['-v', 'error', '-y', '-i', app, '-loop', '1', '-i', path.join(dir, 'blank.png')];
  captions.forEach((_, i) => args.push('-loop', '1', '-i', items[i].file));
  args.push('-loop', '1', '-t', String(endSecs), '-i', path.join(dir, 'end.png'));
  let f = `color=c=${BG}:s=1080x1920:r=30:d=${dur}[bg];[bg][0:v]overlay=0:400[v0];[v0][1:v]overlay=0:0:shortest=1[v1]`;
  let last = 'v1';
  captions.forEach((c, i) => {
    const to = c.to ?? dur;
    f += `;[${last}][${i + 2}:v]overlay=0:0:enable='between(t,${c.from},${to})':shortest=1[w${i}]`;
    last = `w${i}`;
  });
  const endIdx = captions.length + 2;
  f += `;[${last}]trim=0:${dur},setpts=PTS-STARTPTS,format=yuv420p[main];[${endIdx}:v]fps=30,format=yuv420p,fade=t=in:st=0:d=0.4[endv];[main][endv]concat=n=2:v=1[outv]`;
  args.push('-filter_complex', f, '-map', '[outv]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', '30', '-movflags', '+faststart', out);
  execFileSync('ffmpeg', args);
  fs.rmSync(dir, { recursive: true, force: true });
  return dur + endSecs;
}

module.exports = { compose };
