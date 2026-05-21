import React, { useEffect } from 'react';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { useAuthStore } from '@utils/store';
import { apiService } from '@services/apiService';
import Navigation from '@components/Navigation';
import Routes from '@components/Routes';
import { socketService } from '@services/socketService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CommandPalette, GlossaryModal, FloatingActions } from '@components';

const TOP_BAR_HEIGHT = 48;
const MOBILE_APPBAR_HEIGHT = 56;

const App: React.FC = () => {
  const { isAuthenticated, setUser, setToken } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [glossaryOpen, setGlossaryOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    const handleOpenSearch = () => setSearchOpen(true);
    const handleOpenGlossary = () => setGlossaryOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenSearch);
    window.addEventListener('open-glossary', handleOpenGlossary);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenSearch);
      window.removeEventListener('open-glossary', handleOpenGlossary);
    };
  }, []);

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

    // Connect WebSockets
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [setUser, setToken]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={28} sx={{ color: '#fff' }} />
        </Box>
      </Box>
    );
  }

  const topOffset = isAuthenticated ? (isMobile ? MOBILE_APPBAR_HEIGHT : TOP_BAR_HEIGHT) : 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && <Navigation />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // read the actual sidebar width set by Navigation via CSS variable
          ml: isAuthenticated && !isMobile ? 'var(--forensoc-sidebar-width, 240px)' : 0,
          mt: isAuthenticated ? `${topOffset}px` : 0,
          minWidth: 0,
          transition: 'margin-left 0.3s ease',
          bgcolor: 'background.default',
          minHeight: isAuthenticated ? `calc(100vh - ${topOffset}px)` : '100vh',
        }}
      >
        {isAuthenticated ? (
          <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', boxSizing: 'border-box' }}>
            <Routes />
          </Box>
        ) : (
          <Routes />
        )}
      </Box>

      <ToastContainer
        position="bottom-right"
        theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={5}
        toastStyle={{ borderRadius: 10, fontSize: '0.875rem' }}
      />

      {isAuthenticated && (
        <>
          <CommandPalette
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onOpenGlossary={() => {
              setSearchOpen(false);
              setGlossaryOpen(true);
            }}
          />
          <GlossaryModal open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
          <FloatingActions
            onOpenSearch={() => setSearchOpen(true)}
            onOpenGlossary={() => setGlossaryOpen(true)}
          />
        </>
      )}
    </Box>
  );
};

export default App;
