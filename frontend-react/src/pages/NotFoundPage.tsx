import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h4">Page Not Found</Typography>
      <Typography color="textSecondary" sx={{ mb: 2 }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        component={Link}
        to="/dashboard"
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
