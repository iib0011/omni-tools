import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import { ToolCardProps } from './AllTools';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

export default function ToolCard({ title, description, link }: ToolCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(link)}
      raised
      sx={{
        borderRadius: 2,
        bgcolor: '#5581b5',
        borderColor: '#5581b5',
        color: '#fff',
        boxShadow: '6px 6px 12px #b8b9be, -6px -6px 12px #fff',
        cursor: 'pointer'
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
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
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
