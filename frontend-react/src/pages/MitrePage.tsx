import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Case, MitreCaseSummary } from '../types';
import { apiService } from '@services/apiService';

const MitrePage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [caseId, setCaseId] = useState('');
  const [summary, setSummary] = useState<MitreCaseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [globalTechniques, setGlobalTechniques] = useState<any[]>([]);
  const [showGlobal, setShowGlobal] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiService.getCases(1, 200);
      setCases(res.items || []);
    })();
  }, []);

  const load = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      setError('');
      const s = await apiService.getMitreCaseSummary(parseInt(caseId, 10));
      setSummary(s);
    } catch {
      setError('Failed to load MITRE summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) load();
  }, [caseId]);

  const sync = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const r = await apiService.syncMitreMappings(parseInt(caseId, 10));
      setInfo(`Synced ${r.mappings_created} mapping rows`);
      await load();
    } catch {
      setError('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobal = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMitreGlobalHeatmap();
      setGlobalTechniques(data || []);
      setShowGlobal(true);
    } catch {
      setError('Failed to load global heatmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon /> MITRE ATT&CK
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setInfo('')}>{info}</Alert>}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 280 }} size="small">
            <InputLabel>Case</InputLabel>
            <Select value={caseId} label="Case" onChange={(e) => setCaseId(e.target.value as string)}>
              <MenuItem value="">Select case</MenuItem>
              {cases.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {(c.case_number || c.id) + ' — ' + c.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load} disabled={!caseId || loading}>Refresh</Button>
          <Button variant="contained" onClick={sync} disabled={!caseId || loading}>
            Sync mappings from alerts
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => {
              if (showGlobal) setShowGlobal(false);
              else loadGlobal();
            }}
            disabled={loading}
          >
            {showGlobal ? 'Show Case Summary' : 'Global Heatmap'}
          </Button>
        </CardContent>
      </Card>
      {summary && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Alerts with MITRE: ${summary.alerts_with_mitre}`} />
            <Chip label={`DB mapping rows: ${summary.mapping_rows}`} color="primary" variant="outlined" />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Technique ID</TableCell>
                    <TableCell>Technique</TableCell>
                    <TableCell>Tactic</TableCell>
                    <TableCell align="right">Alert count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!summary || summary.techniques.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="text.secondary" align="center" py={2}>
                          No MITRE-tagged alerts for this case yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.techniques.map((t, i) => (
                      <TableRow key={`${t.technique_id}-${i}-${t.tactic || ''}`}>
                        <TableCell>{t.technique_id}</TableCell>
                        <TableCell>{t.technique}</TableCell>
                        <TableCell>{t.tactic || '—'}</TableCell>
                        <TableCell align="right">{t.count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      {showGlobal && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Global MITRE ATT&CK Heatmap</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Technique frequency across all cases. Darker colors indicate higher occurrence.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {globalTechniques.map((t) => (
                <Tooltip key={t.technique_id} title={`${t.technique_id}: ${t.technique} (${t.count} hits)`}>
                  <Box
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      minWidth: 100,
                      textAlign: 'center',
                      bgcolor: t.count > 10 ? 'error.dark' : t.count > 5 ? 'error.main' : t.count > 2 ? 'warning.main' : 'success.main',
                      color: 'white',
                      cursor: 'help'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>{t.technique_id}</Typography>
                    <Typography variant="h6">{t.count}</Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MitrePage;
