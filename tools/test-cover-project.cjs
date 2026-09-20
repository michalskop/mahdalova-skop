const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { createRequire, Module } = require("node:module");
const webRequire = createRequire(
  path.join(__dirname, "../apps/web/package.json"),
);
const { chromium } = webRequire("playwright");
const JSZip = webRequire("jszip");
const sizeOf = webRequire("image-size");

async function main() {
  const output = await fs.mkdtemp(
    path.join(os.tmpdir(), "datatimes-cover-test-"),
  );
  const server = http.createServer(async (req, res) => {
    const name = new URL(req.url, "http://localhost").pathname.slice(1);
    if (
      ![
        "poster-editor.html",
        "cover-project.js",
        "cover-geometry.js",
        "cover-text.js",
        "jszip.min.js",
      ].includes(name)
    ) {
      res.writeHead(404).end();
      return;
    }
    const file =
      name === "jszip.min.js"
        ? webRequire.resolve("jszip/dist/jszip.min.js")
        : path.join(__dirname, name);
    res.setHeader(
      "Content-Type",
      name.endsWith(".js") ? "text/javascript" : "text/html",
    );
    res.end(await fs.readFile(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.COVER_BROWSER_CHANNEL
        ? { channel: process.env.COVER_BROWSER_CHANNEL }
        : {}),
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(
      process.env.COVER_EDITOR_URL || `http://127.0.0.1:${server.address().port}/poster-editor.html`,
      { timeout: 60000, waitUntil: "domcontentloaded" },
    );
    await page.waitForFunction(() => !!window.CoverProject);
    const recipe = JSON.parse(
      await fs.readFile(path.join(__dirname, "cover-example.json"), "utf8"),
    );
    recipe.state.imageViews = {
      portrait: { zoom: 1.5, panX: 0.3, panY: -0.2 },
    };
    recipe.state.ov = { portrait: { headline: { dx: 4, dy: 2, sc: 0.95 }, tag: { dx: 12, w: 240 } } };
    recipe.state.content.tag = 'TEST TAG';
    recipe.state.textColors = { tag: [{ start: 0, end: 4, color: '#de1743' }] };
    await page.evaluate((p) => CoverProject.load(p), recipe);
    const saved = await page.evaluate(() => CoverProject.save());
    assert.deepEqual(saved.state.textColors, recipe.state.textColors);
    assert.deepEqual(saved.state.ov.portrait.tag, recipe.state.ov.portrait.tag);
    await page.evaluate((p) => CoverProject.load(p), saved);
    assert.deepEqual(
      await page.evaluate(() => CoverProject.save()),
      saved,
      "round trip preserves per-format edits",
    );
    const invalid = await page.evaluate(async () => {
      try {
        await CoverProject.load({ schema: "bad", state: {} });
        return false;
      } catch {
        return true;
      }
    });
    assert(invalid);
    assert.deepEqual(
      await page.evaluate(() => CoverProject.save()),
      saved,
      "invalid import leaves project intact",
    );

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#export-bundle").click();
    const download = await downloadPromise;
    const zipPath = path.join(output, "covers.zip");
    await download.saveAs(zipPath);
    const zip = await JSZip.loadAsync(await fs.readFile(zipPath));
    assert.equal(Object.keys(zip.files).length, 6);
    for (const [suffix, dimensions] of Object.entries({
      homepage: [1500, 1200],
      og: [1200, 630],
      square: [1080, 1080],
      instagram: [1080, 1350],
    })) {
      const bytes = await zip.file(`cover-${suffix}.png`).async("nodebuffer");
      const measured = sizeOf(bytes);
      assert.deepEqual([measured.width, measured.height], dimensions);
      await fs.writeFile(path.join(output, `cover-${suffix}.png`), bytes);
    }
    assert.match(
      await zip.file("frontmatter.yaml").async("string"),
      /instagramImage: "images\/cover-instagram.png"/,
    );
    assert.deepEqual(
      JSON.parse(await zip.file("cover-project.json").async("string")),
      saved,
    );
    const popupPromise = page.waitForEvent("popup");
    await page.locator("#open-portrait").click();
    const popup = await popupPromise;
    await popup.waitForURL("blob:**");
    await popup.waitForFunction(
      () => document.querySelector("img")?.naturalHeight === 1350,
    );
    assert.equal(
      await popup.evaluate(() => document.querySelector("img").naturalWidth),
      1080,
    );
    await popup.close();

    // Exercise real metadata resolution and article listing using temporary fixtures.
    const ts = webRequire("typescript");
    async function loadTs(relative) {
      const filename = path.resolve(__dirname, "..", relative);
      const module = new Module(filename);
      module.filename = filename;
      module.paths = Module._nodeModulePaths(path.dirname(filename));
      module._compile(
        ts.transpileModule(await fs.readFile(filename, "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
          },
        }).outputText,
        filename,
      );
      return module.exports;
    }
    const publicDir = path.join(output, "public");
    const articleDir = path.join(output, "articles/demo");
    const imageDir = path.join(publicDir, "clanek/_articles/demo/images");
    await fs.mkdir(imageDir, { recursive: true });
    await fs.mkdir(articleDir, { recursive: true });
    for (const suffix of ["homepage", "og", "instagram"])
      await fs.copyFile(
        path.join(output, `cover-${suffix}.png`),
        path.join(imageDir, `cover-${suffix}.png`),
      );
    await fs.writeFile(
      path.join(articleDir, "index.md"),
      "---\ntitle: Demo\ndate: 2020-01-01\nhomepageImage: images/cover-homepage.png\nogImage: images/cover-og.png\ninstagramImage: images/cover-instagram.png\ncoverFit: contain\n---\n",
    );
    const { resolveArticleOgImage } = await loadTs(
      "apps/web/lib/coverMetadata.ts",
    );
    const metadata = resolveArticleOgImage(
      "images/cover-og.png",
      "demo",
      "https://example.com",
      publicDir,
    );
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.type, "image/png");
    assert.deepEqual(
      resolveArticleOgImage(
        "https://example.com/external.jpg",
        "demo",
        "https://example.com",
        publicDir,
      ),
      { url: "https://example.com/external.jpg" },
    );
    const { getArticles } = await loadTs("packages/ui/src/lib/getArticles.ts");
    const articles = await getArticles({
      articlesDir: path.dirname(articleDir),
      coverImageBase: "/clanek/_articles",
      publicDir,
    });
    assert.equal(articles[0].coverFit, "cover");
    assert.equal(
      articles[0].instagramImage,
      "/clanek/_articles/demo/images/cover-instagram.png",
    );
    assert.equal(
      articles[0].coverImage,
      "/clanek/_articles/demo/images/cover-homepage.png",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS project round trip, rejected import, four real raster exports, ZIP, Instagram new tab, OG metadata and homepage mapping",
    );
    console.log(`Artifacts: ${output}`);
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
