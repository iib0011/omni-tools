import { Box } from '@mui/material';
import React from 'react';
import TextFieldWithDesc from './TextFieldWithDesc';
import SimpleRadio from './SimpleRadio';

const RadioWithTextField = ({
  title,
  onRadioClick,
  checked,
  value,
  description,
  onTextChange,
  radioDescription
}: {
  fieldName: string;
  title: string;
  checked: boolean;
  onRadioClick: () => void;
  value: string;
  description: string;
  onTextChange: (value: string) => void;
  radioDescription?: string;
}) => {
  return (
    <Box>
      <SimpleRadio
        checked={checked}
        onClick={onRadioClick}
        title={title}
        description={radioDescription}
      />
      <TextFieldWithDesc
        value={value}
        onOwnChange={onTextChange}
        description={description}
      />
    </Box>
  );
};
export default RadioWithTextField;
