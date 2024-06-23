import { Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

interface ToolHeaderProps {
  title: string;
  description: string;
  image?: string;
}

export default function ToolHeader({
  image,
  title,
  description
}: ToolHeaderProps) {
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2} mt={4}>
      <Box>
        <Typography mb={2} fontSize={30} color={'primary'}>
          {title}
        </Typography>
        <Typography fontSize={20}>{description}</Typography>
      </Box>
      {image && <img width={'250'} src={image} />}
    </Stack>
  );
}
