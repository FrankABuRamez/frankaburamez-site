// Load + validate the YAML data files.
// Strategy: parse, then validate every field with explicit checks.
// Throws SchemaError on the first miss with a path + reason.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import type {
  Bundle,
  Category,
  Niche,
  NicheMeta,
  Tool,
} from "./types.ts";

export class SchemaError extends Error {
  constructor(filePath: string, fieldPath: string, reason: string) {
    super(`Schema validation failed at ${filePath} :: ${fieldPath} — ${reason}`);
    this.name = "SchemaError";
  }
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string" && x.length > 0);
}

function isStringTriple(v: unknown): v is [string, string, string] {
  return isStringArray(v) && v.length === 3;
}

function requireString(filePath: string, fieldPath: string, v: unknown): string {
  if (!isString(v)) throw new SchemaError(filePath, fieldPath, "expected non-empty string");
  return v;
}

function requireStringArray(
  filePath: string,
  fieldPath: string,
  v: unknown,
  minLen: number,
): string[] {
  if (!isStringArray(v))
    throw new SchemaError(filePath, fieldPath, "expected array of non-empty strings");
  if (v.length < minLen)
    throw new SchemaError(filePath, fieldPath, `expected at least ${minLen} entries, got ${v.length}`);
  return v;
}

function requireStringTriple(filePath: string, fieldPath: string, v: unknown): [string, string, string] {
  if (!isStringTriple(v))
    throw new SchemaError(filePath, fieldPath, "expected exactly 3 non-empty strings");
  return v;
}

function parseNiche(filePath: string, raw: unknown): Niche {
  if (!raw || typeof raw !== "object")
    throw new SchemaError(filePath, "(root)", "file must parse to a YAML object");

  const obj = raw as Record<string, unknown>;
  const nicheObj = obj.niche;
  if (!nicheObj || typeof nicheObj !== "object")
    throw new SchemaError(filePath, "niche", "missing or not an object");

  const n = nicheObj as Record<string, unknown>;
  const meta: NicheMeta = {
    slug: requireString(filePath, "niche.slug", n.slug),
    name: requireString(filePath, "niche.name", n.name),
    audience: requireString(filePath, "niche.audience", n.audience),
    intent: requireString(filePath, "niche.intent", n.intent),
  };

  const toolsRaw = obj.tools;
  if (!Array.isArray(toolsRaw))
    throw new SchemaError(filePath, "tools", "missing or not an array");
  if (toolsRaw.length !== 10)
    throw new SchemaError(filePath, "tools", `expected exactly 10 tools, got ${toolsRaw.length}`);

  const slugSet = new Set<string>();
  const tools: Tool[] = toolsRaw.map((rawTool: unknown, i: number): Tool => {
    if (!rawTool || typeof rawTool !== "object")
      throw new SchemaError(filePath, `tools[${i}]`, "not an object");
    const t = rawTool as Record<string, unknown>;
    const slug = requireString(filePath, `tools[${i}].slug`, t.slug);
    if (slugSet.has(slug))
      throw new SchemaError(filePath, `tools[${i}].slug`, `duplicate slug "${slug}"`);
    slugSet.add(slug);

    return {
      name: requireString(filePath, `tools[${i}].name`, t.name),
      slug,
      category: requireString(filePath, `tools[${i}].category`, t.category),
      one_liner: requireString(filePath, `tools[${i}].one_liner`, t.one_liner),
      official_url: requireString(filePath, `tools[${i}].official_url`, t.official_url),
      affiliate_url: requireString(filePath, `tools[${i}].affiliate_url`, t.affiliate_url),
      pricing_tiers: requireStringArray(filePath, `tools[${i}].pricing_tiers`, t.pricing_tiers, 1),
      recurring_commission_pct: requireString(
        filePath,
        `tools[${i}].recurring_commission_pct`,
        t.recurring_commission_pct,
      ),
      strengths: requireStringTriple(filePath, `tools[${i}].strengths`, t.strengths),
      weaknesses: requireStringTriple(filePath, `tools[${i}].weaknesses`, t.weaknesses),
      best_for: requireString(filePath, `tools[${i}].best_for`, t.best_for),
      alternative_slugs: requireStringArray(
        filePath,
        `tools[${i}].alternative_slugs`,
        t.alternative_slugs,
        3,
      ),
    };
  });

  return { meta, tools };
}

function parseCategories(filePath: string, raw: unknown): Category[] {
  if (!raw || typeof raw !== "object")
    throw new SchemaError(filePath, "(root)", "must parse to YAML object");
  const obj = raw as Record<string, unknown>;
  const cats = obj.categories;
  if (!Array.isArray(cats))
    throw new SchemaError(filePath, "categories", "missing or not an array");
  if (cats.length < 8)
    throw new SchemaError(filePath, "categories", `expected at least 8 categories, got ${cats.length}`);

  const slugSet = new Set<string>();
  return cats.map((c: unknown, i: number): Category => {
    if (!c || typeof c !== "object")
      throw new SchemaError(filePath, `categories[${i}]`, "not an object");
    const o = c as Record<string, unknown>;
    const slug = requireString(filePath, `categories[${i}].slug`, o.slug);
    if (slugSet.has(slug))
      throw new SchemaError(filePath, `categories[${i}].slug`, `duplicate slug "${slug}"`);
    slugSet.add(slug);
    return {
      slug,
      name: requireString(filePath, `categories[${i}].name`, o.name),
      intent: requireString(filePath, `categories[${i}].intent`, o.intent),
      description: requireString(filePath, `categories[${i}].description`, o.description),
    };
  });
}

export interface LoadOptions {
  readonly dataDir: string;
}

/**
 * Load all niche YAMLs and the categories taxonomy.
 * Throws SchemaError on the first malformed file with a clear path.
 */
export function loadBundle(opts: LoadOptions): Bundle {
  const nichesDir = join(opts.dataDir, "niches");
  const nicheFiles = readdirSync(nichesDir).filter(
    (f) => f.endsWith(".yaml") || f.endsWith(".yml"),
  );
  if (nicheFiles.length === 0) {
    throw new Error(`No niche YAMLs found in ${nichesDir}`);
  }
  nicheFiles.sort(); // deterministic order

  const niches: Niche[] = nicheFiles.map((file) => {
    const path = join(nichesDir, file);
    const raw = YAML.parse(readFileSync(path, "utf8"));
    return parseNiche(path, raw);
  });

  const catsPath = join(opts.dataDir, "categories.yaml");
  const cats = parseCategories(catsPath, YAML.parse(readFileSync(catsPath, "utf8")));

  // Build indexes.
  const toolsBySlug = new Map<string, { tool: Tool; niche: NicheMeta }>();
  for (const n of niches) {
    for (const t of n.tools) {
      // Tools may legitimately appear in multiple niches; we keep the FIRST
      // niche we see for cross-niche linking. Per-niche pages are still per-niche.
      if (!toolsBySlug.has(t.slug)) {
        toolsBySlug.set(t.slug, { tool: t, niche: n.meta });
      }
    }
  }

  const categoriesBySlug = new Map<string, Category>();
  for (const c of cats) categoriesBySlug.set(c.slug, c);

  // Cross-validate: every tool's category must exist in the taxonomy.
  for (const n of niches) {
    for (const t of n.tools) {
      if (!categoriesBySlug.has(t.category)) {
        throw new SchemaError(
          join(nichesDir, `${n.meta.slug}.yaml`),
          `tools[${t.slug}].category`,
          `category "${t.category}" not in taxonomy — add it to data/categories.yaml or fix the typo`,
        );
      }
    }
  }

  // Cross-validate: every alternative_slug must resolve to a known tool somewhere.
  // Many tool entries reference siblings we don't list (e.g. Linear pointing to
  // Jira, Cursor pointing to Zed) — that's intentional. Render falls back to
  // same-niche siblings. We summarize the count rather than spamming per ref.
  let unknownAltCount = 0;
  for (const n of niches) {
    for (const t of n.tools) {
      for (const altSlug of t.alternative_slugs) {
        if (!toolsBySlug.has(altSlug)) {
          unknownAltCount += 1;
        }
      }
    }
  }
  if (unknownAltCount > 0 && process.env.SEO_ENGINE_VERBOSE) {
    console.warn(
      `[load.ts] note: ${unknownAltCount} alternative_slugs reference tools outside the corpus — render will fall back to same-niche siblings. Set SEO_ENGINE_VERBOSE=1 to list each.`,
    );
  }

  return { niches, categories: cats, toolsBySlug, categoriesBySlug };
}
