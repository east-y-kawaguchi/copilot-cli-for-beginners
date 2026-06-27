#!/usr/bin/env node
/**
 * Build the visual-quickstart comic site from its content file.
 *
 * Usage:
 *   npm run build:comic
 *
 * Edit the words in visual-quickstart/content.yaml, then run this to regenerate
 * the HTML/CSS into visual-quickstart/. Do NOT hand-edit the generated *.html -
 * it is overwritten on every build.
 *
 * The rendering engine (SVG comic frames, speech bubbles, auto-placement, etc.)
 * lives in the reusable comic-strip-site skill; this is a thin launcher that
 * points that engine at this repo's content file and output dir.
 *
 * Optional env overrides:
 *   COMIC_SKILL_DIR  path to the comic-strip-site skill folder
 *   PYTHON           python executable to use (default: python3)
 */

const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const os = require('os');

const repoRoot = join(__dirname, '..', '..'); // .github/scripts -> repo root
const docsDir = join(repoRoot, 'visual-quickstart');
const contentFile = join(docsDir, 'content.yaml');

const skillDir =
  process.env.COMIC_SKILL_DIR ||
  join(os.homedir(), '.copilot', 'skills', 'comic-strip-site');
const buildScript = join(skillDir, 'scripts', 'build_site.py');

if (!existsSync(buildScript)) {
  console.error(
    `\u2716 Comic engine not found at:\n  ${buildScript}\n` +
      'Set COMIC_SKILL_DIR to the comic-strip-site skill folder, or install the skill.',
  );
  process.exit(1);
}
if (!existsSync(contentFile)) {
  console.error(`\u2716 Content file not found:\n  ${contentFile}`);
  process.exit(1);
}

const python = process.env.PYTHON || 'python3';
console.log(`Building comic from ${contentFile}`);
const result = spawnSync(python, [buildScript], {
  stdio: 'inherit',
  env: { ...process.env, COMIC_DOCS: docsDir, COMIC_CONTENT: contentFile },
});

if (result.error) {
  console.error(`\u2716 Failed to run ${python}: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 0);
