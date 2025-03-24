import { Box } from '@mui/material';
import React from 'react';
import * as Yup from 'yup';

type InitialValuesType = {};
const initialValues: InitialValuesType = {};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ConvertDaysToHours() {
  return <Box>Lorem ipsum</Box>;
}
