declare const __APP_VERSION__: string;
declare const __COMMIT_HASH__: string;

interface ImportMetaEnv {
  /** Default LibreTranslate server for the Translator tool (optional). */
  readonly VITE_LIBRETRANSLATE_URL?: string;
  /** Default LibreTranslate API key (optional, embedded in the bundle). */
  readonly VITE_LIBRETRANSLATE_API_KEY?: string;
}
