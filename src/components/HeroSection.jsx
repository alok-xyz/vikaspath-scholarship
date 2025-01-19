import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import styled from 'styled-components';

const BannerImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const ContentContainer = styled(Container)`
  margin-top: -50px;
  position: relative;
  z-index: 1;
`;

const InfoBox = styled(Paper)`
  padding: 20px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CMImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const HeroSection = () => {
  return (
    <Box component="section" className="w-100">
      <img
        src="/ban.png"
        alt="VikasPath Scholarship Banner"
        className="img-fluid w-100 shadow"
      />

      <ContentContainer maxWidth="lg">
        <Typography
          variant="h5"
          component="h1"
          align="center"
          sx={{
            my: 4,
            color: '#333333', 
            background: 'linear-gradient(to right, #004d40, #f7bb97)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          sx={{
            mb: 4,
            padding: '15px 30px',
            color: 'white',
            background: '#00b894',
            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            width: 'fit-content',
            margin: '0 auto 2rem auto',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Welcome to VPS Portal
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            mb: 4
          }}
        >
          <InfoBox elevation={3} sx={{ borderRadius: '8px' }}>
            <Typography variant="h5" gutterBottom color="primary">
              About VPS
            </Typography>
            <Typography paragraph sx={{ textAlign: 'justify' }}>
              The VikasPath Scholarship is a dedicated initiative aimed at empowering students from SC and ST communities
              by providing financial assistance for pursuing graduation-level education. 
              This program is exclusively designed to promote higher education among underprivileged sections,
              ensuring equitable access to quality learning opportunities. Through this scholarship, 
              we aim to nurture talent and foster growth in aspiring individuals, paving the way for a brighter and more inclusive future.
            </Typography>
            <Typography paragraph sx={{ textAlign: 'justify' }}>
              The scholarship provides comprehensive financial assistance 
              to eligible candidates, covering their educational expenses 
              and enabling them to focus on their studies without financial 
              burden.
            </Typography>
          </InfoBox>

          <InfoBox elevation={3} sx={{ borderRadius: '8px' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <CMImage
                src="/CM.jpg"
                alt="Chief Minister"
              />
              <Typography variant="h6" gutterBottom>
                Honorable Chief Minister
              </Typography>
              <Typography variant="body1" color="text.secondary">
                "Education is the most powerful weapon which you can use to 
                change the world. Through VikasPath Scholarship, we aim to 
                provide equal opportunities to all talented students from 
                SC & ST communities, enabling them to pursue their dreams 
                and contribute to nation-building."
              </Typography>
            </Box>
          </InfoBox>
        </Box>
      </ContentContainer>
    </Box>
  );
};

export default HeroSection;
