/** Language code used for automatic source-language detection. */
export const AUTO_DETECT = 'auto';

export type TranslatorMode = 'text' | 'document';

/** Connection settings for a LibreTranslate instance. */
export interface TranslatorConfig {
  /** Base URL of the LibreTranslate server, e.g. `https://translate.example.com`. */
  serverUrl: string;
  /** Optional API key for instances that require one. */
  apiKey: string;
}

/** Item returned by `GET /languages`. */
export interface LibreLanguage {
  code: string;
  name: string;
  /** Codes this language can be translated into. */
  targets?: string[];
}

/** Subset of `GET /frontend/settings` that the tool relies on. */
export interface LibreServerSettings {
  /** Maximum characters per request; `-1` (or missing) means unlimited. */
  charLimit: number;
  keyRequired: boolean;
  filesTranslation: boolean;
  /** Extensions accepted by `/translate_file`, e.g. `['.txt', '.pdf']`. */
  supportedFilesFormat: string[];
}

export interface DetectedLanguage {
  language: string;
  /** Detection confidence, 0–100. */
  confidence: number;
}

export interface TextTranslationRequest {
  text: string;
  source: string;
  target: string;
}

export interface TextTranslationResult {
  translatedText: string;
  detectedLanguage?: DetectedLanguage;
}

export interface DocumentTranslationRequest {
  file: File;
  source: string;
  target: string;
}

/** Machine-readable failure categories, mapped to localized messages in the UI. */
export type TranslatorErrorCode =
  | 'notConfigured'
  | 'invalidServerUrl'
  | 'network'
  | 'timeout'
  | 'endpointNotFound'
  | 'badRequest'
  | 'keyRequired'
  | 'invalidKey'
  | 'rateLimited'
  | 'unsupportedLanguage'
  | 'filesDisabled'
  | 'unsupportedFormat'
  | 'serverError'
  | 'invalidResponse'
  | 'downloadFailed'
  | 'emptyInput'
  | 'sameLanguage'
  | 'textTooLong'
  | 'fileTooLarge'
  | 'emptyFile';
