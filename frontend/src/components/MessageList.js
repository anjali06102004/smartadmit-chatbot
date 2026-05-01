import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Source as SourceIcon,
  TrendingUp as ConfidenceIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return 'Now';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              {/* Avatar for bot messages */}
              {message.sender === 'bot' && (
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
              )}

              {/* Message content */}
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' 
                    ? 'primary.main' 
                    : 'background.paper',
                  color: message.sender === 'user' 
                    ? 'primary.contrastText' 
                    : 'text.primary',
                  borderRadius: message.sender === 'user' 
                    ? '18px 18px 4px 18px' 
                    : '18px 18px 18px 4px',
                  position: 'relative',
                  border: message.isError ? '1px solid' : 'none',
                  borderColor: message.isError ? 'error.main' : 'transparent',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>

                {/* Message metadata */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 1,
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>

                  {/* Confidence score for bot messages */}
                  {message.sender === 'bot' && message.confidence !== undefined && (
                    <Tooltip title={`Confidence: ${(message.confidence * 100).toFixed(1)}%`}>
                      <Chip
                        icon={<ConfidenceIcon />}
                        label={getConfidenceLabel(message.confidence)}
                        size="small"
                        color={getConfidenceColor(message.confidence)}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  )}

                  {/* Response time for bot messages */}
                  {message.sender === 'bot' && message.responseTime && (
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {(message.responseTime / 1000).toFixed(1)}s
                    </Typography>
                  )}
                </Box>

                {/* Sources for bot messages */}
                {message.sender === 'bot' && message.sources && message.sources.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                      Sources:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.sources.map((source, idx) => (
                        <Chip
                          key={idx}
                          icon={<SourceIcon />}
                          label={source}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Avatar for user messages */}
              {message.sender === 'user' && (
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isTyping && (
        <Fade in={isTyping}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: 0.7,
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <BotIcon fontSize="small" />
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Assistant is typing...
              </Typography>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
