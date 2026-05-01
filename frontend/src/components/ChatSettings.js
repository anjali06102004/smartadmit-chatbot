import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Psychology as PsychologyIcon,
  Voice as VoiceIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import AdminDashboard from './AdminDashboard';
import AIMonitoring from './AIMonitoring';

const ChatSettings = ({ onClose }) => {
  const {
    voiceEnabled,
    autoSpeak,
    language,
    theme,
    toggleVoice,
    toggleAutoSpeak,
    setLanguage,
    setTheme,
    analytics,
  } = useChat();

  const [tabValue, setTabValue] = useState(0);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAIMonitoring, setShowAIMonitoring] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAdminDashboard = () => {
    setShowAdminDashboard(true);
  };

  const handleAIMonitoring = () => {
    setShowAIMonitoring(true);
  };

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'hi-IN', name: 'Hindi' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<DashboardIcon />} label="Admin" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tabValue === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ p: 2 }}>
              {/* Voice Settings */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VoiceIcon sx={{ mr: 1 }} />
                Voice Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Enable Voice Input"
                    secondary="Use microphone for voice commands"
                  />
                  <Switch
                    checked={voiceEnabled}
                    onChange={toggleVoice}
                    color="primary"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Auto-Speak Responses"
                    secondary="Automatically speak bot responses"
                  />
                  <Switch
                    checked={autoSpeak}
                    onChange={toggleAutoSpeak}
                    color="primary"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Appearance Settings */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1 }} />
                Appearance
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Theme"
                    secondary="Choose your preferred theme"
                  />
                  <Box sx={{ minWidth: 120 }}>
                    {themes.map((themeOption) => (
                      <Button
                        key={themeOption.value}
                        variant={theme === themeOption.value ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setTheme(themeOption.value)}
                        sx={{ mr: 1, mb: 1 }}
                      >
                        {themeOption.label}
                      </Button>
                    ))}
                  </Box>
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Language Settings */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1 }} />
                Language
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Interface Language"
                    secondary="Language for the chat interface"
                  />
                  <Box sx={{ minWidth: 150 }}>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '100%',
                      }}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Analytics */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Session Analytics
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Messages"
                    secondary={analytics.totalMessages}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sessions Today"
                    secondary={analytics.sessionsToday}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Average Response Time"
                    secondary={`${analytics.averageResponseTime.toFixed(2)}s`}
                  />
                </ListItem>
              </List>
            </Box>
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ p: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Admin dashboard provides system monitoring and analytics.
              </Alert>
              
              <Button
                variant="contained"
                startIcon={<DashboardIcon />}
                onClick={handleAdminDashboard}
                fullWidth
                sx={{ mb: 2 }}
              >
                Open Admin Dashboard
              </Button>

              <Button
                variant="outlined"
                startIcon={<PsychologyIcon />}
                onClick={handleAIMonitoring}
                fullWidth
                sx={{ mb: 2 }}
              >
                AI Model Monitoring
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Monitor RAG system status, conversation memory, AI model performance, and system health.
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* AI Monitoring Modal */}
      {showAIMonitoring && (
        <AIMonitoring onClose={() => setShowAIMonitoring(false)} />
      )}
    </Box>
  );
};

export default ChatSettings;
