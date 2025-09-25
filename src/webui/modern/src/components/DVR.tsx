import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Pagination,
  CircularProgress,
  Toolbar,
  TextField,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Stop as StopIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

interface Recording {
  id: string;
  title: string;
  extraText: string;
  channel: string;
  scheduledStart: string;
  scheduledStop: string;
  duration: number;
  fileSize: string;
  comment: string;
  genre: string;
  enabled: boolean;
  status: 'upcoming' | 'recording' | 'completed' | 'failed';
}

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
      id={`dvr-tabpanel-${index}`}
      aria-labelledby={`dvr-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function DVR() {
  const [currentTab, setCurrentTab] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);

  const tabs = [
    { label: 'Upcoming / Current Recordings', value: 0, status: ['upcoming', 'recording'] },
    { label: 'Finished Recordings', value: 1, status: ['completed'] },
    { label: 'Failed Recordings', value: 2, status: ['failed'] },
    { label: 'Autorecs', value: 3, status: [] },
    { label: 'Timers', value: 4, status: [] },
  ];

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'extraText', label: 'Extra text' },
    { key: 'channel', label: 'Channel' },
    { key: 'scheduledStart', label: 'Scheduled start time' },
    { key: 'scheduledStop', label: 'Scheduled stop time' },
    { key: 'duration', label: 'Scheduled Duration' },
    { key: 'fileSize', label: 'File size' },
    { key: 'comment', label: 'Comment' },
    { key: 'genre', label: 'Genre' },
  ];

  useEffect(() => {
    loadRecordings();
  }, [currentTab, page, itemsPerPage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadRecordings, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, currentTab, page, itemsPerPage]);

  const loadRecordings = () => {
    setLoading(true);
    // Simulate API call - in real implementation, this would call the actual DVR API
    setTimeout(() => {
      // Mock data for demonstration
      const mockRecordings: Recording[] = [];
      setRecordings(mockRecordings);
      setTotalPages(1);
      setLoading(false);
    }, 500);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(1);
    setSelectedRecordings([]);
  };

  const handleSelectRecording = (recordingId: string) => {
    setSelectedRecordings(prev => {
      if (prev.includes(recordingId)) {
        return prev.filter(id => id !== recordingId);
      } else {
        return [...prev, recordingId];
      }
    });
  };

  const handleSelectAllRecordings = () => {
    if (selectedRecordings.length === recordings.length) {
      setSelectedRecordings([]);
    } else {
      setSelectedRecordings(recordings.map(r => r.id));
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'error';
      case 'completed': return 'success';
      case 'upcoming': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const currentTabData = tabs[currentTab];
  const filteredRecordings = recordings.filter(recording => 
    currentTabData.status.length === 0 || currentTabData.status.includes(recording.status)
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Digital Video Recorder
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="DVR tabs"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Toolbar */}
      <Paper sx={{ mb: 2 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          {/* Main Action Buttons */}
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length === 0}
          >
            Save
          </Button>
          <Button
            startIcon={<UndoIcon />}
            variant="outlined"
            size="small"
          >
            Undo
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
          >
            Add
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length === 0}
            color="error"
          >
            Delete
          </Button>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length !== 1}
          >
            Edit
          </Button>
          <Button
            startIcon={<StopIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length === 0}
            color="warning"
          >
            Stop
          </Button>
          <Button
            startIcon={<CancelIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length === 0}
            color="error"
          >
            Abort
          </Button>

          {/* Secondary Action Buttons */}
          <Button
            startIcon={<HistoryIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length !== 1}
          >
            Previously recorded
          </Button>
          <Button
            startIcon={<PlayIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length !== 1}
          >
            Related broadcasts
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            disabled={selectedRecordings.length !== 1}
          >
            Alternative showings
          </Button>

          {/* View Level and Help */}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            size="small"
          >
            View level: Basic
          </Button>
          <Button
            startIcon={<HelpIcon />}
            variant="outlined"
            size="small"
          >
            Help
          </Button>
        </Toolbar>
      </Paper>

      {/* Tab Content */}
      {tabs.map((tab, index) => (
        <TabPanel key={tab.value} value={currentTab} index={index}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedRecordings.length > 0 && selectedRecordings.length < filteredRecordings.length}
                        checked={filteredRecordings.length > 0 && selectedRecordings.length === filteredRecordings.length}
                        onChange={handleSelectAllRecordings}
                      />
                    </TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Content Icons</TableCell>
                    <TableCell>Enabled</TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 4} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredRecordings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {currentTab === 0 && 'No upcoming / current recordings to display'}
                          {currentTab === 1 && 'No finished recordings to display'}
                          {currentTab === 2 && 'No failed recordings to display'}
                          {currentTab === 3 && 'No autorecs to display'}
                          {currentTab === 4 && 'No timers to display'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecordings.map((recording) => (
                      <TableRow key={recording.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRecordings.includes(recording.id)}
                            onChange={() => handleSelectRecording(recording.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small">Details</Button>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            <Chip
                              label={recording.status.toUpperCase()}
                              size="small"
                              color={getStatusColor(recording.status) as any}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={recording.enabled}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{recording.title}</TableCell>
                        <TableCell>{recording.extraText}</TableCell>
                        <TableCell>{recording.channel}</TableCell>
                        <TableCell>{recording.scheduledStart}</TableCell>
                        <TableCell>{recording.scheduledStop}</TableCell>
                        <TableCell>{formatDuration(recording.duration)}</TableCell>
                        <TableCell>{recording.fileSize}</TableCell>
                        <TableCell>{recording.comment}</TableCell>
                        <TableCell>
                          <Chip label={recording.genre} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination and Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">
                  Page {page} of {totalPages}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-refresh"
                />
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">Per page:</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  sx={{ width: 80 }}
                />
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
        </TabPanel>
      ))}
    </Box>
  );
}

export default DVR;