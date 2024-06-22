import ToolLayout from '../components/ToolLayout';
import React, { LazyExoticComponent, JSXElementConstructor } from 'react';

interface ToolOptions {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<NonNullable<unknown>>>;
  keywords: string[];
  name: string;
  description: string;
}

export interface DefinedTool {
  path: string;
  name: string;
  description: string;
  keywords: string[];
  component: () => JSX.Element;
}

export const defineTool = (
  basePath: string,
  options: ToolOptions
): DefinedTool => {
  const { path, name, description, keywords, component } = options;
  const Component = component;
  return {
    path: `${basePath}/${path}`,
    name,
    description,
    keywords,
    component: () => {
      return (
        <ToolLayout title={name} description={description}>
          <Component />
        </ToolLayout>
      );
    }
  };
};
