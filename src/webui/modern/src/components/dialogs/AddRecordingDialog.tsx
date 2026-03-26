import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FiberManualRecord as RecordIcon } from '@mui/icons-material';
import { loadDVRConfigs, SelectOption } from '../../utils/api';

interface EPGEvent {
  eventId?: string;
  title: string;
  subtitle?: string;
  channelName: string;
  start: number;
}

interface AddRecordingDialogProps {
  open: boolean;
  onClose: () => void;
  event: EPGEvent | null;
  onScheduled?: () => void;
}

const AddRecordingDialog: React.FC<AddRecordingDialogProps> = ({ open, onClose, event, onScheduled }) => {
  const [dvrConfigs, setDvrConfigs] = useState<SelectOption[]>([]);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoadingConfigs(true);
    loadDVRConfigs()
      .then((configs) => setDvrConfigs(configs))
      .catch(() => setDvrConfigs([]))
      .finally(() => setLoadingConfigs(false));
  }, [open]);

  const handleCreateRecording = async () => {
    if (!event?.eventId) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/dvr/entry/create_by_event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          event_id: event.eventId,
          config_uuid: selectedConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule recording');
      }

      if (onScheduled) onScheduled();
      onClose();
    } catch (e) {
      setError('Failed to schedule recording');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Recording</DialogTitle>
      <DialogContent dividers>
        {event ? (
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {event.title}
            </Typography>
            {event.subtitle && (
              <Typography variant="body2" color="text.secondary">
                {event.subtitle}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {event.channelName} • {new Date(event.start * 1000).toLocaleString()}
            </Typography>

            <FormControl fullWidth size="small" disabled={loadingConfigs || submitting}>
              <InputLabel>DVR Profile</InputLabel>
              <Select
                value={selectedConfig}
                label="DVR Profile"
                onChange={(e) => setSelectedConfig(e.target.value)}
              >
                <MenuItem value="">(default DVR Profile)</MenuItem>
                {dvrConfigs.map((config) => (
                  <MenuItem key={String(config.key)} value={String(config.key)}>
                    {config.val}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">No event selected.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={submitting ? <CircularProgress size={16} /> : <RecordIcon />}
          onClick={handleCreateRecording}
          disabled={!event?.eventId || submitting}
        >
          Add Recording
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRecordingDialog;
