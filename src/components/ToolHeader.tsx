import { Box, Button, Stack, styled, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import ToolBreadcrumb from './ToolBreadcrumb';
import { capitalizeFirstLetter } from '../utils/string';
import Grid from '@mui/material/Grid';
import { Icon, IconifyIcon } from '@iconify/react';
import { categoriesColors } from '../config/uiConfig';
import { getToolsByCategory } from '@tools/index';
import { useEffect, useState } from 'react';
import { isBookmarked, toggleBookmarked } from '@utils/bookmark';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  }
}));

interface ToolHeaderProps {
  title: string;
  description: string;
  icon?: IconifyIcon | string;
  type: string;
  path: string;
}

function ToolLinks() {
  const { t } = useTranslation();
  const [examplesVisible, setExamplesVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const element = document.getElementById('examples');
      if (element && isVisible(element)) {
        setExamplesVisible(true);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const scrollToElement = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  function isVisible(elm: HTMLElement | null) {
    return !!elm;
  }
  return (
    <Grid container spacing={2} mt={1}>
      <Grid item md={12} lg={6}>
        <StyledButton
          sx={{ backgroundColor: 'background.paper' }}
          fullWidth
          variant="outlined"
          onClick={() => scrollToElement('tool')}
        >
          Use This Tool
        </StyledButton>
      </Grid>
      {examplesVisible && (
        <Grid item md={12} lg={6}>
          <StyledButton
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: 'background.paper' }}
            onClick={() => scrollToElement('examples')}
          >
            {t('toolHeader.seeExamples')}
          </StyledButton>
        </Grid>
      )}
      {/*<Grid item md={12} lg={4}>*/}
      {/*  <StyledButton fullWidth variant="outlined" href="#tour">*/}
      {/*    Learn How to Use*/}
      {/*  </StyledButton>*/}
      {/*</Grid>*/}
    </Grid>
  );
}

export default function ToolHeader({
  icon,
  title,
  description,
  type,
  path
}: ToolHeaderProps) {
  const theme = useTheme();
  const [bookmarked, setBookmarked] = useState<boolean>(isBookmarked(path));
  return (
    <Box my={4}>
      <ToolBreadcrumb
        items={[
          { title: 'All tools', link: '/' },
          {
            title: getToolsByCategory().find(
              (category) => category.type === type
            )!.rawTitle,
            link: '/categories/' + type
          },
          { title }
        ]}
      />
      <Grid mt={1} container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Typography mb={2} fontSize={30} color={'primary'}>
              {title}
            </Typography>
            <IconButton
              onClick={(e) => {
                toggleBookmarked(path);
                setBookmarked(!bookmarked);
              }}
            >
              <Icon
                fontSize={30}
                color={
                  bookmarked
                    ? theme.palette.primary.main
                    : theme.palette.grey[500]
                }
                icon={bookmarked ? 'mdi:bookmark' : 'mdi:bookmark-plus-outline'}
              />
            </IconButton>
          </Stack>
          <Typography fontSize={20}>{description}</Typography>
          <ToolLinks />
        </Grid>

        {icon && (
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Icon
                icon={icon}
                fontSize={'250'}
                color={
                  categoriesColors[
                    Math.floor(Math.random() * categoriesColors.length)
                  ]
                }
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
