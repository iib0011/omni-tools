import {
  Box,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { ToolCardProps } from './AllTools';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function ToolCard({
  title,
  description,
  link,
  icon
}: ToolCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(link)}
      raised
      sx={{
        borderRadius: 2,
        bgcolor: 'background.darkSecondary',
        borderColor: 'background.darkSecondary',
        color: '#fff',
        boxShadow:
          theme.palette.mode === 'dark'
            ? null
            : '6px 6px 12px #b8b9be, -6px -6px 12px #fff',
        cursor: 'pointer',
        height: '100%',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{
            paddingBottom: 1,
            borderBottomWidth: 1,
            borderColor: '#ffffff70'
          }}
        >
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Icon icon={icon} fontSize={25} />
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
          </Stack>
          <Link href={link} underline="none" sx={{ color: '#fff' }}>
            <ChevronRightIcon />
          </Link>
        </Box>
        <Typography variant="body2" mt={2} color="#fff">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
