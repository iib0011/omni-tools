import Typography from '@mui/material/Typography';
import React from 'react';

export default function InputHeader({ title }: { title: string }) {
  return (
    <Typography mb={1} fontSize={30} color={'primary'}>
      {title}
    </Typography>
  );
}
