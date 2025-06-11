import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';
import i18n from 'i18n/i18n';

export default function InputFooter({
  handleImport,
  handleCopy,
  handleClear
}: {
  handleImport: () => void;
  handleCopy?: () => void;
  handleClear?: () => void;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button onClick={handleImport} startIcon={<PublishIcon />}>
        {i18n.t('importFromFile')}
      </Button>
      {handleCopy && (
        <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
          {i18n.t('copyToClipboard')}
        </Button>
      )}
      {handleClear && (
        <Button onClick={handleClear} startIcon={<ClearIcon />}>
          {i18n.t('clear')}
        </Button>
      )}
    </Stack>
  );
}
