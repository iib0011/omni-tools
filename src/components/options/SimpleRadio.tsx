import { Box, Stack } from '@mui/material';
import { Field } from 'formik';
import Typography from '@mui/material/Typography';
import { globalDescriptionFontSize } from '../../config/uiConfig';
import React from 'react';

interface SimpleRadioProps {
  onChange: () => void;
  fieldName: string;
  value: any;
  title: string;
  description?: string;
}

export default function SimpleRadio({
  onChange,
  fieldName,
  value,
  title,
  description
}: SimpleRadioProps) {
  return (
    <Box>
      <Stack
        direction={'row'}
        sx={{ mt: 2, mb: 1, cursor: 'pointer' }}
        onClick={onChange}
        alignItems={'center'}
        spacing={1}
      >
        <Field
          type="radio"
          name={fieldName}
          value={value}
          onChange={onChange}
        />
        <Typography>{title}</Typography>
      </Stack>
      {description && (
        <Typography ml={2} fontSize={globalDescriptionFontSize}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
