import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Chip, CircularProgress, Alert as MuiAlert, Grid,
  Stack, IconButton, Tooltip, Divider, Skeleton, InputAdornment,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  FolderOpen as CaseIcon, Search as SearchIcon, Refresh as RefreshIcon,
  ErrorOutline as CriticalIcon, WarningAmber as HighIcon,
  InfoOutlined as MediumIcon, CheckCircleOutline as LowIcon,
  Close as CloseIcon, CalendarToday as DateIcon,
} from '@mui/icons-material';
import { Case, Priority, CaseStatus } from '../types';
import { apiService } from '@services/apiService';
import { formatDate } from '@utils/helpers';
import { useNavigate } from 'react-router-dom';
import { HelpTooltip, EmptyState } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';

const PRIORITY_CONFIG: Record<string, { color: 'error'|'warning'|'info'|'success'|'default'; icon: React.ReactNode; bg: string; border: string }> = {
  critical: { color: 'error', icon: <CriticalIcon fontSize="small" />, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  high:     { color: 'warning', icon: <HighIcon fontSize="small" />, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  medium:   { color: 'info', icon: <MediumIcon fontSize="small" />, bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)' },
  low:      { color: 'success', icon: <LowIcon fontSize="small" />, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  pending:     { label: 'Pending', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  closed:      { label: 'Closed', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  resolved:    { label: 'Resolved', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
};

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    case_number: '', title: '', description: '', priority: Priority.MEDIUM, status: CaseStatus.OPEN,
  });
  const navigate = useNavigate();

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getCases(1, 100);
      setCases(data.items || []);
    } catch (err: any) {
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const filtered = cases.filter(c => {
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    in_progress: cases.filter(c => c.status === 'in_progress').length,
    critical: cases.filter(c => c.priority === 'critical').length,
  };

  const handleOpenCreate = () => {
    setEditingCase(null);
    setFormData({ case_number: '', title: '', description: '', priority: Priority.MEDIUM, status: CaseStatus.OPEN });
    setOpenDialog(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, caseItem: Case) => {
    e.stopPropagation();
    setEditingCase(caseItem);
    setFormData({
      case_number: caseItem.case_number || '',
      title: caseItem.title,
      description: caseItem.description || '',
      priority: caseItem.priority,
      status: caseItem.status,
    });
    setOpenDialog(true);
  };

  const formatSaveError = (err: any): string => {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => (typeof item === 'string' ? item : item.msg || JSON.stringify(item)))
        .join('; ');
    }
    if (typeof detail === 'string') return detail;
    if (err?.message) return err.message;
    return 'Failed to save case';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCase) {
        await apiService.updateCase(editingCase.id, formData);
      } else {
        await apiService.createCase(formData);
      }
      await loadCases();
      setOpenDialog(false);
    } catch (err: any) {
      setError(formatSaveError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this case and all associated data?')) return;
    try {
      await apiService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Failed to delete case');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Cases</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage incident investigations, track progress, and coordinate response
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadCases} disabled={loading}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
            sx={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', fontWeight: 700 }}>
            New Case
          </Button>
        </Stack>
      </Box>

      {/* Stats row */}
      {!loading && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Cases', value: stats.total, color: 'primary.main' },
            { label: 'Open', value: stats.open, color: '#3B82F6' },
            { label: 'In Progress', value: stats.in_progress, color: '#F59E0B' },
            { label: 'Critical Priority', value: stats.critical, color: '#EF4444' },
          ].map(s => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card>
                <CardContent sx={{ py: '12px !important' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</MuiAlert>}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small" placeholder="Search cases…" value={search}
              onChange={e => setSearch(e.target.value)} sx={{ minWidth: 220 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} label="Priority" onChange={e => setPriorityFilter(e.target.value)}>
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <HelpTooltip
                title={HELP_CONTENT.cases.priority.title}
                description={HELP_CONTENT.cases.priority.description}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <HelpTooltip
                title={HELP_CONTENT.cases.caseStatus.title}
                description={HELP_CONTENT.cases.caseStatus.description}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {filtered.length} of {cases.length} cases
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Case Cards Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <EmptyState
            icon={<CaseIcon />}
            title={cases.length === 0 ? "No Cases Yet" : "No Cases Match Your Filters"}
            description={
              cases.length === 0
                ? "Create your first incident investigation case to start managing security events and evidence."
                : "Try adjusting your filters or search terms to find existing cases."
            }
            action={{
              label: "Create New Case",
              onClick: handleOpenCreate,
              icon: <AddIcon />,
            }}
          />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(caseItem => {
            const prioKey = String(caseItem.priority || (caseItem as any).severity || 'medium').toLowerCase();
            const prio = PRIORITY_CONFIG[prioKey] || PRIORITY_CONFIG.medium;
            const stat = STATUS_CONFIG[caseItem.status] || { label: caseItem.status, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
            return (
              <Grid item xs={12} md={6} lg={4} key={caseItem.id}>
                <Card
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                  sx={{
                    cursor: 'pointer', height: '100%',
                    borderLeft: `3px solid ${prio.border}`,
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardContent>
                    {/* Header row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        icon={prio.icon as any}
                        label={String(caseItem.priority || (caseItem as any).severity || 'medium').toUpperCase()}
                        size="small"
                        color={prio.color}
                        variant="outlined"
                        sx={{ bgcolor: prio.bg, fontWeight: 700 }}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={e => handleOpenEdit(e, caseItem)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={e => handleDelete(e, caseItem.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Title */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                      {caseItem.title}
                    </Typography>

                    {/* Description */}
                    {caseItem.description && (
                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 1.5, overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {caseItem.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={stat.label} size="small"
                        sx={{ bgcolor: stat.bg, color: stat.color, fontWeight: 600, border: `1px solid ${stat.color}40` }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateIcon sx={{ fontSize: 12 }} />
                        {formatDate(caseItem.created_at)}
                      </Typography>
                    </Box>

                    {/* Alert count if available */}
                    {(caseItem as any).alert_count !== undefined && (
                      <Box sx={{ mt: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {(caseItem as any).alert_count} alerts linked
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {editingCase ? 'Edit Case' : 'Create New Case'}
          <IconButton size="small" onClick={() => setOpenDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Case Number *" value={formData.case_number}
            onChange={e => setFormData({ ...formData, case_number: e.target.value })}
            fullWidth autoFocus placeholder="e.g. CASE-2026-001"
          />
          <TextField
            label="Case Title *" value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            fullWidth placeholder="e.g. Ransomware Incident - Finance Department"
          />
          <TextField
            label="Description" value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            fullWidth multiline rows={4} placeholder="Describe the incident, affected systems, and initial indicators..."
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={formData.priority} label="Priority" onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}>
                  <MenuItem value="low">🟢 Low</MenuItem>
                  <MenuItem value="medium">🔵 Medium</MenuItem>
                  <MenuItem value="high">🟠 High</MenuItem>
                  <MenuItem value="critical">🔴 Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={e => setFormData({ ...formData, status: e.target.value as CaseStatus })}>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formData.title || !formData.case_number}
          >
            {saving ? <CircularProgress size={20} /> : (editingCase ? 'Update Case' : 'Create Case')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CasesPage;
