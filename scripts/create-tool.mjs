import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
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

const toolNameCamelCase = toolName.replace(/-./g, (x) => x[1].toUpperCase())
const toolNameTitleCase =
  toolName[0].toUpperCase() + toolName.slice(1).replace(/-/g, ' ')
const toolDir = join(toolsDir, toolName)

await mkdir(toolDir)
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
import image from '../../../assets/text.png';

export const tool = defineTool('${folder}', {
  name: '${toolNameTitleCase}',
  path: '/${toolName}',
  image,
  description: '',
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
  `import { tool as ${toolNameCamelCase} } from './${toolName}/meta';`
)
writeFile(toolsIndex, indexContent.join('\n'))
console.log(`Added import in: ${toolsIndex}`)