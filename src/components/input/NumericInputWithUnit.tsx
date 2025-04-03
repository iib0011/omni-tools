import React, { useState, useEffect } from 'react';
import { TextField, Grid } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Qty from 'js-quantities';

export default function NumericInputWithUnit(props: {
  value: { value: number; unit: string };
  onChange: (value: { value: number; unit: string }) => void;
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

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value) || 0;
    setInputValue(newValue);
    if (props.onChange) {
      try {
        const qty = Qty(newValue, unit).to('meters');
        props.onChange({ unit: 'meters', value: qty.scalar });
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
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={6}>
        <TextField
          type="number"
          fullWidth
          value={inputValue}
          onChange={handleValueChange}
          label="Value"
        />
      </Grid>
      <Grid item xs={6}>
        <Autocomplete
          options={unitOptions}
          value={unit}
          onChange={() => {
            handleUnitChange(unit);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Unit" fullWidth />
          )}
        />
      </Grid>
    </Grid>
  );
}
