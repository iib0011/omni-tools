import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import React, { useState } from 'react';
import { availableCurrencies, getCurrency, getFlag } from './currencies';
import { ConversionRow } from './types';

export default function ConversionList({
  rows,
  targets,
  from,
  includeCrypto,
  showFlags,
  activeChartCode,
  onChange,
  onShowHistory
}: {
  rows: ConversionRow[];
  targets: string[];
  from: string;
  includeCrypto: boolean;
  showFlags: boolean;
  activeChartCode: string | null;
  onChange: (targets: string[]) => void;
  onShowHistory: (code: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const drop = (to: number) => {
    if (dragIndex === null || dragIndex === to) return;
    const next = [...targets];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const addable = availableCurrencies(includeCrypto).filter(
    (c) => c.code !== from && !targets.includes(c.code)
  );

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {targets.map((code, index) => {
        const info = getCurrency(code);
        const row = rows.find((r) => r.code === code);
        const amount = row?.amount;
        const unavailable = row?.unavailable;
        return (
          <Box
            key={code}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={() => {
              drop(index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1,
              py: 0.5,
              minHeight: 56,
              boxSizing: 'border-box',
              borderRadius: 1,
              backgroundColor: 'background.paper',
              border: 1,
              borderColor:
                overIndex === index && dragIndex !== index
                  ? 'primary.main'
                  : 'divider',
              opacity: dragIndex === index ? 0.5 : 1
            }}
          >
            <DragIndicatorIcon
              fontSize="small"
              sx={{ cursor: 'grab', color: 'text.secondary' }}
            />
            {showFlags && (
              <Typography fontSize={24} lineHeight={1}>
                {getFlag(code)}
              </Typography>
            )}
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={600}>{code}</Typography>
              <Typography fontSize={12} color="text.secondary" noWrap>
                {info.name}
              </Typography>
            </Box>
            <Typography
              fontSize={20}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {amount || (unavailable ? 'n/a' : '—')}
            </Typography>
            <IconButton
              size="small"
              color={activeChartCode === code ? 'primary' : 'default'}
              aria-label={`Show ${from} to ${code} rate history`}
              onClick={() => onShowHistory(code)}
            >
              <ShowChartIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={`Remove ${code}`}
              onClick={() => onChange(targets.filter((c) => c !== code))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}

      <Select
        size="small"
        displayEmpty
        value=""
        disabled={addable.length === 0}
        onChange={(e) =>
          e.target.value && onChange([...targets, e.target.value])
        }
        renderValue={() => '+ Add currency'}
        sx={{ backgroundColor: 'background.paper', alignSelf: 'flex-start' }}
      >
        {addable.map((c) => (
          <MenuItem key={c.code} value={c.code}>
            {showFlags ? `${getFlag(c.code)} ` : ''}
            {c.code} – {c.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
