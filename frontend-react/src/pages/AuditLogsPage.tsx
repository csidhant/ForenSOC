import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  TablePagination,
} from '@mui/material';
import { HelpTooltip, EmptyState } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { History as HistoryIcon } from '@mui/icons-material';
import { apiService } from '@services/apiService';
import dayjs from 'dayjs';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAuditLogs(page * rowsPerPage, rowsPerPage);
        setLogs(data);
      } catch (err: any) {
        setError('Failed to load audit logs. Make sure you have admin permissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && logs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          System Audit Logs
        </Typography>
        <HelpTooltip
          title={HELP_CONTENT.audit.action.title}
          description={HELP_CONTENT.audit.action.description}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Resource</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.username || 'system'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color={log.action.includes('DELETE') ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {log.resource_type ? `${log.resource_type} (${log.resource_id})` : '-'}
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 4 }}>
                        <EmptyState
                          icon={<HistoryIcon />}
                          title="No audit logs found"
                          description="Audit entries appear after system actions like login, case updates, evidence uploads, and report generation."
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={-1} // We don't have total count from API yet, but we can paginate
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to }) => `${from}-${to}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogsPage;
