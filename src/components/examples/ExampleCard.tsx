import { ExampleCardProps } from './Examples';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  TextField,
  useTheme
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RequiredOptions from './RequiredOptions';

export default function ExampleCard({
  title,
  description,
  sampleText,
  sampleResult,
  requiredOptions,
  changeInputResult
}: ExampleCardProps) {
  const theme = useTheme();
  return (
    <Card
      raised
      sx={{
        bgcolor: theme.palette.background.default,
        height: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'background-color 0.3s ease',
        '&:hover': {
          boxShadow: '12px 9px 11px 2px #b8b9be, -6px -6px 12px #fff'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" borderRadius="5px">
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
        </Box>
        <Stack direction={'column'} alignItems={'center'} spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

          <Box
            onClick={() => changeInputResult(sampleText, sampleResult)}
            sx={{
              display: 'flex',
              zIndex: '2',
              width: '100%',
              height: '100%',
              bgcolor: 'transparent',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #fff;'
            }}
          >
            <TextField
              value={sampleText}
              disabled
              fullWidth
              multiline
              sx={{
                '& .MuiOutlinedInput-root': {
                  zIndex: '-1',
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
            />
          </Box>

          <ArrowDownwardIcon />
          <Box
            onClick={() => changeInputResult(sampleText, sampleResult)}
            sx={{
              display: 'flex',
              zIndex: '2',
              width: '100%',
              height: '100%',
              bgcolor: 'transparent',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #fff;'
            }}
          >
            <TextField
              value={sampleResult}
              disabled
              fullWidth
              multiline
              sx={{
                '& .MuiOutlinedInput-root': {
                  zIndex: '-1',
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
            />
          </Box>

          <RequiredOptions options={requiredOptions} />
        </Stack>
      </CardContent>
    </Card>
  );
}
