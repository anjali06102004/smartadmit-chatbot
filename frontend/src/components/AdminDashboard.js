import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chatService } from '../services/chatService';

const AdminDashboard = ({ onClose }) => {
  const [ragStats, setRagStats] = useState(null);
  const [memoryStats, setMemoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ragData, memoryData] = await Promise.all([
        chatService.getRAGStats(),
        chatService.getMemoryStats()
      ]);
      
      setRagStats(ragData);
      setMemoryStats(memoryData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch system statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'error': return 'error';
      case 'not_initialized': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'not_initialized': return <WarningIcon />;
      default: return <WarningIcon />;
    }
  };

  if (loading && !ragStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>System Dashboard</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>Loading system statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          System Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh Statistics">
            <IconButton onClick={fetchStats} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* RAG System Status */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Vector Database (RAG)</Typography>
                </Box>
                
                {ragStats ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        icon={getStatusIcon(ragStats.status)}
                        label={ragStats.status?.toUpperCase() || 'UNKNOWN'}
                        color={getStatusColor(ragStats.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <StorageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Documents"
                          secondary={ragStats.totalDocuments || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <MemoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Collection"
                          secondary={ragStats.collectionName || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Memory System Status */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MemoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Conversation Memory</Typography>
                </Box>
                
                {memoryStats ? (
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Conversations"
                        secondary={memoryStats.totalConversations || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Messages"
                        secondary={memoryStats.totalMessages || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Avg Messages/Conversation"
                        secondary={memoryStats.averageMessagesPerConversation || 0}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {ragStats?.status === 'active' ? '✓' : '✗'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RAG System
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {memoryStats ? '✓' : '✗'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Memory Service
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {ragStats?.totalDocuments > 0 ? '✓' : '✗'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Knowledge Base
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {memoryStats?.totalConversations > 0 ? '✓' : '✗'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Sessions
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchStats}
                    disabled={loading}
                  >
                    Refresh Stats
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      // Add cleanup functionality here
                      console.log('Cleanup old conversations');
                    }}
                  >
                    Cleanup Old Data
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => {
                      // Add export functionality here
                      console.log('Export analytics');
                    }}
                  >
                    Export Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
