// types/i18next.d.ts
import 'i18next';
import enGlobal from '../src/i18n/en.json';
import enList from '../src/pages/tools/list/i18n/en.json';
import enString from '../src/pages/tools/string/i18n/en.json';
import enCsv from '../src/pages/tools/csv/i18n/en.json';
import enJson from '../src/pages/tools/json/i18n/en.json';
import enPdf from '../src/pages/tools/pdf/i18n/en.json';
import enImage from '../src/pages/tools/image/i18n/en.json';
import enAudio from '../src/pages/tools/audio/i18n/en.json';
import enVideo from '../src/pages/tools/video/i18n/en.json';
import enNumber from '../src/pages/tools/number/i18n/en.json';
import enTime from '../src/pages/tools/time/i18n/en.json';
import enXml from '../src/pages/tools/xml/i18n/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enGlobal;
      list: typeof enList;
      string: typeof enString;
      csv: typeof enCsv;
      json: typeof enJson;
      pdf: typeof enPdf;
      image: typeof enImage;
      audio: typeof enAudio;
      video: typeof enVideo;
      number: typeof enNumber;
      time: typeof enTime;
      xml: typeof enXml;
    };
  }
}
