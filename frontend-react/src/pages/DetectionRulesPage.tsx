import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { DetectionRule, AlertSeverity } from '../types';
import { apiService } from '@services/apiService';
import { HelpTooltip, EmptyState } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { Shield as ShieldIcon } from '@mui/icons-material';


const DetectionRulesPage: React.FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<DetectionRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    severity: AlertSeverity.MEDIUM,
    rule_type: '',
    pattern: '{}',
    event_type: '',
    threshold: 1,
    time_window_seconds: 300,
    mitre_tactic: '',
    mitre_technique: '',
    mitre_id: '',
  });
  const [sigmaDialogOpen, setSigmaDialogOpen] = useState(false);
  const [sigmaYaml, setSigmaYaml] = useState('');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDetectionRules();
      setRules(data || []);
    } catch (err: any) {
      setError('Failed to load detection rules');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ruleData?: DetectionRule) => {
    if (ruleData) {
      setEditingRule(ruleData);
      setFormData({
        name: ruleData.name,
        description: ruleData.description || '',
        enabled: ruleData.enabled,
        severity: ruleData.severity,
        rule_type: ruleData.rule_type,
        pattern: JSON.stringify(ruleData.pattern, null, 2),
        event_type: ruleData.event_type || '',
        threshold: ruleData.threshold,
        time_window_seconds: ruleData.time_window_seconds,
        mitre_tactic: ruleData.mitre_tactic || '',
        mitre_technique: ruleData.mitre_technique || '',
        mitre_id: ruleData.mitre_id || '',
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        enabled: true,
        severity: AlertSeverity.MEDIUM,
        rule_type: '',
        pattern: '{"event_type": "failed_login"}',
        event_type: '',
        threshold: 1,
        time_window_seconds: 300,
        mitre_tactic: '',
        mitre_technique: '',
        mitre_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(null);
  };

  const handleSaveRule = async () => {
    try {
      let pattern;
      try {
        pattern = JSON.parse(formData.pattern);
      } catch (e) {
        setError('Invalid JSON in pattern field');
        return;
      }

      const data = {
        ...formData,
        pattern,
      };

      if (editingRule) {
        await apiService.updateDetectionRule(editingRule.id, data);
      } else {
        await apiService.createDetectionRule(data);
      }
      loadRules();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save detection rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this detection rule?')) {
      try {
        await apiService.deleteDetectionRule(id);
        loadRules();
      } catch (err: any) {
        setError('Failed to delete detection rule');
      }
    }
  };

  const handleToggleRule = async (rule: DetectionRule) => {
    try {
      await apiService.toggleDetectionRule(rule.id);
      loadRules();
    } catch (err: any) {
      setError('Failed to toggle rule status');
    }
  };

  const handleRunScan = async () => {
    try {
      const result = await apiService.scanDetectionRules(24);
      alert(`Scan completed: ${result.alerts_generated} alerts generated from ${result.alerts_scanned} events`);
      loadRules();
    } catch (err: any) {
      setError('Failed to run detection scan');
    }
  };

  const handleImportSigma = async () => {
    try {
      setLoading(true);
      await apiService.uploadSigmaRule(sigmaYaml);
      setSigmaDialogOpen(false);
      setSigmaYaml('');
      await loadRules();
      alert('Sigma rule imported successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import Sigma rule');
    } finally {
      setLoading(false);
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
          Detection Rules
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunScan}
          >
            Run Scan
          </Button>
          <Button
            variant="contained"
            startIcon={<ImportIcon />}
            onClick={() => setSigmaDialogOpen(true)}
            color="secondary"
          >
            Import Sigma
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Rule
          </Button>
        </Box>
      </Box>

      <Typography sx={{ mb: 3, color: 'text.secondary' }}>
        Configure detection rules to automatically generate alerts from log events.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
          <Typography variant="body2">Detection rules use Sigma format, Suricata rules, or custom patterns to identify threats.</Typography>
          <HelpTooltip
            title={HELP_CONTENT.detection.sigmaRules.title}
            description={HELP_CONTENT.detection.sigmaRules.description}
          />
        </Box>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>MITRE</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{rule.name}</TableCell>
                <TableCell>{rule.rule_type}</TableCell>
                <TableCell>
                  <Chip
                    label={rule.severity}
                    size="small"
                    color={getSeverityColor(rule.severity) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{rule.threshold}</TableCell>
                <TableCell>{rule.mitre_id || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(rule)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rules.length === 0 && (
        <Box sx={{ mt: 3 }}>
          <EmptyState
            icon={<ShieldIcon />}
            title="No Detection Rules"
            description="Detection rules identify threats by pattern matching on log events. Create your first rule to start detecting security events."
            action={{
              label: "Create Rule",
              onClick: () => handleOpenDialog(),
              icon: <AddIcon />,
            }}
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Detection Rule' : 'New Detection Rule'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
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
                label="Rule Type"
                value={formData.rule_type}
                onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                fullWidth
                placeholder="e.g., ssh_brute_force"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 1 })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time Window (seconds)"
                type="number"
                value={formData.time_window_seconds}
                onChange={(e) => setFormData({ ...formData, time_window_seconds: parseInt(e.target.value) || 300 })}
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            label="Event Type Filter"
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            fullWidth
            placeholder="e.g., failed_login (optional)"
          />
          <TextField
            label="Pattern (JSON)"
            value={formData.pattern}
            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
            fullWidth
            multiline
            rows={4}
            placeholder='{"event_type": "failed_login"}'
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="MITRE Tactic"
                value={formData.mitre_tactic}
                onChange={(e) => setFormData({ ...formData, mitre_tactic: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="MITRE Technique"
                value={formData.mitre_technique}
                onChange={(e) => setFormData({ ...formData, mitre_technique: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="MITRE ID"
                value={formData.mitre_id}
                onChange={(e) => setFormData({ ...formData, mitre_id: e.target.value })}
                fullWidth
                placeholder="e.g., T1110"
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveRule}
            variant="contained"
            disabled={!formData.name || !formData.rule_type}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sigmaDialogOpen} onClose={() => setSigmaDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Sigma Rule (YAML)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Paste the contents of a Sigma YAML rule file below to import it as a ForenSOC detection rule.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={15}
            placeholder="title: Suspicious PowerShell Execution..."
            value={sigmaYaml}
            onChange={(e) => setSigmaYaml(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSigmaDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImportSigma} 
            variant="contained" 
            color="secondary"
            disabled={!sigmaYaml.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import Rule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetectionRulesPage;