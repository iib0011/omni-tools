import cronstrue from 'cronstrue/i18n';
import { isValidCron } from 'cron-validator';

const LANG: Record<string, string> = {
  fr: 'fr',
  en: 'en',
  es: 'es',
  de: 'de',
  ja: 'ja',
  zh: 'zh_CN',
  pt: 'pt_PT',
  nl: 'nl',
  ru: 'ru'
};

const getLanguage = (): string => {
  const lang = localStorage.getItem('lang') || 'en';
  return LANG[lang] || 'en';
};

export function explainCrontab(expr: string): string {
  return cronstrue.toString(expr, { locale: getLanguage() });
}

export function validateCrontab(expr: string): boolean {
  return isValidCron(expr, { seconds: false, allowBlankDay: true });
}

export function main(input: string): string {
  if (!input?.trim()) return '';

  return input
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (!validateCrontab(trimmed))
        return `Invalid crontab expression: "${trimmed}"`;
      return explainCrontab(trimmed);
    })
    .join('\n');
}
