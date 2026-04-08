import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Pagination,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControlLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import DVREntryDialog from './dialogs/DVREntryDialog';

interface Recording {
  uuid: string;
  disp_title: string;
  disp_subtitle?: string;
  disp_summary?: string;
  disp_description?: string;
  channelname: string;
  start_real: number;
  stop_real: number;
  duration?: number;
  filesize?: number;
  comment?: string;
  filename?: string;
  sched_status: string;
  enabled?: boolean;
  errors?: number;
}

interface AutoRec {
  uuid: string;
  enabled: boolean;
  name: string;
  title?: string;
  channel?: string;
  channelname?: string;
  tag?: string;
  genre?: string;
  pri?: number;
  config_name?: string;
  weekdays?: number[];
  start?: number;
  stop?: number;
  minduration?: number;
  maxduration?: number;
  fulltext?: boolean;
  comment?: string;
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
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' {
  switch (status) {
    case 'recording': return 'error';
    case 'scheduled': return 'primary';
    case 'completed': return 'success';
    case 'missed': case 'invalid': return 'warning';
    default: return 'default';
  }
}

const DVR_TABS = [
  { label: 'Upcoming / Current', endpoint: '/api/dvr/entry/grid_upcoming' },
  { label: 'Finished', endpoint: '/api/dvr/entry/grid_finished' },
  { label: 'Failed', endpoint: '/api/dvr/entry/grid_failed' },
  { label: 'Removed', endpoint: '/api/dvr/entry/grid_removed' },
  { label: 'Auto Recordings', endpoint: '/api/dvr/autorec/grid' },
  { label: 'Time-based Recordings', endpoint: '/api/dvr/timerec/grid' },
];

function DVR() {
  const [currentTab, setCurrentTab] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [autoRecs, setAutoRecs] = useState<AutoRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [detailEntry, setDetailEntry] = useState<Recording | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);


  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      start: ((page - 1) * itemsPerPage).toString(),
      limit: itemsPerPage.toString(),
    });

    const endpoint = DVR_TABS[currentTab]?.endpoint;
    if (!endpoint) return;

    fetch(`${endpoint}?${params}`)
      .then(res => res.json())
      .then(data => {
        const entries = data.entries || [];
        if (currentTab >= 4) {
          setAutoRecs(entries);
        } else {
          setRecordings(entries);
        }
        setTotalItems(data.totalCount || entries.length);
        setTotalPages(Math.max(1, Math.ceil((data.totalCount || entries.length) / itemsPerPage)));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load DVR data:', err);
        setRecordings([]);
        setAutoRecs([]);
        setLoading(false);
      });
  }, [currentTab, page, itemsPerPage]);

  useEffect(() => {
    loadData();
    setSelectedItems([]);
  }, [loadData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh && currentTab < 2) {
      interval = setInterval(loadData, 10000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, loadData, currentTab]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(1);
    setSelectedItems([]);
  };

  const handleSelectItem = (uuid: string) => {
    setSelectedItems(prev =>
      prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
    );
  };

  const handleSelectAll = (items: Array<{ uuid: string }>) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.uuid));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    for (const uuid of selectedItems) {
      try {
        await fetch('/api/idnode/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid }),
        });
      } catch (e) {
        console.error('Delete failed for', uuid);
      }
    }
    setSelectedItems([]);
    loadData();
  };

  const handleStopRecording = async (uuid: string) => {
    try {
      await fetch('/api/dvr/entry/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid }),
      });
      loadData();
    } catch (e) {
      console.error('Stop failed:', e);
    }
  };

  const handleAbortRecording = async (uuid: string) => {
    try {
      await fetch('/api/dvr/entry/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid }),
      });
      loadData();
    } catch (e) {
      console.error('Abort failed:', e);
    }
  };

  const handleCancelEntry = async (uuid: string) => {
    try {
      await fetch('/api/dvr/entry/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid }),
      });
      loadData();
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  };

  const handleOpenDetail = (entry: Recording) => {
    setDetailEntry(entry);
    setDetailDialogOpen(true);
  };


  const renderRecordingsTable = (items: Recording[]) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                checked={items.length > 0 && selectedItems.length === items.length}
                onChange={() => handleSelectAll(items)}
              />
            </TableCell>
            <TableCell sx={{ width: 40 }}></TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Extra</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>Stop</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No recordings</Typography>
              </TableCell>
            </TableRow>
          ) : items.map((rec) => (
            <TableRow
              key={rec.uuid}
              hover
              selected={selectedItems.includes(rec.uuid)}
              onClick={() => handleOpenDetail(rec)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedItems.includes(rec.uuid)}
                  onChange={() => handleSelectItem(rec.uuid)}
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Details">
                  <IconButton size="small" onClick={() => handleOpenDetail(rec)}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 180 }}>
                  {rec.disp_title}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                  {rec.disp_subtitle}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{rec.channelname}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {rec.start_real ? new Date(rec.start_real * 1000).toLocaleString() : '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {rec.stop_real ? new Date(rec.stop_real * 1000).toLocaleString() : '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {rec.filesize ? formatBytes(rec.filesize) : '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={rec.sched_status}
                  color={getStatusColor(rec.sched_status)}
                  size="small"
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Box display="flex" gap={0.5}>
                  {rec.sched_status === 'recording' && (
                    <Tooltip title="Stop recording">
                      <IconButton size="small" color="warning" onClick={() => handleStopRecording(rec.uuid)}>
                        <StopIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {rec.sched_status === 'recording' && (
                    <Tooltip title="Abort recording">
                      <IconButton size="small" color="error" onClick={() => handleAbortRecording(rec.uuid)}>
                        <StopIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {rec.sched_status === 'completed' && rec.filename && (
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        color="success"
                        component="a"
                        href={`/dvrfile/${rec.uuid}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {rec.sched_status === 'scheduled' && (
                    <Tooltip title="Cancel">
                      <IconButton size="small" color="error" onClick={() => handleCancelEntry(rec.uuid)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAutoRecsTable = (items: AutoRec[]) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                checked={items.length > 0 && selectedItems.length === items.length}
                onChange={() => handleSelectAll(items)}
              />
            </TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Comment</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No auto-recording rules</Typography>
              </TableCell>
            </TableRow>
          ) : items.map((rec) => (
            <TableRow key={rec.uuid} hover selected={selectedItems.includes(rec.uuid)}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.includes(rec.uuid)}
                  onChange={() => handleSelectItem(rec.uuid)}
                />
              </TableCell>
              <TableCell>
                <Chip label={rec.enabled ? 'Yes' : 'No'} size="small" color={rec.enabled ? 'success' : 'default'} />
              </TableCell>
              <TableCell>{rec.name}</TableCell>
              <TableCell>{rec.title}</TableCell>
              <TableCell>{rec.channelname || '—'}</TableCell>
              <TableCell>{rec.pri}</TableCell>
              <TableCell>{rec.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" component="h1">
          Digital Video Recorder
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
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
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadData}>
              {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Toolbar actions */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
          <Button
            startIcon={<DeleteIcon />}
            disabled={selectedItems.length === 0}
            onClick={handleDeleteSelected}
            color="error"
            size="small"
          >
            Delete ({selectedItems.length})
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
            {totalItems > 0 && `${totalItems} total`}
          </Typography>
        </Box>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {DVR_TABS.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Content panels */}
      {DVR_TABS.map((_, index) => (
        <TabPanel key={index} value={currentTab} index={index}>
          {index < 4
            ? renderRecordingsTable(recordings)
            : renderAutoRecsTable(autoRecs)
          }
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </TabPanel>
      ))}

      {/* Entry Details Dialog */}
      <DVREntryDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        entry={detailEntry}
        onDeleted={loadData}
        onStopped={loadData}
        onUpdated={loadData}
      />
    </Box>
  );
}

export default DVR;
