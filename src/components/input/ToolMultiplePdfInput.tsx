import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { isArray } from 'lodash';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface MultiPdfInputComponentProps {
  accept: string[];
  title?: string;
  type: 'pdf';
  value: MultiPdfInput[];
  onChange: (file: MultiPdfInput[]) => void;
}
export interface MultiPdfInput {
  file: File;
  order: number;
}

export default function ToolMultiFileInput({
  value,
  onChange,
  accept,
  title,
  type
}: MultiPdfInputComponentProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

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

  const handleCopy = () => {
    if (isArray(value)) {
      const blob = new Blob([value[0].file], { type: value[0].file.type });
      const clipboardItem = new ClipboardItem({ [value[0].file.type]: blob });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => showSnackBar('File copied', 'success'))
        .catch((err) => {
          showSnackBar('Failed to copy: ' + err, 'error');
        });
    }
  };

  function handleClear() {
    onChange([]);
  }

  function fileNameTruncate(fileName: string) {
    const maxLength = 10;
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
    console.log(sourceIndex, destinationIndex);
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
        title={title || 'Input ' + type.charAt(0).toUpperCase() + type.slice(1)}
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PictureAsPdfIcon />
                  <Typography sx={{ marginLeft: 1 }}>
                    {fileNameTruncate(file.file.name)}
                  </Typography>
                </Box>
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    const updatedFiles = value.filter((_, i) => i !== index);
                    onChange(updatedFiles);
                  }}
                >
                  ✖
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files selected
            </Typography>
          )}
        </Box>
      </Box>

      <InputFooter
        handleCopy={handleCopy}
        handleImport={handleImportClick}
        handleClear={handleClear}
      />
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
