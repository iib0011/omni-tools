import {RouteObject} from "react-router-dom";
import {lazy} from "react";

const StringHome = lazy(() => import("./index"));
const StringSplit = lazy(() => import("./split"));

export const StringConfig: RouteObject[] = [
  {path: '', element: <StringHome/>},
  {path: 'split', element: <StringSplit/>},
]
