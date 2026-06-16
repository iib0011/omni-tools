import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  Tabs,
  Tab,
  TextField,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import {
  parseColor,
  getComplementaryColors,
  getWcagResult,
  getExportSnippets
} from './service';
import {
  ColorFormats,
  ComplementaryColor,
  ExportSnippets,
  InitialValuesType,
  WcagResult
} from './types';

const initialValues: InitialValuesType = { exportName: 'primary' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
      <IconButton size="small" onClick={handle}>
        <ContentCopyIcon
          sx={{
            fontSize: 14,
            color: copied ? 'success.main' : 'text.disabled'
          }}
        />
      </IconButton>
    </Tooltip>
  );
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      py={0.75}
      px={1.5}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 }
      }}
    >
      <Typography
        fontSize={12}
        fontWeight={600}
        color="text.secondary"
        width={60}
      >
        {label}
      </Typography>
      <Typography fontSize={13} fontFamily="monospace" flex={1} mx={1}>
        {value}
      </Typography>
      <CopyButton value={value} />
    </Box>
  );
}

// ─── Formats panel ───────────────────────────────────────────────────────────

function FormatsPanel({ formats }: { formats: ColorFormats }) {
  const { hex, rgb, hsl, hsv, oklch } = formats;
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <FormatRow label="HEX" value={hex} />
      <FormatRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
      <FormatRow label="HSL" value={`hsl(${hsl.h}deg, ${hsl.s}%, ${hsl.l}%)`} />
      <FormatRow label="HSV" value={`hsv(${hsv.h}deg, ${hsv.s}%, ${hsv.v}%)`} />
      <FormatRow
        label="OKLCH"
        value={`oklch(${oklch.l} ${oklch.c} ${oklch.h}deg)`}
      />
    </Paper>
  );
}

// ─── Complementary palette ───────────────────────────────────────────────────

function ComplementaryPalette({
  base,
  colors
}: {
  base: string;
  colors: ComplementaryColor[];
}) {
  return (
    <Box>
      <Typography fontSize={13} fontWeight={600} mb={1} color="text.secondary">
        Complementary palette
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {[{ hex: base }, ...colors].map((c, i) => (
          <Tooltip key={i} title={c.hex}>
            <Box
              onClick={() => navigator.clipboard.writeText(c.hex)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: c.hex,
                border: i === 0 ? '2px solid' : '1px solid',
                borderColor: i === 0 ? 'primary.main' : 'divider',
                cursor: 'pointer',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.15)' }
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

// ─── WCAG contrast ──────────────────────────────────────────────────────────

const levelColors: Record<string, 'success' | 'warning' | 'error' | 'default'> =
  {
    AAA: 'success',
    AA: 'success',
    'AA Large': 'warning',
    Fail: 'error'
  };

function WcagPanel({ result, hex }: { result: WcagResult; hex: string }) {
  return (
    <Box>
      <Typography fontSize={13} fontWeight={600} mb={1} color="text.secondary">
        WCAG contrast
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            flex: 1,
            minWidth: 120,
            backgroundColor: '#ffffff'
          }}
        >
          <Typography fontSize={12} color="text.secondary" mb={0.5}>
            On white
          </Typography>
          <Typography fontSize={20} fontWeight={700} color={hex}>
            Aa
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Chip
              label={result.onWhite}
              size="small"
              color={levelColors[result.onWhite]}
            />
            <Typography fontSize={11} color="text.secondary">
              {result.ratio}:1
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            flex: 1,
            minWidth: 120,
            backgroundColor: '#000000'
          }}
        >
          <Typography fontSize={12} color="grey.400" mb={0.5}>
            On black
          </Typography>
          <Typography fontSize={20} fontWeight={700} color={hex}>
            Aa
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Chip
              label={result.onBlack}
              size="small"
              color={levelColors[result.onBlack]}
            />
            <Typography fontSize={11} color="grey.400">
              {result.ratio}:1
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// ─── Export snippets ──────────────────────────────────────────────────────────

function ExportPanel({ snippets }: { snippets: ExportSnippets }) {
  const [tab, setTab] = useState(0);
  const entries: { label: string; value: string }[] = [
    { label: 'CSS', value: snippets.css },
    { label: 'Tailwind', value: snippets.tailwind },
    { label: 'SCSS', value: snippets.scss }
  ];
  const current = entries[tab];

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={0.5}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ minHeight: 32 }}
          TabIndicatorProps={{ style: { height: 2 } }}
        >
          {entries.map((e) => (
            <Tab
              key={e.label}
              label={e.label}
              sx={{ minHeight: 32, fontSize: 12, textTransform: 'none', py: 0 }}
            />
          ))}
        </Tabs>
        <CopyButton value={current.value} />
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            fontSize: 12,
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {current.value}
        </Box>
      </Paper>
    </Box>
  );
}

// ─── Full result panel ───────────────────────────────────────────────────────

function ColorResult({ hex, exportName }: { hex: string; exportName: string }) {
  const formats = parseColor(hex);
  if (!formats) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Invalid color. Use HEX format: #fff or #ffffff
      </Alert>
    );
  }

  const complementary = getComplementaryColors(hex);
  const wcag = getWcagResult(hex);
  const snippets = getExportSnippets(hex, exportName, formats);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* preview + formats */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              height: '100%',
              minHeight: 120,
              borderRadius: 2,
              backgroundColor: hex,
              border: 1,
              borderColor: 'divider'
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <FormatsPanel formats={formats} />
        </Grid>
      </Grid>

      <ComplementaryPalette base={hex} colors={complementary} />

      {wcag && <WcagPanel result={wcag} hex={hex} />}

      <ExportPanel snippets={snippets} />
    </Box>
  );
}

// ─── Main tool ───────────────────────────────────────────────────────────────

export default function ColorConverter({ title }: ToolComponentProps) {
  const { t } = useTranslation('converters');
  const [hex, setHex] = useState('#3b82f6');
  const [result, setResult] = useState<string>('#3b82f6');
  const [exportName, setExportName] = useState('primary');

  const compute = useCallback((values: InitialValuesType, inputHex: string) => {
    setExportName(values.exportName);
    setResult(inputHex);
  }, []);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('colorConverter.optionsTitle' as any),
      component: (
        <TextFieldWithDesc
          value={values.exportName}
          onOwnChange={(val) => updateField('exportName', val)}
          description={t('colorConverter.exportNameDescription' as any)}
        />
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={hex}
      setInput={setHex}
      inputComponent={
        <Box>
          <Typography
            fontSize={13}
            fontWeight={600}
            mb={1}
            color="text.secondary"
          >
            {t('colorConverter.inputTitle' as any)}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <input
              type="color"
              value={result.length === 7 ? result : '#3b82f6'}
              onChange={(e) => setHex(e.target.value)}
              style={{
                width: 48,
                height: 48,
                padding: 2,
                borderRadius: 8,
                border: '1px solid',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
            <TextField
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              size="small"
              placeholder="#3b82f6"
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 14 } }}
              sx={{ width: 160 }}
            />
          </Box>
        </Box>
      }
      resultComponent={<ColorResult hex={result} exportName={exportName} />}
    />
  );
}
