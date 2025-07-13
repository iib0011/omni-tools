import {
  Autocomplete,
  Box,
  darken,
  lighten,
  Stack,
  styled,
  TextField,
  useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { DefinedTool } from '@tools/defineTool';
import { filterTools, tools } from '@tools/index';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { Icon } from '@iconify/react';
import { getToolCategoryTitle } from '@utils/string';
import { useTranslation } from 'react-i18next';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor: lighten(theme.palette.primary.light, 0.85),
  ...theme.applyStyles('dark', {
    backgroundColor: darken(theme.palette.primary.main, 0.8)
  })
}));

const GroupItems = styled('ul')({
  padding: 0
});

export default function Hero() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>('');
  const theme = useTheme();
  const [filteredTools, setFilteredTools] = useState<DefinedTool[]>(tools);
  const navigate = useNavigate();

  const exampleTools: { label: string; url: string; translationKey: string }[] =
    [
      {
        label: t('hero.examples.createTransparentImage'),
        url: '/image-generic/create-transparent',
        translationKey: 'hero.examples.createTransparentImage'
      },
      {
        label: t('hero.examples.prettifyJson'),
        url: '/json/prettify',
        translationKey: 'hero.examples.prettifyJson'
      },
      {
        label: t('hero.examples.changeGifSpeed'),
        url: '/gif/change-speed',
        translationKey: 'hero.examples.changeGifSpeed'
      },
      {
        label: t('hero.examples.sortList'),
        url: '/list/sort',
        translationKey: 'hero.examples.sortList'
      },
      {
        label: t('hero.examples.compressPng'),
        url: '/png/compress-png',
        translationKey: 'hero.examples.compressPng'
      },
      {
        label: t('hero.examples.splitText'),
        url: '/string/split',
        translationKey: 'hero.examples.splitText'
      },
      {
        label: t('hero.examples.splitPdf'),
        url: '/pdf/split-pdf',
        translationKey: 'hero.examples.splitPdf'
      },
      {
        label: t('hero.examples.trimVideo'),
        url: '/video/trim',
        translationKey: 'hero.examples.trimVideo'
      },
      {
        label: t('hero.examples.calculateNumberSum'),
        url: '/number/sum',
        translationKey: 'hero.examples.calculateNumberSum'
      }
    ];

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
          {t('hero.title')}{' '}
          <Typography
            fontSize={{ xs: 25, md: 30 }}
            display={'inline'}
            color={'primary'}
          >
            {t('hero.brand')}
          </Typography>
        </Typography>
      </Stack>
      <Typography
        sx={{ textAlign: 'center' }}
        fontSize={{ xs: 15, md: 20 }}
        mb={2}
      >
        {t('hero.description')}
      </Typography>

      <Autocomplete
        sx={{ mb: 2 }}
        autoHighlight
        options={filteredTools}
        groupBy={(option) => option.type}
        renderGroup={(params) => {
          return (
            <li key={params.key}>
              <GroupHeader>{getToolCategoryTitle(params.group)}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          );
        }}
        inputValue={inputValue}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={t('hero.searchPlaceholder')}
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
            key={tool.translationKey}
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
