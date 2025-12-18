#!/usr/bin/env python3
"""
merge_codes.py

Merge code/text files into a single file with this block format per file:

path: <relative/path/to/file>
name of the file: <filename.ext>
content:
<file content>

Separated by a dashed line.

Behavior:
- Includes ALL files (regular files) under 'src/' recursively (if src exists).
- Includes top-level files located beside 'src' (files directly under the root dir).
- Excludes other directories (i.e., files inside other top-level directories are NOT included).
- Skips the output file itself to avoid recursion.
- Attempts to decode files using utf-8, utf-16, then latin-1.
"""

import argparse
from pathlib import Path
import sys

SEPARATOR = "\n" + "-" * 80 + "\n\n"


def detect_and_read_text(file_path: Path):
    """Try to read file as text. Try utf-8, utf-16, latin-1 in that order.
    Returns (text, encoding) or (None, None) if unreadable as text.
    """
    raw = file_path.read_bytes()
    for enc in ("utf-8", "utf-16", "latin-1"):
        try:
            text = raw.decode(enc)
            return text, enc
        except Exception:
            continue
    return None, None


def gather_files(root: Path, output_name: str):
    """Return list of Paths to include in desired order:
    1. top-level files (beside src) in sorted order
    2. all files under src/ recursively (sorted by relative path)
    """
    files = []
    root = root.resolve()
    src_dir = root / "src"

    # 1) Top-level files (files directly under root)
    for entry in sorted(root.iterdir()):
        if entry.is_file():
            # skip output file itself
            if entry.name == output_name:
                continue
            files.append(entry)

    # 2) Files under src (if exists)
    if src_dir.exists() and src_dir.is_dir():
        # use sorted list of relative paths for deterministic order
        src_files = sorted([p for p in src_dir.rglob("*") if p.is_file()])
        files.extend(src_files)

    # Remove duplicates while preserving order (in case some top-level file is inside src, unlikely)
    seen = set()
    ordered = []
    for p in files:
        rp = str(p.resolve())
        if rp not in seen:
            seen.add(rp)
            ordered.append(p)
    return ordered


def merge_files(root: Path, out_path: Path):
    files = gather_files(root, out_path.name)
    if not files:
        print("No files found to merge.", file=sys.stderr)
        return 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="\n") as outf:
        for idx, f in enumerate(files, start=1):
            rel = f.relative_to(root)
            print(f"[{idx}/{len(files)}] Including: {rel}")
            text, enc = detect_and_read_text(f)
            if text is None:
                print(f"  -> Skipping (non-text or unreadable): {rel}", file=sys.stderr)
                continue

            # Write in requested format
            outf.write(f"path: {rel}\n")
            outf.write(f"name of the file: {f.name}\n")
            outf.write("content:\n")
            outf.write(text)
            # Ensure newline at end
            if not text.endswith("\n"):
                outf.write("\n")
            outf.write(SEPARATOR)

    print(f"\nMerged {len(files)} entries (some may have been skipped) into: {out_path}")
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="Merge files under src/ and top-level files beside it into a single file."
    )
    parser.add_argument(
        "--root",
        "-r",
        type=str,
        default=".",
        help="Project root directory (default: current directory).",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="merged_codes.v",
        help="Output filename (default: merged_codes.v).",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        print(f"Root path does not exist or is not a directory: {root}", file=sys.stderr)
        sys.exit(2)

    out_path = root / args.output
    code = merge_files(root, out_path)
    sys.exit(code)


if __name__ == "__main__":
    main()
