import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  InputAdornment,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TreeNode, getChildPath } from './TreeNode';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { useTranslation } from 'react-i18next';
import {
  globalInputHeight,
  codeInputHeightOffset
} from '../../../../config/uiConfig';

interface JsonTreeViewerProps {
  parsedJson: any;
  error: string | null;
  rawInput: string;
}

// Recursive function to search for matches and compute ancestor paths to auto-expand
function findMatches(
  val: any,
  query: string
): { matches: string[]; parents: Set<string> } {
  const matches: string[] = [];
  const parents = new Set<string>();

  const normalizedQuery = query.toLowerCase();

  function traverse(currentVal: any, path: string, ancestors: string[]) {
    const addMatch = (nodePath: string) => {
      if (!matches.includes(nodePath)) {
        matches.push(nodePath);
      }
      ancestors.forEach((anc) => parents.add(anc));
    };

    if (Array.isArray(currentVal)) {
      currentVal.forEach((item, index) => {
        const childPath = getChildPath(path, index);
        traverse(item, childPath, [...ancestors, path]);
      });
    } else if (currentVal !== null && typeof currentVal === 'object') {
      Object.keys(currentVal).forEach((key) => {
        const childPath = getChildPath(path, key);

        // Check if key matches query
        if (key.toLowerCase().includes(normalizedQuery)) {
          addMatch(childPath);
        }

        traverse(currentVal[key], childPath, [...ancestors, path]);
      });
    } else {
      // Primitive value check
      const stringVal = String(currentVal).toLowerCase();
      if (stringVal.includes(normalizedQuery)) {
        addMatch(path);
      }
    }
  }

  traverse(val, '$', []);
  return { matches, parents };
}

// Function to collect all container paths for "Expand All"
function getAllContainerPaths(
  val: any,
  path = '$',
  paths: string[] = []
): string[] {
  if (Array.isArray(val)) {
    paths.push(path);
    val.forEach((item, index) => {
      getAllContainerPaths(item, getChildPath(path, index), paths);
    });
  } else if (val !== null && typeof val === 'object') {
    paths.push(path);
    Object.keys(val).forEach((key) => {
      getAllContainerPaths(val[key], getChildPath(path, key), paths);
    });
  }
  return paths;
}

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
  parsedJson,
  error,
  rawInput
}) => {
  const { t } = useTranslation('json');
  const { t: tCommon } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['$'])
  );
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // Clean search and expansion states when input changes
  useEffect(() => {
    setExpandedPaths(new Set(['$']));
    setSearchQuery('');
    setCurrentMatchIndex(-1);
  }, [parsedJson]);

  // Compute matched paths and their parent expansion paths
  const { matchedPaths, matchParentPaths } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { matchedPaths: [], matchParentPaths: new Set<string>() };
    }
    const { matches, parents } = findMatches(parsedJson, searchQuery);
    return { matchedPaths: matches, matchParentPaths: parents };
  }, [parsedJson, searchQuery]);

  // Auto-expand paths when new matches are found
  useEffect(() => {
    if (searchQuery.trim() && matchedPaths.length > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        matchParentPaths.forEach((p) => next.add(p));
        return next;
      });
      setCurrentMatchIndex(0);
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [matchedPaths, matchParentPaths, searchQuery]);

  // Scroll active match node into view
  useEffect(() => {
    if (currentMatchIndex >= 0 && matchedPaths[currentMatchIndex]) {
      const activePath = matchedPaths[currentMatchIndex];
      const element = document.getElementById(activePath);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMatchIndex, matchedPaths]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (error || !parsedJson) return;
    const allPaths = getAllContainerPaths(parsedJson);

    if (allPaths.length > 300) {
      // Performance safeguard: auto-expand up to 3 levels deep
      const safePaths: string[] = [];
      const collectSafe = (val: any, currentPath = '$', depth = 1) => {
        if (depth > 3) return;
        if (Array.isArray(val)) {
          safePaths.push(currentPath);
          val.forEach((item, index) => {
            collectSafe(item, getChildPath(currentPath, index), depth + 1);
          });
        } else if (val !== null && typeof val === 'object') {
          safePaths.push(currentPath);
          Object.keys(val).forEach((key) => {
            collectSafe(val[key], getChildPath(currentPath, key), depth + 1);
          });
        }
      };
      collectSafe(parsedJson);
      setExpandedPaths(new Set(safePaths));
      showSnackBar(
        t('jsonViewer.expandLimited', { count: allPaths.length, depth: 3 }),
        'success'
      );
    } else {
      setExpandedPaths(new Set(allPaths));
    }
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['$']));
  };

  const handleCopyAll = () => {
    if (!rawInput.trim()) return;
    navigator.clipboard
      .writeText(rawInput)
      .then(() => showSnackBar(t('jsonViewer.copiedValue'), 'success'))
      .catch((err) =>
        showSnackBar(
          tCommon('toolTextResult.copyFailed', {
            error: err instanceof Error ? err.message : String(err)
          }),
          'error'
        )
      );
  };

  const handlePrevMatch = () => {
    if (matchedPaths.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev <= 0 ? matchedPaths.length - 1 : prev - 1
    );
  };

  const handleNextMatch = () => {
    if (matchedPaths.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev === matchedPaths.length - 1 ? 0 : prev + 1
    );
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.23)'
          : '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {/* Header Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
          borderBottom: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.01)'
        }}
      >
        {/* Left Toolbar Side: Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            maxWidth: '60%'
          }}
        >
          <TextField
            size="small"
            placeholder={t('jsonViewer.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!!error || !parsedJson}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.2rem', opacity: 0.6 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { fontSize: '0.85rem', py: 0.5 }
            }}
          />

          {searchQuery.trim() && matchedPaths.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                whiteSpace: 'nowrap'
              }}
            >
              <Typography
                variant="caption"
                sx={{ mr: 1, fontWeight: 500, color: 'text.secondary' }}
              >
                {t('jsonViewer.matchCount', {
                  current: currentMatchIndex + 1,
                  total: matchedPaths.length
                })}
              </Typography>
              <IconButton size="small" onClick={handlePrevMatch}>
                <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <IconButton size="small" onClick={handleNextMatch}>
                <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
          )}

          {searchQuery.trim() && matchedPaths.length === 0 && (
            <Typography
              variant="caption"
              sx={{ ml: 1.5, color: 'error.main', fontStyle: 'italic' }}
            >
              {t('jsonViewer.noMatches')}
            </Typography>
          )}
        </Box>

        {/* Right Toolbar Side: Operations */}
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <Tooltip title={t('jsonViewer.expandAll')} arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleExpandAll}
                disabled={!!error || !parsedJson}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                <UnfoldMoreIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={t('jsonViewer.collapseAll')} arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleCollapseAll}
                disabled={!!error || !parsedJson}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                <UnfoldLessIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={tCommon('resultFooter.copy')} arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleCopyAll}
                disabled={!rawInput.trim()}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Body */}
      <Box
        height={`${globalInputHeight + codeInputHeightOffset}px`}
        sx={{
          p: 1.5,
          overflowY: 'auto',
          overflowX: 'auto',
          backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
          fontFamily:
            'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
        }}
      >
        {error ? (
          <Box
            sx={{
              p: 2,
              border: `1px solid ${theme.palette.error.light}`,
              backgroundColor: isDark
                ? 'rgba(244, 67, 54, 0.08)'
                : 'rgba(244, 67, 54, 0.04)',
              borderRadius: 1,
              color: 'error.main'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {t('jsonViewer.invalidJson')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {error}
            </Typography>
          </Box>
        ) : !rawInput.trim() ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {t('validateJson.inputTitle')}
            </Typography>
          </Box>
        ) : (
          <TreeNode
            value={parsedJson}
            path="$"
            depth={0}
            expandedPaths={expandedPaths}
            onToggleExpand={handleToggleExpand}
            searchQuery={searchQuery}
            currentMatchPath={
              currentMatchIndex >= 0 ? matchedPaths[currentMatchIndex] : null
            }
            showSnackBar={showSnackBar}
          />
        )}
      </Box>
    </Paper>
  );
};
