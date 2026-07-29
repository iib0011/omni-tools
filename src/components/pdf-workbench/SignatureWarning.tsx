import { Alert, AlertTitle } from '@mui/material';

export default function SignatureWarning({
  title,
  message,
  fieldNames
}: {
  title: string;
  message: string;
  fieldNames: string[];
}) {
  return (
    <Alert severity="warning">
      <AlertTitle>{title}</AlertTitle>
      {message}
      {fieldNames.length > 0 ? ` (${fieldNames.join(', ')})` : ''}
    </Alert>
  );
}
