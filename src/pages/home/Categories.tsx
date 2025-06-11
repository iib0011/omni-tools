import { getToolsByCategory } from '@tools/index';
import Grid from '@mui/material/Grid';
import { Box, Card, CardContent, Stack, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { categoriesColors } from 'config/uiConfig';
import { Icon } from '@iconify/react';
import i18n from 'i18n/i18n';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const SingleCategory = function ({
  category,
  index
}: {
  category: ArrayElement<ReturnType<typeof getToolsByCategory>>;
  index: number;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [hovered, setHovered] = useState<boolean>(false);
  const toggleHover = () => setHovered((prevState) => !prevState);
  return (
    <Grid
      item
      xs={12}
      md={6}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
    >
      <Card
        sx={{
          height: '100%',
          backgroundColor: hovered ? 'background.hover' : 'background.paper'
        }}
      >
        <CardContent sx={{ height: '100%' }}>
          <Stack
            direction={'column'}
            height={'100%'}
            justifyContent={'space-between'}
          >
            <Box>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Icon
                  icon={category.icon}
                  fontSize={'60px'}
                  style={{
                    transform: `scale(${hovered ? 1.1 : 1}`
                  }}
                  color={categoriesColors[index % categoriesColors.length]}
                />
                <Link
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? 'white' : 'black'
                  }}
                  to={'/categories/' + category.type}
                >
                  {category.title}
                </Link>
              </Stack>
              <Typography sx={{ mt: 2 }}>{category.description}</Typography>
            </Box>
            <Grid mt={1} container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  onClick={() => navigate('/categories/' + category.type)}
                  variant={'contained'}
                >
                  {i18n.t('seeAll') + ` ${category.title}`}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  sx={{ backgroundColor: 'background.default' }}
                  fullWidth
                  onClick={() => navigate(category.example.path)}
                  variant={'outlined'}
                >
                  {i18n.t('try') + ` ${category.example.title}`}
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};
export default function Categories() {
  return (
    <Grid width={'80%'} container mt={2} spacing={2}>
      {getToolsByCategory().map((category, index) => (
        <SingleCategory key={category.type} category={category} index={index} />
      ))}
    </Grid>
  );
}
