import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, SnackbarContent } from '@mui/material';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  const handleClose = () => setNeedRefresh(false);

  return (
    <Snackbar
      open={needRefresh}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <SnackbarContent
        message="New version available"
        action={
          <>
            <Button
              color="primary"
              size="small"
              onClick={() => updateServiceWorker(true)}
            >
              Update
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              Dismiss
            </Button>
          </>
        }
      />
    </Snackbar>
  );
}
