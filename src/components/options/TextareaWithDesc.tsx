import { Box, TextField, TextFieldProps } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

type OwnProps = {
  description?: string;
  value: string;
  onOwnChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

const TextareaWithDesc = ({
  description,
  value,
  onOwnChange,
  placeholder,
  minRows = 3,
  ...props
}: TextFieldProps & OwnProps) => {
  return (
    <Box>
      <TextField
        multiline
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onOwnChange(event.target.value)}
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiInputBase-root': {
            overflow: 'hidden' // ✨ Prevent scrollbars
          }
        }}
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

export default TextareaWithDesc;
