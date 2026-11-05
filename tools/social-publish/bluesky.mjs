#!/usr/bin/env node
// Pilot: článek z RSS → návrh příspěvku na Bluesky → (po schválení) zveřejnění.
// Pravidla: tools/social-publish/PRAVIDLA.md
//
//   node tools/social-publish/bluesky.mjs navrh [slug]          – návrh k nejnovějšímu (nebo danému) článku
//   node tools/social-publish/bluesky.mjs kontrola <soubor>     – zkontroluje návrh, nic neposílá
//   node tools/social-publish/bluesky.mjs zverejnit <soubor> --schvalil "Jméno"
//
// Bez závislostí, Node 20+.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.mahdalova-skop.cz';
const RSS = `${SITE}/rss.xml`;
const PDS = 'https://bsky.social';
const MAX_GRAPHEMES = 300;
const MAX_THUMB = 1_000_000;
const DIR = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS = path.join(DIR, 'navrhy');
const ENV_FILE = path.join(os.homedir(), '.datatimes', 'bluesky.env');

const die = (msg) => { console.error(`CHYBA: ${msg}`); process.exit(1); };
const graphemes = (s) => [...new Intl.Segmenter('cs', { granularity: 'grapheme' }).segment(s)].length;
const decode = (s) => s
  .replace(/^<!\[CDATA\[|\]\]>$/g, '')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

async function rssItems() {
  const xml = await (await fetch(RSS)).text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const tag = (t) => { const m = it.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return m ? decode(m[1].trim()) : ''; };
    return { title: tag('title'), link: tag('link'), description: tag('description'), pubDate: tag('pubDate') };
  });
}

async function ogMeta(url) {
  const html = await (await fetch(url)).text();
  const meta = (p) => { const m = html.match(new RegExp(`<meta[^>]+property="${p}"[^>]+content="([^"]*)"`)); return m ? decode(m[1]) : ''; };
  return { title: meta('og:title'), description: meta('og:description'), image: meta('og:image') };
}

function check(d) {
  const problems = [];
  if (!d.text || d.text.startsWith('DOPSAT')) problems.push('chybí text příspěvku (pole "text")');
  const n = graphemes(d.text || '');
  if (n > MAX_GRAPHEMES) problems.push(`text má ${n} znaků, limit je ${MAX_GRAPHEMES}`);
  if (/https?:\/\//.test(d.text || '')) problems.push('adresa nepatří do textu, odkaz nese náhledová karta');
  if (/\p{Extended_Pictographic}/u.test(d.text || '')) problems.push('v textu je emoji');
  if (/(^|\s)#\p{L}/u.test(d.text || '')) problems.push('v textu je hashtag');
  if (!d.odkaz?.startsWith(SITE)) problems.push('odkaz nevede na web DataTimes');
  return { n, problems };
}

async function cmdNavrh(slug) {
  const items = await rssItems();
  const item = slug ? items.find((i) => i.link.endsWith(`/${slug}`)) : items[0];
  if (!item) die(slug ? `článek ${slug} v RSS není` : 'RSS je prázdné');
  const og = await ogMeta(item.link);
  const s = item.link.split('/').pop();
  const draft = {
    sit: 'bluesky',
    clanek: item.title,
    odkaz: item.link,
    vyslo: item.pubDate,
    text: 'DOPSAT: hák s jedním číslem podle PRAVIDLA.md (max. 300 znaků)',
    karta: { titulek: og.title || item.title, popis: og.description || item.description, obrazek: og.image },
    cas_zverejneni: 'po schválení',
    schvalil: null,
    zverejneno: null,
  };
  fs.mkdirSync(DRAFTS, { recursive: true });
  const file = path.join(DRAFTS, `${s}.bluesky.json`);
  if (fs.existsSync(file)) die(`návrh už existuje: ${file}`);
  fs.writeFileSync(file, JSON.stringify(draft, null, 2) + '\n');
  console.log(`Návrh uložen: ${file}`);
}

async function cmdKontrola(file) {
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { n, problems } = check(d);
  const img = d.karta?.obrazek ? await fetch(d.karta.obrazek, { method: 'HEAD' }) : null;
  const size = Number(img?.headers.get('content-length') || 0);
  if (!img?.ok) problems.push('obrázek karty nejde stáhnout');
  else if (size > MAX_THUMB) problems.push(`obrázek karty má ${size} B, limit Bluesky je 1 MB`);
  console.log(`Text (${n}/${MAX_GRAPHEMES} znaků):\n\n${d.text}\n`);
  console.log(`Karta: ${d.karta.titulek}\n       ${d.odkaz}\n       obrázek ${img?.headers.get('content-type')}, ${Math.round(size / 1024)} kB`);
  console.log(d.zverejneno ? `\nUŽ ZVEŘEJNĚNO: ${d.zverejneno.url}` : '\nZatím nezveřejněno.');
  if (problems.length) { console.log('\nProblémy:\n- ' + problems.join('\n- ')); process.exit(2); }
  console.log('\nKontrola v pořádku.');
}

function loadEnv() {
  const env = { ...process.env };
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  if (!env.BLUESKY_HANDLE || !env.BLUESKY_APP_PASSWORD) die(`chybí přístup: ${ENV_FILE} (BLUESKY_HANDLE, BLUESKY_APP_PASSWORD)`);
  return env;
}

async function xrpc(method, body, token, contentType = 'application/json') {
  const res = await fetch(`${PDS}/xrpc/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: contentType === 'application/json' ? JSON.stringify(body) : body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) die(`${method}: ${res.status} ${json.error || ''} ${json.message || ''}`);
  return json;
}

async function cmdZverejnit(file, schvalil) {
  if (!schvalil) die('zveřejnit lze jen se schválením: --schvalil "Kateřina" nebo "Michal"');
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (d.zverejneno) die(`už zveřejněno: ${d.zverejneno.url}`);
  const { problems } = check(d);
  if (problems.length) die('návrh neprošel kontrolou:\n- ' + problems.join('\n- '));

  const env = loadEnv();
  const session = await xrpc('com.atproto.server.createSession', { identifier: env.BLUESKY_HANDLE, password: env.BLUESKY_APP_PASSWORD });

  const imgRes = await fetch(d.karta.obrazek);
  const bytes = Buffer.from(await imgRes.arrayBuffer());
  if (bytes.length > MAX_THUMB) die('obrázek karty je větší než 1 MB');
  const { blob } = await xrpc('com.atproto.repo.uploadBlob', bytes, session.accessJwt, imgRes.headers.get('content-type') || 'image/jpeg');

  const record = {
    $type: 'app.bsky.feed.post',
    text: d.text,
    langs: ['cs'],
    createdAt: new Date().toISOString(),
    embed: {
      $type: 'app.bsky.embed.external',
      external: { uri: d.odkaz, title: d.karta.titulek, description: d.karta.popis, thumb: blob },
    },
  };
  const out = await xrpc('com.atproto.repo.createRecord', { repo: session.did, collection: 'app.bsky.feed.post', record }, session.accessJwt);
  const rkey = out.uri.split('/').pop();
  d.schvalil = schvalil;
  d.zverejneno = { kdy: record.createdAt, ucet: session.handle, uri: out.uri, cid: out.cid, url: `https://bsky.app/profile/${session.handle}/post/${rkey}` };
  fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
  console.log(`Zveřejněno: ${d.zverejneno.url}`);
}

// ── Vlákno: odpovědi pod zveřejněným příspěvkem, s obrázky ──────────────────
// Soubor vlákna: { "navazuje_na": "<soubor návrhu prvního příspěvku>",
//   "prispevky": [{ "text", "obrazek"?, "alt"?, "odkaz"? }], "schvalil", "zverejneno": [] }
// Obrázek je cesta k souboru vedle návrhu (nebo URL), alt text je povinný.

async function loadImage(ref, baseDir) {
  if (/^https?:\/\//.test(ref)) {
    const r = await fetch(ref);
    return { bytes: Buffer.from(await r.arrayBuffer()), type: r.headers.get('content-type') || 'image/jpeg' };
  }
  const p = path.resolve(baseDir, ref);
  if (!fs.existsSync(p)) die(`obrázek nenalezen: ${p}`);
  return { bytes: fs.readFileSync(p), type: p.endsWith('.png') ? 'image/png' : 'image/jpeg' };
}

function imageSize(bytes, type) {
  if (type === 'image/png') return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  for (let i = 2; i < bytes.length - 9;) { // JPEG: najít SOF0/SOF2
    if (bytes[i] !== 0xff) { i++; continue; }
    const m = bytes[i + 1];
    if (m === 0xc0 || m === 0xc2) return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  return null;
}

async function checkThread(file) {
  const t = JSON.parse(fs.readFileSync(file, 'utf8'));
  const dir = path.dirname(file);
  const problems = [];
  const root = JSON.parse(fs.readFileSync(path.resolve(dir, t.navazuje_na), 'utf8'));
  if (!root.zverejneno) problems.push('první příspěvek ještě není zveřejněný');
  for (const [i, p] of t.prispevky.entries()) {
    const k = `${i + 2}/`;
    const { n, problems: pr } = check({ text: p.text, odkaz: p.odkaz || root.odkaz });
    console.log(`\n${k} (${n}/${MAX_GRAPHEMES} znaků)\n${p.text}`);
    pr.forEach((x) => problems.push(`${k} ${x}`));
    if (p.obrazek) {
      const img = await loadImage(p.obrazek, dir);
      const sz = imageSize(img.bytes, img.type);
      console.log(`   obrázek: ${p.obrazek} (${sz?.width}×${sz?.height}, ${Math.round(img.bytes.length / 1024)} kB)\n   alt: ${p.alt || '—'}`);
      if (img.bytes.length > MAX_THUMB) problems.push(`${k} obrázek je větší než 1 MB`);
      if (!p.alt) problems.push(`${k} chybí alt text obrázku`);
    }
    if (p.odkaz) console.log(`   karta s odkazem: ${p.odkaz}`);
  }
  return { t, root, dir, problems };
}

async function cmdVlakno(file, schvalil, jenKontrola) {
  const { t, root, dir, problems } = await checkThread(file);
  if (problems.length) { console.log('\nProblémy:\n- ' + problems.join('\n- ')); process.exit(2); }
  if (jenKontrola) { console.log('\nKontrola v pořádku.'); return; }
  if (!schvalil) die('zveřejnit lze jen se schválením: --schvalil "Kateřina" nebo "Michal"');

  const env = loadEnv();
  const session = await xrpc('com.atproto.server.createSession', { identifier: env.BLUESKY_HANDLE, password: env.BLUESKY_APP_PASSWORD });
  if (!root.zverejneno.cid) {
    const [, , did, , rkey] = root.zverejneno.uri.split('/');
    const r = await (await fetch(`${PDS}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=app.bsky.feed.post&rkey=${rkey}`)).json();
    root.zverejneno.cid = r.cid;
  }
  const rootRef = { uri: root.zverejneno.uri, cid: root.zverejneno.cid };
  t.zverejneno ||= [];
  let parent = t.zverejneno.length ? t.zverejneno[t.zverejneno.length - 1] : rootRef;

  for (const [i, p] of t.prispevky.entries()) {
    if (t.zverejneno[i]) continue; // už venku, pokračujeme dalším
    let embed;
    if (p.obrazek) {
      const img = await loadImage(p.obrazek, dir);
      const { blob } = await xrpc('com.atproto.repo.uploadBlob', img.bytes, session.accessJwt, img.type);
      const aspectRatio = imageSize(img.bytes, img.type);
      embed = { $type: 'app.bsky.embed.images', images: [{ alt: p.alt, image: blob, ...(aspectRatio ? { aspectRatio } : {}) }] };
    } else if (p.odkaz) {
      const og = await ogMeta(p.odkaz);
      const img = await loadImage(og.image, dir);
      const { blob } = await xrpc('com.atproto.repo.uploadBlob', img.bytes, session.accessJwt, img.type);
      embed = { $type: 'app.bsky.embed.external', external: { uri: p.odkaz, title: og.title, description: og.description, thumb: blob } };
    }
    const record = {
      $type: 'app.bsky.feed.post', text: p.text, langs: ['cs'], createdAt: new Date().toISOString(),
      reply: { root: rootRef, parent: { uri: parent.uri, cid: parent.cid } },
      ...(embed ? { embed } : {}),
    };
    const out = await xrpc('com.atproto.repo.createRecord', { repo: session.did, collection: 'app.bsky.feed.post', record }, session.accessJwt);
    const url = `https://bsky.app/profile/${session.handle}/post/${out.uri.split('/').pop()}`;
    t.zverejneno[i] = { kdy: record.createdAt, uri: out.uri, cid: out.cid, url };
    t.schvalil = schvalil;
    fs.writeFileSync(file, JSON.stringify(t, null, 2) + '\n'); // průběžně, ať při chybě nevznikne dvojí příspěvek
    console.log(`${i + 2}/ zveřejněno: ${url}`);
    parent = t.zverejneno[i];
  }
}

const [cmd, arg, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null; };
if (cmd === 'navrh') await cmdNavrh(arg);
else if (cmd === 'kontrola' && arg) await cmdKontrola(arg);
else if (cmd === 'zverejnit' && arg) await cmdZverejnit(arg, flag('--schvalil'));
else if (cmd === 'vlakno-kontrola' && arg) await cmdVlakno(arg, null, true);
else if (cmd === 'vlakno' && arg) await cmdVlakno(arg, flag('--schvalil'), false);
else die('použití: navrh [slug] | kontrola <soubor> | zverejnit <soubor> --schvalil "Jméno" | vlakno-kontrola <soubor> | vlakno <soubor> --schvalil "Jméno"');
