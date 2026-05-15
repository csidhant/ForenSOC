import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Link,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { RegisterRequest } from '../types';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof RegisterRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.register(form);
      setSuccess('Registration successful. Please sign in.');
      setForm({ username: '', email: '', password: '' });
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mb: 1 }}>
              <PersonAddIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
              Start using the ForenSOC platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              type="text"
              value={form.username}
              onChange={handleChange('username')}
              disabled={loading}
              fullWidth
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              disabled={loading}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              disabled={loading || !form.username || !form.email || !form.password}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7 }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
