import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { Case, EvidenceItem, TimelineEventRow, CaseReportRecord } from '@types/index';
import { apiService } from '@services/apiService';
import { formatDateTime } from '@utils/helpers';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [caseError, setCaseError] = useState('');
  const [actionError, setActionError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [timelineRows, setTimelineRows] = useState<TimelineEventRow[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [reports, setReports] = useState<CaseReportRecord[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setCaseError('');
        const data = await apiService.getCase(id);
        setCaseData(data);
      } catch (err: unknown) {
        setCaseError('Failed to load case details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  useEffect(() => {
    const loadEvidence = async () => {
      if (!id || tabValue !== 0) return;
      try {
        setEvidenceLoading(true);
        const rows = await apiService.searchEvidence({
          case_id: parseInt(id, 10),
          limit: 100,
        });
        setEvidence(rows || []);
      } catch {
        setEvidence([]);
      } finally {
        setEvidenceLoading(false);
      }
    };
    loadEvidence();
  }, [id, tabValue]);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!id || tabValue !== 2) return;
      try {
        setTimelineLoading(true);
        const rows = await apiService.listTimelineEvents(parseInt(id, 10), { limit: 150 });
        setTimelineRows(rows || []);
      } catch {
        setTimelineRows([]);
      } finally {
        setTimelineLoading(false);
      }
    };
    loadTimeline();
  }, [id, tabValue]);

  useEffect(() => {
    const loadReports = async () => {
      if (!id || tabValue !== 3) return;
      try {
        setReportsLoading(true);
        const rows = await apiService.listCaseReports(parseInt(id, 10));
        setReports(rows || []);
      } catch {
        setReports([]);
      } finally {
        setReportsLoading(false);
      }
    };
    loadReports();
  }, [id, tabValue]);

  const rebuildTimeline = async () => {
    if (!id) return;
    try {
      setTimelineLoading(true);
      await apiService.rebuildTimeline(parseInt(id, 10));
      const rows = await apiService.listTimelineEvents(parseInt(id, 10), { limit: 150 });
      setTimelineRows(rows || []);
    } catch {
      setActionError('Timeline rebuild failed');
    } finally {
      setTimelineLoading(false);
    }
  };

  const quickPdf = async () => {
    if (!id) return;
    try {
      setReportsLoading(true);
      await apiService.generateCasePdf(parseInt(id, 10), `Case ${id} report`);
      const rows = await apiService.listCaseReports(parseInt(id, 10));
      setReports(rows || []);
    } catch {
      setActionError('Report generation failed');
    } finally {
      setReportsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (caseError || !caseData) {
    return <Alert severity="error">{caseError || 'Case not found'}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {caseData.title}
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography color="textSecondary" variant="body2">Status</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{caseData.status}</Typography>
            </Box>
            <Box>
              <Typography color="textSecondary" variant="body2">Priority</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{caseData.priority}</Typography>
            </Box>
            <Box>
              <Typography color="textSecondary" variant="body2">Created</Typography>
              <Typography variant="body1">{formatDateTime(caseData.created_at)}</Typography>
            </Box>
            <Box>
              <Typography color="textSecondary" variant="body2">Last Updated</Typography>
              <Typography variant="body1">{formatDateTime(caseData.updated_at)}</Typography>
            </Box>
          </Box>
          {caseData.description && (
            <Box sx={{ mt: 2 }}>
              <Typography color="textSecondary" variant="body2">Description</Typography>
              <Typography variant="body1">{caseData.description}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
          <Tab label="Evidence" />
          <Tab label="Logs" />
          <Tab label="Timeline" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      <Card>
        <CardContent>
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Evidence for this case</Typography>
                <Button component={RouterLink} to="/evidence" variant="outlined" size="small">
                  Open evidence vault
                </Button>
              </Box>
              {evidenceLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={28} />
                </Box>
              ) : evidence.length === 0 ? (
                <Typography color="text.secondary">
                  No evidence uploaded for this case yet. Use the evidence vault or Forensics page.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Evidence ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Filename</TableCell>
                        <TableCell>Integrity</TableCell>
                        <TableCell>Uploaded</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evidence.map((ev) => (
                        <TableRow key={ev.id}>
                          <TableCell>{ev.evidence_id}</TableCell>
                          <TableCell>{ev.evidence_type}</TableCell>
                          <TableCell>{ev.filename}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={ev.integrity_status || '—'}
                              color={ev.integrity_status === 'Verified' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{formatDateTime(ev.uploaded_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Search and ingest normalized logs in the Log Explorer (filter by case when supported in UI).
              </Typography>
              <Button component={RouterLink} to="/logs" variant="contained">
                Open Log Explorer
              </Button>
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" onClick={rebuildTimeline} disabled={timelineLoading}>
                  Rebuild timeline
                </Button>
                <Button component={RouterLink} to="/timeline" size="small" variant="text">
                  Full timeline page
                </Button>
              </Box>
              {timelineLoading ? (
                <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timelineRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography color="text.secondary">No rows — run Rebuild or use Timeline page.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        timelineRows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{formatDateTime(r.event_time)}</TableCell>
                            <TableCell>{r.source}</TableCell>
                            <TableCell sx={{ maxWidth: 400 }}>{r.description}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="small" onClick={quickPdf} disabled={reportsLoading}>
                  Generate PDF summary
                </Button>
                <Button component={RouterLink} to="/reports" size="small" variant="outlined">
                  Reports hub
                </Button>
              </Box>
              {reportsLoading ? (
                <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Report #</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Generated</TableCell>
                        <TableCell align="right">Download</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography color="text.secondary">No PDFs yet — generate one above.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.report_number}</TableCell>
                            <TableCell>{r.title}</TableCell>
                            <TableCell>{formatDateTime(r.generated_at)}</TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => apiService.downloadReportPdf(r.id, `${r.report_number}.pdf`)}>
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseDetailPage;
