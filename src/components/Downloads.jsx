import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container
} from '@mui/material';
import { Download } from '@mui/icons-material';

const Downloads = () => {
  const theme = useTheme();

  const handleDownload = (fileName) => {
    // Logic to download the file
    const link = document.createElement('a');
    link.href = `/${fileName}.pdf`; // Update with actual file paths
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Downloads
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
        Available Downloads
      </Typography>

      {/* Downloads List */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Download color="primary" />
            </ListItemIcon>
            <ListItemText primary="Income Certificate" />
            <Button variant="contained" onClick={() => handleDownload('Income_Certificate')}>
              Download
            </Button>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Download color="primary" />
            </ListItemIcon>
            <ListItemText primary="User Manual" />
            <Button variant="contained" onClick={() => handleDownload('User_Manual')}>
              Download
            </Button>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Download color="primary" />
            </ListItemIcon>
            <ListItemText primary="GUIDELINES" />
            <Button variant="contained" onClick={() => handleDownload('GUIDELINES')}>
              Download
            </Button>
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default Downloads;