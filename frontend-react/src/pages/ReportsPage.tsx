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
  TextField,
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Case, CaseReportRecord } from '../types';
import { apiService } from '@services/apiService';
import { formatDateTime } from '@utils/helpers';

const ReportsPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [caseId, setCaseId] = useState('');
  const [rows, setRows] = useState<CaseReportRecord[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const data = await apiService.listCaseReports(parseInt(caseId, 10));
      setRows(data || []);
    } catch {
      setError('Failed to list reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) load();
  }, [caseId]);

  const generate = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      setError('');
      await apiService.generateCasePdf(parseInt(caseId, 10), title || undefined);
      setTitle('');
      await load();
    } catch {
      setError('PDF generation failed');
    } finally {
      setLoading(false);
    }
  };

  const download = async (r: CaseReportRecord) => {
    try {
      await apiService.downloadReportPdf(r.id, `${r.report_number}.pdf`);
    } catch {
      setError('Download failed');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PdfIcon /> Reports
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
          <TextField
            size="small"
            label="Report title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button variant="contained" onClick={generate} disabled={!caseId || loading}>
            Generate PDF
          </Button>
          <Button variant="outlined" onClick={load} disabled={!caseId || loading}>
            Refresh list
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Report #</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Generated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary" align="center" py={2}>
                          {caseId ? 'No reports yet for this case.' : 'Select a case.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.report_number}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>{r.status}</TableCell>
                        <TableCell>{formatDateTime(r.generated_at)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => download(r)}>Download PDF</Button>
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
    </Box>
  );
};

export default ReportsPage;
