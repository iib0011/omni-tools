import { Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext, useEffect, useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { compute } from './service';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import ToolOptionGroups from '../../../components/options/ToolOptionGroups';

const initialValues = {
  dotSymbol: '.',
  dashSymbol: '-'
};

export default function ToMorse() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  // const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const FormikListenerComponent = () => {
    const { values } = useFormikContext<typeof initialValues>();

    useEffect(() => {
      try {
        const { dotSymbol, dashSymbol } = values;

        setResult(compute(input, dotSymbol, dashSymbol));
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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ToolTextInput value={input} onChange={setInput} />
        </Grid>
        <Grid item xs={6}>
          <ToolTextResult title={'Morse code'} value={result} />
        </Grid>
      </Grid>
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
                    title: 'Short Signal',
                    component: (
                      <TextFieldWithDesc
                        description={
                          'Symbol that will correspond to the dot in Morse code.'
                        }
                        value={values.dotSymbol}
                        onChange={(val) => setFieldValue('dotSymbol', val)}
                      />
                    )
                  },
                  {
                    title: 'Long Signal',
                    component: (
                      <TextFieldWithDesc
                        description={
                          'Symbol that will correspond to the dash in Morse code.'
                        }
                        value={values.dashSymbol}
                        onChange={(val) => setFieldValue('dashSymbol', val)}
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
