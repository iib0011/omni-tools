import fs from 'node:fs';
import path from 'node:path';

export function getIndexDirectories(basePath, count, pathApi = path) {
  const directories = [];
  let currentDirectory = pathApi.dirname(basePath);

  for (let index = 0; index < count; index += 1) {
    const parentDirectory = pathApi.dirname(currentDirectory);

    if (currentDirectory === parentDirectory) {
      break;
    }

    directories.push(currentDirectory);
    currentDirectory = parentDirectory;
  }

  return directories;
}

export function createFolderStructure(
  basePath,
  foldersToCreateIndexCount,
  { fsApi = fs, pathApi = path } = {}
) {
  fsApi.mkdirSync(basePath, { recursive: true });

  for (const directory of getIndexDirectories(
    basePath,
    foldersToCreateIndexCount,
    pathApi
  )) {
    const indexPath = pathApi.join(directory, 'index.ts');

    if (fsApi.existsSync(indexPath)) {
      continue;
    }

    const directoryName = pathApi.basename(directory);
    fsApi.writeFileSync(indexPath, `export const ${directoryName}Tools = [];\n`);
    console.log(`File created: ${indexPath}`);
  }
}
