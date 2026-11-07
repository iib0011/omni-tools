import { FormEvent, useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import { TranslatorConfig } from '../types';
import TranslatorErrorAlert from './TranslatorErrorAlert';

export interface ServerSettingsProps {
  config: TranslatorConfig;
  onConnect: (config: TranslatorConfig) => void;
  loading: boolean;
  connectedHost: string | null;
  languageCount: number;
  keyRequired: boolean;
  error: unknown;
}

export default function ServerSettings({
  config,
  onConnect,
  loading,
  connectedHost,
  languageCount,
  keyRequired,
  error
}: ServerSettingsProps) {
  const { t } = useTranslation('string');
  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);

  useEffect(() => {
    setServerUrl(config.serverUrl);
    setApiKey(config.apiKey);
  }, [config]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConnect({ serverUrl: serverUrl.trim(), apiKey: apiKey.trim() });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      aria-label={t('translator.serverSettings')}
      sx={{
        mb: 3,
        borderRadius: 2,
        padding: 2,
        backgroundColor: 'background.lightSecondary',
        boxShadow: '2'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <DnsOutlinedIcon />
        <Typography fontSize={22}>{t('translator.serverSettings')}</Typography>
      </Stack>
      {!config.serverUrl && (
        <Typography variant="body2" mb={2}>
          {t('translator.notConfigured')}
        </Typography>
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
      >
        <TextField
          label={t('translator.serverUrl')}
          placeholder={t('translator.serverUrlPlaceholder')}
          helperText={t('translator.serverUrlHelp')}
          value={serverUrl}
          onChange={(event) => setServerUrl(event.target.value)}
          type="url"
          size="small"
          fullWidth
          sx={{
            flex: 2,
            '& .MuiInputBase-root': { bgcolor: 'background.paper' }
          }}
          inputProps={{ 'data-testid': 'translator-server-url' }}
        />
        <TextField
          label={t('translator.apiKey')}
          helperText={t('translator.apiKeyHelp')}
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          type="password"
          autoComplete="off"
          size="small"
          fullWidth
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { bgcolor: 'background.paper' }
          }}
          inputProps={{ 'data-testid': 'translator-api-key' }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !serverUrl.trim()}
          sx={{ whiteSpace: 'nowrap', minWidth: 120, height: 40 }}
        >
          {loading ? t('translator.connecting') : t('translator.connect')}
        </Button>
      </Stack>
      {connectedHost && !error && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mt={2}
          color="success.main"
          role="status"
        >
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">
            {t('translator.connected', {
              server: connectedHost,
              count: languageCount
            })}
            {keyRequired && !config.apiKey && (
              <> · {t('translator.keyRequiredNotice')}</>
            )}
          </Typography>
        </Stack>
      )}
      <TranslatorErrorAlert error={error} />
    </Box>
  );
}
