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
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!entry) return null;

  const isRecording = entry.sched_status === 'recording';
  const isUpcoming = entry.sched_status === 'scheduled';
  const isCompleted = entry.sched_status === 'completed';

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/idnode/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: entry.uuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recording deleted' });
        setTimeout(() => {
          if (onDeleted) onDeleted();
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
    setLoading(true);
    try {
      const response = await fetch('/api/dvr/entry/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid: entry.uuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recording stopped' });
        if (onStopped) onStopped();
      } else {
        setMessage({ type: 'error', text: 'Failed to stop recording' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to stop recording' });
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dvr/entry/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid: entry.uuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recording aborted' });
        if (onStopped) onStopped();
      } else {
        setMessage({ type: 'error', text: 'Failed to abort recording' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to abort recording' });
    } finally {
      setLoading(false);
    }
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
        label={entry.sched_status}
        color={colors[entry.sched_status] || 'default'}
        size="small"
      />
    );
  };

  const downloadUrl = entry.filename
    ? `/dvrfile/${entry.uuid}`
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography variant="h6">{entry.disp_title}</Typography>
            {entry.disp_subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {entry.disp_subtitle}
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
                  <TableCell>{entry.channelname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Start</strong></TableCell>
                  <TableCell>
                    {entry.start_real ? new Date(entry.start_real * 1000).toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Stop</strong></TableCell>
                  <TableCell>
                    {entry.stop_real ? new Date(entry.stop_real * 1000).toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
                {entry.filesize != null && (
                  <TableRow>
                    <TableCell><strong>File Size</strong></TableCell>
                    <TableCell>{formatBytes(entry.filesize)}</TableCell>
                  </TableRow>
                )}
                {entry.errors != null && entry.errors > 0 && (
                  <TableRow>
                    <TableCell><strong>Errors</strong></TableCell>
                    <TableCell>{entry.errors}</TableCell>
                  </TableRow>
                )}
                {entry.comment && (
                  <TableRow>
                    <TableCell><strong>Comment</strong></TableCell>
                    <TableCell>{entry.comment}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Grid>

          {(entry.disp_summary || entry.disp_description) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                {entry.disp_summary || entry.disp_description}
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
