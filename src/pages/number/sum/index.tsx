import { Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext, useEffect, useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { compute, NumberExtractionType } from './service';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import RadioWithTextField from '../../../components/options/RadioWithTextField';
import ToolOptionGroups from '../../../components/options/ToolOptionGroups';
import SimpleRadio from '../../../components/options/SimpleRadio';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';
import ToolInputAndResult from '../../../components/ToolInputAndResult';

const initialValues = {
  extractionType: 'smart' as NumberExtractionType,
  separator: '\\n',
  printRunningSum: false
};
const extractionTypes: {
  title: string;
  description: string;
  type: NumberExtractionType;
  withTextField: boolean;
  textValueAccessor?: keyof typeof initialValues;
}[] = [
  {
    title: 'Smart sum',
    description: 'Auto detect numbers in the input.',
    type: 'smart',
    withTextField: false
  },
  {
    title: 'Number Delimiter',
    type: 'delimiter',
    description:
      'Input SeparatorCustomize the number separator here. (By default a line break.)',
    withTextField: true,
    textValueAccessor: 'separator'
  }
];

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  // const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const FormikListenerComponent = () => {
    const { values } = useFormikContext<typeof initialValues>();

    useEffect(() => {
      try {
        const { extractionType, printRunningSum, separator } = values;

        setResult(compute(input, extractionType, printRunningSum, separator));
      } catch (exception: unknown) {
        if (exception instanceof Error)
          showSnackBar(exception.message, 'error');
      }
    }, [values, input]);

    return null; // This component doesn't render anything
  };
  const validationSchema = Yup.object({
    // splitSeparator: Yup.string().required('The separator is required')
  });

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Total'} value={result} />}
      />
      <ToolOptions>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {({ setFieldValue, values }) => (
            <Stack direction={'row'} spacing={2}>
              <FormikListenerComponent />
              <ToolOptionGroups
                groups={[
                  {
                    title: 'Number extraction',
                    component: extractionTypes.map(
                      ({
                        title,
                        description,
                        type,
                        withTextField,
                        textValueAccessor
                      }) =>
                        withTextField ? (
                          <RadioWithTextField
                            key={type}
                            radioValue={type}
                            title={title}
                            fieldName={'extractionType'}
                            description={description}
                            value={
                              textValueAccessor
                                ? values[textValueAccessor].toString()
                                : ''
                            }
                            onRadioChange={(type) =>
                              setFieldValue('extractionType', type)
                            }
                            onTextChange={(val) =>
                              setFieldValue(textValueAccessor ?? '', val)
                            }
                          />
                        ) : (
                          <SimpleRadio
                            key={title}
                            onChange={() =>
                              setFieldValue('extractionType', type)
                            }
                            fieldName={'extractionType'}
                            value={values.extractionType}
                            description={description}
                            title={title}
                          />
                        )
                    )
                  },
                  {
                    title: 'Running Sum',
                    component: (
                      <CheckboxWithDesc
                        title={'Print Running Sum'}
                        description={
                          "Display the sum as it's calculated step by step."
                        }
                        checked={values.printRunningSum}
                        onChange={(value) =>
                          setFieldValue('printRunningSum', value)
                        }
                      />
                    )
                  }
                ]}
              />
            </Stack>
          )}
        </Formik>
      </ToolOptions>
    </Box>
  );
}
