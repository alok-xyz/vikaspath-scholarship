import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const numberVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  const textVariants = {
    initial: { x: -50, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <Box
            sx={{
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Animated 404 */}
            <motion.div
              variants={numberVariants}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '100px', sm: '150px', md: '200px' },
                  fontWeight: 'bold',
                  textShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                  mb: 2
                }}
              >
                404
              </Typography>
            </motion.div>

            {/* Error Messages */}
            <motion.div
              variants={textVariants}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  textShadow: '2px 2px 0px rgba(0,0,0,0.2)'
                }}
              >
                Oops! Page Not Found
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.8,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                The page you're looking for seems to have wandered off into the scholarship universe. 
                Let's get you back on track!
              </Typography>
            </motion.div>

            {/* Home Button */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { 
                  delay: 0.5,
                  duration: 0.5
                }
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#1a237e',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                Back to Home
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                opacity: 0.1,
                zIndex: -1,
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)'
              }}
            />
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFound;
