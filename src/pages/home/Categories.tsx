import { getToolsByCategory } from '@tools/index';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Stack } from '@mui/material';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { categoriesColors } from 'config/uiConfig';

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
  const [hovered, setHovered] = useState<boolean>(false);
  const Icon = category.icon;
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
          backgroundColor: hovered ? '#FAFAFD' : 'white'
        }}
      >
        <CardContent>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <HugeiconsIcon
              icon={Icon}
              style={{
                transform: `scale(${hovered ? 1.1 : 1}`
              }}
              color={categoriesColors[index % categoriesColors.length]}
            />
            <Link
              style={{ fontSize: 20, fontWeight: 700, color: 'black' }}
              to={'/categories/' + category.type}
            >
              {category.title}
            </Link>
          </Stack>
          <Typography sx={{ mt: 2 }}>{category.description}</Typography>
          <Grid mt={1} container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                onClick={() => navigate('/categories/' + category.type)}
                variant={'contained'}
              >{`See all ${category.title}`}</Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                sx={{ backgroundColor: 'white' }}
                fullWidth
                onClick={() => navigate(category.example.path)}
                variant={'outlined'}
              >{`Try ${category.example.title}`}</Button>
            </Grid>
          </Grid>
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
