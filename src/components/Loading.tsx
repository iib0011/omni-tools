import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useTimeout } from '../hooks';

export type FuseLoadingProps = {
  delay?: number;
  className?: string;
};

/**
 * FuseLoading displays a loading state with an optional delay
 */
function FuseLoading(props: FuseLoadingProps) {
  const { delay = 0, className } = props;
  const [showLoading, setShowLoading] = useState(!delay);

  useTimeout(() => {
    setShowLoading(true);
  }, delay);

  return (
    <div>
      <Typography
        className="-mb-16 text-13 font-medium sm:text-20"
        color="text.secondary"
      >
        Loading
      </Typography>
      <Box
        id="spinner"
        sx={{
          '& > div': {
            backgroundColor: 'palette.secondary.main'
          }
        }}
      >
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </Box>
    </div>
  );
}

export default FuseLoading;
