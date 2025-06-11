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
import i18n from 'i18n/i18n';

const exampleTools: { label: string; url: string }[] = [
  {
    label: i18n.t('createTransparentPng'),
    url: '/image-generic/create-transparent'
  },
  { label: i18n.t('prettifyJson'), url: '/json/prettify' },
  { label: i18n.t('changeGifSpeed'), url: '/gif/change-speed' },
  { label: i18n.t('sortList'), url: '/list/sort' },
  { label: i18n.t('compressPng'), url: '/png/compress-png' },
  { label: i18n.t('splitText'), url: '/string/split' },
  { label: i18n.t('splitPdf'), url: '/pdf/split-pdf' },
  { label: i18n.t('trimVideo'), url: '/video/trim' },
  { label: i18n.t('numberSumCalculator'), url: '/number/sum' }
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
          {i18n.t('titlePage')}{' '}
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
        {i18n.t('titleDescription')}
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
            placeholder={i18n.t('searchPlaceholder')}
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
