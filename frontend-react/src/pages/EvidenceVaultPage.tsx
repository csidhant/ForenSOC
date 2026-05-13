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
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  VerifiedUser as VerifyIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EvidenceItem, ChainOfCustodyEntry, Case } from '@types/index';
import { apiService } from '@services/apiService';
import { formatDateTime } from '@utils/helpers';

const EvidenceVaultPage: React.FC = () => {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCaseId, setFilterCaseId] = useState<string>('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [cocOpen, setCocOpen] = useState(false);
  const [cocRows, setCocRows] = useState<ChainOfCustodyEntry[]>([]);
  const [cocTitle, setCocTitle] = useState('');
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [uploadType, setUploadType] = useState('Log File');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterCaseId) params.case_id = parseInt(filterCaseId, 10);
      const data = await apiService.searchEvidence(params);
      setItems(data || []);
    } catch (err: unknown) {
      setError('Failed to load evidence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const res = await apiService.getCases(1, 200);
      setCases(res.items || []);
    } catch {
      setCases([]);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    loadEvidence();
  }, [filterCaseId]);

  const handleUpload = async () => {
    if (!uploadCaseId || !uploadFile) {
      setError('Select a case and file');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const fd = new FormData();
      fd.append('case_id', uploadCaseId);
      fd.append('evidence_type', uploadType);
      fd.append('file', uploadFile);
      if (uploadDescription) fd.append('description', uploadDescription);
      await apiService.uploadEvidence(fd);
      setUploadOpen(false);
      setUploadFile(null);
      setUploadDescription('');
      await loadEvidence();
    } catch (err: unknown) {
      setError('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const openCoc = async (ev: EvidenceItem) => {
    try {
      const rows = await apiService.getEvidenceChain(ev.id);
      setCocRows(rows);
      setCocTitle(`${ev.evidence_id} — ${ev.filename}`);
      setCocOpen(true);
    } catch {
      setError('Failed to load chain of custody');
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await apiService.verifyEvidence(id);
      await loadEvidence();
    } catch {
      setError('Verification failed');
    }
  };

  const handleDownload = async (ev: EvidenceItem) => {
    try {
      await apiService.downloadEvidenceBlob(ev.id, ev.filename);
    } catch {
      setError('Download failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this evidence record and stored file?')) return;
    try {
      await apiService.deleteEvidenceItem(id);
      await loadEvidence();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Evidence vault
        </Typography>
        <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadOpen(true)}>
          Upload evidence
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by case</InputLabel>
                <Select
                  value={filterCaseId}
                  label="Filter by case"
                  onChange={(e) => setFilterCaseId(e.target.value as string)}
                >
                  <MenuItem value="">All accessible cases</MenuItem>
                  {cases.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {(c.case_number || c.id) + ' — ' + c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" onClick={() => loadEvidence()}>
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Case</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Filename</TableCell>
                    <TableCell>SHA-256 (trunc.)</TableCell>
                    <TableCell>Integrity</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography color="text.secondary" align="center" py={2}>
                          No evidence found. Upload a file or adjust filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((ev) => (
                      <TableRow key={ev.id} hover>
                        <TableCell>{ev.evidence_id}</TableCell>
                        <TableCell>{ev.case_id}</TableCell>
                        <TableCell>{ev.evidence_type}</TableCell>
                        <TableCell>{ev.filename}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {ev.sha256_hash?.slice(0, 16)}…
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={ev.integrity_status || '—'}
                            color={
                              ev.integrity_status === 'Verified'
                                ? 'success'
                                : ev.integrity_status === 'Tampered'
                                  ? 'error'
                                  : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{formatDateTime(ev.uploaded_at)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Chain of custody">
                            <IconButton size="small" onClick={() => openCoc(ev)}>
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Verify hash">
                            <IconButton size="small" onClick={() => handleVerify(ev.id)}>
                              <VerifyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" onClick={() => handleDownload(ev)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(ev.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload evidence</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Case</InputLabel>
            <Select
              value={uploadCaseId}
              label="Case"
              onChange={(e) => setUploadCaseId(e.target.value as string)}
            >
              {cases.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {(c.case_number || c.id) + ' — ' + c.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Evidence type</InputLabel>
            <Select value={uploadType} label="Evidence type" onChange={(e) => setUploadType(e.target.value)}>
              <MenuItem value="Log File">Log file</MenuItem>
              <MenuItem value="PCAP">PCAP</MenuItem>
              <MenuItem value="Memory Dump">Memory dump</MenuItem>
              <MenuItem value="Disk Image">Disk image</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2, mb: 1 }}>
            Choose file
            <input
              type="file"
              hidden
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
          </Button>
          {uploadFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {uploadFile.name}
            </Typography>
          )}
          <TextField
            margin="normal"
            fullWidth
            label="Description (optional)"
            multiline
            minRows={2}
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? <CircularProgress size={22} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cocOpen} onClose={() => setCocOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chain of custody — {cocTitle}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Tool</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cocRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDateTime(r.action_time)}</TableCell>
                  <TableCell>{r.action}</TableCell>
                  <TableCell>{r.actor_id ?? r.actor_name ?? '—'}</TableCell>
                  <TableCell>{r.details || '—'}</TableCell>
                  <TableCell>{r.tool_used || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCocOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenceVaultPage;
