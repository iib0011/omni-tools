const fs = require('fs');
const path = require('path');

const TYPE_MAPPING = { 'image-generic': 'image', png: 'image' };
// Helper function to convert kebab-case to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Helper function to parse meta.ts file and extract required fields
function parseMeta(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract category from defineTool first parameter
  const categoryMatch = content.match(/defineTool\s*\(\s*['"]([^'"]+)['"]/);
  if (!categoryMatch) {
    throw new Error(`Could not find category in ${filePath}`);
  }
  const category = categoryMatch[1];

  // Extract name, description, shortDescription, and longDescription
  const nameMatch = content.match(/name\s*:\s*['"`]([^'"`]+)['"`]/);
  const descMatch = content.match(/description\s*:\s*['"`]([\s\S]*?)['"`]/);
  const shortMatch = content.match(
    /shortDescription\s*:\s*['"`]([^'"`]+)['"`]/
  );
  const longMatch = content.match(/longDescription\s*:\s*['"`]([\s\S]*?)['"`]/);

  if (!nameMatch || !descMatch || !shortMatch) {
    console.warn(`⚠️  Missing required fields in ${filePath}`);
    console.warn(
      `   name: ${!!nameMatch}, description: ${!!descMatch}, shortDescription: ${!!shortMatch}`
    );
    return null;
  }

  return {
    category,
    name: nameMatch[1],
    description: descMatch[1].replace(/\s+/g, ' ').trim(),
    shortDescription: shortMatch[1],
    longDescription: longMatch ? longMatch[1].replace(/\s+/g, ' ').trim() : null
  };
}

// Helper function to check if meta.ts already has i18n field
function hasI18nField(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('i18n:');
}

// Helper function to add i18n field to meta.ts
function addI18nToMeta(filePath, category, toolName, hasLongDescription) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Build i18n object
  let i18nObject = `  i18n: {
    name: '${category}:${toolName}.title',
    description: '${category}:${toolName}.description',
    shortDescription: '${category}:${toolName}.shortDescription'`;

  if (hasLongDescription) {
    i18nObject += `,
    longDescription: '${category}:${toolName}.longDescription'`;
  }

  i18nObject += `
  },`;

  // Find the position to insert i18n (after the export line but before the closing bracket)
  const exportMatch = content.match(/export const tool = defineTool\([^{]*\{/);
  if (!exportMatch) {
    throw new Error(`Could not find export structure in ${filePath}`);
  }

  const insertPosition = exportMatch.index + exportMatch[0].length;
  const beforeInsert = content.substring(0, insertPosition);
  const afterInsert = content.substring(insertPosition);

  // Insert i18n field at the beginning of the object
  const updatedContent = beforeInsert + '\n' + i18nObject + afterInsert;

  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

// Helper function to get category i18n file path
function getCategoryI18nPath(category) {
  const PROJECT_ROOT = path.resolve(__dirname, '..');
  // Special case: image-generic tools use the image folder for i18n
  const folderName = TYPE_MAPPING[category] || category;
  return path.join(
    PROJECT_ROOT,
    'src',
    'pages',
    'tools',
    folderName,
    'i18n',
    'en.json'
  );
}

// Helper function to load category i18n data
function loadCategoryI18n(category) {
  const i18nPath = getCategoryI18nPath(category);

  try {
    if (fs.existsSync(i18nPath)) {
      const i18nRaw = fs.readFileSync(i18nPath, 'utf8');
      return JSON.parse(i18nRaw);
    } else {
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

// Helper function to save category i18n data
function saveCategoryI18n(category, data) {
  const i18nPath = getCategoryI18nPath(category);
  fs.writeFileSync(i18nPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return i18nPath;
}

// Main execution
console.log('🚀 Adding i18n fields to meta.ts files...\n');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Target files as specified
const rootDir = path.join(PROJECT_ROOT, 'src/pages/tools');
const metaFiles = [];

function findMetaFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      findMetaFiles(fullPath); // Recurse
    } else if (item.isFile() && item.name === 'meta.ts') {
      metaFiles.push(fullPath);
    }
  }
}

findMetaFiles(rootDir);

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;
const updatedCategories = new Set();
const categoryData = {};

// Process each target file
metaFiles.forEach((filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      errorCount++;
      return;
    }

    // Check if i18n field already exists
    if (hasI18nField(filePath)) {
      console.log(`⏭️  Skipped ${filePath} (already has i18n field)`);
      skippedCount++;
      return;
    }

    // Parse meta.ts file
    const parsed = parseMeta(filePath);
    if (!parsed) {
      errorCount++;
      return;
    }

    const {
      category: rawCategory,
      name,
      description,
      shortDescription,
      longDescription
    } = parsed;

    const category = TYPE_MAPPING[rawCategory] || rawCategory;
    // Get tool name from folder path
    const toolFolderName = path.basename(path.dirname(filePath));
    const toolKey = toCamelCase(toolFolderName); // camelCase for i18n file keys

    // Load category i18n data if not already loaded
    if (!categoryData[category]) {
      categoryData[category] = loadCategoryI18n(category);
    }

    // Ensure tool entry exists in i18n
    if (!categoryData[category][toolKey]) {
      categoryData[category][toolKey] = {};
    }

    const entry = categoryData[category][toolKey];
    let hasI18nChanges = false;

    // Add missing fields to i18n
    if (!entry.title) {
      entry.title = name;
      hasI18nChanges = true;
    }
    if (!entry.description) {
      entry.description = description;
      hasI18nChanges = true;
    }
    if (!entry.shortDescription) {
      entry.shortDescription = shortDescription;
      hasI18nChanges = true;
    }
    if (longDescription && !entry.longDescription) {
      entry.longDescription = longDescription;
      hasI18nChanges = true;
    }

    // Add i18n field to meta.ts
    addI18nToMeta(filePath, category, toolKey, !!longDescription);

    if (hasI18nChanges) {
      updatedCategories.add(category);
    }

    console.log(`✅ Added i18n to ${filePath}`);
    processedCount++;
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
    errorCount++;
  }
});

// Save updated category i18n files
if (updatedCategories.size > 0) {
  console.log('\n💾 Saving updated i18n files...');
  for (const category of updatedCategories) {
    const savedPath = saveCategoryI18n(category, categoryData[category]);
    console.log(`   📁 ${path.relative(PROJECT_ROOT, savedPath)}`);
  }
}

// Summary
console.log('\n📊 Summary:');
console.log(`   ✅ Processed: ${processedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files (already had i18n)`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(
  `\n🎉 Successfully updated ${processedCount} meta.ts files and ${updatedCategories.size} i18n files!`
);
