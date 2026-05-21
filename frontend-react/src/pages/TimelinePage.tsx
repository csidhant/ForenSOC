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
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { HelpTooltip, EmptyState } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { Case, TimelineEventRow } from '../types';
import { apiService } from '@services/apiService';
import { formatDateTime } from '@utils/helpers';

const TimelinePage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [caseId, setCaseId] = useState('');
  const [rows, setRows] = useState<TimelineEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

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
      const data = await apiService.listTimelineEvents(parseInt(caseId, 10), { limit: 300 });
      setRows(data || []);
    } catch {
      setError('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) load();
  }, [caseId]);

  const rebuild = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      setError('');
      const r = await apiService.rebuildTimeline(parseInt(caseId, 10));
      setMsg(r.message);
      await load();
    } catch {
      setError('Rebuild failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon /> Timeline
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
            <HelpTooltip
              title={HELP_CONTENT.timeline.eventTime.title}
              description={HELP_CONTENT.timeline.eventTime.description}
            />
            <Button variant="outlined" onClick={load} disabled={!caseId || loading}>
              Refresh
            </Button>
          </Box>
          <Button variant="contained" color="secondary" onClick={rebuild} disabled={!caseId || loading}>
            Rebuild from alerts / logs / evidence
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : rows.length === 0 ? (
            <Box sx={{ py: 4 }}>
              <EmptyState
                icon={<TimelineIcon />}
                title={caseId ? 'No timeline events yet' : 'Select a case to view the timeline'}
                description={
                  caseId
                    ? 'Run the timeline rebuild or add related alerts, logs, and evidence for this case.'
                    : 'Pick a case above to build a correlated event timeline for investigation.'
                }
                action={caseId ? { label: 'Rebuild Timeline', onClick: rebuild } : undefined}
              />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formatDateTime(r.event_time)}</TableCell>
                      <TableCell>{r.source}</TableCell>
                      <TableCell>{r.event_type || '—'}</TableCell>
                      <TableCell>{r.severity || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 480 }}>{r.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimelinePage;
