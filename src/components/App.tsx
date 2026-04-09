import { BrowserRouter, useRoutes } from 'react-router-dom';
import routesConfig from '../config/routesConfig';
import Navbar from './Navbar';
import { Suspense, useState, useEffect } from 'react';
import Loading from './Loading';
import { CssBaseline, Theme, ThemeProvider } from '@mui/material';
import { CustomSnackBarProvider } from '../contexts/CustomSnackBarContext';
import { SnackbarProvider } from 'notistack';
import { tools } from '../tools';
import './index.css';
import {
  darkTheme,
  lightTheme,
  darkThemeRTL,
  lightThemeRTL
} from '../config/muiConfig';
import ScrollToTopButton from './ScrollToTopButton';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { UserTypeFilterProvider } from 'providers/UserTypeFilterProvider';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

export type Mode = 'dark' | 'light' | 'system';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin]
});

const cacheLtr = createCache({
  key: 'muiltr'
});

// RTL languages
const RTL_LANGUAGES = ['ar'];

const AppRoutes = () => {
  const updatedRoutesConfig = [...routesConfig];
  tools.forEach((tool) => {
    updatedRoutesConfig.push({ path: tool.path, element: tool.component() });
  });
  return useRoutes(updatedRoutesConfig);
};

function App() {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem('theme') || 'system') as Mode
  );
  const [isRTL, setIsRTL] = useState<boolean>(() =>
    RTL_LANGUAGES.includes(i18n.language)
  );
  const [theme, setTheme] = useState<Theme>(() => getTheme(mode, isRTL));

  useEffect(() => setTheme(getTheme(mode, isRTL)), [mode, isRTL]);

  // Update RTL state and document direction when language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const shouldBeRTL = RTL_LANGUAGES.includes(lng);
      setIsRTL(shouldBeRTL);
      document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
    };

    // Set initial direction
    handleLanguageChange(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Make sure to update the theme when the mode changes
  useEffect(() => {
    const systemDarkModeQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(
        e.matches
          ? isRTL
            ? darkThemeRTL
            : darkTheme
          : isRTL
            ? lightThemeRTL
            : lightTheme
      );
    };
    systemDarkModeQuery.addEventListener('change', handleThemeChange);

    return () => {
      systemDarkModeQuery.removeEventListener('change', handleThemeChange);
    };
  }, [isRTL]);

  return (
    <I18nextProvider i18n={i18n}>
      <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
          >
            <CustomSnackBarProvider>
              <UserTypeFilterProvider>
                <BrowserRouter>
                  <Navbar
                    mode={mode}
                    onChangeMode={() => {
                      setMode((prev) => nextMode(prev));
                      localStorage.setItem('theme', nextMode(mode));
                    }}
                  />
                  <Suspense fallback={<Loading />}>
                    <AppRoutes />
                  </Suspense>
                </BrowserRouter>
              </UserTypeFilterProvider>
            </CustomSnackBarProvider>
          </SnackbarProvider>
          <ScrollToTopButton />
        </ThemeProvider>
      </CacheProvider>
    </I18nextProvider>
  );
}

function getTheme(mode: Mode, isRTL: boolean): Theme {
  switch (mode) {
    case 'dark':
      return isRTL ? darkThemeRTL : darkTheme;
    case 'light':
      return isRTL ? lightThemeRTL : lightTheme;
    default:
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? isRTL
          ? darkThemeRTL
          : darkTheme
        : isRTL
          ? lightThemeRTL
          : lightTheme;
  }
}

function nextMode(mode: Mode): Mode {
  return mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
}

export default App;
