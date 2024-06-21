import { Box, Stack, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';

export default function ToolOptions({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 2,
        padding: 2,
        backgroundColor: theme.palette.background.default
      }}
      mt={2}
    >
      <Stack direction={'row'} spacing={1} alignItems={'center'}>
        <SettingsIcon />
        <Typography fontSize={22}>Tool options</Typography>
      </Stack>
      <Box mt={2}>{children}</Box>
    </Box>
  );
}
