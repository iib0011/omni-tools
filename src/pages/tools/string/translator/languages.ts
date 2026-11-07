import { AUTO_DETECT, Language } from './types';

/**
 * Languages offered in the selectors (BCP 47). This is the set supported by
 * the browser's built-in Translator API; MyMemory supports all of them too.
 */
export const LANGUAGE_CODES = [
  'ar',
  'bg',
  'bn',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'he',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'kn',
  'ko',
  'lt',
  'mr',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sv',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
  'zh-Hant'
] as const;

/** Localized language names, sorted for the UI language. */
export function getLanguages(uiLanguage: string): Language[] {
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames([uiLanguage, 'en'], {
      type: 'language'
    });
  } catch {
    // Intl.DisplayNames unavailable: fall back to codes.
  }
  return LANGUAGE_CODES.map((code) => {
    const name = displayNames?.of(code) ?? code;
    return { code, name: name.charAt(0).toLocaleUpperCase() + name.slice(1) };
  }).sort((a, b) => a.name.localeCompare(b.name, uiLanguage));
}

/**
 * Maps an engine-reported code (e.g. `fr-FR`, `zh-Hans`, `iw`) onto one of
 * {@link LANGUAGE_CODES}, or returns `null` if it is not offered.
 */
export function normalizeLanguageCode(code: string): string | null {
  const supported: readonly string[] = LANGUAGE_CODES;
  if (supported.includes(code)) return code;
  const lower = code.toLowerCase();
  if (lower === 'zh-hant' || lower === 'zh-tw' || lower === 'zh-hk') {
    return 'zh-Hant';
  }
  const base = lower.split(/[-_]/)[0];
  const aliases: Record<string, string> = { iw: 'he', nb: 'no', nn: 'no' };
  const resolved = aliases[base] ?? base;
  return supported.includes(resolved) ? resolved : null;
}

/** Every language except the selected source (all of them for auto-detect). */
export function getTargetOptions(
  languages: Language[],
  source: string
): Language[] {
  if (source === AUTO_DETECT) return languages;
  return languages.filter((language) => language.code !== source);
}

/**
 * Picks a sensible target: the current one if still valid, else the UI
 * language, else English, else the first available option.
 */
export function pickTarget(
  options: Language[],
  current: string,
  uiLanguage: string
): string {
  const codes = options.map((language) => language.code);
  if (codes.includes(current)) return current;
  const uiBase = uiLanguage.split('-')[0];
  return (
    codes.find((code) => code === uiLanguage) ??
    codes.find((code) => code.split('-')[0] === uiBase) ??
    codes.find((code) => code === 'en') ??
    codes[0] ??
    ''
  );
}
