#!/usr/bin/env python3
"""Validate every skills/*/SKILL.md in this repo.

Checks, per skill:
  - SKILL.md exists
  - YAML frontmatter parses and is a mapping
  - required keys present: name, description
  - `name` matches the skill's folder name
  - `description` is a non-trivial length (triggering depends on it)
  - a non-empty markdown body follows the frontmatter

Exits non-zero on any failure so it can gate CI. Pure stdlib except for an
optional PyYAML import; falls back to a tiny frontmatter parser if PyYAML is
absent so it runs anywhere.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
MIN_DESCRIPTION_CHARS = 60


def split_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter_block, body). Raises ValueError if no frontmatter."""
    if not text.startswith("---"):
        raise ValueError("file does not start with '---' frontmatter fence")
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError("frontmatter is not closed with a second '---'")
    return parts[1], parts[2]


def parse_frontmatter(block: str) -> dict:
    try:
        import yaml  # type: ignore

        data = yaml.safe_load(block)
        return data or {}
    except ImportError:
        # Minimal fallback: top-level "key: value" pairs, supports >- folded
        # scalars by joining indented continuation lines.
        result: dict[str, str] = {}
        lines = block.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i]
            if not line.strip() or line.lstrip().startswith("#"):
                i += 1
                continue
            if ":" in line and not line.startswith((" ", "\t")):
                key, _, val = line.partition(":")
                key = key.strip()
                val = val.strip()
                if val in (">-", ">", "|", "|-"):
                    collected = []
                    i += 1
                    while i < len(lines) and (lines[i].startswith((" ", "\t")) or not lines[i].strip()):
                        collected.append(lines[i].strip())
                        i += 1
                    result[key] = " ".join(c for c in collected if c)
                    continue
                result[key] = val.strip().strip("'\"")
            i += 1
        return result


def validate_skill(skill_dir: Path) -> list[str]:
    errors: list[str] = []
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        return [f"{skill_dir.name}: missing SKILL.md"]

    text = skill_md.read_text(encoding="utf-8")
    try:
        fm_block, body = split_frontmatter(text)
    except ValueError as exc:
        return [f"{skill_dir.name}: {exc}"]

    fm = parse_frontmatter(fm_block)

    name = fm.get("name")
    if not name:
        errors.append(f"{skill_dir.name}: frontmatter missing 'name'")
    elif name != skill_dir.name:
        errors.append(f"{skill_dir.name}: name '{name}' != folder '{skill_dir.name}'")

    desc = fm.get("description")
    if not desc:
        errors.append(f"{skill_dir.name}: frontmatter missing 'description'")
    elif len(desc) < MIN_DESCRIPTION_CHARS:
        errors.append(
            f"{skill_dir.name}: description too short ({len(desc)} chars); "
            "it is the trigger — make it specific"
        )

    if not body.strip():
        errors.append(f"{skill_dir.name}: empty body after frontmatter")

    return errors


def main() -> int:
    if not SKILLS_DIR.is_dir():
        print(f"ERROR: no skills/ directory at {SKILLS_DIR}", file=sys.stderr)
        return 2

    skill_dirs = sorted(p for p in SKILLS_DIR.iterdir() if p.is_dir())
    if not skill_dirs:
        print("ERROR: no skills found", file=sys.stderr)
        return 2

    all_errors: list[str] = []
    for skill_dir in skill_dirs:
        all_errors.extend(validate_skill(skill_dir))

    if all_errors:
        print("Skill validation FAILED:\n")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print(f"OK: {len(skill_dirs)} skills valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
