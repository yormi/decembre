#!/usr/bin/env node
// Build script for the Décembre app.
//
// Reads `app/index.html` (the authoring source), resolves
//   <!-- @include path/relative/to/project/root.html -->
// markers recursively, and writes the assembled artifact to `./index.html`.
// The artifact is what GitHub Pages serves; it is committed alongside the
// source so deploys stay zero-config.
//
// Usage:
//   node scripts/build.mjs              one-shot build
//   node scripts/build.mjs --watch      rebuild on source change (≤500ms)
//
// The watcher uses Node 22 native `fs.watch({ recursive: true })`; live-server
// at the repo root picks up `index.html` rewrites and pushes the reload to
// the browser. End-to-end edit→reload typically lands under 500ms.
//
// Author guidance:
//   - The marker MUST occupy its own line. The resolver consumes the marker's
//     leading whitespace + trailing newline, so the partial's own indentation
//     governs (no double-indent, no double-newline).
//   - Partials may themselves contain @includes (recursion depth ≤ 8).
//   - The resolver is purely textual — no template variables, no logic.
//     If you need a variable, do it in the partial itself.

import { readFile, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SOURCE       = resolve(PROJECT_ROOT, 'app/index.html');
const OUTPUT       = resolve(PROJECT_ROOT, 'index.html');
// Match a whole-line @include directive: leading hspace + marker + trailing
// hspace + optional newline. Consuming the newline avoids a stray blank line
// after the partial content (which itself ends with its own newline).
const INCLUDE_RE   = /^[ \t]*<!--\s*@include\s+(\S+?)\s*-->[ \t]*\r?\n?/gm;
const WATCH_DIRS   = ['app', 'nutrition'];
const WATCH_EXTS   = ['.html', '.css', '.js'];

async function resolveIncludes(content, sourcePath, depth = 0) {
  if (depth > 8) throw new Error(`@include depth > 8 (cycle?) at ${sourcePath}`);
  const matches = [...content.matchAll(INCLUDE_RE)];
  for (const m of matches) {
    const partialPath = resolve(PROJECT_ROOT, m[1]);
    let partial;
    try {
      partial = await readFile(partialPath, 'utf8');
    } catch (e) {
      throw new Error(`@include ${m[1]} (from ${sourcePath}): ${e.message}`);
    }
    const resolved = await resolveIncludes(partial, partialPath, depth + 1);
    content = content.replace(m[0], resolved);
  }
  return content;
}

async function build() {
  const t0 = Date.now();
  const tpl = await readFile(SOURCE, 'utf8');
  const out = await resolveIncludes(tpl, SOURCE);
  await writeFile(OUTPUT, out);
  const ms = Date.now() - t0;
  const ts = new Date().toLocaleTimeString('fr-CA', { hour12: false });
  console.log(`[build] ${ts} → index.html (${ms}ms, ${out.length.toLocaleString()} chars)`);
}

try {
  await build();
} catch (e) {
  console.error(`[build] FAILED: ${e.message}`);
  process.exit(1);
}

if (process.argv.includes('--watch')) {
  console.log(`[build] watching ${WATCH_DIRS.join(', ')} for changes (${WATCH_EXTS.join(', ')})...`);
  let timeout;
  const debouncedBuild = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      build().catch(e => console.error(`[build] error: ${e.message}`));
    }, 30);
  };
  for (const dir of WATCH_DIRS) {
    const path = resolve(PROJECT_ROOT, dir);
    try {
      watch(path, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        if (!WATCH_EXTS.some(ext => filename.endsWith(ext))) return;
        debouncedBuild();
      });
    } catch (e) {
      // Directory may not exist yet (e.g., nutrition/ added after this script).
      console.warn(`[build] cannot watch ${dir}: ${e.message}`);
    }
  }
}
