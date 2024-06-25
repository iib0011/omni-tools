import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';

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
    <Stack direction={'row'} spacing={2}>
      {groups.map((group) => (
        <Box key={group.title}>
          <Typography mb={1} fontSize={22}>
            {group.title}
          </Typography>
          {group.component}
        </Box>
      ))}
    </Stack>
  );
}
