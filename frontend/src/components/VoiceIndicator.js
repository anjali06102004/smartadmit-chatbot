import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceIndicator = ({ isListening, isSpeaking, transcript }) => {
  return (
    <AnimatePresence>
      {(isListening || isSpeaking) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 2,
              m: 2,
              borderRadius: 2,
              backgroundColor: isListening ? 'primary.light' : 'secondary.light',
              border: 1,
              borderColor: isListening ? 'primary.main' : 'secondary.main',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <motion.div
                animate={isListening ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? (
                  <MicIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                ) : (
                  <VolumeUpIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
                )}
              </motion.div>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {isListening ? 'Listening...' : 'Speaking...'}
                </Typography>
                
                {transcript && isListening && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    "{transcript}"
                  </Typography>
                )}

                <LinearProgress
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: isListening ? 'primary.main' : 'secondary.main',
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceIndicator;
