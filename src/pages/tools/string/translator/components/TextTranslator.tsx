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
import {
  DetectedLanguage,
  Language,
  TranslationEngine,
  TranslationProgress
} from '../types';
import LanguageBar, { LanguageBarProps } from './LanguageBar';
import TranslatorErrorAlert from './TranslatorErrorAlert';
import { EngineLabel, TranslationProgressInfo } from './TranslationStatus';

const textFieldSx = {
  '&.MuiTextField-root': { backgroundColor: 'background.paper' }
};

export interface TextTranslatorProps {
  languages: Language[];
  languageBarProps: LanguageBarProps;
}

export default function TextTranslator({
  languages,
  languageBarProps
}: TextTranslatorProps) {
  const { t } = useTranslation('string');
  const { t: tCommon } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detected, setDetected] = useState<DetectedLanguage | null>(null);
  const [engine, setEngine] = useState<TranslationEngine | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [error, setError] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { source, target } = languageBarProps;

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setDetected(null);
  }, [source, target]);

  const handleTranslate = async () => {
    if (loading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setDetected(null);
    setProgress(null);
    setLoading(true);
    try {
      const result = await translateText(
        input,
        { source, target },
        { signal: controller.signal, onProgress: setProgress }
      );
      setOutput(result.translatedText);
      setDetected(result.detectedLanguage ?? null);
      setEngine(result.engine);
    } catch (err) {
      if (!isAbortError(err)) setError(err);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
        setProgress(null);
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
    setEngine(null);
    setError(null);
  };

  const copy = (text: string, successMessage: string) =>
    navigator.clipboard
      .writeText(text)
      .then(() => showSnackBar(successMessage, 'success'))
      .catch((err) =>
        showSnackBar(t('translator.copyFailed', { error: err }), 'error')
      );

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${target}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
                handleCopy={
                  input
                    ? () => copy(input, tCommon('toolTextInput.copied'))
                    : undefined
                }
                handleClear={input || output ? handleClear : undefined}
              />
              <Typography
                variant="body2"
                mt={1}
                color="text.secondary"
                aria-live="polite"
                data-testid="translator-char-count"
              >
                {t('translator.characterCount', { count: input.length })}
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
                <TranslationProgressInfo progress={progress} />
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
              handleCopy={() => copy(output, t('translator.copied'))}
              handleDownload={handleDownload}
            />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.5, sm: 2 }}
              mt={1}
            >
              {output && !loading && <EngineLabel engine={engine} />}
              {detected && (
                <Typography variant="body2" color="text.secondary">
                  {detected.confidence !== undefined
                    ? t('translator.detectedLanguage', {
                        language: detectedName,
                        confidence: detected.confidence
                      })
                    : t('translator.detectedLanguageNoConfidence', {
                        language: detectedName
                      })}
                </Typography>
              )}
            </Stack>
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
          disabled={loading || !input.trim()}
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
