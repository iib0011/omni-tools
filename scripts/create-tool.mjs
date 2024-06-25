import { readFile, writeFile } from 'fs/promises'
import fs from 'fs'
import { dirname, join, sep } from 'path'
import { fileURLToPath } from 'url'

const currentDirname = dirname(fileURLToPath(import.meta.url))

const toolName = process.argv[2]
const folder = process.argv[3]

const toolsDir = join(currentDirname, '..', 'src', 'pages', folder ?? '')
if (!toolName) {
  throw new Error('Please specify a toolname.')
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function createFolderStructure(basePath, foldersToCreateIndexCount) {
  const folderArray = basePath.split(sep)

  function recursiveCreate(currentBase, index) {
    if (index >= folderArray.length) {
      return
    }
    const currentPath = join(currentBase, folderArray[index])
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath, { recursive: true })
    }
    const indexPath = join(currentPath, 'index.ts')
    if (!fs.existsSync(indexPath) && index < folderArray.length - 1 && index >= folderArray.length - 1 - foldersToCreateIndexCount) {
      fs.writeFileSync(indexPath, `export const ${currentPath.split(sep)[currentPath.split(sep).length - 1]}Tools = [];\n`)
      console.log(`File created: ${indexPath}`)
    }
    // Recursively create the next folder
    recursiveCreate(currentPath, index + 1)
  }

  // Start the recursive folder creation
  recursiveCreate('.', 0)
}

const toolNameCamelCase = toolName.replace(/-./g, (x) => x[1].toUpperCase())
const toolNameTitleCase =
  toolName[0].toUpperCase() + toolName.slice(1).replace(/-/g, ' ')
const toolDir = join(toolsDir, toolName)
const type = folder.split(sep)[folder.split(sep).length - 1]
await createFolderStructure(toolDir, folder.split(sep).length)
console.log(`Directory created: ${toolDir}`)

const createToolFile = async (name, content) => {
  const filePath = join(toolDir, name)
  await writeFile(filePath, content.trim())
  console.log(`File created: ${filePath}`)
}

createToolFile(
  `index.tsx`,
  `
import { Box } from '@mui/material';
import React from 'react';
import * as Yup from 'yup';

const initialValues = {};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ${capitalizeFirstLetter(toolNameCamelCase)}() {
  return <Box>Lorem ipsum</Box>;
}
`
)
createToolFile(
  `meta.ts`,
  `
import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('${type}', {
  name: '${toolNameTitleCase}',
  path: '${toolName}',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['${toolName.split('-').join('\', \'')}'],
  component: lazy(() => import('./index'))
});
`
)

createToolFile(`service.ts`, ``)
createToolFile(
  `${toolName}.service.test.ts`,
  `
import { expect, describe, it } from 'vitest';
// import { } from './service';
//
// describe('${toolName}', () => {
//
// })
`
)

// createToolFile(
//   `${toolName}.e2e.spec.ts`,
//   `
// import { test, expect } from '@playwright/test';
//
// test.describe('Tool - ${toolNameTitleCase}', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto('/${toolName}');
//   });
//
//   test('Has correct title', async ({ page }) => {
//     await expect(page).toHaveTitle('${toolNameTitleCase} - IT Tools');
//   });
//
//   test('', async ({ page }) => {
//
//   });
// });
//
// `
// )

const toolsIndex = join(toolsDir, 'index.ts')
const indexContent = await readFile(toolsIndex, { encoding: 'utf-8' }).then(
  (r) => r.split('\n')
)

indexContent.splice(
  0,
  0,
  `import { tool as ${type}${capitalizeFirstLetter(toolNameCamelCase)} } from './${toolName}/meta';`
)
writeFile(toolsIndex, indexContent.join('\n'))
console.log(`Added import in: ${toolsIndex}`)
