import { Box, Grid, Stack, Typography } from '@mui/material';
import ToolCard from './ToolCard';
import { IconifyIcon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { FullI18nKey } from '../../i18n';

export interface ToolCardProps {
  title: FullI18nKey;
  description: FullI18nKey;
  link: string;
  icon: IconifyIcon | string;
}

interface AllToolsProps {
  title: string;
  toolCards: ToolCardProps[];
}

export default function AllTools({ title, toolCards }: AllToolsProps) {
  const { t } = useTranslation();
  return (
    <Box mt={4} mb={10}>
      <Typography mb={2} fontSize={30} color={'primary'}>
        {title}
      </Typography>
      <Stack direction={'row'} alignItems={'center'} spacing={2}>
        <Grid container spacing={2}>
          {toolCards.map((card, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <ToolCard
                //@ts-ignore
                title={t(card.title)}
                //@ts-ignore
                description={t(card.description)}
                link={card.link}
                icon={card.icon}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
