import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToolsByCategory, tools } from '../../tools';
import Button from '@mui/material/Button';
import Hero from 'components/Hero';
import AllTools from '../../components/allTools/AllTools';
import { capitalizeFirstLetter } from '../../utils/string';
import toolsPng from '@assets/tools.png';

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { categoryName } = useParams();
  return (
    <Box>
      <Box
        padding={5}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        width={'100%'}
      >
        <Hero />
      </Box>
      <Divider sx={{ borderColor: theme.palette.primary.main }} />
      <Box width={'100%'} mt={3} ml={7} padding={3}>
        <Typography
          fontSize={22}
          color={theme.palette.primary.main}
        >{`All ${capitalizeFirstLetter(categoryName)} Tools`}</Typography>
        <Grid container spacing={2} mt={2}>
          {getToolsByCategory()
            .find(({ type }) => type === categoryName)
            ?.tools?.map((tool) => (
              <Grid item xs={12} md={4} key={tool.path}>
                <Stack
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.background.default // Change this to your desired hover color
                    }
                  }}
                  onClick={() => navigate('/' + tool.path)}
                  direction={'row'}
                  spacing={2}
                  padding={2}
                  border={1}
                  borderRadius={2}
                >
                  <img width={100} src={tool.image ?? toolsPng} />
                  <Box>
                    <Link to={'/' + tool.path}>{tool.name}</Link>
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
