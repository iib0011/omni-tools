import { Box, Stack } from '@mui/material';
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import ToolHeader from './ToolHeader';
import Separator from './Separator';
import AllTools from './allTools/AllTools';
import { getToolsByCategory } from '@tools/index';
import {
  capitalizeFirstLetter,
  getI18nNamespaceFromToolCategory
} from '../utils/string';
import { IconifyIcon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { ToolCategory } from '@tools/defineTool';
import { FullI18nKey } from '../i18n';
import { useToolHistory, HistoryEntry } from '../hooks/useToolHistory';
import ToolHistoryDrawer from './ToolHistoryDrawer';

export interface ToolLayoutHistoryConfig {
  /** current raw input string shown in the tool */
  input: string;
  /** current result string produced by the tool */
  result: string;
  /** optional options snapshot (Formik values, etc.) */
  options?: Record<string, unknown>;
  /** called when the user clicks "Restore" on a history entry */
  onRestore: (entry: HistoryEntry) => void;
}

export default function ToolLayout({
  children,
  icon,
  i18n,
  type,
  fullPath,
  historyConfig
}: {
  icon?: IconifyIcon | string;
  type: ToolCategory;
  fullPath: string;
  children: ReactNode;
  i18n?: {
    name: FullI18nKey;
    description: FullI18nKey;
    shortDescription: FullI18nKey;
  };
  historyConfig?: ToolLayoutHistoryConfig;
}) {
  const { t } = useTranslation([
    'translation',
    getI18nNamespaceFromToolCategory(type)
  ]);

  //@ts-ignore
  const toolTitle: string = t(i18n.name);
  //@ts-ignore
  const toolDescription: string = t(i18n.description);

  const otherCategoryTools =
    getToolsByCategory([], t)
      .find((category) => category.type === type)
      ?.tools.filter((tool) => t(tool.name) !== toolTitle)
      .map((tool) => ({
        title: tool.name,
        description: tool.shortDescription,
        link: '/' + tool.path,
        icon: tool.icon
      })) ?? [];

  const { history, pushEntry, clearHistory, removeEntry } = useToolHistory(
    fullPath
  );

  // Push a new history entry whenever input or result changes and both exist
  const prevInputRef = React.useRef('');
  const prevResultRef = React.useRef('');

  React.useEffect(() => {
    if (!historyConfig) return;
    const { input, result, options } = historyConfig;

    const inputChanged = input !== prevInputRef.current;
    const resultChanged = result !== prevResultRef.current;

    if ((inputChanged || resultChanged) && input && result) {
      prevInputRef.current = input;
      prevResultRef.current = result;
      pushEntry(input, result, options);
    }
  }, [historyConfig, pushEntry]);

  return (
    <Box
      width={'100%'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <Helmet title={`${capitalizeFirstLetter(toolTitle)} - OmniTools`} />

      <Box width={'90%'}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box flex={1}>
            <ToolHeader
              icon={icon}
              title={toolTitle}
              description={toolDescription}
              type={type}
              path={fullPath}
            />
          </Box>

          {historyConfig && (
            <Box pt={2}>
              <ToolHistoryDrawer
                history={history}
                onRestore={historyConfig.onRestore}
                onRemove={removeEntry}
                onClear={clearHistory}
              />
            </Box>
          )}
        </Stack>

        {children}

        {otherCategoryTools.length > 0 && (
          <>
            <Separator backgroundColor={'#5581b5'} margin={'50px'} />
            <AllTools
              title={t('translation:categories.otherTools', 'Other tools')}
              toolCards={otherCategoryTools}
            />
          </>
        )}
      </Box>
    </Box>
  );
}