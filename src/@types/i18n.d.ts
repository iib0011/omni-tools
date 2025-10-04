import 'i18next';

import translation from '../../public/locales/en/translation.json';
import string from '../../public/locales/en/string.json';
import number from '../../public/locales/en/number.json';
import video from '../../public/locales/en/video.json';
import list from '../../public/locales/en/list.json';
import json from '../../public/locales/en/json.json';
import time from '../../public/locales/en/time.json';
import csv from '../../public/locales/en/csv.json';
import pdf from '../../public/locales/en/pdf.json';
import audio from '../../public/locales/en/audio.json';
import xml from '../../public/locales/en/xml.json';
import image from '../../public/locales/en/image.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translation;
      string: typeof string;
      number: typeof number;
      video: typeof video;
      list: typeof list;
      json: typeof json;
      time: typeof time;
      csv: typeof csv;
      pdf: typeof pdf;
      audio: typeof audio;
      xml: typeof xml;
      image: typeof image;
    };
  }
}

declare global {
  interface Window {
    DEFAULT_LANG?: string;
  }
}
