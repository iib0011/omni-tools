import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export interface UnitDescription {
  unit: string;
  singular: string;
  plural: string;
  system?: string;
}

interface GenericConverterProps {
  converter: (value?: number) => any;
  classicUnits: string[];
  defaultFrom: string;
  defaultTo: string;
  title: string;
  hasExpert?: boolean;
}

const GenericConverter: React.FC<GenericConverterProps> = ({
  converter,
  classicUnits,
  defaultFrom,
  defaultTo,
  title,
  hasExpert = true
}) => {
  const converterInstance = useMemo(() => converter(), [converter]);
  const allUnits = useMemo(
    () => converterInstance.list() as UnitDescription[],
    [converterInstance]
  );
  const [expert, setExpert] = useState(false);
  const showExpert = hasExpert && allUnits.length > 5;
  const units = useMemo(
    () =>
      showExpert && expert
        ? allUnits
        : showExpert
          ? allUnits.filter((u: UnitDescription) =>
              classicUnits.includes(u.unit)
            )
          : allUnits,
    [allUnits, expert, showExpert, classicUnits]
  );
  const [fromUnit, setFromUnit] = useState<string>(defaultFrom);
  const [toUnit, setToUnit] = useState<string>(defaultTo);
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fromUnit || !units.some((u: UnitDescription) => u.unit === fromUnit)) {
      setFromUnit(units[0]?.unit || '');
    }
    if (
      !toUnit ||
      !units.some((u: UnitDescription) => u.unit === toUnit) ||
      toUnit === fromUnit
    ) {
      const next =
        units.find((u: UnitDescription) => u.unit !== fromUnit)?.unit ||
        units[0]?.unit ||
        '';
      setToUnit(next);
    }
  }, [units, fromUnit, toUnit]);

  useEffect(() => {
    if (!fromValue || isNaN(Number(fromValue))) {
      setToValue('');
      setInputError(fromValue ? 'Enter a valid number' : '');
      return;
    }
    if (!fromUnit || !toUnit) {
      setToValue('');
      setInputError('');
      return;
    }
    try {
      const result = converterInstance
        .from(fromUnit)
        .to(toUnit, Number(fromValue));
      setToValue(result.value.toString());
      setInputError('');
    } catch {
      setToValue('');
      setInputError('Conversion not possible');
    }
  }, [fromValue, fromUnit, toUnit, converterInstance]);

  const handleCopy = async () => {
    if (toValue) {
      await navigator.clipboard.writeText(toValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        {title}
      </Typography>
      {showExpert && (
        <FormControlLabel
          control={
            <Switch
              checked={expert}
              onChange={(e) => setExpert(e.target.checked)}
              color="primary"
            />
          }
          label="Expert mode (show all units)"
          sx={{ mb: 2 }}
        />
      )}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="Value"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            type="number"
            error={!!inputError}
            helperText={inputError}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            select
            fullWidth
            label="From"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as string)}
            disabled={units.length === 0}
          >
            {units.map((u: UnitDescription) => (
              <MenuItem key={u.unit} value={u.unit}>
                {u.singular}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="Result"
            value={toValue}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <span>
                      <IconButton
                        onClick={handleCopy}
                        disabled={!toValue}
                        size="small"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            select
            fullWidth
            label="To"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as string)}
            disabled={units.length === 0}
          >
            {units.map((u: UnitDescription) => (
              <MenuItem key={u.unit} value={u.unit}>
                {u.singular}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GenericConverter;
