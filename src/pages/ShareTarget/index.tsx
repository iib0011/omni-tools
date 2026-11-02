import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { validNamespaces } from '../../i18n';
import { tools } from '../../tools';
import {
  clearSharedData,
  detectCategoriesForFile,
  getSharedData,
  SharedData
} from '../../utils/sharedContent';
import { useSharedContent } from '../../contexts/SharedContentContext';
import ToolCard from '../../components/allTools/ToolCard';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ShareTarget() {
  const { t } = useTranslation(validNamespaces);
  const theme = useTheme();
  const navigate = useNavigate();
  const { setPendingShare } = useSharedContent();

  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getSharedData()
      .then((data) => {
        if (
          data &&
          ((data.files && data.files.length > 0) || data.text || data.url)
        ) {
          setSharedData(data);
          clearSharedData();
          if (
            data.files &&
            data.files.length > 0 &&
            data.files[0].type.startsWith('image/')
          ) {
            const url = URL.createObjectURL(data.files[0]);
            setPreviewUrl(url);
          }
        }
      })
      .finally(() => setLoading(false));

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleManualFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSharedData({ files });
      if (files[0].type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    }
  };

  const handleToolSelect = (toolPath: string) => {
    if (sharedData) {
      setPendingShare(sharedData);
    }
    navigate(`/${toolPath}`);
  };

  // Determine compatible tools
  const matchingCategories =
    sharedData?.files && sharedData.files.length > 0
      ? detectCategoriesForFile(sharedData.files[0])
      : sharedData?.text || sharedData?.url
        ? ['string', 'json', 'xml', 'csv']
        : [];

  const matchedTools = tools.filter(
    (tool) =>
      matchingCategories.includes(tool.type) ||
      tool.alternativeCategories?.some((cat) =>
        matchingCategories.includes(cat)
      )
  );

  const primaryFile = sharedData?.files?.[0];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {loading ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Loading shared content...
          </Typography>
        </Box>
      ) : sharedData && (primaryFile || sharedData.text || sharedData.url) ? (
        <Stack spacing={4}>
          {/* File / Content Info Card */}
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider'
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems="center"
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Shared preview"
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: 1,
                      borderColor: 'divider'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: '#fff'
                    }}
                  >
                    <Icon
                      icon={
                        primaryFile
                          ? primaryFile.type === 'application/pdf'
                            ? 'ph:file-pdf'
                            : primaryFile.type.startsWith('video/')
                              ? 'ph:video'
                              : primaryFile.type.startsWith('audio/')
                                ? 'ph:speaker-high'
                                : 'ph:file'
                          : 'ph:text-align-left'
                      }
                      fontSize={40}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  <Typography
                    variant="overline"
                    color="primary"
                    fontWeight={600}
                  >
                    Shared Content Received
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h1"
                    fontWeight={700}
                    noWrap
                  >
                    {primaryFile
                      ? primaryFile.name
                      : sharedData.title || 'Shared Text'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {primaryFile
                      ? `${formatBytes(primaryFile.size)} • ${
                          primaryFile.type || 'Unknown type'
                        }`
                      : sharedData.text || sharedData.url}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Heading */}
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Choose a tool to open this with:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select any of the compatible tools below to process your shared
              file.
            </Typography>
          </Box>

          {/* Tool Grid */}
          <Grid container spacing={3}>
            {matchedTools.map((tool) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={tool.path}
                onClick={() => handleToolSelect(tool.path)}
                sx={{ cursor: 'pointer' }}
              >
                <ToolCard
                  title={t(tool.name as any)}
                  description={t(tool.shortDescription as any)}
                  link={`/${tool.path}`}
                  icon={tool.icon}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : (
        /* Empty State */
        <Box textAlign="center" py={8}>
          <Icon
            icon="solar:share-circle-bold-duotone"
            fontSize={72}
            color={theme.palette.text.secondary}
          />
          <Typography variant="h4" fontWeight={700} mt={2} gutterBottom>
            Share Target
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            maxWidth={500}
            mx="auto"
            mb={4}
          >
            No content was shared yet. Install OmniTools as a PWA and share a
            file from your device or gallery to launch it here.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              component="label"
              startIcon={<Icon icon="ph:upload-simple-bold" />}
            >
              Test with a local file
              <input type="file" hidden onChange={handleManualFileInput} />
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Browse All Tools
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
