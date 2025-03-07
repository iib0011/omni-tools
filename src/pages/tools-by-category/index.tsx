import { Box, Divider, Stack, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToolsByCategory } from '../../tools';
import Hero from 'components/Hero';
import { capitalizeFirstLetter } from '../../utils/string';
import { Icon } from '@iconify/react';
import { categoriesColors } from 'config/uiConfig';

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { categoryName } = useParams();
  return (
    <Box sx={{ backgroundColor: '#F5F5FA' }}>
      <Box
        padding={{ xs: 1, md: 3, lg: 5 }}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        width={'100%'}
      >
        <Hero />
      </Box>
      <Divider sx={{ borderColor: theme.palette.primary.main }} />
      <Box width={'100%'} mt={3} ml={{ xs: 1, md: 2, lg: 3 }} padding={3}>
        <Typography
          fontSize={22}
          color={theme.palette.primary.main}
        >{`All ${capitalizeFirstLetter(categoryName)} Tools`}</Typography>
        <Grid container spacing={2} mt={2}>
          {getToolsByCategory()
            .find(({ type }) => type === categoryName)
            ?.tools?.map((tool, index) => (
              <Grid item xs={12} md={6} lg={4} key={tool.path}>
                <Stack
                  sx={{
                    backgroundColor: 'white',
                    boxShadow: '5px 4px 2px #E9E9ED',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.background.default // Change this to your desired hover color
                    }
                  }}
                  onClick={() => navigate('/' + tool.path)}
                  direction={'row'}
                  alignItems={'center'}
                  spacing={2}
                  padding={2}
                  border={`1px solid ${theme.palette.background.default}`}
                  borderRadius={2}
                >
                  <Icon
                    icon={tool.icon ?? 'ph:compass-tool-thin'}
                    fontSize={'60px'}
                    color={categoriesColors[index % categoriesColors.length]}
                  />
                  <Box>
                    <Link style={{ fontSize: 20 }} to={'/' + tool.path}>
                      {tool.name}
                    </Link>
                    <Typography sx={{ mt: 2 }}>
                      {tool.shortDescription}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}
