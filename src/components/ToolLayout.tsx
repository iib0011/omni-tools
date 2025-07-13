import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';
import Separator from './Separator';
import AllTools from './allTools/AllTools';
import { getToolsByCategory } from '@tools/index';
import { capitalizeFirstLetter } from '../utils/string';
import { IconifyIcon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export default function ToolLayout({
  children,
  title,
  description,
  icon,
  type,
  i18n
}: {
  title: string;
  description: string;
  icon?: IconifyIcon | string;
  type: string;
  children: ReactNode;
  i18n?: {
    name: string;
    description: string;
    shortDescription: string;
  };
}) {
  const { t } = useTranslation();

  // Use i18n keys if available, otherwise fall back to provided strings
  //@ts-ignore
  const toolTitle: string = i18n ? t(i18n.name) : title;
  //@ts-ignore
  const toolDescription: string = i18n ? t(i18n.description) : description;

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
        <title>{`${toolTitle} - OmniTools`}</title>
      </Helmet>
      <Box width={'85%'}>
        <ToolHeader
          title={toolTitle}
          description={toolDescription}
          icon={icon}
          type={type}
        />
        {children}
        <Separator backgroundColor="#5581b5" margin="50px" />
        <AllTools
          title={t('toolLayout.allToolsTitle', {
            type: capitalizeFirstLetter(
              getToolsByCategory().find((category) => category.type === type)!
                .rawTitle
            )
          })}
          toolCards={otherCategoryTools}
        />
      </Box>
    </Box>
  );
}
