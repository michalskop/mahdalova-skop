#!/usr/bin/env python3
"""
scripts/upload_media.py
Cross-platform CLI tool to upload static media to Backblaze B2 (media.datatimes.org).
Works out of the box on Linux, macOS, and Windows.

Reads credentials from:
  1. Current repository .env
  2. User home directory: ~/.datatimes-media.env (Linux/macOS)
     or C:\\Users\\<Username>\\.datatimes-media.env (Windows)
"""

import os
import sys
import argparse
import hashlib
import json
import mimetypes
import urllib.parse
import urllib.request
from pathlib import Path

PUBLIC_CDN_BASE = os.getenv("MEDIA_CDN_BASE", "https://media.datatimes.org")

# Explicit Content-Type map, checked before mimetypes.guess_type: on Windows the
# mimetypes module reads the registry, which often lacks .webp (and can return
# odd values for others), so the upload would fall back to application/octet-stream.
CONTENT_TYPES = {
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
}

def guess_content_type(key: str) -> str:
    ext = os.path.splitext(key)[1].lower()
    if ext in CONTENT_TYPES:
        return CONTENT_TYPES[ext]
    mime_type, _ = mimetypes.guess_type(key)
    return mime_type or "application/octet-stream"

def validate_target(raw: str) -> str:
    """Return the bucket key or exit. The key must be relative, e.g.
    datatimes-cz/articles/2026/10/slug/cover.webp. Git Bash rewrites an argument
    starting with '/' into a Windows path (/cover-og.jpg -> C:/Program Files/Git/cover-og.jpg),
    so absolute paths, drive letters and anything with ':' are refused, not "fixed"."""
    target = (raw or "").strip()
    problem = None
    if not target:
        problem = "--target is empty"
    elif target.startswith(("/", "\\")):
        problem = "--target must be relative to the bucket (no leading slash)"
    elif ":" in target:
        problem = "--target contains ':' (drive letter, URL or a path rewritten by Git Bash)"
    else:
        target = target.replace("\\", "/")
        parts = target.split("/")
        if any(part in ("", ".", "..") for part in parts):
            problem = "--target has an empty, '.' or '..' path segment"
        elif not os.path.splitext(parts[-1])[1]:
            problem = "--target must end with a file name including its extension"
    if problem:
        print(f"ERROR: {problem}: {raw!r}", file=sys.stderr)
        print("Expected e.g. datatimes-cz/articles/2026/10/<slug>/cover.webp", file=sys.stderr)
        print("(In Git Bash a path starting with '/' gets rewritten to C:/Program Files/Git/...)", file=sys.stderr)
        sys.exit(1)
    return target

def load_env():
    """Cross-platform config loader from .env or ~/.datatimes-media.env"""
    paths = [
        Path.cwd() / ".env",
        Path.home() / ".datatimes-media.env",
    ]
    env_vars = {}
    for p in paths:
        if p.is_file():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        if "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in env_vars:
                                env_vars[k] = v
            except Exception:
                pass

    key_id = os.getenv("B2_KEY_ID") or env_vars.get("B2_KEY_ID")
    app_key = (
        os.getenv("B2_APPLICATION_KEY")
        or os.getenv("B2_APP_KEY")
        or env_vars.get("B2_APPLICATION_KEY")
        or env_vars.get("B2_APP_KEY")
    )
    bucket = os.getenv("B2_BUCKET") or env_vars.get("B2_BUCKET") or "datatimes-media"

    return key_id, app_key, bucket

def b2_authorize(key_id: str, app_key: str) -> dict:
    import requests
    r = requests.get(
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
        auth=(key_id, app_key),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()

def b2_get_upload_url(api_url: str, auth_token: str, bucket_id: str) -> dict:
    import requests
    r = requests.post(
        f"{api_url}/b2api/v2/b2_get_upload_url",
        headers={"Authorization": auth_token},
        json={"bucketId": bucket_id},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()

def b2_check_exists(api_url: str, auth_token: str, bucket_id: str, file_name: str) -> bool:
    import requests
    r = requests.post(
        f"{api_url}/b2api/v2/b2_list_file_names",
        headers={"Authorization": auth_token},
        json={
            "bucketId": bucket_id,
            "startFileName": file_name,
            "maxFileCount": 1,
            "prefix": file_name,
        },
        timeout=30,
    )
    r.raise_for_status()
    files = r.json().get("files", [])
    return any(f.get("fileName") == file_name for f in files)

def sha1_file(path: Path) -> str:
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Upload media to media.datatimes.org")
    parser.add_argument("--file", required=True, help="Local file path")
    parser.add_argument("--target", required=True, help="Target path (e.g. datatimes-cz/articles/2026/10/slug/chart.webp)")
    parser.add_argument("--overwrite-unadvisable", action="store_true", help="Bypass collision refusal (not recommended)")
    parser.add_argument(
        "--url-only",
        action="store_true",
        help="Print only the public URL (for shell scripts; never cut the URL out of the JSON by hand)",
    )
    args = parser.parse_args()

    target_key = validate_target(args.target)
    content_type = guess_content_type(target_key)
    if content_type == "application/octet-stream":
        print(f"ERROR: Unknown content type for '{target_key}'; add its extension to CONTENT_TYPES.", file=sys.stderr)
        sys.exit(1)

    local_path = Path(args.file).resolve()
    if not local_path.is_file():
        print(f"ERROR: Local file not found: {local_path}", file=sys.stderr)
        sys.exit(1)

    key_id, app_key, bucket_name = load_env()
    if not key_id or not app_key:
        print("ERROR: Missing credentials. Please set B2_KEY_ID and B2_APPLICATION_KEY", file=sys.stderr)
        print("in .env or in ~/.datatimes-media.env (Linux/macOS) / %USERPROFILE%\\.datatimes-media.env (Windows)", file=sys.stderr)
        sys.exit(1)

    # Authorize with B2
    try:
        auth = b2_authorize(key_id, app_key)
    except Exception as e:
        print(f"ERROR: Failed to authorize with B2: {e}", file=sys.stderr)
        sys.exit(1)

    api_url = auth["apiUrl"]
    auth_token = auth["authorizationToken"]

    # Scoped keys automatically provide bucketId in auth response
    bucket_id = auth.get("allowed", {}).get("bucketId")
    if not bucket_id:
        import requests
        try:
            r = requests.post(
                f"{api_url}/b2api/v2/b2_list_buckets",
                headers={"Authorization": auth_token},
                json={"accountId": auth["accountId"]},
                timeout=30,
            )
            r.raise_for_status()
            for b in r.json().get("buckets", []):
                if b.get("bucketName") == bucket_name:
                    bucket_id = b.get("bucketId")
                    break
        except Exception:
            pass

    if not bucket_id:
        print(f"ERROR: Could not resolve bucket ID for '{bucket_name}'.", file=sys.stderr)
        sys.exit(1)

    # 1. Collision Refusal (--no-clobber)
    if not args.overwrite_unadvisable:
        try:
            if b2_check_exists(api_url, auth_token, bucket_id, target_key):
                print(f"ERROR: Collision Refusal! File already exists at: {target_key}", file=sys.stderr)
                print("Browsers and CDN cache assets for 1 year with 'immutable'.", file=sys.stderr)
                print("Append a version suffix (e.g. -v2) instead of overwriting.", file=sys.stderr)
                sys.exit(2)
        except Exception as e:
            print(f"WARNING: Could not verify remote collision: {e}", file=sys.stderr)

    # 2. Upload file
    upload_info = b2_get_upload_url(api_url, auth_token, bucket_id)
    upload_url = upload_info["uploadUrl"]
    upload_auth = upload_info["authorizationToken"]

    file_sha1 = sha1_file(local_path)
    cache_control = urllib.parse.quote("public, max-age=31536000, immutable")

    import requests
    headers = {
        "Authorization": upload_auth,
        "X-Bz-File-Name": urllib.parse.quote(target_key, safe="/"),
        "Content-Type": content_type,
        "X-Bz-Content-Sha1": file_sha1,
        "X-Bz-Info-b2-cache-control": cache_control,
    }

    with open(local_path, "rb") as f:
        resp = requests.post(upload_url, headers=headers, data=f, timeout=120)
        resp.raise_for_status()

    public_url = f"{PUBLIC_CDN_BASE}/{target_key}"

    # 3. Post-upload verification (Cloudflare answers 403 to the default Python-urllib User-Agent).
    # GET, not HEAD: the served bytes must match the upload and carry the expected Content-Type.
    edge_content_type = None
    try:
        req = urllib.request.Request(public_url, headers={"User-Agent": "datatimes-upload-media/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            edge_content_type = r.headers.get("Content-Type")
            body = r.read()
            verified = (
                r.status == 200
                and (edge_content_type or "").split(";")[0].strip() == content_type
                and hashlib.sha1(body).hexdigest() == file_sha1
            )
    except Exception:
        verified = False

    if args.url_only:
        print(public_url)
        if not verified:
            print(f"WARNING: public URL not verified (Content-Type at edge: {edge_content_type})", file=sys.stderr)
        return

    result = {
        "status": "success",
        "url": public_url,
        "key": target_key,
        "bytes": local_path.stat().st_size,
        "content_type": content_type,
        "verified_at_edge": verified,
        "edge_content_type": edge_content_type,
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
