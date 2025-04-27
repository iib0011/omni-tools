import { Box } from '@mui/material';
import React, { useContext, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { InitialValuesType } from './types';
import { protectPdf } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';

const initialValues: InitialValuesType = {
  password: '',
  confirmPassword: ''
};

export default function ProtectPdf({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    try {
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        showSnackBar('Passwords do not match', 'error');
        return;
      }

      // Validate password is not empty
      if (!values.password) {
        showSnackBar('Password cannot be empty', 'error');
        return;
      }

      setIsProcessing(true);
      const protectedPdf = await protectPdf(input, values);
      setResult(protectedPdf);
    } catch (error) {
      console.error('Error protecting PDF:', error);
      showSnackBar(
        `Failed to protect PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'error'
      );
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={setInput}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Protected PDF'}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={'Protecting PDF'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Password Settings',
          component: (
            <Box>
              <TextFieldWithDesc
                title="Password"
                description="Enter a password to protect your PDF"
                placeholder="Enter password"
                type="password"
                value={values.password}
                onOwnChange={(value) => updateField('password', value)}
              />
              <TextFieldWithDesc
                title="Confirm Password"
                description="Re-enter your password to confirm"
                placeholder="Confirm password"
                type="password"
                value={values.confirmPassword}
                onOwnChange={(value) => updateField('confirmPassword', value)}
              />
            </Box>
          )
        }
      ]}
    />
  );
}
