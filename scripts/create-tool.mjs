import { readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import { dirname, join, sep } from 'path';
import { fileURLToPath } from 'url';

const currentDirname = dirname(fileURLToPath(import.meta.url));

const toolName = process.argv[2];
const folder = process.argv[3];

const toolsDir = join(
  currentDirname,
  '..',
  'src',
  'pages',
  'tools',
  folder ?? ''
);
if (!toolName) {
  throw new Error('Please specify a toolname.');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Creates the folder structure for the new tool and adds index.ts files in parent directories.
 * @param {string} basePath - The full path to the new tool's directory.
 * @param {number} foldersToCreateIndexCount - The number of parent levels to create an index.ts file in.
 */
function createFolderStructure(basePath, foldersToCreateIndexCount) {
  fs.mkdirSync(basePath, { recursive: true });
  let parentDir = dirname(basePath);
  for (let i = 0; i < foldersToCreateIndexCount; i++) {
    if (!parentDir || parentDir === dirname(parentDir)) break;
    const indexPath = join(parentDir, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      const dirName = parentDir.split(sep).pop() || '';
      const content = `export const ${dirName}Tools = [];\n`;
      fs.writeFileSync(indexPath, content);
      console.log(`File created: ${indexPath}`);
    }
    parentDir = dirname(parentDir);
  }
}

const toolNameCamelCase = toolName.replace(/-./g, (x) => x[1].toUpperCase());
const toolNameTitleCase =
  toolName[0].toUpperCase() + toolName.slice(1).replace(/-/g, ' ');
const toolDir = join(toolsDir, toolName);
const type = folder.split(sep)[folder.split(sep).length - 1];
await createFolderStructure(toolDir, folder ? folder.split(sep).length : 0);
console.log(`Directory created: ${toolDir}`);

const createToolFile = async (name, content) => {
  const filePath = join(toolDir, name);
  await writeFile(filePath, content.trim());
  console.log(`File created: ${filePath}`);
};

createToolFile(
  `index.tsx`,
  `
import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  // splitSeparator: '\\n'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Split a String',
    description: 'This example shows how to split a string into multiple lines',
    sampleText: 'Hello World,Hello World',
    sampleResult: \`Hello World
Hello World\`,
    sampleOptions: {
      //     splitSeparator: ','
    }
  }
];
export default function ${capitalizeFirstLetter(toolNameCamelCase)}({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(main(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Example Settings',
      component: <Box></Box>
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: \`What is a \${title}?\`, description: longDescription }}
    />
  );
}
`
);
createToolFile(
  `meta.ts`,
  `
import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('${type}', {
  name: '${toolNameTitleCase}',
  path: '${toolName}',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['${toolName.split('-').join("', '")}'],
  longDescription: '',
  component: lazy(() => import('./index'))
});
`
);

createToolFile(
  `service.ts`,
  `
import { InitialValuesType } from './types';

export function main(input: string, options: InitialValuesType): string {
  return input;
}
`
);
createToolFile(
  `types.ts`,
  `
export type InitialValuesType = {
  // splitSeparator: string;
};
`
);
createToolFile(
  `${toolName}.service.test.ts`,
  `
import { expect, describe, it } from 'vitest';
// import { main } from './service';
//
// describe('${toolName}', () => {
//
// })
`
);

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

const toolsIndex = join(toolsDir, 'index.ts');
const indexContent = await readFile(toolsIndex, { encoding: 'utf-8' }).then(
  (r) => r.split('\n')
);

indexContent.splice(
  0,
  0,
  `import { tool as ${type}${capitalizeFirstLetter(
    toolNameCamelCase
  )} } from './${toolName}/meta';`
);
writeFile(toolsIndex, indexContent.join('\n'));
console.log(`Added import in: ${toolsIndex}`);
