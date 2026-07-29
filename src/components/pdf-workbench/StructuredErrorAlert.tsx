import { Alert, AlertTitle } from '@mui/material';
import type { WorkbenchError } from '../../lib/pdf-workbench/errors';

export default function StructuredErrorAlert({
  error,
  title
}: {
  error: WorkbenchError;
  title: string;
}) {
  return (
    <Alert severity={error.code === 'cancelled' ? 'info' : 'error'}>
      <AlertTitle>{title}</AlertTitle>
      {error.message}
      {error.pageNumber ? ` (page ${error.pageNumber})` : ''}
      {error.details ? ` — ${error.details}` : ''}
    </Alert>
  );
}
