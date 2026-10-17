import { toWords } from 'to-words';
import { InitialValuesType } from './types';

/**
 * Maps omni-tools' i18n language codes (stored in localStorage under 'lang')
 * to the locale codes expected by the `to-words` package.
 * Mirrors the pattern used in tools/time/crontab-guru/service.ts.
 */
const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
  ja: 'ja-JP',
  hi: 'hi-IN',
  nl: 'nl-NL',
  ru: 'ru-RU',
  zh: 'zh-CN'
};

const getLocaleCode = (): string => {
  const lang = localStorage.getItem('lang') || 'en';
  return LANG_MAP[lang] || 'en-US';
};

/**
 * Converts each line of the input into words using the `to-words` package.
 * The locale is auto-detected from the user's language preference in localStorage,
 * so the output matches their selected UI language.
 *
 * Empty lines are preserved so the output line count matches the input.
 */
export function numberToWords(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const localeCode = getLocaleCode();

  return input
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === '') return '';

      try {
        let result = toWords(trimmed, {
          localeCode,
          useAnd: options.useAnd
        });
        if (options.uppercase) result = result.toUpperCase();
        return result;
      } catch {
        return '';
      }
    })
    .join('\n');
}
