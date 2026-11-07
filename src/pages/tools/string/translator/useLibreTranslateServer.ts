import { useEffect, useState } from 'react';
import {
  fetchLanguages,
  fetchServerSettings,
  isAbortError,
  normalizeServerUrl
} from './service';
import { LibreLanguage, LibreServerSettings, TranslatorConfig } from './types';

export interface LibreTranslateServerState {
  loading: boolean;
  languages: LibreLanguage[];
  settings: LibreServerSettings | null;
  /** Host of the server the languages were loaded from, once connected. */
  connectedHost: string | null;
  error: unknown;
}

const initialState: LibreTranslateServerState = {
  loading: false,
  languages: [],
  settings: null,
  connectedHost: null,
  error: null
};

/** Host part of the configured URL for display, or `null` if invalid. */
export function getServerHost(serverUrl: string): string | null {
  try {
    return new URL(normalizeServerUrl(serverUrl)).host;
  } catch {
    return null;
  }
}

/**
 * Loads languages and capabilities from the configured server. Re-runs
 * whenever a new config object is passed (including "reconnect" with the same
 * values), and cancels in-flight requests when the config changes.
 */
export function useLibreTranslateServer(
  config: TranslatorConfig
): LibreTranslateServerState {
  const [state, setState] = useState<LibreTranslateServerState>(initialState);

  useEffect(() => {
    if (!config.serverUrl) {
      setState(initialState);
      return;
    }
    const controller = new AbortController();
    setState({ ...initialState, loading: true });

    Promise.all([
      fetchLanguages(config, controller.signal),
      fetchServerSettings(config, controller.signal)
    ])
      .then(([languages, settings]) => {
        setState({
          loading: false,
          languages,
          settings,
          connectedHost: getServerHost(config.serverUrl),
          error: null
        });
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        setState({ ...initialState, error });
      });

    return () => controller.abort();
  }, [config]);

  return state;
}
