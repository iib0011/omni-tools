import { Box } from '@mui/material';
import React from 'react';
import TextFieldWithDesc from './TextFieldWithDesc';
import SimpleRadio from './SimpleRadio';

const RadioWithTextField = <T,>({
  fieldName,
  radioValue,
  title,
  onRadioChange,
  value,
  description,
  onTextChange,
  typeDescription
}: {
  fieldName: string;
  title: string;
  radioValue: T;
  onRadioChange: (val: T) => void;
  value: string;
  description: string;
  onTextChange: (value: string) => void;
  typeDescription?: string;
}) => {
  const onChange = () => onRadioChange(radioValue);
  return (
    <Box>
      <SimpleRadio
        value={radioValue}
        onChange={onChange}
        fieldName={fieldName}
        title={title}
        description={typeDescription}
      />
      <TextFieldWithDesc
        value={value}
        onChange={onTextChange}
        description={description}
      />
    </Box>
  );
};
export default RadioWithTextField;
