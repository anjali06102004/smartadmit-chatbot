import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';

const LoadingScreen = ({ message = 'Loading...', progress = null }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: 3,
      }}
    >
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 20,
          duration: 1 
        }}
      >
        <SchoolIcon sx={{ fontSize: 80, mb: 3, color: 'white' }} />
      </motion.div>

      {/* Title Animation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          College Chatbot
        </Typography>
      </motion.div>

      {/* Subtitle Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 4,
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          AI-Powered Admission Assistant
        </Typography>
      </motion.div>

      {/* Loading Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            opacity: 0.8,
          }}
        >
          {message}
        </Typography>

        {/* Progress Bar */}
        {progress !== null ? (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
                borderRadius: 3,
              }
            }}
          />
        ) : (
          <LinearProgress 
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
                borderRadius: 3,
              }
            }}
          />
        )}
      </motion.div>

      {/* Floating Dots Animation */}
      <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        ))}
      </Box>

      {/* Footer Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 4,
            opacity: 0.6,
            fontSize: '0.875rem',
          }}
        >
          Powered by Advanced AI & RAG Technology
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;