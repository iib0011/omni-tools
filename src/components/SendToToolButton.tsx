import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box
} from '@mui/material';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { usePipeSend } from '../hooks/usePipeTarget';
import { tools } from '../tools';
import { useTranslation } from 'react-i18next';

interface SendToToolButtonProps {
  /** current value of the result to send */
  value: string;
  /** path of the current tool, e.g. "base64-encode" */
  currentToolPath: string;
  /** readable label of the current tool, e.g. "Base64 Encode" */
  currentToolLabel: string;
  /**
   * List of tool paths that make sense as a destination.
   * If omitted, shows all available tools.
   */
  allowedTargets?: string[];
}

export default function SendToToolButton({
  value,
  currentToolPath,
  currentToolLabel,
  allowedTargets
}: SendToToolButtonProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { send } = usePipeSend(currentToolPath, currentToolLabel);
  const { t } = useTranslation();

  const candidates = tools.filter(
    (tool) =>
      tool.path !== currentToolPath &&
      (allowedTargets ? allowedTargets.includes(tool.path) : true)
  );

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchor(e.currentTarget);
  }

  function handleClose() {
    setAnchor(null);
  }

  function handleSelect(targetPath: string) {
    send(value);
    handleClose();
    navigate('/' + targetPath);
  }

  if (!value.trim()) return null;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<CallSplitIcon fontSize="small" />}
        onClick={handleOpen}
        sx={{ fontSize: 12, whiteSpace: 'nowrap' }}
      >
        {t('translation:pipe.sendTo', 'Send to tool…')}
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        PaperProps={{ sx: { maxHeight: 320, width: 280 } }}
      >
        <Box px={2} py={1}>
          <Typography fontSize={11} color="text.secondary">
            {t('translation:pipe.menuTitle', 'Choose destination tool')}
          </Typography>
        </Box>

        <Divider />

        {candidates.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary={
                <Typography fontSize={13} color="text.secondary">
                  {t('translation:pipe.noTargets', 'No targets available')}
                </Typography>
              }
            />
          </MenuItem>
        )}

        {candidates.map((tool) => (
          <MenuItem
            key={tool.path}
            onClick={() => handleSelect(tool.path)}
            dense
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon
                icon={tool.icon ?? 'ph:compass-tool-thin'}
                fontSize={18}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography fontSize={13}>{t(tool.name as any)}</Typography>
              }
              secondary={
                <Typography fontSize={11} color="text.secondary" noWrap>
                  {t(tool.shortDescription as any)}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}