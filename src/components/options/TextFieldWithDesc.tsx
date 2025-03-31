import { Box, TextField, TextFieldProps } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

type OwnProps = {
  description?: string;
  value: string | number;
  onOwnChange: (value: string) => void;
  placeholder?: string;
};
const TextFieldWithDesc = ({
  description,
  value,
  onOwnChange,
  placeholder,
  ...props
}: TextFieldProps & OwnProps) => {
  return (
    <Box>
      <TextField
        placeholder={placeholder}
        sx={{ backgroundColor: 'background.paper' }}
        value={value}
        onChange={(event) => onOwnChange(event.target.value)}
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
