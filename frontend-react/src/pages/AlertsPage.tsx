import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography, Chip, CircularProgress,
  Alert as MuiAlert, Grid, MenuItem, Select, FormControl, InputLabel,
  InputAdornment, IconButton, Tooltip, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Refresh as RefreshIcon,
  Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon,
  CheckCircle as CheckIcon, RadioButtonUnchecked as NewIcon,
  HourglassEmpty as PendingIcon, Close as CloseIcon,
  DoneAll as ResolveIcon, Visibility as ViewIcon,
} from '@mui/icons-material';
import { Alert as AlertType, AlertSeverity, AlertStatus } from '../types';
import { apiService } from '@services/apiService';
import { formatDate } from '@utils/helpers';
import { HelpTooltip, EmptyState, SkeletonLoader, StudentGuidePanel } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { WarningOutlined as NoDataIcon } from '@mui/icons-material';

const SEVERITY_CONFIG: Record<string, { color: 'error'|'warning'|'info'|'success'|'default'; icon: React.ReactNode; bg: string }> = {
  critical: { color: 'error', icon: <ErrorIcon fontSize="small" />, bg: 'rgba(239,68,68,0.1)' },
  high:     { color: 'warning', icon: <WarningIcon fontSize="small" />, bg: 'rgba(245,158,11,0.1)' },
  medium:   { color: 'info', icon: <InfoIcon fontSize="small" />, bg: 'rgba(6,182,212,0.1)' },
  low:      { color: 'success', icon: <CheckIcon fontSize="small" />, bg: 'rgba(16,185,129,0.1)' },
  info:     { color: 'default', icon: <InfoIcon fontSize="small" />, bg: 'rgba(148,163,184,0.1)' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:         { label: 'New', color: '#EF4444' },
  in_progress: { label: 'In Progress', color: '#F59E0B' },
  resolved:    { label: 'Resolved', color: '#10B981' },
  false_positive: { label: 'False Positive', color: '#6B7280' },
};

const StatCard = ({ label, value, color, icon }: any) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState<AlertType | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertType | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', severity: AlertSeverity.MEDIUM,
    alert_type: '', source_ip: '', dest_ip: '',
    source_port: '', dest_port: '', hostname: '', username: '', case_id: '',
  });

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const [alertData, statsData] = await Promise.all([
        apiService.getAlerts('', 1, 100),
        apiService.getAlertStats().catch(() => null),
      ]);
      setAlerts(alertData || []);
      setStats(statsData);
    } catch (err: any) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  // Real-time: listen for new WebSocket alerts
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setAlerts(prev => [e.detail, ...prev]);
      setStats((s: any) => s ? { ...s, total_alerts: (s.total_alerts || 0) + 1, new_alerts: (s.new_alerts || 0) + 1 } : s);
    };
    window.addEventListener('forensoc-alert', handler as any);
    return () => window.removeEventListener('forensoc-alert', handler as any);
  }, []);

  const filtered = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || (a as any).source_ip?.includes(search);
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingAlert(null);
    setFormData({ title: '', description: '', severity: AlertSeverity.MEDIUM, alert_type: '', source_ip: '', dest_ip: '', source_port: '', dest_port: '', hostname: '', username: '', case_id: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (alert: AlertType) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title, description: alert.description || '',
      severity: alert.severity, alert_type: (alert as any).alert_type || '',
      source_ip: (alert as any).source_ip || '', dest_ip: (alert as any).dest_ip || '',
      source_port: (alert as any).source_port?.toString() || '',
      dest_port: (alert as any).dest_port?.toString() || '',
      hostname: (alert as any).hostname || '',
      username: (alert as any).username || '',
      case_id: alert.case_id?.toString() || '',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        source_port: formData.source_port ? parseInt(formData.source_port) : undefined,
        dest_port: formData.dest_port ? parseInt(formData.dest_port) : undefined,
        case_id: formData.case_id || undefined,
      };
      if (editingAlert) {
        await apiService.updateAlert(editingAlert.id, payload);
      } else {
        await apiService.createAlert({ ...payload, alert_number: `ALERT-${Date.now()}` });
      }
      await loadAlerts();
      setOpenDialog(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save alert');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this alert permanently?')) return;
    try {
      await apiService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete alert');
    }
  };

  const handleResolve = async (alert: AlertType) => {
    try {
      await apiService.updateAlert(alert.id, { status: AlertStatus.RESOLVED });
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: AlertStatus.RESOLVED } : a));
    } catch {
      setError('Failed to resolve alert');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Security Alerts</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor, triage, and respond to security events in real-time
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadAlerts} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
            sx={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', fontWeight: 700 }}>
            New Alert
          </Button>
        </Stack>
      </Box>

      {/* Student Guide */}
      <StudentGuidePanel
        pageTitle="Security Alerts"
        pageExplained={
          'Alerts are automatic warnings generated by Detection Rules when suspicious activity is detected in your logs. Think of them as the burglar alarm going off — your job as an analyst is to investigate each one and decide: is this a real attack (True Positive) or a false alarm (False Positive)?'
        }
        whenToUse="After logging in, check here for any new Critical or High severity alerts. This is the starting point of most investigations."
        steps={[
          { title: 'Filter by Severity: start with Critical', description: 'Use the Severity dropdown to show only Critical alerts first. These represent the highest-risk events that need immediate attention.' },
          { title: 'Click View (eye icon) on an alert', description: 'Read the alert details: Source IP, Destination IP, Alert Type, and Description. This tells you what happened and where.' },
          { title: 'Decide: Real threat or false alarm?', description: 'If it looks suspicious, change status to In Progress and create a Case. If it looks normal (e.g. your own scanner), mark as False Positive.' },
          { title: 'Create a Case to track your investigation', description: 'Click the Cases page and create a new case linked to this alert. This keeps all your investigation notes, evidence, and timeline in one place.' },
          { title: 'Resolve when done', description: 'Once you have investigated and taken action, mark the alert as Resolved. This keeps the queue clean for your team.' },
        ]}
        tip="Severity guide — 🔴 Critical: system is being actively attacked, investigate now. 🟠 High: investigate within 1 hour. 🟡 Medium: investigate today. 🔵 Low: informational, review when you have time."
        defaultOpen={false}
      />

      {/* Stat Cards */}
      {loading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={70} /></Grid>
          ))}
        </Grid>
      ) : stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatCard label="Total Alerts" value={stats.total_alerts || alerts.length} color="#3B82F6" icon={<InfoIcon />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="New / Unread" value={stats.new_alerts || 0} color="#EF4444" icon={<NewIcon />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Critical" value={stats.critical_alerts || 0} color="#DC2626" icon={<ErrorIcon />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="In Progress" value={stats.in_progress_alerts || 0} color="#F59E0B" icon={<PendingIcon />} />
          </Grid>
        </Grid>
      )}

      {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</MuiAlert>}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small" placeholder="Search alerts, IPs..." value={search}
                onChange={e => setSearch(e.target.value)} sx={{ minWidth: 240 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
              <HelpTooltip
                title={HELP_CONTENT.alerts.sourceIp.title}
                description={HELP_CONTENT.alerts.sourceIp.description}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Severity</InputLabel>
                <Select value={severityFilter} label="Severity" onChange={e => setSeverityFilter(e.target.value)}>
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
              <HelpTooltip
                title={HELP_CONTENT.alerts.severity.title}
                description={HELP_CONTENT.alerts.severity.description}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="false_positive">False Positive</MenuItem>
                </Select>
              </FormControl>
              <HelpTooltip
                title={HELP_CONTENT.alerts.status.title}
                description={HELP_CONTENT.alerts.status.description}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {filtered.length} of {alerts.length}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Severity</TableCell>
                <TableCell>Alert</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 2 }}>
                    <SkeletonLoader type="table" count={6} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 0 }}>
                    <EmptyState
                      icon={<NoDataIcon />}
                      title={alerts.length === 0 ? "No Alerts Yet" : "No Alerts Match Your Filters"}
                      description={
                        alerts.length === 0
                          ? "When security threats are detected, they'll appear here. Alerts are generated from Sigma rules and network monitoring."
                          : "Try adjusting your filters or severity selection to find what you're looking for."
                      }
                      action={
                        alerts.length === 0
                          ? { label: "Learn About Alerts", onClick: () => window.open("https://docs.forensoc.local/alerts", "_blank") }
                          : undefined
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ) : filtered.map(alert => {
                const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                const st = STATUS_CONFIG[alert.status] || { label: alert.status, color: '#6B7280' };
                return (
                  <TableRow key={alert.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Chip
                        icon={sev.icon as any}
                        label={alert.severity?.toUpperCase()}
                        size="small"
                        color={sev.color}
                        variant="outlined"
                        sx={{ fontWeight: 700, bgcolor: sev.bg }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.title}
                      </Typography>
                      {(alert as any).alert_type && (
                        <Typography variant="caption" color="text.secondary">{(alert as any).alert_type}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {(alert as any).source_ip || alert.source || '—'}
                        {(alert as any).source_port ? `:${(alert as any).source_port}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {(alert as any).dest_ip || '—'}
                        {(alert as any).dest_port ? `:${(alert as any).dest_port}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={st.label} size="small"
                        sx={{ bgcolor: `${st.color}20`, color: st.color, fontWeight: 600, border: `1px solid ${st.color}40` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {formatDate(alert.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setViewDialog(alert)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {alert.status !== 'resolved' && (
                          <Tooltip title="Mark Resolved">
                            <IconButton size="small" color="success" onClick={() => handleResolve(alert)}>
                              <ResolveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(alert)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(alert.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={!!viewDialog} onClose={() => setViewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Alert Details
          <IconButton size="small" onClick={() => setViewDialog(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">TITLE</Typography>
                <Typography variant="subtitle1" fontWeight={600}>{viewDialog.title}</Typography>
              </Box>
              {viewDialog.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">DESCRIPTION</Typography>
                  <Typography variant="body2">{viewDialog.description}</Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">SEVERITY</Typography>
                  <Box><Chip label={viewDialog.severity} size="small" color={SEVERITY_CONFIG[viewDialog.severity]?.color || 'default'} /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">STATUS</Typography>
                  <Box><Chip label={viewDialog.status} size="small" /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">SOURCE IP</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(viewDialog as any).source_ip || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">DEST IP</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{(viewDialog as any).dest_ip || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">HOSTNAME</Typography>
                  <Typography variant="body2">{(viewDialog as any).hostname || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">USERNAME</Typography>
                  <Typography variant="body2">{(viewDialog as any).username || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">DETECTED AT</Typography>
                  <Typography variant="body2">{formatDate(viewDialog.created_at)}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(null)}>Close</Button>
          {viewDialog && <Button variant="contained" onClick={() => { handleOpenEdit(viewDialog); setViewDialog(null); }}>Edit Alert</Button>}
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {editingAlert ? 'Edit Alert' : 'Create New Alert'}
          <IconButton size="small" onClick={() => setOpenDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} fullWidth autoFocus />
          <TextField label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={3} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select value={formData.severity} label="Severity" onChange={e => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Alert Type" value={formData.alert_type} onChange={e => setFormData({ ...formData, alert_type: e.target.value })} fullWidth placeholder="e.g. brute_force, port_scan" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Source IP" value={formData.source_ip} onChange={e => setFormData({ ...formData, source_ip: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Destination IP" value={formData.dest_ip} onChange={e => setFormData({ ...formData, dest_ip: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Source Port" value={formData.source_port} onChange={e => setFormData({ ...formData, source_port: e.target.value })} fullWidth type="number" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Dest Port" value={formData.dest_port} onChange={e => setFormData({ ...formData, dest_port: e.target.value })} fullWidth type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Hostname" value={formData.hostname} onChange={e => setFormData({ ...formData, hostname: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formData.title}>
            {saving ? <CircularProgress size={20} /> : (editingAlert ? 'Update Alert' : 'Create Alert')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertsPage;
