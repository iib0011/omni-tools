import React from 'react';
import { Box, useTheme, Tooltip, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';

// Helper to escape regex special characters
const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const HighlightText = ({
  text,
  highlight,
  isCurrent
}: {
  text: string;
  highlight: string;
  isCurrent?: boolean;
}) => {
  if (!highlight) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={index}
            style={{
              backgroundColor: isCurrent ? '#ff9800' : '#ffe082',
              color: '#000000',
              borderRadius: '2px',
              padding: '0 2px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease'
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export const getChildPath = (
  parentPath: string,
  key: string | number
): string => {
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }
  const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  if (isValidIdentifier) {
    return parentPath === '$' ? `$.${key}` : `${parentPath}.${key}`;
  } else {
    return `${parentPath}["${key.replace(/"/g, '\\"')}"]`;
  }
};

interface TreeNodeProps {
  name?: string | number;
  value: any;
  path: string;
  depth: number;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  searchQuery: string;
  currentMatchPath: string | null;
  showSnackBar: (message: string, variant: 'success' | 'error') => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  path,
  depth,
  expandedPaths,
  onToggleExpand,
  searchQuery,
  currentMatchPath,
  showSnackBar
}) => {
  const theme = useTheme();

  // Determine the type
  let type: 'null' | 'array' | 'object' | 'string' | 'number' | 'boolean' =
    'null';
  if (value === null) {
    type = 'null';
  } else if (Array.isArray(value)) {
    type = 'array';
  } else if (typeof value === 'object') {
    type = 'object';
  } else if (typeof value === 'string') {
    type = 'string';
  } else if (typeof value === 'number') {
    type = 'number';
  } else if (typeof value === 'boolean') {
    type = 'boolean';
  }

  const isContainer = type === 'array' || type === 'object';
  const isExpanded = expandedPaths.has(path);
  const isCurrentMatch = path === currentMatchPath;

  let childCount = 0;
  let isEmpty = false;
  if (isContainer) {
    if (type === 'array') {
      childCount = value.length;
      isEmpty = childCount === 0;
    } else {
      childCount = Object.keys(value).length;
      isEmpty = childCount === 0;
    }
  }

  // Color scheme based on dark/light mode
  const isDark = theme.palette.mode === 'dark';
  const colors = isDark
    ? {
        key: '#e5c07b', // warm gold
        string: '#98c379', // soft green
        number: '#d19a66', // light orange
        boolean: '#56b6c2', // cyan/teal
        null: '#7f848e', // dark gray
        syntax: '#abb2bf' // light gray
      }
    : {
        key: '#a626a4', // deep purple
        string: '#50a14f', // green
        number: '#986801', // dark yellow-brown
        boolean: '#0184bc', // deep cyan/blue
        null: '#a0a1a7', // light gray
        syntax: '#383a42' // dark gray
      };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(path)
      .then(() => showSnackBar(`Copied path: ${path}`, 'success'))
      .catch(() => showSnackBar('Failed to copy path', 'error'));
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const stringifiedValue =
      typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value);
    navigator.clipboard
      .writeText(stringifiedValue)
      .then(() => showSnackBar('Copied node value to clipboard', 'success'))
      .catch(() => showSnackBar('Failed to copy value', 'error'));
  };

  // Render value representation
  const renderValueRepresentation = () => {
    if (type === 'null') {
      return (
        <span style={{ color: colors.null, fontStyle: 'italic' }}>
          <HighlightText
            text="null"
            highlight={searchQuery}
            isCurrent={isCurrentMatch}
          />
        </span>
      );
    }
    if (type === 'boolean') {
      return (
        <span style={{ color: colors.boolean, fontWeight: 'bold' }}>
          <HighlightText
            text={String(value)}
            highlight={searchQuery}
            isCurrent={isCurrentMatch}
          />
        </span>
      );
    }
    if (type === 'number') {
      return (
        <span style={{ color: colors.number }}>
          <HighlightText
            text={String(value)}
            highlight={searchQuery}
            isCurrent={isCurrentMatch}
          />
        </span>
      );
    }
    if (type === 'string') {
      const displayStr = `"${value}"`;
      return (
        <span
          style={{
            color: colors.string,
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap'
          }}
        >
          <HighlightText
            text={displayStr}
            highlight={searchQuery}
            isCurrent={isCurrentMatch}
          />
        </span>
      );
    }
    return null;
  };

  return (
    <Box
      id={path}
      data-path={path}
      sx={{
        pl: 2,
        borderLeft:
          depth > 0
            ? `1px dashed ${
                isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
              }`
            : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        transition: 'background-color 0.2s',
        backgroundColor: isCurrentMatch
          ? isDark
            ? 'rgba(255, 167, 38, 0.15)'
            : 'rgba(255, 245, 157, 0.4)'
          : 'transparent',
        borderRadius: '3px'
      }}
    >
      {/* Current node details */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: '2px',
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
            '& .node-actions': {
              opacity: 1
            }
          }
        }}
      >
        {/* Toggle icon */}
        {isContainer && !isEmpty ? (
          <IconButton
            size="small"
            onClick={() => onToggleExpand(path)}
            sx={{
              p: 0,
              mr: '2px',
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              '&:hover': {
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
              }
            }}
          >
            {isExpanded ? (
              <KeyboardArrowDownIcon sx={{ fontSize: '1.1rem' }} />
            ) : (
              <KeyboardArrowRightIcon sx={{ fontSize: '1.1rem' }} />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: '20px' }} />
        )}

        {/* Key name (if parent is object) */}
        {name !== undefined && (
          <Box
            component="span"
            onClick={
              isContainer && !isEmpty ? () => onToggleExpand(path) : undefined
            }
            sx={{
              color: colors.key,
              fontWeight: isContainer ? 600 : 500,
              cursor: isContainer && !isEmpty ? 'pointer' : 'default',
              userSelect: 'none',
              mr: '6px'
            }}
          >
            <HighlightText
              text={typeof name === 'number' ? `${name}` : `"${name}"`}
              highlight={searchQuery}
              isCurrent={isCurrentMatch}
            />
            <span style={{ color: colors.syntax }}>:</span>
          </Box>
        )}

        {/* Value preview or bracket opening */}
        {!isContainer ? (
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {renderValueRepresentation()}
          </Box>
        ) : (
          <Box
            component="span"
            onClick={!isEmpty ? () => onToggleExpand(path) : undefined}
            sx={{
              color: colors.syntax,
              cursor: !isEmpty ? 'pointer' : 'default',
              userSelect: 'none',
              fontWeight: 600
            }}
          >
            {type === 'array' ? '[' : '{'}
            {!isExpanded && (
              <span
                style={{
                  color: colors.null,
                  fontWeight: 'normal',
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  marginLeft: '4px'
                }}
              >
                {isEmpty ? '' : `... `}
                {type === 'array'
                  ? `] // ${childCount} items`
                  : `} // ${childCount} keys`}
              </span>
            )}
          </Box>
        )}

        {/* Action icons shown on hover */}
        <Box
          className="node-actions"
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            opacity: 0,
            transition: 'opacity 0.15s ease',
            height: '18px'
          }}
        >
          <Tooltip title="Copy JSON Path" arrow placement="top">
            <IconButton
              size="small"
              onClick={handleCopyPath}
              sx={{
                p: '1px',
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                '&:hover': {
                  color: isDark ? '#ffffff' : '#000000',
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)'
                }
              }}
            >
              <CodeIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Copy Value" arrow placement="top">
            <IconButton
              size="small"
              onClick={handleCopyValue}
              sx={{
                p: '1px',
                ml: '2px',
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                '&:hover': {
                  color: isDark ? '#ffffff' : '#000000',
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)'
                }
              }}
            >
              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Children elements (if expanded) */}
      {isContainer && isExpanded && !isEmpty && (
        <Box sx={{ mt: '2px' }}>
          {type === 'array'
            ? (value as any[]).map((childVal, index) => (
                <TreeNode
                  key={index}
                  name={index}
                  value={childVal}
                  path={getChildPath(path, index)}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  onToggleExpand={onToggleExpand}
                  searchQuery={searchQuery}
                  currentMatchPath={currentMatchPath}
                  showSnackBar={showSnackBar}
                />
              ))
            : Object.keys(value).map((childKey) => (
                <TreeNode
                  key={childKey}
                  name={childKey}
                  value={value[childKey]}
                  path={getChildPath(path, childKey)}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  onToggleExpand={onToggleExpand}
                  searchQuery={searchQuery}
                  currentMatchPath={currentMatchPath}
                  showSnackBar={showSnackBar}
                />
              ))}

          {/* Bracket closing */}
          <Box
            sx={{
              pl: 2,
              py: '2px',
              color: colors.syntax,
              fontWeight: 600,
              userSelect: 'none',
              fontSize: '0.875rem',
              fontFamily:
                'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
            }}
          >
            {type === 'array' ? ']' : '}'}
          </Box>
        </Box>
      )}
    </Box>
  );
};
