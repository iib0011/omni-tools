import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';

interface ToolOptionGroup {
  title: string;
  component: ReactNode;
}

export default function ToolOptionGroups({
  groups
}: {
  groups: ToolOptionGroup[];
}) {
  return (
    <Grid container spacing={2}>
      {groups.map((group) => (
        <Grid item xs={12} md={6} key={group.title}>
          <Typography mb={1} fontSize={22}>
            {group.title}
          </Typography>
          {group.component}
        </Grid>
      ))}
    </Grid>
  );
}
