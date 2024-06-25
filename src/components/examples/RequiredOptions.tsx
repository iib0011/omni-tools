import { Box, Stack, TextField, Typography } from '@mui/material';
import { RequiredOptionsProps } from './Examples';
import CheckboxWithDesc from 'components/options/CheckboxWithDesc';

export default function RequiredOptions({
  options
}: {
  options: RequiredOptionsProps;
}) {
  const { joinCharacter, deleteBlankLines, deleteTrailingSpaces } = options;

  const handleBoxClick = () => {
    const toolsElement = document.getElementById('tool');
    if (toolsElement) {
      toolsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Stack direction={'column'} alignItems={'left'} spacing={2}>
      <Typography variant="h5" component="h3" sx={{ marginTop: '5px' }}>
        Required options
      </Typography>
      <Typography variant="body2" component="p">
        These options will be used automatically if you select this example.
      </Typography>

      <Box
        onClick={handleBoxClick}
        sx={{
          zIndex: '2',
          cursor: 'pointer',
          bgcolor: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex'
        }}
      >
        <TextField
          disabled
          value={joinCharacter}
          fullWidth
          rows={1}
          sx={{
            '& .MuiOutlinedInput-root': {
              zIndex: '-1'
            }
          }}
        />
      </Box>

      {deleteBlankLines ? (
        <Box onClick={handleBoxClick}>
          <CheckboxWithDesc
            title="Delete Blank Lines"
            checked={deleteBlankLines}
            onChange={() => {}}
            description="Delete lines that don't have text symbols."
          />
        </Box>
      ) : (
        ''
      )}
      {deleteTrailingSpaces ? (
        <Box onClick={handleBoxClick}>
          <CheckboxWithDesc
            title="Delete Training Spaces"
            checked={deleteTrailingSpaces}
            onChange={() => {}}
            description="Remove spaces and tabs at the end of the lines."
          />
        </Box>
      ) : (
        ''
      )}
    </Stack>
  );
}
