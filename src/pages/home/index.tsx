import { Box } from '@mui/material';
import Hero from 'components/Hero';
import Categories from './Categories';

export default function Home() {
  return (
    <Box
      padding={{ xs: 1, md: 3, lg: 5, backgroundColor: '#F5F5FA' }}
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
