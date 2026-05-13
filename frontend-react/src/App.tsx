import React, { useEffect } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';
import { useAuthStore } from '@utils/store';
import { apiService } from '@services/apiService';
import Navigation from '@components/Navigation';
import Routes from '@components/Routes';

const App: React.FC = () => {
  const { isAuthenticated, setUser, setToken } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setToken(token);
        try {
          const user = await apiService.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error('Failed to load user:', error);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, [setUser, setToken]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {isAuthenticated && <Navigation />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: isAuthenticated ? 3 : 0,
          pb: 3,
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {isAuthenticated ? (
          <Container maxWidth="xl">
            <Routes />
          </Container>
        ) : (
          <Routes />
        )}
      </Box>
    </>
  );
};

export default App;
