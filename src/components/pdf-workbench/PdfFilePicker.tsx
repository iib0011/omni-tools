import { useRef, useState, type DragEvent } from 'react';
import {
  Box,
  Button,
  Chip,
  FormHelperText,
  Stack,
  Typography
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export interface PdfFilePickerLabels {
  select: string;
  drop: string;
  clear: string;
  invalidType: string;
  tooManyFiles: string;
}

export default function PdfFilePicker({
  files,
  onChange,
  labels,
  multiple = false,
  maxFiles = multiple ? 2 : 1,
  disabled = false,
  id
}: {
  files: File[];
  onChange: (files: File[]) => void;
  labels: PdfFilePickerLabels;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  id: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const acceptFiles = (incoming: File[]) => {
    if (
      incoming.some(
        (file) =>
          file.type !== 'application/pdf' &&
          !(file.type === '' && /\.pdf$/i.test(file.name))
      )
    ) {
      setError(labels.invalidType);
      return;
    }
    if (incoming.length > maxFiles) {
      setError(labels.tooManyFiles);
      return;
    }
    setError('');
    onChange(incoming);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) acceptFiles([...event.dataTransfer.files]);
  };

  return (
    <Stack spacing={1.5}>
      <Box
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: dragging ? 'action.hover' : 'background.default'
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 36 }} />
          <Typography color="text.secondary">{labels.drop}</Typography>
          <Button
            variant="contained"
            disabled={disabled}
            startIcon={<UploadFileIcon />}
            onClick={() => inputRef.current?.click()}
          >
            {labels.select}
          </Button>
        </Stack>
      </Box>
      <input
        ref={inputRef}
        id={id}
        hidden
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          acceptFiles([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />
      {files.length > 0 && (
        <Stack direction="row" gap={1} useFlexGap flexWrap="wrap">
          {files.map((file, index) => (
            <Chip
              key={`${file.name}-${file.size}-${index}`}
              label={`${file.name} (${formatBytes(file.size)})`}
              onDelete={
                disabled
                  ? undefined
                  : () => onChange(files.filter((_, item) => item !== index))
              }
            />
          ))}
          <Button size="small" disabled={disabled} onClick={() => onChange([])}>
            {labels.clear}
          </Button>
        </Stack>
      )}
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Stack>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
