import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useTranslation } from 'react-i18next';
import { AUTO_DETECT, LibreLanguage } from '../types';

interface LanguageSelectProps {
  id: string;
  label: string;
  value: string;
  options: LibreLanguage[];
  onChange: (code: string) => void;
  includeAutoDetect?: boolean;
  disabled?: boolean;
}

function LanguageSelect({
  id,
  label,
  value,
  options,
  onChange,
  includeAutoDetect,
  disabled
}: LanguageSelectProps) {
  const { t } = useTranslation('string');
  const labelId = `${id}-label`;
  // Keep the Select controlled with a known value while languages load.
  const known =
    (includeAutoDetect && value === AUTO_DETECT) ||
    options.some((language) => language.code === value);

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={label}
        value={known ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        sx={{ backgroundColor: 'background.paper' }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
      >
        {includeAutoDetect && (
          <MenuItem value={AUTO_DETECT}>{t('translator.autoDetect')}</MenuItem>
        )}
        {options.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            {language.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export interface LanguageBarProps {
  languages: LibreLanguage[];
  targetOptions: LibreLanguage[];
  source: string;
  target: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onSwap: () => void;
  disabled?: boolean;
}

/** Source selector, swap button and target selector, aligned with the two result columns. */
export default function LanguageBar({
  languages,
  targetOptions,
  source,
  target,
  onSourceChange,
  onTargetChange,
  onSwap,
  disabled
}: LanguageBarProps) {
  const { t } = useTranslation('string');
  const canSwap =
    !disabled &&
    source !== AUTO_DETECT &&
    languages.some((language) => language.code === target);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
        alignItems: 'center',
        gap: { xs: 1, md: 2 },
        mb: 2
      }}
    >
      <LanguageSelect
        id="translator-source-language"
        label={t('translator.sourceLanguage')}
        value={source}
        options={languages}
        onChange={onSourceChange}
        includeAutoDetect
        disabled={disabled}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={t('translator.swapLanguages')}>
          {/* span keeps the tooltip working while the button is disabled */}
          <span>
            <IconButton
              aria-label={t('translator.swapLanguages')}
              onClick={onSwap}
              disabled={!canSwap}
              color="primary"
            >
              <SwapHorizIcon
                sx={{ transform: { xs: 'rotate(90deg)', md: 'none' } }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <LanguageSelect
        id="translator-target-language"
        label={t('translator.targetLanguage')}
        value={target}
        options={targetOptions}
        onChange={onTargetChange}
        disabled={disabled}
      />
    </Box>
  );
}
