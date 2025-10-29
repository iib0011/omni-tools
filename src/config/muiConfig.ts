import { createTheme, ThemeOptions } from '@mui/material';

const sharedThemeOptions: ThemeOptions = {
  typography: {
    button: {
      textTransform: 'none'
    }
  },
  zIndex: { snackbar: 100000 }
};

const createThemeWithDirection = (
  options: ThemeOptions,
  direction: 'ltr' | 'rtl' = 'ltr'
) => {
  return createTheme({
    ...options,
    direction
  });
};

export const lightTheme = createThemeWithDirection({
  ...sharedThemeOptions,
  palette: {
    background: {
      default: '#F5F5FA',
      hover: '#FAFAFD',
      lightSecondary: '#EBF5FF',
      darkSecondary: '#5581b5'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: { color: '#ffffff', backgroundColor: '#1976d2' }
      }
    }
  }
});

export const darkTheme = createThemeWithDirection({
  ...sharedThemeOptions,
  palette: {
    mode: 'dark',
    background: {
      default: '#1C1F20',
      paper: '#181a1b',
      hover: '#1a1c1d',
      lightSecondary: '#1E2021',
      darkSecondary: '#3C5F8A'
    },
    text: { primary: '#ffffff' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: { color: '#ffffff', backgroundColor: '#145ea8' }
      }
    }
  }
});

export const lightThemeRTL = createThemeWithDirection(
  {
    ...sharedThemeOptions,
    palette: {
      background: {
        default: '#F5F5FA',
        hover: '#FAFAFD',
        lightSecondary: '#EBF5FF',
        darkSecondary: '#5581b5'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: { color: '#ffffff', backgroundColor: '#1976d2' }
        }
      }
    }
  },
  'rtl'
);

export const darkThemeRTL = createThemeWithDirection(
  {
    ...sharedThemeOptions,
    palette: {
      mode: 'dark',
      background: {
        default: '#1C1F20',
        paper: '#181a1b',
        hover: '#1a1c1d',
        lightSecondary: '#1E2021',
        darkSecondary: '#3C5F8A'
      },
      text: { primary: '#ffffff' }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: { color: '#ffffff', backgroundColor: '#145ea8' }
        }
      }
    }
  },
  'rtl'
);
