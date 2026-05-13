import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FolderOpen as CaseIcon,
  ManageSearch as LogsIcon,
  Description as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Notifications as NotificationsIcon,
  Shield as ShieldIcon,
  Inventory2 as EvidenceIcon,
  Timeline as TimelineIcon,
  Router as ForensicsIcon,
  Security as MitreIcon,
  WarningAmber as AlertBellIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useUiStore, useAlertStore } from '@utils/store';
import { apiService } from '@services/apiService';

const Navigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const { unreadCount } = useAlertStore();
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await apiService.logout();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Logs', icon: <LogsIcon />, path: '/logs' },
    { label: 'Detection Rules', icon: <ShieldIcon />, path: '/detection-rules' },
    { label: 'Cases', icon: <CaseIcon />, path: '/cases' },
    { label: 'Evidence', icon: <EvidenceIcon />, path: '/evidence' },
    { label: 'Forensics', icon: <ForensicsIcon />, path: '/forensics' },
    { label: 'Timeline', icon: <TimelineIcon />, path: '/timeline' },
    { label: 'MITRE', icon: <MitreIcon />, path: '/mitre' },
    { label: 'Alerts', icon: <AlertBellIcon />, path: '/alerts' },
    { label: 'Reports', icon: <ReportIcon />, path: '/reports' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>FC</Avatar>
        <Box>
          <div style={{ fontWeight: 500 }}>ForenSOC</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Advanced DFIR</div>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem
          button
          component={Link}
          to="/settings"
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
              }}
            >
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', width: 32, height: 32 }}>
                FC
              </Avatar>
              ForenSOC
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0 }}>
                {menuItems.map((item) => (
                  <Box
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 2,
                      py: 1,
                      color: 'inherit',
                      textDecoration: 'none',
                      borderBottom: '3px solid transparent',
                      transition: 'border-color 0.3s',
                      '&:hover': {
                        borderBottomColor: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Box>
                <div style={{ fontWeight: 500 }}>{user?.full_name || user?.username}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {drawer}
        </Drawer>
      )}

      <Toolbar /> {/* This adds spacing below the fixed AppBar */}
    </>
  );
};

export default Navigation;
