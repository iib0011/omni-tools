import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import InputHeader from '@components/InputHeader';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';
import UrlDetailsEditor, { UrlDetailField } from './UrlDetailsEditor';
import { generateUrl, parseUrl } from './service';
import { ParsedUrl } from './types';

const initialValues = {};

export default function UrlEditor({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [inputUrl, setInputUrl] = useState('');
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!parsedUrl) {
      setGeneratedUrl('');
      setGenerateError(null);
      return;
    }

    try {
      setGeneratedUrl(generateUrl(parsedUrl));
      setGenerateError(null);
    } catch {
      setGeneratedUrl('');
      setGenerateError(t('urlEditor.invalidUrl'));
    }
  }, [parsedUrl, t]);

  const handleParse = useCallback(() => {
    try {
      setParsedUrl(parseUrl(inputUrl));
      setParseError(null);
    } catch {
      setParsedUrl(null);
      setParseError(t('urlEditor.invalidUrl'));
    }
  }, [inputUrl, t]);

  const handleFieldChange = useCallback(
    (field: UrlDetailField, value: string) => {
      setParsedUrl((current) =>
        current ? { ...current, [field]: value } : current
      );
    },
    []
  );

  const handleAddParam = useCallback(() => {
    setParsedUrl((current) =>
      current
        ? { ...current, params: [...current.params, { key: '', value: '' }] }
        : current
    );
  }, []);

  const handleRemoveParam = useCallback((index: number) => {
    setParsedUrl((current) =>
      current
        ? {
            ...current,
            params: current.params.filter((_, i) => i !== index)
          }
        : current
    );
  }, []);

  const handleParamChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      setParsedUrl((current) => {
        if (!current) return current;

        const params = current.params.map((param, i) =>
          i === index ? { ...param, [field]: value } : param
        );

        return { ...current, params };
      });
    },
    []
  );

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={null}
      compute={() => {}}
      input={inputUrl}
      setInput={setInputUrl}
      inputComponent={
        <Box>
          <ToolTextInput
            title={t('urlEditor.inputTitle')}
            value={inputUrl}
            onChange={setInputUrl}
            placeholder="https://example.com/search?q=test"
          />
          <Box mt={2}>
            <Button variant="contained" onClick={handleParse}>
              {t('urlEditor.parseButton')}
            </Button>
          </Box>

          {parseError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {parseError}
            </Alert>
          )}

          {parsedUrl && (
            <Box mt={3}>
              <InputHeader title={t('urlEditor.urlDetails')} />
              <UrlDetailsEditor
                value={parsedUrl}
                onChange={handleFieldChange}
                labels={{
                  protocol: t('urlEditor.protocol'),
                  host: t('urlEditor.host'),
                  path: t('urlEditor.path'),
                  hash: t('urlEditor.hash'),
                  hostPlaceholder: t('urlEditor.hostPlaceholder'),
                  pathPlaceholder: t('urlEditor.pathPlaceholder'),
                  hashPlaceholder: t('urlEditor.hashPlaceholder')
                }}
              />

              <Box mt={3}>
                <InputHeader title={t('urlEditor.queryParameters')} />
                {parsedUrl.params.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('urlEditor.key')}</TableCell>
                        <TableCell>{t('urlEditor.value')}</TableCell>
                        <TableCell width={80} align="center">
                          {t('urlEditor.delete')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedUrl.params.map((param, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={param.key}
                              onChange={(event) =>
                                handleParamChange(
                                  index,
                                  'key',
                                  event.target.value
                                )
                              }
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={param.value}
                              onChange={(event) =>
                                handleParamChange(
                                  index,
                                  'value',
                                  event.target.value
                                )
                              }
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              aria-label={t('urlEditor.delete')}
                              onClick={() => handleRemoveParam(index)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('urlEditor.noParameters')}
                  </Typography>
                )}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddParam}
                  sx={{ mt: 2 }}
                >
                  {t('urlEditor.addParameter')}
                </Button>
              </Box>

              {generateError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {generateError}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      }
      resultComponent={
        <ToolTextResult
          title={t('urlEditor.generatedUrl')}
          value={generatedUrl}
        />
      }
      toolInfo={{
        title: t('urlEditor.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
