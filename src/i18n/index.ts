import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enGlobal from './en.json';
import hiGlobal from './hi.json';
import enList from '../pages/tools/list/i18n/en.json';
import hiList from '../pages/tools/list/i18n/hi.json';
import enString from '../pages/tools/string/i18n/en.json';
import hiString from '../pages/tools/string/i18n/hi.json';
import enCsv from '../pages/tools/csv/i18n/en.json';
import hiCsv from '../pages/tools/csv/i18n/hi.json';
import enJson from '../pages/tools/json/i18n/en.json';
import hiJson from '../pages/tools/json/i18n/hi.json';
import enPdf from '../pages/tools/pdf/i18n/en.json';
import hiPdf from '../pages/tools/pdf/i18n/hi.json';
import enImage from '../pages/tools/image/i18n/en.json';
import hiImage from '../pages/tools/image/i18n/hi.json';
import enAudio from '../pages/tools/audio/i18n/en.json';
import hiAudio from '../pages/tools/audio/i18n/hi.json';
import enVideo from '../pages/tools/video/i18n/en.json';
import hiVideo from '../pages/tools/video/i18n/hi.json';
import enNumber from '../pages/tools/number/i18n/en.json';
import hiNumber from '../pages/tools/number/i18n/hi.json';
import enTime from '../pages/tools/time/i18n/en.json';
import hiTime from '../pages/tools/time/i18n/hi.json';
import enXml from '../pages/tools/xml/i18n/en.json';
import hiXml from '../pages/tools/xml/i18n/hi.json';
import Backend from 'i18next-locize-backend';

const locizeOptions = {
  projectId: 'e7156a3e-66fb-4035-a0f0-cebf1c63a3ba', // Replace with your Locize project ID
  apiKey: import.meta.env.LOCIZE_API_KEY, // Replace with your Locize API key
  referenceLng: 'en',
  version: 'latest'
};
// Merge translations for demonstration; in a real app, use namespaces
const resources = {
  en: {
    translation: enGlobal,
    list: enList,
    string: enString,
    csv: enCsv,
    json: enJson,
    pdf: enPdf,
    image: enImage,
    audio: enAudio,
    video: enVideo,
    number: enNumber,
    time: enTime,
    xml: enXml
  },
  hi: {
    translation: hiGlobal,
    list: hiList,
    string: hiString,
    csv: hiCsv,
    json: hiJson,
    pdf: hiPdf,
    image: hiImage,
    audio: hiAudio,
    video: hiVideo,
    number: hiNumber,
    time: hiTime,
    xml: hiXml
  }
};

i18n
  // .use(Backend)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    backend: locizeOptions,
    saveMissing: true, // Send missing keys to Locize
    updateMissing: true // Update keys in Locize
  });

export default i18n;
