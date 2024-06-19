import {RouteObject} from "react-router-dom";
import {lazy} from "react";
import {PngConfig} from "./png/PngConfig";

const PngHome = lazy(() => import("./index"));

export const ImagesConfig: RouteObject[] = [
  {path: '', element: <PngHome/>},
  {path: 'png', children: PngConfig},
]
