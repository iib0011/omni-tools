import i18n, { Namespace, ParseKeys } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const validNamespaces = [
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
] as const satisfies readonly Namespace[];

export type I18nNamespaces = (typeof validNamespaces)[number];
export type FullI18nKey = {
  [K in I18nNamespaces]: `${K}:${ParseKeys<K>}`;
}[I18nNamespaces];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'de', 'es', 'fr', 'pt', 'ja', 'hi', 'nl', 'ru', 'zh'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    backend: {
      loadPath: `${
        (import.meta as any).env.BASE_URL?.replace(/\/$/, '') || ''
      }/locales/{{lng}}/{{ns}}.json`
    },
    detection: {
      lookupLocalStorage: 'lang',
      caches: ['localStorage'] // cache the detected lang back to localStorage
    }
  });

export default i18n;
