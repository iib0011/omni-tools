import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

export default function InputFooter({
  handleImport,
  handleCopy,
  handleClear
}: {
  handleImport: () => void;
  handleCopy?: () => void;
  handleClear?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button onClick={handleImport} startIcon={<PublishIcon />}>
        {t('inputFooter.importFromFile')}
      </Button>
      {handleCopy && (
        <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
          {t('inputFooter.copyToClipboard')}
        </Button>
      )}
      {handleClear && (
        <Button onClick={handleClear} startIcon={<ClearIcon />}>
          {t('inputFooter.clear')}
        </Button>
      )}
    </Stack>
  );
}
