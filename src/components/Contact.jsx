import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  Button
} from '@mui/material';
import { Info } from '@mui/icons-material';

const Contact = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Banner */}
      <Box 
        sx={{ 
          bgcolor: '#00b894',
          py: 2,
          px: 4,
          mb: 4,
          borderRadius: '4px',
          transform: 'skew(-20deg)',
          '& > *': { transform: 'skew(20deg)' }
        }}
      >
        <Typography variant="h4" component="h1" color="white" align="center">
          Contact Us
        </Typography>
      </Box>

      {/* Instructions Header */}
      <Typography 
        variant="h5" 
        color="primary" 
        gutterBottom 
        sx={{ 
          borderBottom: '2px solid #e74c3c',
          pb: 1,
          mb: 3
        }}
      >
        Get in Touch
      </Typography>

      {/* Contact Information */}
      <Paper elevation={3} sx={{ padding: '20px', mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          If you have any questions or need assistance, feel free to reach out to us:
        </Typography>
        <Typography variant="body1">Email: support@vikaspathscholarship.com</Typography>
        <Typography variant="body1">Phone: +1 234 567 890</Typography>
        <Typography variant="body1">Address: 123 Scholarship Lane, Education City, Country</Typography>
      </Paper>

      <Typography variant="body1" align="center">We look forward to hearing from you!</Typography>
    </Container>
  );
};

export default Contact;