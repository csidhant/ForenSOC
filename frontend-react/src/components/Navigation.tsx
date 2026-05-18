import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Tooltip,
  IconButton,
  Badge,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
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
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AdminPanelSettings as AuditIcon,
  Circle as StatusDot,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useUiStore, useAlertStore } from '@utils/store';
import { apiService } from '@services/apiService';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', group: 'Main' },
  { label: 'Alerts', icon: <AlertBellIcon />, path: '/alerts', group: 'Main' },
  { label: 'Cases', icon: <CaseIcon />, path: '/cases', group: 'Main' },
  { label: 'Logs', icon: <LogsIcon />, path: '/logs', group: 'Analysis' },
  { label: 'Detection Rules', icon: <ShieldIcon />, path: '/detection-rules', group: 'Analysis' },
  { label: 'Evidence', icon: <EvidenceIcon />, path: '/evidence', group: 'Analysis' },
  { label: 'Forensics', icon: <ForensicsIcon />, path: '/forensics', group: 'Analysis' },
  { label: 'Timeline', icon: <TimelineIcon />, path: '/timeline', group: 'Analysis' },
  { label: 'MITRE ATT&CK', icon: <MitreIcon />, path: '/mitre', group: 'Intelligence' },
  { label: 'Reports', icon: <ReportIcon />, path: '/reports', group: 'Intelligence' },
  { label: 'Audit Logs', icon: <AuditIcon />, path: '/audit', group: 'Admin' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings', group: 'Admin' },
];

const Navigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const { unreadCount } = useAlertStore();

  const handleLogout = async () => {
    await apiService.logout();
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const sidebarWidth = isMobile ? SIDEBAR_WIDTH : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));

  const DrawerContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1 : 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(59,130,246,0.3)',
          }}
        >
          <ShieldIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        {(!collapsed || isMobile) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              ForenSOC
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              DFIR Platform
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed((c) => !c)} sx={{ flexShrink: 0 }}>
            <ChevronLeftIcon
              sx={{
                transition: 'transform 0.3s',
                transform: collapsed ? 'rotate(180deg)' : 'none',
                fontSize: 18,
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Nav Groups */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {groups.map((group) => (
          <Box key={group}>
            {(!collapsed || isMobile) && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  display: 'block',
                  color: 'text.disabled',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.65rem',
                }}
              >
                {group}
              </Typography>
            )}
            <List dense disablePadding>
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                const active = isActive(item.path);
                return (
                  <Tooltip
                    key={item.path}
                    title={collapsed && !isMobile ? item.label : ''}
                    placement="right"
                    arrow
                  >
                    <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        onClick={() => isMobile && setMobileOpen(false)}
                        selected={active}
                        sx={{
                          borderRadius: 2,
                          px: collapsed && !isMobile ? 1 : 1.5,
                          py: 0.875,
                          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                          transition: 'all 0.15s ease',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                            borderLeft: `2px solid ${theme.palette.primary.main}`,
                            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                            '& .MuiListItemText-primary': { color: theme.palette.primary.main, fontWeight: 600 },
                          },
                          '&:hover': {
                            background: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed && !isMobile ? 'auto' : 36,
                            color: active ? 'primary.main' : 'text.secondary',
                            fontSize: 20,
                          }}
                        >
                          {item.label === 'Alerts' ? (
                            <Badge badgeContent={unreadCount || 0} color="error" max={99}>
                              {item.icon}
                            </Badge>
                          ) : (
                            item.icon
                          )}
                        </ListItemIcon>
                        {(!collapsed || isMobile) && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
            <Divider sx={{ mx: 1, my: 0.5, borderColor: 'divider', opacity: 0.5 }} />
          </Box>
        ))}
      </Box>

      {/* User Profile Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 700,
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={(e) => setProfileMenu(e.currentTarget)}
        >
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        {(!collapsed || isMobile) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textTransform: 'capitalize' }}>
              {typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role || 'Analyst'}
            </Typography>
          </Box>
        )}
        {(!collapsed || isMobile) && (
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout} sx={{ flexShrink: 0 }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Menu
        anchorEl={profileMenu}
        open={Boolean(profileMenu)}
        onClose={() => setProfileMenu(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.full_name || user?.username}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} to="/settings" onClick={() => setProfileMenu(null)}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ zIndex: theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldIcon sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ForenSOC
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Top Bar (thin) */}
      {!isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            left: sidebarWidth,
            width: `calc(100% - ${sidebarWidth}px)`,
            transition: 'width 0.3s ease, left 0.3s ease',
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 48, px: 3, gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Chip
                icon={<StatusDot sx={{ fontSize: '8px !important', color: '#10B981 !important' }} />}
                label="System Operational"
                size="small"
                sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 500 }}
              />
            </Box>
            <Tooltip title={darkMode ? 'Switch to Light' : 'Switch to Dark'}>
              <IconButton size="small" onClick={toggleDarkMode}>
                {darkMode ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
        >
          <Toolbar />
          <DrawerContent />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: 'width 0.3s ease',
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}
    </>
  );
};

export default Navigation;
