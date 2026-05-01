import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MessageInput = forwardRef(({
  onSendMessage,
  disabled = false,
  voiceEnabled = false,
  isListening = false,
  onVoiceToggle,
  placeholder = "Type your message...",
  ...props
}, ref) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (onVoiceToggle) {
      onVoiceToggle();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={isFocused ? 4 : 1}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          p: 1,
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          border: isFocused ? 2 : 1,
          borderColor: isFocused ? 'primary.main' : 'divider',
        }}
      >
        <TextField
          ref={ref}
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '1rem',
              '& .MuiInputBase-input': {
                padding: '8px 0',
              },
            },
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Attach file">
                  <IconButton size="small" disabled>
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Add emoji">
                    <IconButton size="small" disabled>
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {voiceEnabled && (
                    <Tooltip title={isListening ? 'Stop listening' : 'Start voice input'}>
                      <IconButton
                        size="small"
                        onClick={handleVoiceToggle}
                        color={isListening ? 'error' : 'primary'}
                        disabled={disabled}
                      >
                        {isListening ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Send message">
                    <IconButton
                      type="submit"
                      size="small"
                      color="primary"
                      disabled={!message.trim() || disabled}
                      sx={{
                        bgcolor: message.trim() ? 'primary.main' : 'transparent',
                        color: message.trim() ? 'white' : 'text.secondary',
                        '&:hover': {
                          bgcolor: message.trim() ? 'primary.dark' : 'action.hover',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              '&:before': {
                display: 'none',
              },
              '&:after': {
                display: 'none',
              },
            },
          }}
        />
      </Paper>
      
      {/* Character count or status */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isListening && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'primary.main',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
              </Box>
            </motion.div>
          )}
        </Box>
        
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {message.length > 0 && `${message.length} characters`}
        </Box>
      </Box>
    </Box>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
