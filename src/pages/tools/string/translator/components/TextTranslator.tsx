import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import InputHeader from '@components/InputHeader';
import InputFooter from '@components/input/InputFooter';
import ResultFooter from '@components/result/ResultFooter';
import ToolInputAndResult from '@components/ToolInputAndResult';
import { globalInputHeight } from '../../../../../config/uiConfig';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import { isAbortError, translateText } from '../service';
import { DetectedLanguage, LibreLanguage, TranslatorConfig } from '../types';
import LanguageBar, { LanguageBarProps } from './LanguageBar';
import TranslatorErrorAlert from './TranslatorErrorAlert';

const textFieldSx = {
  '&.MuiTextField-root': { backgroundColor: 'background.paper' }
};

export interface TextTranslatorProps {
  config: TranslatorConfig;
  languages: LibreLanguage[];
  languageBarProps: LanguageBarProps;
  /** Server character limit; values <= 0 mean unlimited. */
  charLimit: number;
  disabled?: boolean;
}

export default function TextTranslator({
  config,
  languages,
  languageBarProps,
  charLimit,
  disabled
}: TextTranslatorProps) {
  const { t } = useTranslation('string');
  const { t: tCommon } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detected, setDetected] = useState<DetectedLanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { source, target } = languageBarProps;
  const overLimit = charLimit > 0 && input.length > charLimit;

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setDetected(null);
  }, [source, target]);

  const handleTranslate = async () => {
    if (loading || disabled || overLimit) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setDetected(null);
    setLoading(true);
    try {
      const result = await translateText(
        config,
        { text: input, source, target },
        controller.signal
      );
      setOutput(result.translatedText);
      setDetected(result.detectedLanguage ?? null);
    } catch (err) {
      if (!isAbortError(err)) setError(err);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setOutput(input);
    }
    setDetected(null);
    languageBarProps.onSwap();
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setInput('');
    setOutput('');
    setDetected(null);
    setError(null);
  };

  const handleCopyInput = () => {
    navigator.clipboard
      .writeText(input)
      .then(() => showSnackBar(tCommon('toolTextInput.copied'), 'success'))
      .catch((err) =>
        showSnackBar(t('translator.copyFailed', { error: err }), 'error')
      );
  };

  const handleCopyOutput = () => {
    navigator.clipboard
      .writeText(output)
      .then(() => showSnackBar(t('translator.copied'), 'success'))
      .catch((err) =>
        showSnackBar(t('translator.copyFailed', { error: err }), 'error')
      );
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${target}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    file
      .text()
      .then((text) => setInput(text))
      .catch((err) =>
        showSnackBar(err instanceof Error ? err.message : String(err), 'error')
      );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleTranslate();
    }
  };

  const detectedName = detected
    ? languages.find((language) => language.code === detected.language)?.name ??
      detected.language
    : '';

  return (
    <Box>
      <LanguageBar {...languageBarProps} onSwap={handleSwap} />
      <ToolInputAndResult
        input={
          <Box>
            <InputHeader title={t('translator.inputTitle')} />
            <TextField
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('translator.inputPlaceholder')}
              fullWidth
              multiline
              rows={10}
              sx={textFieldSx}
              error={overLimit}
              inputProps={{
                'aria-label': t('translator.inputTitle'),
                'data-testid': 'translator-input'
              }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
            >
              <InputFooter
                handleImport={() => fileInputRef.current?.click()}
                handleCopy={input ? handleCopyInput : undefined}
                handleClear={input || output ? handleClear : undefined}
              />
              <Typography
                variant="body2"
                mt={1}
                color={overLimit ? 'error' : 'text.secondary'}
                aria-live="polite"
                data-testid="translator-char-count"
              >
                {charLimit > 0
                  ? t('translator.characterCountWithLimit', {
                      count: input.length,
                      limit: charLimit
                    })
                  : t('translator.characterCount', { count: input.length })}
              </Typography>
            </Stack>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </Box>
        }
        result={
          <Box>
            <InputHeader title={t('translator.resultTitle')} />
            {loading ? (
              <Box
                role="status"
                aria-live="polite"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: globalInputHeight,
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t('translator.translating')}
                </Typography>
              </Box>
            ) : (
              <TextField
                value={output}
                placeholder={t('translator.resultPlaceholder')}
                fullWidth
                multiline
                rows={10}
                sx={textFieldSx}
                inputProps={{
                  readOnly: true,
                  'aria-label': t('translator.resultTitle'),
                  'data-testid': 'translator-output'
                }}
              />
            )}
            <ResultFooter
              disabled={!output || loading}
              handleCopy={handleCopyOutput}
              handleDownload={handleDownload}
            />
            {detected && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {t('translator.detectedLanguage', {
                  language: detectedName,
                  confidence: Math.round(detected.confidence)
                })}
              </Typography>
            )}
          </Box>
        }
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        mt={3}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleTranslate}
          disabled={disabled || loading || overLimit || !input.trim()}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <TranslateIcon />
            )
          }
        >
          {loading ? t('translator.translating') : t('translator.translate')}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {t('translator.shortcutHint')}
        </Typography>
      </Stack>
      <TranslatorErrorAlert error={error} onClose={() => setError(null)} />
    </Box>
  );
}
