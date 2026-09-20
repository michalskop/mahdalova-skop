import fs from "fs";
import path from "path";
import sizeOf from "image-size";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Build-time inspection only. External assets never receive invented dimensions. */
export function resolveArticleOgImage(
  raw: unknown,
  slug: string,
  baseUrl: string,
  publicDir = path.join(process.cwd(), "public"),
) {
  const base = new URL(baseUrl);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (/^(https?:)?\/\//i.test(value)) return { url: new URL(value, base).href };

  const candidates = value
    ? [
        `/clanek/_articles/${encodeURIComponent(slug)}/${value.replace(/^\/+/, "")}`,
        ...(value.startsWith("/") ? [value] : []),
      ]
    : [];
  // The article corpus historically uses /images for both article-relative and
  // site-root files. Match the homepage's existing file-first resolution.
  candidates.push("/images/og-image.png");
  const root = path.resolve(publicDir);
  for (const candidate of candidates) {
    const filename = path.resolve(root, candidate.replace(/^\/+/, ""));
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename))
      continue;
    try {
      const dimensions = sizeOf(new Uint8Array(fs.readFileSync(filename)));
      const url = new URL(candidate, base).href;
      if (!dimensions.width || !dimensions.height) return { url };
      const type = dimensions.type ? MIME[dimensions.type] : undefined;
      return {
        url,
        width: dimensions.width,
        height: dimensions.height,
        ...(type ? { type } : {}),
      };
    } catch {
      // Unknown encoding: publish its URL without guessing metadata.
      return { url: new URL(candidate, base).href };
    }
  }
  return { url: new URL("/images/og-image.png", base).href };
}
