import { Alert, Box, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import InputHeader from '@components/InputHeader';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ConversionList from './ConversionList';
import RateHistoryPanel from './RateHistoryPanel';
import { availableCurrencies, getFlag, useCurrencies } from './currencies';
import { ConversionRow, InitialValuesType } from './types';

/**
 * Top section of the tool: amount + source currency on the left, the converted
 * list on the right, and the rate-history panel underneath (full width).
 */
export default function CurrencyWorkspace({
  values,
  setFieldValue,
  input,
  setInput,
  rows,
  loading,
  error
}: {
  values: InitialValuesType;
  setFieldValue: (field: string, value: any) => void;
  input: string;
  setInput: (value: string) => void;
  rows: ConversionRow[];
  loading: boolean;
  error: string;
}) {
  const [chartTo, setChartTo] = useState<string | null>(null);
  // Re-renders this component (and its children) once the list has loaded
  useCurrencies();

  const rateRows = rows.filter((r) => r.rate);

  const fromOptions = availableCurrencies(values.includeCrypto).map((c) => ({
    label: `${values.showFlags ? getFlag(c.code) + ' ' : ''}${c.code}`,
    value: c.code
  }));

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <InputHeader title="Amount" />
          <Box
            display="flex"
            gap={2}
            alignItems="flex-start"
            sx={{ '& .MuiSelect-select': { minWidth: 96 } }}
          >
            <Box flex={1}>
              <TextFieldWithDesc
                fullWidth
                type="number"
                value={input}
                onOwnChange={setInput}
                placeholder="Enter an amount, e.g. 100"
                inputProps={{ min: 0, step: 'any' }}
                description={
                  values.historical && values.date
                    ? `Amount, at the rates of ${values.date}`
                    : 'Amount to convert'
                }
              />
            </Box>
            <SelectWithDesc
              selected={values.from}
              options={fromOptions}
              onChange={(value) => setFieldValue('from', value)}
              description="From currency"
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Typography fontSize={12} color="text.secondary">
              Exchange rate
            </Typography>
            {rateRows.length === 0 ? (
              <Typography color="text.secondary">
                {loading
                  ? 'Loading rates…'
                  : 'Rates appear here once available'}
              </Typography>
            ) : (
              rateRows.map((r) => (
                <Typography key={r.code} fontSize={18}>
                  1 {values.from} = {r.rate} {r.code}
                </Typography>
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <InputHeader title="Converted amount" />
          <ConversionList
            rows={rows}
            targets={values.targets}
            from={values.from}
            includeCrypto={values.includeCrypto}
            showFlags={values.showFlags}
            activeChartCode={chartTo}
            onChange={(targets) => setFieldValue('targets', targets)}
            onShowHistory={(code) =>
              setChartTo((current) => (current === code ? null : code))
            }
          />
          {error && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Grid>
      </Grid>

      {chartTo && (
        <RateHistoryPanel
          key={`${values.from}-${chartTo}`}
          from={values.from}
          to={chartTo}
          includeCrypto={values.includeCrypto}
          showFlags={values.showFlags}
          onClose={() => setChartTo(null)}
        />
      )}
    </Box>
  );
}
