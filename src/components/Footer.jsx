import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';
import styled from 'styled-components';
import { keyframes } from 'styled-components';

// Add glow animation
const glowAnimation = keyframes`
  0% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6; }
  100% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6; }
`;

const FooterContainer = styled(Box)`
  background-color: #000000;
  color: white;
  padding: 40px 0 20px;
  margin-top: auto;
`;

const FooterSection = styled(Box)`
  margin-bottom: 24px;
`;

const ContactItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const DeveloperName = styled(Link)`
  color: #00bfff;
  text-decoration: none;
  animation: ${glowAnimation} 2s ease-in-out infinite alternate;
  cursor: pointer;
  
  &:hover {
    color: #66d9ff;
  }
`;

const Footer = () => {
  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Support Section */}
          <Grid item xs={12} md={4}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                Support for VPS
              </Typography>
              <ContactItem>
                <Email />
                <Link
                  href="mailto:hardc6700@gmail.com"
                  color="inherit"
                  underline="hover"
                >
                  helpdesk.vps-wb@gov.in
                </Link>
              </ContactItem>
              <ContactItem>
                <Phone />
                <Link
                  href="tel:+18001028014"
                  color="inherit"
                  underline="hover"
                >
                  +1800-102-8014
                </Link>
              </ContactItem>
            </FooterSection>
          </Grid>

          {/* Quick Links Section */}
          <Grid item xs={12} md={4}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                QUICK LINKS
              </Typography>
              <Box>
                <Link
                  href="/"
                  color="inherit"
                  display="block"
                  underline="hover"
                  sx={{ mb: 1 }}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  color="inherit"
                  display="block"
                  underline="hover"
                >
                  About
                </Link>
              </Box>
            </FooterSection>
          </Grid>

          {/* Developer Info Section */}
          <Grid item xs={12} md={4}>
            <FooterSection>
             
              <Typography variant="body2" sx={{ mb: 1 }}>
                Website developed & Maintained By{' '}
                <DeveloperName 
                  href="https://github.com/alok-xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Alok Guha Roy
                </DeveloperName>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Content, DATA and Process owned and maintained by Department of Higher Education, Government of West Bengal.
              </Typography>
            </FooterSection>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            pt: 2,
            mt: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Copyright © 2017 - 2025. All Rights Reserved | This site is best viewed in
            Firefox 58.0.1 or above, Google Chrome 58.0 or above, IE 8 or above.
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
