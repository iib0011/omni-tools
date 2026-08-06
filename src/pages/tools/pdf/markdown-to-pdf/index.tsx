import { Alert, Box, Button, Slider, Stack, Typography } from '@mui/material';
import React, { useContext, useMemo, useRef, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { useTranslation } from 'react-i18next';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import SimpleRadio from '@components/options/SimpleRadio';
import useDebounce from '../../../../hooks/useDebounce';
import {
  analyzeMarkdownComplexity,
  generateMarkdownPdf,
  normalizeMarkdownInput
} from './service';
import { InitialValuesType, MarkdownAnalysis } from './types';

const initialValues: InitialValuesType = {
  pageFormat: 'a4',
  orientation: 'portrait',
  fontScale: 100,
  generationNonce: 0
};

const emptyAnalysis: MarkdownAnalysis = {
  charCount: 0,
  lineCount: 0,
  headingCount: 0,
  codeBlockCount: 0,
  estimatedPages: 1,
  estimatedChunkCount: 1,
  requiresManualGeneration: false,
  exceedsSupportedSize: false
};

export default function MarkdownToPdf({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [input, setInput] = useState<string>('');
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MarkdownAnalysis>(emptyAnalysis);
  const [hasStaleResult, setHasStaleResult] = useState<boolean>(false);
  const sourceRevisionRef = useRef(0);
  const lastGeneratedRevisionRef = useRef(-1);
  const lastGenerationNonceRef = useRef(0);

  const normalizedInput = useMemo(() => normalizeMarkdownInput(input), [input]);
  const hasContent = normalizedInput.trim().length > 0;

  const compute = async (values: InitialValuesType, rawInput: string) => {
    const normalized = normalizeMarkdownInput(rawInput);
    const nextAnalysis = analyzeMarkdownComplexity(normalized);
    setAnalysis(nextAnalysis);

    if (!normalized.trim()) {
      setResult(null);
      setHasStaleResult(false);
      return;
    }

    if (nextAnalysis.exceedsSupportedSize) {
      setHasStaleResult(true);
      setResult(null);
      return;
    }

    const sourceChanged =
      sourceRevisionRef.current !== lastGeneratedRevisionRef.current;
    const manualGenerationRequested =
      values.generationNonce !== lastGenerationNonceRef.current;

    if (
      nextAnalysis.requiresManualGeneration &&
      sourceChanged &&
      !manualGenerationRequested
    ) {
      setHasStaleResult(lastGeneratedRevisionRef.current >= 0);
      return;
    }

    try {
      setIsProcessing(true);
      const pdfFile = await generateMarkdownPdf(normalized, {
        pageFormat: values.pageFormat,
        orientation: values.orientation,
        fontScale: values.fontScale,
        sourceName
      });

      setResult(pdfFile);
      setHasStaleResult(false);
      lastGeneratedRevisionRef.current = sourceRevisionRef.current;
      lastGenerationNonceRef.current = values.generationNonce;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('markdownToPdf.errors.generationFailed');

      setHasStaleResult(true);
      showSnackBar(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedCompute = useDebounce(compute, 700);

  const handleInputChange = (value: string) => {
    sourceRevisionRef.current += 1;
    setInput(value);
    if (lastGeneratedRevisionRef.current >= 0) {
      setHasStaleResult(true);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={debouncedCompute}
      inputComponent={
        <ToolTextInput
          title={t('markdownToPdf.inputTitle')}
          value={input}
          onChange={handleInputChange}
          onImportFile={(file) => {
            sourceRevisionRef.current += 1;
            setSourceName(file.name);
            if (lastGeneratedRevisionRef.current >= 0) {
              setHasStaleResult(true);
            }
          }}
          accept=".md,.markdown,text/markdown,text/plain"
          placeholder={t('markdownToPdf.placeholder')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('markdownToPdf.resultTitle')}
          value={result}
          extension="pdf"
          loading={isProcessing}
          loadingText={t('markdownToPdf.loadingText')}
          hidePreview
          emptyMessage={t('markdownToPdf.status.downloadReady')}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('markdownToPdf.options.title'),
          component: (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('markdownToPdf.options.pageFormat')}
                </Typography>
                <SimpleRadio
                  title={t('markdownToPdf.options.a4')}
                  checked={values.pageFormat === 'a4'}
                  onClick={() => updateField('pageFormat', 'a4')}
                />
                <SimpleRadio
                  title={t('markdownToPdf.options.letter')}
                  checked={values.pageFormat === 'letter'}
                  onClick={() => updateField('pageFormat', 'letter')}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('markdownToPdf.options.orientation')}
                </Typography>
                <SimpleRadio
                  title={t('markdownToPdf.options.portrait')}
                  checked={values.orientation === 'portrait'}
                  onClick={() => updateField('orientation', 'portrait')}
                />
                <SimpleRadio
                  title={t('markdownToPdf.options.landscape')}
                  checked={values.orientation === 'landscape'}
                  onClick={() => updateField('orientation', 'landscape')}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2">
                  {t('markdownToPdf.options.fontScale')} {values.fontScale}%
                </Typography>
                <Slider
                  value={values.fontScale}
                  onChange={(_, value) =>
                    updateField(
                      'fontScale',
                      Array.isArray(value) ? value[0] : value
                    )
                  }
                  min={85}
                  max={120}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>

              {sourceName && (
                <Alert severity="info">
                  {t('markdownToPdf.status.sourceFile', { sourceName })}
                </Alert>
              )}

              {hasContent && (
                <Alert
                  severity={analysis.exceedsSupportedSize ? 'error' : 'info'}
                >
                  {t('markdownToPdf.status.summary', {
                    chars: analysis.charCount.toLocaleString(),
                    lines: analysis.lineCount.toLocaleString(),
                    headings: analysis.headingCount.toLocaleString(),
                    codeBlocks: analysis.codeBlockCount.toLocaleString(),
                    estimatedPages: analysis.estimatedPages.toLocaleString(),
                    estimatedChunks:
                      analysis.estimatedChunkCount.toLocaleString()
                  })}
                </Alert>
              )}

              {analysis.requiresManualGeneration &&
                hasContent &&
                !analysis.exceedsSupportedSize && (
                  <Alert severity="warning">
                    {t('markdownToPdf.warnings.largeDocument')}
                  </Alert>
                )}

              {analysis.exceedsSupportedSize && hasContent && (
                <Alert severity="error">
                  {t('markdownToPdf.errors.tooLarge', {
                    maxChars: '500,000',
                    maxLines: '9,000'
                  })}
                </Alert>
              )}

              {hasStaleResult && result && (
                <Alert severity="warning">
                  {t('markdownToPdf.status.staleResult')}
                </Alert>
              )}

              <Button
                variant="contained"
                disabled={
                  !hasContent || analysis.exceedsSupportedSize || isProcessing
                }
                onClick={() => updateField('generationNonce', Date.now())}
              >
                {analysis.requiresManualGeneration
                  ? t('markdownToPdf.options.generate')
                  : t('markdownToPdf.options.regenerate')}
              </Button>
            </Stack>
          )
        }
      ]}
      toolInfo={{
        title: title,
        description: longDescription
      }}
    />
  );
}
