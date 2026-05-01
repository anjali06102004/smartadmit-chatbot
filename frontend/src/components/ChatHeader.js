import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Clear as ClearIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ChatHeader = ({ 
  onSettingsClick, 
  onClearClick, 
  messageCount, 
  isConnected 
}) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Left side - Title and status */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            College Assistant
          </Typography>
        </motion.div>
        
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
            <Chip
              icon={
                <CircleIcon 
                  sx={{ 
                    fontSize: 8, 
                    color: isConnected ? 'success.main' : 'error.main' 
                  }} 
                />
              }
              label={isConnected ? 'Online' : 'Offline'}
              size="small"
              color={isConnected ? 'success' : 'error'}
              variant="outlined"
            />
          </Tooltip>
          
          {messageCount > 0 && (
            <Chip
              label={`${messageCount} messages`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>
      </Box>

      {/* Right side - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Clear Chat">
          <IconButton
            onClick={onClearClick}
            size="small"
            color="default"
            disabled={messageCount === 0}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Settings">
          <IconButton
            onClick={onSettingsClick}
            size="small"
            color="primary"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatHeader;
