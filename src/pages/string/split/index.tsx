import ToolHeader from '../../../components/ToolHeader'
import ToolLayout from '../../../components/ToolLayout'
import { Box, Radio, Stack, TextField, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import PublishIcon from '@mui/icons-material/Publish'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DownloadIcon from '@mui/icons-material/Download'
import React, { useEffect, useRef, useState } from 'react'
import ToolTextInput from '../../../components/input/ToolTextInput'
import ToolTextResult from '../../../components/result/ToolTextResult'
import SettingsIcon from '@mui/icons-material/Settings'
import { Field, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'

type SplitOperatorType = 'symbol' | 'regex' | 'length' | 'chunks';
const initialValues = {
  splitSeparatorType: 'symbol',
  splitSeparator: ' '
}
const initialSplitOperators: {
  title: string;
  description: string;
  defaultValue: string;
  type: SplitOperatorType
}[] = [{
  title: 'Use a Symbol for Splitting', description: 'Character that will be used to\n' +
    'break text into parts.\n' +
    '(Space by default.)',
  defaultValue: ' ',
  type: 'symbol'
},
  {
    title: 'Use a Regex for Splitting',
    defaultValue: '/\\s+/',
    type: 'regex',
    description: 'Regular expression that will be\n' +
      'used to break text into parts.\n' +
      '(Multiple spaces by default.)'
  },
  {
    title: 'Use Length for Splitting', description: 'Number of symbols that will be\n' +
      'put in each output chunk.',
    defaultValue: '16',
    type: 'length'
  },
  {
    title: 'Use a Number of Chunks', description: 'Number of chunks of equal\n' +
      'length in the output.',
    defaultValue: '4',
    type: 'chunks'
  }]

const CustomRadioButton = ({
                             fieldName,
                             type,
                             title,
                             setFieldValue,
                             value,
                             description,
                             onTextChange
                           }: {
  fieldName: string;
  title: string;
  type: SplitOperatorType;
  setFieldValue: (fieldName: string, val: string) => void;
  value: string;
  description: string;
  onTextChange: (type: SplitOperatorType, value: string) => void;
}) => {
  const onChange = () => setFieldValue(fieldName, type)
  return (<Box>
      <Stack direction={'row'} sx={{ mt: 2, mb: 1, cursor: 'pointer' }} onClick={onChange} alignItems={'center'}
             spacing={1}>
        <Field
          type="radio"
          name={fieldName}
          value={type}
          onChange={onChange}
        />
        <Typography>{title}</Typography>
      </Stack>
      <TextField sx={{ backgroundColor: 'white' }} value={value}
                 onChange={event => onTextChange(type, event.target.value)} />
      <Typography fontSize={12} mt={1}>{description}</Typography>
    </Box>
  )
}
export default function SplitText() {
  const [input, setInput] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const formRef = useRef<FormikProps<typeof initialValues>>()
  const theme = useTheme()
  const [splitOperators, setSplitOperators] = useState<{
    title: string;
    description: string;
    defaultValue: string;
    type: SplitOperatorType;
    value: string
  }[]>(initialSplitOperators.map(operator => ({ ...operator, value: operator.defaultValue })))
  useEffect(() => {
    setResult(input.split(' ').join('\n'))
  }, [input])

  const validationSchema = Yup.object({
    splitSeparator: Yup.string().required('The separator is required')
  })

  const onSplitOperatorTextChange = (type: SplitOperatorType, value: string) => {
    const splitOperatorsClone = [...splitOperators].map(splitOperator => {
      if (splitOperator.type === type) {
        splitOperator.value = value
      }
      return splitOperator
    })
    setSplitOperators(splitOperatorsClone)
  }
  return (
    <ToolLayout>
      <ToolHeader
        title={'Text Splitter'}
        description={
          'World\'s simplest browser-based utility for splitting text. Load your text in the input form on the left and you\'ll automatically get pieces of this text on the right. Powerful, free, and fast. Load text – get chunks.'
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ToolTextInput value={input} onChange={setInput} />
        </Grid>
        <Grid item xs={6}>
          <ToolTextResult title={'Text pieces'} value={result} />
        </Grid>
      </Grid>
      <Box sx={{ mb: 2, borderRadius: 2, padding: 2, backgroundColor: theme.palette.background.default }} mt={2}>
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <SettingsIcon />
          <Typography fontSize={22}>Tool options</Typography>
        </Stack>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          innerRef={formRef}
          onSubmit={() => {
          }}
        >
          {({ setFieldValue }) => (
            <Stack direction={'row'}>
              <Box>
                <Typography fontSize={22}>Split separator options</Typography>
                {splitOperators.map(({ title, description, type, value }) => <CustomRadioButton
                  type={type}
                  title={title}
                  fieldName={'splitSeparatorType'}
                  description={description}
                  value={value}
                  setFieldValue={setFieldValue}
                  onTextChange={onSplitOperatorTextChange}
                />)}
              </Box>
              <Box></Box>
            </Stack>
          )}
        </Formik>
      </Box>
    </ToolLayout>
  )
}
