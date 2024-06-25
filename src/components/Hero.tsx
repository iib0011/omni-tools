import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { DefinedTool } from '@tools/defineTool';
import { filterTools, tools } from '@tools/index';
import { useNavigate } from 'react-router-dom';

const exampleTools: { label: string; url: string }[] = [
  {
    label: 'Create a transparent image',
    url: '/png/create-transparent'
  },
  { label: 'Convert text to morse code', url: '/string/to-morse' },
  { label: 'Change GIF speed', url: '' },
  { label: 'Pick a random item', url: '' },
  { label: 'Find and replace text', url: '' },
  { label: 'Convert emoji to image', url: '' },
  { label: 'Split a string', url: '/string/split' },
  { label: 'Calculate number sum', url: '/number/sum' },
  { label: 'Pixelate an image', url: '' }
];
export default function Hero() {
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredTools, setFilteredTools] = useState<DefinedTool[]>(tools);
  const navigate = useNavigate();
  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    setFilteredTools(filterTools(tools, newInputValue));
  };
  return (
    <Box width={'60%'}>
      <Stack mb={1} direction={'row'} spacing={1}>
        <Typography fontSize={30}>Transform Your Workflow with </Typography>
        <Typography fontSize={30} color={'primary'}>
          Omni Tools
        </Typography>
      </Stack>
      <Typography fontSize={20} mb={2}>
        Boost your productivity with Omni Tools, the ultimate toolkit for
        getting things done quickly! Access thousands of user-friendly utilities
        for editing images, text, lists, and data, all directly from your
        browser.
      </Typography>

      <Autocomplete
        sx={{ mb: 2 }}
        autoHighlight
        options={filteredTools}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={'Search all tools'}
            sx={{ borderRadius: 2 }}
            InputProps={{
              ...params.InputProps,
              endAdornment: <SearchIcon />
            }}
            onChange={(event) => handleInputChange(event, event.target.value)}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} onClick={() => navigate(option.path)}>
            <Box>
              <Typography fontWeight={'bold'}>{option.name}</Typography>
              <Typography fontSize={12}>{option.shortDescription}</Typography>
            </Box>
          </Box>
        )}
      />
      <Grid container spacing={2} mt={2}>
        {exampleTools.map((tool) => (
          <Grid onClick={() => navigate(tool.url)} item xs={4} key={tool.label}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                padding: 1,
                borderRadius: 3,
                borderColor: 'grey',
                borderStyle: 'solid',
                cursor: 'pointer'
              }}
            >
              <Typography>{tool.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
