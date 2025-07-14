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
  projectId: 'e7156a3e-66fb-4035-a0f0-cebf1c63a3ba', // Replace with your Locize project ID
  apiKey: import.meta.env.LOCIZE_API_KEY, // Replace with your Locize API key
  referenceLng: 'en',
  version: 'latest'
};
// Merge translations for demonstration; in a real app, use namespaces

export type I18nNamespaces =
  | 'translation'
  | 'list'
  | 'string'
  | 'csv'
  | 'json'
  | 'pdf'
  | 'image'
  | 'audio'
  | 'video'
  | 'number'
  | 'time'
  | 'xml';
export type FullI18nKey = {
  [K in I18nNamespaces]: `${K}:${ParseKeys<K>}`;
}[I18nNamespaces];

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  backend: useLocize
    ? locizeOptions
    : {
        // Static files backend for production
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      }
});

export default i18n;
