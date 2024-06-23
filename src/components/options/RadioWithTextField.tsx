import { SplitOperatorType } from '../../pages/string/split/service';
import { Box, Stack } from '@mui/material';
import { Field } from 'formik';
import Typography from '@mui/material/Typography';
import React from 'react';
import TextFieldWithDesc from './TextFieldWithDesc';

const RadioWithTextField = <T,>({
  fieldName,
  type,
  title,
  onTypeChange,
  value,
  description,
  onTextChange
}: {
  fieldName: string;
  title: string;
  type: T;
  onTypeChange: (val: T) => void;
  value: string;
  description: string;
  onTextChange: (value: string) => void;
}) => {
  const onChange = () => onTypeChange(type);
  return (
    <Box>
      <Stack
        direction={'row'}
        sx={{ mt: 2, mb: 1, cursor: 'pointer' }}
        onClick={onChange}
        alignItems={'center'}
        spacing={1}
      >
        <Field type="radio" name={fieldName} value={type} onChange={onChange} />
        <Typography>{title}</Typography>
      </Stack>
      <TextFieldWithDesc
        value={value}
        onChange={onTextChange}
        description={description}
      />
    </Box>
  );
};
export default RadioWithTextField;
