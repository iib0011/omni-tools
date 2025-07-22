import { Box, useTheme } from '@mui/material';
import Hero from 'components/Hero';
import Categories from './Categories';
import { Helmet } from 'react-helmet';
import UserTypeFilter, { useUserTypeFilter } from 'components/UserTypeFilter';
import { UserType } from '@tools/defineTool';

export default function Home() {
  const theme = useTheme();
  const { selectedUserTypes, setSelectedUserTypes } = useUserTypeFilter();

  const handleUserTypesChange = (userTypes: UserType[]) => {
    setSelectedUserTypes(userTypes);
  };

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
      <UserTypeFilter
        selectedUserTypes={selectedUserTypes}
        onUserTypesChange={handleUserTypesChange}
        label="Filter by User Type"
      />
      <Categories />
    </Box>
  );
}
