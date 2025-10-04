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

const currentLang = localStorage.getItem('lang');
const userHasChosenLang = localStorage.getItem('userChosenLang'); // Flag to track if user manually selected

if (
  window.DEFAULT_LANG &&
  (!currentLang || (!userHasChosenLang && currentLang === 'en'))
) {
  const supportedLangs = [
    'en',
    'de',
    'es',
    'fr',
    'pt',
    'ja',
    'hi',
    'nl',
    'ru',
    'zh'
  ];
  if (supportedLangs.includes(window.DEFAULT_LANG)) {
    localStorage.setItem('lang', window.DEFAULT_LANG);
  }
}

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
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      lookupLocalStorage: 'lang',
      caches: ['localStorage'] // cache the detected lang back to localStorage
    }
  });

export default i18n;
