import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { ToolComponentProps } from '@tools/defineTool';
import {
  DownloadList,
  PdfFilePicker,
  ProgressPanel,
  SignatureWarning,
  StructuredErrorAlert,
  WorkbenchActions,
  WorkbenchSection,
  WorkbenchShell,
  type WorkbenchDownload
} from '../../../../components/pdf-workbench';
import {
  ResourceScope,
  WorkbenchError,
  WorkbenchWorkerClient,
  extractPageText,
  inspectSignatureFields,
  isCancellationError,
  openPdf,
  parsePageRanges,
  renderPageToCanvas,
  throwIfAborted,
  toWorkbenchError,
  verifyPdfOutput,
  type WorkbenchProgress
} from '../../../../lib/pdf-workbench';
import {
  DEFAULT_OCR_OPTIONS,
  collectOcrLines,
  collectOcrWords,
  collectExpectedSearchableText,
  createJsonOutput,
  createTextOutput,
  mapOcrBoxToPdfPlacement,
  processOcrPageSequence
} from './service';
import {
  OCR_LANGUAGES,
  type OcrDpi,
  type OcrJsonReport,
  type OcrLanguage,
  type OcrOptions,
  type OcrPageResult,
  type SearchablePdfWorkerPayload,
  type SearchablePdfWorkerResult
} from './types';

const LANGUAGE_KEYS = {
  eng: 'english',
  fra: 'french',
  deu: 'german',
  spa: 'spanish',
  ita: 'italian',
  por: 'portuguese',
  rus: 'russian',
  jpn: 'japanese',
  chi_sim: 'chineseSimplified',
  chi_tra: 'chineseTraditional',
  kor: 'korean',
  ara: 'arabic'
} as const satisfies Record<OcrLanguage, string>;

type TesseractWorker = Awaited<
  ReturnType<(typeof import('tesseract.js'))['createWorker']>
>;

export default function OcrPdf({ title }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [options, setOptions] = useState<OcrOptions>(DEFAULT_OCR_OPTIONS);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<WorkbenchProgress | null>(null);
  const [error, setError] = useState<WorkbenchError | null>(null);
  const [results, setResults] = useState<WorkbenchDownload[]>([]);
  const [pageResults, setPageResults] = useState<OcrPageResult[]>([]);
  const [signatureFields, setSignatureFields] = useState<string[]>([]);
  const [unsupportedGlyphs, setUnsupportedGlyphs] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const tesseractRef = useRef<TesseractWorker | null>(null);
  const assemblyRef = useRef<WorkbenchWorkerClient<
    SearchablePdfWorkerPayload,
    SearchablePdfWorkerResult
  > | null>(null);

  useEffect(() => {
    setPageCount(0);
    setResults([]);
    setPageResults([]);
    setError(null);
    setSignatureFields([]);
    if (!file) return;

    const controller = new AbortController();
    void inspectInput(file, controller.signal)
      .then(({ count, signatures }) => {
        if (controller.signal.aborted) return;
        setPageCount(count);
        setSignatureFields(signatures);
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            toWorkbenchError(loadError, {
              code: 'pdf-load-failed',
              message: t('ocrPdf.errors.invalidPdf')
            })
          );
        }
      });
    return () => controller.abort();
  }, [file, t]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      void tesseractRef.current?.terminate().catch(() => undefined);
      assemblyRef.current?.dispose();
    },
    []
  );

  const cancel = () => {
    abortRef.current?.abort();
    assemblyRef.current?.cancel();
    void tesseractRef.current?.terminate().catch(() => undefined);
    tesseractRef.current = null;
  };

  const run = async () => {
    if (!file || pageCount === 0) return;
    setError(null);
    setResults([]);
    setPageResults([]);
    setUnsupportedGlyphs([]);

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);

    try {
      const selected = parsePageRanges(options.pageRange, pageCount);
      if (selected.length === 0) {
        throw new WorkbenchError({
          code: 'invalid-page-range',
          message: t('ocrPdf.errors.emptyRange')
        });
      }
      const processed = await recognizePages(
        file,
        selected,
        options,
        controller.signal,
        (next) =>
          setProgress({
            ...next,
            message: t(progressTranslationKey(next.stage))
          }),
        (worker) => {
          tesseractRef.current = worker;
        }
      );
      setPageResults(processed);
      throwIfAborted(controller.signal);
      const expectedText = collectExpectedSearchableText(processed);
      if (expectedText.length === 0) {
        throw new WorkbenchError({
          code: 'output-verification-failed',
          message: t('ocrPdf.errors.noSearchableText')
        });
      }

      setProgress({
        stage: 'building',
        completed: 0,
        total: Math.max(
          1,
          processed.filter((page) => page.status === 'ocr').length
        ),
        message: t('ocrPdf.progress.building')
      });
      const pdfBytes = await file.arrayBuffer();
      const fontBytes = await loadOcrFont(options.language, controller.signal);
      const client = new WorkbenchWorkerClient<
        SearchablePdfWorkerPayload,
        SearchablePdfWorkerResult
      >(
        () =>
          new Worker(new URL('./searchable-pdf.worker.ts', import.meta.url), {
            type: 'module'
          })
      );
      assemblyRef.current = client;
      const output = await client.run(
        { pdfBytes, pages: processed, fontBytes },
        {
          signal: controller.signal,
          transfer: [pdfBytes, fontBytes],
          onProgress: (next) =>
            setProgress({
              ...next,
              message: t(progressTranslationKey(next.stage))
            })
        }
      );
      throwIfAborted(controller.signal);

      setProgress({
        stage: 'verifying',
        completed: 0,
        total: output.pageCount,
        message: t('ocrPdf.progress.verifying')
      });
      await verifyPdfOutput(output.bytes.slice(0), {
        pageCount: output.pageCount,
        pages: processed
          .sort((left, right) => left.pageNumber - right.pageNumber)
          .map((page) => ({
            pageNumber: page.pageNumber,
            width: page.width,
            height: page.height,
            rotation: page.rotation
          })),
        expectedText,
        signal: controller.signal
      });
      throwIfAborted(controller.signal);

      const report: OcrJsonReport = {
        version: 1,
        source: { name: file.name, size: file.size, pageCount },
        options,
        pages: processed
      };
      const baseName = file.name.replace(/\.pdf$/iu, '');
      setUnsupportedGlyphs(output.unsupportedGlyphs);
      setResults([
        {
          id: 'searchable-pdf',
          name: `${baseName}-searchable.pdf`,
          blob: new Blob([output.bytes], { type: 'application/pdf' }),
          mimeType: 'application/pdf',
          extensions: ['.pdf'],
          description: t('ocrPdf.results.pdf')
        },
        {
          id: 'ocr-text',
          name: `${baseName}-ocr.txt`,
          blob: new Blob([createTextOutput(processed)], {
            type: 'text/plain;charset=utf-8'
          }),
          mimeType: 'text/plain',
          extensions: ['.txt'],
          description: t('ocrPdf.results.text')
        },
        {
          id: 'ocr-json',
          name: `${baseName}-ocr.json`,
          blob: new Blob([createJsonOutput(report)], {
            type: 'application/json'
          }),
          mimeType: 'application/json',
          extensions: ['.json'],
          description: t('ocrPdf.results.json')
        }
      ]);
      setProgress({
        stage: 'complete',
        completed: output.pageCount,
        total: output.pageCount,
        message: t('ocrPdf.progress.complete')
      });
    } catch (runError) {
      setError(
        isCancellationError(runError)
          ? new WorkbenchError({
              code: 'cancelled',
              message: t('ocrPdf.errors.cancelled')
            })
          : toWorkbenchError(runError, {
              code: 'processing-failed',
              message: t('ocrPdf.errors.failed')
            })
      );
    } finally {
      assemblyRef.current?.dispose();
      assemblyRef.current = null;
      if (tesseractRef.current) {
        await tesseractRef.current.terminate().catch(() => undefined);
        tesseractRef.current = null;
      }
      abortRef.current = null;
      setRunning(false);
    }
  };

  const failedPages = pageResults.filter((page) => page.status === 'failed');
  const nativePages = pageResults.filter((page) => page.status === 'native');

  return (
    <WorkbenchShell ariaLabel={title} localNotice={t('ocrPdf.localNotice')}>
      <Stack spacing={3}>
        <WorkbenchSection
          title={t('ocrPdf.inputTitle')}
          description={t('ocrPdf.inputDescription')}
        >
          <PdfFilePicker
            id="ocr-pdf-input"
            files={file ? [file] : []}
            onChange={(files) => setFile(files[0] ?? null)}
            disabled={running}
            labels={{
              select: t('ocrPdf.filePicker.select'),
              drop: t('ocrPdf.filePicker.drop'),
              clear: t('ocrPdf.filePicker.clear'),
              invalidType: t('ocrPdf.filePicker.invalidType'),
              tooManyFiles: t('ocrPdf.filePicker.tooMany')
            }}
          />
          {pageCount > 0 && (
            <Typography sx={{ mt: 1 }} variant="body2">
              {t('ocrPdf.pageCount', { count: pageCount })}
            </Typography>
          )}
        </WorkbenchSection>

        {signatureFields.length > 0 && (
          <SignatureWarning
            title={t('ocrPdf.signature.title')}
            message={t('ocrPdf.signature.message')}
            fieldNames={signatureFields}
          />
        )}

        <WorkbenchSection title={t('ocrPdf.optionsTitle')}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('ocrPdf.pageRange')}
                placeholder="1,3-5"
                value={options.pageRange}
                disabled={running}
                helperText={t('ocrPdf.pageRangeHelp')}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    pageRange: event.target.value
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('ocrPdf.language')}</InputLabel>
                <Select
                  label={t('ocrPdf.language')}
                  value={options.language}
                  disabled={running}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      language: event.target.value as OcrLanguage
                    }))
                  }
                >
                  {OCR_LANGUAGES.map((language) => (
                    <MenuItem key={language} value={language}>
                      {t(`ocrPdf.languages.${LANGUAGE_KEYS[language]}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('ocrPdf.dpi')}</InputLabel>
                <Select
                  label={t('ocrPdf.dpi')}
                  value={options.dpi}
                  disabled={running}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      dpi: event.target.value as OcrDpi
                    }))
                  }
                >
                  {[150, 200, 300].map((dpi) => (
                    <MenuItem key={dpi} value={dpi}>
                      {t('ocrPdf.dpiValue', { dpi })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Stack sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.autoOrient}
                  disabled={running}
                  onChange={(_, autoOrient) =>
                    setOptions((current) => ({ ...current, autoOrient }))
                  }
                />
              }
              label={t('ocrPdf.autoOrient')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.skipTextPages}
                  disabled={running}
                  onChange={(_, skipTextPages) =>
                    setOptions((current) => ({ ...current, skipTextPages }))
                  }
                />
              }
              label={t('ocrPdf.skipTextPages')}
            />
          </Stack>
        </WorkbenchSection>

        {error && (
          <StructuredErrorAlert
            error={error}
            title={t('ocrPdf.errors.title')}
          />
        )}
        {progress && (
          <ProgressPanel
            progress={progress}
            stageLabel={t('ocrPdf.progress.stage')}
            pageLabel={(page) => t('ocrPdf.progress.page', { page })}
          />
        )}
        <WorkbenchActions
          running={running}
          runLabel={t('ocrPdf.run')}
          cancelLabel={t('ocrPdf.cancel')}
          runDisabled={!file || pageCount === 0}
          onRun={() => void run()}
          onCancel={cancel}
        />

        {failedPages.length > 0 && (
          <Alert severity="warning">
            {t('ocrPdf.failedPages', {
              pages: failedPages.map((page) => page.pageNumber).join(', ')
            })}
          </Alert>
        )}
        {nativePages.length > 0 && (
          <Alert severity="info">
            {t('ocrPdf.skippedPages', {
              pages: nativePages.map((page) => page.pageNumber).join(', ')
            })}
          </Alert>
        )}
        {unsupportedGlyphs.length > 0 && (
          <Alert severity="warning">
            {t('ocrPdf.unsupportedGlyphs', {
              count: unsupportedGlyphs.length
            })}
          </Alert>
        )}
        {results.length > 0 && (
          <WorkbenchSection title={t('ocrPdf.resultTitle')}>
            <Alert severity="success" sx={{ mb: 1 }}>
              {t('ocrPdf.success')}
            </Alert>
            <DownloadList
              downloads={results}
              downloadLabel={t('ocrPdf.download')}
              onSaveError={(saveError) =>
                setError(
                  toWorkbenchError(saveError, {
                    code: 'save-failed',
                    message: t('ocrPdf.errors.downloadFailed')
                  })
                )
              }
            />
          </WorkbenchSection>
        )}
      </Stack>
    </WorkbenchShell>
  );
}

async function inspectInput(
  file: File,
  signal: AbortSignal
): Promise<{ count: number; signatures: string[] }> {
  const bytes = await file.arrayBuffer();
  throwIfAborted(signal);
  const scope = new ResourceScope();
  try {
    const document = await openPdf(bytes.slice(0), scope, { signal });
    const signatureReport = await inspectSignatureFields(
      bytes.slice(0),
      signal
    );
    return {
      count: document.numPages,
      signatures: signatureReport.fieldNames
    };
  } finally {
    await scope.dispose().catch(() => undefined);
  }
}

async function recognizePages(
  file: File,
  selected: number[],
  options: OcrOptions,
  signal: AbortSignal,
  onProgress: (progress: WorkbenchProgress) => void,
  onWorkerChange: (worker: TesseractWorker | null) => void
): Promise<OcrPageResult[]> {
  const scope = new ResourceScope();
  const canvas = document.createElement('canvas');
  let worker: TesseractWorker | null = null;
  let activePage = selected[0] ?? 1;

  try {
    const documentProxy = await openPdf(await file.arrayBuffer(), scope, {
      signal
    });
    return await processOcrPageSequence<
      { page: PDFPageProxy; viewport: PageViewport },
      OcrPageResult
    >({
      pageNumbers: selected,
      options,
      signal,
      loadPage: async (pageNumber, completed) => {
        activePage = pageNumber;
        onProgress({
          stage: 'extracting',
          completed,
          total: selected.length,
          pageNumber
        });
        const page = await documentProxy.getPage(pageNumber);
        return {
          page,
          viewport: page.getViewport({ scale: 1 })
        };
      },
      readNativeText: ({ page }) => extractPageText(page),
      createNativeResult: ({ page, viewport }, pageNumber, nativeText) => ({
        pageNumber,
        status: 'native',
        width: viewport.width,
        height: viewport.height,
        rotation: page.rotate,
        imageWidth: 0,
        imageHeight: 0,
        text: nativeText,
        lines: [],
        words: []
      }),
      recognizePage: async ({ page, viewport }, pageNumber, completed) => {
        let activeWorker = worker;
        if (!activeWorker) {
          onProgress({
            stage: 'loading-language',
            completed,
            total: selected.length,
            pageNumber
          });
          const tesseract = await import('tesseract.js');
          const base = withBase('pdf-workbench/runtime/tesseract');
          activeWorker = await tesseract.createWorker(
            options.language,
            tesseract.OEM.LSTM_ONLY,
            {
              workerPath: `${base}/worker.min.js`,
              corePath: `${base}/core`,
              langPath: `${base}/tessdata`,
              gzip: true,
              workerBlobURL: false,
              logger: (message) => {
                onProgress({
                  stage: message.status,
                  completed:
                    completed + Math.max(0, Math.min(0.99, message.progress)),
                  total: selected.length,
                  pageNumber: activePage
                });
              }
            }
          );
          worker = activeWorker;
          onWorkerChange(activeWorker);
          throwIfAborted(signal);
        }

        onProgress({
          stage: 'rendering',
          completed,
          total: selected.length,
          pageNumber
        });
        const raster = await renderPageToCanvas(
          page,
          canvas,
          options.dpi / 72,
          {
            signal,
            background: '#ffffff',
            scope
          }
        );
        throwIfAborted(signal);
        onProgress({
          stage: 'recognizing',
          completed,
          total: selected.length,
          pageNumber
        });
        const recognition = await activeWorker.recognize(
          canvas,
          { rotateAuto: options.autoOrient },
          { blocks: true, text: true }
        );
        throwIfAborted(signal);
        const renderViewport = page.getViewport({ scale: options.dpi / 72 });
        const lines = collectOcrLines(recognition.data.blocks).map((line) => ({
          ...line,
          words: line.words.map((word) => ({
            ...word,
            pdfPlacement: mapOcrBoxToPdfPlacement(
              word.bbox,
              renderViewport,
              raster,
              recognition.data.rotateRadians
            )
          }))
        }));
        const words = collectOcrWords(lines);
        if (words.length === 0) {
          throw new WorkbenchError({
            code: 'processing-failed',
            message: 'OCR did not produce text with verifiable word positions.',
            stage: 'recognizing',
            pageNumber
          });
        }
        return {
          pageNumber,
          status: 'ocr',
          width: viewport.width,
          height: viewport.height,
          rotation: page.rotate,
          imageWidth: raster.width,
          imageHeight: raster.height,
          text: recognition.data.text.trim(),
          lines,
          words
        };
      },
      createFailedResult: ({ page, viewport }, pageNumber, pageError) => ({
        pageNumber,
        status: 'failed',
        width: viewport.width,
        height: viewport.height,
        rotation: page.rotate,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        text: '',
        lines: [],
        words: [],
        error:
          pageError instanceof Error ? pageError.message : String(pageError)
      }),
      onPageComplete: (result, pageNumber, completed, total) => {
        onProgress({
          stage: result.status === 'native' ? 'skipping' : 'recognizing',
          completed,
          total,
          pageNumber
        });
        canvas.width = 1;
        canvas.height = 1;
      },
      cleanupPage: ({ page }) => {
        page.cleanup();
      }
    });
  } finally {
    canvas.width = 1;
    canvas.height = 1;
    const workerToTerminate = worker as TesseractWorker | null;
    if (workerToTerminate) {
      await workerToTerminate.terminate().catch(() => undefined);
    }
    onWorkerChange(null);
    await scope.dispose().catch(() => undefined);
  }
}

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base.slice(0, -1) : base}/${path}`;
}

async function loadOcrFont(
  language: OcrLanguage,
  signal: AbortSignal
): Promise<ArrayBuffer> {
  const name =
    language === 'ara'
      ? 'NotoSansArabic-Regular.ttf'
      : ['jpn', 'chi_sim', 'chi_tra', 'kor'].includes(language)
        ? 'NotoSansCJKjp-Regular.otf'
        : 'NotoSans-Regular.ttf';
  const response = await fetch(withBase(`pdf-workbench/fonts/${name}`), {
    signal
  });
  if (!response.ok) {
    throw new WorkbenchError({
      code: 'processing-failed',
      message: 'A local OCR font asset could not be loaded.',
      details: `${response.status} ${response.statusText}`
    });
  }
  return response.arrayBuffer();
}

function progressTranslationKey(stage: string) {
  const known = {
    extracting: 'ocrPdf.progress.extracting',
    skipping: 'ocrPdf.progress.skipping',
    rendering: 'ocrPdf.progress.rendering',
    recognizing: 'ocrPdf.progress.recognizing',
    building: 'ocrPdf.progress.building',
    verifying: 'ocrPdf.progress.verifying',
    'loading-language': 'ocrPdf.progress.loadingLanguage',
    'loading tesseract core': 'ocrPdf.progress.loadingCore',
    'initializing tesseract': 'ocrPdf.progress.initializing',
    'loading language traineddata': 'ocrPdf.progress.loadingLanguage',
    'initializing api': 'ocrPdf.progress.initializing',
    'recognizing text': 'ocrPdf.progress.recognizing'
  } as const;
  return stage in known
    ? known[stage as keyof typeof known]
    : ('ocrPdf.progress.working' as const);
}
