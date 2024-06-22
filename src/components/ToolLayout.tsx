import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';

export default function ToolLayout({
  children,
  title,
  description
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box
      width={'100%'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <Helmet>
        <title>{`${title} - Omni Tools`}</title>
      </Helmet>
      <Box width={'85%'}>
        <ToolHeader title={title} description={description} />
        {children}
      </Box>
    </Box>
  );
}
