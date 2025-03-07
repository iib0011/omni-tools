import { Box } from '@mui/material';
import React from 'react';
import * as Yup from 'yup';

const initialValues = {};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function Rotate() {
  return <Box>Lorem ipsum</Box>;
}