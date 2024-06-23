import { Box, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

const TextFieldWithDesc = ({
  description,
  value,
  onChange,
  placeholder
}: {
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <Box>
      <TextField
        placeholder={placeholder}
        sx={{ backgroundColor: 'white' }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

export default TextFieldWithDesc;
