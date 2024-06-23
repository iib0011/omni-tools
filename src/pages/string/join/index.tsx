import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik, FormikProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import ToolOptions from '../../../components/ToolOptions';
import { mergeText } from './service';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';

const initialValues = {
  joinCharacter: '',
  deleteBlank: true,
  deleteTrailing: true
};

const validationSchema = Yup.object().shape({
  joinCharacter: Yup.string().required('Join character is required'),
  deleteBlank: Yup.boolean().required('Delete blank is required'),
  deleteTrailing: Yup.boolean().required('Delete trailing is required')
});

const mergeOptions = {
  placeholder: 'Join Character',
  description:
    'Symbol that connects broken\n' + 'pieces of text. (Space by default.)\n',
  accessor: 'joinCharacter' as keyof typeof initialValues
};

const blankTrailingOptions: {
  title: string;
  description: string;
  accessor: keyof typeof initialValues;
}[] = [
  {
    title: 'Delete Blank Lines',
    description: "Delete lines that don't have\n text symbols.\n",
    accessor: 'deleteBlank'
  },
  {
    title: 'Delete Trailing Spaces',
    description: 'Remove spaces and tabs at\n the end of the lines.\n',
    accessor: 'deleteTrailing'
  }
];

const InputWithDesc = ({
  placeholder,
  description,
  value,
  onChange
}: {
  placeholder: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Box width={240}>
      <TextField
        sx={{ backgroundColor: 'white', padding: 0 }}
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

const CheckboxWithDesc = ({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox defaultChecked checked={checked} onChange={handleChange} />
        }
        label={title}
      />
      <Typography fontSize={12} mt={1}>
        {description}
      </Typography>
    </Box>
  );
};

export default function JoinText() {
  const [input, setInput] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [result, setResult] = useState<string>('');

  const FormikListenerComponent = ({ input }: { input: string }) => {
    const { values } = useFormikContext<typeof initialValues>();
    const { joinCharacter, deleteBlank, deleteTrailing } = values;

    useEffect(() => {
      try {
        console.log('Form values:', values['joinCharacter']);
        setResult(mergeText(input, deleteBlank, deleteTrailing, joinCharacter));
      } catch (exception: unknown) {
        if (exception instanceof Error)
          showSnackBar(exception.message, 'error');
      }
    }, [values, input]);

    console.log('deleteBlank', deleteBlank);
    return null;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ToolTextInput
            title={'Text Pieces'}
            value={input}
            onChange={setInput}
          />
        </Grid>
        <Grid item xs={6}>
          <ToolTextResult title={'Joined Text'} value={result} />
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
              <FormikListenerComponent input={input} />
              <Box>
                <Typography fontSize={22}>Text Merged Options</Typography>
                <InputWithDesc
                  placeholder={mergeOptions.placeholder}
                  value={values['joinCharacter']}
                  onChange={(value) =>
                    setFieldValue(mergeOptions.accessor, value)
                  }
                  description={mergeOptions.description}
                />
              </Box>
              <Box>
                <Typography fontSize={22}>
                  Blank Lines and Trailing Spaces
                </Typography>
                {blankTrailingOptions.map((option) => (
                  <CheckboxWithDesc
                    key={option.accessor}
                    title={option.title}
                    checked={!!values[option.accessor]}
                    onChange={(value) => setFieldValue(option.accessor, value)}
                    description={option.description}
                  />
                ))}
              </Box>
            </Stack>
          )}
        </Formik>
      </ToolOptions>
    </Box>
  );
}
