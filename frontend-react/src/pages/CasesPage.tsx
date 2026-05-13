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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Case, CaseStatus, Priority } from '@types/index';
import { apiService } from '@services/apiService';
import { formatDate, getStatusColor } from '@utils/helpers';
import { useNavigate } from 'react-router-dom';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCases(1, 50);
      setCases(data.items || []);
    } catch (err: any) {
      setError('Failed to load cases');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (caseData?: Case) => {
    if (caseData) {
      setEditingCase(caseData);
      setFormData({
        title: caseData.title,
        description: caseData.description || '',
        priority: caseData.priority,
      });
    } else {
      setEditingCase(null);
      setFormData({ title: '', description: '', priority: 'medium' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCase(null);
  };

  const handleSaveCase = async () => {
    try {
      if (editingCase) {
        await apiService.updateCase(editingCase.id, formData);
      } else {
        await apiService.createCase(formData);
      }
      loadCases();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save case');
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiService.deleteCase(id);
        loadCases();
      } catch (err: any) {
        setError('Failed to delete case');
      }
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
          Cases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Case
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow
                key={caseItem.id}
                hover
                onClick={() => navigate(`/cases/${caseItem.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{caseItem.title}</TableCell>
                <TableCell>
                  <Chip
                    label={caseItem.status}
                    size="small"
                    sx={{ bgcolor: getStatusColor(caseItem.status), color: 'white' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={caseItem.priority}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(caseItem.created_at)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(caseItem);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCase(caseItem.id);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {cases.length === 0 && (
        <Card sx={{ mt: 3, textAlign: 'center', p: 3 }}>
          <Typography color="textSecondary">No cases found. Create one to get started.</Typography>
        </Card>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCase ? 'Edit Case' : 'New Case'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveCase}
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

export default CasesPage;
