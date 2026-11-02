import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
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
import { categoriesColors } from '../../config/uiConfig';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Helmet } from 'react-helmet';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.light
  }
}));

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
  const [searchTerm, setSearchTerm] = useState('');

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
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
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

  // Determine compatible categories and tools
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

  const filteredTools = matchedTools.filter((tool) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = t(tool.name as any).toLowerCase();
    const desc = t(tool.shortDescription as any).toLowerCase();
    return name.includes(term) || desc.includes(term);
  });

  const primaryFile = sharedData?.files?.[0];
  const hasContent = Boolean(
    primaryFile || sharedData?.text || sharedData?.url
  );

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: 'calc(100vh - 120px)',
        pb: 8
      }}
    >
      <Helmet>
        <title>Open With Tool - OmniTools</title>
      </Helmet>

      <Box mt={2} mx={{ xs: 2, md: 4, lg: 8 }} p={{ xs: 1, sm: 2, md: 3 }}>
        {/* Top Header Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => navigate('/')}>
              <ArrowBackIcon color="primary" />
            </IconButton>
            <Typography
              fontSize={{ xs: 20, sm: 24 }}
              fontWeight={700}
              color={theme.palette.primary.main}
            >
              Open with Tool
            </Typography>
          </Stack>

          {hasContent && matchedTools.length > 3 && (
            <TextField
              size="small"
              placeholder="Filter tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
                sx: {
                  borderRadius: 4,
                  backgroundColor: 'background.paper',
                  width: { xs: '100%', sm: 260 }
                }
              }}
            />
          )}
        </Stack>

        <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />

        {loading ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h6" color="text.secondary">
              Loading shared content...
            </Typography>
          </Box>
        ) : hasContent ? (
          <Box>
            {/* Shared File / Content Preview Card */}
            <Box
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: `5px 4px 2px ${
                  theme.palette.mode === 'dark' ? 'black' : '#E9E9ED'
                }`,
                border: `1px solid ${theme.palette.background.default}`,
                borderRadius: 2,
                p: { xs: 2, sm: 3 },
                mb: 4
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2.5} alignItems="center">
                  {previewUrl ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Shared preview"
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        objectFit: 'cover',
                        border: `1px solid ${theme.palette.divider}`,
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          theme.palette.mode === 'dark' ? '#2A2E30' : '#EBF5FF',
                        color: theme.palette.primary.main,
                        flexShrink: 0
                      }}
                    >
                      <Icon
                        icon={
                          primaryFile
                            ? primaryFile.type === 'application/pdf'
                              ? 'ph:file-pdf-duotone'
                              : primaryFile.type.startsWith('video/')
                                ? 'ph:video-duotone'
                                : primaryFile.type.startsWith('audio/')
                                  ? 'ph:speaker-high-duotone'
                                  : 'ph:file-duotone'
                            : 'ph:text-align-left-duotone'
                        }
                        fontSize={42}
                      />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'primary.main',
                        display: 'block'
                      }}
                    >
                      Shared Content Received
                    </Typography>
                    <Typography
                      fontSize={{ xs: 18, sm: 20 }}
                      fontWeight={700}
                      sx={{
                        wordBreak: 'break-word',
                        color: theme.palette.mode === 'dark' ? 'white' : 'black'
                      }}
                    >
                      {primaryFile
                        ? primaryFile.name
                        : sharedData?.title || 'Shared Text'}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mt={0.5}
                      flexWrap="wrap"
                    >
                      {primaryFile && (
                        <Chip
                          label={formatBytes(primaryFile.size)}
                          size="small"
                          sx={{ height: 22, fontSize: 12, fontWeight: 600 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {primaryFile
                          ? primaryFile.type || 'Binary file'
                          : sharedData?.text || sharedData?.url}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<Icon icon="ph:arrows-clockwise-bold" />}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                  Choose another file
                  <input type="file" hidden onChange={handleManualFileInput} />
                </Button>
              </Stack>
            </Box>

            {/* Section Header */}
            <Typography
              fontSize={18}
              fontWeight={700}
              color={theme.palette.text.primary}
              mb={2}
            >
              Choose a tool to process this {primaryFile ? 'file' : 'content'} (
              {filteredTools.length}):
            </Typography>

            {/* Compatible Tools Grid (matching ToolsByCategory layout) */}
            <Grid container spacing={2}>
              {filteredTools.map((tool, index) => (
                <Grid item xs={12} sm={6} lg={4} key={tool.path}>
                  <Stack
                    sx={{
                      backgroundColor: 'background.paper',
                      boxShadow: `5px 4px 2px ${
                        theme.palette.mode === 'dark' ? 'black' : '#E9E9ED'
                      }`,
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        backgroundColor: theme.palette.background.hover,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => handleToolSelect(tool.path)}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    padding={2}
                    border={`1px solid ${theme.palette.background.default}`}
                    borderRadius={2}
                  >
                    <Icon
                      icon={tool.icon ?? 'ph:compass-tool-thin'}
                      fontSize="55px"
                      color={categoriesColors[index % categoriesColors.length]}
                      style={{ flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <StyledLink
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color:
                            theme.palette.mode === 'dark' ? 'white' : 'black',
                          display: 'block'
                        }}
                        to={'/' + tool.path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToolSelect(tool.path);
                        }}
                      >
                        {/*@ts-ignore*/}
                        {t(tool.name)}
                      </StyledLink>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {/*@ts-ignore*/}
                        {t(tool.shortDescription)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          /* Empty State */
          <Box
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: `5px 4px 2px ${
                theme.palette.mode === 'dark' ? 'black' : '#E9E9ED'
              }`,
              border: `1px solid ${theme.palette.background.default}`,
              borderRadius: 2,
              textAlign: 'center',
              py: 8,
              px: 3,
              maxWidth: 600,
              mx: 'auto',
              mt: 4
            }}
          >
            <Icon
              icon="solar:share-circle-bold-duotone"
              fontSize={72}
              color={theme.palette.primary.main}
            />
            <Typography variant="h5" fontWeight={700} mt={2} gutterBottom>
              Share Target
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              maxWidth={450}
              mx="auto"
              mb={4}
            >
              No content was shared yet. You can share a file, text, or link
              with OmniTools from your device&apos;s share menu, or choose a
              local file below to test the tool picker.
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
      </Box>
    </Box>
  );
}
