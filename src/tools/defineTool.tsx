import ToolLayout from '../components/ToolLayout';
import React, { LazyExoticComponent, JSXElementConstructor } from 'react';

interface ToolOptions {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<NonNullable<unknown>>>;
  keywords: string[];
  image?: string;
  name: string;
  description: string;
  shortDescription: string;
}

export interface DefinedTool {
  type: string;
  path: string;
  name: string;
  description: string;
  shortDescription: string;
  image?: string;
  keywords: string[];
  component: () => JSX.Element;
}

export const defineTool = (
  basePath: string,
  options: ToolOptions
): DefinedTool => {
  const {
    image,
    path,
    name,
    description,
    keywords,
    component,
    shortDescription
  } = options;
  const Component = component;
  return {
    type: basePath,
    path: `${basePath}/${path}`,
    name,
    image,
    description,
    shortDescription,
    keywords,
    component: () => {
      return (
        <ToolLayout
          type={basePath}
          title={name}
          description={description}
          image={image}
        >
          <Component />
        </ToolLayout>
      );
    }
  };
};
