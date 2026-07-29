import { Delete, UploadFile } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { DragEvent, useRef, useState } from 'react';

interface PdfFilePickerProps {
  value: File | null;
  disabled: boolean;
  labels: {
    title: string;
    hint: string;
    choose: string;
    replace: string;
    clear: string;
    selected: (name: string, size: string) => string;
    invalid: string;
    oneFileOnly: string;
  };
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
}

const isPdf = (file: File): boolean =>
  file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

export const formatFileSize = (bytes: number): string =>
  new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: 'megabyte',
    unitDisplay: 'short',
    maximumFractionDigits: 2
  }).format(bytes / 1024 / 1024);

export default function PdfFilePicker({
  value,
  disabled,
  labels,
  onChange,
  onError
}: PdfFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFiles = (files: FileList | null) => {
    if (!files?.length) return;
    if (files.length !== 1) {
      onError(labels.oneFileOnly);
      return;
    }
    const file = files[0];
    if (!isPdf(file)) {
      onError(labels.invalid);
      return;
    }
    onChange(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) acceptFiles(event.dataTransfer.files);
  };

  return (
    <Box>
      <Typography mb={1} fontSize={30} color="primary">
        {labels.title}
      </Typography>
      <Paper
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        sx={{
          minHeight: 180,
          p: 3,
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <UploadFile color="primary" sx={{ fontSize: 44 }} />
          {value ? (
            <Typography>
              {labels.selected(value.name, formatFileSize(value.size))}
            </Typography>
          ) : (
            <Typography color="text.secondary">{labels.hint}</Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              {value ? labels.replace : labels.choose}
            </Button>
            {value && (
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                {labels.clear}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={false}
        hidden
        disabled={disabled}
        data-testid="organizer-file-input"
        onChange={(event) => {
          acceptFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </Box>
  );
}
