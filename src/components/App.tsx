import { BrowserRouter, useRoutes } from 'react-router-dom';
import routesConfig from '../config/routesConfig';
import Navbar from './Navbar';
import { Suspense } from 'react';
import Loading from './Loading';
import { ThemeProvider } from '@mui/material';
import theme from '../config/muiConfig';
import { CustomSnackBarProvider } from '../contexts/CustomSnackBarContext';
import { SnackbarProvider } from 'notistack';
import { tools } from '../tools';

const AppRoutes = () => {
  const updatedRoutesConfig = [...routesConfig];
  tools.forEach((tool) => {
    updatedRoutesConfig.push({ path: tool.path, element: tool.component() });
  });
  return useRoutes(updatedRoutesConfig);
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={5}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        classes={{
          containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
        }}
      >
        <CustomSnackBarProvider>
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<Loading />}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </CustomSnackBarProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
