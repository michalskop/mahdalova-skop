#!/usr/bin/env node
/* Usage: npm run covers -- path/to/cover-project.json output-directory [--force]
 * The same recipe opens in poster-editor.html. imageFile is relative to the JSON.
 */
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { createRequire } = require("node:module");
const requireWeb = createRequire(
  path.join(__dirname, "../apps/web/package.json"),
);
const { chromium } = requireWeb("playwright");

async function main() {
  const [input, out, ...flags] = process.argv.slice(2);
  if (!input || !out || flags.some((f) => f !== "--force"))
    throw Error(
      "Usage: npm run covers -- project.json output-directory [--force]",
    );
  const project = JSON.parse(await fs.readFile(input, "utf8"));
  if (project.imageFile) {
    const file = path.resolve(path.dirname(input), project.imageFile);
    const mime = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    }[path.extname(file).toLowerCase()];
    if (!mime) throw Error("imageFile must be PNG, JPEG or WebP");
    project.state = {
      ...project.state,
      image: `data:${mime};base64,${(await fs.readFile(file)).toString("base64")}`,
    };
    delete project.imageFile;
  }
  const allowed = new Set([
    "poster-editor.html",
    "cover-project.js",
    "cover-geometry.js",
    "cover-text.js",
    "jszip.min.js",
  ]);
  const server = http.createServer(async (req, res) => {
    const name = new URL(req.url, "http://localhost").pathname.slice(1);
    if (!allowed.has(name)) {
      res.writeHead(404).end();
      return;
    }
    try {
      const filename =
        name === "jszip.min.js"
          ? requireWeb.resolve("jszip/dist/jszip.min.js")
          : path.join(__dirname, name);
      const data = await fs.readFile(filename);
      res.setHeader(
        "Content-Type",
        name.endsWith(".js") ? "text/javascript" : "text/html",
      );
      res.end(data);
    } catch {
      res.writeHead(500).end();
    }
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
    await page.goto(
      `http://127.0.0.1:${server.address().port}/poster-editor.html`,
      { waitUntil: "domcontentloaded", timeout: 60000 },
    );
    await page.waitForFunction(() => !!window.CoverProject);
    await page.evaluate((p) => CoverProject.load(p), project);
    const outputs = [];
    for (const format of ["homepage", "link", "square", "portrait"]) {
      const result = await page.evaluate(async (f) => {
        const r = await CoverProject.render(f);
        return { ...r, bytes: Array.from(r.bytes) };
      }, format);
      outputs.push({ ...result, bytes: Buffer.from(result.bytes) });
      console.log(
        `${result.name}: ${result.width} × ${result.height}, ${Math.round(result.bytes.length / 1024)} kB`,
      );
    }
    const saved = await page.evaluate(() => CoverProject.save());
    const yaml = await page.evaluate(
      (files) => CoverProject.frontmatter(files),
      outputs.map(({ name }) => ({ name })),
    );
    outputs.push(
      {
        name: "cover-project.json",
        bytes: Buffer.from(JSON.stringify(saved, null, 2)),
      },
      { name: "frontmatter.yaml", bytes: Buffer.from(yaml) },
    );
    await fs.mkdir(out, { recursive: true });
    // Check every destination before writing, so a conflict cannot leave half a bundle.
    if (!flags.includes("--force"))
      for (const file of outputs) {
        try {
          await fs.access(path.join(out, file.name));
          throw Error(`Already exists: ${file.name}; use --force deliberately`);
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
      }
    for (const file of outputs)
      await fs.writeFile(path.join(out, file.name), file.bytes);
    console.log(`Saved ${outputs.length} files to ${path.resolve(out)}`);
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
