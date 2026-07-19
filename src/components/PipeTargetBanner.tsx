import React, { useEffect } from 'react';
import { Alert, AlertTitle, Button, Typography } from '@mui/material';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import { usePipeReceive } from '../hooks/usePipeTarget';
import { useTranslation } from 'react-i18next';

interface PipeTargetBannerProps {
  /** called with the received value when the user accepts */
  onAccept: (value: string) => void;
}

export default function PipeTargetBanner({ onAccept }: PipeTargetBannerProps) {
  const { payload, consume } = usePipeReceive();
  const { t } = useTranslation();

  // Clear the payload on unmount so it does not leak to other tools
  useEffect(() => {
    return () => {
      if (payload) consume();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!payload) return null;

  function handleAccept() {
    if (!payload) return;
    onAccept(payload.value);
    consume();
  }

  function handleDismiss() {
    consume();
  }

  const preview =
    payload.value.length > 80
      ? payload.value.slice(0, 80) + '…'
      : payload.value;

  return (
    <Alert
      severity="info"
      icon={<CallMergeIcon fontSize="small" />}
      sx={{ mb: 2 }}
      action={
        <>
          <Button
            size="small"
            variant="contained"
            onClick={handleAccept}
            sx={{ mr: 1, fontSize: 12 }}
          >
            {t('translation:pipe.accept', 'Use this')}
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleDismiss}
            sx={{ fontSize: 12 }}
          >
            {t('translation:pipe.dismiss', 'Dismiss')}
          </Button>
        </>
      }
    >
      <AlertTitle sx={{ fontSize: 13, mb: 0.3 }}>
        {t('translation:pipe.bannerTitle', 'Result from {{source}}', {
          source: payload.sourceLabel
        })}
      </AlertTitle>
      <Typography
        fontSize={12}
        color="text.secondary"
        fontFamily="monospace"
        sx={{ wordBreak: 'break-all' }}
      >
        {preview}
      </Typography>
    </Alert>
  );
}