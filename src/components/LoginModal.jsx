import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { loginWithApplicantId } from '../firebase';
import { toast } from 'react-toastify';
import SchoolIcon from '@mui/icons-material/School';

const LoginModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [userSecurityCode, setUserSecurityCode] = useState('');
  const [formData, setFormData] = useState({
    applicantId: '',
    password: ''
  });

  // Generate random 5-digit security code
  const generateSecurityCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setSecurityCode(code);
    setUserSecurityCode(''); // Reset user input when generating new code
  };

  // Generate security code on component mount and modal open
  useEffect(() => {
    if (open) {
      generateSecurityCode();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'securityCode') {
      setUserSecurityCode(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate security code
    if (userSecurityCode !== securityCode) {
      setError('Invalid security code');
      return;
    }

    setLoading(true);

    try {
      const { applicantId, password } = formData;
      
      if (!applicantId || !password) {
        throw new Error('Please fill in all fields');
      }

      const result = await loginWithApplicantId(applicantId, password);

      if (result.success) {
        // Set session data
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userType', 'student');
        sessionStorage.setItem('studentId', result.student.id);
        sessionStorage.setItem('applicantId', result.student.applicantId);
        
        toast.success('Login successful!');
        onClose();
        navigate('/dashboard');
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: 2,
          width: '400px',
          '& .MuiDialogContent-root': {
            padding: '20px 35px'
          }
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1976d2',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: '12px 24px',
          minHeight: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <SchoolIcon sx={{ fontSize: 22 }} />
        <Typography 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: 0.5
          }}
        >
          SIGN IN FOR SCHOLARSHIP
        </Typography>
        {!loading && (
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              padding: '4px',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              mt: 1,
              py: 0,
              '& .MuiAlert-message': {
                fontSize: '13px',
                py: 1
              }
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: error ? 0 : 1 }}>
            {/* Applicant ID */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.7,
                color: '#444',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Applicant Id
            </Typography>
            <TextField
              fullWidth
              name="applicantId"
              value={formData.applicantId}
              onChange={handleChange}
              disabled={loading}
              required
              autoFocus
              placeholder="Enter your Applicant Id"
              size="small"
              error={error && error.includes('applicant')}
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  height: '38px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': {
                    borderColor: '#90caf9'
                  }
                }
              }}
            />

            {/* Password field with similar improvements */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.7,
                color: '#444',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="Enter your password"
              size="small"
              error={error && error.includes('password')}
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  height: '38px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': {
                    borderColor: '#90caf9'
                  }
                }
              }}
            />

            {/* Security Code section */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.7,
                color: '#444',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Security Code
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: '6px 10px',
                  bgcolor: '#f8f9fa',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '110px'
                }}
              >
                <Typography 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '16px'
                  }}
                >
                  {securityCode}
                </Typography>
                <IconButton 
                  onClick={generateSecurityCode} 
                  size="small"
                  sx={{ 
                    p: 0,
                    '&:hover': { 
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Paper>

              <TextField
                fullWidth
                name="securityCode"
                value={userSecurityCode}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="Enter security code"
                size="small"
                error={error && error.includes('security')}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    height: '38px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    '&:hover fieldset': {
                      borderColor: '#90caf9'
                    }
                  }
                }}
                inputProps={{ 
                  maxLength: 6,
                  style: { 
                    letterSpacing: 2,
                    fontWeight: 500
                  }
                }}
              />
            </Box>

            {/* Forgot Password Link */}
            <Box sx={{ mb: 3 }}>
              <Link
                href="#"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: '#1565c0'
                  }
                }}
              >
                Forgot Applicant Id/Password?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                height: '36px',
                textTransform: 'uppercase',
                fontSize: '14px',
                fontWeight: 500,
                bgcolor: '#ff6b00',
                '&:hover': { 
                  bgcolor: '#f05600'
                },
                '&:disabled': {
                  bgcolor: '#ffccbc'
                },
                boxShadow: 'none'
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'LOGIN'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
