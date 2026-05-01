import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as BrochureIcon,
  School as ApplyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const QuickActions = ({ onAction, onClose }) => {
  const actions = [
    {
      id: 'call',
      label: 'Call Us',
      icon: <PhoneIcon />,
      color: 'success',
      description: 'Speak with admissions',
    },
    {
      id: 'email',
      label: 'Email',
      icon: <EmailIcon />,
      color: 'primary',
      description: 'Send us an email',
    },
    {
      id: 'brochure',
      label: 'Brochure',
      icon: <BrochureIcon />,
      color: 'info',
      description: 'Download brochure',
    },
    {
      id: 'apply',
      label: 'Apply Now',
      icon: <ApplyIcon />,
      color: 'warning',
      description: 'Start application',
    },
  ];

  return (
    <Fade in={true}>
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
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'primary.light',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="h6" color="primary">
              Quick Actions
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 2,
            }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip title={action.description} placement="top">
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)',
                      },
                      border: 1,
                      borderColor: `${action.color}.light`,
                    }}
                    onClick={() => onAction(action.id)}
                  >
                    <IconButton
                      size="large"
                      color={action.color}
                      sx={{
                        mb: 1,
                        bgcolor: `${action.color}.light`,
                        '&:hover': {
                          bgcolor: `${action.color}.main`,
                          color: 'white',
                        },
                      }}
                    >
                      {action.icon}
                    </IconButton>
                    <Typography variant="body2" fontWeight="medium">
                      {action.label}
                    </Typography>
                  </Paper>
                </Tooltip>
              </motion.div>
            ))}
          </Box>
        </Paper>
      </motion.div>
    </Fade>
  );
};

export default QuickActions;
