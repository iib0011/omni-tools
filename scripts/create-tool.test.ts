import { existsSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { createFolderStructure } from './create-tool.mjs';

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs
      .splice(0)
      .map((dir) => rm(dir, { recursive: true, force: true }))
  );
});

describe('createFolderStructure', () => {
  it('creates nested folders from an absolute path', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'omni-tools-create-tool-'));
    createdDirs.push(tempRoot);

    const toolDir = join(
      tempRoot,
      'src',
      'pages',
      'tools',
      'image',
      'generic',
      'split'
    );

    createFolderStructure(toolDir, 2);

    expect(existsSync(join(tempRoot, 'src', 'pages', 'tools', 'image'))).toBe(
      true
    );
    expect(
      existsSync(join(tempRoot, 'src', 'pages', 'tools', 'image', 'index.ts'))
    ).toBe(true);
    expect(
      existsSync(
        join(tempRoot, 'src', 'pages', 'tools', 'image', 'generic', 'index.ts')
      )
    ).toBe(true);
    expect(
      existsSync(
        join(tempRoot, 'src', 'pages', 'tools', 'image', 'generic', 'split')
      )
    ).toBe(true);
  });
});
