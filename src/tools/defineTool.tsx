import ToolLayout from '../components/ToolLayout';
import React, { JSXElementConstructor, LazyExoticComponent } from 'react';
import { IconifyIcon } from '@iconify/react';

export type UserType =
  | 'General Users'
  | 'Developers'
  | 'Designers'
  | 'Students'
  | 'CyberSec';

export interface ToolMeta {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<ToolComponentProps>>;
  keywords: string[];
  icon: IconifyIcon | string;
  name: string;
  description: string;
  shortDescription: string;
  longDescription?: string;
  userTypes?: UserType[];
}

export type ToolCategory =
  | 'string'
  | 'image-generic'
  | 'png'
  | 'number'
  | 'gif'
  | 'list'
  | 'json'
  | 'time'
  | 'csv'
  | 'video'
  | 'pdf'
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
  userTypes?: UserType[];
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
    longDescription,
    userTypes
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
    userTypes,
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
