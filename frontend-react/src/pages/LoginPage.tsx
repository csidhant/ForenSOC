import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Shield as ShieldIcon,
  Lock as LockIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '@utils/store';
import { apiService } from '@services/apiService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiService.login({ username, password });
      setToken(response.access_token);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0F1E 0%, #0F2027 50%, #0A1628 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Left Panel – Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          p: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ maxWidth: 420, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 40px rgba(59,130,246,0.3)',
            }}
          >
            <ShieldIcon sx={{ fontSize: 44, color: '#fff' }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: '#F1F5F9',
              mb: 1,
              background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ForenSOC
          </Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', mb: 4, fontWeight: 400 }}>
            Advanced Digital Forensics & Security Operations Center
          </Typography>

          {[
            '🔍 Real-time threat detection & correlation',
            '🛡️ MITRE ATT&CK framework mapping',
            '🔬 Memory & network forensics analysis',
            '📊 Automated case management & reporting',
          ].map((feature) => (
            <Box
              key={feature}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'left',
              }}
            >
              <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel – Login Form */}
      <Box
        sx={{
          display: 'flex',
          flex: { xs: 1, md: '0 0 480px' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, md: 6 },
          position: 'relative',
          zIndex: 1,
          background: { md: 'rgba(17,24,39,0.8)', xs: 'transparent' },
          backdropFilter: { md: 'blur(20px)' },
          borderLeft: { md: '1px solid rgba(255,255,255,0.06)' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#F1F5F9' }}>
              ForenSOC
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F1F5F9', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>
            Sign in to your secure operations account
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#FCA5A5',
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              id="username-input"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              fullWidth
              autoFocus
              autoComplete="username"
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.04)' },
                '& .MuiInputLabel-root': { color: '#94A3B8' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputBase-input': { color: '#F1F5F9' },
              }}
            />

            <TextField
              id="password-input"
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass((p) => !p)}
                      edge="end"
                      sx={{ color: '#64748B' }}
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.04)' },
                '& .MuiInputLabel-root': { color: '#94A3B8' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputBase-input': { color: '#F1F5F9' },
              }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !username || !password}
              endIcon={!loading && <ArrowIcon />}
              sx={{
                py: 1.5,
                mt: 0.5,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                fontSize: '1rem',
                fontWeight: 700,
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  color: '#fff',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" sx={{ color: '#475569', px: 1 }}>
              Demo Access
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
            <Chip
              label="Username: admin"
              size="small"
              sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)' }}
            />
            <Chip
              label="Password: admin"
              size="small"
              sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.2)' }}
            />
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#475569' }}>
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Register now
            </Link>
          </Typography>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <LockIcon sx={{ fontSize: 12, color: '#334155' }} />
              <Typography variant="caption" sx={{ color: '#334155' }}>
                Secured with JWT authentication · TLS encrypted
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
