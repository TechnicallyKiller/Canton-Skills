# Scripts

Repo tooling for authoring and validating skills.

| Script | Purpose |
|--------|---------|
| [`validate_skills.py`](validate_skills.py) | Lint every `skills/*/SKILL.md`: valid YAML frontmatter, required `name`/`description`, name matches folder, description length sane, body present. Run in CI. |

## Usage

```bash
python scripts/validate_skills.py
```

Exit code is non-zero if any skill fails validation, so it can gate CI.

Planned additions (as the catalog matures):

- `build_catalog.py` — regenerate `skills.json` and the README table from frontmatter.
- `check_examples.py` — compile every `examples/*.daml` against the pinned SDK.
