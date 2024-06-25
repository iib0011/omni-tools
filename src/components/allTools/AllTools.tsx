import { Box, Grid, Stack, Typography } from '@mui/material';
import ToolCard from './ToolCard';

export interface ToolCardProps {
  title: string;
  description: string;
  link: string;
}

interface AllToolsProps {
  title: string;
  toolCards: ToolCardProps[];
}

export default function AllTools({ title, toolCards }: AllToolsProps) {
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
                title={card.title}
                description={card.description}
                link={card.link}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
