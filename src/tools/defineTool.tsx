import ToolLayout from '../components/ToolLayout';
import React, { JSXElementConstructor, LazyExoticComponent } from 'react';
import { IconifyIcon } from '@iconify/react';

export interface ToolMeta {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<ToolComponentProps>>;
  keywords: string[];
  icon: IconifyIcon | string;
  name: string;
  description: string;
  shortDescription: string;
  longDescription?: string;
}

export type ToolCategory =
  | 'string'
  | 'png'
  | 'number'
  | 'gif'
  | 'video'
  | 'list'
  | 'json'
  | 'time'
  | 'csv'
  | 'pdf'
  | 'image-generic'
  | 'audio'
  | 'xml';

export interface DefinedTool {
  type: ToolCategory;
  path: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: IconifyIcon | string;
  keywords: string[];
  component: () => JSX.Element;
}

export interface ToolComponentProps {
  title: string;
  longDescription?: string;
}

export const defineTool = (
  basePath: ToolCategory,
  options: ToolMeta
): DefinedTool => {
  const {
    icon,
    path,
    name,
    description,
    keywords,
    component,
    shortDescription,
    longDescription
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
          <Component title={name} longDescription={longDescription} />
        </ToolLayout>
      );
    }
  };
};
