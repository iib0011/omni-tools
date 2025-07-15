import ToolLayout from '../components/ToolLayout';
import React, { JSXElementConstructor, LazyExoticComponent } from 'react';
import { IconifyIcon } from '@iconify/react';
import { FullI18nKey } from '../i18n';
import { useTranslation } from 'react-i18next';

export interface ToolMeta {
  path: string;
  component: LazyExoticComponent<JSXElementConstructor<ToolComponentProps>>;
  keywords: string[];
  icon: IconifyIcon | string;
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
  const { icon, path, keywords, component, i18n } = options;
  const Component = component;
  return {
    type: basePath,
    path: `${basePath}/${path}`,
    name: i18n.name,
    icon,
    description: i18n.description,
    shortDescription: i18n.shortDescription,
    keywords,
    component: function ToolComponent() {
      const { t } = useTranslation();
      return (
        <ToolLayout
          icon={icon}
          type={basePath}
          i18n={i18n}
          fullPath={`${basePath}/${path}`}
        >
          <Component
            title={t(i18n.name)}
            longDescription={
              i18n.longDescription ? t(i18n.longDescription) : undefined
            }
          />
        </ToolLayout>
      );
    }
  };
};
