# -*- coding: utf-8 -*-
"""
Jednorázová extrakce TSV dat vložených do chatu: vytáhne z přepisu konverzace
(jsonl) POSLEDNÍ vložený export (ten s českými názvy zemí) a uloží ho jako
countries_map_raw.tsv – bez ručního přepisování, tedy bez rizika chyb v číslech.
"""

import io
import json
import re
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

TRANSCRIPT = Path(
    r"C:\Users\datov\.claude\projects"
    r"\C--Users-datov-Desktop-mahdalova-skop-projekty-mahdalova-skop"
    r"--claude-worktrees-kviff-special-responsive-content-b48071"
    r"\78e16a98-d07e-4d0c-ae30-b48f45d26021.jsonl"
)
OUT = Path(__file__).parent / "countries_map_raw.tsv"

HEADER_START = "První účast na KVIFF\tZemě\t"
ROW_RE = re.compile(r"^07\.01\.\d{4}\t")


def iter_user_texts(path):
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            message = record.get("message") or {}
            if message.get("role") != "user":
                continue
            content = message.get("content")
            if isinstance(content, str):
                yield content
            elif isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "text":
                        yield part.get("text", "")


def extract_tsv(text):
    idx = text.find(HEADER_START)
    if idx == -1:
        return None
    lines = text[idx:].splitlines()
    rows = [lines[0]]
    for line in lines[1:]:
        if ROW_RE.match(line):
            rows.append(line)
        else:
            break
    return rows


def main():
    candidates = []
    for text in iter_user_texts(TRANSCRIPT):
        rows = extract_tsv(text)
        if rows and len(rows) > 100:
            candidates.append(rows)

    if not candidates:
        sys.exit("CHYBA: v přepisu jsem nenašla žádný TSV blok s hlavičkou.")

    # poslední vložená verze = ta s českými názvy
    rows = candidates[-1]
    czech = sum(1 for r in rows if "\tBrazílie\t" in r or "\tČeská republika\t" in r)
    print(f"Nalezeno {len(candidates)} vložených verzí dat; beru poslední.")
    print(f"Řádků (vč. hlavičky): {len(rows)}; kontrola českých názvů: "
          f"{'OK' if czech else 'POZOR – vypadá to na anglickou verzi!'}")

    OUT.write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"Zapsáno: {OUT}")


if __name__ == "__main__":
    main()
