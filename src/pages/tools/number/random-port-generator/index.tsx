import { Box, Alert, Chip } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import {
  generateRandomPorts,
  validateInput,
  formatPorts,
  getPortRangeInfo,
  isCommonPort,
  getPortService
} from './service';
import { InitialValuesType, RandomPortResult } from './types';
import { useTranslation } from 'react-i18next';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import RadioWithTextField from '@components/options/RadioWithTextField';

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
  const { t } = useTranslation();
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
      setError(t('number:randomPortGenerator.error.generationFailed'));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('number:randomPortGenerator.options.range.title'),
      component: (
        <Box>
          <RadioWithTextField
            value={values.portRange}
            onTextChange={(value: any) => updateField('portRange', value)}
            options={[
              {
                value: 'well-known',
                label: t('number:randomPortGenerator.options.range.wellKnown')
              },
              {
                value: 'registered',
                label: t('number:randomPortGenerator.options.range.registered')
              },
              {
                value: 'dynamic',
                label: t('number:randomPortGenerator.options.range.dynamic')
              },
              {
                value: 'custom',
                label: t('number:randomPortGenerator.options.range.custom')
              }
            ]}
          />

          {values.portRange === 'custom' && (
            <Box sx={{ mt: 2 }}>
              <TextFieldWithDesc
                value={values.minPort.toString()}
                onOwnChange={(value) =>
                  updateField('minPort', parseInt(value) || 1024)
                }
                description={t(
                  'number:randomPortGenerator.options.range.minPortDescription'
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
                  'number:randomPortGenerator.options.range.maxPortDescription'
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
      title: t('number:randomPortGenerator.options.generation.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.count.toString()}
            onOwnChange={(value) => updateField('count', parseInt(value) || 5)}
            description={t(
              'number:randomPortGenerator.options.generation.countDescription'
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
              'number:randomPortGenerator.options.generation.allowDuplicates.title'
            )}
            checked={values.allowDuplicates}
            onChange={(value) => updateField('allowDuplicates', value)}
            description={t(
              'number:randomPortGenerator.options.generation.allowDuplicates.description'
            )}
          />

          <CheckboxWithDesc
            title={t(
              'number:randomPortGenerator.options.generation.sortResults.title'
            )}
            checked={values.sortResults}
            onChange={(value) => updateField('sortResults', value)}
            description={t(
              'number:randomPortGenerator.options.generation.sortResults.description'
            )}
          />
        </Box>
      )
    },
    {
      title: t('number:randomPortGenerator.options.output.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.separator}
            onOwnChange={(value) => updateField('separator', value)}
            description={t(
              'number:randomPortGenerator.options.output.separatorDescription'
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
                title={t('number:randomPortGenerator.result.title')}
                value={formattedResult}
              />

              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${t('number:randomPortGenerator.result.range')}: ${
                    result.range.min
                  } - ${result.range.max}`}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`${t('number:randomPortGenerator.result.count')}: ${
                    result.count
                  }`}
                  variant="outlined"
                  color="secondary"
                />
                {result.hasDuplicates && (
                  <Chip
                    label={t('number:randomPortGenerator.result.hasDuplicates')}
                    variant="outlined"
                    color="warning"
                  />
                )}
                {result.isSorted && (
                  <Chip
                    label={t('number:randomPortGenerator.result.isSorted')}
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>

              {result.ports.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <strong>
                    {t('number:randomPortGenerator.result.portDetails')}:
                  </strong>
                  <Box
                    sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  >
                    {result.ports.slice(0, 10).map((port, index) => (
                      <Chip
                        key={index}
                        label={`${port}${
                          isCommonPort(port) ? ` (${getPortService(port)})` : ''
                        }`}
                        variant="outlined"
                        size="small"
                        color={isCommonPort(port) ? 'warning' : 'default'}
                      />
                    ))}
                    {result.ports.length > 10 && (
                      <Chip
                        label={`+${result.ports.length - 10} more`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      }
      toolInfo={{
        title: t('number:randomPortGenerator.info.title'),
        description:
          longDescription || t('number:randomPortGenerator.info.description')
      }}
    />
  );
}
