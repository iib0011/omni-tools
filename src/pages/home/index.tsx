import { Box, Card, CardContent, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { getToolsByCategory } from '../../tools';
import Button from '@mui/material/Button';
import Hero from 'components/Hero';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box
      padding={5}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      width={'100%'}
    >
      <Hero />
      <Grid width={'80%'} container mt={2} spacing={2}>
        {getToolsByCategory().map((category) => (
          <Grid key={category.type} item xs={6}>
            <Card>
              <CardContent>
                <Link
                  style={{ fontSize: 20 }}
                  to={'/categories/' + category.type}
                >
                  {category.title}
                </Link>
                <Typography sx={{ mt: 2 }}>{category.description}</Typography>
                <Stack
                  mt={2}
                  direction={'row'}
                  justifyContent={'space-between'}
                >
                  <Button
                    onClick={() => navigate('/categories/' + category.type)}
                    variant={'contained'}
                  >{`See all ${category.title}`}</Button>
                  <Button
                    onClick={() => navigate(category.example.path)}
                    variant={'outlined'}
                  >{`Try ${category.example.title}`}</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
