import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';

export default function InputFooter({
  handleImport,
  handleCopy,
  handleClear
}: {
  handleImport?: () => void;
  handleCopy?: () => void;
  handleClear?: () => void;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      {handleImport && (
        <Button onClick={handleImport} startIcon={<PublishIcon />}>
          Import from file
        </Button>
      )}

      {handleCopy && (
        <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
          Copy to clipboard
        </Button>
      )}
      {handleClear && (
        <Button onClick={handleClear} startIcon={<ClearIcon />}>
          Clear
        </Button>
      )}
    </Stack>
  );
}
