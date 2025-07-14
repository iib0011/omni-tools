import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';
import Separator from './Separator';
import AllTools from './allTools/AllTools';
import { getToolsByCategory } from '@tools/index';
import { capitalizeFirstLetter } from '../utils/string';
import { IconifyIcon } from '@iconify/react';

export default function ToolLayout({
  children,
  title,
  description,
  icon,
  type,
  path
}: {
  title: string;
  description: string;
  icon?: IconifyIcon | string;
  type: string;
  path: string;
  children: ReactNode;
}) {
  const otherCategoryTools =
    getToolsByCategory()
      .find((category) => category.type === type)
      ?.tools.filter((tool) => tool.name !== title)
      .map((tool) => ({
        title: tool.name,
        description: tool.shortDescription,
        link: '/' + tool.path,
        icon: tool.icon
      })) ?? [];

  return (
    <Box
      width={'100%'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      sx={{ backgroundColor: 'background.default' }}
    >
      <Helmet>
        <title>{`${title} - OmniTools`}</title>
      </Helmet>
      <Box width={'85%'}>
        <ToolHeader
          title={title}
          description={description}
          icon={icon}
          type={type}
          path={path}
        />
        {children}
        <Separator backgroundColor="#5581b5" margin="50px" />
        <AllTools
          title={`All ${capitalizeFirstLetter(
            getToolsByCategory().find((category) => category.type === type)!
              .rawTitle
          )} tools`}
          toolCards={otherCategoryTools}
        />
      </Box>
    </Box>
  );
}
