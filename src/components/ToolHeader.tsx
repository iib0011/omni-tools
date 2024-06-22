import { Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import textImage from '../assets/text.png';

interface ToolHeaderProps {
  title: string;
  description: string;
}

export default function ToolHeader({ title, description }: ToolHeaderProps) {
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2} mt={4}>
      <Box>
        <Typography mb={2} fontSize={30} color={'primary'}>
          {title}
        </Typography>
        <Typography fontSize={20}>{description}</Typography>
      </Box>
      <img width={'20%'} src={textImage} />
    </Stack>
  );
}
