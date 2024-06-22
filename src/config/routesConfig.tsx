import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { lazy } from 'react';

const Home = lazy(() => import('../pages/home'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '*',
    element: <Navigate to="404" />
  }
];

export default routes;
