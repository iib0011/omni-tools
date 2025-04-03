import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import Autocomplete from '@mui/material/Autocomplete';
import Qty from 'js-quantities';
import { parse } from 'path';
import { b } from 'vitest/dist/suite-IbNSsUWN.js';

export default function NumericInputWithUnit(props: {
  value: { value: number; unit: string };
  onOwnChange: (value: { value: number; unit: string }, ...baseProps) => void;
}) {
  const [inputValue, setInputValue] = useState(props.value.value);
  const [unit, setUnit] = useState(props.value.unit);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const kind = Qty(props.value.unit).kind();
      const units = Qty.getUnits(kind);
      setUnitOptions(units);
    } catch (error) {
      console.error('Invalid unit kind', error);
    }
  }, [props.value.unit]);

  useEffect(() => {
    setInputValue(props.value.value);
    setUnit(props.value.unit);
  }, [props.value]);

  const handleValueChange = (val: { value: number; unit: string }) => {
    const newValue = val.value;
    setInputValue(newValue);
    if (props.onOwnChange) {
      try {
        const qty = Qty(newValue, unit).to(val.unit);
        props.onOwnChange({ unit: val.unit, value: qty.scalar });
      } catch (error) {
        console.error('Conversion error', error);
      }
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (!newUnit) return;
    setUnit(newUnit);
    try {
      const convertedValue = Qty(inputValue, unit).to(newUnit).scalar;
      setInputValue(convertedValue);
    } catch (error) {
      console.error('Unit conversion error', error);
    }

    if (props.onOwnChange) {
      try {
        const qty = Qty(inputValue, unit).to(newUnit);
        props.onOwnChange({ unit: newUnit, value: qty.scalar });
      } catch (error) {
        console.error('Conversion error', error);
      }
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={6}>
        <TextFieldWithDesc
          {...props.baseProps}
          type="number"
          fullWidth
          value={inputValue}
          onOwnChange={(value) =>
            handleValueChange({ value: parseFloat(value), unit: unit })
          }
          label="Value"
        />
      </Grid>
      <Grid item xs={6}>
        <Autocomplete
          options={unitOptions}
          value={unit}
          onChange={(event, newValue) => {
            handleUnitChange(newValue || '');
          }}
          renderInput={(params) => (
            <TextField {...params} label="Unit" fullWidth />
          )}
        />
      </Grid>
    </Grid>
  );
}
