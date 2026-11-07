import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Tab, Tabs } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTranslation } from 'react-i18next';
import { ToolComponentProps } from '@tools/defineTool';
import ToolInfo from '@components/ToolInfo';
import ServerSettings from './components/ServerSettings';
import TextTranslator from './components/TextTranslator';
import DocumentTranslator from './components/DocumentTranslator';
import { LanguageBarProps } from './components/LanguageBar';
import { getTargetOptions, pickTarget } from './languages';
import { loadConfig, saveConfig } from './service';
import {
  getServerHost,
  useLibreTranslateServer
} from './useLibreTranslateServer';
import { AUTO_DETECT, TranslatorConfig, TranslatorMode } from './types';

export default function Translator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t, i18n } = useTranslation('string');
  const [config, setConfig] = useState<TranslatorConfig>(loadConfig);
  const [mode, setMode] = useState<TranslatorMode>('text');
  const [source, setSource] = useState<string>(AUTO_DETECT);
  const [target, setTarget] = useState<string>('');

  const server = useLibreTranslateServer(config);
  const { languages, settings } = server;
  const connected = Boolean(server.connectedHost) && languages.length > 0;
  const host = getServerHost(config.serverUrl);

  const targetOptions = useMemo(
    () => getTargetOptions(languages, source),
    [languages, source]
  );

  // Keep the selection valid when the server or source language changes.
  useEffect(() => {
    if (
      source !== AUTO_DETECT &&
      languages.length > 0 &&
      !languages.some((language) => language.code === source)
    ) {
      setSource(AUTO_DETECT);
    }
  }, [languages, source]);

  useEffect(() => {
    setTarget((current) =>
      pickTarget(targetOptions, current, i18n.language ?? 'en')
    );
  }, [targetOptions, i18n.language]);

  const handleConnect = (next: TranslatorConfig) => {
    saveConfig(next);
    // Always a new object, so "Connect" also retries an unchanged config.
    setConfig({ ...next });
  };

  const handleSwap = () => {
    if (source === AUTO_DETECT) return;
    const nextSource = target;
    const nextTarget = source;
    setSource(nextSource);
    // The target effect would otherwise keep the old target if still valid.
    setTarget(nextTarget);
  };

  const languageBarProps: LanguageBarProps = {
    languages,
    targetOptions,
    source,
    target,
    onSourceChange: setSource,
    onTargetChange: setTarget,
    onSwap: handleSwap,
    disabled: !connected
  };

  return (
    <Box>
      <ServerSettings
        config={config}
        onConnect={handleConnect}
        loading={server.loading}
        connectedHost={server.connectedHost}
        languageCount={languages.length}
        keyRequired={settings?.keyRequired ?? false}
        error={server.error}
      />

      {host && (
        <Alert
          severity="info"
          role="note"
          sx={{ mb: 2 }}
          data-testid="translator-privacy"
        >
          {t('translator.privacyNotice', { server: host })}
        </Alert>
      )}

      <Tabs
        value={mode}
        onChange={(_, value: TranslatorMode) => setMode(value)}
        aria-label={t('translator.modeLabel')}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="text"
          label={t('translator.textMode')}
          icon={<NotesIcon />}
          iconPosition="start"
          id="translator-tab-text"
          aria-controls="translator-panel-text"
        />
        <Tab
          value="document"
          label={t('translator.documentMode')}
          icon={<DescriptionOutlinedIcon />}
          iconPosition="start"
          id="translator-tab-document"
          aria-controls="translator-panel-document"
        />
      </Tabs>

      <Box
        role="tabpanel"
        id={`translator-panel-${mode}`}
        aria-labelledby={`translator-tab-${mode}`}
      >
        {mode === 'text' ? (
          <TextTranslator
            config={config}
            languages={languages}
            languageBarProps={languageBarProps}
            charLimit={settings?.charLimit ?? -1}
            disabled={!connected}
          />
        ) : (
          <DocumentTranslator
            config={config}
            settings={settings}
            languageBarProps={languageBarProps}
            disabled={!connected}
          />
        )}
      </Box>

      {longDescription && (
        <ToolInfo
          title={t('translator.toolInfo.title', { title })}
          description={longDescription}
        />
      )}
    </Box>
  );
}
