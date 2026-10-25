// Změří ve vyrenderovaných coverech spodní okraj podtitulku (nejnižší pixel písma, tj. dolní kraj „y“)
// a horní okraj kolečka loga; vypíše střed mezi nimi = svislá osa, na kterou se centrují písmena STOP.
// U OG (logo nad slovem STOP) střed mezi spodkem kolečka loga a spodní hranou bezpečné zóny (y 590).
// node zmer.cjs  → zapíše osa.json
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const IMG = path.join(__dirname, '..', 'images');
const F = {
  homepage: { f: 'cover-homepage.png', x: [180, 1100] }, square: { f: 'cover-square.png', x: [70, 900] },
  instagram: { f: 'cover-instagram.png', x: [70, 900] }, story: { f: 'cover-story.png', x: [80, 900] }, og: { f: 'cover-og.jpg', x: [285, 915] },
};
(async () => {
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage();
  const out = {};
  for (const [k, o] of Object.entries(F)) {
    const src = `data:image/${o.f.endsWith('jpg') ? 'jpeg' : 'png'};base64,` + fs.readFileSync(path.join(IMG, o.f)).toString('base64');
    out[k] = await p.evaluate(async ({ src, x, og }) => {
      const im = new Image(); im.src = src; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
      const px = (X, Y) => { const i = (Y * c.width + X) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const svetly = ([r, gg, bb]) => r > 150 && gg > 150 && bb > 170;           // podtitulek #d2d8e9 / bílé písmo
      const kruh = ([r, gg, bb]) => r > 170 && gg < 90 && bb < 110;              // karmínová část kolečka loga
      // karmínové shluky po řádcích (štítek, písmena STOP, kolečko loga); logo = nejnižší shluk, u OG druhý shora
      const shluky = []; let akt = null;
      for (let Y = 0; Y < c.height; Y++) {
        let hit = false;
        for (let X = 0; X < c.width; X += 1) if (kruh(px(X, Y))) { hit = true; break; }
        if (hit) { if (akt && Y - akt[1] <= 3) akt[1] = Y; else { akt = [Y, Y]; shluky.push(akt); } }
      }
      // OG: kolečko = první shluk vysoký aspoň 15 px (štítek a jeho podtržení jsou nižší)
      const logo = og ? shluky.find((q) => q[1] - q[0] >= 15) : shluky[shluky.length - 1];
      const kTop = logo[0], kBot = logo[1];
      // podtitulek: poslední řádek světlého písma nad kolečkem (u OG nad logem) v textovém sloupci
      let subBot = -1, prazdno = 0, Y0 = og ? 60 : 100;
      for (let Y = Y0; Y < (og ? kTop : c.height * 0.6); Y++) {
        let hit = false;
        for (let X = x[0]; X < x[1]; X++) if (svetly(px(X, Y))) { hit = true; break; }
        if (hit) { subBot = Y; prazdno = 0; } else if (subBot > 0 && ++prazdno > 40) break;
      }
      return og ? { kruhTop: kTop, kruhBot: kBot, osa: Math.round((kBot + 590) / 2) } : { subBot, kruhTop: kTop, osa: Math.round((subBot + kTop) / 2) };
    }, { src, x: o.x, og: false });
  }
  await b.close();
  fs.writeFileSync(path.join(__dirname, 'osa.json'), JSON.stringify(out, null, 1));
  console.log(out);
})();
