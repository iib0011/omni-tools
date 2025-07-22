import { Box, useTheme } from '@mui/material';
import Hero from 'components/Hero';
import Categories from './Categories';
import { Helmet } from 'react-helmet';
import { useUserTypeFilter } from 'providers/UserTypeFilterProvider';
import UserTypeFilter from '@components/UserTypeFilter';

export default function Home() {
  const theme = useTheme();
  const { selectedUserTypes, setSelectedUserTypes } = useUserTypeFilter();
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
      <Helmet title={'OmniTools'} />
      <Hero />
      <Box my={3}>
        <UserTypeFilter
          selectedUserTypes={selectedUserTypes}
          onUserTypesChange={setSelectedUserTypes}
        />
      </Box>
      <Categories />
    </Box>
  );
}
