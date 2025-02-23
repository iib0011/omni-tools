import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { DefinedTool } from '@tools/defineTool';
import { filterTools, tools } from '@tools/index';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

const exampleTools: { label: string; url: string }[] = [
  {
    label: 'Create a transparent image',
    url: '/png/create-transparent'
  },
  { label: 'Convert text to morse code', url: '/string/to-morse' },
  { label: 'Change GIF speed', url: '/gif/change-speed' },
  { label: 'Sort a list', url: 'list/sort' },
  { label: 'Repeat text', url: 'string/repeat' },
  { label: 'Split a text', url: '/string/split' },
  { label: 'Calculate number sum', url: '/number/sum' },
  { label: 'Shuffle a list', url: 'list/shuffle' },
  { label: 'Change colors in image', url: 'png/change-colors-in-png' }
];
export default function Hero() {
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredTools, setFilteredTools] = useState<DefinedTool[]>(
    _.shuffle(tools)
  );
  const navigate = useNavigate();
  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    setFilteredTools(_.shuffle(filterTools(tools, newInputValue)));
  };
  return (
    <Box width={{ xs: '90%', md: '80%', lg: '60%' }}>
      <Stack mb={1} direction={'row'} spacing={1} justifyContent={'center'}>
        <Typography sx={{ textAlign: 'center' }} fontSize={{ xs: 25, md: 30 }}>
          Get Things Done Quickly with{' '}
          <Typography
            fontSize={{ xs: 25, md: 30 }}
            display={'inline'}
            color={'primary'}
          >
            Omni Tools
          </Typography>
        </Typography>
      </Stack>
      <Typography
        sx={{ textAlign: 'center' }}
        fontSize={{ xs: 15, md: 20 }}
        mb={2}
      >
        Boost your productivity with Omni Tools, the ultimate toolkit for
        getting things done quickly! Access thousands of user-friendly utilities
        for editing images, text, lists, and data, all directly from your
        browser.
      </Typography>

      <Autocomplete
        sx={{ mb: 2 }}
        autoHighlight
        options={filteredTools}
        inputValue={inputValue}
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
          <Box
            component="li"
            {...props}
            onClick={() => navigate('/' + option.path)}
          >
            <Box>
              <Typography fontWeight={'bold'}>{option.name}</Typography>
              <Typography fontSize={12}>{option.shortDescription}</Typography>
            </Box>
          </Box>
        )}
      />
      <Grid container spacing={2} mt={2}>
        {exampleTools.map((tool) => (
          <Grid
            onClick={() => navigate(tool.url)}
            item
            xs={12}
            md={6}
            lg={4}
            key={tool.label}
          >
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
