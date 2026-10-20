import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const currentDirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(currentDirname, '..');

const tag = process.argv[2];
const ref = process.argv[3] ?? 'HEAD';

if (!tag) {
  console.error('Usage: node scripts/tools-diff-since-tag.mjs <tag> [ref]');
  process.exit(1);
}

const run = (cmd) =>
  execSync(cmd, { cwd: repoRoot, encoding: 'utf-8' }).trim();

let range;
try {
  const tagCommit = run(`git rev-parse --verify "${tag}^{commit}"`);
  const refCommit = run(`git rev-parse --verify "${ref}^{commit}"`);
  range = `${tagCommit}..${refCommit}`;
  // Ensure the ref is ahead of the tag
  run(`git merge-base --is-ancestor ${tagCommit} ${refCommit}`);
} catch {
  console.error(
    `Error: '${ref}' is not a descendant of tag '${tag}' (or ref does not exist).`
  );
  process.exit(1);
}

const diffOutput = run(
  `git diff --name-only --diff-filter=A ${range} -- "src/pages/tools/**/meta.ts"`
);

const addedTools = diffOutput
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    // Line format: src/pages/tools/<category>/<tool-name>/meta.ts
    const parts = line.split('/');
    return {
      name: parts[parts.length - 2],
      category: parts.slice(3, -2).join('/'),
      path: line
    };
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

if (addedTools.length === 0) {
  console.log(`No tools added between ${tag} and ${ref}.`);
} else {
  console.log(`${addedTools.length} tool(s) added between ${tag} and ${ref}:\n`);
  let lastCategory = null;
  for (const tool of addedTools) {
    if (tool.category !== lastCategory) {
      console.log(`[${tool.category}]`);
      lastCategory = tool.category;
    }
    console.log(`  - ${tool.name} (${tool.path})`);
  }
}
