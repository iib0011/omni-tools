import React from 'react';
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';

interface Option<T extends string | boolean> {
  label: string;
  value: T;
}

const SelectWithDesc = <T extends string | boolean>({
  selected,
  options,
  onChange,
  description
}: {
  selected: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  description: string;
}) => {
  const handleChange = (event: SelectChangeEvent<T>) => {
    const newValue =
      typeof selected === 'boolean'
        ? event.target.value === 'true'
        : event.target.value;
    onChange(newValue as T);
  };

  return (
    <Box>
      <Select value={selected} onChange={handleChange}>
        {options.map((option) => (
          <MenuItem key={option.label} value={option.value.toString()}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

export default SelectWithDesc;
