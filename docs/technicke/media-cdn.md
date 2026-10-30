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
3. **Machine-Readable JSON Output:** AI agents parse the returned JSON to extract the public URL automatically:
   ```json
   {
     "status": "success",
     "url": "https://media.datatimes.org/datatimes-cz/articles/2026/10/slug/chart.webp",
     "key": "datatimes-cz/articles/2026/10/slug/chart.webp",
     "bytes": 48210
   }
   ```

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

## 6. Pre-Commit Guardrail (`.githooks/pre-commit`)

A Git pre-commit hook is committed in `.githooks/pre-commit`.
* **Activation:** `git config core.hooksPath .githooks` (runs automatically on `npm install`).
* **Behavior:** Inspects only **newly added** files (`--diff-filter=A`). If a new binary image/video is staged, the commit is rejected with instructions.
* **Backwards Compatibility:** Modifying existing text in older articles that reference legacy files in `public/` is never blocked.
* **Emergency Bypass:** `git commit --no-verify` (for rare exceptions like essential favicon updates).
