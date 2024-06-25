import { Button, Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import ToolBreadcrumb from './ToolBreadcrumb';
import { capitalizeFirstLetter } from '../utils/string';
import Grid from '@mui/material/Grid';

interface ToolHeaderProps {
  title: string;
  description: string;
  image?: string;
  type: string;
}

function ToolLinks() {
  return (
    <Grid container spacing={2} mt={1}>
      <Grid item md={12} lg={4}>
        <Button fullWidth variant="outlined" href="#tool">
          Use This Tool
        </Button>
      </Grid>
      <Grid item md={12} lg={4}>
        <Button fullWidth variant="outlined" href="#examples">
          See Examples
        </Button>
      </Grid>
      <Grid item md={12} lg={4}>
        <Button fullWidth variant="outlined" href="#tour">
          Learn How to Use
        </Button>
      </Grid>
    </Grid>
  );
}

export default function ToolHeader({
  image,
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

        {image && (
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img width={'250'} src={image} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
