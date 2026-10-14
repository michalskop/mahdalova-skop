"""Validate the supplement against the frozen audit and primary ČSÚ XML/registry.

Usage: python validate_zero_supplement.py /path/to/runs/20261011_1556_refresh
Run after build.py; the original generator retains its 65-row selection.
The audit supplies frozen model expectations, not proposed official corrections.
"""

import argparse
import csv
import hashlib
import json
import math
import statistics
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
NS = "{http://www.volby.cz/kv/}"


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def key(row):
    return row["kodzastup"], row["obec"], row["okrsek"]


def zero_key(row):
    return row["unit"], row["obec"], row["station"]


def size(share):
    return "big" if share >= 10 else "middle" if share >= 2 else "small"


def validate(run):
    original = read_csv(HERE / "vstupy/podezrele_okrsky.csv")
    merged = read_csv(HERE / "vstupy/found-cases-with-zeros.csv")
    zeros = read_csv(HERE / "vstupy/priority-zero-cases.csv")
    assert len(original) == 65 and len(merged) == 78 and len(zeros) == 17
    by_key = {key(row): row for row in merged}
    assert len(by_key) == 78
    assert [key(row) for row in merged[:65]] == [key(row) for row in original]
    for before, after in zip(original, merged):
        assert all(before[col] == after[col] for col in before if col != "silna_strana_s_nulou")
    original_keys = {key(row) for row in original}
    assert sum(zero_key(row) in original_keys for row in zeros) == 4
    assert len(set(by_key) - original_keys) == 13
    assert all(not row["chybi_hlasu_odhad"] for row in merged[65:])

    inventory_path = run / "raw_kv_final_inventory.csv"
    inventory = read_csv(inventory_path)
    precincts = {(r["unit"], r["obec"], r["okrsek"]): r for r in inventory if r["ward"] == "1"}
    utilisation = defaultdict(list)
    for row in inventory:
        if int(row["valid_ballots"]) > 0 and int(row["seats"]) > 0:
            utilisation[(row["unit"], row["ward"])].append(
                100 * int(row["vote_sum"]) / (int(row["valid_ballots"]) * int(row["seats"])))
    source_paths = {inventory_path, run / "low_count_audit/flagged_entries.csv",
                    run / "low_count_audit/all_entries.csv"}
    xml_precincts = {}
    files = {precincts[key(row)]["file"] for row in merged}
    files.update(precincts[("582786", "551074", station)]["file"] for station in ("8001", "8003"))
    for filename in sorted(files):
        path = run / "sources/real/raw/kv" / filename
        source_paths.add(path)
        for node in ET.parse(path).getroot().findall(NS + "OKRSEK"):
            a = node.attrib
            k = (a["KODZASTUP"], a["CIS_OBEC"], a["CIS_OKRSEK"])
            # Inventory identifies the final batch/sequence for each result.
            if a["CIS_OBVODU"] == "1" and k in precincts and a["PORADI_ZPRAC"] == precincts[k]["seq"]:
                xml_precincts[k] = node
    for row in merged:
        k = key(row)
        raw = xml_precincts[k].find(NS + "UCAST_OKRSEK").attrib
        assert raw["PLATNE_LISTKY"] == row["platne_listky"] == precincts[k]["valid_ballots"]
        assert raw["PLATNE_HLASY"] == precincts[k]["vote_sum"]
        actual = 100 * int(raw["PLATNE_HLASY"]) / (int(raw["PLATNE_LISTKY"]) * int(precincts[k]["seats"]))
        assert f"{actual:.1f}" == row["vyuziti_pct"], (k, actual)
        if k not in original_keys:
            assert row["median_mesta_pct"] == f"{statistics.median(utilisation[(k[0], '1')]):.1f}"

    registry = run / "sources/municipal/raw/kv2026_reg_1002/csv_od"
    labels_path, roster_path = registry / "kvros.csv", registry / "kvrk.csv"
    source_paths.update((labels_path, roster_path))
    labels = {(r["KODZASTUP"], r["COBVODU"], r["POR_STR_HL"]): r["NAZEVCELK"] for r in read_csv(labels_path)}
    caps = defaultdict(int)
    with roster_path.open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            if row["PLATNOST"] == "A":
                caps[(row["KODZASTUP"], row["COBVODU"], row["POR_STR_HL"])] += 1
    totals, party_totals = defaultdict(int), defaultdict(int)
    with (run / "low_count_audit/all_entries.csv").open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            totals[row["dataset"]] += int(row["reported_count"])
            party_totals[(row["dataset"], row["ballot_no"])] += int(row["reported_count"])
    source_zeros = []
    for row in read_csv(run / "low_count_audit/flagged_entries.csv"):
        if (int(row["reported_count"]) == 0 and row["explicitly_present"] == "True"
                and int(row["valid_registered_candidates"]) > 0
                and int(row["valid_ballots_or_senate_votes"]) >= 50
                and row["expected_count"] and int(row["reported_total"]) > 0
                and 100 * float(row["expected_count"]) / int(row["reported_total"]) >= 2):
            source_zeros.append(row)
    identity = lambda row: (*zero_key(row), row["ballot_no"])
    assert {identity(row) for row in source_zeros} == {identity(row) for row in zeros}
    audit_lookup = {identity(row): row for row in source_zeros}
    independent_only = []
    for zero in zeros:
        k = zero_key(zero)
        assert zero["kind"] == "kv" and zero["ward"] == "1"
        source = audit_lookup[identity(zero)]
        assert all(zero[col] == value for col, value in source.items())
        node = xml_precincts[k]
        votes = {n.attrib["POR_STR_HLAS_LIST"]: int(n.attrib["HLASY"]) for n in node.findall(NS + "HLASY_OKRSEK")}
        assert zero["ballot_no"] in votes and votes[zero["ballot_no"]] == 0
        registry_key = (zero["unit"], zero["ward"], zero["ballot_no"])
        assert labels[registry_key] == zero["label"]
        assert caps[registry_key] == int(zero["valid_registered_candidates"]) > 0
        assert zero["label"] in by_key[k]["silna_strana_s_nulou"]
        expected, independent = float(zero["expected_count"]), float(zero["independent_expected_count"])
        assert max(expected, independent) >= 100
        local_share = 100 * expected / int(zero["reported_total"])
        city_share = 100 * party_totals[(zero["dataset"], zero["ballot_no"])] / (totals[zero["dataset"]] - int(zero["reported_total"]))
        assert math.isclose(local_share, float(zero["expected_local_share_pct"]))
        assert math.isclose(city_share, float(zero["citywide_share_pct"]))
        assert size(local_share) == zero["expected_local_party_size"]
        assert size(city_share) == zero["citywide_party_size"]
        if expected < 100:
            independent_only.append({"contest": zero["contest"], "station": zero["station"],
                                     "conditional": expected, "independent_volume": independent})
    assert {row["station"] for row in independent_only} == {"1001", "1005"}

    article = (HERE.parent / "index.md").read_text()
    table = article.split("| Zastupitelstvo | Okrsek |", 1)[1].split("</div>", 1)[0]
    cells = [[c.strip() for c in line.strip().split("|")[1:-1]] for line in table.splitlines()[2:] if line.startswith("|")]
    assert len(cells) == 78
    integer = lambda value: f"{int(value):,}".replace(",", "\u00a0") if value else "–"
    for row, actual in zip(merged, cells):
        expected = ["Praha (město)" if row["zastupitelstvo"] == "Praha hl.m." else row["zastupitelstvo"],
                    row["okrsek"], integer(row["platne_listky"]), row["vyuziti_pct"].replace(".", ",") + " %",
                    row["median_mesta_pct"].replace(".", ",") + " %", integer(row["chybi_hlasu_odhad"]),
                    row["silna_strana_s_nulou"] or "–"]
        assert actual == expected, (actual, expected)
    brno = next(row for row in zeros if zero_key(row) == ("582786", "551074", "8002"))
    neighbours = {}
    for station in ("8001", "8003"):
        node = xml_precincts[("582786", "551074", station)]
        votes = {n.attrib["POR_STR_HLAS_LIST"]: int(n.attrib["HLASY"]) for n in node.findall(NS + "HLASY_OKRSEK")}
        neighbours[station] = round(100 * votes["3"] / sum(votes.values()), 1)
    assert neighbours == {"8001": 4.8, "8003": 5.6}
    assert brno["returned"] == "391" and brno["valid_ballots_or_senate_votes"] == "359"
    assert round(float(brno["expected_count_min_setting"]) / 10) * 10 == 1100
    assert round(float(brno["expected_count_max_setting"]) / 10) * 10 == 1370
    report = {"original_rows": 65, "merged_unique_results": 78, "priority_zeros": 17,
              "overlap": 4, "new_results": 13, "original_values_and_order_preserved": True,
              "primary_xml_and_registry_checks": "passed", "markdown_csv_agreement": "passed",
              "brno_8002_neighbour_shares_pct": neighbours, "independent_volume_only": independent_only,
              "frozen_run": run.name, "source_sha256": {str(p.relative_to(run)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(source_paths)}}
    (HERE / "zero-review-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k != "source_sha256"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("frozen_run", type=Path)
    validate(parser.parse_args().frozen_run)
