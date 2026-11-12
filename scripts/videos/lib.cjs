// Grabación de la demo para reels: viewport 820×1154 a escala 1080/820 → cuadros de 1080×1520, cursor visible.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = 'http://loomisuite.net';
const W = 820, H = 1458, SCALE = 1080 / 820;

const CURSOR_JS = () => {
  const css = document.createElement('style');
  css.textContent = `div.fixed.bottom-20.right-4{display:none!important}
  #__cur{position:fixed;z-index:2147483647;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;
   background:rgba(255,178,127,.35);border:3px solid #FFB27F;pointer-events:none;transition:transform .12s;left:-100px;top:-100px}
  #__cur.down{transform:scale(.7);background:rgba(255,178,127,.7)}`;
  const add = () => {
    document.head.appendChild(css);
    const c = document.createElement('div'); c.id = '__cur'; document.body.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => c.classList.add('down'), true);
    addEventListener('mouseup', () => c.classList.remove('down'), true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', add); else add();
};

async function open({ url = '/demo', theme = 'dark', storage = {}, w = W, h = H } = {}) {
  const scale = 1080 / w;
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP loomisuite.net 127.0.0.1:4180', '--no-proxy-server', '--lang=es-AR'], env: { ...process.env, LANG: 'es_AR.UTF-8', LANGUAGE: 'es_AR' } });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: theme, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  await ctx.addInitScript((st) => {
    try {
      localStorage.setItem('loomi_theme', st.__theme);
      localStorage.setItem('loomi_demo_welcome_off', 'true');
      localStorage.setItem('loomi_demo_welcome_seen', 'true');
      localStorage.setItem('loomi_hide_demo_plan_bar', 'true');
      for (const [k, v] of Object.entries(st)) if (k !== '__theme') localStorage.setItem(k, v);
    } catch (e) {}
  }, { ...storage, __theme: theme });
  await ctx.addInitScript(CURSOR_JS);
  const page = await ctx.newPage();
  await page.goto(BASE + url);
  await page.waitForTimeout(2500);
  let mx = w / 2, my = h / 2;
  await page.mouse.move(mx, my);

  const frames = [];
  let cdp = null, t0 = 0;
  const marks = {};
  const R = {
    page, browser,
    async start() {
      cdp = await ctx.newCDPSession(page);
      cdp.on('Page.screencastFrame', async (f) => {
        frames.push({ t: f.metadata.timestamp, data: f.data });
        try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
      });
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
      t0 = Date.now() / 1000;
      // fuerza un primer cuadro
      await page.evaluate(() => { document.body.style.outline = '0px solid transparent'; });
    },
    now() { return Date.now() / 1000 - t0; },
    mark(name) { marks[name] = Date.now() / 1000 - t0; },
    wait: (ms) => page.waitForTimeout(ms),
    async moveTo(target, { steps = 28, dx = 0, dy = 0 } = {}) {
      const loc = typeof target === 'string' ? page.locator(target).first() : target;
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      const b = await loc.boundingBox();
      if (!b) throw new Error('sin caja: ' + target);
      const x = b.x + b.width / 2 + dx, y = b.y + b.height / 2 + dy;
      for (let i = 1; i <= steps; i++) {
        const k = i / steps, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        await page.mouse.move(mx + (x - mx) * e, my + (y - my) * e);
        await page.waitForTimeout(16);
      }
      mx = x; my = y;
      return loc;
    },
    async click(target, opts = {}) {
      await R.moveTo(target, opts);
      await page.waitForTimeout(opts.before ?? 250);
      await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
      await page.waitForTimeout(opts.after ?? 600);
    },
    async type(target, text, { delay = 70, clear = false } = {}) {
      await R.click(target, { after: 200 });
      if (clear) { await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); }
      await page.keyboard.type(text, { delay });
    },
    async scrollTo(target, { block = 'start', ms = 1100 } = {}) {
      const loc = typeof target === 'string' ? page.locator(target).first() : target;
      await loc.evaluate((el, b) => el.scrollIntoView({ behavior: 'smooth', block: b }), block);
      await page.waitForTimeout(ms);
    },
    async scroll(dy, { steps = 30 } = {}) {
      for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await page.waitForTimeout(16); }
      await page.waitForTimeout(250);
    },
    async stop(out) {
      const end = Date.now() / 1000;
      await page.waitForTimeout(300);
      await cdp.send('Page.stopScreencast');
      await browser.close();
      const dir = path.resolve(out + '.frames');
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      let list = '';
      // los cuadros vienen solo cuando algo cambia: cada uno dura hasta el siguiente
      const first = frames[0].t;
      frames.forEach((f, i) => {
        const fn = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
        fs.writeFileSync(fn, Buffer.from(f.data, 'base64'));
        const next = i + 1 < frames.length ? frames[i + 1].t : end;
        list += `file '${fn}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}\n`;
      });
      list += `file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'\n`;
      fs.writeFileSync(dir + '/list.txt', list);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', dir + '/list.txt', '-vf',
        'scale=1080:1920:flags=lanczos,fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', out]);
      const offset = first - t0; // los marks se miden desde start(); el video empieza en el primer cuadro
      const m = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, +(v - offset).toFixed(2)]));
      fs.writeFileSync(out + '.marks.json', JSON.stringify(m, null, 1));
      fs.rmSync(dir, { recursive: true, force: true });
      return m;
    },
  };
  return R;
}

module.exports = { open, BASE };
