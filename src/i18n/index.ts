import i18n, { ParseKeys } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const isDevelopment = !import.meta.env.PROD;
const isContributor = import.meta.env.VITE_CONTRIBUTOR_MODE === 'true';

const useLocize = isDevelopment && isContributor;
if (useLocize) {
  const { default: LocizeBackend } = await import('i18next-locize-backend');
  i18n.use(LocizeBackend);
  console.log('Using Locize backend in development/contributor mode');
} else {
  // Use static files in production
  i18n.use(Backend);
}

const locizeOptions = {
  projectId: 'e7156a3e-66fb-4035-a0f0-cebf1c63a3ba',
  apiKey: import.meta.env.LOCIZE_API_KEY,
  referenceLng: 'en',
  version: 'latest'
};

export const validNamespaces: string[] = [
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
  'image'
];
export type I18nNamespaces = (typeof validNamespaces)[number];
export type FullI18nKey = {
  [K in I18nNamespaces]: `${K}:${ParseKeys<K>}`;
}[I18nNamespaces];

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  backend: useLocize
    ? locizeOptions
    : {
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      },
  saveMissing: useLocize,
  updateMissing: useLocize
});

export default i18n;
