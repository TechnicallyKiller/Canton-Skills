# Canton Dev Skills — Website Plan

A showcase site to pitch the catalog to Canton Network + onboard developers. Plan
first; build after sign-off. Reference: midnight-skills.netlify.app (structure) ·
canton.network + zenith.network (visual identity).

## 1. Goal & audience

- **Primary:** pitch to Canton Network / ecosystem — "this is a real, verified product."
- **Secondary:** developers who want the skills — clear value + one-command install.
- **The one thing a visitor must leave with:** *"agents build correct Canton/Daml/
  Zenith code with these, and it's been proven — `npx skills add …`."*

## 2. Design system (fused from Canton + Zenith + Midnight)

**Theme:** dark, institutional yet developer-technical. Canton's premium-navy gravitas
+ Zenith's electric-blue gradient energy + Midnight's terminal/skill-node structure.

**Palette** (derived from the live sites' visual identity; *tune to exact brand hex at
build time — can pixel-sample canton.network / zenith.network if you want a pixel match*):

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#080B14` | page background (near-black navy) |
| `surface` | `#0F1524` | cards |
| `surface-2` | `#141C30` | raised/hover |
| `border` | `#1E2740` | hairlines |
| `text` | `#E6EAF2` | primary text |
| `muted` | `#8A96B0` | secondary text |
| `accent` | `#4F7DFF` | Zenith electric blue — primary accent/CTA |
| `accent-2` | `#22D3EE` | cyan — Canton "flow/privacy" secondary |
| `glow` | gradient `#4F7DFF → #22D3EE` | headline gradient, CTA, hero glow |

**Badge colors** (verification): ✅ `#34D399` · 🔎 `#FBBF24` · 📄 `#94A3B8` · 🧪 `#A78BFA`.

**Typography:**
- Headings: **Space Grotesk** (geometric, techy-institutional — bridges both brands).
- Body: **Inter**.
- Mono: **JetBrains Mono** (skill names, CLI, code — the dev/agent signal + Midnight nod).

**Motion / feel:** restrained. Hero gradient drift, fade/slide-in on scroll, subtle
card hover-lift + border glow. Institutional, not flashy. Respect `prefers-reduced-motion`.

**Imagery:** no stock photos — abstract **synchronized-network** motifs via CSS
gradients + SVG line-art (nods to Canton's "synchronizer/flow" visuals). A faint grid /
constellation in the hero.

## 3. Information architecture

```
/                 Landing (the pitch, end to end)
/skills           Skill browser (filterable grid of all 12)
/skills/[name]    Skill detail (rendered from SKILL.md)
/benchmark        "Why it works" — the proof (or a deep section on /)
/install          CLI usage across agents (or a section on /)
```

### Landing (/) — section order
1. **Nav** — wordmark "Canton Dev Skills" · links: Skills · Why it works · Install · GitHub.
2. **Hero** — gradient. Headline (gradient text): *"Teach your AI agent to build on
   Canton — correctly."* Sub: *"Portable skills (Claude · Cursor · Gemini) for Canton
   Network, Daml, and Zenith/EVM — that correct the mistakes agents make by default."*
   Inline install command with copy button. CTAs: **Browse skills** / **See the proof**.
3. **Works-with strip** — Claude Code · Cursor · Gemini · Codex · Copilot (wordmarks).
4. **The insight** — *"Canton isn't an EVM chain. Agents get it wrong by default."*
   Four pillar cards: privacy-first · no global ledger · structural authorization ·
   EVM→Canton translation.
5. **The proof (benchmark)** — the headline number: **with skill 3/3 compiles ·
   without 0/3**. Show the verbatim contract-keys diff (red ❌ `key…` vs green ✅). Caption:
   *"Same task, same model (Sonnet). Compile-verified on Daml SDK 3.4.11."*
6. **Catalog preview** — grid of 12 skill cards grouped by track (below), each with
   name, one-liner, verification badge. Link → /skills.
7. **Dogfooding story** — *"We built a real app with it. It caught a dozen issues.
   Here they are."* → links to feedback/ + the invoice-financing app.
8. **Install** — the CLI, per-agent note, "single source → every agent."
9. **Footer** — links, license (MIT), "independent community catalog" disclaimer.

### Skill tracks (grouping used on landing + browser)
- **Foundations:** canton-mental-models
- **Daml modeling:** daml-language · daml-authorization-patterns · daml-testing · daml-contract-upgrades
- **App integration:** canton-ledger-api · canton-app-architecture · canton-token-standard
- **Ops & lifecycle:** canton-deployment · canton-production-ops · canton-wallet-integration
- **EVM / Zenith:** canton-evm 🧪

### Skill detail (/skills/[name])
Render the skill from its `SKILL.md`: title, verification badge, the frontmatter
`description` as a lede, the markdown body (anti-pattern tables, examples), an
"install just this skill" command, and a "view source" link.

## 4. Tech stack

- **Astro + Tailwind CSS**, deployed to **Netlify** (matches the reference; static, fast,
  trivial deploy). Tailwind config encodes the design tokens above.
- **Content is driven by the catalog itself** — single source of truth:
  - `skills.json` → the catalog list, tracks, phases, stages.
  - each `skills/<name>/SKILL.md` → parsed via Astro content collections; frontmatter
    (`name`, `description`) for cards, body rendered for detail pages.
  - A small `verification` map (or a new field in `skills.json`) → the badge per skill.
- Fonts via Fontsource (self-hosted, no FOUC). `netlify.toml` for build (`astro build`).
- SEO/OG: meta + a generated OG image; favicon.

## 5. Build phases

1. **Scaffold** — Astro + Tailwind + design tokens; base layout, nav, footer, fonts.
2. **Landing** — hero → works-with → insight → benchmark → catalog preview → dogfooding
   → install. (Most of the pitch value lands here.)
3. **Skill browser + detail** — content collection over `SKILL.md`; grid + dynamic pages.
4. **Polish & ship** — motion, full responsive, OG/meta/favicon, accessibility pass,
   Netlify deploy.

## 6. Open decisions (confirm before/while building)

1. **Repo visibility** — the install button needs the repo **public** to work for
   visitors. Flip before launch (or the buttons are decorative).
2. **Exact brand hex** — palette above is derived from the sites' look; say the word and
   I'll pixel-sample canton.network/zenith.network for an exact match.
3. **Site location** — recommend `site/` **inside the catalog repo** (content stays in
   sync with the skills; Netlify deploys the subdir). Alt: separate repo.
4. **Domain** — Netlify subdomain (e.g. `canton-dev-skills.netlify.app`) vs custom.
5. **Naming/wordmark** — "Canton Dev Skills" vs a product name.

## 7. Honesty guardrails (carry the catalog's ethos onto the site)

- Show the **real** verification badges, including 🧪 preview for canton-evm — don't
  imply everything is battle-tested.
- The benchmark is **n=3, one task** — label it as a demonstration, link to the method,
  don't overclaim a broad statistical result.
- "Independent community catalog" — don't imply official Canton endorsement.
