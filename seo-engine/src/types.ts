// Strict types for the seo-engine.
// Every field that touches a generated page is required at the type level —
// missing fields fail loudly at load time (see src/load.ts).

/** A category is a tool taxonomy slug used to cluster pages. */
export interface Category {
  readonly slug: string;
  readonly name: string;
  readonly intent: string;
  readonly description: string;
}

/** A niche is an audience-defined collection of tools. */
export interface NicheMeta {
  readonly slug: string;
  readonly name: string;
  readonly audience: string;
  readonly intent: string;
}

/** A tool is the atomic unit a comparison page is built around. */
export interface Tool {
  readonly name: string;
  readonly slug: string;
  readonly category: string;
  readonly one_liner: string;
  readonly official_url: string;
  readonly affiliate_url: string;
  readonly pricing_tiers: readonly string[];
  readonly recurring_commission_pct: string;
  readonly strengths: readonly [string, string, string];
  readonly weaknesses: readonly [string, string, string];
  readonly best_for: string;
  readonly alternative_slugs: readonly string[];
}

/** A loaded niche file is its metadata plus its 10 tools. */
export interface Niche {
  readonly meta: NicheMeta;
  readonly tools: readonly Tool[];
}

/**
 * A page is one rendered output unit. There are 3 page kinds:
 * - tool: an individual tool-in-niche comparison page
 * - niche: a top-N overview page for a niche
 * - category: a category index page across all niches
 */
export type PageKind = "tool" | "niche" | "category";

/** Frontmatter we embed in the markdown intermediate. */
export interface Frontmatter {
  readonly title: string;
  readonly description: string;
  readonly slug: string;
  readonly kind: PageKind;
  readonly niche: string;
  readonly category?: string;
  readonly canonical: string;
  readonly published: string;
  readonly disclosure: "affiliate-recurring-disclosure";
}

/** A fully rendered page ready to be written to disk. */
export interface Page {
  readonly kind: PageKind;
  readonly relPath: string;
  readonly frontmatter: Frontmatter;
  readonly markdown: string;
  readonly html: string;
}

/** All loaded data as a single typed bundle. */
export interface Bundle {
  readonly niches: readonly Niche[];
  readonly categories: readonly Category[];
  /** index by tool slug for quick lookup of alternatives across niches. */
  readonly toolsBySlug: ReadonlyMap<string, { readonly tool: Tool; readonly niche: NicheMeta }>;
  /** index by category slug. */
  readonly categoriesBySlug: ReadonlyMap<string, Category>;
}
