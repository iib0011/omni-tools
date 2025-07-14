import ToolLayout from '../components/ToolLayout';
import React, { JSXElementConstructor, LazyExoticComponent } from 'react';
import { IconifyIcon } from '@iconify/react';
import { FullI18nKey } from '../i18n';
import { ParseKeys } from 'i18next';

export interface ToolMeta {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<ToolComponentProps>>;
  keywords: string[];
  icon: IconifyIcon | string;
  name: string;
  description: string;
  shortDescription: string;
  longDescription?: string;
  i18n: {
    name: FullI18nKey;
    description: FullI18nKey;
    shortDescription: FullI18nKey;
    longDescription?: FullI18nKey;
  };
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
  name: FullI18nKey;
  description: FullI18nKey;
  shortDescription: FullI18nKey;
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
    longDescription,
    i18n
  } = options;
  const Component = component;
  return {
    type: basePath,
    path: `${basePath}/${path}`,
    name: i18n?.name || name,
    icon,
    description: i18n?.description || description,
    shortDescription: i18n?.shortDescription || shortDescription,
    keywords,
    component: () => {
      return (
        <ToolLayout
          title={name}
          description={description}
          icon={icon}
          type={basePath}
          i18n={i18n}
        >
          <Component title={name} longDescription={longDescription} />
        </ToolLayout>
      );
    }
  };
};
