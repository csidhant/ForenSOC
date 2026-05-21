import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Use env-driven base URL so this works in local dev, Docker, and any cloud deployment
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const searchPublicIntel = async (query: string) => {
  const response = await fetch(`${API_BASE}/public/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
};

const scanPublicFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/public/scan`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('File scan failed');
  }
  return response.json();
};

const PublicSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setScanResults(null);
    try {
      const data = await searchPublicIntel(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search intelligence');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setScanLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await scanPublicFile(file);
      setScanResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to scan file');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Threat Intelligence Search
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Search the ForenSOC database for IP addresses, domains, and file hashes.
        </Typography>
      </Box>

      <Paper 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          mb: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <TextField
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Hash, IP Address, or Domain"
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading || scanLoading}
          sx={{ m: 1, borderRadius: 2 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        >
          Search
        </Button>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          OR
        </Typography>
        <Button
          variant="outlined"
          component="label"
          disabled={loading || scanLoading}
          startIcon={scanLoading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          {scanLoading ? 'Scanning File...' : 'Upload File for YARA Scan'}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}

      {results && (
        <Box>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Search Summary</Typography>
            <Typography variant="body1">
              {results.summary}
            </Typography>
          </Paper>

          {results.intel_found && (
            <>
              {results.alerts && results.alerts.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>Related Alerts</Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Alert Name</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Source IP</TableCell>
                          <TableCell>MITRE ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.alerts.map((alert: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{alert.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={alert.severity} 
                                color={alert.severity.toLowerCase() === 'high' ? 'error' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>{alert.source_ip}</TableCell>
                            <TableCell>{alert.mitre_id}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {results.evidence && results.evidence.length > 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom>Associated Evidence</Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Filename</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>SHA256 Hash</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.evidence.map((ev: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{ev.filename}</TableCell>
                            <TableCell>{ev.type}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {ev.sha256}
                            </TableCell>
                            <TableCell>
                              <Chip label={ev.integrity_status} size="small" color="success" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {scanResults && (
        <Box>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Scan Results: {scanResults.filename}</Typography>
              <Chip 
                label={scanResults.status} 
                color={scanResults.status === 'Malicious' ? 'error' : 'success'} 
                sx={{ fontSize: '1.1rem', py: 2 }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              SHA256: {scanResults.sha256}
            </Typography>
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="h6">YARA Matches</Typography>
            {scanResults.yara_matches && scanResults.yara_matches.length > 0 ? (
              <List>
                {scanResults.yara_matches.map((match: any, idx: number) => (
                  <ListItem key={idx} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">{match.rule_name}</Typography>
                          <Chip size="small" label={match.rule_severity} color={match.rule_severity === 'High' ? 'error' : 'warning'} />
                        </Box>
                      } 
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">{match.description}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                            {match.matched_strings}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No threats detected. File appears clean.
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default PublicSearchPage;
