import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';

export default function ToolLayout({
  children,
  title,
  description,
  image,
  type
}: {
  title: string;
  description: string;
  image?: string;
  type: string;
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
        <ToolHeader
          title={title}
          description={description}
          image={image}
          type={type}
        />
        {children}
      </Box>
    </Box>
  );
}
