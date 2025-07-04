import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  Button
} from '@mui/material';
import InputHeader from '../InputHeader';
import greyPattern from '@assets/grey-pattern.png';
import { globalInputHeight } from '../../config/uiConfig';
import ResultFooter from './ResultFooter';

export default function ToolFileResult({
  title = 'Result',
  value,
  zipFile,
  loading,
  loadingText
}: {
  title?: string;
  value: File[];
  zipFile?: File | null;
  loading?: boolean;
  loadingText?: string;
}) {
  const theme = useTheme();

  const getFileType = (
    file: File
  ): 'image' | 'video' | 'audio' | 'pdf' | 'unknown' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('application/pdf')) return 'pdf';
    return 'unknown';
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <InputHeader title={title} />

      <Box
        sx={{
          width: '100%',
          maxHeight: globalInputHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: 1,
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'background.paper',
          p: 2
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: globalInputHeight
            }}
          >
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {loadingText}... This may take a moment.
            </Typography>
          </Box>
        ) : value.length > 0 ? (
          value.map((file, idx) => {
            const preview = URL.createObjectURL(file);
            const fileType = getFileType(file);

            return (
              <Box
                key={idx}
                sx={{
                  backgroundImage:
                    fileType === 'image' && theme.palette.mode !== 'dark'
                      ? `url(${greyPattern})`
                      : 'none',
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: 2
                }}
              >
                {fileType === 'image' && (
                  <img
                    src={preview}
                    alt={`Preview ${idx}`}
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                  />
                )}
                {fileType === 'video' && (
                  <video src={preview} controls style={{ maxWidth: '100%' }} />
                )}
                {fileType === 'audio' && (
                  <audio src={preview} controls style={{ width: '100%' }} />
                )}
                {fileType === 'pdf' && (
                  <iframe src={preview} width="100%" height="400px" />
                )}
                {fileType === 'unknown' && (
                  <Typography>File ready. Click below to download.</Typography>
                )}
                <Button
                  onClick={() => handleDownload(file)}
                  size="small"
                  sx={{ mt: 1 }}
                  variant="outlined"
                >
                  Download {file.name}
                </Button>
              </Box>
            );
          })
        ) : (
          <Typography>No output available yet.</Typography>
        )}
      </Box>

      {zipFile && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => handleDownload(zipFile)}>
            Download All as ZIP
          </Button>
        </Box>
      )}

      <ResultFooter
        disabled
        hideCopy
        handleCopy={() => {}}
        handleDownload={() => {}}
      />
    </Box>
  );
}
