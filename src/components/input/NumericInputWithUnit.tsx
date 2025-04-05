import React, { useState, useEffect } from 'react';
import { Grid, Select, MenuItem } from '@mui/material';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
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
  onOwnChange?: (value: { value: number; unit: string }) => void;
  defaultPrefix?: string;
}) {
  const [inputValue, setInputValue] = useState(props.value.value);
  const [prefix, setPrefix] = useState(props.defaultPrefix || '');

  // internal display unit
  const [unit, setUnit] = useState('');

  // Whether user has overridden the unit
  const [userSelectedUnit, setUserSelectedUnit] = useState(false);
  const [unitKind, setUnitKind] = useState('');
  const [unitOptions, setUnitOptions] = useState<string[]>([]);

  const [disabled, setDisabled] = useState(props.disabled);
  const [disableChangingUnit, setDisableChangingUnit] = useState(
    props.disableChangingUnit
  );

  useEffect(() => {
    setDisabled(props.disabled);
    setDisableChangingUnit(props.disableChangingUnit);
  }, [props.disabled, props.disableChangingUnit]);

  useEffect(() => {
    if (unitKind != Qty(props.value.unit).kind()) {
      // Update the options for what units similar to this one are available
      const kind = Qty(props.value.unit).kind();
      const units = Qty.getUnits(kind);
      if (!units.includes(props.value.unit)) {
        units.push(props.value.unit);
      }

      // Workaround because the lib doesn't list them
      if (kind == 'area') {
        units.push('km^2');
        units.push('mile^2');
        units.push('inch^2');
        units.push('m^2');
        units.push('cm^2');
      }
      setUnitOptions(units);
      setInputValue(props.value.value);
      setUnit(props.value.unit);
      setUnitKind(kind);
      setUserSelectedUnit(false);
      return;
    }

    if (userSelectedUnit) {
      if (!isNaN(props.value.value)) {
        const converted = Qty(props.value.value, props.value.unit).to(
          unit
        ).scalar;
        setInputValue(converted);
      } else {
        setInputValue(props.value.value);
      }
    } else {
      setInputValue(props.value.value);
      setUnit(props.value.unit);
    }
  }, [props.value.value, props.value.unit, unit]);

  const handleUserValueChange = (newValue: number) => {
    setInputValue(newValue);

    if (props.onOwnChange) {
      try {
        const converted = Qty(newValue * siPrefixes[prefix], unit).to(
          props.value.unit
        ).scalar;

        props.onOwnChange({ unit: props.value.unit, value: converted });
      } catch (error) {
        console.error('Conversion error', error);
      }
    }
  };

  const handlePrefixChange = (newPrefix: string) => {
    const oldPrefixValue = siPrefixes[prefix];
    const newPrefixValue = siPrefixes[newPrefix];

    setPrefix(newPrefix);
  };

  const handleUserUnitChange = (newUnit: string) => {
    if (!newUnit) return;
    const oldInputValue = inputValue;
    const oldUnit = unit;
    setUnit(newUnit);
    setPrefix('');

    const convertedValue = Qty(oldInputValue * siPrefixes[prefix], oldUnit).to(
      newUnit
    ).scalar;
    setInputValue(convertedValue);
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
          disabled={disabled}
          type="number"
          fullWidth
          value={(inputValue / siPrefixes[prefix])
            .toFixed(9)
            .replace(/(\d*\.\d+?)0+$/, '$1')}
          onOwnChange={(value) => handleUserValueChange(parseFloat(value))}
        />
      </Grid>

      <Grid item xs={3}>
        <Select
          fullWidth
          disabled={disableChangingUnit}
          value={prefix}
          onChange={(evt) => {
            handlePrefixChange(evt.target.value || '');
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
          disabled={disableChangingUnit}
          label="Unit"
          title="Unit"
          value={unit}
          onChange={(event) => {
            setUserSelectedUnit(true);
            handleUserUnitChange(event.target.value || '');
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
