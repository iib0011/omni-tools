import { Alert, Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import {
  formatPorts,
  generateRandomPorts,
  getPortRangeInfo,
  validateInput
} from './service';
import { InitialValuesType, RandomPortResult } from './types';
import { useTranslation } from 'react-i18next';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';

const initialValues: InitialValuesType = {
  portRange: 'registered',
  minPort: 1024,
  maxPort: 49151,
  count: 5,
  allowDuplicates: false,
  sortResults: false,
  separator: ', '
};

export default function RandomPortGenerator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('number');
  const [result, setResult] = useState<RandomPortResult | null>(null);
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

      // Generate random ports
      const randomResult = generateRandomPorts(values);
      setResult(randomResult);

      // Format for display
      const formatted = formatPorts(randomResult.ports, values.separator);
      setFormattedResult(formatted);
    } catch (err) {
      console.error('Random port generation failed:', err);
      setError(t('randomPortGenerator.error.generationFailed'));
    }
  };
  const portOptions = [
    {
      value: 'well-known',
      label: t('randomPortGenerator.options.range.wellKnown')
    },
    {
      value: 'registered',
      label: t('randomPortGenerator.options.range.registered')
    },
    {
      value: 'dynamic',
      label: t('randomPortGenerator.options.range.dynamic')
    },
    {
      value: 'custom',
      label: t('randomPortGenerator.options.range.custom')
    }
  ] as const;
  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('randomPortGenerator.options.range.title'),
      component: (
        <Box>
          {portOptions.map((option) => (
            <SimpleRadio
              key={option.value}
              title={option.label}
              checked={values.portRange === option.value}
              onClick={() => updateField('portRange', option.value)}
            />
          ))}

          {values.portRange === 'custom' && (
            <Box sx={{ mt: 2 }}>
              <TextFieldWithDesc
                value={values.minPort.toString()}
                onOwnChange={(value) =>
                  updateField('minPort', parseInt(value) || 1024)
                }
                description={t(
                  'randomPortGenerator.options.range.minPortDescription'
                )}
                inputProps={{
                  type: 'number',
                  min: 1,
                  max: 65535,
                  'data-testid': 'min-port-input'
                }}
              />
              <TextFieldWithDesc
                value={values.maxPort.toString()}
                onOwnChange={(value) =>
                  updateField('maxPort', parseInt(value) || 49151)
                }
                description={t(
                  'randomPortGenerator.options.range.maxPortDescription'
                )}
                inputProps={{
                  type: 'number',
                  min: 1,
                  max: 65535,
                  'data-testid': 'max-port-input'
                }}
              />
            </Box>
          )}

          <Box
            sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
          >
            <strong>{getPortRangeInfo(values.portRange).name}</strong>
            <br />
            {getPortRangeInfo(values.portRange).description}
          </Box>
        </Box>
      )
    },
    {
      title: t('randomPortGenerator.options.generation.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.count.toString()}
            onOwnChange={(value) => updateField('count', parseInt(value) || 5)}
            description={t(
              'randomPortGenerator.options.generation.countDescription'
            )}
            inputProps={{
              type: 'number',
              min: 1,
              max: 1000,
              'data-testid': 'count-input'
            }}
          />

          <CheckboxWithDesc
            title={t(
              'randomPortGenerator.options.generation.allowDuplicates.title'
            )}
            checked={values.allowDuplicates}
            onChange={(value) => updateField('allowDuplicates', value)}
            description={t(
              'randomPortGenerator.options.generation.allowDuplicates.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'randomPortGenerator.options.generation.sortResults.title'
            )}
            checked={values.sortResults}
            onChange={(value) => updateField('sortResults', value)}
            description={t(
              'randomPortGenerator.options.generation.sortResults.description'
            )}
          />
        </Box>
      )
    },
    {
      title: t('randomPortGenerator.options.output.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.separator}
            onOwnChange={(value) => updateField('separator', value)}
            description={t(
              'randomPortGenerator.options.output.separatorDescription'
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
              title={t('randomPortGenerator.result.title')}
              value={formattedResult}
            />
          )}
        </Box>
      }
      toolInfo={{
        title: t('randomPortGenerator.info.title'),
        description:
          longDescription || t('randomPortGenerator.info.description')
      }}
    />
  );
}
