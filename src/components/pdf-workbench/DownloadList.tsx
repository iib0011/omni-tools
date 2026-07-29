import { Button, List, ListItem, ListItemText, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { isCancellationError } from '../../lib/pdf-workbench/errors';
import { saveBlob } from '../../lib/pdf-workbench/save-file';

export interface WorkbenchDownload {
  id: string;
  name: string;
  blob: Blob;
  mimeType: string;
  extensions: string[];
  description?: string;
}

export default function DownloadList({
  downloads,
  downloadLabel,
  onSaveError,
  preferFilePicker = true
}: {
  downloads: WorkbenchDownload[];
  downloadLabel: string;
  onSaveError: (error: unknown) => void;
  preferFilePicker?: boolean;
}) {
  return (
    <List disablePadding>
      {downloads.map((download) => (
        <ListItem
          key={download.id}
          divider
          secondaryAction={
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => {
                void saveBlob(download.blob, {
                  suggestedName: download.name,
                  mimeType: download.mimeType,
                  extensions: download.extensions,
                  description: download.description,
                  preferFilePicker
                }).catch((error: unknown) => {
                  if (!isCancellationError(error)) onSaveError(error);
                });
              }}
            >
              {downloadLabel}
            </Button>
          }
        >
          <Stack>
            <ListItemText
              primary={download.name}
              secondary={download.description}
            />
          </Stack>
        </ListItem>
      ))}
    </List>
  );
}
