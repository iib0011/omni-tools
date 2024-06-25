import { Button, Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

interface ToolHeaderProps {
  title: string;
  description: string;
  image?: string;
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
  description
}: ToolHeaderProps) {
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2} my={4}>
      <Box>
        <Typography mb={2} fontSize={30} color={'primary'}>
          {title}
        </Typography>
        <Typography fontSize={20}>{description}</Typography>
        <ToolLinks />
      </Box>
      {image && <img width={'250'} src={image} />}
    </Stack>
  );
}
