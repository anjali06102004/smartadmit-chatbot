import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import {
  Help as HelpIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SuggestedQuestions = ({ questions, onQuestionClick }) => {
  const defaultQuestions = [
    "What are the admission requirements?",
    "Tell me about the courses offered",
    "What is the fee structure?",
    "How do I apply for admission?",
    "What are the hostel facilities?",
    "What scholarships are available?",
    "What are the placement opportunities?",
    "How can I contact the college?",
  ];

  const questionsToShow = questions.length > 0 ? questions : defaultQuestions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <HelpIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="600" color="primary">
            How can I help you today?
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ask me anything about admissions, courses, fees, facilities, or college life.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            maxWidth: 600,
          }}
        >
          {questionsToShow.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Chip
                label={question}
                onClick={() => onQuestionClick(question)}
                variant="outlined"
                color="primary"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  mb: 1,
                }}
              />
            </motion.div>
          ))}
        </Box>

        <Paper
          elevation={1}
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: 'background.default',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            maxWidth: 500,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" color="success.main">
              Popular Topics
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Students frequently ask about admissions, course details, fee structure, 
            hostel facilities, and placement opportunities.
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default SuggestedQuestions;
