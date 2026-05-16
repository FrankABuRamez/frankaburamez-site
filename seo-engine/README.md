# seo-engine — programmatic SEO page generator

YAML in, static HTML out. Generates ~80 pages across 4 niches (solo founders, crypto, dev tools, content marketers), 4 niche overview pages, and ~12 category index pages — all matching the existing Frank Trading Ops site template. No net calls. No external API dependencies. Bun + TypeScript only.

## Quick start

```bash
cd ~/projects/affiliate-site/seo-engine
bun install
bun run bin/generate.ts --niche all --dry-run --emit-preview
```

The dry-run prints a count of would-be-written pages and dumps 3 sample pages to `out/preview/` for review before anything touches the live site.

When the previews look right:

```bash
bun run bin/generate.ts --niche all --write
```

This writes only files that do **not** already exist at the target path. To overwrite existing files (use carefully — these go live on push to `main`):

```bash
bun run bin/generate.ts --niche all --write --force
```

## Where pages land

All generated pages are written under the live site's `blog/ai/` tree:

```
~/projects/affiliate-site/
├── blog/
│   ├── ai/
│   │   ├── solo-founders/
│   │   │   ├── index.html              ← niche overview
│   │   │   ├── chatgpt.html            ← tool page
│   │   │   ├── claude.html
│   │   │   └── ... (10 tools)
│   │   ├── crypto/
│   │   ├── dev-tools/
│   │   ├── content-marketers/
│   │   └── categories/
│   │       ├── writing.html
│   │       ├── code-completion.html
│   │       └── ... (one per category that has tools)
│   └── (existing crypto blog posts stay untouched)
```

## Output volume

- 4 niches × 10 tools = **40 tool pages**
- 4 niche overviews
- 12-18 category pages (one per used category)

**Total: 56-62 pages** per full run. Adding more tools or splitting a niche into sub-niches scales linearly.

## How to add a new tool

1. Open `data/niches/<niche>.yaml`.
2. Append a new tool entry. Required fields:

```yaml
- name: ToolName
  slug: tool-slug                      # lowercase, dash-separated, unique within file
  category: writing                    # must exist in data/categories.yaml
  one_liner: "One-sentence pitch."
  official_url: "https://example.com"
  affiliate_url: "TODO_AFFILIATE_LINK" # replace with your real affiliate link
  pricing_tiers:
    - "Free — limited"
    - "Pro — $20/mo"
  recurring_commission_pct: "30% recurring (TODO_VERIFY)"  # confirm before launch
  strengths:
    - "Strength 1"
    - "Strength 2"
    - "Strength 3"
  weaknesses:
    - "Weakness 1"
    - "Weakness 2"
    - "Weakness 3"
  best_for: "Short description of the ideal user."
  alternative_slugs: [chatgpt, claude, gemini]   # 3-5 sibling slugs (must exist somewhere)
```

3. The schema validator enforces: 10 tools per niche file, exactly 3 strengths and 3 weaknesses, all referenced categories exist, and at least 3 `alternative_slugs`. It throws `SchemaError` on the first miss with a clear field path.

## How to add a new niche

1. Create `data/niches/<your-niche>.yaml` with the same shape as the existing four.
2. Run `bun run bin/generate.ts --niche your-niche --dry-run --emit-preview` to verify schema and preview output.
3. Run with `--write` when ready.

The niche file must declare its `niche.slug`, `niche.name`, `niche.audience`, and `niche.intent`, then a `tools:` list of exactly 10 entries.

## How to add a category

Open `data/categories.yaml` and append:

```yaml
- slug: my-new-category
  name: My New Category
  intent: "What this category is for in one sentence."
  description: "A 1-2 sentence description for the category index page."
```

A category is only rendered as its own page if at least one tool references it via the tool's `category` field.

## Affiliate links — important workflow

Every tool starts with `affiliate_url: TODO_AFFILIATE_LINK` and `recurring_commission_pct` flagged `TODO_VERIFY` where the rate is not publicly confirmed. Before pushing pages live:

1. Sign up to the vendor's partner program.
2. Replace `TODO_AFFILIATE_LINK` with the real partner URL.
3. Replace `TODO_VERIFY` with the confirmed rate from the partner dashboard.
4. Re-run the generator with `--write --force` to overwrite the placeholder pages.

The site's existing affiliate disclosure (`Some links on this site may be affiliate links...`) is replicated in every generated page footer — no separate disclosure work needed.

## Schema validation errors

The loader fails fast with a precise error path:

```
SchemaError: ... data/niches/crypto.yaml :: tools[arkham].category — category "research-bad" not in taxonomy
```

To fix: either add the missing category to `data/categories.yaml`, or correct the typo in the tool entry.

## Constraints (by design)

- **No network calls during build.** YAML is the only data source.
- **Dry-run by default** — `--write` is required to touch the site.
- **No overwrite by default** — `--force` is required to replace existing files.
- **No git push, no auto-commit.** Frank reviews and ships manually.
- **No PII or secrets in YAML.** The whole tree is committed to the public repo.

## Files

```
seo-engine/
├── bin/generate.ts          ← CLI entrypoint
├── src/
│   ├── types.ts             ← strict TS types
│   ├── load.ts              ← YAML load + validate
│   ├── render.ts            ← markdown + HTML rendering
│   └── build.ts             ← orchestration (load → render → write)
├── data/
│   ├── categories.yaml      ← taxonomy
│   └── niches/
│       ├── solo-founders.yaml
│       ├── crypto.yaml
│       ├── dev-tools.yaml
│       └── content-marketers.yaml
├── out/preview/             ← human-review samples (created on --emit-preview)
├── package.json
├── tsconfig.json
└── README.md
```

## Why not Astro / Next / Hugo

The live site at `frankaburamez.tech` is hand-written static HTML with a single `styles.css` and a `gtag` analytics block. Adding a build framework just to ship 60 affiliate pages is overkill — the generator emits the same template the existing blog posts already use, deploys via the existing GitHub Actions workflow on push, and adds zero runtime dependencies to the site.
