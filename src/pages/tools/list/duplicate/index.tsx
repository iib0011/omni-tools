import { Box } from '@mui/material';
import React from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';

const initialValues = {};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function Duplicate() {
  return <Box>Lorem ipsum</Box>;
}
