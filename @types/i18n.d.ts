// types/i18next.d.ts
import 'i18next';
import { resources } from '../src/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['en'];
  }
}
