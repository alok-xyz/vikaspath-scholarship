import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  Schedule,
  ArrowForward,
  Info,
  CheckCircle,
  School,
  Group,
  AttachMoney,
  Send,
  Visibility
} from '@mui/icons-material';

const HowToApply = () => {
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
          How To Apply
        </Typography>
      </Box>

      {/* Instructions Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Info color="primary" sx={{ mr: 1 }} />
        <Typography 
          variant="h5" 
          color="primary" 
          gutterBottom 
          sx={{ 
            borderBottom: '2px solid #e74c3c',
            pb: 1,
            mb: 0
          }}
        >
          Instructions for submission of Online Application of VikasPath Scholarship
        </Typography>
      </Box>

      {/* Guidelines Note */}
      <Box sx={{ display: 'flex', alignItems: 'start', mb: 4 }}>
        <Info color="error" sx={{ mr: 1, mt: 0.5 }} />
        <Typography variant="body1">
          Please go through the Guidelines (About Menu) of VikasPath Scholarship carefully before you start filling the Online Application Form.
        </Typography>
      </Box>

      {/* Schedule Section */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Schedule sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
            <Typography variant="h5" color="primary">Schedule for Online Application</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2c3e50' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '40%' }}>Application Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>Opening Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>Closing Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Fresh Application 2024</TableCell>
                  <TableCell>20.11.2024</TableCell>
                  <TableCell>--</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Application Steps */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ArrowForward color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 6, mb: 0 }}>
          Application Procedure: Steps to be followed to apply online
        </Typography>
      </Box>

      {/* Step Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Step 1 */}
        <Card sx={{ position: 'relative', overflow: 'visible', height: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              left: -16,
              top: 16,
              bgcolor: '#00b894',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CheckCircle /> Online Registration
          </Box>
          <CardContent sx={{ pl: 4, pt: 6 }}>
            <Typography variant="body1">
              At first applicants need to fill up and submit the online registration form. On successful submission of the Registration Form, 
              an Applicant ID of 15 characters will be generated and it will be used to login and complete the remaining Steps of the Application Form.
            </Typography>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card sx={{ position: 'relative', overflow: 'visible', height: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              left: -16,
              top: 16,
              bgcolor: '#00b894',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CheckCircle /> Online Application
          </Box>
          <CardContent sx={{ pl: 4, pt: 6 }}>
            <Typography variant="body1">
              Login with the generated Applicant ID, Password (which was set during Registration Process) and Captcha (Security Code). 
              After successful login, fill up rest of the application forms.
            </Typography>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card sx={{ position: 'relative', overflow: 'visible', height: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              left: -16,
              top: 16,
              bgcolor: '#00b894',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CheckCircle /> Upload Documents
          </Box>
          <CardContent sx={{ pl: 4, pt: 6 }}>
            <Typography variant="body1">
              After successful submission of application forms, Scanned Supporting Document Upload form will be appeared. 
              Upload all necessary documents as mentioned in the form.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default HowToApply;