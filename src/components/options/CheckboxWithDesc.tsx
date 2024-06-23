import React from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

const CheckboxWithDesc = ({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox defaultChecked checked={checked} onChange={handleChange} />
        }
        label={title}
      />
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

export default CheckboxWithDesc;
