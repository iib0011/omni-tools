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

function createFolderStructure(basePath, foldersToCreateIndexCount) {
  const folderArray = basePath.split(sep);

  function recursiveCreate(currentBase, index) {
    if (index >= folderArray.length) {
      return;
    }
    const currentPath = join(currentBase, folderArray[index]);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath, { recursive: true });
    }
    const indexPath = join(currentPath, 'index.ts');
    if (
      !fs.existsSync(indexPath) &&
      index < folderArray.length - 1 &&
      index >= folderArray.length - 1 - foldersToCreateIndexCount
    ) {
      fs.writeFileSync(
        indexPath,
        `export const ${
          currentPath.split(sep)[currentPath.split(sep).length - 1]
        }Tools = [];\n`
      );
      console.log(`File created: ${indexPath}`);
    }
    // Recursively create the next folder
    recursiveCreate(currentPath, index + 1);
  }

  // Start the recursive folder creation
  recursiveCreate('.', 0);
}

const toolNameCamelCase = toolName.replace(/-./g, (x) => x[1].toUpperCase());
const toolNameTitleCase =
  toolName[0].toUpperCase() + toolName.slice(1).replace(/-/g, ' ');
const toolDir = join(toolsDir, toolName);
const type = folder.split(sep)[folder.split(sep).length - 1];
await createFolderStructure(toolDir, folder.split(sep).length);
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
const validNamespaces = [
  'string',
  'number',
  'video',
  'list',
  'json',
  'time',
  'csv',
  'pdf',
  'audio',
  'xml',
  'translation',
  'image',
  'dev'
];
const isValidI18nNamespace = (value) => {
  return validNamespaces.includes(value);
};

const getI18nNamespaceFromToolCategory = (category) => {
  // Map image-related categories to 'image'
  if (['png', 'image-generic'].includes(category)) {
    return 'image';
  } else if (['gif'].includes(category)) {
    return 'video';
  }
  // Use type guard to check if category is a valid I18nNamespaces
  if (isValidI18nNamespace(category)) {
    return category;
  }

  return 'translation';
};

const i18nNamespace = getI18nNamespaceFromToolCategory(type);
createToolFile(
  `meta.ts`,
  `
import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('${type}', {
  i18n: {
    name: '${i18nNamespace}:${toolNameCamelCase}.title',
    description: '${i18nNamespace}:${toolNameCamelCase}.description',
    shortDescription: '${i18nNamespace}:${toolNameCamelCase}.shortDescription',
    longDescription: '${i18nNamespace}:${toolNameCamelCase}.longDescription'
  },
  path: '${toolName}',
  icon: '',
  keywords: ['${toolName.split('-').join("', '")}'],
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

// Update locale JSON file
const localeFilePath = join(
  currentDirname,
  '..',
  'public',
  'locales',
  'en',
  `${i18nNamespace}.json`
);

let localeData = {};
if (fs.existsSync(localeFilePath)) {
  const localeContent = await readFile(localeFilePath, { encoding: 'utf-8' });
  localeData = JSON.parse(localeContent);
}

localeData[toolNameCamelCase] = {
  title: toolNameTitleCase,
  description: '',
  shortDescription: '',
  longDescription: ''
};

// Write updated locale file
await writeFile(localeFilePath, JSON.stringify(localeData, null, 2));
console.log(`Added import in: ${toolsIndex}`);
