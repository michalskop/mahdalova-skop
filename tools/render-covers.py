#!/usr/bin/env python3
"""Run the shared cover renderer from Python without duplicating its layout."""

import argparse
from pathlib import Path
import shutil
import subprocess


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate all four covers and an editable project with the editor's renderer."
    )
    parser.add_argument("project", type=Path, help="Input cover-project.json")
    parser.add_argument("output", type=Path, help="Output directory")
    parser.add_argument("--force", action="store_true", help="Replace existing outputs")
    args = parser.parse_args()

    if not args.project.is_file():
        parser.error(f"Project not found: {args.project}")
    node = shutil.which("node")
    if node is None:
        parser.error("Node.js is required by the shared renderer but was not found in PATH.")

    command = [
        node,
        str(Path(__file__).with_suffix(".cjs")),
        str(args.project.resolve()),
        str(args.output.resolve()),
    ]
    if args.force:
        command.append("--force")
    try:
        return subprocess.run(command, check=False).returncode
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
