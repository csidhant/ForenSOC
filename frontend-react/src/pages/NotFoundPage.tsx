import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Shield as ShieldIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <ShieldIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontSize: '6rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
      </Typography>

      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/dashboard')}
        size="large"
        sx={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          px: 4,
          py: 1.5,
          fontWeight: 700,
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
