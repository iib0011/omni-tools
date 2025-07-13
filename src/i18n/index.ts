import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enGlobal from './en.json';
import enList from '../pages/tools/list/i18n/en.json';
import enString from '../pages/tools/string/i18n/en.json';
import enCsv from '../pages/tools/csv/i18n/en.json';
import enJson from '../pages/tools/json/i18n/en.json';
import enPdf from '../pages/tools/pdf/i18n/en.json';
import enImage from '../pages/tools/image/i18n/en.json';
import enAudio from '../pages/tools/audio/i18n/en.json';
import enVideo from '../pages/tools/video/i18n/en.json';
import enNumber from '../pages/tools/number/i18n/en.json';
import enTime from '../pages/tools/time/i18n/en.json';
import enXml from '../pages/tools/xml/i18n/en.json';

// Merge translations for demonstration; in a real app, use namespaces
const resources = {
  en: {
    translation: {
      ...enGlobal,
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
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
