import React, { useRef, useState } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import InputHeader from '@components/InputHeader';
import InputFooter from '@components/input/InputFooter';
import { globalInputHeight } from '../../../../../config/uiConfig';
import { formatFileSize } from '../document';

export interface DocumentDropzoneProps {
  title: string;
  file: File | null;
  /** Extensions without the dot, used for the picker's `accept` attribute. */
  acceptedExtensions: string[];
  hint: string;
  /** Called with the chosen file (validation is the caller's responsibility) or `null` to remove it. */
  onSelect: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop / click-to-browse area for a single document. Unlike the
 * shared BaseFileInput it accepts any document type and leaves validation to
 * the caller, since MIME types for formats like SRT or EPUB are unreliable.
 */
export default function DocumentDropzone({
  title,
  file,
  acceptedExtensions,
  hint,
  onSelect,
  disabled
}: DocumentDropzoneProps) {
  const { t } = useTranslation('string');
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Reset so selecting the same file again still triggers onChange.
    event.target.value = '';
    if (selected) onSelect(selected);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  };

  const mutedColor =
    theme.palette.mode === 'dark'
      ? theme.palette.grey['300']
      : theme.palette.grey['600'];

  return (
    <Box>
      <InputHeader title={title} />
      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={t('translator.dropzoneLabel')}
        aria-disabled={disabled}
        data-testid="translator-dropzone"
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        sx={{
          width: '100%',
          height: globalInputHeight,
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'background.paper',
          border: isDragging ? 2 : 1,
          borderStyle: isDragging ? 'dashed' : 'solid',
          borderColor: isDragging ? 'primary.main' : 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1,
          p: 3,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2
          }
        }}
      >
        {file && !isDragging ? (
          <Stack alignItems="center" spacing={1} sx={{ maxWidth: '100%' }}>
            <InsertDriveFileOutlinedIcon
              color="primary"
              sx={{ fontSize: 56 }}
            />
            <Typography
              fontWeight={600}
              sx={{ wordBreak: 'break-all' }}
              data-testid="translator-selected-file"
            >
              {file.name}
            </Typography>
            <Typography variant="body2" color={mutedColor}>
              {formatFileSize(file.size)}
            </Typography>
          </Stack>
        ) : (
          <>
            <UploadFileIcon
              sx={{
                fontSize: 48,
                color: isDragging ? 'primary.main' : mutedColor
              }}
            />
            <Typography color={isDragging ? 'primary' : mutedColor}>
              {isDragging
                ? t('translator.dropzoneActive')
                : t('translator.dropzoneHint')}
            </Typography>
          </>
        )}
        <Typography variant="caption" color={mutedColor}>
          {hint}
        </Typography>
      </Box>
      <InputFooter
        handleImport={openPicker}
        handleClear={file && !disabled ? () => onSelect(null) : undefined}
      />
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={acceptedExtensions.map((ext) => `.${ext}`).join(',')}
        onChange={handleChange}
        data-testid="translator-file-input"
      />
    </Box>
  );
}
