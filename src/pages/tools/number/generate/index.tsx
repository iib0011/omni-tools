import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { listOfIntegers } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

const initialValues = {
  firstValue: '1',
  numberOfNumbers: '10',
  step: '1',
  separator: '\\n'
};

export default function GenerateNumbers({ title }: ToolComponentProps) {
  const { t } = useTranslation('number');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues) => {
    const { firstValue, numberOfNumbers, separator, step } = optionsValues;
    setResult(
      listOfIntegers(
        Number(firstValue),
        Number(numberOfNumbers),
        Number(step),
        separator
      )
    );
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('generate.arithmeticSequenceOption'),
          component: (
            <Box>
              <TextFieldWithDesc
                description={t('generate.startSequenceDescription')}
                value={values.firstValue}
                onOwnChange={(val) => updateField('firstValue', val)}
                type={'number'}
              />
              <TextFieldWithDesc
                description={t('generate.stepDescription')}
                value={values.step}
                onOwnChange={(val) => updateField('step', val)}
                type={'number'}
              />
              <TextFieldWithDesc
                description={t('generate.numberOfElementsDescription')}
                value={values.numberOfNumbers}
                onOwnChange={(val) => updateField('numberOfNumbers', val)}
                type={'number'}
              />
            </Box>
          )
        },
        {
          title: t('generate.separator'),
          component: (
            <TextFieldWithDesc
              description={t('generate.separatorDescription')}
              value={values.separator}
              onOwnChange={(val) => updateField('separator', val)}
            />
          )
        }
      ]}
      compute={compute}
      resultComponent={
        <ToolTextResult title={t('generate.resultTitle')} value={result} />
      }
    />
  );
}
