import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import logo from 'assets/logo.png';
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
  const navItems: { label: string; path: string }[] = [
    // { label: 'Features', path: '/features' }
    // { label: 'About Us', path: '/about-us' }
  ];

  const drawerList = (
    <List>
      {navItems.map((navItem) => (
        <ListItemButton onClick={() => navigate(navItem.path)}>
          <ListItemText primary={navItem.label} />
        </ListItemButton>
      ))}
      <iframe
        src="https://ghbtns.com/github-btn.html?user=twbs&repo=bootstrap&type=star&count=true&size=large"
        frameBorder="0"
        scrolling="0"
        width="170"
        height="30"
        title="GitHub"
      ></iframe>
    </List>
  );

  return (
    <AppBar
      position="static"
      style={{
        backgroundColor: 'white',
        color: 'black'
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0px 2px 2px #C8C9CE'
        }}
      >
        <img
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          src={logo}
          width={isMobile ? '80px' : '150px'}
        />
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.main
                }
              }}
            >
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
          <Stack direction={'row'} spacing={2}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                sx={{
                  '&:hover': {
                    color: theme.palette.primary.main,
                    transition: 'color 0.3s ease',
                    backgroundColor: 'white'
                  }
                }}
              >
                <Link
                  to={item.path}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
            <iframe
              src="https://ghbtns.com/github-btn.html?user=iib0011&repo=omni-tools&type=star&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="170"
              height="30"
              title="GitHub"
            ></iframe>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
