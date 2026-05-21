import React from 'react';
import { Box, Button, Paper, Typography, Alert } from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

/**
 * ErrorFallback Component
 * Displays user-friendly error messages with recovery options
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something Went Wrong',
  description = 'We encountered an unexpected error. Please try again.',
  showDetails = false,
}) => {
  const navigate = useNavigate();
  const [showErrorDetails, setShowErrorDetails] = React.useState(showDetails);

  const getErrorMessage = () => {
    if (!error) return description;

    const errorString = error.toString();
    if (errorString.includes('404')) return "The page you're looking for doesn't exist.";
    if (errorString.includes('403')) return "You don't have permission to access this resource.";
    if (errorString.includes('500')) return 'Server error. Please try again later.';
    if (errorString.includes('Network')) return 'Network connection error. Check your internet connection.';

    return description;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
        }}
      >
        <Box
          sx={{
            fontSize: 64,
            mb: 2,
            color: 'error.main',
            opacity: 0.8,
          }}
        >
          <ErrorIcon sx={{ fontSize: 'inherit' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          {getErrorMessage()}
        </Typography>

        {error && showErrorDetails && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {error.message}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {resetError && (
            <Button
              variant="contained"
              color="primary"
              onClick={resetError}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/dashboard')}
            startIcon={<HomeIcon />}
          >
            Go Home
          </Button>
        </Box>

        {error && (
          <Box sx={{ mt: 3 }}>
            <Button
              size="small"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              {showErrorDetails ? 'Hide' : 'Show'} Error Details
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ErrorFallback;
