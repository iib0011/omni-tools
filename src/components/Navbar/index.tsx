import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import githubIcon from '@assets/github-mark.png'; // Adjust the path to your GitHub icon
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const drawerList = (
    <List>
      <ListItemButton onClick={() => navigate('/features')}>
        <ListItemText primary="Features" />
      </ListItemButton>
      <ListItemButton onClick={() => navigate('/about-us')}>
        <ListItemText primary="About Us" />
      </ListItemButton>
      <ListItemButton
        component="a"
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
      </ListItemButton>
    </List>
  );

  return (
    <AppBar
      position="static"
      style={{ backgroundColor: 'white', color: 'black' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          onClick={() => navigate('/')}
          fontSize={20}
          sx={{ cursor: 'pointer' }}
          color={'primary'}
        >
          OmniTools
        </Typography>
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawerList}
            </Drawer>
          </>
        ) : (
          <Stack direction={'row'}>
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
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
