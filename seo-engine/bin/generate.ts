#!/usr/bin/env bun
// CLI for the seo-engine.
//
// Usage:
//   bun run bin/generate.ts                              # default: --niche all --dry-run
//   bun run bin/generate.ts --niche all --dry-run
//   bun run bin/generate.ts --niche solo-founders --dry-run
//   bun run bin/generate.ts --niche all --write          # writes only files that do NOT exist
//   bun run bin/generate.ts --niche all --write --force  # overwrites existing files
//   bun run bin/generate.ts --niche all --dry-run --emit-preview
//
// Exit codes:
//   0  ok
//   1  schema/load error
//   2  bad CLI args

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../src/build.ts";

interface Args {
  readonly niche: string;
  readonly write: boolean;
  readonly force: boolean;
  readonly dryRun: boolean;
  readonly emitPreview: boolean;
}

function parseArgs(argv: readonly string[]): Args {
  let niche = "all";
  let write = false;
  let force = false;
  let dryRun = false;
  let emitPreview = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--niche": {
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
          console.error("Error: --niche requires a value (e.g. 'all', 'solo-founders')");
          process.exit(2);
        }
        niche = next;
        i += 1;
        break;
      }
      case "--write":
        write = true;
        break;
      case "--force":
        force = true;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--emit-preview":
        emitPreview = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      // Default: ignore unknown flags so future expansion does not break callers.
    }
  }

  // Default to dry-run if neither flag specified.
  if (!write && !dryRun) dryRun = true;

  // Mutex: write wins over dry-run if both passed.
  if (write && dryRun) dryRun = false;

  return { niche, write, force, dryRun, emitPreview };
}

function printHelp(): void {
  console.log(`seo-engine — programmatic SEO page generator for frankaburamez.tech

Usage:
  bun run bin/generate.ts [options]

Options:
  --niche <slug|all>   Limit output to one niche (default: all)
  --dry-run            Render in memory, print summary, write nothing (default if no --write)
  --write              Write generated pages to the site's content dir
  --force              With --write: overwrite existing files (default: skip existing)
  --emit-preview       Write 3 sample pages to seo-engine/out/preview/ (works with --dry-run)
  --help, -h           Show this help

Examples:
  bun run bin/generate.ts --niche all --dry-run --emit-preview
  bun run bin/generate.ts --niche solo-founders --write
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // seo-engine root = parent of bin/
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  // affiliate-site root = parent of seo-engine/
  const siteDir = resolve(rootDir, "..");

  const start = Date.now();
  let result;
  try {
    result = await build({
      rootDir,
      siteDir,
      write: args.write,
      force: args.force,
      emitPreview: args.emitPreview,
      nicheFilter: args.niche,
    });
  } catch (err) {
    console.error("\nseo-engine: build failed");
    if (err instanceof Error) {
      console.error(err.message);
      if (err.stack && process.env.DEBUG) console.error(err.stack);
    } else {
      console.error(String(err));
    }
    process.exit(1);
  }

  const elapsed = Date.now() - start;

  // Summary.
  const byKind: Record<string, number> = { tool: 0, niche: 0, category: 0 };
  for (const p of result.pages) byKind[p.kind] = (byKind[p.kind] ?? 0) + 1;

  console.log(`\nseo-engine: ${args.dryRun ? "DRY RUN" : "WRITE"} mode  niche=${args.niche}  elapsed=${elapsed}ms`);
  console.log(`  kinds: tool=${byKind.tool}  niche=${byKind.niche}  category=${byKind.category}`);
  console.log(`  would write ${result.wouldWrite} pages`);
  if (args.write) {
    console.log(`  wrote ${result.wrote} pages`);
    console.log(`  skipped ${result.skippedExisting} existing pages (use --force to overwrite)`);
  }
  if (args.emitPreview) {
    console.log(`  preview files written:`);
    for (const p of result.previewPaths) console.log(`    ${p}`);
  }

  // In dry-run, also print first 30 lines of 3 representative pages so the
  // human reviewer can eyeball quality without opening files.
  if (args.dryRun && !args.emitPreview) {
    const samples = [
      result.pages.find((p) => p.kind === "tool"),
      result.pages.find((p) => p.kind === "niche"),
      result.pages.find((p) => p.kind === "category"),
    ].filter((p): p is NonNullable<typeof p> => p !== undefined);
    for (const s of samples) {
      console.log(`\n--- sample [${s.kind}] ${s.relPath} ---`);
      const lines = s.markdown.split("\n").slice(0, 30);
      for (const line of lines) console.log(line);
      console.log(`--- end sample ---`);
    }
  }

  console.log("\nDone.");
}

void main();
