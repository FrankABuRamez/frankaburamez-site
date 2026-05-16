// Build entrypoint — load + render + (optionally) write.
// CLI is in bin/generate.ts; this module exposes the orchestration only.

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadBundle } from "./load.ts";
import { renderAll } from "./render.ts";
import type { Page } from "./types.ts";

export interface BuildOptions {
  /** Path to the seo-engine root (where data/ lives). */
  readonly rootDir: string;
  /** Path to the affiliate-site root (where blog/ lives). */
  readonly siteDir: string;
  /** If true, write files. If false, only return the rendered Page[] in memory. */
  readonly write: boolean;
  /** If true with write=true, overwrite existing files. Default false (skip existing). */
  readonly force: boolean;
  /** If true, also write 3 sample pages to seo-engine/out/preview/ for human review. */
  readonly emitPreview: boolean;
  /** Optional niche filter (slug). "all" means no filter. */
  readonly nicheFilter: string;
}

export interface BuildResult {
  readonly pages: readonly Page[];
  readonly wouldWrite: number;
  readonly wrote: number;
  readonly skippedExisting: number;
  readonly previewPaths: readonly string[];
}

export async function build(opts: BuildOptions): Promise<BuildResult> {
  const dataDir = join(opts.rootDir, "data");
  const bundle = loadBundle({ dataDir });

  let pages = await renderAll(bundle);

  if (opts.nicheFilter && opts.nicheFilter !== "all") {
    pages = pages.filter(
      (p) => p.frontmatter.niche === opts.nicheFilter || p.frontmatter.niche === "cross-niche",
    );
  }

  let wrote = 0;
  let skippedExisting = 0;
  const previewPaths: string[] = [];

  if (opts.emitPreview) {
    const previewDir = join(opts.rootDir, "out", "preview");
    mkdirSync(previewDir, { recursive: true });
    // Pick 3 representative samples: one tool, one niche overview, one category.
    const samples: Page[] = [];
    const tool = pages.find((p) => p.kind === "tool");
    const niche = pages.find((p) => p.kind === "niche");
    const cat = pages.find((p) => p.kind === "category");
    if (tool) samples.push(tool);
    if (niche) samples.push(niche);
    if (cat) samples.push(cat);
    for (const s of samples) {
      const safe = s.frontmatter.slug.replace(/[^a-z0-9-]/gi, "_");
      const mdPath = join(previewDir, `${safe}.md`);
      const htmlPath = join(previewDir, `${safe}.html`);
      writeFileSync(mdPath, s.markdown, "utf8");
      writeFileSync(htmlPath, s.html, "utf8");
      previewPaths.push(mdPath, htmlPath);
    }
  }

  if (opts.write) {
    for (const p of pages) {
      const targetPath = join(opts.siteDir, p.relPath);
      if (existsSync(targetPath) && !opts.force) {
        skippedExisting += 1;
        continue;
      }
      mkdirSync(dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, p.html, "utf8");
      wrote += 1;
    }
  }

  return {
    pages,
    wouldWrite: pages.length,
    wrote,
    skippedExisting,
    previewPaths,
  };
}
