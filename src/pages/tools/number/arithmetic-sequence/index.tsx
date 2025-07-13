import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextResult from '@components/result/ToolTextResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { generateArithmeticSequence } from './service';
import * as Yup from 'yup';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

type InitialValuesType = {
  firstTerm: string;
  commonDifference: string;
  numberOfTerms: string;
  separator: string;
};

const initialValues: InitialValuesType = {
  firstTerm: '1',
  commonDifference: '2',
  numberOfTerms: '10',
  separator: ', '
};

const validationSchema = Yup.object({
  firstTerm: Yup.number().required('First term is required'),
  commonDifference: Yup.number().required('Common difference is required'),
  numberOfTerms: Yup.number()
    .min(1, 'Must generate at least 1 term')
    .max(1000, 'Maximum 1000 terms allowed')
    .required('Number of terms is required'),
  separator: Yup.string().required('Separator is required')
});

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic Arithmetic Sequence',
    description:
      'Generate a sequence starting at 1, increasing by 2, for 5 terms',
    sampleOptions: {
      firstTerm: '1',
      commonDifference: '2',
      numberOfTerms: '5',
      separator: ', '
    },
    sampleResult: '1, 3, 5, 7, 9'
  },
  {
    title: 'Negative Sequence',
    description: 'Generate a decreasing sequence starting at 10',
    sampleOptions: {
      firstTerm: '10',
      commonDifference: '-3',
      numberOfTerms: '4',
      separator: ' → '
    },
    sampleResult: '10 → 7 → 4 → 1'
  },
  {
    title: 'Decimal Sequence',
    description: 'Generate a sequence with decimal numbers',
    sampleOptions: {
      firstTerm: '0.5',
      commonDifference: '0.5',
      numberOfTerms: '6',
      separator: ' '
    },
    sampleResult: '0.5 1 1.5 2 2.5 3'
  }
];

export default function ArithmeticSequence({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<string>('');

  return (
    <ToolContent
      title={title}
      inputComponent={null}
      resultComponent={
        <ToolTextResult
          title={t('number:arithmeticSequence.resultTitle')}
          value={result}
        />
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      exampleCards={exampleCards}
      toolInfo={{
        title: t('number:arithmeticSequence.toolInfo.title'),
        description: t('number:arithmeticSequence.toolInfo.description')
      }}
      getGroups={({ values, updateField }) => [
        {
          title: t('number:arithmeticSequence.sequenceParameters'),
          component: (
            <Box>
              <TextFieldWithDesc
                description={t(
                  'number:arithmeticSequence.firstTermDescription'
                )}
                value={values.firstTerm}
                onOwnChange={(val) => updateField('firstTerm', val)}
                type="number"
              />
              <TextFieldWithDesc
                description={t(
                  'number:arithmeticSequence.commonDifferenceDescription'
                )}
                value={values.commonDifference}
                onOwnChange={(val) => updateField('commonDifference', val)}
                type="number"
              />
              <TextFieldWithDesc
                description={t(
                  'number:arithmeticSequence.numberOfTermsDescription'
                )}
                value={values.numberOfTerms}
                onOwnChange={(val) => updateField('numberOfTerms', val)}
                type="number"
              />
            </Box>
          )
        },
        {
          title: t('number:arithmeticSequence.outputFormat'),
          component: (
            <TextFieldWithDesc
              description={t('number:arithmeticSequence.separatorDescription')}
              value={values.separator}
              onOwnChange={(val) => updateField('separator', val)}
            />
          )
        }
      ]}
      compute={(values) => {
        const sequence = generateArithmeticSequence(
          Number(values.firstTerm),
          Number(values.commonDifference),
          Number(values.numberOfTerms),
          values.separator
        );
        setResult(sequence);
      }}
    />
  );
}
