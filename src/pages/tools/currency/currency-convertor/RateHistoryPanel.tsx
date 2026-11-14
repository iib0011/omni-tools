import {
  Box,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import React, { useEffect, useState } from 'react';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { availableCurrencies, getFlag } from './currencies';
import { getRateHistory } from './service';
import { HistoryRange, RatePoint } from './types';

const RANGES: HistoryRange[] = ['1W', '1M', '3M', '1Y', '5Y', 'MAX'];

// Axis/readout numbers: enough digits for BTC-sized rates, short for large ones
const fmt = (v: number) =>
  new Intl.NumberFormat('en', { maximumSignificantDigits: 6 }).format(v);

const W = 800;
const H = 300;
const PAD = { left: 64, right: 16, top: 16, bottom: 28 };

function Chart({
  points,
  type
}: {
  points: RatePoint[];
  type: 'line' | 'candles';
}) {
  const theme = useTheme();
  const [hover, setHover] = useState<number | null>(null);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const lows = points.map((p) => (type === 'line' ? p.close : p.low));
  const highs = points.map((p) => (type === 'line' ? p.close : p.high));
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;

  const x = (i: number) =>
    PAD.left +
    (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - ((v - min) / span) * innerH;
  const candleW = Math.max(2, Math.min(14, (innerW / points.length) * 0.6));

  const ticks = [min, min + span / 2, max];
  const axis = theme.palette.text.secondary;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * W;
        const ratio = (px - PAD.left) / innerW;
        const i = Math.round(ratio * (points.length - 1));
        setHover(Math.min(points.length - 1, Math.max(0, i)));
      }}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke={theme.palette.divider}
          />
          <text
            x={PAD.left - 8}
            y={y(t) + 4}
            textAnchor="end"
            fontSize="11"
            fill={axis}
          >
            {fmt(t)}
          </text>
        </g>
      ))}
      <text x={PAD.left} y={H - 8} fontSize="11" fill={axis}>
        {points[0].time}
      </text>
      {points.length > 2 && (
        <text
          x={PAD.left + innerW / 2}
          y={H - 8}
          fontSize="11"
          fill={axis}
          textAnchor="middle"
        >
          {points[Math.floor((points.length - 1) / 2)].time}
        </text>
      )}
      <text
        x={W - PAD.right}
        y={H - 8}
        fontSize="11"
        fill={axis}
        textAnchor="end"
      >
        {points[points.length - 1].time}
      </text>

      {type === 'line' ? (
        <polyline
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth="2"
          points={points.map((p, i) => `${x(i)},${y(p.close)}`).join(' ')}
        />
      ) : (
        points.map((p, i) => {
          const up = p.close >= p.open;
          const color = up
            ? theme.palette.success.main
            : theme.palette.error.main;
          return (
            <g key={p.time + i}>
              <line
                x1={x(i)}
                x2={x(i)}
                y1={y(p.high)}
                y2={y(p.low)}
                stroke={color}
              />
              <rect
                x={x(i) - candleW / 2}
                y={Math.min(y(p.open), y(p.close))}
                width={candleW}
                height={Math.max(1, Math.abs(y(p.open) - y(p.close)))}
                fill={color}
              />
            </g>
          );
        })
      )}

      {hover !== null && (
        <g pointerEvents="none">
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke={axis}
            strokeDasharray="4 3"
          />
          <text
            x={PAD.left + 8}
            y={PAD.top + 14}
            fontSize="12"
            fill={theme.palette.text.primary}
          >
            {points[hover].time}
            {'  '}
            {type === 'line'
              ? fmt(points[hover].close)
              : `O ${fmt(points[hover].open)}  H ${fmt(
                  points[hover].high
                )}  L ${fmt(points[hover].low)}  C ${fmt(points[hover].close)}`}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function RateHistoryPanel({
  from: initialFrom,
  to: initialTo,
  includeCrypto,
  showFlags,
  onClose
}: {
  from: string;
  to: string;
  includeCrypto: boolean;
  showFlags: boolean;
  onClose: () => void;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [range, setRange] = useState<HistoryRange>('1M');
  const [type, setType] = useState<'line' | 'candles'>('line');
  const [points, setPoints] = useState<RatePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sameCurrency = from === to;

  useEffect(() => {
    // The rate between a currency and itself is always 1: nothing to chart
    if (sameCurrency) {
      setPoints([]);
      setError('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    getRateHistory(from, to, range)
      .then((data) => !cancelled && setPoints(data))
      .catch((e) => {
        if (cancelled) return;
        setPoints([]);
        setError(e instanceof Error ? e.message : 'Could not load history');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [from, to, range, sameCurrency]);

  const options = availableCurrencies(includeCrypto).map((c) => ({
    label: `${showFlags ? getFlag(c.code) + ' ' : ''}${c.code}`,
    value: c.code
  }));

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.lightSecondary',
        boxShadow: '2'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography fontSize={22}>Rate history</Typography>
        <IconButton aria-label="Close rate history" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="flex-start"
        gap={2}
        mt={1}
        sx={{ '& .MuiSelect-select': { minWidth: 96 } }}
      >
        <SelectWithDesc
          selected={from}
          options={options}
          onChange={setFrom}
          description="From currency"
        />
        <IconButton
          aria-label="Swap currencies"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          sx={{ mt: 0.5 }}
        >
          <SwapHorizIcon />
        </IconButton>
        <SelectWithDesc
          selected={to}
          options={options}
          onChange={setTo}
          description="To currency"
        />
        <Box flex={1} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={range}
          onChange={(_, v) => v && setRange(v)}
        >
          {RANGES.map((r) => (
            <ToggleButton key={r} value={r}>
              {r}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={type}
          onChange={(_, v) => v && setType(v)}
        >
          <ToggleButton value="line">Line</ToggleButton>
          <ToggleButton value="candles">Candles</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        mt={1}
        minHeight={200}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
      >
        {loading ? (
          <Box textAlign="center" p={2}>
            <CircularProgress size={28} />
            {(range === '5Y' || range === 'MAX') && (
              <Typography fontSize={12} color="text.secondary" mt={1}>
                Long ranges can take a few seconds to load
              </Typography>
            )}
          </Box>
        ) : points.length === 0 ? (
          <Typography
            color={error && !sameCurrency ? 'error' : 'text.secondary'}
            p={2}
          >
            {sameCurrency
              ? `${from} to ${from} is always 1. Choose two different currencies to see a rate history.`
              : error || `No rate history available for ${from} → ${to}`}
          </Typography>
        ) : (
          <Box width="100%" p={1}>
            <Chart points={points} type={type} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
