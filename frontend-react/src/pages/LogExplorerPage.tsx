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
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { RawEvent, NormalizedEvent } from '../types';
import { apiService } from '@services/apiService';
import { formatDate } from '@utils/helpers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`log-tabpanel-${index}`}
      aria-labelledby={`log-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LogExplorerPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [normalizedEvents, setNormalizedEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    log_source: '',
    start_date: '',
    end_date: '',
    search_term: '',
    case_id: '',
    severity: '',
    event_type: '',
  });
  const [selectedEvent, setSelectedEvent] = useState<RawEvent | NormalizedEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    if (tabValue === 0) {
      searchRawEvents();
    } else {
      searchNormalizedEvents();
    }
  }, [tabValue]);

  const searchRawEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        page_size: 50,
      };

      if (searchFilters.log_source) params.log_source = searchFilters.log_source;
      if (searchFilters.start_date) params.start_date = searchFilters.start_date;
      if (searchFilters.end_date) params.end_date = searchFilters.end_date;
      if (searchFilters.search_term) params.search = searchFilters.search_term;
      if (searchFilters.case_id) params.case_id = searchFilters.case_id;

      const response = await apiService.getRawLogs(params);
      setRawEvents(response || []);
    } catch (err: any) {
      setError('Failed to search raw events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchNormalizedEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        page_size: 50,
      };

      if (searchFilters.start_date) params.start_date = searchFilters.start_date;
      if (searchFilters.end_date) params.end_date = searchFilters.end_date;
      if (searchFilters.search_term) params.search = searchFilters.search_term;
      if (searchFilters.case_id) params.case_id = searchFilters.case_id;
      if (searchFilters.severity) params.severity = searchFilters.severity;
      if (searchFilters.event_type) params.event_type = searchFilters.event_type;

      const response = await apiService.getNormalizedLogs(params);
      setNormalizedEvents(response || []);
    } catch (err: any) {
      setError('Failed to search normalized events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (tabValue === 0) {
      searchRawEvents();
    } else {
      searchNormalizedEvents();
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewEvent = (event: RawEvent | NormalizedEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Log Explorer
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleSearch}
        >
          Refresh
        </Button>
      </Box>

      <Typography sx={{ mb: 3, color: 'text.secondary' }}>
        Search ingested logs, review normalized events, and investigate suspicious activity.
      </Typography>

      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Log Source"
                value={searchFilters.log_source}
                onChange={(e) => setSearchFilters({ ...searchFilters, log_source: e.target.value })}
                placeholder="e.g., auth.log, web.log"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="datetime-local"
                value={searchFilters.start_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="datetime-local"
                value={searchFilters.end_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search Term"
                value={searchFilters.search_term}
                onChange={(e) => setSearchFilters({ ...searchFilters, search_term: e.target.value })}
                placeholder="Search in log content"
              />
            </Grid>
            {tabValue === 1 && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={searchFilters.severity}
                      label="Severity"
                      onChange={(e) => setSearchFilters({ ...searchFilters, severity: e.target.value })}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Event Type"
                    value={searchFilters.event_type}
                    onChange={(e) => setSearchFilters({ ...searchFilters, event_type: e.target.value })}
                    placeholder="e.g., login, access"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Case ID"
                value={searchFilters.case_id}
                onChange={(e) => setSearchFilters({ ...searchFilters, case_id: e.target.value })}
                placeholder="Filter by case"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs for Raw vs Normalized */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="log tabs">
            <Tab label="Raw Events" />
            <Tab label="Normalized Events" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell>Log Source</TableCell>
                    <TableCell>Raw Data Preview</TableCell>
                    <TableCell>Case ID</TableCell>
                    <TableCell>Ingested At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rawEvents.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{event.log_source}</TableCell>
                      <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.raw_data.substring(0, 100)}...
                      </TableCell>
                      <TableCell>{event.case_id || 'N/A'}</TableCell>
                      <TableCell>{formatDate(event.ingested_at)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => handleViewEvent(event)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {rawEvents.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No raw events found. Try adjusting your search filters.</Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {normalizedEvents.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>{formatDate(event.event_timestamp)}</TableCell>
                      <TableCell>{event.log_source}</TableCell>
                      <TableCell>{event.event_type || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.severity || 'unknown'}
                          size="small"
                          color={
                            event.severity === 'critical' ? 'error' :
                            event.severity === 'high' ? 'warning' :
                            event.severity === 'medium' ? 'info' : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.description || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => handleViewEvent(event)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {normalizedEvents.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No normalized events found. Try adjusting your search filters.</Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Event Detail Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              {tabValue === 0 ? (
                // Raw Event Details
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Raw Event</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ID"
                        value={(selectedEvent as RawEvent).id}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Log Source"
                        value={(selectedEvent as RawEvent).log_source}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Raw Data"
                        value={(selectedEvent as RawEvent).raw_data}
                        multiline
                        rows={6}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Case ID"
                        value={(selectedEvent as RawEvent).case_id || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ingested At"
                        value={formatDate((selectedEvent as RawEvent).ingested_at)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                // Normalized Event Details
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Normalized Event</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ID"
                        value={(selectedEvent as NormalizedEvent).id}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Event Timestamp"
                        value={formatDate((selectedEvent as NormalizedEvent).event_timestamp)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Log Source"
                        value={(selectedEvent as NormalizedEvent).log_source}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Event Type"
                        value={(selectedEvent as NormalizedEvent).event_type || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Severity"
                        value={(selectedEvent as NormalizedEvent).severity || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Source IP"
                        value={(selectedEvent as NormalizedEvent).source_ip || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Destination IP"
                        value={(selectedEvent as NormalizedEvent).dest_ip || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={(selectedEvent as NormalizedEvent).username || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hostname"
                        value={(selectedEvent as NormalizedEvent).hostname || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={(selectedEvent as NormalizedEvent).description || 'N/A'}
                        multiline
                        rows={3}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    {(selectedEvent as NormalizedEvent).raw_log && (
                      <Grid item xs={12}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Raw Log Data</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TextField
                              fullWidth
                              value={(selectedEvent as NormalizedEvent).raw_log}
                              multiline
                              rows={4}
                              InputProps={{ readOnly: true }}
                            />
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogExplorerPage;
