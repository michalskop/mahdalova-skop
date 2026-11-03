# Media Storage & CDN Delivery (`media.datatimes.org`)

**Status:** Active Production Standard  
**CDN Domain:** `https://media.datatimes.org`  
**Storage Origin:** Backblaze B2 (`datatimes-media`) via Cloudflare Bandwidth Alliance ($0 egress)  

---

## 1. Core Rule: No Binaries in Git

**Binary media (PNG, JPEG, WebP, GIF, MP4, MOV, SVG assets) must NEVER be committed to Git.**

* **Why:** Git stores complete copies of every modified binary in `.git` history forever, causing repository bloat, slow clone times, and slow CI builds.
* **How it works:** All media assets are uploaded directly to the CDN origin (`Backblaze B2`) and delivered globally via **Cloudflare CDN** under `https://media.datatimes.org`.
* **Git receives only pure text:** Markdown frontmatter, HTML, and TypeScript files reference the full public CDN URLs.

---

## 2. Directory & Path Topology

The CDN bucket is structured symmetrically by project, with a dedicated `shared/` category for cross-project assets:

```text
media.datatimes.org/
│
├── shared/                         # Cross-project assets
│   ├── branding/                   # Global DataTimes logos, marks (e.g. datatimes-donut-2026-10.svg)
│   ├── authors/                    # Author avatars (e.g. katerina-mahdalova-2026-10.webp)
│   └── entities/                   # Politicians, parties (e.g. cz-psp/6142-2025.webp)
│
├── datatimes-cz/                   # Czech site (mahdalova-skop.cz / datatimes.cz)
│   ├── site/                       # Site-specific UI visuals & banners
│   └── articles/                   # Editorial content
│       └── YYYY/MM/<slug>/         # Immutable article visuals
│           ├── cover.webp          # Article cover
│           ├── cover-og.jpg        # OpenGraph card (must remain JPEG 1200×630)
│           ├── chart-turnout.webp
│           └── chart-turnout-v2.webp
│
├── datatimes-sk/                   # Slovak site (datatimes.sk)
│   ├── site/
│   └── articles/YYYY/MM/<slug>/
│
├── mandaty-cz/                     # Mandáty tool
└── volebni-kalkulacka/             # Volební kalkulačka
```

---

## 3. Strict Immutability & Caching

Every asset uploaded to `media.datatimes.org` receives HTTP headers:
`Cache-Control: public, max-age=31536000, immutable`

* **Never overwrite an existing file:** Cloudflare and visitor browsers cache immutable files for up to 1 year. Overwriting bytes under the same filename will result in visitors seeing stale versions.
* **Revisions:** If you update an image, append an explicit revision suffix:
  * `chart-turnout.webp` → `chart-turnout-v2.webp`
* **Shared Assets Versioning Baseline (`YYYY-MM`):**
  * Author avatars: `shared/authors/katerina-mahdalova-2026-10.webp`
  * Branding marks: `shared/branding/datatimes-donut-2026-10.svg`
  * If adjusted in the same month: append `-b` or the day: `katerina-mahdalova-2026-10-30.webp`.
* **Social Cards (OpenGraph):**
  * When updating `cover-og.jpg`, use `cover-og-v2.jpg`.
  * Update `<meta property="og:image">` in HTML, deploy, and trigger a re-scrape via Facebook Sharing Debugger / Twitter card validator.

---

## 4. The Uploader Script (`scripts/upload_media.py`)

A cross-platform Python CLI tool is available in the repository root:

```bash
python scripts/upload_media.py \
  --file <local-path> \
  --target <project-or-shared>/<subpath>/<filename>
```

### Features:
1. **Collision Refusal (`--no-clobber`):** Exits with an error if the remote file already exists, protecting browser caches.
2. **Auto Cache Headers:** Sends `Cache-Control: public, max-age=31536000, immutable`.
3. **Explicit Content-Type map:** `.webp`, `.avif`, `.svg`, `.png`, `.jpg/.jpeg`, `.gif`, `.mp4`, `.webm`, `.mov`, `.pdf` get their type from a fixed table in the script; only other extensions fall back to Python's `mimetypes`. (On Windows `mimetypes` reads the registry, which usually lacks `.webp` – before 2026-11-01 WebP uploaded from Windows was served as `application/octet-stream`.)
4. **Target validation:** `--target` must be a relative bucket key ending in a file name. Empty targets, a leading `/` or `\`, anything containing `:` (drive letters, URLs) and empty/`.`/`..` segments are refused with exit code 1 – never silently "fixed". In Git Bash an argument starting with `/` is rewritten to a Windows path (`/cover-og.jpg` → `C:/Program Files/Git/cover-og.jpg`); the script now rejects that instead of uploading under that key.
5. **Machine-Readable JSON Output:** AI agents parse the returned JSON to extract the public URL automatically. `content_type` is what was sent; `verified_at_edge` / `edge_content_type` come from a GET request to the CDN after the upload (`verified_at_edge` is true only for HTTP 200, the expected Content-Type and the same SHA-1 as the uploaded file). An extension missing from the table is refused instead of being uploaded as `application/octet-stream`.
   Read the URL with a JSON parser (`json.loads(out)["url"]`) or use `--url-only`, which prints just the URL. **Never cut the URL out of the JSON text** (grep/sed/split on a line): on 2026-11-01 this left `coverImage: "https://…/cover.webp","` in 18 articles.
   ```json
   {
     "status": "success",
     "url": "https://media.datatimes.org/datatimes-cz/articles/2026/10/slug/chart.webp",
     "key": "datatimes-cz/articles/2026/10/slug/chart.webp",
     "bytes": 48210,
     "content_type": "image/webp",
     "verified_at_edge": true,
     "edge_content_type": "image/webp"
   }
   ```
   Test uploads go under `datatimes-cz/site/test/<name>-YYYY-MM-DD.<ext>` (never reuse a key).

### Fixing an object that is already published

Never overwrite it. Upload the corrected (or identical, re-typed) file under a versioned name such as
`cover-v2.webp`, verify the public URL with a GET (HTTP 200, image Content-Type, the image decodes), then update
every reference in the same commit. On 2026-11-03 the 49 WebP files served as `application/octet-stream`
were fixed this way.

---

## 5. Machine Credentials Setup (Once per Computer)

The script automatically searches for credentials in:
1. `.env` in the current repository root (ignored by Git)
2. `~/.datatimes-media.env` (Linux/macOS user home)
3. `%USERPROFILE%\.datatimes-media.env` (Windows user home)

### Linux / macOS:
```bash
echo 'B2_BUCKET="datatimes-media"' >> ~/.datatimes-media.env
echo 'B2_KEY_ID="YOUR_KEY_ID"' >> ~/.datatimes-media.env
echo 'B2_APPLICATION_KEY="YOUR_APP_KEY"' >> ~/.datatimes-media.env
chmod 600 ~/.datatimes-media.env
```

### Windows (PowerShell):
```powershell
Set-Content -Path "$HOME\.datatimes-media.env" -Value @"
B2_BUCKET="datatimes-media"
B2_KEY_ID="YOUR_KEY_ID"
B2_APPLICATION_KEY="YOUR_APP_KEY"
"@
```

---

## 6. Pre-Commit Guardrail (`.githooks/pre-commit`, also run by `scripts/git-hooks/pre-commit`)

The check lives in `.githooks/pre-commit`. The repo has two hook directories and a machine uses one of them via `core.hooksPath`; the binary check runs in **both**:

| `core.hooksPath` | pre-commit runs | pre-push runs |
|---|---|---|
| `scripts/git-hooks` (recommended) | binary check (calls `.githooks/pre-commit`) → hidden publish `time` → `checkArticles.js --staged` | `git lfs pre-push` (web animations in Git LFS) |
| `.githooks` | binary check, then `scripts/git-hooks/pre-commit` (same as above) | `scripts/git-hooks/pre-push` |

`checkArticles.js --staged` also parses the frontmatter of staged articles on **both** sites (any date) and rejects
image fields with stray quotes/commas or a malformed CDN URL. `DATATIMES_HOOK_CHAINED` stops the two pre-commit
hooks from calling each other in a loop.

* **Merges:** while `MERGE_HEAD` exists, files taken byte-for-byte from the merged branch are skipped by the binary
  check and by the publish-`time` hook (they were committed and checked there; stamping them would change their
  sort time). A file changed during the merge, or a binary that is not on the merged branch, is still blocked.

* **Activation (once per computer):** `git config core.hooksPath scripts/git-hooks`. Nothing sets it automatically on `npm install` (there is no `prepare` script). Check with `git config --show-origin --get-all core.hooksPath` – Claude worktrees may carry their own copy in `.git/worktrees/<name>/config.worktree`.
* **Behavior:** Inspects only **newly added** files (`--diff-filter=A`). If a new image/video (`png, jpg/jpeg, webp, gif, mp4, webm, mov, tiff, svg`) is staged, the commit is rejected with instructions.
* **Backwards Compatibility:** Modifying existing text in older articles that reference legacy files in `public/` is never blocked.
* **Emergency Bypass:** with `scripts/git-hooks` use `ALLOW_MEDIA_COMMIT=1 git commit …` – it skips only the binary check, the article checks still run. `git commit --no-verify` skips every hook (including `checkArticles`), so use it only with `.githooks`, for rare exceptions like essential favicon updates.
* Keep one copy of the rule: change extensions or messages in `.githooks/pre-commit`; `scripts/git-hooks/pre-commit` only calls it.
