"""Reproduce the corrected vote counts and funding comparison from primary sources.

Run with Python 3; extracting the CT budget requires pdftotext on PATH.
The funding comparison uses planned 2026 fee revenue, not total budgets or
actual collections. Sources are downloaded on each run; no files are changed.
"""

import io
import json
import re
import subprocess
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path


class PageText(HTMLParser):
    """Collect text nodes from the parliamentary and broadcaster pages."""

    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def download(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read(), response.headers.get_content_charset() or "utf-8"


def page_text(url):
    body, charset = download(url)
    parser = PageText()
    parser.feed(body.decode(charset))
    return " ".join(" ".join(parser.parts).split())


def vote_counts(url, parties):
    text = page_text(url)
    result = {"source": url, "parties": {}}
    for party in parties:
        match = re.search(re.escape(party) + r"\s*\(([^)]*)\)", text)
        if not match:
            raise ValueError(f"Party summary missing: {party}")
        result["parties"][party] = {
            label: int(value)
            for label, value in re.findall(r"([ANZM0])\s+[^:]+:\s*(\d+)", match[1])
        }
    return result


def funding_comparison():
    bill_url = "https://www.psp.cz/sqw/text/orig2.sqw?idd=277414"
    body, _ = download(bill_url)
    with zipfile.ZipFile(io.BytesIO(body)) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
    text = " ".join("".join(document.itertext()).split())
    amounts = re.findall(r"Příspěvek pro rok 2027 činí celkem\s+([\d\s]+)\s*Kč", text)
    if len(amounts) != 2:
        raise ValueError("Expected the two statutory contributions in bill 231/0")
    contributions = [int("".join(amount.split())) for amount in amounts]

    ct_url = "https://www.ceskatelevize.cz/vse-o-ct/api/media/documents/Rozpocet_Ceske_televize_na_rok_2026.pdf"
    body, _ = download(ct_url)
    with tempfile.TemporaryDirectory() as directory:
        pdf = Path(directory) / "budget.pdf"
        pdf.write_bytes(body)
        text = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True)
    match = re.search(r"příjem z televizních poplatků\s+(\d[\d ]*?)\s{2,}", text)
    if not match:
        raise ValueError("CT planned fee revenue missing; inspect the budget table")
    ct_revenue = int(match[1].replace(" ", "")) * 1000

    cro_url = "https://informace.rozhlas.cz/cesky-rozhlas-planuje-v-roce-2026-hospodarit-s-vyrovnanym-rozpoctem-9583634"
    text = page_text(cro_url)
    match = re.search(r"výnosy z rozhlasových poplatků:\s*([\d\s]+,\d+)\s*mil", text)
    if not match:
        raise ValueError("CRO planned fee revenue missing")
    cro_revenue = int(Decimal("".join(match[1].split()).replace(",", ".")) * 1000000)
    planned = ct_revenue + cro_revenue
    reduction = planned - sum(contributions)
    return {
        "sources": [bill_url, ct_url, cro_url],
        "contributions_2027_czk": dict(zip(["CT", "CRO"], contributions)),
        "planned_fee_revenue_2026_czk": {"CT": ct_revenue, "CRO": cro_revenue},
        "reduction_czk": reduction,
        "reduction_percent": str(Decimal(reduction) * 100 / planned),
    }


if __name__ == "__main__":
    report = {
        "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
        "vote_codes": {"A": "yes", "N": "no", "Z": "abstained", "M": "excused", "0": "not registered"},
        "vote_2004": vote_counts("https://www.psp.cz/sqw/hlasy.sqw?G=36103", ["ODS", "KSČM"]),
        "vote_2005": vote_counts("https://www.psp.cz/sqw/hlasy.sqw?G=39660", ["ODS", "KSČM"]),
        "funding": funding_comparison(),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
