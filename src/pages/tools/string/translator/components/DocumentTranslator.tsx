import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import { useTranslation } from 'react-i18next';
import InputHeader from '@components/InputHeader';
import ResultFooter from '@components/result/ResultFooter';
import ToolInputAndResult from '@components/ToolInputAndResult';
import { globalInputHeight } from '../../../../../config/uiConfig';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import {
  formatFileSize,
  getAcceptedExtensions,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocument
} from '../document';
import { isAbortError, translateDocument } from '../service';
import { LibreServerSettings, TranslatorConfig } from '../types';
import DocumentDropzone from './DocumentDropzone';
import LanguageBar, { LanguageBarProps } from './LanguageBar';
import TranslatorErrorAlert from './TranslatorErrorAlert';

export interface DocumentTranslatorProps {
  config: TranslatorConfig;
  settings: LibreServerSettings | null;
  languageBarProps: LanguageBarProps;
  disabled?: boolean;
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after the click has been handled; revoking synchronously can
  // cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function DocumentTranslator({
  config,
  settings,
  languageBarProps,
  disabled
}: DocumentTranslatorProps) {
  const { t } = useTranslation('string');
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filesDisabled = settings?.filesTranslation === false;
  const acceptedExtensions = getAcceptedExtensions(settings);
  const isDisabled = disabled || filesDisabled;

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSelect = (selected: File | null) => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    try {
      validateDocument(selected, acceptedExtensions);
      setFile(selected);
    } catch (err) {
      setError(err);
    }
  };

  const handleTranslate = async () => {
    if (!file || loading || isDisabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const translated = await translateDocument(
        config,
        {
          file,
          source: languageBarProps.source,
          target: languageBarProps.target
        },
        controller.signal
      );
      setResult(translated);
      showSnackBar(t('translator.documentTranslated'), 'success');
    } catch (err) {
      if (!isAbortError(err)) setError(err);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const formatsHint = t('translator.supportedFormats', {
    formats: acceptedExtensions.map((ext) => ext.toUpperCase()).join(', '),
    size: formatFileSize(MAX_DOCUMENT_SIZE_BYTES)
  });

  return (
    <Box>
      {filesDisabled && (
        <Alert severity="warning" role="status" sx={{ mb: 2 }}>
          {t('translator.filesDisabledOnServer')}
        </Alert>
      )}
      <LanguageBar {...languageBarProps} disabled={isDisabled || loading} />
      <ToolInputAndResult
        input={
          <DocumentDropzone
            title={t('translator.documentInputTitle')}
            file={file}
            acceptedExtensions={acceptedExtensions}
            hint={formatsHint}
            onSelect={handleSelect}
            disabled={isDisabled || loading}
          />
        }
        result={
          <Box>
            <InputHeader title={t('translator.documentResultTitle')} />
            <Box
              role="status"
              aria-live="polite"
              sx={{
                width: '100%',
                height: globalInputHeight,
                borderRadius: 2,
                boxShadow: '5',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1,
                p: 3
              }}
            >
              {loading ? (
                <>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t('translator.translatingDocument')}
                  </Typography>
                </>
              ) : result ? (
                <>
                  <TaskOutlinedIcon color="success" sx={{ fontSize: 56 }} />
                  <Typography
                    fontWeight={600}
                    sx={{ wordBreak: 'break-all' }}
                    data-testid="translator-result-file"
                  >
                    {result.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(result.size)}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  {t('translator.documentResultEmpty')}
                </Typography>
              )}
            </Box>
            <ResultFooter
              disabled={!result || loading}
              hideCopy
              downloadLabel={t('translator.downloadDocument')}
              handleDownload={() => result && downloadFile(result)}
            />
          </Box>
        }
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} mt={3}>
        <Button
          variant="contained"
          size="large"
          onClick={handleTranslate}
          disabled={!file || loading || isDisabled}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <TranslateIcon />
            )
          }
        >
          {loading
            ? t('translator.translating')
            : t('translator.translateDocument')}
        </Button>
      </Stack>
      <TranslatorErrorAlert error={error} onClose={() => setError(null)} />
    </Box>
  );
}
