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
        `Paste created successfully!\n\nPaste ID: ${pasteId}\n\nShare this ID with others to retrieve the content.`
      );
    } catch (err) {
      setError(`Failed to create paste: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!retrieveId.trim() || !retrievePassword.trim()) {
      setError('Please enter both paste ID and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await retrievePaste(retrieveId, retrievePassword);
      setResult(`Retrieved content:\n\n${content}`);
    } catch (err) {
      setError(`Failed to retrieve paste: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Paste Settings',
      component: (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Expiration</InputLabel>
            <Select
              value={values.expiration}
              onChange={(e) =>
                updateField(
                  'expiration',
                  e.target.value as InitialValuesType['expiration']
                )
              }
              label="Expiration"
            >
              <MenuItem value="1hour">1 Hour</MenuItem>
              <MenuItem value="1day">1 Day</MenuItem>
              <MenuItem value="1week">1 Week</MenuItem>
              <MenuItem value="1month">1 Month</MenuItem>
              <MenuItem value="never">Never</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Password (optional)"
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
            label="Burn after reading"
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
          <Tab label="Create Paste" />
          <Tab label="Retrieve Paste" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create a new paste
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your text below and configure the settings. Your content
              will be encrypted and stored securely.
            </Typography>
          </Box>

          <ToolTextInput
            value={input}
            onChange={setInput}
            title="Paste Content"
            placeholder="Enter your text here..."
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => compute(values, input)}
              disabled={loading || !input.trim()}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Retrieve a paste
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the paste ID and password to retrieve the content.
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Paste ID"
            value={retrieveId}
            onChange={(e) => setRetrieveId(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
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
            {loading ? 'Retrieving...' : 'Retrieve Paste'}
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
