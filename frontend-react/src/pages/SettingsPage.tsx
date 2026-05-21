import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Switch,
  Button,
  TextField,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotifIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Key as KeyIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUiStore, useAuthStore } from '@utils/store';
import { HelpTooltip } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { toast } from 'react-toastify';

const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useUiStore();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({ critical: true, high: true, medium: false, email: false });
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [sessionTimeout, setSessionTimeout] = useState('1440');

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const roleLabel =
    user?.role && typeof user.role === 'object'
      ? (user.role as { name?: string }).name || '—'
      : user?.role || '—';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your account preferences and platform configuration
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.full_name || user?.username || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email || 'user@forensoc.local'}
              </Typography>
              <Chip
                icon={<CheckIcon />}
                label={roleLabel}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Divider sx={{ my: 2 }} />
              <List dense disablePadding>
                {[
                  { icon: <PersonIcon fontSize="small" />, label: 'Username', value: user?.username || '—' },
                  { icon: <KeyIcon fontSize="small" />, label: 'Role', value: roleLabel },
                ].map((item) => (
                  <ListItem key={item.label} disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.value}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Appearance & Display
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon>
                    <DarkModeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Dark Mode</span>
                        <HelpTooltip
                          title={HELP_CONTENT.general.darkMode.title}
                          description={HELP_CONTENT.general.darkMode.description}
                        />
                      </Box>
                    }
                    secondary="Use dark theme across the platform"
                  />
                  <ListItemSecondaryAction>
                    <Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Language"
                    secondary="Platform interface language"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="English (US)" size="small" variant="outlined" />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Alert Notifications
              </Typography>
              <List disablePadding>
                {[
                  { key: 'critical', label: 'Critical Alerts', desc: 'Immediate notification for critical severity alerts' },
                  { key: 'high', label: 'High Severity Alerts', desc: 'Notify for high severity alerts' },
                  { key: 'medium', label: 'Medium Severity Alerts', desc: 'Notify for medium severity alerts' },
                  { key: 'email', label: 'Email Notifications', desc: 'Send email for important events' },
                ].map((item, i) => (
                  <React.Fragment key={item.key}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon>
                        <NotifIcon />
                      </ListItemIcon>
                      <ListItemText primary={item.label} secondary={item.desc} />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  color={saved ? 'success' : 'primary'}
                >
                  {saved ? 'Saved!' : 'Save Preferences'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Security */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Security
              </Typography>
              <Box component="form" onSubmit={handlePasswordChange}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Password"
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      type="password"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Session Timeout (minutes)"
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ min: 15, max: 10080 }}
                      helperText="How long before inactive session expires (15–10080 min)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="outlined"
                      color="warning"
                      startIcon={<SecurityIcon />}
                      disabled={!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
                    >
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Information
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Platform', value: 'ForenSOC v1.0.0' },
                  { label: 'Backend', value: 'FastAPI + SQLite' },
                  { label: 'Frontend', value: 'React 18 + MUI v5' },
                  { label: 'Auth', value: 'JWT Bearer Tokens' },
                  { label: 'API Docs', value: '/api/docs (Swagger)' },
                  { label: 'WebSocket', value: 'Socket.IO v4' },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <Divider />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  variant="outlined"
                  onClick={() => window.open('/api/docs', '_blank')}
                >
                  Open API Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
