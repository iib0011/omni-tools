import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExampleOptions from './ExampleOptions';
import { GetGroupsType } from '@components/options/ToolOptions';

export interface ExampleCardProps<T> {
  title: string;
  description: string;
  sampleText: string;
  sampleResult: string;
  sampleOptions: T;
  changeInputResult: (newInput: string, newOptions: T) => void;
  getGroups: GetGroupsType<T> | null;
}

export default function ExampleCard<T>({
  title,
  description,
  sampleText,
  sampleResult,
  sampleOptions,
  changeInputResult,
  getGroups
}: ExampleCardProps<T>) {
  const theme = useTheme();
  return (
    <Card
      raised
      onClick={() => {
        changeInputResult(sampleText, sampleOptions);
      }}
      sx={{
        bgcolor: theme.palette.background.default,
        height: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'background-color 0.3s ease',
        cursor: 'pointer',
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
            sx={{
              display: 'flex',
              zIndex: '2',
              width: '100%',
              height: '100%',
              bgcolor: 'transparent',
              padding: '5px 10px',
              borderRadius: '5px',
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

          <ExampleOptions options={sampleOptions} getGroups={getGroups} />
        </Stack>
      </CardContent>
    </Card>
  );
}
