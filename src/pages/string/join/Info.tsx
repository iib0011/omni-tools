import { Box, Stack, Typography } from '@mui/material';

interface ExampleProps {
  title: string;
  description: string;
}

export default function Example({ title, description }: ExampleProps) {
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2} mt={4}>
      <Box>
        <Typography mb={2} fontSize={30} color={'primary'}>
          {title}
        </Typography>
        <Typography fontSize={20}>{description}</Typography>
      </Box>
    </Stack>
  );
}
