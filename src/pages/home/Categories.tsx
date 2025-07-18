import { getToolsByCategory } from '@tools/index';
import Grid from '@mui/material/Grid';
import { Box, Card, CardContent, Stack, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { categoriesColors } from 'config/uiConfig';
import { Icon } from '@iconify/react';
import { useUserTypeFilter } from '@components/UserTypeFilter';
import { useTranslation } from 'react-i18next';
import { getI18nNamespaceFromToolCategory } from '@utils/string';
import { validNamespaces } from '../../i18n';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const SingleCategory = function ({
  category,
  index
}: {
  category: ArrayElement<ReturnType<typeof getToolsByCategory>>;
  index: number;
}) {
  const { t } = useTranslation(getI18nNamespaceFromToolCategory(category.type));
  const navigate = useNavigate();
  const theme = useTheme();
  const [hovered, setHovered] = useState<boolean>(false);
  const toggleHover = () => setHovered((prevState) => !prevState);

  // Get translated category title and description
  const categoryTitle = t(`categories.${category.type}.title`, category.title);
  const categoryDescription = t(
    `categories.${category.type}.description`,
    category.description
  );
  const seeAllText = t('translation:categories.seeAll', 'See all {{title}}', {
    title: categoryTitle
  });
  const tryText = t('translation:categories.try', 'Try {{title}}', {
    //@ts-ignore
    title: t(category.example.title)
  });

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
                  {categoryTitle}
                </Link>
              </Stack>
              <Typography sx={{ mt: 2 }}>{categoryDescription}</Typography>
            </Box>
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  onClick={() => navigate('/categories/' + category.type)}
                  variant={'contained'}
                >
                  {seeAllText}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  sx={{ backgroundColor: 'background.default' }}
                  fullWidth
                  onClick={() => navigate(category.example.path)}
                  variant={'outlined'}
                >
                  {tryText}
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
  const { selectedUserTypes } = useUserTypeFilter();
  const { t } = useTranslation();
  const categories = getToolsByCategory(selectedUserTypes, t);

  return (
    <Grid width={'80%'} container mt={2} spacing={2}>
      {categories.map((category, index) => (
        <SingleCategory key={category.type} category={category} index={index} />
      ))}
    </Grid>
  );
}
