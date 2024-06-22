import ToolHeader from '../../../components/ToolHeader';
import ToolLayout from '../../../components/ToolLayout';
import { Box, Stack, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import { Field, Formik, FormikProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import ToolOptions from '../../../components/ToolOptions';
import { compute, SplitOperatorType } from './service';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';

const initialValues = {
  splitSeparatorType: 'symbol' as SplitOperatorType,
  symbolValue: ' ',
  regexValue: '/\\s+/',
  lengthValue: '16',
  chunksValue: '4',

  outputSeparator: '\\n',
  charBeforeChunk: '',
  charAfterChunk: ''
};
const splitOperators: {
  title: string;
  description: string;
  type: SplitOperatorType;
}[] = [
  {
    title: 'Use a Symbol for Splitting',
    description:
      'Character that will be used to\n' +
      'break text into parts.\n' +
      '(Space by default.)',
    type: 'symbol'
  },
  {
    title: 'Use a Regex for Splitting',
    type: 'regex',
    description:
      'Regular expression that will be\n' +
      'used to break text into parts.\n' +
      '(Multiple spaces by default.)'
  },
  {
    title: 'Use Length for Splitting',
    description:
      'Number of symbols that will be\n' + 'put in each output chunk.',
    type: 'length'
  },
  {
    title: 'Use a Number of Chunks',
    description: 'Number of chunks of equal\n' + 'length in the output.',
    type: 'chunks'
  }
];
const outputOptions: {
  description: string;
  accessor: keyof typeof initialValues;
}[] = [
  {
    description:
      'Character that will be put\n' +
      'between the split chunks.\n' +
      '(It\'s newline "\\n" by default.)',
    accessor: 'outputSeparator'
  },
  {
    description: 'Character before each chunk',
    accessor: 'charBeforeChunk'
  },
  {
    description: 'Character after each chunk',
    accessor: 'charAfterChunk'
  }
];
const CustomRadioButton = ({
  fieldName,
  type,
  title,
  onTypeChange,
  value,
  description,
  onTextChange
}: {
  fieldName: string;
  title: string;
  type: SplitOperatorType;
  onTypeChange: (val: string) => void;
  value: string;
  description: string;
  onTextChange: (value: string) => void;
}) => {
  const onChange = () => onTypeChange(type);
  return (
    <Box>
      <Stack
        direction={'row'}
        sx={{ mt: 2, mb: 1, cursor: 'pointer' }}
        onClick={onChange}
        alignItems={'center'}
        spacing={1}
      >
        <Field type="radio" name={fieldName} value={type} onChange={onChange} />
        <Typography>{title}</Typography>
      </Stack>
      <InputWithDesc
        value={value}
        onChange={onTextChange}
        description={description}
      />
    </Box>
  );
};

const InputWithDesc = ({
  description,
  value,
  onChange
}: {
  description: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Box>
      <TextField
        sx={{ backgroundColor: 'white' }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const FormikListenerComponent = () => {
    const { values } = useFormikContext<typeof initialValues>();

    useEffect(() => {
      try {
        const {
          splitSeparatorType,
          outputSeparator,
          charBeforeChunk,
          charAfterChunk,
          chunksValue,
          symbolValue,
          regexValue,
          lengthValue
        } = values;

        setResult(
          compute(
            splitSeparatorType,
            input,
            symbolValue,
            regexValue,
            Number(lengthValue),
            Number(chunksValue),
            charBeforeChunk,
            charAfterChunk,
            outputSeparator
          )
        );
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
    <ToolLayout
      title={'Text Splitter'}
      description={
        "World's simplest browser-based utility for splitting text. Load your text in the input form on the left and you'll automatically get pieces of this text on the right. Powerful, free, and fast. Load text – get chunks."
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ToolTextInput value={input} onChange={setInput} />
        </Grid>
        <Grid item xs={6}>
          <ToolTextResult title={'Text pieces'} value={result} />
        </Grid>
      </Grid>
      <ToolOptions>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          innerRef={formRef}
          onSubmit={() => {}}
        >
          {({ setFieldValue, values }) => (
            <Stack direction={'row'} spacing={2}>
              <FormikListenerComponent />
              <Box>
                <Typography fontSize={22}>Split separator options</Typography>
                {splitOperators.map(({ title, description, type }) => (
                  <CustomRadioButton
                    key={type}
                    type={type}
                    title={title}
                    fieldName={'splitSeparatorType'}
                    description={description}
                    value={values[`${type}Value`]}
                    onTypeChange={(type) =>
                      setFieldValue('splitSeparatorType', type)
                    }
                    onTextChange={(val) => setFieldValue(`${type}Value`, val)}
                  />
                ))}
              </Box>
              <Box>
                <Typography fontSize={22}>Output separator options</Typography>
                {outputOptions.map((option) => (
                  <InputWithDesc
                    key={option.accessor}
                    value={values[option.accessor]}
                    onChange={(value) => setFieldValue(option.accessor, value)}
                    description={option.description}
                  />
                ))}
              </Box>
            </Stack>
          )}
        </Formik>
      </ToolOptions>
    </ToolLayout>
  );
}
