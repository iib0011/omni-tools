import React, { ChangeEvent, useRef, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { globalDescriptionFontSize } from '../../config/uiConfig';

interface ColorSelectorProps {
  value: string;
  onChange: (val: string) => void;
  description: string;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  value = '#ffffff',
  onChange,
  description
}) => {
  const [color, setColor] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setColor(val);
    onChange(val);
  };

  return (
    <Box mb={1}>
      <Stack direction={'row'}>
        <TextField
          sx={{ backgroundColor: 'white' }}
          value={color}
          onChange={handleColorChange}
        />
        <IconButton onClick={() => inputRef.current?.click()}>
          <PaletteIcon />
        </IconButton>
        <TextField
          style={{ display: 'none' }}
          inputRef={inputRef}
          type="color"
          value={color}
          onChange={handleColorChange}
        />
      </Stack>
      <Typography fontSize={globalDescriptionFontSize}>
        {description}
      </Typography>
    </Box>
  );
};

export default ColorSelector;
