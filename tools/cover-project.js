/* Shared by the interactive editor and render-covers.cjs. No second renderer. */
const COVER_SCHEMA = "datatimes.cover/v1";
const coverDefaults = JSON.parse(snapshot());
const coverOutputs = {
  homepage: "homepage",
  link: "og",
  square: "square",
  portrait: "instagram",
};
let coverBusy = false;

function editorialLayout(T) {
  if (state.mode === "finished") return;
  const F = FORMATS[state.format],
    og = state.format === "link";
  const x = og ? 333 : Math.round(F.w * 0.065),
    w = og ? 534 : F.w - 2 * x;
  const scale = og ? 0.53 : F.w / 1080;
  const top = og ? 62 : F.h * 0.075;
  const text = (id, y, size, maxHeight, spacing = 0) => {
    const family = FF[COVER_FONTS[id]];
    let lines;
    do {
      lines = wrapWidth(
        state.content[id] || "",
        family,
        size,
        w,
        size * spacing,
      );
      if (
        lines.length * size * 1.15 <= maxHeight &&
        lines.every(
          (l) =>
            measure(l, size, family, 700) +
              Math.max(0, l.length - 1) * size * spacing <=
            w,
        )
      )
        break;
      size -= 1;
    } while (size > 12);
    return {
      ...T[id],
      x,
      y: y + size,
      size,
      w,
      lhFactor: 1.15,
      lsFactor: spacing,
      halo: false,
    };
  };
  T.kicker = text("kicker", top, 26 * scale, og ? 35 : 70 * scale, 0.06);
  const headingTop = top + (og ? 40 : 82 * scale),
    headingHeight = og ? 103 : F.h * 0.21;
  T.headline = text(
    "headline",
    headingTop,
    og ? 43 : 80 * scale,
    headingHeight,
  );
  const subtitleTop = headingTop + headingHeight + 8 * scale;
  T.subtitle = text("subtitle", subtitleTop, 28 * scale, og ? 30 : 58 * scale);
  const imageTop =
    subtitleTop + (state.content.subtitle ? 58 * scale : 12 * scale);
  const footer = og ? 554 : F.h - 80 * scale;
  const claimHeight = state.content.claim ? (og ? 68 : 130 * scale) : 0;
  const claimTop = footer - claimHeight - 25 * scale;
  T.claim = text("claim", claimTop, og ? 24 : 36 * scale, claimHeight || 40);
  T.image = {
    x: og ? 0 : x,
    y: imageTop,
    w: og ? F.w : w,
    h: Math.max(60, claimTop - imageTop - 26 * scale),
  };
  const logoSize = og ? 25 : 40 * scale;
  T.logo = { kind: state.topLogo, x, y: footer, size: logoSize };
  T.brand = {
    x: x + w - wmWidth("mahdalova-skop", logoSize),
    y: footer,
    size: logoSize,
  };
  T.brand2 = { x, y: footer - 60 * scale, size: logoSize };
}

function projectData() {
  return { schema: COVER_SCHEMA, state: JSON.parse(snapshot()) };
}
function cleanProject(project) {
  if (
    project?.schema !== COVER_SCHEMA ||
    !project.state ||
    typeof project.state !== "object"
  )
    throw Error("Neznámý formát projektu.");
  const clean = structuredClone(coverDefaults),
    src = project.state;
  const enums = {
    format: Object.keys(FORMATS),
    mode: ["compose", "finished"],
    topLogo: ["datatimes", "special"],
    ogFormat: ["auto", "jpeg", "png"],
    boxMode: ["auto", "none"],
    motif: [
      "none",
      "fall",
      "riseFall",
      "cross",
      "bars",
      "gap",
      "heatgap",
      "dots",
    ],
  };
  for (const [key, values] of Object.entries(enums))
    if (src[key] !== undefined) {
      if (!values.includes(src[key])) throw Error(`Neplatné ${key}`);
      clean[key] = src[key];
    }
  if (typeof src.dark === "boolean") clean.dark = src.dark;
  if (typeof src.chapter === "string" && chapterOf(src.chapter))
    clean.chapter = src.chapter;
  const color = (v) =>
    v === null || (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v));
  if (src.accent !== undefined) {
    if (!color(src.accent) || !src.accent) throw Error("Neplatná barva");
    clean.accent = src.accent;
  }
  for (const key of Object.keys(clean.content))
    if (src.content?.[key] !== undefined) {
      if (typeof src.content[key] !== "string" || src.content[key].length > 500)
        throw Error("Text je příliš dlouhý");
      clean.content[key] = src.content[key];
    }
  // Normalize older projects to the editorial typography contract.
  clean.font = { ...COVER_FONTS };
  clean.textColors = {};
  for (const key of Object.keys(clean.content)) {
    const ranges = src.textColors?.[key];
    if (ranges === undefined) continue;
    if (!Array.isArray(ranges) || ranges.some((range) =>
      !range || !Number.isInteger(range.start) || !Number.isInteger(range.end) ||
      range.start < 0 || range.end <= range.start || range.end > clean.content[key].length ||
      !range.color || !color(range.color)
    )) throw Error("Neplatné barevné úseky textu");
    clean.textColors[key] = ranges.map(({ start, end, color }) => ({ start, end, color }));
  }
  for (const key of Object.keys(clean.color))
    if (src.color?.[key] !== undefined) {
      if (!color(src.color[key])) throw Error("Neplatná barva");
      clean.color[key] = src.color[key];
    }
  const numeric = (obj, allowed) => {
    const out = {};
    for (const key of allowed)
      if (obj?.[key] !== undefined) {
        const n = obj[key];
        if (typeof n !== "number" || !Number.isFinite(n) || Math.abs(n) > 20000)
          throw Error("Neplatná geometrie");
        out[key] = n;
      }
    return out;
  };
  if (src.border) {
    clean.border = {
      ...clean.border,
      ...numeric(src.border, ["width", "radius"]),
    };
    if (typeof src.border.on === "boolean") clean.border.on = src.border.on;
    if (color(src.border.color) && src.border.color)
      clean.border.color = src.border.color;
  }
  clean.img = { ...clean.img, ...numeric(src.img, ["zoom", "panX", "panY"]) };
  clean.ov = {};
  clean.imageViews = {};
  for (const format of Object.keys(FORMATS)) {
    if (src.imageViews?.[format])
      clean.imageViews[format] = numeric(src.imageViews[format], [
        "zoom",
        "panX",
        "panY",
      ]);
    if (src.ov?.[format]) {
      clean.ov[format] = {};
      for (const name of [
        "image",
        "tag",
        "kicker",
        "headline",
        "subtitle",
        "claim",
        "logo",
        "brand",
        "brand2",
      ])
        if (src.ov[format][name])
          clean.ov[format][name] = numeric(src.ov[format][name], [
            "dx",
            "dy",
            "sc",
            "w",
            "h",
            "dw",
            "dh",
          ]);
    }
  }
  if (src.image) {
    if (
      typeof src.image !== "string" ||
      src.image.length > 30000000 ||
      !/^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(
        src.image,
      )
    )
      throw Error("Projekt vyžaduje vložený obrázek (data URL).");
    clean.image = src.image;
  } else clean.image = null;
  clean.sourceMeta = null;
  return clean;
}
async function loadCoverProject(project) {
  if (coverBusy) throw Error("Probíhá export");
  const clean = cleanProject(project);
  if (clean.image) {
    const image = new Image();
    image.src = clean.image;
    await image.decode();
    clean.sourceMeta = {
      width: image.naturalWidth,
      height: image.naturalHeight,
      bytes: Math.floor(clean.image.split(",")[1].length * 0.75),
      mime: clean.image.slice(5, clean.image.indexOf(";")),
    };
  }
  pushHistory();
  applySnap(JSON.stringify(clean));
  await document.fonts.ready;
}
async function renderCover(format) {
  if (coverBusy) throw Error("Probíhá export");
  if (!FORMATS[format]) throw Error("Neznámý formát");
  coverBusy = true;
  const previous = state.format;
  // Freeze interaction while asynchronous font embedding is in flight.
  document.getElementById("panel").inert = true;
  document.getElementById("stage").inert = true;
  try {
    await document.fonts.ready;
    state.format = format;
    const kind = pickOgFormat();
    const blob = await exportRaster(
      kind === "jpeg" ? "image/jpeg" : "image/png",
      0.9,
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return {
      name: `cover-${coverOutputs[format] || format}.${kind === "jpeg" ? "jpg" : "png"}`,
      bytes,
      width: FORMATS[format].w,
      height: FORMATS[format].h,
      mime: blob.type,
    };
  } finally {
    state.format = previous;
    coverBusy = false;
    document.getElementById("panel").inert = false;
    document.getElementById("stage").inert = false;
    render();
  }
}
function coverFrontmatter(files) {
  return (
    Object.entries({
      homepageImage: "homepage",
      ogImage: "og",
      squareImage: "square",
      instagramImage: "instagram",
    })
      .map(
        ([key, suffix]) =>
          `${key}: "images/${files.find((f) => f.name.startsWith("cover-" + suffix + ".")).name}"`,
      )
      .join("\n") + "\n"
  );
}
async function coverZip(files) {
  const zip = new JSZip();
  for (const file of files) zip.file(file.name, file.bytes);
  return zip.generateAsync({ type: "blob" });
}
window.CoverProject = {
  schema: COVER_SCHEMA,
  load: loadCoverProject,
  save: projectData,
  render: renderCover,
  frontmatter: coverFrontmatter,
};
document.getElementById("save-project").onclick = () =>
  saveBlob(
    new Blob([JSON.stringify(projectData(), null, 2)], {
      type: "application/json",
    }),
    "cover-project.json",
  );
document.getElementById("load-project").onclick = () =>
  document.getElementById("project-file").click();
document.getElementById("project-file").onchange = async (e) => {
  try {
    const file = e.target.files[0];
    if (file) await loadCoverProject(JSON.parse(await file.text()));
    toast("Projekt otevřen");
  } catch (err) {
    toast(err.message);
  } finally {
    e.target.value = "";
  }
};
document.getElementById("export-bundle").onclick = async () => {
  try {
    const files = [];
    for (const f of Object.keys(coverOutputs)) files.push(await renderCover(f));
    const encode = new TextEncoder();
    files.push(
      {
        name: "frontmatter.yaml",
        bytes: encode.encode(coverFrontmatter(files)),
      },
      {
        name: "cover-project.json",
        bytes: encode.encode(JSON.stringify(projectData(), null, 2)),
      },
    );
    saveBlob(await coverZip(files), "cover-bundle.zip");
    toast("Čtyři varianty a editovatelný projekt");
  } catch (err) {
    toast(err.message);
  }
};
document.getElementById("open-portrait").onclick = async () => {
  const tab = window.open("about:blank", "_blank");
  try {
    const file = await renderCover("portrait");
    const url = URL.createObjectURL(
      new Blob([file.bytes], { type: file.mime }),
    );
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else saveBlob(new Blob([file.bytes], { type: file.mime }), file.name);
    setTimeout(() => URL.revokeObjectURL(url), 300000);
  } catch (err) {
    tab?.close();
    toast(err.message);
  }
};
render();
