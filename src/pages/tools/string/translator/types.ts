/** Language code used for automatic source-language detection. */
export const AUTO_DETECT = 'auto';

export type TranslatorMode = 'text' | 'document';

/**
 * Where a translation was produced:
 * - `browser`: the browser's built-in, on-device Translator API
 * - `mymemory`: the free MyMemory web service (fallback)
 */
export type TranslationEngine = 'browser' | 'mymemory';

export interface Language {
  code: string;
  name: string;
}

export interface DetectedLanguage {
  language: string;
  /** Detection confidence, 0–100, when the engine reports one. */
  confidence?: number;
}

export interface TranslationRequest {
  source: string;
  target: string;
}

export type TranslationProgress =
  | { phase: 'downloading'; /** 0–1 */ loaded: number }
  | { phase: 'translating'; done: number; total: number };

export interface TranslationOptions {
  signal?: AbortSignal;
  onProgress?: (progress: TranslationProgress) => void;
}

export interface TextTranslationResult {
  translatedText: string;
  engine: TranslationEngine;
  detectedLanguage?: DetectedLanguage;
}

export interface DocumentTranslationResult {
  file: File;
  engine: TranslationEngine;
  detectedLanguage?: DetectedLanguage;
}

/** Machine-readable failure categories, mapped to localized messages in the UI. */
export type TranslatorErrorCode =
  | 'network'
  | 'timeout'
  | 'rateLimited'
  | 'quotaExceeded'
  | 'unsupportedLanguage'
  | 'serverError'
  | 'invalidResponse'
  | 'emptyInput'
  | 'sameLanguage'
  | 'detectionFailed'
  | 'activationRequired'
  | 'unsupportedFormat'
  | 'fileTooLarge'
  | 'emptyFile'
  | 'corruptDocument'
  | 'noTextFound'
  | 'documentTooLongForOnline';
