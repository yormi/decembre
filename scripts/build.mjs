#!/usr/bin/env node
// Build script for the Décembre app.
//
// Reads `app/index.html` (the authoring source), resolves
//   <!-- @include path/relative/to/project/root.html -->
// markers recursively, writes the assembled artifact to `dist/index.html`,
// and copies the static sibling assets in `app/` (favicons, historique.html,
// history.json) alongside it. `dist/` is gitignored — CI rebuilds before
// deploying to GitHub Pages.
//
// Usage:
//   node scripts/build.mjs              one-shot build
//   node scripts/build.mjs --watch      rebuild on source change (≤500ms)
//
// The watcher uses Node 22 native `fs.watch({ recursive: true })`; live-server
// serves `dist/` and picks up rewrites to push the reload to the browser.
// End-to-end edit→reload typically lands under 500ms.
//
// Author guidance:
//   - The marker MUST occupy its own line. The resolver consumes the marker's
//     leading whitespace + trailing newline, so the partial's own indentation
//     governs (no double-indent, no double-newline).
//   - Partials may themselves contain @includes (recursion depth ≤ 8).
//   - The resolver is purely textual — no template variables, no logic.
//     If you need a variable, do it in the partial itself.

import { readFile, writeFile, copyFile, mkdir, readdir, cp } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SOURCE       = resolve(PROJECT_ROOT, 'app/index.html');
const DIST_DIR     = resolve(PROJECT_ROOT, 'dist');
const OUTPUT       = resolve(DIST_DIR, 'index.html');
// Static assets that ship alongside index.html. Authored in app/, copied
// verbatim to dist/ so the deployed root contains exactly what the browser
// fetches via <link href="favicon.ico"> etc.
const STATIC_ASSETS = [
  'favicon.ico',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'historique.html',
  'history.json',
];
// Static asset directories copied recursively into dist/, preserving the
// subpath. `app/diagnostic/images/` ships the symptom-guide reference photos
// referenced via <img src="diagnostic/images/...">.
const STATIC_ASSET_DIRS = [
  ['app/diagnostic/images', 'diagnostic/images'],
];
// Match a whole-line @include directive: leading hspace + marker + trailing
// hspace + optional newline. Consuming the newline avoids a stray blank line
// after the partial content (which itself ends with its own newline).
const INCLUDE_RE   = /^[ \t]*<!--\s*@include\s+(\S+?)\s*-->[ \t]*\r?\n?/gm;
const SPEC_STRINGS_MARKER = /^[ \t]*<!--\s*@spec-strings\s*-->[ \t]*\r?\n?/m;
const WATCH_DIRS   = ['app', 'nutrition', 'yield-range'];
const WATCH_EXTS   = ['.html', '.css', '.js', '.md'];

// Parse `Renders:` blocks out of a spec.md file.
//
// Convention: inside a spec entry headed by `## <slug>`, every fenced code
// block whose info string is `render <key>` declares an operator-facing
// string whose bytes the spec owns. The build collects them into a
// SPEC_STRINGS map: { '<slug>': { '<key>': '<string>', ... }, ... }, keyed
// by the entry's slug heading.
//
// Trailing/leading whitespace is trimmed; internal whitespace preserved.
// Duplicate keys within the same entry are an error (build fails).
const REQ_HEADER_RE = /^##\s+(.+?)\s*$/gm;
const RENDER_FENCE_RE = /^```render\s+(\S+)\s*\r?\n([\s\S]*?)^```\s*$/gm;

function extractSpecStringsFromFile(source, sourcePath) {
  const strings = {};
  const reqHeaders = [...source.matchAll(REQ_HEADER_RE)];
  for (let i = 0; i < reqHeaders.length; i++) {
    const reqId = reqHeaders[i][1];
    const start = reqHeaders[i].index;
    const end = i + 1 < reqHeaders.length ? reqHeaders[i + 1].index : source.length;
    const section = source.slice(start, end);
    const blocks = [...section.matchAll(RENDER_FENCE_RE)];
    if (blocks.length === 0) continue;
    if (!strings[reqId]) strings[reqId] = {};
    for (const block of blocks) {
      const key = block[1];
      const body = block[2].trim();
      if (Object.prototype.hasOwnProperty.call(strings[reqId], key)) {
        throw new Error(`duplicate render key "${reqId}.${key}" in ${sourcePath}`);
      }
      strings[reqId][key] = body;
    }
  }
  return strings;
}

async function collectSpecMdFiles(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await collectSpecMdFiles(full, acc);
    else if (entry.isFile() && (entry.name === 'spec.md' || entry.name === 'spec.md')) acc.push(full);
  }
  return acc;
}

async function buildSpecStrings() {
  const files = await collectSpecMdFiles(PROJECT_ROOT);
  const combined = {};
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    const fileStrings = extractSpecStringsFromFile(text, file);
    for (const [reqId, keys] of Object.entries(fileStrings)) {
      if (!combined[reqId]) combined[reqId] = {};
      for (const [key, body] of Object.entries(keys)) {
        if (Object.prototype.hasOwnProperty.call(combined[reqId], key)) {
          throw new Error(`duplicate render key "${reqId}.${key}" across spec files (last seen: ${file})`);
        }
        combined[reqId][key] = body;
      }
    }
  }
  return combined;
}

function renderSpecStringsScript(specStrings) {
  // Inline as a JSON literal assigned to window.SPEC_STRINGS. The page reads
  // it synchronously — no async fetch required.
  return `<script>window.SPEC_STRINGS = ${JSON.stringify(specStrings)};</script>`;
}

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
  await mkdir(DIST_DIR, { recursive: true });
  const tpl = await readFile(SOURCE, 'utf8');
  let out = await resolveIncludes(tpl, SOURCE);

  // Resolve the <!-- @spec-strings --> marker by parsing every spec.md /
  // spec.md file and injecting an inline <script> assigning
  // window.SPEC_STRINGS. Always emitted: if no marker exists in source we
  // skip silently (the page just won't have spec-anchored strings until
  // the marker is added).
  const specStrings = await buildSpecStrings();
  const reqCount = Object.keys(specStrings).length;
  const keyCount = Object.values(specStrings).reduce((acc, keys) => acc + Object.keys(keys).length, 0);
  if (SPEC_STRINGS_MARKER.test(out)) {
    out = out.replace(SPEC_STRINGS_MARKER, renderSpecStringsScript(specStrings) + '\n');
  }

  await writeFile(OUTPUT, out);
  await Promise.all(STATIC_ASSETS.map(name =>
    copyFile(resolve(PROJECT_ROOT, 'app', name), resolve(DIST_DIR, name))
  ));
  await Promise.all(STATIC_ASSET_DIRS.map(([from, to]) =>
    cp(resolve(PROJECT_ROOT, from), resolve(DIST_DIR, to), { recursive: true })
  ));
  const ms = Date.now() - t0;
  const ts = new Date().toLocaleTimeString('fr-CA', { hour12: false });
  console.log(`[build] ${ts} → dist/index.html (+${STATIC_ASSETS.length} assets, ${ms}ms, ${out.length.toLocaleString()} chars, SPEC_STRINGS: ${reqCount} REQ × ${keyCount} keys)`);
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
