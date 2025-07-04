import { Autocomplete, Box, Stack, TextField, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { DefinedTool } from '@tools/defineTool';
import { filterTools, tools } from '@tools/index';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { Icon } from '@iconify/react';

const exampleTools: { label: string; url: string }[] = [
  {
    label: 'Create a transparent image',
    url: '/image-generic/create-transparent'
  },
  { label: 'Prettify JSON', url: '/json/prettify' },
  { label: 'Change GIF speed', url: '/gif/change-speed' },
  { label: 'Sort a list', url: '/list/sort' },
  { label: 'Compress PNG', url: '/png/compress-png' },
  { label: 'Split a text', url: '/string/split' },
  { label: 'Split PDF', url: '/pdf/split-pdf' },
  { label: 'Trim video', url: '/video/trim' },
  { label: 'Calculate number sum', url: '/number/sum' }
];
export default function Hero() {
  const [inputValue, setInputValue] = useState<string>('');
  const theme = useTheme();
  const [filteredTools, setFilteredTools] = useState<DefinedTool[]>(
    _.shuffle(tools)
  );
  const navigate = useNavigate();
  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    setFilteredTools(filterTools(tools, newInputValue));
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
            OmniTools
          </Typography>
        </Typography>
      </Stack>
      <Typography
        sx={{ textAlign: 'center' }}
        fontSize={{ xs: 15, md: 20 }}
        mb={2}
      >
        Boost your productivity with OmniTools, the ultimate toolkit for getting
        things done quickly! Access thousands of user-friendly utilities for
        editing images, text, lists, and data, all directly from your browser.
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
            InputProps={{
              ...params.InputProps,
              endAdornment: <SearchIcon />,
              sx: {
                borderRadius: 4,
                backgroundColor: 'background.paper'
              }
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
            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              <Icon fontSize={20} icon={option.icon} />
              <Box>
                <Typography fontWeight={'bold'}>{option.name}</Typography>
                <Typography fontSize={12}>{option.shortDescription}</Typography>
              </Box>
            </Stack>
          </Box>
        )}
        onChange={(event, newValue) => {
          if (newValue) {
            navigate('/' + newValue.path);
          }
        }}
      />
      <Grid container spacing={2} mt={2}>
        {exampleTools.map((tool) => (
          <Grid
            onClick={() =>
              navigate(tool.url.startsWith('/') ? tool.url : `/${tool.url}`)
            }
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
                borderColor: theme.palette.mode === 'dark' ? '#363b41' : 'grey',
                borderStyle: 'solid',
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'background.hover'
                }
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
