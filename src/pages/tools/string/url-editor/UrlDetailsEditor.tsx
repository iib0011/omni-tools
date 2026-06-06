import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { ParsedUrl } from './types';

const PROTOCOLS = ['https:', 'http:'] as const;

export type UrlDetailField = keyof Omit<ParsedUrl, 'params'>;

type UrlDetailsEditorProps = {
  value: ParsedUrl;
  onChange: (field: UrlDetailField, value: string) => void;
  labels: {
    protocol: string;
    host: string;
    path: string;
    hash: string;
    hostPlaceholder: string;
    pathPlaceholder: string;
    hashPlaceholder: string;
  };
};

export default function UrlDetailsEditor({
  value,
  onChange,
  labels
}: UrlDetailsEditorProps) {
  const hashValue = value.hash.replace(/^#/, '');

  return (
    <Box
      sx={{
        border: 1,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="url-editor-protocol">{labels.protocol}</InputLabel>
            <Select
              labelId="url-editor-protocol"
              label={labels.protocol}
              value={
                PROTOCOLS.includes(value.protocol as (typeof PROTOCOLS)[number])
                  ? value.protocol
                  : 'https:'
              }
              onChange={(event) => onChange('protocol', event.target.value)}
            >
              {PROTOCOLS.map((protocol) => (
                <MenuItem key={protocol} value={protocol}>
                  {protocol.replace(':', '')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={8} md={9}>
          <TextField
            size="small"
            fullWidth
            label={labels.host}
            placeholder={labels.hostPlaceholder}
            value={value.host}
            onChange={(event) => onChange('host', event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">://</InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            size="small"
            fullWidth
            label={labels.path}
            placeholder={labels.pathPlaceholder}
            value={value.pathname.replace(/^\//, '')}
            onChange={(event) => {
              const next = event.target.value.replace(/^\//, '');
              onChange('pathname', next ? `/${next}` : '/');
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">/</InputAdornment>
              )
            }}
            inputProps={{ sx: { pl: 0.5 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            size="small"
            fullWidth
            label={labels.hash}
            placeholder={labels.hashPlaceholder}
            value={hashValue}
            onChange={(event) => {
              const next = event.target.value.replace(/^#/, '');
              onChange('hash', next ? `#${next}` : '');
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">#</InputAdornment>
              )
            }}
            inputProps={{ sx: { pl: 0.5 } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
