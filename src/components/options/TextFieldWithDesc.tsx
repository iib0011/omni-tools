import { Box, TextField, TextFieldProps } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

type OwnProps = {
  description?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
};
const TextFieldWithDesc = ({
  description,
  value,
  onChange,
  placeholder,
  ...props
}: TextFieldProps & OwnProps) => {
  return (
    <Box>
      <TextField
        placeholder={placeholder}
        sx={{ backgroundColor: 'white' }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {description && (
        <Typography fontSize={12} mt={1}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default TextFieldWithDesc;
