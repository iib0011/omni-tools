import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';

export default function ToolOptionGroups({
  groups
}: {
  groups: { title: string; component: ReactNode }[];
}) {
  return (
    <Stack direction={'row'} spacing={2}>
      {groups.map((group) => (
        <Box key={group.title}>
          <Typography fontSize={22}>{group.title}</Typography>
          {group.component}
        </Box>
      ))}
    </Stack>
  );
}
