import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Stack,
  Button
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import { HistoryEntry } from '../hooks/useToolHistory';

interface ToolHistoryDrawerProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isToday) return `Today at ${time}`;

  return (
    date.toLocaleDateString([], {
      day: '2-digit',
      month: 'short'
    }) +
    ' at ' +
    time
  );
}

function truncate(text: string, max = 120): string {
  if (!text) return '—';
  const clean = text.replace(/\n/g, ' ');
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

export default function ToolHistoryDrawer({
  history,
  onRestore,
  onRemove,
  onClear
}: ToolHistoryDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="History">
        <span>
          <IconButton
            onClick={() => setOpen(true)}
            disabled={history.length === 0}
            size="small"
            aria-label="Open history"
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 400 }, p: 0 }
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.5}
          borderBottom={(theme) =>
            `1px solid ${theme.palette.divider}`
          }
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon fontSize="small" color="action" />
            <Typography fontWeight={600} fontSize={15}>
              History
            </Typography>
            <Typography
              fontSize={12}
              color="text.secondary"
              sx={{
                background: 'background.default',
                px: 0.8,
                py: 0.2,
                borderRadius: 1
              }}
            >
              {history.length} / 10
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Clear all">
              <IconButton
                size="small"
                onClick={onClear}
                aria-label="Clear history"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              aria-label="Close history"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box overflow="auto" flex={1}>
          {history.length === 0 ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={200}
            >
              <Typography color="text.secondary" fontSize={14}>
                No history yet.
              </Typography>
            </Box>
          ) : (
            history.map((entry, index) => (
              <Box key={entry.id}>
                <Box px={2} py={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={0.5}
                  >
                    <Typography fontSize={11} color="text.disabled">
                      {formatTimestamp(entry.timestamp)}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Restore">
                        <IconButton
                          size="small"
                          onClick={() => {
                            onRestore(entry);
                            setOpen(false);
                          }}
                          aria-label="Restore entry"
                        >
                          <RestoreIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => onRemove(entry.id)}
                          aria-label="Remove entry"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {entry.input && (
                    <Box mb={0.5}>
                      <Typography
                        fontSize={11}
                        fontWeight={600}
                        color="text.secondary"
                        textTransform="uppercase"
                        letterSpacing={0.5}
                        mb={0.3}
                      >
                        Input
                      </Typography>
                      <Typography
                        fontSize={13}
                        color="text.primary"
                        sx={{
                          fontFamily: 'monospace',
                          backgroundColor: 'background.default',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5
                        }}
                      >
                        {truncate(entry.input)}
                      </Typography>
                    </Box>
                  )}

                  {entry.result && (
                    <Box>
                      <Typography
                        fontSize={11}
                        fontWeight={600}
                        color="text.secondary"
                        textTransform="uppercase"
                        letterSpacing={0.5}
                        mb={0.3}
                      >
                        Result
                      </Typography>
                      <Typography
                        fontSize={13}
                        color="text.primary"
                        sx={{
                          fontFamily: 'monospace',
                          backgroundColor: 'background.default',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5
                        }}
                      >
                        {truncate(entry.result)}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    size="small"
                    startIcon={<RestoreIcon />}
                    onClick={() => {
                      onRestore(entry);
                      setOpen(false);
                    }}
                    sx={{ mt: 1, fontSize: 12 }}
                  >
                    Restore this
                  </Button>
                </Box>
                {index < history.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Box>
      </Drawer>
    </>
  );
}