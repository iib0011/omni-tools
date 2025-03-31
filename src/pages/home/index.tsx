import { Box, useTheme } from '@mui/material';
import Hero from 'components/Hero';
import Categories from './Categories';

export default function Home() {
  const theme = useTheme();
  return (
    <Box
      padding={{
        xs: 1,
        md: 3,
        lg: 5
      }}
      sx={{
        background: `url(/assets/${
          theme.palette.mode === 'dark'
            ? 'background-dark.png'
            : 'background.svg'
        })`,
        backgroundColor: 'background.default'
      }}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      width={'100%'}
    >
      <Hero />
      <Categories />
    </Box>
  );
}
