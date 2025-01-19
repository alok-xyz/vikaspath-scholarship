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
  Grid,
  useTheme
} from '@mui/material';
import {
  School,
  Group,
  CheckCircle,
  AttachMoney,
  Send,
  Visibility,
  Info
} from '@mui/icons-material';

const About = () => {
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
          About VikasPath Scholarship
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
        Instructions for submission of Online Application of VikasPath Scholarship
      </Typography>

      {/* Guidelines Note */}
      <Box sx={{ display: 'flex', alignItems: 'start', mb: 4 }}>
        <Info color="error" sx={{ mr: 1, mt: 0.5 }} />
        <Typography variant="body1">
          Please go through the Guidelines (About Menu) of VikasPath Scholarship carefully before you start filling the Online Application Form.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Objective Section */}
        <Grid item xs={12} md={6}>
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
              <School /> Objective
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <Typography variant="body1">
                The primary objective is to ensure talented students from marginalized communities are not hindered by financial constraints. 
                This one-time grant of ₹20,000 aims to ease financial burden and encourage academic excellence.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Scope Section */}
        <Grid item xs={12} md={6}>
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
              <Group /> Scope
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <Typography variant="body1">
                Exclusively open to Scheduled Caste (SC) and Scheduled Tribe (ST) students who meet eligibility criteria 
                and are enrolled in graduation-level programs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Eligibility Criteria Section */}
        <Grid item xs={12} md={6}>
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
              <CheckCircle /> Eligibility Criteria
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <List>
                {[
                  { text: 'SC/ST categories', secondary: 'Must belong to Scheduled Caste or Scheduled Tribe' },
                  { text: 'Graduation Level', secondary: 'Pursuing courses in recognized institutions' },
                  { text: 'Academic Record', secondary: 'Must demonstrate satisfactory performance' },
                  { text: 'Admission Status', secondary: 'Secured admission in graduation program' }
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={item.text} secondary={item.secondary} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Scholarship Amount Section */}
        <Grid item xs={12} md={6}>
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
              <AttachMoney /> Scholarship Amount
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <Box sx={{ 
                p: 3,
                borderRadius: 2,
                mt: 2
              }}>
                <Typography variant="h3" color="primary.main" gutterBottom>
                  20,000
                </Typography>
                <Typography variant="body1">
                  One-time financial assistance via Direct Benefit Transfer (DBT)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Process Section */}
        <Grid item xs={12}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
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
              <Send /> Application Process
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" paragraph>
                    Apply online through the official VikasPath Scholarship Portal. Provide personal details, 
                    academic credentials, and community proof.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Required Documents:</Typography>
                  <List>
                    {[
                      'SC/ST Certificate',
                      'Admission Receipt',
                      'Bank Account Details',
                      'Academic Certificates'
                    ].map((doc, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={doc} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Vision Section */}
        <Grid item xs={12}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
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
              <Visibility /> Our Vision
            </Box>
            <CardContent sx={{ pl: 4, pt: 6 }}>
              <Typography variant="body1">
                The VikasPath Scholarship envisions a future where students from SC/ST communities have equal opportunities 
                to achieve their dreams and contribute to the nation's progress. By alleviating financial stress, 
                we aim to nurture a generation of confident and capable leaders.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
