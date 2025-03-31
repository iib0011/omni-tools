import { Box, Divider, Stack, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToolsByCategory } from '../../tools';
import Hero from 'components/Hero';
import { capitalizeFirstLetter } from '@utils/string';
import { Icon } from '@iconify/react';
import { categoriesColors } from 'config/uiConfig';
import React, { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import BackButton from '@components/BackButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const mainContentRef = React.useRef<HTMLDivElement>(null);
  const { categoryName } = useParams();

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
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
      <Box ref={mainContentRef} mt={3} ml={{ xs: 1, md: 2, lg: 3 }} padding={3}>
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBackIcon color={'primary'} />
          </IconButton>
          <Typography
            fontSize={22}
            color={theme.palette.primary.main}
          >{`All ${capitalizeFirstLetter(categoryName)} Tools`}</Typography>
        </Stack>
        <Grid container spacing={2} mt={2}>
          {getToolsByCategory()
            .find(({ type }) => type === categoryName)
            ?.tools?.map((tool, index) => (
              <Grid item xs={12} md={6} lg={4} key={tool.path}>
                <Stack
                  sx={{
                    backgroundColor: 'background.paper',
                    boxShadow: `5px 4px 2px ${
                      theme.palette.mode === 'dark' ? 'black' : '#E9E9ED'
                    }`,
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      backgroundColor: theme.palette.background.hover
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
                    <Link
                      style={{
                        fontSize: 20
                      }}
                      to={'/' + tool.path}
                    >
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
