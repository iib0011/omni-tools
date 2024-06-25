import { Button, Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import ToolBreadcrumb from './ToolBreadcrumb';
import { capitalizeFirstLetter } from '../utils/string';

interface ToolHeaderProps {
  title: string;
  description: string;
  image?: string;
  type: string;
}

function ToolLinks() {
  return (
    <Box display="flex" gap={2} my={2}>
      <Button variant="outlined" href="#tool">
        Use This Tool
      </Button>
      <Button variant="outlined" href="#examples">
        See Examples
      </Button>
      <Button variant="outlined" href="#tour">
        Learn How to Use
      </Button>
    </Box>
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
      <Stack direction={'row'} alignItems={'center'} spacing={2}>
        <Box>
          <Typography mb={2} fontSize={30} color={'primary'}>
            {title}
          </Typography>
          <Typography fontSize={20}>{description}</Typography>
          <ToolLinks />
        </Box>
        {image && <img width={'250'} src={image} />}
      </Stack>
    </Box>
  );
}
