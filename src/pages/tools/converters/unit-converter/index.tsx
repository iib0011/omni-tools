import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { convertUnit, unitsByCategory } from './service';
import { ConversionResult, InitialValuesType, UnitCategory } from './types';

const CATEGORIES: { label: string; value: UnitCategory }[] = [
  { label: 'Length', value: 'length' },
  { label: 'Weight', value: 'weight' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Speed', value: 'speed' },
  { label: 'Area', value: 'area' },
  { label: 'Volume', value: 'volume' }
];

const initialValues: InitialValuesType = {
  category: 'length',
  fromUnit: 'm',
  precision: 4
};

// ─── Tabela de resultados ─────────────────────────────────────────────────────

function ResultsTable({
  results,
  inputValue,
  fromSymbol
}: {
  results: ConversionResult[];
  inputValue: string;
  fromSymbol: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  if (!inputValue || isNaN(Number(inputValue))) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={300}
        sx={{ border: 1, borderRadius: 2, borderColor: 'divider' }}
      >
        <Typography color="text.secondary" fontSize={14}>
          Enter a numeric value to see conversions.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2, maxHeight: 420 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Result</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
              Formula
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((row) => {
            const valueStr = String(row.value);
            const isCopied = copied === valueStr;
            return (
              <TableRow
                key={row.unit.symbol}
                sx={{ '&:last-child td': { border: 0 } }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={row.unit.symbol}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    />
                    <Typography fontSize={13} color="text.secondary">
                      {row.unit.label}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    fontFamily="monospace"
                  >
                    {row.value}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    fontSize={12}
                    color="text.secondary"
                    fontFamily="monospace"
                  >
                    {row.formula}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Tooltip title={isCopied ? 'Copied!' : 'Copy value'}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(valueStr)}
                    >
                      <ContentCopyIcon
                        sx={{
                          fontSize: 15,
                          color: isCopied ? 'success.main' : 'text.disabled'
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Tool principal ───────────────────────────────────────────────────────────

export default function UnitConverter({ title }: ToolComponentProps) {
  const { t } = useTranslation('converters');
  const [input, setInput] = useState('1');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [currentOptions, setCurrentOptions] =
    useState<InitialValuesType>(initialValues);

  const compute = (values: InitialValuesType, inputValue: string) => {
    setCurrentOptions(values);
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setResults([]);
      return;
    }
    setResults(
      convertUnit(num, values.category, values.fromUnit, values.precision)
    );
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    const unitsForCategory = unitsByCategory[values.category].map((u) => ({
      label: `${u.symbol} — ${u.label}`,
      value: u.symbol
    }));

    // quando a categoria muda, reset fromUnit para a primeira unidade disponível
    const handleCategoryChange = (cat: UnitCategory) => {
      const firstUnit = unitsByCategory[cat][0].symbol;
      updateField('category', cat);
      updateField('fromUnit', firstUnit);
    };

    return [
      {
        title: t('unitConverter.categoryTitle'),
        component: (
          <Box>
            <SelectWithDesc
              selected={values.category}
              options={CATEGORIES}
              onChange={(val) => handleCategoryChange(val as UnitCategory)}
              description={t('unitConverter.categoryDescription')}
            />
            <SelectWithDesc
              selected={values.fromUnit}
              options={unitsForCategory}
              onChange={(val) => updateField('fromUnit', val)}
              description={t('unitConverter.fromUnitDescription')}
            />
            <TextFieldWithDesc
              value={values.precision}
              onOwnChange={(val) => updateField('precision', Number(val))}
              description={t('unitConverter.precisionDescription')}
              inputProps={{ type: 'number', min: 0, max: 10 }}
            />
          </Box>
        )
      }
    ];
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('unitConverter.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ResultsTable
          results={results}
          inputValue={input}
          fromSymbol={currentOptions.fromUnit}
        />
      }
    />
  );
}
