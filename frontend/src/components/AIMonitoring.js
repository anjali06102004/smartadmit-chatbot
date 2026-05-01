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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chatService } from '../services/chatService';

const AIMonitoring = ({ onClose }) => {
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAIStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be a new endpoint for AI service stats
      const response = await fetch('/api/chat/ai-stats');
      const data = await response.json();
      
      setAiStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching AI stats:', err);
      setError('Failed to fetch AI monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIStats();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAIStats, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'degraded': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'degraded': return <ErrorIcon />;
      case 'error': return <ErrorIcon />;
      default: return <ErrorIcon />;
    }
  };

  const formatResponseTime = (time) => {
    return `${time}ms`;
  };

  const calculateUptime = (success, failures) => {
    const total = success + failures;
    return total > 0 ? Math.round((success / total) * 100) : 0;
  };

  if (loading && !aiStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>AI Model Monitoring</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>Loading AI system statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          AI Model Monitoring
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Now">
            <IconButton onClick={fetchAIStats} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
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
        {/* Model Status Overview */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ mr: 1 }} />
                  Model Status Overview
                </Typography>
                
                {aiStats ? (
                  <Grid container spacing={2}>
                    {Object.entries(aiStats.providers || {}).map(([provider, stats]) => (
                      <Grid item xs={12} sm={6} md={3} key={provider}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {provider.toUpperCase()}
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {calculateUptime(stats.success, stats.failures)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Uptime
                          </Typography>
                          <Typography variant="body2">
                            {stats.success} success, {stats.failures} failures
                          </Typography>
                          <Typography variant="body2">
                            Avg: {formatResponseTime(stats.avgResponseTime)}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Available Models */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MemoryIcon sx={{ mr: 1 }} />
                  Available Models
                </Typography>
                
                {aiStats?.availableModels ? (
                  <Box>
                    <Typography variant="h4" color="primary">
                      {aiStats.availableModels}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Models currently available
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Circuit Breaker Status */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon sx={{ mr: 1 }} />
                  Circuit Breaker Status
                </Typography>
                
                {aiStats?.circuitBreakers ? (
                  <Box>
                    {Object.entries(aiStats.circuitBreakers).map(([provider, breaker]) => (
                      <Box key={provider} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip
                          icon={getStatusIcon(breaker.isOpen ? 'error' : 'active')}
                          label={provider.toUpperCase()}
                          color={getStatusColor(breaker.isOpen ? 'error' : 'success')}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">
                          {breaker.isOpen ? 'Open' : 'Closed'} 
                          {breaker.failures > 0 && ` (${breaker.failures} failures)`}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Performance Table */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Performance Metrics
                </Typography>
                
                {aiStats?.providers ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Provider</TableCell>
                          <TableCell align="right">Success Rate</TableCell>
                          <TableCell align="right">Avg Response Time</TableCell>
                          <TableCell align="right">Total Requests</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(aiStats.providers).map(([provider, stats]) => (
                          <TableRow key={provider}>
                            <TableCell component="th" scope="row">
                              {provider.toUpperCase()}
                            </TableCell>
                            <TableCell align="right">
                              {calculateUptime(stats.success, stats.failures)}%
                            </TableCell>
                            <TableCell align="right">
                              {formatResponseTime(stats.avgResponseTime)}
                            </TableCell>
                            <TableCell align="right">
                              {stats.success + stats.failures}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                icon={getStatusIcon(calculateUptime(stats.success, stats.failures) > 80 ? 'active' : 'degraded')}
                                label={calculateUptime(stats.success, stats.failures) > 80 ? 'Healthy' : 'Degraded'}
                                color={getStatusColor(calculateUptime(stats.success, stats.failures) > 80 ? 'success' : 'warning')}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">No performance data available</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                    onClick={fetchAIStats}
                    disabled={loading}
                  >
                    Refresh Stats
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      // Reset circuit breakers
                      fetch('/api/chat/reset-circuit-breakers', { method: 'POST' });
                    }}
                  >
                    Reset Circuit Breakers
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => {
                      // Export performance data
                      console.log('Export AI performance data');
                    }}
                  >
                    Export Data
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

export default AIMonitoring;
