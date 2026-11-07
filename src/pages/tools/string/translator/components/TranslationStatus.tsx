import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import { useTranslation } from 'react-i18next';
import { TranslationEngine, TranslationProgress } from '../types';

/** Progress of a running translation (model download or segments). */
export function TranslationProgressInfo({
  progress
}: {
  progress: TranslationProgress | null;
}) {
  const { t } = useTranslation('string');
  if (!progress) {
    return (
      <Typography variant="body2" sx={{ mt: 2 }}>
        {t('translator.translating')}
      </Typography>
    );
  }
  const value =
    progress.phase === 'downloading'
      ? progress.loaded * 100
      : progress.total
        ? (progress.done / progress.total) * 100
        : 0;
  const label =
    progress.phase === 'downloading'
      ? t('translator.downloadingModel', { percent: Math.round(value) })
      : t('translator.translatingProgress', {
          done: progress.done,
          total: progress.total
        });

  return (
    <Box sx={{ width: '80%', maxWidth: 360, mt: 2 }}>
      <LinearProgress variant="determinate" value={value} aria-label={label} />
      <Typography variant="body2" sx={{ mt: 1 }} textAlign="center">
        {label}
      </Typography>
    </Box>
  );
}

/** Tells the user where the last translation was produced. */
export function EngineLabel({ engine }: { engine: TranslationEngine | null }) {
  const { t } = useTranslation('string');
  if (!engine) return null;
  const onDevice = engine === 'browser';
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      color="text.secondary"
      data-testid="translator-engine"
    >
      {onDevice ? (
        <ComputerIcon fontSize="inherit" />
      ) : (
        <CloudOutlinedIcon fontSize="inherit" />
      )}
      <Typography variant="body2">
        {onDevice
          ? t('translator.engineBrowser')
          : t('translator.engineMyMemory')}
      </Typography>
    </Stack>
  );
}
