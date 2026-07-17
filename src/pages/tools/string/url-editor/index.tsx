import { useCallback, useState } from 'react';
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
import {
  createQueryParam,
  generateUrl,
  parseUrl,
  URL_PARSE_ERRORS
} from './service';
import { ParsedUrl } from './types';

const initialValues = {};
const noop = () => {};

export default function UrlEditor({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [inputUrl, setInputUrl] = useState('');
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  let generatedUrl = '';
  let generateError: string | null = null;

  if (parsedUrl) {
    try {
      generatedUrl = generateUrl(parsedUrl);
    } catch {
      generateError = t('urlEditor.invalidUrl');
    }
  }

  const handleParse = useCallback(() => {
    try {
      setParsedUrl(parseUrl(inputUrl));
      setParseError(null);
    } catch (error) {
      setParsedUrl(null);
      if (
        error instanceof Error &&
        error.message === URL_PARSE_ERRORS.CREDENTIALS
      ) {
        setParseError(t('urlEditor.credentialsNotSupported'));
      } else {
        setParseError(t('urlEditor.invalidUrl'));
      }
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
        ? { ...current, params: [...current.params, createQueryParam()] }
        : current
    );
  }, []);

  const handleRemoveParam = useCallback((id: string) => {
    setParsedUrl((current) =>
      current
        ? {
            ...current,
            params: current.params.filter((param) => param.id !== id)
          }
        : current
    );
  }, []);

  const handleParamChange = useCallback(
    (id: string, field: 'key' | 'value', value: string) => {
      setParsedUrl((current) => {
        if (!current) return current;

        const params = current.params.map((param) =>
          param.id === id ? { ...param, [field]: value } : param
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
      compute={noop}
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
                        <TableRow key={param.id}>
                          <TableCell>
                            <TextField
                              value={param.key}
                              onChange={(event) =>
                                handleParamChange(
                                  param.id,
                                  'key',
                                  event.target.value
                                )
                              }
                              size="small"
                              fullWidth
                              inputProps={{
                                'aria-label': t('urlEditor.paramKeyAriaLabel', {
                                  row: index + 1
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={param.value}
                              onChange={(event) =>
                                handleParamChange(
                                  param.id,
                                  'value',
                                  event.target.value
                                )
                              }
                              size="small"
                              fullWidth
                              inputProps={{
                                'aria-label': t(
                                  'urlEditor.paramValueAriaLabel',
                                  { row: index + 1 }
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              aria-label={t('urlEditor.deleteParamAriaLabel', {
                                row: index + 1
                              })}
                              onClick={() => handleRemoveParam(param.id)}
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
