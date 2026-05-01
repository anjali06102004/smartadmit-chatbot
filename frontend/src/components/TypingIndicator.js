import React from 'react';
import {
  Box,
  Typography,
  Fade,
} from '@mui/material';
import {
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <Fade in={true}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            opacity: 0.7,
          }}
        >
          <BotIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Assistant is typing
          </Typography>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Typography variant="body2" color="text.secondary">
              ...
            </Typography>
          </motion.div>
        </Box>
      </motion.div>
    </Fade>
  );
};

export default TypingIndicator;
