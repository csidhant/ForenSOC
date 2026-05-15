import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Alert as AlertType, AlertSeverity, Case } from '../types';
import { apiService } from '@services/apiService';
import { formatDate, getStatusColor } from '@utils/helpers';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: AlertSeverity.MEDIUM,
    alert_type: '',
    source_ip: '',
    dest_ip: '',
    source_port: '',
    dest_port: '',
    hostname: '',
    username: '',
    case_id: '',
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadCases();
    loadStats();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAlerts('', 1, 50);
      setAlerts(data || []);
    } catch (err: any) {
      setError('Failed to load alerts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const data = await apiService.getCases(1, 100);
      setCases(data.items || []);
    } catch (err: any) {
      console.error('Error loading cases:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiService.getAlertStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const handleOpenDialog = (alertData?: AlertType) => {
    if (alertData) {
      setEditingAlert(alertData);
      setFormData({
        title: alertData.title,
        description: alertData.description || '',
        severity: alertData.severity,
        alert_type: (alertData as any).alert_type || '',
        source_ip: (alertData as any).source_ip || '',
        dest_ip: (alertData as any).dest_ip || '',
        source_port: (alertData as any).source_port?.toString() || '',
        dest_port: (alertData as any).dest_port?.toString() || '',
        hostname: (alertData as any).hostname || '',
        username: (alertData as any).username || '',
        case_id: alertData.case_id?.toString() || '',
      });
    } else {
      setEditingAlert(null);
      setFormData({
        title: '',
        description: '',
        severity: AlertSeverity.MEDIUM,
        alert_type: '',
        source_ip: '',
        dest_ip: '',
        source_port: '',
        dest_port: '',
        hostname: '',
        username: '',
        case_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAlert(null);
  };

  const handleSaveAlert = async () => {
    try {
      const data = {
        ...formData,
        source_port: formData.source_port ? parseInt(formData.source_port) : undefined,
        dest_port: formData.dest_port ? parseInt(formData.dest_port) : undefined,
        case_id: formData.case_id ? formData.case_id : undefined,
        alert_number: editingAlert ? undefined : `ALERT-${Date.now()}`, // Generate alert number for new alerts
      };

      if (editingAlert) {
        await apiService.updateAlert(editingAlert.id, data);
      } else {
        await apiService.createAlert(data);
      }
      loadAlerts();
      loadStats();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await apiService.deleteAlert(id);
        loadAlerts();
        loadStats();
      } catch (err: any) {
        setError('Failed to delete alert');
      }
    }
  };


  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Alerts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Alert
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Alerts
                </Typography>
                <Typography variant="h4">{stats.total_alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  New Alerts
                </Typography>
                <Typography variant="h4" color="error">{stats.new_alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" color="warning">{stats.in_progress_alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Critical
                </Typography>
                <Typography variant="h4" color="error">{stats.critical_alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell>Title</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{alert.title}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={getSeverityColor(alert.severity) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.status}
                    size="small"
                    sx={{ bgcolor: getStatusColor(alert.status), color: 'white' }}
                  />
                </TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{formatDate(alert.created_at)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(alert)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {alerts.length === 0 && (
        <Card sx={{ mt: 3, textAlign: 'center', p: 3 }}>
          <Typography color="textSecondary">No alerts found. Create one to get started.</Typography>
        </Card>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAlert ? 'Edit Alert' : 'New Alert'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  label="Severity"
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Alert Type"
                value={formData.alert_type}
                onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Source IP"
                value={formData.source_ip}
                onChange={(e) => setFormData({ ...formData, source_ip: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination IP"
                value={formData.dest_ip}
                onChange={(e) => setFormData({ ...formData, dest_ip: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Source Port"
                value={formData.source_port}
                onChange={(e) => setFormData({ ...formData, source_port: e.target.value })}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination Port"
                value={formData.dest_port}
                onChange={(e) => setFormData({ ...formData, dest_port: e.target.value })}
                fullWidth
                type="number"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hostname"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          <FormControl fullWidth>
            <InputLabel>Link to Case</InputLabel>
            <Select
              value={formData.case_id}
              label="Link to Case"
              onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {cases.map((caseItem) => (
                <MenuItem key={caseItem.id} value={caseItem.id.toString()}>
                  {caseItem.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveAlert}
            variant="contained"
            disabled={!formData.title}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertsPage;
