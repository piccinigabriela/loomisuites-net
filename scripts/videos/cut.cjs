// Corta la grabación en partes de hasta 9,9 s según las marcas. Si una parte dura más, la acelera; si dura menos, congela el último cuadro.
const { execFileSync } = require('child_process');
const MAX = 9.9;
function cut(app, cuts, base) {
  const dur = parseFloat(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0',app]).toString());
  const pts = [...cuts, dur];
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = Math.max(0, pts[i]), b = pts[i + 1], len = b - a;
    const speed = len > MAX ? len / MAX : 1;
    const pad = len < MAX ? MAX - len : 0;
    const vf = `trim=${a}:${b},setpts=(PTS-STARTPTS)/${speed.toFixed(4)},tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)},fps=30,setsar=1,format=yuv420p`;
    const f = `${base}_parte${i + 1}.mp4`;
    execFileSync('ffmpeg', ['-v','error','-y','-i',app,'-vf',vf,'-t',String(MAX),'-an','-c:v','libx264','-preset','veryfast','-crf','17','-movflags','+faststart',f]);
    out.push({ file: f, real: +len.toFixed(2), speed: +speed.toFixed(2) });
  }
  return out;
}
module.exports = { cut };
