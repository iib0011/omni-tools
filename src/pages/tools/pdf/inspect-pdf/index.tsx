import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
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
  FindingCategory,
  InspectPdfError,
  InspectionProgress,
  InspectorReport
} from './types';

const CATEGORY_ORDER: FindingCategory[] = [
  'potentially-active',
  'privacy-related',
  'informational'
];

function SummaryItem({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography
        component="dt"
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0 }}>
        {children}
      </Typography>
    </Box>
  );
}

function findingColor(
  category: FindingCategory
): 'default' | 'info' | 'warning' | 'error' {
  if (category === 'potentially-active') {
    return 'warning';
  }
  if (category === 'privacy-related') {
    return 'info';
  }
  return 'default';
}

function errorTranslationKey(error: unknown): string {
  if (!(error instanceof InspectPdfError)) {
    return 'inspectPdf.errors.inspectionFailed';
  }
  const keys: Record<InspectPdfError['code'], string> = {
    cancelled: 'inspectPdf.errors.cancelled',
    'empty-file': 'inspectPdf.errors.emptyFile',
    'not-pdf': 'inspectPdf.errors.notPdf',
    'password-required': 'inspectPdf.errors.passwordRequired',
    'incorrect-password': 'inspectPdf.errors.incorrectPassword',
    'malformed-pdf': 'inspectPdf.errors.malformedPdf',
    'worker-error': 'inspectPdf.errors.workerError',
    'inspection-failed': 'inspectPdf.errors.inspectionFailed'
  };
  return keys[error.code];
}

export default function InspectPdf({ title }: ToolComponentProps) {
  const { t: translate } = useTranslation('pdf');
  // i18next's generated key overload becomes too deep for TypeScript when
  // report keys are assembled from typed finding/progress discriminants.
  const t = translate as (
    key: string,
    options?: Record<string, string | number | boolean | null | undefined>
  ) => string;
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [report, setReport] = useState<InspectorReport | null>(null);
  const [progress, setProgress] = useState<InspectionProgress | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    },
    []
  );

  const chooseFile = useCallback(
    (nextFile: File | null) => {
      if (!nextFile || isRunning) {
        return;
      }
      const looksLikePdf =
        nextFile.type === 'application/pdf' ||
        nextFile.name.toLowerCase().endsWith('.pdf');
      if (!looksLikePdf) {
        setErrorKey('inspectPdf.errors.fileType');
        return;
      }
      setFile(nextFile);
      setPassword('');
      setReport(null);
      setProgress(null);
      setErrorKey(null);
    },
    [isRunning]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleRun = async () => {
    if (!file || isRunning) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsRunning(true);
    setReport(null);
    setErrorKey(null);
    setProgress({
      stage: 'reading-file',
      completed: 0,
      total: Math.max(file.size, 1)
    });

    try {
      const { inspectPdf } = await import('./service');
      if (controller.signal.aborted) {
        throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
      }
      const nextReport = await inspectPdf(file, {
        password: password || undefined,
        signal: controller.signal,
        onProgress: setProgress
      });
      if (controller.signal.aborted) {
        throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
      }
      setReport(nextReport);
      setPassword('');
    } catch (error) {
      setErrorKey(errorTranslationKey(error));
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleDownload = async () => {
    if (!report) {
      return;
    }
    const baseName = report.file.name.replace(/\.pdf$/i, '');
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    try {
      const { saveBlob } = await import(
        '../../../../lib/pdf-workbench/save-file'
      );
      await saveBlob(blob, {
        suggestedName: `${baseName || 'pdf'}.inspection.json`,
        mimeType: 'application/json',
        extensions: ['.json'],
        description: t('inspectPdf.result.jsonDescription'),
        preferFilePicker: false
      });
    } catch {
      setErrorKey('inspectPdf.errors.downloadFailed');
    }
  };

  const progressPercent = useMemo(() => {
    if (!progress || progress.total <= 0) {
      return null;
    }
    return Math.min(
      100,
      Math.max(0, (progress.completed / progress.total) * 100)
    );
  }, [progress]);

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('inspectPdf.localProcessing')}
      </Alert>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('inspectPdf.input.title')}
          </Typography>
          <Box
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: isDragging ? 'action.hover' : 'background.paper'
            }}
          >
            <UploadFileIcon color="primary" sx={{ fontSize: 42 }} />
            <Typography sx={{ mt: 1 }}>
              {file
                ? t('inspectPdf.input.selected', {
                    name: file.name,
                    size: file.size.toLocaleString()
                  })
                : t('inspectPdf.input.dropHint')}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => inputRef.current?.click()}
                disabled={isRunning}
              >
                {t('inspectPdf.input.choose')}
              </Button>
              {file && (
                <Button
                  color="inherit"
                  onClick={() => {
                    setFile(null);
                    setPassword('');
                    setReport(null);
                    setProgress(null);
                    setErrorKey(null);
                  }}
                  disabled={isRunning}
                >
                  {t('inspectPdf.input.clear')}
                </Button>
              )}
            </Stack>
            <input
              ref={inputRef}
              data-testid="inspect-pdf-file-input"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleInputChange}
              hidden
            />
          </Box>

          <TextField
            label={t('inspectPdf.input.password')}
            helperText={t('inspectPdf.input.passwordHelp')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!file || isRunning}
            autoComplete="off"
            fullWidth
            sx={{ mt: 2 }}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              data-testid="inspect-pdf-run"
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleRun}
              disabled={!file || isRunning}
            >
              {t('inspectPdf.actions.run')}
            </Button>
            {isRunning && (
              <Button
                data-testid="inspect-pdf-cancel"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                {t('inspectPdf.actions.cancel')}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {isRunning && progress && (
        <Card
          data-testid="inspect-pdf-progress"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          <CardContent>
            <Typography variant="subtitle1">
              {t(`inspectPdf.progress.${progress.stage}`)}
            </Typography>
            {progress.pageNumber && progress.totalPages && (
              <Typography variant="body2" color="text.secondary">
                {t('inspectPdf.progress.page', {
                  current: progress.pageNumber,
                  total: progress.totalPages
                })}
              </Typography>
            )}
            <LinearProgress
              variant={
                progressPercent === null ? 'indeterminate' : 'determinate'
              }
              value={progressPercent ?? undefined}
              aria-label={t('inspectPdf.progress.label')}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      )}

      {errorKey && (
        <Alert
          data-testid="inspect-pdf-error"
          severity={errorKey.endsWith('cancelled') ? 'info' : 'error'}
          sx={{ mt: 2 }}
        >
          {t(errorKey)}
        </Alert>
      )}

      {report && (
        <Stack data-testid="inspect-pdf-report" spacing={2} sx={{ mt: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="h5" component="h2">
              {t('inspectPdf.result.title')}
            </Typography>
            <Button
              data-testid="inspect-pdf-download"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              {t('inspectPdf.actions.downloadJson')}
            </Button>
          </Stack>

          <Alert severity="warning">{t('inspectPdf.scopeStatement')}</Alert>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {CATEGORY_ORDER.map((category) => (
              <Chip
                key={category}
                color={findingColor(category)}
                label={t(`inspectPdf.categories.${category}`, {
                  count: report.findingsByCategory[category].length
                })}
              />
            ))}
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('inspectPdf.result.file')}
                  </Typography>
                  <Box
                    component="dl"
                    sx={{
                      m: 0,
                      display: 'grid',
                      gridTemplateColumns: 'minmax(8rem, auto) 1fr',
                      gap: 1
                    }}
                  >
                    <SummaryItem label={t('inspectPdf.fields.name')}>
                      {report.file.name}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.size')}>
                      {report.file.byteSize.toLocaleString()}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.sha256')}>
                      <Box
                        component="span"
                        sx={{
                          overflowWrap: 'anywhere',
                          fontFamily: 'monospace'
                        }}
                      >
                        {report.file.sha256}
                      </Box>
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.mimeType')}>
                      {report.file.mimeType}
                    </SummaryItem>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('inspectPdf.result.document')}
                  </Typography>
                  <Box
                    component="dl"
                    sx={{
                      m: 0,
                      display: 'grid',
                      gridTemplateColumns: 'minmax(8rem, auto) 1fr',
                      gap: 1
                    }}
                  >
                    <SummaryItem label={t('inspectPdf.fields.pdfVersion')}>
                      {report.document.pdfVersion ??
                        t('inspectPdf.values.unknown')}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.pageCount')}>
                      {report.document.pageCount}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.encryption')}>
                      {t(
                        `inspectPdf.values.encryption.${report.document.encryption.state}`
                      )}
                      {report.document.encryption.filter
                        ? ` (${report.document.encryption.filter})`
                        : ''}
                    </SummaryItem>
                    <SummaryItem
                      label={t('inspectPdf.fields.passwordRequired')}
                    >
                      {report.document.passwordRequired
                        ? t('inspectPdf.values.yes')
                        : t('inspectPdf.values.no')}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.linearization')}>
                      {t(
                        `inspectPdf.values.linearization.${report.document.linearization.state}`
                      )}
                    </SummaryItem>
                    <SummaryItem label={t('inspectPdf.fields.permissions')}>
                      {report.document.permissions.exposed
                        ? report.document.permissions.allowed
                            ?.map((permission) =>
                              t(`inspectPdf.permissions.${permission}`)
                            )
                            .join(', ') || t('inspectPdf.values.noneReported')
                        : t('inspectPdf.values.notExposed')}
                    </SummaryItem>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('inspectPdf.result.findings')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {CATEGORY_ORDER.map((category) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t(`inspectPdf.categoryHeadings.${category}`)}
                  </Typography>
                  {report.findingsByCategory[category].length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('inspectPdf.result.noneInCategory')}
                    </Typography>
                  ) : (
                    <List disablePadding>
                      {report.findingsByCategory[category].map((finding) => (
                        <ListItem
                          key={finding.id}
                          alignItems="flex-start"
                          disableGutters
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography sx={{ fontWeight: 600 }}>
                                  {t(`inspectPdf.findings.${finding.id}.title`)}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={t(
                                    `inspectPdf.certainty.${finding.certainty}`
                                  )}
                                />
                              </Stack>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t(
                                    `inspectPdf.findings.${finding.id}.summary`
                                  )}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('inspectPdf.result.pages')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('inspectPdf.table.page')}</TableCell>
                      <TableCell>{t('inspectPdf.table.dimensions')}</TableCell>
                      <TableCell>{t('inspectPdf.table.orientation')}</TableCell>
                      <TableCell>{t('inspectPdf.table.rotation')}</TableCell>
                      <TableCell>{t('inspectPdf.table.text')}</TableCell>
                      <TableCell>{t('inspectPdf.table.annotations')}</TableCell>
                      <TableCell>{t('inspectPdf.table.images')}</TableCell>
                      <TableCell>{t('inspectPdf.table.fonts')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.pages.map((page) => (
                      <TableRow key={page.pageNumber}>
                        <TableCell>{page.pageNumber}</TableCell>
                        <TableCell>
                          {t('inspectPdf.values.points', {
                            width: page.widthPoints,
                            height: page.heightPoints
                          })}
                        </TableCell>
                        <TableCell>
                          {t(
                            `inspectPdf.values.orientation.${page.orientation}`
                          )}
                        </TableCell>
                        <TableCell>{page.rotation}°</TableCell>
                        <TableCell>
                          {page.extractableTextCharacters}
                          {page.lowExtractableText && (
                            <Chip
                              label={t('inspectPdf.values.lowText')}
                              size="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{page.annotationCount}</TableCell>
                        <TableCell>{page.imagePaintOperations}</TableCell>
                        <TableCell>
                          {page.approximateFontNames.length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('inspectPdf.result.content')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('inspectPdf.result.forms')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.forms', {
                      count: report.forms.fields.length,
                      signatures: report.forms.signatureFields.length
                    })}
                  </Typography>
                  <List dense disablePadding>
                    {report.forms.fields.map((field) => (
                      <ListItem key={field.name} disableGutters>
                        <ListItemText
                          primary={`${field.name} — ${field.type}`}
                          secondary={t('inspectPdf.counts.fieldDetail', {
                            widgets: field.widgetCount,
                            pages:
                              field.pageNumbers.join(', ') ||
                              t('inspectPdf.values.unknown')
                          })}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 2 }}
                  >
                    {t('inspectPdf.result.annotations')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.annotations', {
                      count: report.annotations.total
                    })}
                  </Typography>
                  <List dense disablePadding>
                    {Object.entries(report.annotations.byType).map(
                      ([annotationType, count]) => (
                        <ListItem key={annotationType} disableGutters>
                          <ListItemText
                            primary={annotationType}
                            secondary={t('inspectPdf.counts.annotationType', {
                              count
                            })}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 2 }}
                  >
                    {t('inspectPdf.result.links')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.links', {
                      count: report.links.all.length,
                      external: report.links.externalTargets.length
                    })}
                  </Typography>
                  <List dense disablePadding>
                    {report.links.all.map((link, index) => (
                      <ListItem
                        key={`${link.source}-${link.pageNumber}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={
                            <Box
                              component="span"
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {link.target}
                            </Box>
                          }
                          secondary={t('inspectPdf.counts.linkDetail', {
                            location:
                              link.pageNumber === null
                                ? t('inspectPdf.values.documentOutline')
                                : t('inspectPdf.values.page', {
                                    page: link.pageNumber
                                  }),
                            external: link.external
                              ? t('inspectPdf.values.external')
                              : t('inspectPdf.values.internal')
                          })}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('inspectPdf.result.attachments')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.attachments', {
                      count: report.attachments.length
                    })}
                  </Typography>
                  <List dense disablePadding>
                    {report.attachments.map((attachment, index) => (
                      <ListItem
                        key={`${attachment.source}-${attachment.pageNumber}-${attachment.name}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={attachment.name}
                          secondary={t('inspectPdf.counts.attachmentDetail', {
                            size:
                              attachment.byteSize?.toLocaleString() ??
                              t('inspectPdf.values.unknown'),
                            source:
                              attachment.pageNumber === null
                                ? t('inspectPdf.values.document')
                                : t('inspectPdf.values.page', {
                                    page: attachment.pageNumber
                                  })
                          })}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 2 }}
                  >
                    {t('inspectPdf.result.activeContent')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.activeContent', {
                      javascript: report.activeContent.javascript.length,
                      actions: report.activeContent.actionTypes.length,
                      openAction: report.activeContent.openActionPresent
                        ? t('inspectPdf.values.yes')
                        : t('inspectPdf.values.no')
                    })}
                  </Typography>
                  <List dense disablePadding>
                    {report.activeContent.javascript.map((script, index) => (
                      <ListItem
                        key={`${script.scope}-${script.pageNumber}-${script.event}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={script.event}
                          secondary={t('inspectPdf.counts.javascriptDetail', {
                            scope:
                              script.pageNumber === null
                                ? t('inspectPdf.values.document')
                                : t('inspectPdf.values.page', {
                                    page: script.pageNumber
                                  }),
                            count: script.scriptCount,
                            characters: script.totalCharacters
                          })}
                        />
                      </ListItem>
                    ))}
                    {report.activeContent.actionTypes.map((action, index) => (
                      <ListItem
                        key={`${action.source}-${action.pageNumber}-${action.type}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={action.type}
                          secondary={t('inspectPdf.counts.actionDetail', {
                            source: t(
                              `inspectPdf.actionSources.${action.source}`
                            ),
                            location:
                              action.pageNumber === null
                                ? t('inspectPdf.values.document')
                                : t('inspectPdf.values.page', {
                                    page: action.pageNumber
                                  })
                          })}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 2 }}
                  >
                    {t('inspectPdf.result.resources')}
                  </Typography>
                  <Typography variant="body2">
                    {t('inspectPdf.counts.resources', {
                      images: report.resources.imagePaintOperations,
                      fonts: report.resources.approximateFontNames.length
                    })}
                  </Typography>
                  {report.resources.approximateFontNames.length > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {t('inspectPdf.counts.fontNames', {
                        names: report.resources.approximateFontNames.join(', ')
                      })}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {t('inspectPdf.result.jsonDetail')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('inspectPdf.result.metadata')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t('inspectPdf.counts.metadata', {
                  fields: Object.keys(report.metadata.documentInfo).length,
                  xmp: report.metadata.xmp.present
                    ? t('inspectPdf.values.yes')
                    : t('inspectPdf.values.no')
                })}
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  fontSize: '0.75rem'
                }}
              >
                {JSON.stringify(report.metadata.documentInfo, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('inspectPdf.result.uncertainties')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('inspectPdf.result.uncertaintySummary', {
                  count: report.uncertainties.length
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('inspectPdf.result.jsonDetail')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Typography variant="caption" color="text.secondary">
            {t('inspectPdf.result.generated', {
              time: new Date(report.generatedAt).toLocaleString(),
              version: report.parser.version
            })}
          </Typography>
        </Stack>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          {title}
        </Typography>
        <Typography>{t('inspectPdf.toolInfo')}</Typography>
      </Box>
    </Box>
  );
}
