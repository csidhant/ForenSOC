import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Grid,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { Case, ForensicsJobResponse } from '../types';
import { apiService } from '@services/apiService';
import { HelpTooltip, EmptyState } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';

const ForensicsPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [caseId, setCaseId] = useState('');
  const [pcapFile, setPcapFile] = useState<File | null>(null);
  const [memFile, setMemFile] = useState<File | null>(null);
  const [eveFile, setEveFile] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ForensicsJobResponse | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiService.getCases(1, 200);
      setCases(res.items || []);
    })();
  }, []);

  const run = async (
    label: string,
    fn: () => Promise<ForensicsJobResponse>
  ) => {
    if (!caseId) {
      setError('Select a case');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const r = await fn();
      setResult(r);
    } catch (e: unknown) {
      setError(`${label} failed`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        Network & memory forensics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        PCAP runs Zeek (if installed) and a pyshark packet sample. Memory runs Volatility 3 plugins when{' '}
        <code>vol</code> is on PATH. Suricata accepts EVE JSON (newline-delimited).
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {result && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResult(null)}>
          {result.message} (evidence id {result.evidence_id}
          {result.pcap_analysis_id != null ? `, analysis ${result.pcap_analysis_id}` : ''})
        </Alert>
      )}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <FormControl fullWidth size="small" sx={{ maxWidth: 400 }}>
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
            <HelpTooltip
              title={HELP_CONTENT.forensics.timeline.title}
              description={HELP_CONTENT.forensics.timeline.description}
            />
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Description (optional)"
            sx={{ mt: 2, maxWidth: 560 }}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </CardContent>
      </Card>

      {!loading && !result && (
        <Box sx={{ py: 4 }}>
          <EmptyState
            icon={<UploadIcon />}
            title="Ready to start forensic analysis"
            description="Upload a PCAP, memory dump, or Suricata EVE file to begin automated evidence processing and threat detection."
          />
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>PCAP</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadIcon />} fullWidth>
                Choose PCAP
                <input
                  type="file"
                  hidden
                  accept=".pcap,.cap,.pcapng"
                  onChange={(e) => setPcapFile(e.target.files?.[0] || null)}
                />
              </Button>
              {pcapFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{pcapFile.name}</Typography>}
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                disabled={loading || !pcapFile}
                onClick={() => run('PCAP', () => apiService.uploadPcapAnalyze(parseInt(caseId, 10), pcapFile!, desc || undefined))}
              >
                {loading ? <CircularProgress size={22} /> : 'Upload & analyze'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Memory dump</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadIcon />} fullWidth>
                Choose dump
                <input type="file" hidden onChange={(e) => setMemFile(e.target.files?.[0] || null)} />
              </Button>
              {memFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{memFile.name}</Typography>}
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                disabled={loading || !memFile}
                onClick={() => run('Memory', () => apiService.uploadMemoryAnalyze(parseInt(caseId, 10), memFile!, desc || undefined))}
              >
                {loading ? <CircularProgress size={22} /> : 'Upload & run Volatility'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Suricata EVE</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadIcon />} fullWidth>
                Choose EVE JSON
                <input type="file" hidden accept=".json,.log,.txt" onChange={(e) => setEveFile(e.target.files?.[0] || null)} />
              </Button>
              {eveFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{eveFile.name}</Typography>}
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                disabled={loading || !eveFile}
                onClick={() => run('Suricata', () => apiService.uploadSuricataEve(parseInt(caseId, 10), eveFile!, desc || undefined))}
              >
                {loading ? <CircularProgress size={22} /> : 'Upload & parse'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForensicsPage;
