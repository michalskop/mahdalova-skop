// Reels / stories video 1080×1920: animace turbín, pak slidy carouselu pro stories 02–08 s plynulými přechody.
// Vstupy: ../social/animace/turbiny-story.mp4 (animation-generator) a ../social/carousel-story/*.png (carousel --story).
// FFMPEG=<cesta k ffmpeg.exe> node reel.cjs   (ffmpeg z tools/media, viz tools/media/README.md)
// → ../social/reels/referenda-vetrniky-reel.mp4 (H.264, 30 fps, bez zvuku)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const S = path.join(__dirname, '..', 'social');
const ANIMACE = path.join(S, 'animace', 'turbiny-story.mp4');
const SLIDY = ['02', '03', '04', '05', '06', '07', '08'].map((n) => path.join(S, 'carousel-story', `${n}.png`));
const OUT = path.join(S, 'reels', 'referenda-vetrniky-reel.mp4');
const FF = process.env.FFMPEG || 'ffmpeg';
const SLIDE = 3.2, PRECHOD = 0.5;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const delkaAnimace = require('./animace.config.cjs').trvani;

const vstupy = ['-i', ANIMACE];
for (const s of SLIDY) vstupy.push('-loop', '1', '-t', String(SLIDE), '-i', s);
const norm = (i) => `[${i}:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[v${i}]`;
let filtr = [0, ...SLIDY.map((_, i) => i + 1)].map(norm).join(';');
let prev = 'v0', t = delkaAnimace;
SLIDY.forEach((_, i) => {
  const off = (t - PRECHOD).toFixed(2), out = `x${i + 1}`;
  filtr += `;[${prev}][v${i + 1}]xfade=transition=fade:duration=${PRECHOD}:offset=${off}[${out}]`;
  prev = out; t = t - PRECHOD + SLIDE;
});
execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...vstupy, '-filter_complex', filtr, '-map', `[${prev}]`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-an', OUT], { stdio: 'inherit' });
console.log(path.relative(process.cwd(), OUT), `${t.toFixed(1)} s`, `${Math.round(fs.statSync(OUT).size / 1024)} kB`);
