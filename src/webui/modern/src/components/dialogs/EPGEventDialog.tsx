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
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  FiberManualRecord as RecordIcon,
  Cancel as CancelIcon,
  Tv as TvIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

interface EPGEvent {
  eventId?: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  start: number;
  stop: number;
  duration?: number;
  channelName: string;
  channelUuid?: string;
  channelIcon?: string;
  genre?: string[];
  category?: string[];
  contentType?: number;
  dvrState?: string;
  dvrUuid?: string;
  firstAired?: number;
  episode?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  stars?: number;
  ageRating?: number;
  rating?: string;
  copyrightYear?: number;
  serieslinkUri?: string;
  keyword?: string[];
  cast?: string[];
  credits?: Record<string, string[]>;
}

interface EPGEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: EPGEvent | null;
  onWatchTV?: (event: EPGEvent) => void;
  onAddRecording?: (event: EPGEvent) => void;
  onCancelRecording?: (dvrUuid: string) => void;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const EPGEventDialog: React.FC<EPGEventDialogProps> = ({
  open,
  onClose,
  event,
  onWatchTV,
  onAddRecording,
  onCancelRecording,
}) => {
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!event) return null;

  const isRecorded = event.dvrState === 'scheduled' || event.dvrState === 'recording' || event.dvrState === 'completed';
  const isScheduled = event.dvrState === 'scheduled';
  const isRecording = event.dvrState === 'recording';

  const handleCancelRecording = async () => {
    if (!event.dvrUuid) return;
    setRecording(true);
    try {
      const response = await fetch('/api/dvr/entry/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uuid: event.dvrUuid }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recording cancelled' });
        if (onCancelRecording) onCancelRecording(event.dvrUuid);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to cancel recording' });
    } finally {
      setRecording(false);
    }
  };

  const getDVRStateColor = (): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (event.dvrState) {
      case 'scheduled': return 'primary';
      case 'recording': return 'error';
      case 'completed': return 'success';
      case 'missed': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography variant="h6">{event.title}</Typography>
            {event.subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {event.subtitle}
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
          {/* Channel & Time */}
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TvIcon fontSize="small" color="action" />
              <Typography variant="body1">
                <strong>{event.channelName}</strong>
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {formatDateTime(event.start)} — {formatDateTime(event.stop)}
              </Typography>
            </Box>
            {event.duration && (
              <Typography variant="body2" color="text.secondary">
                Duration: {formatDuration(event.duration)}
              </Typography>
            )}
          </Grid>

          {/* Episode / Year info */}
          <Grid item xs={12} md={6}>
            {event.episode && (
              <Typography variant="body2">
                <strong>Episode:</strong> {event.episode}
              </Typography>
            )}
            {(event.seasonNumber || event.episodeNumber) && (
              <Typography variant="body2">
                <strong>Season/Episode:</strong> S{event.seasonNumber} E{event.episodeNumber}
              </Typography>
            )}
            {event.copyrightYear && (
              <Typography variant="body2">
                <strong>Year:</strong> {event.copyrightYear}
              </Typography>
            )}
            {event.firstAired && (
              <Typography variant="body2">
                <strong>First Aired:</strong> {new Date(event.firstAired * 1000).toLocaleDateString()}
              </Typography>
            )}
            {event.stars != null && (
              <Typography variant="body2">
                <strong>Stars:</strong> {'★'.repeat(event.stars)}{'☆'.repeat(5 - event.stars)}
              </Typography>
            )}
            {event.rating && (
              <Typography variant="body2">
                <strong>Rating:</strong> {event.rating}
              </Typography>
            )}
            {event.ageRating != null && event.ageRating > 0 && (
              <Typography variant="body2">
                <strong>Age Rating:</strong> {event.ageRating}+
              </Typography>
            )}
            {isRecorded && (
              <Box mt={1}>
                <Chip
                  label={`DVR: ${event.dvrState}`}
                  color={getDVRStateColor()}
                  size="small"
                />
              </Box>
            )}
          </Grid>

          {/* Description */}
          {(event.summary || event.description) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" paragraph>
                {event.summary || event.description}
              </Typography>
              {event.summary && event.description && event.description !== event.summary && (
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
              )}
            </Grid>
          )}

          {/* Genre / Content Type */}
          {(event.genre?.length || event.category?.length) && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <CategoryIcon fontSize="small" color="action" />
                {event.genre?.map((g) => (
                  <Chip key={g} label={g} size="small" variant="outlined" />
                ))}
                {event.category?.map((c) => (
                  <Chip key={c} label={c} size="small" variant="outlined" color="secondary" />
                ))}
              </Box>
            </Grid>
          )}

          {/* Keywords */}
          {event.keyword && event.keyword.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                <strong>Keywords: </strong>{event.keyword.join(', ')}
              </Typography>
            </Grid>
          )}

          {/* Credits */}
          {event.credits && Object.keys(event.credits).length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>Credits</Typography>
              {Object.entries(event.credits).map(([role, people]) => (
                <Typography key={role} variant="body2">
                  <strong>{role.charAt(0).toUpperCase() + role.slice(1)}:</strong> {(people as string[]).join(', ')}
                </Typography>
              ))}
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        {onWatchTV && (
          <Button
            startIcon={<TvIcon />}
            onClick={() => onWatchTV(event)}
            variant="outlined"
          >
            Watch TV
          </Button>
        )}

        {isScheduled && event.dvrUuid && (
          <Button
            startIcon={recording ? <CircularProgress size={16} /> : <CancelIcon />}
            onClick={handleCancelRecording}
            disabled={recording}
            color="warning"
            variant="outlined"
          >
            Cancel Recording
          </Button>
        )}

        {isRecording && event.dvrUuid && (
          <Button
            startIcon={recording ? <CircularProgress size={16} /> : <CancelIcon />}
            onClick={handleCancelRecording}
            disabled={recording}
            color="error"
            variant="outlined"
          >
            Stop Recording
          </Button>
        )}

        {!isRecorded && event.eventId && (
          <Button
            startIcon={<RecordIcon />}
            onClick={() => onAddRecording && onAddRecording(event)}
            color="error"
            variant="contained"
          >
            Add Recording
          </Button>
        )}

        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EPGEventDialog;
