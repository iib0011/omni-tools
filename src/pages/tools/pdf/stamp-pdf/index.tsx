import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ColorSelector from '@components/options/ColorSelector';
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
import { formatBatesNumber, formatPageNumber } from './formatters';
import {
  getStampValidationError,
  type StampValidationError
} from './validation';
import type {
  StampMode,
  StampOptions,
  StampPosition,
  StampWorkerPayload,
  StampWorkerResult
} from './types';

const initialOptions: StampOptions = {
  mode: 'text',
  pageRange: '',
  layer: 'above',
  position: 'middle-center',
  horizontalMargin: 24,
  verticalMargin: 24,
  opacity: 0.35,
  rotation: -30,
  fontSize: 36,
  color: '#d32f2f',
  text: 'DRAFT',
  pageNumberFormat: 'Page {current} of {total}',
  startingPageNumber: 1,
  batesPrefix: '',
  batesSuffix: '',
  batesStart: 1,
  batesPadding: 6,
  headerText: '',
  footerText: '',
  imageScale: 25,
  preserveAspectRatio: true
};

const positions: StampPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
];

const STAMP_VALIDATION_TRANSLATION_KEYS = {
  'missing-value': 'stampPdf.errors.missingValue',
  'invalid-image': 'stampPdf.errors.invalidImage',
  'invalid-color': 'stampPdf.errors.invalidColor',
  'invalid-number': 'stampPdf.errors.invalidNumber',
  'invalid-template': 'stampPdf.errors.invalidTemplate'
} as const satisfies Record<StampValidationError, string>;

export default function StampPdf({ title }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [options, setOptions] = useState<StampOptions>(initialOptions);
  const [allPages, setAllPages] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [representativePage, setRepresentativePage] = useState(1);
  const [previewDimensions, setPreviewDimensions] = useState({
    width: 0,
    height: 0
  });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<WorkbenchProgress | null>(null);
  const [error, setError] = useState<WorkbenchError | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [signatureFields, setSignatureFields] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef =
    useRef<WorkbenchWorkerClient<StampWorkerPayload, StampWorkerResult>>();
  const abortRef = useRef<AbortController>();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const updateOptions = (patch: Partial<StampOptions>) =>
    setOptions((current) => ({ ...current, ...patch }));

  useEffect(() => {
    setResult(null);
    setError(null);
    setPageCount(0);
    setSignatureFields([]);
    if (!file) return;

    const controller = new AbortController();
    void (async () => {
      const bytes = await file.arrayBuffer();
      const scope = new ResourceScope();
      try {
        const document = await openPdf(bytes.slice(0), scope, {
          signal: controller.signal
        });
        throwIfAborted(controller.signal);
        setPageCount(document.numPages);
        setRepresentativePage((page) => Math.min(page, document.numPages));
        const signatures = await inspectSignatureFields(
          bytes.slice(0),
          controller.signal
        );
        throwIfAborted(controller.signal);
        setSignatureFields(signatures.fieldNames);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            toWorkbenchError(loadError, {
              code: 'pdf-load-failed',
              message: t('stampPdf.errors.invalidPdf')
            })
          );
        }
      } finally {
        await scope.dispose().catch(() => undefined);
      }
    })();
    return () => controller.abort();
  }, [file, t]);

  useEffect(() => {
    if (!file || !canvasRef.current || pageCount === 0) return;
    const controller = new AbortController();
    const canvas = canvasRef.current;
    setPreviewDimensions({ width: 0, height: 0 });
    void (async () => {
      const scope = new ResourceScope();
      try {
        const document = await openPdf(await file.arrayBuffer(), scope, {
          signal: controller.signal
        });
        const page = await document.getPage(
          Math.min(representativePage, document.numPages)
        );
        const dimensions = await renderPageToCanvas(page, canvas, 1, {
          signal: controller.signal,
          scope
        });
        throwIfAborted(controller.signal);
        setPreviewDimensions(dimensions);
      } catch (previewError) {
        if (!controller.signal.aborted) {
          setError(
            toWorkbenchError(previewError, {
              code: 'processing-failed',
              message: t('stampPdf.errors.previewFailed')
            })
          );
        }
      } finally {
        await scope.dispose().catch(() => undefined);
      }
    })();
    return () => controller.abort();
  }, [file, pageCount, representativePage, t]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      workerRef.current?.dispose();
    },
    []
  );

  const imagePreviewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );
  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl]
  );
  const previewPages = useMemo(() => {
    if (pageCount === 0) return [];
    try {
      return parsePageRanges(allPages ? '' : options.pageRange, pageCount);
    } catch {
      return [];
    }
  }, [allPages, options.pageRange, pageCount]);
  const previewSelectionIndex = previewPages.indexOf(representativePage);

  const run = async () => {
    if (!file) return;
    setError(null);
    setResult(null);

    try {
      const pageRange = allPages ? '' : options.pageRange;
      parsePageRanges(pageRange, pageCount);
      const validationError = getStampValidationError(options, {
        present: image !== null,
        mimeType: image?.type
      });
      if (validationError) {
        throw new WorkbenchError({
          code: 'invalid-input',
          message: t(stampValidationTranslationKey(validationError))
        });
      }

      setRunning(true);
      setProgress({
        stage: 'preparing',
        completed: 0,
        total: Math.max(1, pageCount),
        message: t('stampPdf.progress.preparing')
      });
      const controller = new AbortController();
      abortRef.current = controller;
      const pdfBytes = await file.arrayBuffer();
      throwIfAborted(controller.signal);
      const imageBytes = image ? await image.arrayBuffer() : undefined;
      throwIfAborted(controller.signal);
      const fontBytes = await loadRequiredFonts(options, controller.signal);
      throwIfAborted(controller.signal);
      const client = new WorkbenchWorkerClient<
        StampWorkerPayload,
        StampWorkerResult
      >(
        () =>
          new Worker(new URL('./stamp.worker.ts', import.meta.url), {
            type: 'module'
          })
      );
      workerRef.current = client;
      const transfers: Transferable[] = [pdfBytes];
      if (imageBytes) transfers.push(imageBytes);
      for (const font of Object.values(fontBytes)) {
        if (font) transfers.push(font);
      }

      const output = await client.run(
        {
          pdfBytes,
          imageBytes,
          imageType:
            image?.type === 'image/png'
              ? 'image/png'
              : image
                ? 'image/jpeg'
                : undefined,
          fontBytes,
          options: { ...options, pageRange }
        },
        {
          transfer: transfers,
          signal: controller.signal,
          onProgress: (next) =>
            setProgress({
              ...next,
              message: t('stampPdf.progress.stamping')
            })
        }
      );
      throwIfAborted(controller.signal);
      setProgress({
        stage: 'verifying',
        completed: output.pageCount,
        total: output.pageCount,
        message: t('stampPdf.progress.verifying')
      });
      await verifyPdfOutput(output.bytes.slice(0), {
        pageCount: output.pageCount,
        signal: controller.signal
      });
      throwIfAborted(controller.signal);
      setResult(new Blob([output.bytes], { type: 'application/pdf' }));
      setProgress({
        stage: 'complete',
        completed: output.pageCount,
        total: output.pageCount,
        message: t('stampPdf.progress.complete')
      });
    } catch (runError) {
      setError(
        isCancellationError(runError)
          ? new WorkbenchError({
              code: 'cancelled',
              message: t('stampPdf.errors.cancelled')
            })
          : toWorkbenchError(runError, {
              code: 'processing-failed',
              message: t('stampPdf.errors.failed')
            })
      );
    } finally {
      workerRef.current?.dispose();
      workerRef.current = undefined;
      abortRef.current = undefined;
      setRunning(false);
    }
  };

  const downloads: WorkbenchDownload[] = result
    ? [
        {
          id: 'stamped-pdf',
          name: file?.name.replace(/\.pdf$/i, '-stamped.pdf') ?? 'stamped.pdf',
          blob: result,
          mimeType: 'application/pdf',
          extensions: ['.pdf'],
          description: t('stampPdf.resultDescription')
        }
      ]
    : [];

  return (
    <WorkbenchShell ariaLabel={title} localNotice={t('stampPdf.localNotice')}>
      <Stack spacing={3}>
        <WorkbenchSection
          title={t('stampPdf.inputTitle')}
          description={t('stampPdf.inputDescription')}
        >
          <PdfFilePicker
            id="stamp-pdf-input"
            files={file ? [file] : []}
            onChange={(files) => setFile(files[0] ?? null)}
            disabled={running}
            labels={{
              select: t('stampPdf.filePicker.select'),
              drop: t('stampPdf.filePicker.drop'),
              clear: t('stampPdf.filePicker.clear'),
              invalidType: t('stampPdf.filePicker.invalidType'),
              tooManyFiles: t('stampPdf.filePicker.tooMany')
            }}
          />
          {pageCount > 0 && (
            <Typography sx={{ mt: 1 }} variant="body2">
              {t('stampPdf.pageCount', { count: pageCount })}
            </Typography>
          )}
        </WorkbenchSection>

        {signatureFields.length > 0 && (
          <SignatureWarning
            title={t('stampPdf.signature.title')}
            message={t('stampPdf.signature.message')}
            fieldNames={signatureFields}
          />
        )}

        <WorkbenchSection title={t('stampPdf.optionsTitle')}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('stampPdf.mode.label')}</InputLabel>
                <Select
                  label={t('stampPdf.mode.label')}
                  value={options.mode}
                  disabled={running}
                  onChange={(event) =>
                    updateOptions({ mode: event.target.value as StampMode })
                  }
                >
                  {(
                    [
                      'text',
                      'image',
                      'page-numbers',
                      'bates',
                      'header-footer'
                    ] as const
                  ).map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {t(`stampPdf.mode.${mode}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('stampPdf.layer.label')}</InputLabel>
                <Select
                  label={t('stampPdf.layer.label')}
                  value={options.layer}
                  disabled={running}
                  onChange={(event) =>
                    updateOptions({
                      layer: event.target.value as StampOptions['layer']
                    })
                  }
                >
                  <MenuItem value="above">{t('stampPdf.layer.above')}</MenuItem>
                  <MenuItem value="below">{t('stampPdf.layer.below')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allPages}
                    disabled={running}
                    onChange={(_, checked) => setAllPages(checked)}
                  />
                }
                label={t('stampPdf.allPages')}
              />
              {!allPages && (
                <TextField
                  fullWidth
                  label={t('stampPdf.pageRange')}
                  value={options.pageRange}
                  disabled={running}
                  onChange={(event) =>
                    updateOptions({ pageRange: event.target.value })
                  }
                  placeholder="1,3-5"
                />
              )}
            </Grid>
          </Grid>

          <ModeControls
            options={options}
            image={image}
            running={running}
            imageInputRef={imageInputRef}
            setImage={setImage}
            updateOptions={updateOptions}
          />

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            {t('stampPdf.position.label')}
          </Typography>
          <Grid container spacing={1} maxWidth={420}>
            {positions.map((position) => (
              <Grid item xs={4} key={position}>
                <Button
                  fullWidth
                  size="small"
                  variant={
                    options.position === position ? 'contained' : 'outlined'
                  }
                  disabled={running || options.mode === 'header-footer'}
                  onClick={() => updateOptions({ position })}
                >
                  {t(`stampPdf.position.${position}`)}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <NumberField
                label={t('stampPdf.horizontalMargin')}
                value={options.horizontalMargin}
                disabled={running}
                onChange={(horizontalMargin) =>
                  updateOptions({ horizontalMargin })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <NumberField
                label={t('stampPdf.verticalMargin')}
                value={options.verticalMargin}
                disabled={running}
                onChange={(verticalMargin) => updateOptions({ verticalMargin })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <NumberField
                label={t('stampPdf.rotation')}
                value={options.rotation}
                disabled={running}
                onChange={(rotation) => updateOptions({ rotation })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <NumberField
                label={t('stampPdf.fontSize')}
                value={options.fontSize}
                min={4}
                disabled={running || options.mode === 'image'}
                onChange={(fontSize) => updateOptions({ fontSize })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              {t('stampPdf.opacity', {
                value: Math.round(options.opacity * 100)
              })}
            </Typography>
            <Slider
              value={options.opacity}
              min={0.05}
              max={1}
              step={0.05}
              disabled={running}
              onChange={(_, opacity) =>
                updateOptions({ opacity: opacity as number })
              }
            />
          </Box>
          {options.mode !== 'image' && (
            <ColorSelector
              value={options.color}
              onColorChange={(color) => updateOptions({ color })}
              description={t('stampPdf.color')}
              disabled={running}
            />
          )}
        </WorkbenchSection>

        {file && pageCount > 0 && (
          <WorkbenchSection
            title={t('stampPdf.preview.title')}
            description={t('stampPdf.preview.description')}
          >
            <TextField
              size="small"
              type="number"
              label={t('stampPdf.preview.page')}
              value={representativePage}
              inputProps={{ min: 1, max: pageCount }}
              onChange={(event) =>
                setRepresentativePage(
                  Math.min(
                    pageCount,
                    Math.max(1, Number(event.target.value) || 1)
                  )
                )
              }
              sx={{ mb: 2 }}
            />
            <StampPreview
              canvasRef={canvasRef}
              options={options}
              imageUrl={imagePreviewUrl}
              page={representativePage}
              total={pageCount}
              dimensions={previewDimensions}
              selectionIndex={previewSelectionIndex}
            />
            {previewSelectionIndex < 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t('stampPdf.preview.notSelected')}
              </Alert>
            )}
          </WorkbenchSection>
        )}

        {error && (
          <StructuredErrorAlert
            error={error}
            title={t('stampPdf.errors.title')}
          />
        )}
        {progress && (
          <ProgressPanel
            progress={progress}
            stageLabel={t('stampPdf.progress.stage')}
            pageLabel={(page) => t('stampPdf.progress.page', { page })}
          />
        )}
        <WorkbenchActions
          running={running}
          runLabel={t('stampPdf.run')}
          cancelLabel={t('stampPdf.cancel')}
          runDisabled={!file || pageCount === 0}
          onRun={() => void run()}
          onCancel={() => {
            abortRef.current?.abort();
            workerRef.current?.cancel();
          }}
        />
        {downloads.length > 0 && (
          <WorkbenchSection title={t('stampPdf.resultTitle')}>
            <Alert severity="success">{t('stampPdf.success')}</Alert>
            <DownloadList
              downloads={downloads}
              downloadLabel={t('stampPdf.download')}
              onSaveError={(saveError) =>
                setError(
                  toWorkbenchError(saveError, {
                    code: 'save-failed',
                    message: t('stampPdf.errors.downloadFailed')
                  })
                )
              }
            />
          </WorkbenchSection>
        )}
      </Stack>
      <input
        ref={imageInputRef}
        type="file"
        hidden
        accept="image/png,image/jpeg"
        onChange={(event) => {
          setImage(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />
    </WorkbenchShell>
  );
}

function ModeControls({
  options,
  image,
  running,
  imageInputRef,
  setImage,
  updateOptions
}: {
  options: StampOptions;
  image: File | null;
  running: boolean;
  imageInputRef: React.RefObject<HTMLInputElement>;
  setImage: (file: File | null) => void;
  updateOptions: (patch: Partial<StampOptions>) => void;
}) {
  const { t } = useTranslation('pdf');
  if (options.mode === 'text') {
    return (
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        label={t('stampPdf.text')}
        value={options.text}
        disabled={running}
        onChange={(event) => updateOptions({ text: event.target.value })}
      />
    );
  }
  if (options.mode === 'image') {
    return (
      <Stack sx={{ mt: 2 }} spacing={1.5}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            disabled={running}
            startIcon={<ImageOutlinedIcon />}
            onClick={() => imageInputRef.current?.click()}
          >
            {t('stampPdf.image.select')}
          </Button>
          {image && (
            <Button disabled={running} onClick={() => setImage(null)}>
              {t('stampPdf.image.clear')}
            </Button>
          )}
        </Stack>
        {image && <Typography variant="body2">{image.name}</Typography>}
        <NumberField
          label={t('stampPdf.image.scale')}
          value={options.imageScale}
          min={1}
          disabled={running}
          onChange={(imageScale) => updateOptions({ imageScale })}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.preserveAspectRatio}
              disabled={running}
              onChange={(_, preserveAspectRatio) =>
                updateOptions({ preserveAspectRatio })
              }
            />
          }
          label={t('stampPdf.image.preserveAspect')}
        />
      </Stack>
    );
  }
  if (options.mode === 'page-numbers') {
    return (
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label={t('stampPdf.pageNumbers.format')}
            value={options.pageNumberFormat}
            disabled={running}
            onChange={(event) =>
              updateOptions({ pageNumberFormat: event.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <NumberField
            label={t('stampPdf.pageNumbers.start')}
            value={options.startingPageNumber}
            disabled={running}
            onChange={(startingPageNumber) =>
              updateOptions({ startingPageNumber })
            }
          />
        </Grid>
      </Grid>
    );
  }
  if (options.mode === 'bates') {
    return (
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('stampPdf.bates.prefix')}
            value={options.batesPrefix}
            disabled={running}
            onChange={(event) =>
              updateOptions({ batesPrefix: event.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('stampPdf.bates.suffix')}
            value={options.batesSuffix}
            disabled={running}
            onChange={(event) =>
              updateOptions({ batesSuffix: event.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberField
            label={t('stampPdf.bates.start')}
            value={options.batesStart}
            disabled={running}
            onChange={(batesStart) => updateOptions({ batesStart })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberField
            label={t('stampPdf.bates.padding')}
            value={options.batesPadding}
            min={1}
            disabled={running}
            onChange={(batesPadding) => updateOptions({ batesPadding })}
          />
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('stampPdf.header')}
          value={options.headerText}
          disabled={running}
          onChange={(event) =>
            updateOptions({ headerText: event.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={t('stampPdf.footer')}
          value={options.footerText}
          disabled={running}
          onChange={(event) =>
            updateOptions({ footerText: event.target.value })
          }
        />
      </Grid>
    </Grid>
  );
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
  min
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
}) {
  return (
    <TextField
      fullWidth
      type="number"
      label={label}
      value={value}
      disabled={disabled}
      inputProps={{ min }}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
    />
  );
}

function StampPreview({
  canvasRef,
  options,
  imageUrl,
  page,
  total,
  dimensions,
  selectionIndex
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  options: StampOptions;
  imageUrl: string | null;
  page: number;
  total: number;
  dimensions: { width: number; height: number };
  selectionIndex: number;
}) {
  const text =
    options.mode === 'page-numbers'
      ? formatPageNumber(
          options.pageNumberFormat,
          page - 1,
          total,
          options.startingPageNumber
        )
      : options.mode === 'bates'
        ? formatBatesNumber(
            Math.max(0, selectionIndex),
            options.batesStart,
            options.batesPadding,
            options.batesPrefix,
            options.batesSuffix
          )
        : options.text;
  const placement = previewPlacement(options);
  return (
    <Box
      sx={{
        maxWidth: '100%',
        overflow: 'auto',
        border: 1,
        borderColor: 'divider'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: dimensions.width || undefined,
          height: dimensions.height || undefined
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        {selectionIndex >= 0 &&
          (options.mode === 'header-footer' ? (
            <>
              <PreviewText options={options} text={options.headerText} top />
              <PreviewText options={options} text={options.footerText} />
            </>
          ) : options.mode === 'image' && imageUrl ? (
            <PreviewImage
              imageUrl={imageUrl}
              options={options}
              placement={placement}
            />
          ) : (
            <Box
              sx={{
                ...placement,
                position: 'absolute',
                color: options.color,
                opacity: options.opacity,
                fontSize: `${Math.max(4, options.fontSize)}px`,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transform: `${
                  placement.transform ?? ''
                } rotate(${-options.rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              {text}
            </Box>
          ))}
      </Box>
    </Box>
  );
}

function PreviewImage({
  imageUrl,
  options,
  placement
}: {
  imageUrl: string;
  options: StampOptions;
  placement: Record<string, string | number>;
}) {
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const width = naturalSize.width * (options.imageScale / 100);
  const height =
    (options.preserveAspectRatio ? naturalSize.height : naturalSize.width) *
    (options.imageScale / 100);
  return (
    <Box
      component="img"
      src={imageUrl}
      alt=""
      onLoad={(event) =>
        setNaturalSize({
          width: event.currentTarget.naturalWidth,
          height: event.currentTarget.naturalHeight
        })
      }
      sx={{
        ...placement,
        position: 'absolute',
        width,
        height,
        opacity: options.opacity,
        transform: `${
          placement.transform ?? ''
        } rotate(${-options.rotation}deg)`,
        transformOrigin: 'center'
      }}
    />
  );
}

function PreviewText({
  options,
  text,
  top = false
}: {
  options: StampOptions;
  text: string;
  top?: boolean;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        top: top ? options.verticalMargin : undefined,
        bottom: top ? undefined : options.verticalMargin,
        transform: `translateX(-50%) rotate(${-options.rotation}deg)`,
        transformOrigin: 'center',
        color: options.color,
        opacity: options.opacity,
        fontSize: `${Math.max(4, options.fontSize)}px`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      {text}
    </Box>
  );
}

function previewPlacement(
  options: Pick<
    StampOptions,
    'position' | 'horizontalMargin' | 'verticalMargin'
  >
): Record<string, string | number> {
  const { position, horizontalMargin, verticalMargin } = options;
  const [vertical, horizontal] = position.split('-');
  return {
    top:
      vertical === 'top'
        ? verticalMargin
        : vertical === 'middle'
          ? '50%'
          : 'auto',
    bottom: vertical === 'bottom' ? verticalMargin : 'auto',
    left:
      horizontal === 'left'
        ? horizontalMargin
        : horizontal === 'center'
          ? '50%'
          : 'auto',
    right: horizontal === 'right' ? horizontalMargin : 'auto',
    transform: `${horizontal === 'center' ? 'translateX(-50%)' : ''} ${
      vertical === 'middle' ? 'translateY(-50%)' : ''
    }`.trim()
  };
}

function stampValidationTranslationKey(error: StampValidationError) {
  return STAMP_VALIDATION_TRANSLATION_KEYS[error];
}

async function loadRequiredFonts(
  options: StampOptions,
  signal: AbortSignal
): Promise<NonNullable<StampWorkerPayload['fontBytes']>> {
  if (options.mode === 'image') return {};
  const text = [
    options.text,
    options.pageNumberFormat,
    options.batesPrefix,
    options.batesSuffix,
    options.headerText,
    options.footerText
  ].join(' ');
  const base = import.meta.env.BASE_URL || '/';
  const prefix = `${base.endsWith('/') ? base : `${base}/`}pdf-workbench/fonts`;
  const fetchFont = async (name: string) => {
    const response = await fetch(`${prefix}/${name}`, {
      signal,
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error(`Could not load local font ${name}.`);
    return response.arrayBuffer();
  };
  const result: NonNullable<StampWorkerPayload['fontBytes']> = {
    default: await fetchFont('NotoSans-Regular.ttf')
  };
  if (/[\u0600-\u06ff\u0750-\u077f]/u.test(text)) {
    result.arabic = await fetchFont('NotoSansArabic-Regular.ttf');
  }
  if (/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u.test(text)) {
    result.cjk = await fetchFont('NotoSansCJKjp-Regular.otf');
  }
  return result;
}
