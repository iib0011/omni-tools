import React, { ReactNode, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import logo from 'assets/logo.png';
import logoWhite from 'assets/logo-white.png';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Mode } from 'components/App';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  mode: Mode;
  onChangeMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  mode,
  onChangeMode: onChangeMode
}) => {
  const { t } = useTranslation();
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

  const buttons: ReactNode[] = [
    <Icon
      key={mode}
      onClick={onChangeMode}
      style={{ cursor: 'pointer' }}
      fontSize={30}
      icon={
        mode === 'dark'
          ? 'ic:round-dark-mode'
          : mode === 'light'
            ? 'ic:round-light-mode'
            : 'ic:round-contrast'
      }
    />,
    <Icon
      onClick={() => window.open('https://discord.gg/SDbbn3hT4b', '_blank')}
      style={{ cursor: 'pointer' }}
      fontSize={30}
      icon={'ic:baseline-discord'}
    />,
    <iframe
      src="https://ghbtns.com/github-btn.html?user=iib0011&repo=omni-tools&type=star&count=true&size=large"
      frameBorder="0"
      scrolling="0"
      width="150"
      height="30"
      title="GitHub"
    ></iframe>,
    <Button
      onClick={() => {
        window.open('https://buymeacoffee.com/iib0011', '_blank');
      }}
      sx={{ borderRadius: '100px' }}
      variant={'contained'}
      startIcon={
        <Icon
          style={{ cursor: 'pointer' }}
          fontSize={25}
          icon={'mdi:heart-outline'}
        />
      }
    >
      {t('navbar.buyMeACoffee')}
    </Button>
  ];
  const drawerList = (
    <List>
      {navItems.map((navItem) => (
        <ListItemButton
          key={navItem.path}
          onClick={() => navigate(navItem.path)}
        >
          <ListItemText primary={navItem.label} />
        </ListItemButton>
      ))}
      {buttons.map((button) => (
        <ListItem>{button}</ListItem>
      ))}
    </List>
  );

  return (
    <AppBar
      position="static"
      sx={{
        background: 'transparent',
        boxShadow: 'none',
        color: 'text.primary',
        pt: 2
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mx: { md: '50px', lg: '150px' }
        }}
      >
        <Link to="/">
          <img
            src={theme.palette.mode === 'light' ? logo : logoWhite}
            width={isMobile ? '120px' : '200px'}
          />
        </Link>
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
          <Stack direction={'row'} spacing={3} alignItems={'center'}>
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
            {buttons}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
