import { Button, Stack } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

export default function WorkbenchActions({
  running,
  runLabel,
  cancelLabel,
  onRun,
  onCancel,
  runDisabled = false
}: {
  running: boolean;
  runLabel: string;
  cancelLabel: string;
  onRun: () => void;
  onCancel: () => void;
  runDisabled?: boolean;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Button
        variant="contained"
        size="large"
        disabled={running || runDisabled}
        startIcon={<PlayArrowRoundedIcon />}
        onClick={onRun}
      >
        {runLabel}
      </Button>
      {running && (
        <Button
          variant="outlined"
          color="error"
          size="large"
          startIcon={<CancelOutlinedIcon />}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      )}
    </Stack>
  );
}
