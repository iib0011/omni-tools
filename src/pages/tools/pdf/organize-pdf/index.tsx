import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  ArrowDownward,
  ArrowUpward,
  ContentCopy,
  Delete,
  Download,
  InsertPageBreak,
  Redo,
  RestartAlt,
  Undo,
  VerticalAlignBottom,
  VerticalAlignTop
} from '@mui/icons-material';
import { ToolComponentProps } from '@tools/defineTool';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageThumbnailCard from './PageThumbnailCard';
import {
  commitOrganizerAction,
  createBlankPage,
  createOrganizerHistory,
  createOrganizerPageId,
  redoOrganizerAction,
  selectEveryPage,
  setOrganizerSelection,
  undoOrganizerAction
} from './model';
import { createOrganizedFileName, createOrganizerSequence } from './service';
import {
  DropPlacement,
  OrganizerAction,
  OrganizerHistory,
  OrganizerInspection,
  OrganizerProgress
} from './types';
import type { PdfThumbnailRenderer } from './thumbnail-service';
import {
  OrganizerCancelledError,
  OrganizerWorkerClient,
  OrganizerWorkerError
} from './worker-client';
import { readFileAsArrayBuffer, saveOrganizedPdf } from './file-io';
import PdfFilePicker, { formatFileSize } from './PdfFilePicker';

type OrganizerStatus = 'idle' | 'loading' | 'ready' | 'exporting';
const EMPTY_SELECTION: readonly string[] = [];

interface OrganizerResult {
  file: File;
  pageCount: number;
  sourcePages: number;
  blankPagesChecked: number;
}

const isCancelled = (error: unknown): boolean =>
  error instanceof OrganizerCancelledError ||
  (error instanceof Error && error.name === 'AbortError');

export default function OrganizePdf({ longDescription }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const workerClient = useMemo(() => new OrganizerWorkerClient(), []);
  const [input, setInput] = useState<File | null>(null);
  const [status, setStatus] = useState<OrganizerStatus>('idle');
  const [inspection, setInspection] = useState<OrganizerInspection | null>(
    null
  );
  const [history, setHistory] = useState<OrganizerHistory | null>(null);
  const [renderer, setRenderer] = useState<PdfThumbnailRenderer | null>(null);
  const [signatureAcknowledged, setSignatureAcknowledged] = useState(false);
  const [progress, setProgress] = useState<OrganizerProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrganizerResult | null>(null);
  const rendererRef = useRef<PdfThumbnailRenderer | null>(null);
  const operationControllerRef = useRef<AbortController | null>(null);
  const operationTokenRef = useRef(0);
  const selectionAnchorRef = useRef<string | null>(null);
  const draggingIdsRef = useRef<readonly string[]>([]);

  const localizedError = useCallback(
    (caughtError: unknown, fallback: 'open' | 'export'): string => {
      if (caughtError instanceof OrganizerWorkerError) {
        switch (caughtError.payload.code) {
          case 'INVALID_PDF':
            return String(t('organizePdf.errors.invalidPdf'));
          case 'PASSWORD_REQUIRED':
            return String(t('organizePdf.errors.passwordRequired'));
          case 'EMPTY_DOCUMENT':
            return String(t('organizePdf.errors.emptyDocument'));
          case 'INVALID_ORGANIZATION':
            return String(t('organizePdf.errors.invalidOrganization'));
          case 'VERIFICATION_FAILED':
            return String(t('organizePdf.errors.verificationFailed'));
          case 'EXPORT_FAILED':
            return String(t('organizePdf.errors.exportFailed'));
          case 'WORKER_ERROR':
            return String(t('organizePdf.errors.workerFailed'));
        }
      }
      return fallback === 'open'
        ? String(t('organizePdf.errors.openFailed'))
        : String(t('organizePdf.errors.exportFailed'));
    },
    [t]
  );

  const destroyRenderer = useCallback(() => {
    const activeRenderer = rendererRef.current;
    rendererRef.current = null;
    setRenderer(null);
    if (activeRenderer) void activeRenderer.destroy();
  }, []);

  const cancelOperation = useCallback(() => {
    operationTokenRef.current += 1;
    operationControllerRef.current?.abort();
    operationControllerRef.current = null;
    workerClient.cancel();
    setProgress(null);
    setStatus(history ? 'ready' : 'idle');
  }, [history, workerClient]);

  useEffect(
    () => () => {
      operationControllerRef.current?.abort();
      workerClient.dispose();
      const activeRenderer = rendererRef.current;
      rendererRef.current = null;
      if (activeRenderer) void activeRenderer.destroy();
    },
    [workerClient]
  );

  const resetForFile = useCallback(
    (file: File | null) => {
      operationTokenRef.current += 1;
      operationControllerRef.current?.abort();
      operationControllerRef.current = null;
      workerClient.cancel();
      destroyRenderer();
      setInput(file);
      setStatus('idle');
      setInspection(null);
      setHistory(null);
      setProgress(null);
      setError(null);
      setResult(null);
      setSignatureAcknowledged(false);
      selectionAnchorRef.current = null;
      draggingIdsRef.current = [];
    },
    [destroyRenderer, workerClient]
  );

  const handleOpenPdf = useCallback(async () => {
    if (!input || status === 'loading' || status === 'exporting') return;

    const token = operationTokenRef.current + 1;
    operationTokenRef.current = token;
    operationControllerRef.current?.abort();
    const controller = new AbortController();
    operationControllerRef.current = controller;
    workerClient.cancel();
    destroyRenderer();
    setStatus('loading');
    setError(null);
    setResult(null);
    setProgress({ stage: 'reading', current: 0, total: 1 });

    try {
      const inspectionBytes = await readFileAsArrayBuffer(
        input,
        controller.signal
      );
      const nextInspection = await workerClient.inspect(
        inspectionBytes,
        setProgress
      );
      const thumbnailBytes = await readFileAsArrayBuffer(
        input,
        controller.signal
      );
      const { createPdfThumbnailRenderer } = await import(
        './thumbnail-service'
      );
      const nextRenderer = await createPdfThumbnailRenderer(
        thumbnailBytes,
        controller.signal
      );

      if (controller.signal.aborted || token !== operationTokenRef.current) {
        await nextRenderer.destroy();
        return;
      }

      rendererRef.current = nextRenderer;
      setRenderer(nextRenderer);
      setInspection(nextInspection);
      setHistory(createOrganizerHistory(nextInspection.pages));
      setSignatureAcknowledged(!nextInspection.hasSignatureFields);
      setStatus('ready');
      setProgress(null);
    } catch (caughtError) {
      if (token === operationTokenRef.current && !isCancelled(caughtError)) {
        setError(localizedError(caughtError, 'open'));
        setStatus('idle');
        setProgress(null);
      }
    } finally {
      if (token === operationTokenRef.current) {
        operationControllerRef.current = null;
      }
    }
  }, [destroyRenderer, input, localizedError, status, workerClient]);

  const canModify =
    status === 'ready' &&
    (!inspection?.hasSignatureFields || signatureAcknowledged);
  const snapshot = history?.present ?? null;
  const selectedIds = snapshot?.selectedIds ?? EMPTY_SELECTION;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const setSelection = useCallback((ids: readonly string[]) => {
    setHistory((current) =>
      current ? setOrganizerSelection(current, ids) : current
    );
  }, []);

  const commit = useCallback(
    (action: OrganizerAction, forcedSelection?: readonly string[]) => {
      if (!canModify) return;
      setResult(null);
      setHistory((current) => {
        if (!current) return current;
        const base = forcedSelection
          ? setOrganizerSelection(current, forcedSelection)
          : current;
        return commitOrganizerAction(base, action);
      });
    },
    [canModify]
  );

  const toggleSelection = useCallback((pageId: string, range: boolean) => {
    setHistory((current) => {
      if (!current) return current;
      const pages = current.present.pages;
      const nextSelection = new Set(current.present.selectedIds);
      const anchorId = selectionAnchorRef.current;

      if (range && anchorId) {
        const anchorIndex = pages.findIndex((page) => page.id === anchorId);
        const pageIndex = pages.findIndex((page) => page.id === pageId);
        if (anchorIndex >= 0 && pageIndex >= 0) {
          const from = Math.min(anchorIndex, pageIndex);
          const to = Math.max(anchorIndex, pageIndex);
          for (let index = from; index <= to; index += 1) {
            nextSelection.add(pages[index].id);
          }
        }
      } else if (nextSelection.has(pageId)) {
        nextSelection.delete(pageId);
      } else {
        nextSelection.add(pageId);
      }

      selectionAnchorRef.current = pageId;
      return setOrganizerSelection(current, [...nextSelection]);
    });
  }, []);

  const selectedPages = useMemo(
    () => snapshot?.pages.filter((page) => selectedSet.has(page.id)) ?? [],
    [selectedSet, snapshot]
  );

  const handleDuplicate = () => {
    commit({
      type: 'duplicate-selected',
      newIds: selectedPages.map(() => createOrganizerPageId('copy'))
    });
  };

  const handleInsertBlank = (placement: DropPlacement) => {
    const referencePage = selectedPages[0];
    if (!referencePage || selectedPages.length !== 1) return;
    commit({
      type: 'insert-blank',
      placement,
      blankPage: createBlankPage(referencePage, createOrganizerPageId('blank'))
    });
  };

  const ensureCardSelection = (pageId: string): readonly string[] =>
    selectedSet.has(pageId) ? selectedIds : [pageId];

  const handleCardMoveBy = (pageId: string, direction: -1 | 1) => {
    const pageIds = ensureCardSelection(pageId);
    commit({ type: 'move-selected-by', direction }, pageIds);
  };

  const handleCardMoveToEdge = (pageId: string, edge: 'start' | 'end') => {
    const pageIds = ensureCardSelection(pageId);
    commit(
      {
        type:
          edge === 'start' ? 'move-selected-to-start' : 'move-selected-to-end'
      },
      pageIds
    );
  };

  const handleDragStart = (pageId: string) => {
    const pageIds = ensureCardSelection(pageId);
    draggingIdsRef.current = pageIds;
    if (!selectedSet.has(pageId)) setSelection(pageIds);
  };

  const handleDrop = (targetId: string, placement: DropPlacement) => {
    commit({
      type: 'reorder-selected',
      pageIds: draggingIdsRef.current,
      targetId,
      placement
    });
    draggingIdsRef.current = [];
  };

  const handleUndo = () => {
    if (!history?.past.length) return;
    setResult(null);
    setHistory((current) => (current ? undoOrganizerAction(current) : current));
  };

  const handleRedo = () => {
    if (!history?.future.length) return;
    setResult(null);
    setHistory((current) => (current ? redoOrganizerAction(current) : current));
  };

  const handleExport = useCallback(async () => {
    if (
      !input ||
      !snapshot ||
      !rendererRef.current ||
      !canModify ||
      snapshot.pages.length === 0
    ) {
      return;
    }

    const pages = snapshot.pages.map((page) => ({ ...page }));
    const activeRenderer = rendererRef.current;
    const token = operationTokenRef.current + 1;
    operationTokenRef.current = token;
    const controller = new AbortController();
    operationControllerRef.current = controller;
    workerClient.cancel();
    setStatus('exporting');
    setError(null);
    setResult(null);
    setProgress({ stage: 'reading', current: 0, total: 1 });

    try {
      const source = await readFileAsArrayBuffer(input, controller.signal);
      const exported = await workerClient.export(source, pages, setProgress);
      setProgress({
        stage: 'verifying',
        current: 0,
        total: pages.length
      });
      const browserVerification = await activeRenderer.verifyOutput(
        exported.bytes,
        pages,
        controller.signal
      );
      const expectedSequence = createOrganizerSequence(pages);
      const sequenceMatches =
        expectedSequence.length === exported.verification.sequence.length &&
        expectedSequence.every(
          (entry, index) => entry === exported.verification.sequence[index]
        );
      if (
        !browserVerification.verified ||
        !exported.verification.geometryVerified ||
        exported.verification.pageCount !== pages.length ||
        !sequenceMatches
      ) {
        throw new OrganizerWorkerError({
          code: 'VERIFICATION_FAILED',
          message: 'Browser verification rejected the organized PDF.'
        });
      }

      if (controller.signal.aborted || token !== operationTokenRef.current) {
        return;
      }
      const outputFile = new File(
        [exported.bytes],
        createOrganizedFileName(input.name),
        { type: 'application/pdf' }
      );
      setResult({
        file: outputFile,
        pageCount: browserVerification.pageCount,
        sourcePages: pages.filter((page) => page.kind === 'source').length,
        blankPagesChecked: browserVerification.blankPagesChecked
      });
      setStatus('ready');
      setProgress(null);
    } catch (caughtError) {
      if (token === operationTokenRef.current && !isCancelled(caughtError)) {
        setError(localizedError(caughtError, 'export'));
        setStatus('ready');
        setProgress(null);
      }
    } finally {
      if (token === operationTokenRef.current) {
        operationControllerRef.current = null;
      }
    }
  }, [canModify, input, localizedError, snapshot, workerClient]);

  const progressLabel = progress
    ? {
        reading: String(t('organizePdf.progress.reading')),
        inspecting: String(t('organizePdf.progress.inspecting')),
        copying: String(t('organizePdf.progress.copying')),
        saving: String(t('organizePdf.progress.saving')),
        verifying: String(t('organizePdf.progress.verifying'))
      }[progress.stage]
    : '';
  const progressValue =
    progress && progress.total > 0
      ? (progress.current / progress.total) * 100
      : 0;

  return (
    <Stack spacing={3} id="tool">
      <Alert severity="info">{t('organizePdf.localProcessing')}</Alert>
      {longDescription && (
        <Typography color="text.secondary">{longDescription}</Typography>
      )}

      <PdfFilePicker
        value={input}
        onChange={resetForFile}
        disabled={status === 'loading' || status === 'exporting'}
        onError={setError}
        labels={{
          title: t('organizePdf.inputTitle'),
          hint: t('organizePdf.input.hint'),
          choose: t('organizePdf.input.choose'),
          replace: t('organizePdf.input.replace'),
          clear: t('organizePdf.input.clear'),
          selected: (name, size) =>
            String(
              t('organizePdf.input.selected', {
                name,
                size
              })
            ),
          invalid: t('organizePdf.errors.invalidFile'),
          oneFileOnly: t('organizePdf.errors.oneFileOnly')
        }}
      />

      {input && status === 'idle' && (
        <Box>
          <Button
            variant="contained"
            onClick={() => void handleOpenPdf()}
            data-testid="organizer-open"
          >
            {t('organizePdf.openPdf')}
          </Button>
        </Box>
      )}

      {(status === 'loading' || status === 'exporting') && progress && (
        <Paper sx={{ p: 2 }} aria-live="polite">
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <Box flex={1}>
              <Typography>
                {progressLabel}{' '}
                {t('organizePdf.progress.count', {
                  current: progress.current,
                  total: progress.total
                })}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ mt: 1 }}
              />
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={cancelOperation}
              data-testid="organizer-cancel"
            >
              {t('organizePdf.cancel')}
            </Button>
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert severity="error" aria-live="assertive">
          {error}
        </Alert>
      )}

      {inspection?.hasSignatureFields && (
        <Alert severity="warning">
          <Typography>{t('organizePdf.signatureWarning')}</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={signatureAcknowledged}
                onChange={(event) =>
                  setSignatureAcknowledged(event.target.checked)
                }
              />
            }
            label={t('organizePdf.signatureAcknowledge')}
          />
        </Alert>
      )}

      {snapshot && (
        <>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6">
                  {t('organizePdf.pageSummary', {
                    count: snapshot.pages.length
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('organizePdf.selectedSummary', {
                    selected: selectedIds.length,
                    total: snapshot.pages.length
                  })}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  onClick={handleUndo}
                  disabled={!history?.past.length || status !== 'ready'}
                  startIcon={<Undo />}
                >
                  {t('organizePdf.actions.undo')}
                </Button>
                <Button
                  size="small"
                  onClick={handleRedo}
                  disabled={!history?.future.length || status !== 'ready'}
                  startIcon={<Redo />}
                >
                  {t('organizePdf.actions.redo')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setSelection(selectEveryPage(snapshot.pages, 'all'))
                  }
                >
                  {t('organizePdf.selection.selectAll')}
                </Button>
                <Button size="small" onClick={() => setSelection([])}>
                  {t('organizePdf.selection.clear')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setSelection(selectEveryPage(snapshot.pages, 'odd'))
                  }
                >
                  {t('organizePdf.selection.odd')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setSelection(selectEveryPage(snapshot.pages, 'even'))
                  }
                >
                  {t('organizePdf.selection.even')}
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Delete />}
                disabled={
                  !canModify ||
                  selectedIds.length === 0 ||
                  selectedIds.length === snapshot.pages.length
                }
                onClick={() => commit({ type: 'delete-selected' })}
              >
                {t('organizePdf.actions.delete')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopy />}
                disabled={!canModify || selectedIds.length === 0}
                onClick={handleDuplicate}
              >
                {t('organizePdf.actions.duplicate')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RestartAlt />}
                disabled={!canModify || snapshot.pages.length < 2}
                onClick={() => commit({ type: 'reverse-all' })}
              >
                {t('organizePdf.actions.reverse')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowUpward />}
                disabled={!canModify || selectedIds.length === 0}
                onClick={() =>
                  commit({ type: 'move-selected-by', direction: -1 })
                }
              >
                {t('organizePdf.actions.earlier')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowDownward />}
                disabled={!canModify || selectedIds.length === 0}
                onClick={() =>
                  commit({ type: 'move-selected-by', direction: 1 })
                }
              >
                {t('organizePdf.actions.later')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VerticalAlignTop />}
                disabled={!canModify || selectedIds.length === 0}
                onClick={() => commit({ type: 'move-selected-to-start' })}
              >
                {t('organizePdf.actions.moveBeginning')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VerticalAlignBottom />}
                disabled={!canModify || selectedIds.length === 0}
                onClick={() => commit({ type: 'move-selected-to-end' })}
              >
                {t('organizePdf.actions.moveEnd')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<InsertPageBreak />}
                disabled={!canModify || selectedIds.length !== 1}
                onClick={() => handleInsertBlank('before')}
              >
                {t('organizePdf.actions.blankBefore')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<InsertPageBreak />}
                disabled={!canModify || selectedIds.length !== 1}
                onClick={() => handleInsertBlank('after')}
              >
                {t('organizePdf.actions.blankAfter')}
              </Button>
            </Stack>
            {selectedIds.length === snapshot.pages.length && (
              <Typography variant="caption" color="text.secondary">
                {t('organizePdf.keepOnePage')}
              </Typography>
            )}
          </Paper>

          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {t('organizePdf.keyboardHint')}
            </Typography>
            <Box
              role="listbox"
              aria-multiselectable="true"
              aria-label={t('organizePdf.pageGrid')}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 2
              }}
            >
              {snapshot.pages.map((page, index) => (
                <PageThumbnailCard
                  key={page.id}
                  page={page}
                  position={index + 1}
                  selected={selectedSet.has(page.id)}
                  disabled={!canModify}
                  renderer={renderer}
                  labels={{
                    page: (page) =>
                      String(t('organizePdf.thumbnail.page', { page })),
                    originalPage: (page) =>
                      String(t('organizePdf.thumbnail.originalPage', { page })),
                    blankPage: t('organizePdf.thumbnail.blankPage'),
                    thumbnail: (page) =>
                      String(t('organizePdf.thumbnail.thumbnail', { page })),
                    thumbnailError: t('organizePdf.thumbnail.thumbnailError')
                  }}
                  onToggle={toggleSelection}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onMoveBy={handleCardMoveBy}
                  onMoveToEdge={handleCardMoveToEdge}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => void handleExport()}
              disabled={!canModify || status !== 'ready'}
              data-testid="organizer-export"
            >
              {t('organizePdf.export')}
            </Button>
          </Box>
        </>
      )}

      {result && (
        <Card data-testid="organizer-result">
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="success">
                {t('organizePdf.outputVerified', {
                  count: result.pageCount,
                  textPages: result.sourcePages,
                  blankPages: result.blankPagesChecked
                })}
              </Alert>
              <Typography variant="body2">{result.file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('organizePdf.outputSize', {
                  size: formatFileSize(result.file.size)
                })}
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => {
                    void saveOrganizedPdf(
                      result.file,
                      String(t('organizePdf.outputDescription'))
                    ).catch((downloadError: unknown) => {
                      if (!isCancelled(downloadError)) {
                        setError(t('organizePdf.errors.downloadFailed'));
                      }
                    });
                  }}
                  data-testid="organizer-download"
                >
                  {t('organizePdf.download')}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
