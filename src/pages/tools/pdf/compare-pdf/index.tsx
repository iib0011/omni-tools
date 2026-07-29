import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Slider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ToolComponentProps } from '@tools/defineTool';
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComparisonProgress,
  ComparisonResult,
  PageComparison,
  PageGeometry,
  PageVisualAssets,
  TextComparison,
  TextDiffSegment
} from './types';
import { comparePdfFiles } from './service';
import { getComparisonValidationError } from './validation';
import { ComparePdfError, isAbortError } from './errors';
import { disposeComparisonResult, downloadComparisonReport } from './export';

type ComparisonView =
  | 'side-by-side'
  | 'overlay'
  | 'swipe'
  | 'difference-mask'
  | 'text-diff';

interface DocumentPickerProps {
  id: string;
  label: string;
  file: File | null;
  disabled: boolean;
  onChange: (file: File | null) => void;
  chooseLabel: string;
  replaceLabel: string;
  clearLabel: string;
  emptyLabel: string;
}

const checkerboardBackground = {
  backgroundColor: 'grey.100',
  backgroundImage:
    'linear-gradient(45deg, rgba(0,0,0,.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.08) 75%)',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundSize: '16px 16px'
} as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatPercentage(value: number): string {
  if (value === 0) {
    return '0%';
  }
  if (value < 0.01) {
    return '<0.01%';
  }
  return `${value.toFixed(value < 1 ? 2 : 1)}%`;
}

function formatGeometry(geometry: PageGeometry | null): string {
  if (!geometry) {
    return '—';
  }
  return `${geometry.widthPoints.toFixed(1)} × ${geometry.heightPoints.toFixed(
    1
  )} pt · ${geometry.rotation}°`;
}

function DocumentPicker({
  id,
  label,
  file,
  disabled,
  onChange,
  chooseLabel,
  replaceLabel,
  clearLabel,
  emptyLabel
}: DocumentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (nextFile) {
      onChange(nextFile);
    }
    event.target.value = '';
  };

  const dropFile = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) {
      return;
    }
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) {
      onChange(nextFile);
    }
  };

  return (
    <Paper
      component="section"
      variant="outlined"
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          setDragging(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDragging(false);
        }
      }}
      onDrop={dropFile}
      sx={{
        p: 2,
        minHeight: 176,
        borderStyle: dragging ? 'dashed' : 'solid',
        borderWidth: dragging ? 2 : 1,
        borderColor: dragging ? 'primary.main' : 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <PictureAsPdfIcon color={file ? 'primary' : 'disabled'} />
        <Typography component="h2" variant="subtitle1" fontWeight={600}>
          {label}
        </Typography>
        {file && (
          <Tooltip title={clearLabel}>
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => onChange(null)}
                aria-label={`${clearLabel}: ${label}`}
                sx={{ ml: 'auto' }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {file ? (
        <Box sx={{ my: 2, minWidth: 0 }}>
          <Typography noWrap fontWeight={500} title={file.name}>
            {file.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatBytes(file.size)}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
          {emptyLabel}
        </Typography>
      )}

      <Button
        variant={file ? 'outlined' : 'contained'}
        startIcon={<UploadFileIcon />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {file ? replaceLabel : chooseLabel}
      </Button>
      <input
        ref={inputRef}
        id={id}
        data-testid={id}
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled}
        onChange={selectFile}
        style={{ display: 'none' }}
      />
    </Paper>
  );
}

function PageImage({
  url,
  label,
  missingLabel
}: {
  url: string | null;
  label: string;
  missingLabel: string;
}) {
  return (
    <Box
      sx={{
        ...checkerboardBackground,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 180,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        position: 'relative'
      }}
    >
      {url ? (
        <Box
          component="img"
          src={url}
          alt={label}
          draggable={false}
          sx={{
            display: 'block',
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      ) : (
        <Alert severity="warning" sx={{ m: 2 }}>
          {missingLabel}
        </Alert>
      )}
    </Box>
  );
}

function AlignedImage({
  url,
  alt,
  opacity = 1,
  clipPath
}: {
  url: string | null;
  alt: string;
  opacity?: number;
  clipPath?: string;
}) {
  if (!url) {
    return null;
  }
  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      draggable={false}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        opacity,
        clipPath
      }}
    />
  );
}

function AlignedViewport({
  assets,
  children
}: {
  assets: PageVisualAssets;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        ...checkerboardBackground,
        width: '100%',
        aspectRatio: `${assets.normalizedWidth} / ${assets.normalizedHeight}`,
        maxHeight: '72vh',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {children}
    </Box>
  );
}

function truncateSegments(
  segments: TextDiffSegment[],
  maximumCharacters = 40000
): { segments: TextDiffSegment[]; truncated: boolean } {
  const visible: TextDiffSegment[] = [];
  let remaining = maximumCharacters;

  for (const segment of segments) {
    if (remaining <= 0) {
      return { segments: visible, truncated: true };
    }
    if (segment.value.length <= remaining) {
      visible.push(segment);
      remaining -= segment.value.length;
      continue;
    }
    visible.push({ ...segment, value: segment.value.slice(0, remaining) });
    return { segments: visible, truncated: true };
  }

  return { segments: visible, truncated: false };
}

function TextDiffView({
  comparison,
  noTextLabel,
  onlyALabel,
  onlyBLabel,
  limitedLabel,
  truncatedLabel,
  identicalLabel,
  diffLabel
}: {
  comparison: TextComparison;
  noTextLabel: string;
  onlyALabel: string;
  onlyBLabel: string;
  limitedLabel: string;
  truncatedLabel: string;
  identicalLabel: string;
  diffLabel: string;
}) {
  const visible = useMemo(
    () => truncateSegments(comparison.segments),
    [comparison.segments]
  );

  if (comparison.status === 'no-text-layer') {
    return <Alert severity="info">{noTextLabel}</Alert>;
  }

  return (
    <Stack spacing={2}>
      {comparison.status === 'only-a-has-text' && (
        <Alert severity="warning">{onlyALabel}</Alert>
      )}
      {comparison.status === 'only-b-has-text' && (
        <Alert severity="warning">{onlyBLabel}</Alert>
      )}
      {comparison.status === 'comparison-limited' && (
        <Alert severity="warning">{limitedLabel}</Alert>
      )}
      {comparison.status === 'identical' && (
        <Alert severity="success">{identicalLabel}</Alert>
      )}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxHeight: '58vh',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          fontFamily: 'monospace',
          lineHeight: 1.7
        }}
        aria-label={diffLabel}
      >
        {visible.segments.map((segment, index) => {
          if (segment.kind === 'added') {
            return (
              <Box
                component="ins"
                key={`${segment.kind}-${index}`}
                sx={{
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  textDecoration: 'none'
                }}
              >
                {segment.value}
              </Box>
            );
          }
          if (segment.kind === 'removed') {
            return (
              <Box
                component="del"
                key={`${segment.kind}-${index}`}
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                }}
              >
                {segment.value}
              </Box>
            );
          }
          return (
            <Box component="span" key={`${segment.kind}-${index}`}>
              {segment.value}
            </Box>
          );
        })}
      </Paper>
      {visible.truncated && (
        <Typography variant="caption" color="text.secondary">
          {truncatedLabel}
        </Typography>
      )}
    </Stack>
  );
}

function ComparisonCanvas({
  view,
  page,
  assets,
  overlayOpacity,
  swipePosition,
  onOverlayOpacityChange,
  onSwipePositionChange,
  labels
}: {
  view: ComparisonView;
  page: PageComparison;
  assets: PageVisualAssets;
  overlayOpacity: number;
  swipePosition: number;
  onOverlayOpacityChange: (value: number) => void;
  onSwipePositionChange: (value: number) => void;
  labels: {
    documentA: string;
    documentB: string;
    missingA: string;
    missingB: string;
    overlayOpacity: string;
    swipePosition: string;
    noText: string;
    onlyA: string;
    onlyB: string;
    limited: string;
    truncated: string;
    identicalText: string;
    pageLabel: string;
    differenceMask: string;
    textDiffLabel: string;
  };
}) {
  if (view === 'text-diff') {
    return (
      <TextDiffView
        comparison={page.text}
        noTextLabel={labels.noText}
        onlyALabel={labels.onlyA}
        onlyBLabel={labels.onlyB}
        limitedLabel={labels.limited}
        truncatedLabel={labels.truncated}
        identicalLabel={labels.identicalText}
        diffLabel={labels.textDiffLabel}
      />
    );
  }

  if (view === 'side-by-side') {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {labels.documentA}
          </Typography>
          <PageImage
            url={assets.documentAUrl}
            label={`${labels.documentA}, ${labels.pageLabel}`}
            missingLabel={labels.missingA}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {labels.documentB}
          </Typography>
          <PageImage
            url={assets.documentBUrl}
            label={`${labels.documentB}, ${labels.pageLabel}`}
            missingLabel={labels.missingB}
          />
        </Grid>
      </Grid>
    );
  }

  if (view === 'overlay') {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography gutterBottom id="overlay-opacity-label">
            {labels.overlayOpacity}: {Math.round(overlayOpacity * 100)}%
          </Typography>
          <Slider
            aria-labelledby="overlay-opacity-label"
            value={overlayOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(_, value) => onOverlayOpacityChange(value as number)}
          />
        </Box>
        <AlignedViewport assets={assets}>
          <AlignedImage
            url={assets.documentAUrl}
            alt={`${labels.documentA}, ${labels.pageLabel}`}
          />
          <AlignedImage
            url={assets.documentBUrl}
            alt={`${labels.documentB}, ${labels.pageLabel}`}
            opacity={overlayOpacity}
          />
        </AlignedViewport>
      </Stack>
    );
  }

  if (view === 'swipe') {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography gutterBottom id="swipe-position-label">
            {labels.swipePosition}: {swipePosition}%
          </Typography>
          <Slider
            aria-labelledby="swipe-position-label"
            value={swipePosition}
            min={0}
            max={100}
            step={1}
            onChange={(_, value) => onSwipePositionChange(value as number)}
          />
        </Box>
        <AlignedViewport assets={assets}>
          <AlignedImage
            url={assets.documentAUrl}
            alt={`${labels.documentA}, ${labels.pageLabel}`}
          />
          <AlignedImage
            url={assets.documentBUrl}
            alt={`${labels.documentB}, ${labels.pageLabel}`}
            clipPath={`inset(0 ${100 - swipePosition}% 0 0)`}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${swipePosition}%`,
              width: 2,
              bgcolor: 'primary.main',
              transform: 'translateX(-1px)'
            }}
          />
        </AlignedViewport>
      </Stack>
    );
  }

  return (
    <AlignedViewport assets={assets}>
      <AlignedImage
        url={assets.documentAUrl}
        alt={`${labels.documentA}, ${labels.pageLabel}`}
        opacity={0.2}
      />
      <AlignedImage
        url={assets.differenceMaskUrl}
        alt={labels.differenceMask}
      />
    </AlignedViewport>
  );
}

const progressFallbacks: Record<ComparisonProgress['stage'], string> = {
  loading: 'Opening PDFs',
  'reading-metadata': 'Comparing document information',
  rendering: 'Rendering page',
  'comparing-visuals': 'Comparing page pixels',
  'extracting-text': 'Comparing extracted text',
  finalizing: 'Preparing report'
};

export default function ComparePdf({ title }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const tr = useCallback(
    (
      key: string,
      defaultValue: string,
      values: Record<string, string | number> = {}
    ) =>
      t(`comparePdf.${key}`, {
        defaultValue,
        ...values
      }),
    [t]
  );
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [tolerance, setTolerance] = useState(8);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ComparisonProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [selectedPageNumber, setSelectedPageNumber] = useState<number | null>(
    null
  );
  const [reviewedPages, setReviewedPages] = useState<Set<number>>(
    () => new Set()
  );
  const [view, setView] = useState<ComparisonView>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [swipePosition, setSwipePosition] = useState(50);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultRef = useRef<ComparisonResult | null>(null);

  const replaceResult = useCallback((next: ComparisonResult | null) => {
    if (resultRef.current && resultRef.current !== next) {
      disposeComparisonResult(resultRef.current);
    }
    resultRef.current = next;
    setResult(next);
  }, []);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      disposeComparisonResult(resultRef.current);
      resultRef.current = null;
    },
    []
  );

  const changeInput = useCallback(
    (target: 'a' | 'b', file: File | null) => {
      if (target === 'a') {
        setFileA(file);
      } else {
        setFileB(file);
      }
      replaceResult(null);
      setSelectedPageNumber(null);
      setReviewedPages(new Set());
      setError(null);
      setCancelled(false);
      setProgress(null);
    },
    [replaceResult]
  );

  const runComparison = useCallback(async () => {
    const validationError = getComparisonValidationError(
      fileA,
      fileB,
      tolerance
    );
    if (validationError) {
      setError(tr(`errors.${validationError.code}`, validationError.message));
      setCancelled(false);
      return;
    }
    if (!fileA || !fileB) {
      return;
    }

    replaceResult(null);
    setReviewedPages(new Set());
    setSelectedPageNumber(null);
    setError(null);
    setCancelled(false);
    setRunning(true);
    setProgress({
      stage: 'loading',
      currentPage: null,
      completedPages: 0,
      totalPages: 0,
      percent: 0
    });
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const nextResult = await comparePdfFiles(fileA, fileB, {
        tolerance,
        signal: controller.signal,
        onProgress: setProgress
      });
      if (controller.signal.aborted) {
        disposeComparisonResult(nextResult);
        return;
      }
      replaceResult(nextResult);
      setSelectedPageNumber(
        nextResult.report.summary.rankedPageNumbers[0] ?? null
      );
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        setCancelled(true);
      } else {
        setError(
          caughtError instanceof ComparePdfError
            ? tr(`errors.${caughtError.code}`, caughtError.message, {
                page: caughtError.pageNumber ?? ''
              })
            : caughtError instanceof Error
              ? caughtError.message
              : tr('errors.unexpected', 'PDF comparison failed unexpectedly.')
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setRunning(false);
      }
    }
  }, [fileA, fileB, replaceResult, tolerance, tr]);

  const cancelComparison = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const selectedPage = useMemo(
    () =>
      result?.report.pages.find(
        ({ pageNumber }) => pageNumber === selectedPageNumber
      ) ?? null,
    [result, selectedPageNumber]
  );
  const selectedAssets =
    selectedPageNumber === null
      ? null
      : result?.visualAssets.get(selectedPageNumber) ?? null;
  const rankedPages = useMemo(() => {
    if (!result) {
      return [];
    }
    const pageByNumber = new Map(
      result.report.pages.map((page) => [page.pageNumber, page])
    );
    return result.report.summary.rankedPageNumbers.flatMap((pageNumber) => {
      const page = pageByNumber.get(pageNumber);
      return page ? [page] : [];
    });
  }, [result]);

  const toggleReviewed = useCallback((pageNumber: number) => {
    setReviewedPages((current) => {
      const next = new Set(current);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  }, []);

  const progressLabel = progress
    ? tr(`progress.${progress.stage}`, progressFallbacks[progress.stage])
    : '';

  return (
    <Stack id="tool" component="main" aria-label={title} spacing={3}>
      <Alert severity="info">
        {tr(
          'localProcessing',
          'Both PDFs are opened, rendered, and compared locally in this browser. No document bytes, names, text, or metadata are uploaded.'
        )}
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DocumentPicker
            id="compare-pdf-input-a"
            label={tr('inputs.documentA', 'Document A')}
            file={fileA}
            disabled={running}
            onChange={(file) => changeInput('a', file)}
            chooseLabel={tr('inputs.choosePdf', 'Choose PDF')}
            replaceLabel={tr('inputs.replacePdf', 'Replace PDF')}
            clearLabel={tr('inputs.clearPdf', 'Clear PDF')}
            emptyLabel={tr(
              'inputs.emptyA',
              'Choose or drop the first PDF. Selection alone does not start processing.'
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DocumentPicker
            id="compare-pdf-input-b"
            label={tr('inputs.documentB', 'Document B')}
            file={fileB}
            disabled={running}
            onChange={(file) => changeInput('b', file)}
            chooseLabel={tr('inputs.choosePdf', 'Choose PDF')}
            replaceLabel={tr('inputs.replacePdf', 'Replace PDF')}
            clearLabel={tr('inputs.clearPdf', 'Clear PDF')}
            emptyLabel={tr(
              'inputs.emptyB',
              'Choose or drop the second PDF. Pages are paired by page number.'
            )}
          />
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography id="visual-tolerance-label" gutterBottom>
                {tr('options.tolerance', 'Visual tolerance')}: {tolerance}
              </Typography>
              <Slider
                aria-labelledby="visual-tolerance-label"
                value={tolerance}
                min={0}
                max={64}
                step={1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 16, label: '16' },
                  { value: 32, label: '32' },
                  { value: 64, label: '64' }
                ]}
                disabled={running}
                onChange={(_, value) => setTolerance(value as number)}
              />
              <Typography variant="body2" color="text.secondary">
                {tr(
                  'options.toleranceHelp',
                  'Higher values ignore larger color-channel changes, reducing antialiasing noise. Run again after changing this value.'
                )}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CompareArrowsIcon />}
                disabled={running}
                onClick={() => void runComparison()}
                data-testid="compare-pdf-run"
              >
                {tr('actions.run', 'Run comparison')}
              </Button>
              {running && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={cancelComparison}
                  data-testid="compare-pdf-cancel"
                >
                  {tr('actions.cancel', 'Cancel')}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {running && progress && (
        <Paper
          variant="outlined"
          sx={{ p: 2 }}
          aria-live="polite"
          data-testid="compare-pdf-progress"
        >
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
            >
              <Typography fontWeight={500}>
                {progressLabel}
                {progress.currentPage !== null
                  ? tr('progress.pageSuffix', ' · Page {{page}}', {
                      page: progress.currentPage
                    })
                  : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.completedPages}/{progress.totalPages || '—'} ·{' '}
                {Math.round(progress.percent)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              aria-label={progressLabel}
            />
          </Stack>
        </Paper>
      )}
      {cancelled && !running && (
        <Alert severity="info" data-testid="compare-pdf-cancelled">
          {tr(
            'states.cancelled',
            'Comparison cancelled. No partial report was kept.'
          )}
        </Alert>
      )}
      {error && (
        <Alert severity="error" data-testid="compare-pdf-error">
          {error}
        </Alert>
      )}

      {result && (
        <Stack spacing={3} data-testid="compare-pdf-result">
          <Alert
            severity={
              result.report.summary.documentsIdentical ? 'success' : 'warning'
            }
            icon={
              result.report.summary.documentsIdentical ? (
                <CheckCircleOutlineIcon />
              ) : undefined
            }
          >
            {result.report.summary.documentsIdentical
              ? tr(
                  'summary.identical',
                  'No visual, text, page-structure, or metadata differences were detected at tolerance {{tolerance}}.',
                  { tolerance: result.report.tolerance }
                )
              : tr(
                  'summary.different',
                  '{{changed}} of {{total}} paired page positions contain a difference.',
                  {
                    changed: result.report.summary.changedPages,
                    total: result.report.summary.comparedPages
                  }
                )}
          </Alert>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={tr('summary.pageCounts', 'Pages: {{a}} vs {{b}}', {
                a: result.report.documentA.pageCount,
                b: result.report.documentB.pageCount
              })}
            />
            <Chip
              color={result.report.summary.changedPages ? 'warning' : 'success'}
              label={tr('summary.changedPages', 'Changed pages: {{count}}', {
                count: result.report.summary.changedPages
              })}
            />
            <Chip
              label={tr(
                'summary.maximumVisual',
                'Highest pixel change: {{value}}',
                {
                  value: formatPercentage(
                    result.report.summary.highestChangedPixelPercentage
                  )
                }
              )}
            />
            <Chip
              label={tr(
                'summary.metadataChanges',
                'Metadata changes: {{count}}',
                {
                  count: result.report.summary.metadataDifferenceCount
                }
              )}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                void downloadComparisonReport(
                  result.report,
                  reviewedPages,
                  tr('actions.reportDescription', 'PDF comparison report')
                ).catch((downloadError: unknown) => {
                  if (!isAbortError(downloadError)) {
                    setError(
                      downloadError instanceof Error
                        ? downloadError.message
                        : tr(
                            'errors.download',
                            'The JSON comparison report could not be saved.'
                          )
                    );
                  }
                });
              }}
              data-testid="compare-pdf-download-json"
            >
              {tr('actions.downloadJson', 'Download JSON report')}
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: '72vh',
                  overflow: 'auto'
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography component="h2" variant="h6">
                    {tr('pageList.title', 'Pages ranked by difference')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tr(
                      'pageList.reviewed',
                      '{{reviewed}} of {{total}} reviewed',
                      {
                        reviewed: reviewedPages.size,
                        total: rankedPages.length
                      }
                    )}
                  </Typography>
                </Box>
                <Divider />
                <List disablePadding>
                  {rankedPages.map((page) => (
                    <ListItem
                      key={page.pageNumber}
                      disablePadding
                      secondaryAction={
                        <Tooltip
                          title={
                            reviewedPages.has(page.pageNumber)
                              ? tr('pageList.markUnreviewed', 'Mark unreviewed')
                              : tr('pageList.markReviewed', 'Mark reviewed')
                          }
                        >
                          <Checkbox
                            edge="end"
                            checked={reviewedPages.has(page.pageNumber)}
                            onChange={() => toggleReviewed(page.pageNumber)}
                            inputProps={{
                              'aria-label': tr(
                                'pageList.reviewPage',
                                'Review page {{page}}',
                                { page: page.pageNumber }
                              )
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <ListItemButton
                        selected={selectedPageNumber === page.pageNumber}
                        onClick={() => setSelectedPageNumber(page.pageNumber)}
                      >
                        <ListItemText
                          primary={tr('pageList.page', 'Page {{page}}', {
                            page: page.pageNumber
                          })}
                          secondary={`${formatPercentage(
                            page.visual.changedPercentage
                          )} · ${tr('pageList.score', '{{value}} score', {
                            value: formatPercentage(page.differenceScore)
                          })}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              {selectedPage && selectedAssets ? (
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography component="h2" variant="h6">
                        {tr('review.pageTitle', 'Page {{page}}', {
                          page: selectedPage.pageNumber
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tr('inputs.documentA', 'Document A')}:{' '}
                        {formatGeometry(selectedPage.documentA)}
                        <br />
                        {tr('inputs.documentB', 'Document B')}:{' '}
                        {formatGeometry(selectedPage.documentB)}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={reviewedPages.has(selectedPage.pageNumber)}
                          onChange={() =>
                            toggleReviewed(selectedPage.pageNumber)
                          }
                        />
                      }
                      label={tr('review.reviewed', 'Reviewed')}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      color={
                        selectedPage.visual.changedPixels
                          ? 'warning'
                          : 'success'
                      }
                      label={tr(
                        'review.changedPixels',
                        'Changed pixels: {{value}}',
                        {
                          value: formatPercentage(
                            selectedPage.visual.changedPercentage
                          )
                        }
                      )}
                    />
                    <Chip
                      color={
                        selectedPage.text.changedPercentage
                          ? 'warning'
                          : 'default'
                      }
                      label={tr(
                        'review.changedText',
                        'Changed text: {{value}}',
                        {
                          value:
                            selectedPage.text.changedPercentage === null
                              ? tr('review.notAvailable', 'not available')
                              : formatPercentage(
                                  selectedPage.text.changedPercentage
                                )
                        }
                      )}
                    />
                    {selectedPage.dimensionsDiffer && (
                      <Chip
                        color="warning"
                        label={tr(
                          'review.pageSizeDiffers',
                          'Page size differs'
                        )}
                      />
                    )}
                    {selectedPage.rotationDiffers && (
                      <Chip
                        color="warning"
                        label={tr('review.rotationDiffers', 'Rotation differs')}
                      />
                    )}
                    {selectedPage.presence !== 'both' && (
                      <Chip
                        color="error"
                        label={
                          selectedPage.presence === 'missing-from-a'
                            ? tr(
                                'review.missingFromA',
                                'Missing from Document A'
                              )
                            : tr(
                                'review.missingFromB',
                                'Missing from Document B'
                              )
                        }
                      />
                    )}
                  </Stack>

                  <Tabs
                    value={view}
                    onChange={(_, value: ComparisonView) => setView(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label={tr('views.label', 'PDF comparison views')}
                  >
                    <Tab
                      value="side-by-side"
                      label={tr('views.sideBySide', 'Side by side')}
                    />
                    <Tab
                      value="overlay"
                      label={tr('views.overlay', 'Overlay')}
                    />
                    <Tab
                      value="swipe"
                      label={tr('views.swipe', 'Swipe / reveal')}
                    />
                    <Tab
                      value="difference-mask"
                      label={tr('views.differenceMask', 'Difference mask')}
                    />
                    <Tab
                      value="text-diff"
                      label={tr('views.textDiff', 'Extracted text diff')}
                    />
                  </Tabs>

                  <ComparisonCanvas
                    view={view}
                    page={selectedPage}
                    assets={selectedAssets}
                    overlayOpacity={overlayOpacity}
                    swipePosition={swipePosition}
                    onOverlayOpacityChange={setOverlayOpacity}
                    onSwipePositionChange={setSwipePosition}
                    labels={{
                      documentA: tr('inputs.documentA', 'Document A'),
                      documentB: tr('inputs.documentB', 'Document B'),
                      missingA: tr(
                        'review.missingFromA',
                        'Missing from Document A'
                      ),
                      missingB: tr(
                        'review.missingFromB',
                        'Missing from Document B'
                      ),
                      overlayOpacity: tr(
                        'views.overlayOpacity',
                        'Document B opacity'
                      ),
                      swipePosition: tr(
                        'views.swipePosition',
                        'Reveal position'
                      ),
                      noText: tr(
                        'text.noLayer',
                        'Neither page has an extractable text layer. OCR is not run automatically.'
                      ),
                      onlyA: tr(
                        'text.onlyA',
                        'Only Document A has extractable text on this page.'
                      ),
                      onlyB: tr(
                        'text.onlyB',
                        'Only Document B has extractable text on this page.'
                      ),
                      limited: tr(
                        'text.limited',
                        'The word-level diff reached its processing limit; the report marks the page for review.'
                      ),
                      truncated: tr(
                        'text.previewTruncated',
                        'The on-screen preview is truncated. The downloaded JSON includes the complete extracted diff data.'
                      ),
                      identicalText: tr(
                        'text.identical',
                        'Extracted text is identical.'
                      ),
                      pageLabel: tr('pageList.page', 'Page {{page}}', {
                        page: selectedPage.pageNumber
                      }),
                      differenceMask: tr(
                        'views.differenceMaskPage',
                        'Difference mask, page {{page}}',
                        { page: selectedPage.pageNumber }
                      ),
                      textDiffLabel: tr(
                        'views.textDiffLabel',
                        'Extracted text differences'
                      )
                    }}
                  />
                </Stack>
              ) : (
                <Alert severity="info">
                  {tr(
                    'review.selectPage',
                    'Choose a page from the ranked list to review it.'
                  )}
                </Alert>
              )}
            </Grid>
          </Grid>

          <Card variant="outlined">
            <CardContent>
              <Typography component="h2" variant="h6" gutterBottom>
                {tr('metadata.title', 'Document and metadata comparison')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{tr('metadata.field', 'Field')}</TableCell>
                      <TableCell>
                        {tr('inputs.documentA', 'Document A')}
                      </TableCell>
                      <TableCell>
                        {tr('inputs.documentB', 'Document B')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {tr('metadata.fileName', 'File name')}
                      </TableCell>
                      <TableCell>{result.report.documentA.fileName}</TableCell>
                      <TableCell>{result.report.documentB.fileName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {tr('metadata.fileSize', 'File size')}
                      </TableCell>
                      <TableCell>
                        {formatBytes(result.report.documentA.byteSize)}
                      </TableCell>
                      <TableCell>
                        {formatBytes(result.report.documentB.byteSize)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {tr('metadata.pageCount', 'Page count')}
                      </TableCell>
                      <TableCell>{result.report.documentA.pageCount}</TableCell>
                      <TableCell>{result.report.documentB.pageCount}</TableCell>
                    </TableRow>
                    {result.report.metadataDifferences.map((difference) => (
                      <TableRow key={difference.field}>
                        <TableCell>{difference.field}</TableCell>
                        <TableCell>{difference.documentA ?? '—'}</TableCell>
                        <TableCell>{difference.documentB ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {result.report.metadataDifferences.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {tr(
                    'metadata.noDifferences',
                    'No metadata field differences were found.'
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
