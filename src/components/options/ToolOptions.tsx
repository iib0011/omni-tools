import { Box, Stack, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';
import React, { ReactNode, RefObject, useContext, useEffect } from 'react';
import { Formik, FormikProps, FormikValues, useFormikContext } from 'formik';
import ToolOptionGroups, { ToolOptionGroup } from './ToolOptionGroups';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

type UpdateField<T> = <Y extends keyof T>(field: Y, value: T[Y]) => void;

const FormikListenerComponent = <T,>({
  initialValues,
  input,
  compute
}: {
  initialValues: T;
  input: any;
  compute: (optionsValues: T, input: any) => void;
}) => {
  const { values } = useFormikContext<typeof initialValues>();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  useEffect(() => {
    try {
      compute(values, input);
    } catch (exception: unknown) {
      if (exception instanceof Error) showSnackBar(exception.message, 'error');
    }
  }, [values, input]);

  return null; // This component doesn't render anything
};
export default function ToolOptions<T extends FormikValues>({
  children,
  initialValues,
  validationSchema,
  compute,
  input,
  getGroups,
  formRef
}: {
  children?: ReactNode;
  initialValues: T;
  validationSchema: any | (() => any);
  compute: (optionsValues: T, input: any) => void;
  input?: any;
  getGroups: (
    formikProps: FormikProps<T> & { updateField: UpdateField<T> }
  ) => ToolOptionGroup[];
  formRef?: RefObject<FormikProps<T>>;
}) {
  const theme = useTheme();
  const updateField: UpdateField<T> = (field, value) => {
    // @ts-ignore
    formRef?.current?.setFieldValue(field, value);
  };
  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 2,
        padding: 2,
        backgroundColor: theme.palette.background.default
      }}
      mt={2}
    >
      <Stack direction={'row'} spacing={1} alignItems={'center'}>
        <SettingsIcon />
        <Typography fontSize={22}>Tool options</Typography>
      </Stack>
      <Box mt={2}>
        <Formik
          innerRef={formRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {(formikProps) => (
            <Stack direction={'row'} spacing={2}>
              <FormikListenerComponent
                compute={compute}
                input={input}
                initialValues={initialValues}
              />
              <ToolOptionGroups
                groups={getGroups({ ...formikProps, updateField })}
              />
              {children}
            </Stack>
          )}
        </Formik>
      </Box>
    </Box>
  );
}
