import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to your error tracking service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error logged:', errorData);
    
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, { extra: errorData });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                maxWidth: 600,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <ErrorOutlineIcon 
                    sx={{ 
                      fontSize: 80, 
                      color: 'error.main',
                      mb: 2 
                    }} 
                  />
                </motion.div>

                <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
                  Oops! Something went wrong
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                  We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
                </Typography>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      textAlign: 'left',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      Error Details (Development Mode):
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReload}
                    size="large"
                  >
                    Reload Page
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                    size="large"
                  >
                    Go Home
                  </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
                  If this problem persists, please contact our support team.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;