import {BrowserRouter, useRoutes} from "react-router-dom";
import routesConfig from "../config/routesConfig";
import Navbar from "./Navbar";

const AppRoutes = () => {
  return useRoutes(routesConfig);
};

function App() {

  return (
    <BrowserRouter>
      <Navbar/>
      <AppRoutes/>
    </BrowserRouter>
  )
}

export default App
