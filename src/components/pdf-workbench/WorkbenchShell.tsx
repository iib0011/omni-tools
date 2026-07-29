import type { ReactNode } from 'react';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';

export default function WorkbenchShell({
  localNotice,
  children,
  ariaLabel
}: {
  localNotice: string;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <Stack spacing={3} aria-label={ariaLabel}>
      <Alert severity="info" variant="outlined">
        {localNotice}
      </Alert>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Box>{children}</Box>
      </Paper>
    </Stack>
  );
}

export function WorkbenchSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box component="section">
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
