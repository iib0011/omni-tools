import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Link, useNavigate } from 'react-router-dom';
import githubIcon from '@assets/github-mark.png'; // Adjust the path to your GitHub icon

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AppBar
      position="static"
      style={{ backgroundColor: 'white', color: 'black' }}
    >
      <Toolbar>
        <Typography
          onClick={() => navigate('/')}
          fontSize={20}
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          color={'primary'}
        >
          OmniTools
        </Typography>

        <Button color="inherit">
          <Link
            to="/features"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Features
          </Link>
        </Button>
        <Button color="inherit">
          <Link
            to="/about-us"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            About Us
          </Link>
        </Button>

        <IconButton
          color="primary"
          href="https://github.com/iib0011/omni-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={githubIcon}
            alt="GitHub"
            style={{ height: '24px', marginRight: '8px' }}
          />
          <Typography variant="button">Star us</Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
