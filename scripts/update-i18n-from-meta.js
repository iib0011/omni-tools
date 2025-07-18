const fs = require('fs');
const path = require('path');

// Helper function to convert kebab-case to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Helper function to recursively find all meta.ts files
function findMetaFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);

      if (item.isDirectory()) {
        traverse(fullPath);
      } else if (item.name === 'meta.ts') {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Helper function to parse meta.ts file and extract the required fields
function parseMeta(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract category from defineTool first parameter
  const categoryMatch = content.match(/defineTool\s*\(\s*['"]([^'"]+)['"]/);
  if (!categoryMatch) {
    throw new Error(`Could not find category in ${filePath}`);
  }
  const category = categoryMatch[1];

  // Extract name, description, and shortDescription
  const nameMatch = content.match(/name\s*:\s*['"`]([^'"`]+)['"`]/);
  const descMatch = content.match(
    /description\s*:\s*['"`]([\s\S]*?)['"`]\s*,\s*shortDescription/
  );
  const shortMatch = content.match(
    /shortDescription\s*:\s*['"`]([^'"`]+)['"`]/
  );

  if (!nameMatch || !descMatch || !shortMatch) {
    console.warn(`⚠️  Missing fields in ${filePath}`);
    console.warn(
      `   name: ${!!nameMatch}, description: ${!!descMatch}, shortDescription: ${!!shortMatch}`
    );
    return null;
  }

  return {
    category,
    name: nameMatch[1],
    description: descMatch[1].replace(/\s+/g, ' ').trim(),
    shortDescription: shortMatch[1]
  };
}

// Main execution
console.log('🚀 Starting i18n extraction from meta.ts files...\n');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Helper function to get or create category i18n file
function getCategoryI18nPath(category) {
  return path.join(
    PROJECT_ROOT,
    'src',
    'pages',
    'tools',
    category,
    'i18n',
    'en.json'
  );
}

function loadCategoryI18n(category) {
  const i18nPath = getCategoryI18nPath(category);

  try {
    if (fs.existsSync(i18nPath)) {
      const i18nRaw = fs.readFileSync(i18nPath, 'utf8');
      return JSON.parse(i18nRaw);
    } else {
      // Create directory if it doesn't exist
      const i18nDir = path.dirname(i18nPath);
      if (!fs.existsSync(i18nDir)) {
        fs.mkdirSync(i18nDir, { recursive: true });
      }
      return {};
    }
  } catch (err) {
    console.error(`❌ Failed to parse ${i18nPath}:`, err.message);
    return {};
  }
}

function saveCategoryI18n(category, data) {
  const i18nPath = getCategoryI18nPath(category);

  // Create backup
  // if (fs.existsSync(i18nPath)) {
  //   fs.copyFileSync(i18nPath, i18nPath + '.bak');
  // }

  // Write updated file
  fs.writeFileSync(i18nPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return i18nPath;
}

// 2) Find all meta.ts files under src/pages/tools
const toolsDir = path.join(PROJECT_ROOT, 'src', 'pages', 'tools');
const files = findMetaFiles(toolsDir);
console.log(`📁 Found ${files.length} meta.ts files\n`);

let addedCount = 0;
let skippedCount = 0;
let errorCount = 0;
const updatedCategories = new Set();

// 3) Process each meta.ts file
const categoryData = {};

files.forEach((file) => {
  try {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const parsed = parseMeta(file);

    if (!parsed) {
      errorCount++;
      return;
    }

    const { category, name, description, shortDescription } = parsed;

    // Load category i18n data if not already loaded
    if (!categoryData[category]) {
      categoryData[category] = loadCategoryI18n(category);
    }

    // Get tool key from folder name (convert kebab-case to camelCase)
    const toolSlug = path.basename(path.dirname(file));
    const toolKey = toCamelCase(toolSlug);

    // Ensure tool entry exists
    if (!categoryData[category][toolKey]) {
      categoryData[category][toolKey] = {};
    }

    const entry = categoryData[category][toolKey];
    let hasChanges = false;

    // Add missing fields
    if (!entry.name) {
      entry.name = name;
      hasChanges = true;
    }
    if (!entry.description) {
      entry.description = description;
      hasChanges = true;
    }
    if (!entry.shortDescription) {
      entry.shortDescription = shortDescription;
      hasChanges = true;
    }

    if (hasChanges) {
      console.log(`✅ Updated ${category}/${toolKey}`);
      addedCount++;
      updatedCategories.add(category);
    } else {
      console.log(`⏭️  Skipped ${category}/${toolKey} (already exists)`);
      skippedCount++;
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
    errorCount++;
  }
});

// 4) Save updated category i18n files
console.log('\n💾 Saving updated i18n files...');
for (const category of updatedCategories) {
  const savedPath = saveCategoryI18n(category, categoryData[category]);
  console.log(`   📁 ${path.relative(PROJECT_ROOT, savedPath)}`);
}

// 6) Summary
console.log('\n📊 Summary:');
console.log(`   ✅ Updated: ${addedCount} tools`);
console.log(`   ⏭️  Skipped: ${skippedCount} tools (already had entries)`);
console.log(`   ❌ Errors: ${errorCount} tools`);
console.log(
  `\n🎉 Successfully updated ${updatedCategories.size} category i18n files!`
);
