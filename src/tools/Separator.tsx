import { Divider } from '@mui/material';
import React from 'react';

type SeparatorProps = {
  backgroundColor: string;
  margin: string;
};

export default function Separator({ backgroundColor, margin }: SeparatorProps) {
  return (
    <Divider
      orientation="horizontal"
      variant="fullWidth"
      className="my-4"
      sx={{
        backgroundColor: backgroundColor,
        height: '2px',
        marginTop: margin,
        marginBottom: margin
      }}
    />
  );
}
