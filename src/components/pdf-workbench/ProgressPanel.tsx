import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import type { WorkbenchProgress } from '../../lib/pdf-workbench/protocol';

export default function ProgressPanel({
  progress,
  stageLabel,
  pageLabel
}: {
  progress: WorkbenchProgress;
  stageLabel: string;
  pageLabel: (page: number) => string;
}) {
  const value =
    progress.total > 0
      ? Math.min(100, (progress.completed / progress.total) * 100)
      : 0;

  return (
    <Stack spacing={1} role="status" aria-live="polite">
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Typography variant="body2">
          {stageLabel}: {progress.message ?? progress.stage}
          {progress.pageNumber ? ` — ${pageLabel(progress.pageNumber)}` : ''}
        </Typography>
        <Typography variant="body2">
          {progress.completed}/{progress.total}
        </Typography>
      </Stack>
      <Box>
        <LinearProgress variant="determinate" value={value} />
      </Box>
    </Stack>
  );
}
