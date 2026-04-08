import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface DVREntry {
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
  url?: string;
  image?: string;
  errorcode?: number;
  errors?: number;
  data_errors?: number;
}

interface DVREntryDialogProps {
  open: boolean;
  onClose: () => void;
  entry: DVREntry | null;
  onDeleted?: () => void;
  onStopped?: () => void;
  onUpdated?: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

const DVREntryDialog: React.FC<DVREntryDialogProps> = ({
  open,
  onClose,
  entry,
  onDeleted,
  onStopped,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadedEntry, setLoadedEntry] = useState<DVREntry | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  React.useEffect(() => {
    let active = true;
    if (!open || !entry?.uuid) return;

    setLoadedEntry(entry);
    setDetailsLoading(true);
    fetch('/api/idnode/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: entry.uuid }),
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data?.entries?.[0]) return;
        setLoadedEntry((prev) => ({ ...(prev || entry), ...data.entries[0] }));
      })
      .catch(() => {
        // fallback to row data only
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, entry]);

  const effectiveEntry = loadedEntry || entry;

  if (!effectiveEntry) return null;

  const isRecording = effectiveEntry.sched_status === 'recording';
  const isUpcoming = effectiveEntry.sched_status === 'scheduled';
  const isCompleted = effectiveEntry.sched_status === 'completed';
  const isFailed = effectiveEntry.sched_status === 'failed' || effectiveEntry.sched_status === 'invalid' || effectiveEntry.sched_status === 'missed';

  const handleDvrAction = async (url: string, successText: string, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: effectiveEntry.uuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: successText });
        if (onSuccess) onSuccess();
        if (onUpdated) onUpdated();
      } else {
        setMessage({ type: 'error', text: `Failed: ${successText}` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Failed: ${successText}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/idnode/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: effectiveEntry.uuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recording deleted' });
        setTimeout(() => {
          if (onDeleted) onDeleted();
          if (onUpdated) onUpdated();
          onClose();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete recording' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete recording' });
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    handleDvrAction('/api/dvr/entry/stop', 'Recording stopped', onStopped);
  };

  const handleAbort = async () => {
    handleDvrAction('/api/dvr/entry/abort', 'Recording aborted', onStopped);
  };

  const getStatusChip = () => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      recording: 'error',
      scheduled: 'primary',
      completed: 'success',
      missed: 'warning',
      invalid: 'error',
    };
    return (
      <Chip
        label={effectiveEntry.sched_status}
        color={colors[effectiveEntry.sched_status] || 'default'}
        size="small"
      />
    );
  };

  const downloadUrl = effectiveEntry.filename
    ? `/dvrfile/${effectiveEntry.uuid}`
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography variant="h6">{effectiveEntry.disp_title}</Typography>
            {effectiveEntry.disp_subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {effectiveEntry.disp_subtitle}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell>{getStatusChip()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Channel</strong></TableCell>
                  <TableCell>{effectiveEntry.channelname || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Start</strong></TableCell>
                  <TableCell>
                    {effectiveEntry.start_real ? new Date(effectiveEntry.start_real * 1000).toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Stop</strong></TableCell>
                  <TableCell>
                    {effectiveEntry.stop_real ? new Date(effectiveEntry.stop_real * 1000).toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
                {effectiveEntry.duration != null && (
                  <TableRow>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell>{Math.round(effectiveEntry.duration / 60)} min</TableCell>
                  </TableRow>
                )}
                {effectiveEntry.filesize != null && (
                  <TableRow>
                    <TableCell><strong>File Size</strong></TableCell>
                    <TableCell>{formatBytes(effectiveEntry.filesize)}</TableCell>
                  </TableRow>
                )}
                {effectiveEntry.filename && (
                  <TableRow>
                    <TableCell><strong>File Name</strong></TableCell>
                    <TableCell sx={{ wordBreak: 'break-all' }}>{effectiveEntry.filename}</TableCell>
                  </TableRow>
                )}
                {effectiveEntry.errors != null && effectiveEntry.errors > 0 && (
                  <TableRow>
                    <TableCell><strong>Errors</strong></TableCell>
                    <TableCell>{effectiveEntry.errors}</TableCell>
                  </TableRow>
                )}
                {effectiveEntry.comment && (
                  <TableRow>
                    <TableCell><strong>Comment</strong></TableCell>
                    <TableCell>{effectiveEntry.comment}</TableCell>
                  </TableRow>
                )}
                {detailsLoading && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={14} />
                        <Typography variant="body2" color="text.secondary">Loading full details…</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Grid>

          {(effectiveEntry.disp_summary || effectiveEntry.disp_description) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                {effectiveEntry.disp_summary || effectiveEntry.disp_description}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        {isCompleted && downloadUrl && (
          <Button
            startIcon={<DownloadIcon />}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
          >
            Download
          </Button>
        )}
        {isCompleted && downloadUrl && (
          <Button
            startIcon={<PlayIcon />}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            color="success"
          >
            Play
          </Button>
        )}
        {isRecording && (
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <StopIcon />}
            onClick={handleStop}
            disabled={loading}
            color="warning"
            variant="outlined"
          >
            Stop
          </Button>
        )}
        {isRecording && (
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <StopIcon />}
            onClick={handleAbort}
            disabled={loading}
            color="error"
            variant="outlined"
          >
            Abort
          </Button>
        )}
        {(isUpcoming || isRecording) && (
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={loading}
            color="error"
            variant="outlined"
          >
            Cancel
          </Button>
        )}
        {!isUpcoming && !isRecording && (
          <>
            <Button
              onClick={() => handleDvrAction('/api/dvr/entry/rerecord/toggle', 'Re-record toggled')}
              disabled={loading}
              variant="outlined"
            >
              Re-record
            </Button>
            {isCompleted && (
              <Button
                onClick={() => handleDvrAction('/api/dvr/entry/move/failed', 'Moved to failed')}
                disabled={loading}
                variant="outlined"
                color="warning"
              >
                Move to failed
              </Button>
            )}
            {isFailed && (
              <Button
                onClick={() => handleDvrAction('/api/dvr/entry/move/finished', 'Moved to finished')}
                disabled={loading}
                variant="outlined"
                color="success"
              >
                Move to finished
              </Button>
            )}
            {(isCompleted || isFailed) && (
              <Button
                onClick={() => handleDvrAction('/api/dvr/entry/remove', 'Recording removed from storage')}
                disabled={loading}
                variant="outlined"
                color="warning"
              >
                Remove
              </Button>
            )}
          </>
        )}
        {!isUpcoming && !isRecording && (
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={loading}
            color="error"
            variant="outlined"
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DVREntryDialog;
