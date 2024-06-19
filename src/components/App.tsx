import {BrowserRouter, useRoutes} from "react-router-dom";
import routesConfig from "../config/routesConfig";
import Navbar from "./Navbar";
import {Suspense} from "react";
import Loading from "./Loading";
import {ThemeProvider} from "@mui/material";
import theme from "../config/muiConfig";

const AppRoutes = () => {
  return useRoutes(routesConfig);
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Navbar/>
        <Suspense fallback={<Loading/>}>
          <AppRoutes/>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
