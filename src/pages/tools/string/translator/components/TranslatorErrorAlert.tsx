import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TranslatorError } from '../errors';

/** Localized, accessible error message for a translator failure. */
export default function TranslatorErrorAlert({
  error,
  onClose
}: {
  error: unknown;
  onClose?: () => void;
}) {
  const { t } = useTranslation('string');
  if (!error) return null;

  const code = error instanceof TranslatorError ? error.code : 'serverError';
  const details = error instanceof TranslatorError ? error.details : undefined;
  // For this code the details carry the character count used in the message.
  const isCount = code === 'documentTooLongForOnline';

  return (
    <Alert severity="error" role="alert" onClose={onClose} sx={{ mt: 2 }}>
      {t(`translator.errors.${code}`, { count: Number(details) || 0 })}
      {details && !isCount && (
        <>
          <br />
          {t('translator.errorDetails', { message: details })}
        </>
      )}
    </Alert>
  );
}
