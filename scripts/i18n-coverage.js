const fs = require('fs');
const path = require('path');

const localesDir = 'public/locales';
const referenceLang = 'en';
const readmePath = 'README.md';

const FLAGS = {
  en: '🇬🇧',
  de: '🇩🇪',
  es: '🇪🇸',
  fr: '🇫🇷',
  pt: '🇵🇹',
  ja: '🇯🇵',
  hi: '🇮🇳',
  nl: '🇳🇱',
  ru: '🇷🇺',
  zh: '🇨🇳'
};

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flatten(val, newKey));
    } else {
      acc[newKey] = val;
    }

    return acc;
  }, {});
}

function loadLangFlat(lang) {
  const langDir = path.join(localesDir, lang);
  const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.json'));

  let merged = {};

  for (const file of files) {
    const filePath = path.join(langDir, file);
    const namespace = path.basename(file, '.json');
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const flat = flatten(content, namespace);
    merged = { ...merged, ...flat };
  }

  return merged;
}

function statusBar(pct, size = 40) {
  const filled = Math.round((pct / 100) * size);
  const empty = size - filled;

  return `${'▓'.repeat(filled)}${'░'.repeat(empty)} ${pct}%`;
}

function langLabel(lang) {
  return `${FLAGS[lang] || ''} ${lang}`;
}

const refFlat = loadLangFlat(referenceLang);
const refKeys = Object.keys(refFlat);

const langs = fs
  .readdirSync(localesDir)
  .filter((f) => fs.statSync(path.join(localesDir, f)).isDirectory());

const results = langs
  .filter((lang) => lang !== referenceLang)
  .map((lang) => {
    const flat = loadLangFlat(lang);

    const missingKeys = refKeys.filter(
      (key) => !flat[key] || String(flat[key]).trim() === ''
    );

    const translated = refKeys.length - missingKeys.length;
    const pct = Math.round((translated / refKeys.length) * 100);

    return {
      lang,
      pct,
      missing: missingKeys.length,
      missingKeys
    };
  });

results.sort((a, b) => b.pct - a.pct);

const table = [
  '| Language | Translation status | Missing keys |',
  '|----------|--------------------|--------------|',
  ...results.map(
    (r) => `| ${langLabel(r.lang)} | \`${statusBar(r.pct)}\` | ${r.missing} |`
  )
].join('\n');

const readme = fs.readFileSync(readmePath, 'utf8');

const start = '<!-- I18N-COVERAGE:START -->';
const end = '<!-- I18N-COVERAGE:END -->';

const regex = new RegExp(`${start}[\\s\\S]*?${end}`);

if (!regex.test(readme)) {
  console.error(`Could not find ${start} / ${end} markers in ${readmePath}`);
  process.exit(1);
}

const updated = readme.replace(regex, `${start}\n${table}\n${end}`);

fs.writeFileSync(readmePath, updated);

console.log('README i18n coverage updated.');

results.forEach((r) => {
  if (r.missingKeys.length) {
    console.log(`\n${r.lang} — ${r.missing} missing key(s)`);
  }
});
