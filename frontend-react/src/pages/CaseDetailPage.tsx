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
import { Case, EvidenceItem } from '@types/index';
import { apiService } from '@services/apiService';
import { formatDateTime } from '@utils/helpers';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiService.getCase(id);
        setCaseData(data);
      } catch (err: unknown) {
        setError('Failed to load case details');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !caseData) {
    return <Alert severity="error">{error || 'Case not found'}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {caseData.title}
      </Typography>

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
          <Tab label="Events" />
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
                  No evidence uploaded for this case yet. Use the evidence vault to upload files.
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
            <Typography color="textSecondary">Events timeline coming soon</Typography>
          )}
          {tabValue === 2 && (
            <Typography color="textSecondary">Case timeline coming soon</Typography>
          )}
          {tabValue === 3 && (
            <Typography color="textSecondary">Reports coming soon</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseDetailPage;
