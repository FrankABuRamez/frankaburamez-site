// Convert loaded data into Page objects.
// Each tool-in-niche page produces both a markdown intermediate (with
// frontmatter) and a full HTML file matching the existing Frank Trading Ops
// blog template at /home/frank/projects/affiliate-site/blog/*.html.
//
// Matching the existing template means the generated pages drop directly into
// the live site with no theme work and no broken links.

import { marked } from "marked";
import matter from "gray-matter";
import type {
  Bundle,
  Category,
  Frontmatter,
  Niche,
  NicheMeta,
  Page,
  Tool,
} from "./types.ts";

const SITE_BASE = "https://frankaburamez.tech";
const PUBLISHED = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/** Output is written under blog/ai/<niche>/ — the live site already serves /blog/. */
const OUTPUT_PREFIX = "blog/ai";

/** Convenience — build a relative path under the site root. */
function toolRelPath(nicheSlug: string, toolSlug: string): string {
  return `${OUTPUT_PREFIX}/${nicheSlug}/${toolSlug}.html`;
}
function nicheOverviewRelPath(nicheSlug: string): string {
  return `${OUTPUT_PREFIX}/${nicheSlug}/index.html`;
}
function categoryRelPath(catSlug: string): string {
  return `${OUTPUT_PREFIX}/categories/${catSlug}.html`;
}

/** Resolve up to 3 sibling tools in the same niche for comparison. */
function resolveSiblings(
  niche: Niche,
  tool: Tool,
): readonly Tool[] {
  const siblings: Tool[] = [];
  // Prefer alternative_slugs that exist in THIS niche first (best comparison).
  for (const altSlug of tool.alternative_slugs) {
    if (siblings.length >= 3) break;
    const found = niche.tools.find((t) => t.slug === altSlug);
    if (found && found.slug !== tool.slug) siblings.push(found);
  }
  // Fallback: fill from same category in the niche.
  if (siblings.length < 3) {
    for (const t of niche.tools) {
      if (siblings.length >= 3) break;
      if (t.slug === tool.slug) continue;
      if (siblings.find((s) => s.slug === t.slug)) continue;
      if (t.category === tool.category) siblings.push(t);
    }
  }
  // Last fallback: any tool in the niche.
  if (siblings.length < 3) {
    for (const t of niche.tools) {
      if (siblings.length >= 3) break;
      if (t.slug === tool.slug) continue;
      if (siblings.find((s) => s.slug === t.slug)) continue;
      siblings.push(t);
    }
  }
  return siblings;
}

/** Markdown table of pricing for a tool. */
function pricingTable(tool: Tool): string {
  const rows = tool.pricing_tiers.map((tier) => `- ${escapeMd(tier)}`).join("\n");
  return rows;
}

/** Comparison table — Tool vs 3 siblings. */
function comparisonTable(tool: Tool, siblings: readonly Tool[]): string {
  const headerCols = ["Aspect", tool.name, ...siblings.map((s) => s.name)];
  const headerRow = `| ${headerCols.join(" | ")} |`;
  const sep = `| ${headerCols.map(() => "---").join(" | ")} |`;
  const dataRows: string[] = [
    `| Category | ${tool.category} | ${siblings.map((s) => s.category).join(" | ")} |`,
    `| Starting price | ${escapeCell(tool.pricing_tiers[0] ?? "—")} | ${siblings.map((s) => escapeCell(s.pricing_tiers[0] ?? "—")).join(" | ")} |`,
    `| Recurring commission | ${escapeCell(tool.recurring_commission_pct)} | ${siblings.map((s) => escapeCell(s.recurring_commission_pct)).join(" | ")} |`,
    `| Best for | ${escapeCell(tool.best_for)} | ${siblings.map((s) => escapeCell(s.best_for)).join(" | ")} |`,
  ];
  return [headerRow, sep, ...dataRows].join("\n");
}

/** Escape pipes inside table cells. */
function escapeCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** Light markdown escape for inline content — only `|` matters in tables; `<>` only in HTML. */
function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|");
}

/** Internal-link footer — siblings, niche overview, category page. */
function internalLinkFooter(
  tool: Tool,
  niche: Niche,
  siblings: readonly Tool[],
  categoriesBySlug: ReadonlyMap<string, Category>,
): string {
  const sibLinks = siblings
    .map(
      (s) =>
        `- [${s.name}](/${toolRelPath(niche.meta.slug, s.slug)}) — ${escapeMd(s.one_liner)}`,
    )
    .join("\n");
  const cat = categoriesBySlug.get(tool.category);
  const catLink = cat
    ? `- [Category: ${cat.name}](/${categoryRelPath(cat.slug)})`
    : "";
  const nicheLink = `- [Niche overview: Top 10 ${niche.meta.name}](/${nicheOverviewRelPath(niche.meta.slug)})`;
  return `### Compare alternatives

${sibLinks}

### Related pages

${nicheLink}
${catLink}`.trim();
}

/** Main: render a single tool-in-niche markdown body. */
function renderToolMarkdown(
  tool: Tool,
  niche: Niche,
  bundle: Bundle,
): { fm: Frontmatter; markdown: string } {
  const siblings = resolveSiblings(niche, tool);
  const title = `${tool.name} for ${niche.meta.name} — review, pricing, and 3 alternatives compared`;
  const description = `${tool.name}: ${tool.one_liner} Compared against ${siblings.map((s) => s.name).join(", ")}.`;
  const slug = `${niche.meta.slug}-${tool.slug}`;
  const fm: Frontmatter = {
    title,
    description: clamp(description, 155),
    slug,
    kind: "tool",
    niche: niche.meta.slug,
    category: tool.category,
    canonical: `${SITE_BASE}/${toolRelPath(niche.meta.slug, tool.slug)}`,
    published: PUBLISHED,
    disclosure: "affiliate-recurring-disclosure",
  };

  const cat = bundle.categoriesBySlug.get(tool.category);
  const body = `# ${tool.name} for ${niche.meta.name}

> ${tool.one_liner}

**Best for:** ${tool.best_for}
**Category:** ${cat ? cat.name : tool.category}

## What ${tool.name} actually does

${tool.one_liner} For ${stripTrailingPeriod(niche.meta.audience.toLowerCase())}, the practical question is whether ${tool.name} earns its monthly cost vs. the best three alternatives. This page lays out exactly that — pricing, recurring affiliate economics, strengths, weaknesses, and a head-to-head comparison.

[Visit the official site](${tool.official_url}) · [Get ${tool.name}](${tool.affiliate_url})

## Pricing

${pricingTable(tool)}

## How ${tool.name} compares

${comparisonTable(tool, siblings)}

## Strengths

${tool.strengths.map((s) => `- ${escapeMd(s)}`).join("\n")}

## Weaknesses

${tool.weaknesses.map((s) => `- ${escapeMd(s)}`).join("\n")}

## Recurring commission disclosure

${tool.name}'s recurring commission terms: **${escapeMd(tool.recurring_commission_pct)}**.

Some links on this page are affiliate links. If you sign up through them, this site may earn a commission at no additional cost to you. We only recommend tools that solve real ${niche.meta.name.toLowerCase()} problems — affiliate economics never override that bar.

## Bottom line

If you are ${stripTrailingPeriod(niche.meta.audience.toLowerCase())}, ${tool.name} is worth a serious look when ${stripTrailingPeriod(tool.best_for.toLowerCase())}. It is not the right fit if any of these weaknesses are deal-breakers for your workflow:

${tool.weaknesses.map((s) => `- ${escapeMd(s)}`).join("\n")}

[Try ${tool.name} →](${tool.affiliate_url})

---

${internalLinkFooter(tool, niche, siblings, bundle.categoriesBySlug)}
`;

  return { fm, markdown: body };
}

/** Render a niche overview page. */
function renderNicheMarkdown(niche: Niche, _bundle: Bundle): { fm: Frontmatter; markdown: string } {
  const title = `Top 10 ${niche.meta.name} in 2026 — ranked, compared, with affiliate disclosure`;
  const description = `The 10 ${niche.meta.name} that matter for ${niche.meta.audience.toLowerCase()}. Pricing, recurring commission, strengths, weaknesses.`;
  const fm: Frontmatter = {
    title,
    description: clamp(description, 155),
    slug: `${niche.meta.slug}-overview`,
    kind: "niche",
    niche: niche.meta.slug,
    canonical: `${SITE_BASE}/${nicheOverviewRelPath(niche.meta.slug)}`,
    published: PUBLISHED,
    disclosure: "affiliate-recurring-disclosure",
  };

  const tableRows = niche.tools
    .map((t) => {
      const link = `/${toolRelPath(niche.meta.slug, t.slug)}`;
      return `| [${t.name}](${link}) | ${t.category} | ${escapeCell(t.pricing_tiers[0] ?? "—")} | ${escapeCell(t.recurring_commission_pct)} |`;
    })
    .join("\n");

  const body = `# Top 10 ${niche.meta.name} in 2026

> ${niche.meta.intent}

This is the curated list of the 10 ${niche.meta.name} we recommend for ${stripTrailingPeriod(niche.meta.audience.toLowerCase())}. Each tool gets its own dedicated comparison page — click through for pricing, strengths, weaknesses, and 3 alternatives compared head to head.

| Tool | Category | Starting price | Recurring commission |
| --- | --- | --- | --- |
${tableRows}

## How to read this list

Every tool on this page solves a real problem for ${stripTrailingPeriod(niche.meta.audience.toLowerCase())}. The recurring-commission column is here for transparency: tools with strong recurring affiliate programs are good for solo founders building a content business — but the recommendation is grounded in real fit, not in payout rates.

## Tools, in detail

${niche.tools
  .map(
    (t) => `### [${t.name}](/${toolRelPath(niche.meta.slug, t.slug)})

${t.one_liner}

**Best for:** ${t.best_for}
**Pricing starts at:** ${escapeMd(t.pricing_tiers[0] ?? "—")}
**Recurring commission:** ${escapeMd(t.recurring_commission_pct)}

[Read the full ${t.name} review →](/${toolRelPath(niche.meta.slug, t.slug)})`,
  )
  .join("\n\n")}

## Disclosure

Some links on this page are affiliate links. If you sign up through them, this site may earn a commission at no additional cost to you.
`;

  return { fm, markdown: body };
}

/** Render a category index page across all niches. */
function renderCategoryMarkdown(
  cat: Category,
  bundle: Bundle,
): { fm: Frontmatter; markdown: string } | null {
  // Find all (tool, niche) pairs in this category.
  const matches: { tool: Tool; niche: NicheMeta }[] = [];
  for (const n of bundle.niches) {
    for (const t of n.tools) {
      if (t.category === cat.slug) matches.push({ tool: t, niche: n.meta });
    }
  }
  if (matches.length === 0) return null;

  const title = `${cat.name} — best tools for solo founders, crypto, devs, and content marketers (2026)`;
  const description = `${cat.intent} ${matches.length} curated picks across solo-founder, crypto, dev, and content-marketing niches.`;

  const fm: Frontmatter = {
    title,
    description: clamp(description, 155),
    slug: `cat-${cat.slug}`,
    kind: "category",
    niche: "cross-niche",
    category: cat.slug,
    canonical: `${SITE_BASE}/${categoryRelPath(cat.slug)}`,
    published: PUBLISHED,
    disclosure: "affiliate-recurring-disclosure",
  };

  const grouped = new Map<string, { tool: Tool; niche: NicheMeta }[]>();
  for (const m of matches) {
    const arr = grouped.get(m.niche.slug) ?? [];
    arr.push(m);
    grouped.set(m.niche.slug, arr);
  }

  const groupedSections = Array.from(grouped.entries())
    .map(([nicheSlug, items]) => {
      const nicheName = items[0]?.niche.name ?? nicheSlug;
      const list = items
        .map(
          (m) =>
            `- [${m.tool.name}](/${toolRelPath(m.niche.slug, m.tool.slug)}) — ${escapeMd(m.tool.one_liner)}`,
        )
        .join("\n");
      return `### ${nicheName}\n\n${list}`;
    })
    .join("\n\n");

  const body = `# ${cat.name}

> ${cat.intent}

${cat.description}

This page rolls up every ${cat.name} pick across our four niches: solo founders, crypto, dev tools, and content marketers. Each link goes to the full review with pricing, alternatives, and recurring affiliate disclosure.

## Picks by niche

${groupedSections}

## Disclosure

Some links on this page are affiliate links. If you sign up through them, this site may earn a commission at no additional cost to you.
`;

  return { fm, markdown: body };
}

function clamp(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

/** Strip trailing period so we can append our own punctuation without doubling up. */
function stripTrailingPeriod(s: string): string {
  return s.replace(/\.+$/u, "");
}

/** Wrap rendered markdown in the Frank Trading Ops site shell. */
function wrapHtml(fm: Frontmatter, bodyHtml: string, depthFromRoot: number): string {
  // depthFromRoot: relative path back to /styles.css.
  // blog/ai/<niche>/<slug>.html is 3 levels deep -> "../../../"
  const up = "../".repeat(depthFromRoot);
  const ogType = fm.kind === "tool" ? "article" : "website";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(fm.title)} | Frank Trading Ops</title>
  <meta name="description" content="${escapeHtml(fm.description)}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:title" content="${escapeHtml(fm.title)}" />
  <meta property="og:description" content="${escapeHtml(fm.description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${fm.canonical}" />
  <meta property="article:published_time" content="${fm.published}" />
  <link rel="canonical" href="${fm.canonical}" />
  <link rel="stylesheet" href="${up}styles.css" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZSS4LHL6NX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ZSS4LHL6NX');
  </script>
</head>
<body>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="${up}index.html">Frank Trading Ops</a>
      <nav>
        <a href="${up}tools.html">Tools</a>
        <a href="${up}health.html">Health</a>
        <a href="${up}survival.html">Survival</a>
        <a href="${up}brain.html">Brain</a>
        <a href="${up}beauty.html">Beauty</a>
        <a href="${up}blog/index.html">Blog</a>
        <a href="${up}vip.html"><strong>VIP</strong></a>
      </nav>
    </div>
  </header>

  <main>
    <article class="wrap" style="max-width:780px;margin:2rem auto;padding:1rem;">
      <p class="eyebrow">Frank Trading Ops &middot; ${fm.published}</p>
${bodyHtml}
      <hr style="margin:2rem 0;" />
      <p class="small disclosure">Some links on this page may be affiliate links. If you sign up through them, this site may earn a commission at no additional cost to you. Recurring commission rates marked TODO_VERIFY are pending human confirmation against the vendor's current partner program terms.</p>
    </article>
  </main>

  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <strong>Frank Trading Ops</strong>
        <p class="small">Creator tools, AI picks, and monetization infrastructure built for practical action.</p>
      </div>
      <div>
        <a href="${up}tools.html">Tools</a><br />
        <a href="${up}health.html">Health</a><br />
        <a href="${up}vip.html">VIP</a><br />
        <a href="${up}privacy.html">Privacy</a><br />
        <a href="${up}terms.html">Terms</a>
      </div>
      <div>
        <p class="small disclosure">Some links on this site may be affiliate links, which means I may earn a commission if you buy or sign up through them, at no extra cost to you.</p>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Compute depth from site root for relative href resolution. */
function depthFromRoot(relPath: string): number {
  return relPath.split("/").length - 1;
}

/** Public entry: render every page across all niches + categories. */
export async function renderAll(bundle: Bundle): Promise<readonly Page[]> {
  const pages: Page[] = [];

  // 1. Tool pages (10 per niche × N niches).
  for (const niche of bundle.niches) {
    for (const tool of niche.tools) {
      const { fm, markdown } = renderToolMarkdown(tool, niche, bundle);
      const relPath = toolRelPath(niche.meta.slug, tool.slug);
      const html = wrapHtml(fm, await marked.parse(markdown), depthFromRoot(relPath));
      pages.push({
        kind: "tool",
        relPath,
        frontmatter: fm,
        markdown: matter.stringify(markdown, { ...fm }),
        html,
      });
    }
  }

  // 2. Niche overview pages (1 per niche).
  for (const niche of bundle.niches) {
    const { fm, markdown } = renderNicheMarkdown(niche, bundle);
    const relPath = nicheOverviewRelPath(niche.meta.slug);
    const html = wrapHtml(fm, await marked.parse(markdown), depthFromRoot(relPath));
    pages.push({
      kind: "niche",
      relPath,
      frontmatter: fm,
      markdown: matter.stringify(markdown, { ...fm }),
      html,
    });
  }

  // 3. Category index pages (only for categories that have at least one tool).
  for (const cat of bundle.categories) {
    const rendered = renderCategoryMarkdown(cat, bundle);
    if (!rendered) continue;
    const relPath = categoryRelPath(cat.slug);
    const html = wrapHtml(rendered.fm, await marked.parse(rendered.markdown), depthFromRoot(relPath));
    pages.push({
      kind: "category",
      relPath,
      frontmatter: rendered.fm,
      markdown: matter.stringify(rendered.markdown, { ...rendered.fm }),
      html,
    });
  }

  return pages;
}
