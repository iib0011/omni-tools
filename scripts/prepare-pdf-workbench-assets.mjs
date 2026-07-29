import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputRoot = path.join(projectRoot, 'public', 'pdf-workbench', 'runtime');

const languages = [
  'eng',
  'fra',
  'deu',
  'spa',
  'ita',
  'por',
  'rus',
  'jpn',
  'chi_sim',
  'chi_tra',
  'kor',
  'ara'
];

const copy = async (source, destination) => {
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
};

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

await copy(
  path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'cmaps'),
  path.join(outputRoot, 'pdfjs', 'cmaps')
);
await copy(
  path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'standard_fonts'),
  path.join(outputRoot, 'pdfjs', 'standard_fonts')
);
await copy(
  path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'wasm'),
  path.join(outputRoot, 'pdfjs', 'wasm')
);

for (const filename of [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-lstm.wasm',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm'
]) {
  await copy(
    path.join(projectRoot, 'node_modules', 'tesseract.js-core', filename),
    path.join(outputRoot, 'tesseract', 'core', filename)
  );
}
await copy(
  path.join(
    projectRoot,
    'node_modules',
    'tesseract.js',
    'dist',
    'worker.min.js'
  ),
  path.join(outputRoot, 'tesseract', 'worker.min.js')
);

const languageAssets = [];
for (const language of languages) {
  const packageRoot = path.join(
    projectRoot,
    'node_modules',
    '@tesseract.js-data',
    language
  );
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf8')
  );
  const filename = `${language}.traineddata.gz`;
  await copy(
    path.join(packageRoot, '4.0.0_best_int', filename),
    path.join(outputRoot, 'tesseract', 'tessdata', filename)
  );
  languageAssets.push({
    language,
    package: packageJson.name,
    version: packageJson.version,
    license: packageJson.license
  });
}

await writeFile(
  path.join(outputRoot, 'asset-manifest.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      pdfjs: 'pdfjs-dist',
      tesseract: 'tesseract.js',
      languageAssets
    },
    null,
    2
  )}\n`,
  'utf8'
);

console.log(
  `Prepared PDF workbench assets for ${languages.length} OCR data packs.`
);
