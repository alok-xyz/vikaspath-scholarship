import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';

const TopBar = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#fff',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  padding: theme.spacing(1, 0),
}));

const TopBarContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const AdminButton = styled(Button)(({ theme }) => ({
  color: '#666',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const NavigationBar = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
}));

const NavigationContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const Logo = styled('img')({
  height: '60px',
  width: 'auto',
});

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: '#444',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#2e7d32',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLoginClick = () => {
    setLoginOpen(true);
  };

  const handleRegisterClick = () => {
    setRegisterOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  return (
    <Box>
      {/* Top Bar with Logo and Admin Login */}
      <TopBar>
        <TopBarContent maxWidth="xl">
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Logo src="/logo.png" alt="Logo" />
          </RouterLink>
          <Button 
            color="inherit" 
            sx={{ 
              fontSize: { xs: '0.7rem', md: '0.9rem' }, 
              padding: '5px 10px', 
              display: { xs: 'none', md: 'inline-flex' }, 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '5px', 
              transition: 'background-color 0.3s', 
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } 
            }}
            startIcon={<AdminPanelSettingsIcon />}
            onClick={handleAdminLogin}
          >
            <span style={{ display: { xs: 'none', md: 'inline' } }}>Administrator Login</span>
          </Button>
        </TopBarContent>
      </TopBar>

      {/* Navigation Bar */}
      <NavigationBar>
        <NavigationContent maxWidth="xl">
          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'flex-end' }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: '#444' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            <MenuItem component={RouterLink} to="/" onClick={handleCloseNavMenu}>
              Home
            </MenuItem>
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseNavMenu}>
              About
            </MenuItem>
            <MenuItem component={RouterLink} to="/Howtoapply" onClick={handleCloseNavMenu}>
              How To Apply
            </MenuItem>
            <MenuItem component={RouterLink} to="/downloads" onClick={handleCloseNavMenu}>
              Downloads
            </MenuItem>
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseNavMenu}>
              Contacts
            </MenuItem>
          </Menu>

          {/* Desktop Navigation */}
          <NavigationContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
            <StyledButton component={RouterLink} to="/">
              Home
            </StyledButton>
            <StyledButton component={RouterLink} to="/about">
              About
            </StyledButton>
            <StyledButton component={RouterLink} to="/Howtoapply">
              How To Apply
            </StyledButton>
            <StyledButton component={RouterLink} to="/downloads">
              Downloads
            </StyledButton>
            <StyledButton component={RouterLink} to="/contact">
              Contacts
            </StyledButton>
          </NavigationContainer>

          {/* Login/Register Buttons */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={1} 
            sx={{ 
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 1, md: 0 }
            }}
          >
            <LoginButton
              fullWidth={false}
              variant="contained"
              onClick={handleLoginClick}
            >
              Applicant Login
            </LoginButton>
            <RegisterButton
              fullWidth={false}
              variant="contained"
              onClick={handleRegisterClick}
            >
              Registration
            </RegisterButton>
          </Stack>
        </NavigationContent>
      </NavigationBar>

      {/* Modals */}
      <LoginModal 
        open={loginOpen}
        onClose={handleLoginClose}
      />
      <RegistrationModal
        open={registerOpen}
        onClose={handleRegisterClose}
      />
    </Box>
  );
};

export default Header;
