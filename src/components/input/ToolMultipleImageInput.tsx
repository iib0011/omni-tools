import React, { useContext, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import ImageIcon from '@mui/icons-material/Image';
import { useTranslation } from 'react-i18next';
import { heicTo, isHeic } from 'heic-to';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

interface MultiImageInputComponentProps {
  accept: string[];
  title?: string;
  type: 'image';
  value: MultiImageInput[];
  onChange: (files: MultiImageInput[]) => void;
}

export interface MultiImageInput {
  file: File;
  order: number;
  preview?: string;
}

export default function ToolMultiImageInput({
  value,
  onChange,
  accept,
  title,
  type
}: MultiImageInputComponentProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [isDragging, setIsDragging] = useState(false);

  const isAcceptableFile = (file: File) =>
    accept.some((acceptType) => {
      // Handle wildcards like "image/*"
      if (acceptType.endsWith('/*')) {
        const category = acceptType.split('/')[0];
        return file.type.startsWith(category);
      }
      return acceptType === file.type;
    });

  const addFiles = async (files: FileList | File[]) => {
    const acceptedFiles = Array.from(files).filter(isAcceptableFile);
    const rejectedCount = Array.from(files).length - acceptedFiles.length;
    if (rejectedCount > 0) {
      showSnackBar(
        `Invalid file type. Please use ${accept.join(', ')}`,
        'error'
      );
    }
    if (acceptedFiles.length === 0) return;

    const newFiles: MultiImageInput[] = await Promise.all(
      acceptedFiles.map(async (file, index) => {
        let processedFile = file;

        try {
          if (await isHeic(file)) {
            const convertedBlob = await heicTo({
              blob: file,
              type: 'image/jpeg'
            });

            processedFile = new File(
              [convertedBlob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              { type: 'image/jpeg' }
            );
          }
        } catch (err) {
          console.warn('HEIC conversion failed:', file.name, err);
        }

        return {
          file: processedFile,
          order: value.length + index,
          preview: URL.createObjectURL(processedFile)
        };
      })
    );

    onChange([...value, ...newFiles]);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    await addFiles(files);

    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await addFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  function handleClear() {
    value.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    onChange([]);
  }

  function handleRemove(index: number) {
    const fileToRemove = value[index];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  }

  function fileNameTruncate(fileName: string) {
    const maxLength = 10;
    return fileName.length > maxLength
      ? fileName.slice(0, maxLength) + '...'
      : fileName;
  }

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
          position: 'relative',
          borderColor: isDragging ? theme.palette.primary.main : undefined,
          borderWidth: isDragging ? 2 : 1,
          borderStyle: isDragging ? 'dashed' : 'solid'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <Box
          width="100%"
          height="100%"
          onClick={value?.length ? undefined : handleImportClick}
          sx={{
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            cursor: value?.length ? undefined : 'pointer'
          }}
        >
          {value?.length ? (
            value.map((file, index) => (
              <Box
                key={index}
                sx={{
                  margin: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '120px',
                  border: 1,
                  borderRadius: 1,
                  padding: 1,
                  position: 'relative'
                }}
              >
                {file.preview ? (
                  <Box
                    component="img"
                    src={file.preview}
                    alt={file.file.name}
                    sx={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 40 }} />
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mt: 0.5
                  }}
                >
                  <Typography variant="caption">
                    {fileNameTruncate(file.file.name)}
                  </Typography>
                  <Box
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRemove(index)}
                  >
                    ✖
                  </Box>
                </Box>
              </Box>
            ))
          ) : isDragging ? (
            <Typography variant="body2" color="primary">
              {t('toolMultipleInput.dropFilesHere')}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ px: 2 }}
            >
              {t('toolMultipleInput.selectFilesDescription')}
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
        multiple
      />
    </Box>
  );
}
