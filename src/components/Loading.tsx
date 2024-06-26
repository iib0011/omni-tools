import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Loading.css';

function Loading() {
  return (
    <Box
      sx={{
        width: '100%',
        height: 0.8 * window.innerHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography color="primary">Loading</Typography>
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
    </Box>
  );
}

export default Loading;
