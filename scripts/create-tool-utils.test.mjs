import { describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import {
  createFolderStructure,
  getIndexDirectories
} from './create-tool-utils.mjs';

describe('getIndexDirectories', () => {
  it('returns the category directory for a Windows path', () => {
    expect(
      getIndexDirectories(
        'C:\\DEV\\omni-tools\\src\\pages\\tools\\list\\set-operations',
        1,
        path.win32
      )
    ).toEqual(['C:\\DEV\\omni-tools\\src\\pages\\tools\\list']);
  });

  it('returns nested category directories from nearest to farthest', () => {
    expect(
      getIndexDirectories(
        '/repo/src/pages/tools/data/list/set-operations',
        2,
        path.posix
      )
    ).toEqual(['/repo/src/pages/tools/data/list', '/repo/src/pages/tools/data']);
  });
});

describe('createFolderStructure', () => {
  it('creates an absolute Windows tool directory without recreating the drive', () => {
    const existingPaths = new Set();
    const fsApi = {
      mkdirSync: vi.fn((targetPath) => existingPaths.add(targetPath)),
      existsSync: vi.fn((targetPath) => existingPaths.has(targetPath)),
      writeFileSync: vi.fn((targetPath) => existingPaths.add(targetPath))
    };
    const toolDirectory =
      'C:\\DEV\\omni-tools\\src\\pages\\tools\\list\\set-operations';

    createFolderStructure(toolDirectory, 1, { fsApi, pathApi: path.win32 });

    expect(fsApi.mkdirSync).toHaveBeenCalledWith(toolDirectory, {
      recursive: true
    });
    expect(fsApi.mkdirSync).not.toHaveBeenCalledWith(
      'C:\\DEV\\omni-tools\\C:',
      expect.anything()
    );
    expect(fsApi.writeFileSync).toHaveBeenCalledWith(
      'C:\\DEV\\omni-tools\\src\\pages\\tools\\list\\index.ts',
      'export const listTools = [];\n'
    );
  });

  it('does not overwrite an existing index file', () => {
    const indexPath = '/repo/src/pages/tools/list/index.ts';
    const fsApi = {
      mkdirSync: vi.fn(),
      existsSync: vi.fn((targetPath) => targetPath === indexPath),
      writeFileSync: vi.fn()
    };

    createFolderStructure('/repo/src/pages/tools/list/set-operations', 1, {
      fsApi,
      pathApi: path.posix
    });

    expect(fsApi.writeFileSync).not.toHaveBeenCalled();
  });
});
