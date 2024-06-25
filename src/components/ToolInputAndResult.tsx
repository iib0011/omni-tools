import React, { ReactNode } from 'react';
import Grid from '@mui/material/Grid';

export default function ToolInputAndResult({
  input,
  result
}: {
  input: ReactNode;
  result: ReactNode;
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {input}
      </Grid>
      <Grid item xs={6}>
        {result}
      </Grid>
    </Grid>
  );
}
