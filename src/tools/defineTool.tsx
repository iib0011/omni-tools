import ToolLayout from '../components/ToolLayout';
import React, { JSXElementConstructor, LazyExoticComponent } from 'react';
import { IconifyIcon } from '@iconify/react';

interface ToolOptions {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<NonNullable<unknown>>>;
  keywords: string[];
  icon?: IconifyIcon | string;
  name: string;
  description: string;
  shortDescription: string;
}

export type ToolCategory = 'string' | 'png' | 'number' | 'gif' | 'list';

export interface DefinedTool {
  type: ToolCategory;
  path: string;
  name: string;
  description: string;
  shortDescription: string;
  icon?: IconifyIcon | string;
  keywords: string[];
  component: () => JSX.Element;
}

export const defineTool = (
  basePath: ToolCategory,
  options: ToolOptions
): DefinedTool => {
  const {
    icon,
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
    icon,
    description,
    shortDescription,
    keywords,
    component: () => {
      return (
        <ToolLayout
          title={name}
          description={description}
          icon={icon}
          type={basePath}
        >
          <Component />
        </ToolLayout>
      );
    }
  };
};
