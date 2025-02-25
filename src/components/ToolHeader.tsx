import { Box, Button, styled, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import ToolBreadcrumb from './ToolBreadcrumb';
import { capitalizeFirstLetter } from '../utils/string';
import Grid from '@mui/material/Grid';
import { Icon, IconifyIcon } from '@iconify/react';
import { categoriesColors } from '../config/uiConfig';

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
}

function ToolLinks() {
  const theme = useTheme();

  return (
    <Grid container spacing={2} mt={1}>
      <Grid item md={12} lg={4}>
        <StyledButton
          sx={{ backgroundColor: 'white' }}
          fullWidth
          variant="outlined"
          href="#tool"
        >
          Use This Tool
        </StyledButton>
      </Grid>
      <Grid item md={12} lg={4}>
        <StyledButton fullWidth variant="outlined" href="#examples">
          See Examples
        </StyledButton>
      </Grid>
      <Grid item md={12} lg={4}>
        <StyledButton fullWidth variant="outlined" href="#tour">
          Learn How to Use
        </StyledButton>
      </Grid>
    </Grid>
  );
}

export default function ToolHeader({
  icon,
  title,
  description,
  type
}: ToolHeaderProps) {
  return (
    <Box my={4}>
      <ToolBreadcrumb
        items={[
          { title: 'All tools', link: '/' },
          {
            title: capitalizeFirstLetter(type),
            link: '/categories/' + type
          },
          { title }
        ]}
      />
      <Grid mt={1} container spacing={2}>
        <Grid item xs={12} md={8}>
          <Typography mb={2} fontSize={30} color={'primary'}>
            {title}
          </Typography>
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
