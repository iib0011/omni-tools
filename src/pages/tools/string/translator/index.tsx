import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Tab, Tabs } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTranslation } from 'react-i18next';
import { ToolComponentProps } from '@tools/defineTool';
import ToolInfo from '@components/ToolInfo';
import TextTranslator from './components/TextTranslator';
import DocumentTranslator from './components/DocumentTranslator';
import { LanguageBarProps } from './components/LanguageBar';
import { getLanguages, getTargetOptions, pickTarget } from './languages';
import { getPreferredEngine } from './service';
import { AUTO_DETECT, TranslatorMode } from './types';

export default function Translator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t, i18n } = useTranslation('string');
  const uiLanguage = i18n.language ?? 'en';
  const [mode, setMode] = useState<TranslatorMode>('text');
  const [source, setSource] = useState<string>(AUTO_DETECT);
  const [target, setTarget] = useState<string>('');
  const onDevice = useMemo(() => getPreferredEngine() === 'browser', []);

  const languages = useMemo(() => getLanguages(uiLanguage), [uiLanguage]);
  const targetOptions = useMemo(
    () => getTargetOptions(languages, source),
    [languages, source]
  );

  useEffect(() => {
    setTarget((current) => pickTarget(targetOptions, current, uiLanguage));
  }, [targetOptions, uiLanguage]);

  const handleSwap = () => {
    if (source === AUTO_DETECT) return;
    setSource(target);
    setTarget(source);
  };

  const languageBarProps: LanguageBarProps = {
    languages,
    targetOptions,
    source,
    target,
    onSourceChange: setSource,
    onTargetChange: setTarget,
    onSwap: handleSwap
  };

  return (
    <Box>
      <Alert
        severity={onDevice ? 'success' : 'info'}
        role="note"
        sx={{ mb: 2 }}
        data-testid="translator-privacy"
      >
        {onDevice
          ? t('translator.privacyOnDevice')
          : t('translator.privacyOnline')}
      </Alert>

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
            languages={languages}
            languageBarProps={languageBarProps}
          />
        ) : (
          <DocumentTranslator languageBarProps={languageBarProps} />
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
