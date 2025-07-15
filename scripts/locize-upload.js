// one-time-upload.js
// Simple script to upload your existing translations to Locize once

const fs = require('fs');
const https = require('https');

// Configuration
const LOCIZE_PROJECT_ID = 'e7156a3e-66fb-4035-a0f0-cebf1c63a3ba';
const LOCIZE_API_KEY = process.env.LOCIZE_API_KEY; // Replace with your actual API key
const LOCIZE_VERSION = 'latest';

// Define your translation files
const translationFiles = [
  // English translations
  { lang: 'en', namespace: 'translation', file: '../src/i18n/en.json' },
  {
    lang: 'en',
    namespace: 'list',
    file: '../src/pages/tools/list/i18n/en.json'
  },
  {
    lang: 'en',
    namespace: 'string',
    file: '../src/pages/tools/string/i18n/en.json'
  },
  { lang: 'en', namespace: 'csv', file: '../src/pages/tools/csv/i18n/en.json' },
  {
    lang: 'en',
    namespace: 'json',
    file: '../src/pages/tools/json/i18n/en.json'
  },
  { lang: 'en', namespace: 'pdf', file: '../src/pages/tools/pdf/i18n/en.json' },
  {
    lang: 'en',
    namespace: 'image',
    file: '../src/pages/tools/image/i18n/en.json'
  },
  {
    lang: 'en',
    namespace: 'audio',
    file: '../src/pages/tools/audio/i18n/en.json'
  },
  {
    lang: 'en',
    namespace: 'video',
    file: '../src/pages/tools/video/i18n/en.json'
  },
  {
    lang: 'en',
    namespace: 'number',
    file: '../src/pages/tools/number/i18n/en.json'
  },
  {
    lang: 'en',
    namespace: 'time',
    file: '../src/pages/tools/time/i18n/en.json'
  },
  { lang: 'en', namespace: 'xml', file: '../src/pages/tools/xml/i18n/en.json' },

  // Hindi translations
  { lang: 'hi', namespace: 'translation', file: '../src/i18n/hi.json' },
  {
    lang: 'hi',
    namespace: 'list',
    file: '../src/pages/tools/list/i18n/hi.json'
  },
  {
    lang: 'hi',
    namespace: 'string',
    file: '../src/pages/tools/string/i18n/hi.json'
  },
  { lang: 'hi', namespace: 'csv', file: '../src/pages/tools/csv/i18n/hi.json' },
  {
    lang: 'hi',
    namespace: 'json',
    file: '../src/pages/tools/json/i18n/hi.json'
  },
  { lang: 'hi', namespace: 'pdf', file: '../src/pages/tools/pdf/i18n/hi.json' },
  {
    lang: 'hi',
    namespace: 'image',
    file: '../src/pages/tools/image/i18n/hi.json'
  },
  {
    lang: 'hi',
    namespace: 'audio',
    file: '../src/pages/tools/audio/i18n/hi.json'
  },
  {
    lang: 'hi',
    namespace: 'video',
    file: '../src/pages/tools/video/i18n/hi.json'
  },
  {
    lang: 'hi',
    namespace: 'number',
    file: '../src/pages/tools/number/i18n/hi.json'
  },
  {
    lang: 'hi',
    namespace: 'time',
    file: '../src/pages/tools/time/i18n/hi.json'
  },
  { lang: 'hi', namespace: 'xml', file: '../src/pages/tools/xml/i18n/hi.json' }
];

function flattenJson(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenJson(obj[key], newKey));
      } else {
        // It's a primitive value or array
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
}

function uploadToLocize(lang, namespace, data) {
  return new Promise((resolve, reject) => {
    // Flatten the JSON structure for Locize API
    const flattenedData = flattenJson(data);
    const postData = JSON.stringify(flattenedData);

    const options = {
      hostname: 'api.locize.app',
      port: 443,
      path: `/update/${LOCIZE_PROJECT_ID}/${LOCIZE_VERSION}/${lang}/${namespace}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOCIZE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Starting one-time upload to Locize...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const { lang, namespace, file } of translationFiles) {
    try {
      // Check if file exists
      if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        continue;
      }

      // Read translation file
      const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
      const flattenedTranslations = flattenJson(translations);
      const keyCount = Object.keys(flattenedTranslations).length;

      if (keyCount === 0) {
        console.log(`⚠️  Empty file: ${lang}/${namespace}`);
        continue;
      }

      // Upload to Locize
      await uploadToLocize(lang, namespace, translations);
      console.log(`✅ ${lang}/${namespace} - ${keyCount} keys uploaded`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${lang}/${namespace} - Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n=== Upload Summary ===');
  console.log(`✅ Successful uploads: ${successCount}`);
  console.log(`❌ Failed uploads: ${errorCount}`);
  console.log(`📊 Total files processed: ${successCount + errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All translations uploaded successfully!');
    console.log('You can now view them in your Locize dashboard.');
  }
}

// Run the upload
main().catch(console.error);
