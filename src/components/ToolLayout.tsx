import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';
import Separator from '@tools/Separator';
import AllTools from './allTools/AllTools';
import { getToolsByCategory } from '@tools/index';
import { capitalizeFirstLetter } from '../utils/string';

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
  const otherCategoryTools =
    getToolsByCategory()
      .find((category) => category.type === type)
      ?.tools.filter((tool) => tool.name !== title)
      .map((tool) => ({
        title: tool.name,
        description: tool.shortDescription,
        link: '/' + tool.path
      })) ?? [];

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
        <Separator backgroundColor="#5581b5" margin="50px" />
        <AllTools
          title={`All ${capitalizeFirstLetter(type)} tools`}
          toolCards={otherCategoryTools}
        />
      </Box>
    </Box>
  );
}
