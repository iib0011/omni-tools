import { Button } from '@mui/material';

interface RemoveFileButtonProps {
  onRemove: () => void;
}

export default function RemoveFileButton({ onRemove }: RemoveFileButtonProps) {
  return (
    <Button
      variant="outlined"
      color="error"
      size="small"
      onClick={onRemove}
      sx={{ mt: 1 }}
    >
      Remove File
    </Button>
  );
}
