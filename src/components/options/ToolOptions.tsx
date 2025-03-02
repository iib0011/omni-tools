import { Box, Stack, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';
import React, { ReactNode, RefObject, useContext, useEffect } from 'react';
import { Formik, FormikProps, FormikValues, useFormikContext } from 'formik';
import ToolOptionGroups, { ToolOptionGroup } from './ToolOptionGroups';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import * as Yup from 'yup';

export type UpdateField<T> = <Y extends keyof T>(field: Y, value: T[Y]) => void;

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

interface FormikHelperProps<T> {
  compute: (optionsValues: T, input: any) => void;
  input: any;
  children?: ReactNode;
  getGroups: (
    formikProps: FormikProps<T> & { updateField: UpdateField<T> }
  ) => ToolOptionGroup[];
  formikProps: FormikProps<T>;
}

const ToolBody = <T,>({
  compute,
  input,
  children,
  getGroups,
  formikProps
}: FormikHelperProps<T>) => {
  const { values, setFieldValue } = useFormikContext<T>();

  const updateField: UpdateField<T> = (field, value) => {
    // @ts-ignore
    setFieldValue(field, value);
  };

  return (
    <Stack direction={'row'} spacing={2}>
      <FormikListenerComponent<T>
        compute={compute}
        input={input}
        initialValues={values}
      />
      <ToolOptionGroups groups={getGroups({ ...formikProps, updateField })} />
      {children}
    </Stack>
  );
};

export type GetGroupsType<T> = (
  formikProps: FormikProps<T> & { updateField: UpdateField<T> }
) => ToolOptionGroup[];
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
  validationSchema?: any | (() => any);
  compute: (optionsValues: T, input: any) => void;
  input?: any;
  getGroups: GetGroupsType<T>;
  formRef?: RefObject<FormikProps<T>>;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 2,
        padding: 2,
        backgroundColor: theme.palette.background.default,
        boxShadow: '2'
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
            <ToolBody
              compute={compute}
              input={input}
              getGroups={getGroups}
              formikProps={formikProps}
            >
              {children}
            </ToolBody>
          )}
        </Formik>
      </Box>
    </Box>
  );
}
