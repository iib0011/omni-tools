import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { InitialValuesType } from './types';
import { createPaste, retrievePaste } from './service';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`privatebin-tabpanel-${index}`}
      aria-labelledby={`privatebin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const initialValues: InitialValuesType = {
  expiration: '1day',
  burnAfterReading: false,
  password: ''
};

export default function PrivateBin({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [retrieveId, setRetrieveId] = useState('');
  const [retrievePassword, setRetrievePassword] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setResult('');
    setError('');
  };

  const compute = async (values: InitialValuesType, input: string) => {
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      const pasteId = await createPaste(input, values);
      setResult(
        `${t('string:privatebin.pasteCreatedSuccess')}\n\n${t(
          'string:privatebin.pasteIdLabel'
        )} ${pasteId}\n\n${t('string:privatebin.shareIdMessage')}`
      );
    } catch (err) {
      setError(`${t('string:privatebin.errorFailedCreate')} ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!retrieveId.trim() || !retrievePassword.trim()) {
      setError(t('string:privatebin.errorEnterBoth'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await retrievePaste(retrieveId, retrievePassword);
      setResult(`${t('string:privatebin.retrievedContent')}\n\n${content}`);
    } catch (err) {
      setError(`${t('string:privatebin.errorFailedRetrieve')} ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string:privatebin.pasteSettings'),
      component: (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('string:privatebin.expiration')}</InputLabel>
            <Select
              value={values.expiration}
              onChange={(e) =>
                updateField(
                  'expiration',
                  e.target.value as InitialValuesType['expiration']
                )
              }
              label={t('string:privatebin.expiration')}
            >
              <MenuItem value="1hour">
                {t('string:privatebin.expirationOptions.1hour')}
              </MenuItem>
              <MenuItem value="1day">
                {t('string:privatebin.expirationOptions.1day')}
              </MenuItem>
              <MenuItem value="1week">
                {t('string:privatebin.expirationOptions.1week')}
              </MenuItem>
              <MenuItem value="1month">
                {t('string:privatebin.expirationOptions.1month')}
              </MenuItem>
              <MenuItem value="never">
                {t('string:privatebin.expirationOptions.never')}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={t('string:privatebin.passwordOptional')}
            value={values.password}
            onChange={(e) => updateField('password', e.target.value)}
            type="password"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={values.burnAfterReading}
                onChange={(e) =>
                  updateField('burnAfterReading', e.target.checked)
                }
              />
            }
            label={t('string:privatebin.burnAfterReading')}
          />
        </Box>
      )
    }
  ];

  const renderCustomInput = (values: InitialValuesType) => (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="privatebin tabs"
        >
          <Tab label={t('string:privatebin.createPaste')} />
          <Tab label={t('string:privatebin.retrievePaste')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('string:privatebin.createPasteTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('string:privatebin.createPasteDescription')}
            </Typography>
          </Box>

          <ToolTextInput
            value={input}
            onChange={setInput}
            title={t('string:privatebin.pasteContent')}
            placeholder={t('string:privatebin.pasteContentPlaceholder')}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => compute(values, input)}
              disabled={loading || !input.trim()}
              fullWidth
            >
              {loading
                ? t('string:privatebin.creating')
                : t('string:privatebin.createPasteButton')}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('string:privatebin.retrievePasteTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('string:privatebin.retrievePasteDescription')}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label={t('string:privatebin.pasteId')}
            value={retrieveId}
            onChange={(e) => setRetrieveId(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('string:privatebin.password')}
            value={retrievePassword}
            onChange={(e) => setRetrievePassword(e.target.value)}
            type="password"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            onClick={handleRetrieve}
            disabled={loading || !retrieveId.trim() || !retrievePassword.trim()}
            fullWidth
          >
            {loading
              ? t('string:privatebin.retrieving')
              : t('string:privatebin.retrievePasteButton')}
          </Button>
        </TabPanel>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  return (
    <ToolContent
      title={title}
      inputComponent={renderCustomInput(initialValues)}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      toolInfo={{
        title: `What is ${title}?`,
        description:
          longDescription ||
          'A secure paste service for sharing text content with encryption and expiration options.'
      }}
    />
  );
}
