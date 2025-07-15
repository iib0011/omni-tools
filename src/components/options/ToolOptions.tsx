import { Box, Stack, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import { FormikProps, FormikValues, useFormikContext } from 'formik';
import ToolOptionGroups, { ToolOptionGroup } from './ToolOptionGroups';
import { useTranslation } from 'react-i18next';

export type UpdateField<T> = <Y extends keyof T>(field: Y, value: T[Y]) => void;
type NonEmptyArray<T> = [T, ...T[]];
export type GetGroupsType<T> = (
  formikProps: FormikProps<T> & { updateField: UpdateField<T> }
) => NonEmptyArray<ToolOptionGroup>;

export default function ToolOptions<T extends FormikValues>({
  children,
  getGroups,
  vertical
}: {
  children?: ReactNode;
  getGroups: GetGroupsType<T> | null;
  vertical?: boolean;
}) {
  const { t } = useTranslation();
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
        backgroundColor: 'background.lightSecondary',
        boxShadow: '2'
      }}
      mt={2}
    >
      <Stack direction={'row'} spacing={1} alignItems={'center'}>
        <SettingsIcon />
        <Typography fontSize={22}>{t('toolOptions.title')}</Typography>
      </Stack>
      <Box mt={2}>
        <Stack direction={'row'} spacing={2}>
          <ToolOptionGroups
            groups={getGroups({ ...formikContext, updateField }) ?? null}
            vertical={vertical}
          />
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
