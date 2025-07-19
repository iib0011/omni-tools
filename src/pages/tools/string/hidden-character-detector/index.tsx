import React, { useState } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { InitialValuesType } from './types';
import { analyzeHiddenCharacters } from './service';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';

const initialValues: InitialValuesType = {
  showUnicodeCodes: true,
  highlightRTL: true,
  showInvisibleChars: true,
  includeZeroWidthChars: true
};

export default function HiddenCharacterDetector({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);

  const compute = (values: InitialValuesType, input: string) => {
    if (!input.trim()) return;

    try {
      const analysisResult = analyzeHiddenCharacters(input, values);
      setAnalysis(analysisResult);

      if (analysisResult.totalHiddenChars === 0) {
        setResult(t('string:hiddenCharacterDetector.noHiddenChars'));
      } else {
        let output = t('string:hiddenCharacterDetector.foundChars', {
          count: analysisResult.totalHiddenChars
        });

        analysisResult.hiddenCharacters.forEach((char: any) => {
          output += `${t('string:hiddenCharacterDetector.position')} ${
            char.position
          }: ${char.name} (${char.unicode})\n`;
          if (values.showUnicodeCodes) {
            output += `  ${t('string:hiddenCharacterDetector.unicode')}: ${
              char.unicode
            }\n`;
          }
          output += `  ${t('string:hiddenCharacterDetector.category')}: ${
            char.category
          }\n`;
          if (char.isRTL)
            output += `  ⚠️  ${t(
              'string:hiddenCharacterDetector.rtlOverride'
            )}\n`;
          if (char.isInvisible)
            output += `  👁️  ${t(
              'string:hiddenCharacterDetector.invisibleChar'
            )}\n`;
          if (char.isZeroWidth)
            output += `  📏  ${t(
              'string:hiddenCharacterDetector.zeroWidthChar'
            )}\n`;
          output += '\n';
        });

        if (analysisResult.hasRTLOverride) {
          output += `⚠️  ${t('string:hiddenCharacterDetector.rtlWarning')}\n`;
        }

        setResult(output);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string:hiddenCharacterDetector.analysisOptions'),
      component: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('string:hiddenCharacterDetector.optionsDescription')}
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <Box>
          <ToolTextInput
            value={input}
            onChange={setInput}
            title={t('string:hiddenCharacterDetector.inputTitle')}
            placeholder={t('string:hiddenCharacterDetector.inputPlaceholder')}
          />

          {analysis && analysis.hasRTLOverride && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('string:hiddenCharacterDetector.rtlAlert')}
            </Alert>
          )}

          {analysis && analysis.totalHiddenChars > 0 && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fff3cd' }}>
              <Typography variant="h6" gutterBottom>
                {t('string:hiddenCharacterDetector.summary')}
              </Typography>
              <Typography variant="body2">
                {t('string:hiddenCharacterDetector.totalChars', {
                  count: analysis.totalHiddenChars
                })}
                {analysis.hasRTLOverride &&
                  ` • ${t('string:hiddenCharacterDetector.rtlFound')}`}
                {analysis.hasInvisibleChars &&
                  ` • ${t('string:hiddenCharacterDetector.invisibleFound')}`}
                {analysis.hasZeroWidthChars &&
                  ` • ${t('string:hiddenCharacterDetector.zeroWidthFound')}`}
              </Typography>
            </Paper>
          )}
        </Box>
      }
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      toolInfo={{
        title: `What is ${title}?`,
        description:
          longDescription ||
          'A tool to detect hidden Unicode characters, especially RTL Override characters that could be used in attacks.'
      }}
    />
  );
}
