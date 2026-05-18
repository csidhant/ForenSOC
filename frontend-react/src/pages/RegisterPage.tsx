import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Shield as ShieldIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { RegisterRequest } from '../types';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiService.register(form);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const darkFieldSx = {
    '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.04)' },
    '& .MuiInputLabel-root': { color: '#94A3B8' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '& .MuiInputBase-input': { color: '#F1F5F9' },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0F1E 0%, #0F2027 50%, #0A1628 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 3,
          p: { xs: 4, sm: 5 },
          background: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 3,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            <ShieldIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F1F5F9', lineHeight: 1.2 }}>
              ForenSOC
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Create your account
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#F1F5F9', mb: 0.5 }}>
          Get started
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Join the ForenSOC security operations platform
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' } }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2.5, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6EE7B7', '& .MuiAlert-icon': { color: '#10B981' } }}
          >
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="register-username"
            label="Username"
            value={form.username}
            onChange={handleChange('username')}
            disabled={loading}
            fullWidth
            autoFocus
            autoComplete="username"
            sx={darkFieldSx}
          />
          <TextField
            id="register-email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            disabled={loading}
            fullWidth
            autoComplete="email"
            sx={darkFieldSx}
          />
          <TextField
            id="register-password"
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange('password')}
            disabled={loading}
            fullWidth
            autoComplete="new-password"
            helperText="Minimum 8 characters"
            FormHelperTextProps={{ sx: { color: '#475569' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass((p) => !p)} edge="end" sx={{ color: '#64748B' }}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={darkFieldSx}
          />

          <Button
            id="register-submit-btn"
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            endIcon={!loading && <ArrowIcon />}
            disabled={loading || !form.username || !form.email || !form.password}
            sx={{
              py: 1.5,
              mt: 0.5,
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              fontSize: '1rem',
              fontWeight: 700,
              '&:hover': { background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' },
              '&:disabled': { opacity: 0.5, color: '#fff' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#475569' }}>
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
