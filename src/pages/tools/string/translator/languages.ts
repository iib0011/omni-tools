import { AUTO_DETECT, LibreLanguage } from './types';

/**
 * Languages the given source can be translated into. With auto-detection
 * every language is a candidate; otherwise the server's `targets` list is
 * used when present.
 */
export function getTargetOptions(
  languages: LibreLanguage[],
  source: string
): LibreLanguage[] {
  if (source === AUTO_DETECT) return languages;
  const sourceLanguage = languages.find((language) => language.code === source);
  const targets = sourceLanguage?.targets;
  if (targets && targets.length > 0) {
    return languages.filter(
      (language) => language.code !== source && targets.includes(language.code)
    );
  }
  return languages.filter((language) => language.code !== source);
}

/**
 * Picks a sensible target: the current one if still valid, else the UI
 * language, else English, else the first available option.
 */
export function pickTarget(
  options: LibreLanguage[],
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
