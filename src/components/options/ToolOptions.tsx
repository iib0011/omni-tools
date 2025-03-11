import { Box, Stack, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';
import React, { ReactNode, useContext } from 'react';
import { FormikProps, FormikValues, useFormikContext } from 'formik';
import ToolOptionGroups, { ToolOptionGroup } from './ToolOptionGroups';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export type UpdateField<T> = <Y extends keyof T>(field: Y, value: T[Y]) => void;

const FormikListenerComponent = <T,>({
  input,
  compute
}: {
  input: any;
  compute: (optionsValues: T, input: any) => void;
}) => {
  const { values } = useFormikContext<T>();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  React.useEffect(() => {
    try {
      compute(values, input);
    } catch (exception: unknown) {
      if (exception instanceof Error) showSnackBar(exception.message, 'error');
      else console.error(exception);
    }
  }, [values, input, showSnackBar]);

  return null; // This component doesn't render anything
};

export type GetGroupsType<T> = (
  formikProps: FormikProps<T> & { updateField: UpdateField<T> }
) => ToolOptionGroup[];

export default function ToolOptions<T extends FormikValues>({
  children,
  compute,
  input,
  getGroups
}: {
  children?: ReactNode;
  compute: (optionsValues: T, input: any) => void;
  input?: any;
  getGroups: GetGroupsType<T> | null;
}) {
  const theme = useTheme();
  const formikContext = useFormikContext<T>();

  // Early return if no groups to display
  if (!getGroups) {
    return null;
  }

  const updateField: UpdateField<T> = (field, value) => {
    formikContext.setFieldValue(field as string, value);
  };

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
        <Stack direction={'row'} spacing={2}>
          <FormikListenerComponent<T> compute={compute} input={input} />
          <ToolOptionGroups
            groups={getGroups({ ...formikContext, updateField }) ?? []}
          />
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
