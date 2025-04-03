import React, { useState, useEffect } from 'react';
import { Grid, TextField, Select, MenuItem } from '@mui/material';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import Autocomplete from '@mui/material/Autocomplete';
import Qty from 'js-quantities';
//

const siPrefixes: { [key: string]: number } = {
  '': 1,
  k: 1000,
  M: 1000000,
  G: 1000000000,
  T: 1000000000000,
  m: 0.001,
  u: 0.000001,
  n: 0.000000001,
  p: 0.000000000001
};

export default function NumericInputWithUnit(props: {
  value: { value: number; unit: string };
  disabled?: boolean;
  disableChangingUnit?: boolean;
  onOwnChange: (value: { value: number; unit: string }, ...baseProps) => void;
  defaultPrefix?: string;
}) {
  const [inputValue, setInputValue] = useState(props.value.value);
  const [prefix, setPrefix] = useState(props.defaultPrefix || '');
  const [unit, setUnit] = useState(props.value.unit);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const kind = Qty(props.value.unit).kind();
      const units = Qty.getUnits(kind);
      if (!units.includes(props.value.unit)) {
        units.push(props.value.unit);
      }

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
        const qty = Qty(newValue * siPrefixes[prefix], unit).to(val.unit);
        props.onOwnChange({ unit: val.unit, value: qty.scalar });
      } catch (error) {
        console.error('Conversion error', error);
      }
    }
  };

  const handlePrefixChange = (newPrefix: string) => {
    const oldPrefixValue = siPrefixes[prefix];
    const newPrefixValue = siPrefixes[newPrefix];

    setPrefix(newPrefix);

    // Value does not change, it is just re-formatted for display
    // handleValueChange({
    //   value: (inputValue * oldPrefixValue) / newPrefixValue,
    //   unit: unit
    // });
  };

  const handleUnitChange = (newUnit: string) => {
    if (!newUnit) return;
    const oldInputValue = inputValue;
    const oldUnit = unit;
    setUnit(newUnit);
    setPrefix('');

    try {
      const convertedValue = Qty(
        oldInputValue * siPrefixes[prefix],
        oldUnit
      ).to(newUnit).scalar;
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
    <Grid
      container
      spacing={2}
      alignItems="center"
      style={{ minWidth: '20rem' }}
    >
      <Grid item xs={4}>
        <TextFieldWithDesc
          {...props.baseProps}
          disabled={props.disabled}
          type="number"
          fullWidth
          value={(inputValue / siPrefixes[prefix])
            .toFixed(9)
            .replace(/(\d*\.\d+?)0+$/, '$1')}
          onOwnChange={(value) =>
            handleValueChange({ value: parseFloat(value), unit: unit })
          }
          label="Value"
        />
      </Grid>

      <Grid item xs={3}>
        <Select
          fullWidth
          disabled={props.disableChangingUnit}
          label="Prefix"
          title="Prefix"
          value={prefix}
          onChange={(event, newValue) => {
            handlePrefixChange(newValue?.props?.value || '');
          }}
        >
          {Object.keys(siPrefixes).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item xs={5}>
        <Select
          fullWidth
          disabled={props.disableChangingUnit}
          label="Unit"
          title="Unit"
          value={unit}
          onChange={(event, newValue) => {
            handleUnitChange(newValue?.props?.value || '');
          }}
        >
          {unitOptions.map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Grid>
  );
}
