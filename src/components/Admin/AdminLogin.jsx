import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  InputAdornment, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined as LockIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    userType: '',
    loginId: '',
    password: '',
    securityCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [generatedSecurityCode, setGeneratedSecurityCode] = useState('');
  const securityCodeCanvasRef = useRef(null);
  const navigate = useNavigate();

  // Generate security code
  const generateSecurityCode = () => {
    // Generate 6-digit numeric security code
    const newSecurityCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSecurityCode(newSecurityCode);
    
    // Render security code on canvas
    const canvas = securityCodeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw security code text
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    
    // Add slight rotation and offset to each character
    for (let i = 0; i < newSecurityCode.length; i++) {
      ctx.save();
      ctx.translate(
        canvas.width / 2 - 90 + i * 40, 
        canvas.height / 2
      );
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(newSecurityCode[i], 0, 0);
      ctx.restore();
    }
  };

  // Regenerate security code
  const reloadSecurityCode = () => {
    generateSecurityCode();
  };

  // Initialize security code on component mount
  useEffect(() => {
    generateSecurityCode();
  }, []);

  const userTypeOptions = [
    { value: 'institution', label: 'Head of Institution Login' },
    { value: 'admin', label: 'Administrator Login' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'userType' && { loginId: '', password: '', securityCode: '' })
    }));
    setError(''); // Clear any previous errors
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const { userType, loginId, password, securityCode } = formData;

    // Hardcoded credentials
    const CREDENTIALS = {
      admin: {
        loginId: 'ADMIN2025',
        password: 'alok@123',
        route: '/admin/dashboard'
      },
      institution: {
        loginId: 'HOILOG2569',
        password: '202569',
        route: '/institution-dashboard'
      }
    };

    // Validate credentials based on user type
    const selectedCredentials = CREDENTIALS[userType];

    if (!userType) {
      setError('Please select a user type');
      return;
    }

    if (!loginId.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Validate security code
    if (securityCode.trim() !== generatedSecurityCode) {
      setError('Invalid Security Code. Please try again.');
      generateSecurityCode();
      return;
    }

    if (
      selectedCredentials && 
      loginId.trim() === selectedCredentials.loginId && 
      password.trim() === selectedCredentials.password
    ) {
      // Store user info in sessionStorage (more secure than localStorage)
      sessionStorage.setItem('userType', userType);
      sessionStorage.setItem('loginId', loginId);
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to appropriate dashboard
      navigate(selectedCredentials.route, { replace: true });
    } else {
      setError('Invalid login credentials');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={handleHomeClick}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            borderRadius: 2,
            textTransform: 'none',
            color: 'primary.main',
            borderColor: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          Home
        </Button>

        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LockIcon sx={{ m: 1, bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: '50%' }} />
            <Typography component="h1" variant="h5">
              Admin Login
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select User Type</InputLabel>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                label="Select User Type"
                required
              >
                {userTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.userType && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Login ID"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  autoComplete="off"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Security Code Challenge */}
                <Box 
                  sx={{ 
                    mt: 2, 
                    mb: 2, 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <canvas 
                    ref={securityCodeCanvasRef}
                    width={300} 
                    height={80}
                    style={{ 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      maxWidth: '100%'
                    }}
                  />
                  <IconButton onClick={reloadSecurityCode} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Box>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Enter Security Code"
                  name="securityCode"
                  value={formData.securityCode}
                  onChange={handleChange}
                  placeholder="Enter the numbers above"
                  type="number"
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!formData.userType}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
