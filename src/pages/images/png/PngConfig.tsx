import {RouteObject} from "react-router-dom";
import {lazy} from "react";

const ChangeColorsInPng = lazy(() => import("./change-colors-in-png"));
const PngHome = lazy(() => import("./"));

export const PngConfig: RouteObject[] = [
  {path: '', element: <PngHome/>},
  {path: 'change-colors-in-png', element: <ChangeColorsInPng/>}
]
