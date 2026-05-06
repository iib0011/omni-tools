import { useRef } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

interface MultiVideoInputComponentProps {
  accept: string[];
  title?: string;
  type: 'video';
  value: MultiVideoInput[];
  onChange: (file: MultiVideoInput[]) => void;
}

export interface MultiVideoInput {
  file: File;
  order: number;
}

export default function ToolMultipleVideoInput({
  value,
  onChange,
  accept,
  title,
  type
}: MultiVideoInputComponentProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files)
      onChange([
        ...value,
        ...Array.from(files).map((file) => ({ file, order: value.length }))
      ]);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  function handleClear() {
    onChange([]);
  }

  function fileNameTruncate(fileName: string) {
    const maxLength = 15;
    if (fileName.length > maxLength) {
      return fileName.slice(0, maxLength) + '...';
    }
    return fileName;
  }

  const sortList = () => {
    const list = [...value];
    list.sort((a, b) => a.order - b.order);
    onChange(list);
  };

  const reorderList = (sourceIndex: number, destinationIndex: number) => {
    if (destinationIndex === sourceIndex) {
      return;
    }
    const list = [...value];

    if (destinationIndex === 0) {
      list[sourceIndex].order = list[0].order - 1;
      sortList();
      return;
    }

    if (destinationIndex === list.length - 1) {
      list[sourceIndex].order = list[list.length - 1].order + 1;
      sortList();
      return;
    }

    if (destinationIndex < sourceIndex) {
      list[sourceIndex].order =
        (list[destinationIndex].order + list[destinationIndex - 1].order) / 2;
      sortList();
      return;
    }

    list[sourceIndex].order =
      (list[destinationIndex].order + list[destinationIndex + 1].order) / 2;
    sortList();
  };

  return (
    <Box>
      <InputHeader
        title={
          title ||
          t('toolMultipleInput.inputTitle', {
            type: type.charAt(0).toUpperCase() + type.slice(1)
          })
        }
      />
      <Box
        sx={{
          width: '100%',
          height: '300px',
          border: value?.length ? 0 : 1,
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'background.paper',
          position: 'relative'
        }}
      >
        <Box
          width="100%"
          height="100%"
          sx={{
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative'
          }}
        >
          {value?.length ? (
            value.map((file, index) => (
              <Box
                key={index}
                sx={{
                  margin: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '200px',
                  border: 1,
                  borderRadius: 1,
                  padding: 1
                }}
              >
                <Tooltip title={file.file.name}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <VideoFileIcon />
                    <Typography
                      sx={{
                        marginLeft: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {fileNameTruncate(file.file.name)}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title={t('toolMultipleInput.deleteFile')}>
                  <IconButton
                    size="small"
                    aria-label={t('toolMultipleInput.deleteFile')}
                    onClick={() => {
                      const updatedFiles = value.filter((_, i) => i !== index);
                      onChange(updatedFiles);
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('toolMultipleInput.noFilesSelected')}
            </Typography>
          )}
        </Box>
      </Box>

      <InputFooter handleImport={handleImportClick} handleClear={handleClear} />
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        accept={accept.join(',')}
        onChange={handleFileChange}
        multiple={true}
      />
    </Box>
  );
}
