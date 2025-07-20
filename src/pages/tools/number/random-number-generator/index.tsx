import { Box, Alert, Chip } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { generateRandomNumbers, validateInput, formatNumbers } from './service';
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
  const { t } = useTranslation();
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
      setError(t('number:randomNumberGenerator.error.generationFailed'));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('number:randomNumberGenerator.options.range.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.minValue.toString()}
            onOwnChange={(value) =>
              updateField('minValue', parseInt(value) || 1)
            }
            description={t(
              'number:randomNumberGenerator.options.range.minDescription'
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
              'number:randomNumberGenerator.options.range.maxDescription'
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
      title: t('number:randomNumberGenerator.options.generation.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.count.toString()}
            onOwnChange={(value) => updateField('count', parseInt(value) || 10)}
            description={t(
              'number:randomNumberGenerator.options.generation.countDescription'
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
              'number:randomNumberGenerator.options.generation.allowDecimals.title'
            )}
            checked={values.allowDecimals}
            onChange={(value) => updateField('allowDecimals', value)}
            description={t(
              'number:randomNumberGenerator.options.generation.allowDecimals.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'number:randomNumberGenerator.options.generation.allowDuplicates.title'
            )}
            checked={values.allowDuplicates}
            onChange={(value) => updateField('allowDuplicates', value)}
            description={t(
              'number:randomNumberGenerator.options.generation.allowDuplicates.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'number:randomNumberGenerator.options.generation.sortResults.title'
            )}
            checked={values.sortResults}
            onChange={(value) => updateField('sortResults', value)}
            description={t(
              'number:randomNumberGenerator.options.generation.sortResults.description'
            )}
          />
        </Box>
      )
    },
    {
      title: t('number:randomNumberGenerator.options.output.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.separator}
            onOwnChange={(value) => updateField('separator', value)}
            description={t(
              'number:randomNumberGenerator.options.output.separatorDescription'
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
            <Box>
              <ToolTextResult
                title={t('number:randomNumberGenerator.result.title')}
                value={formattedResult}
              />

              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${t('number:randomNumberGenerator.result.range')}: ${
                    result.min
                  } - ${result.max}`}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`${t('number:randomNumberGenerator.result.count')}: ${
                    result.count
                  }`}
                  variant="outlined"
                  color="secondary"
                />
                {result.hasDuplicates && (
                  <Chip
                    label={t(
                      'number:randomNumberGenerator.result.hasDuplicates'
                    )}
                    variant="outlined"
                    color="warning"
                  />
                )}
                {result.isSorted && (
                  <Chip
                    label={t('number:randomNumberGenerator.result.isSorted')}
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      }
      toolInfo={{
        title: t('number:randomNumberGenerator.info.title'),
        description:
          longDescription || t('number:randomNumberGenerator.info.description')
      }}
    />
  );
}
