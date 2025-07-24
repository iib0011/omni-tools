import { Alert, Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { formatNumbers, generateRandomNumbers, validateInput } from './service';
import { InitialValuesType, RandomNumberResult } from './types';
import { useTranslation } from 'react-i18next';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const initialValues: InitialValuesType = {
  minValue: 1,
  maxValue: 100,
  count: 10,
  allowDecimals: false,
  allowDuplicates: true,
  sortResults: false,
  separator: ', '
};

export default function RandomNumberGenerator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('number');
  const [result, setResult] = useState<RandomNumberResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedResult, setFormattedResult] = useState<string>('');

  const compute = (values: InitialValuesType) => {
    try {
      setError(null);
      setResult(null);
      setFormattedResult('');

      // Validate input
      const validationError = validateInput(values);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Generate random numbers
      const randomResult = generateRandomNumbers(values);
      setResult(randomResult);

      // Format for display
      const formatted = formatNumbers(
        randomResult.numbers,
        values.separator,
        values.allowDecimals
      );
      setFormattedResult(formatted);
    } catch (err) {
      console.error('Random number generation failed:', err);
      setError(t('randomNumberGenerator.error.generationFailed'));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('randomNumberGenerator.options.range.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.minValue.toString()}
            onOwnChange={(value) =>
              updateField('minValue', parseInt(value) || 1)
            }
            description={t(
              'randomNumberGenerator.options.range.minDescription'
            )}
            inputProps={{
              type: 'number',
              'data-testid': 'min-value-input'
            }}
          />
          <TextFieldWithDesc
            value={values.maxValue.toString()}
            onOwnChange={(value) =>
              updateField('maxValue', parseInt(value) || 100)
            }
            description={t(
              'randomNumberGenerator.options.range.maxDescription'
            )}
            inputProps={{
              type: 'number',
              'data-testid': 'max-value-input'
            }}
          />
        </Box>
      )
    },
    {
      title: t('randomNumberGenerator.options.generation.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.count.toString()}
            onOwnChange={(value) => updateField('count', parseInt(value) || 10)}
            description={t(
              'randomNumberGenerator.options.generation.countDescription'
            )}
            inputProps={{
              type: 'number',
              min: 1,
              max: 10000,
              'data-testid': 'count-input'
            }}
          />

          <CheckboxWithDesc
            title={t(
              'randomNumberGenerator.options.generation.allowDecimals.title'
            )}
            checked={values.allowDecimals}
            onChange={(value) => updateField('allowDecimals', value)}
            description={t(
              'randomNumberGenerator.options.generation.allowDecimals.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'randomNumberGenerator.options.generation.allowDuplicates.title'
            )}
            checked={values.allowDuplicates}
            onChange={(value) => updateField('allowDuplicates', value)}
            description={t(
              'randomNumberGenerator.options.generation.allowDuplicates.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'randomNumberGenerator.options.generation.sortResults.title'
            )}
            checked={values.sortResults}
            onChange={(value) => updateField('sortResults', value)}
            description={t(
              'randomNumberGenerator.options.generation.sortResults.description'
            )}
          />
        </Box>
      )
    },
    {
      title: t('randomNumberGenerator.options.output.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.separator}
            onOwnChange={(value) => updateField('separator', value)}
            description={t(
              'randomNumberGenerator.options.output.separatorDescription'
            )}
            inputProps={{
              'data-testid': 'separator-input'
            }}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      compute={compute}
      getGroups={getGroups}
      resultComponent={
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <ToolTextResult
              title={t('randomNumberGenerator.result.title')}
              value={formattedResult}
            />
          )}
        </Box>
      }
      toolInfo={{
        title: t('randomNumberGenerator.info.title'),
        description:
          longDescription || t('randomNumberGenerator.info.description')
      }}
    />
  );
}
