import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import { RecordVoiceOver } from '@mui/icons-material';
import api from '../../api/tvheadend';

interface CreateAutoRecDialogProps {
  open: boolean;
  onClose: () => void;
  eventId?: string;
  title?: string;
  channel?: string;
}

const CreateAutoRecDialog: React.FC<CreateAutoRecDialogProps> = ({
  open,
  onClose,
  eventId,
  title,
  channel,
}) => {
  const [autoRecTitle, setAutoRecTitle] = useState(title || '');
  const [enabled, setEnabled] = useState(true);
  const [fulltext, setFulltext] = useState(false);
  const [channel_filter, setChannelFilter] = useState('');
  const [tag_filter, setTagFilter] = useState('');
  const [genre_filter, setGenreFilter] = useState('');
  const [start_extra, setStartExtra] = useState(0);
  const [stop_extra, setStopExtra] = useState(0);
  const [priority, setPriority] = useState(6);
  const [dvr_config, setDvrConfig] = useState('');

  const handleCreate = async () => {
    try {
      const params = {
        event_id: eventId,
        enabled,
        title: autoRecTitle,
        fulltext,
        channel: channel_filter,
        tag: tag_filter,
        genre: genre_filter,
        start_extra,
        stop_extra,
        priority,
        config_uuid: dvr_config,
      };
      
      await api.createAutoRec(params);
      onClose();
    } catch (error) {
      console.error('Failed to create autorec:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RecordVoiceOver sx={{ mr: 1 }} />
          Create AutoRec
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Create an automatic recording rule to record all future programs that match the current query.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                }
                label="Enabled"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (Regular Expression)"
                value={autoRecTitle}
                onChange={(e) => setAutoRecTitle(e.target.value)}
                helperText="Use regular expressions to match program titles"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fulltext}
                    onChange={(e) => setFulltext(e.target.checked)}
                  />
                }
                label="Fulltext"
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4 }}>
                Search in title, subtitle, summary and description
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select
                  value={channel_filter}
                  label="Channel"
                  onChange={(e) => setChannelFilter(e.target.value)}
                >
                  <MenuItem value="">All Channels</MenuItem>
                  <MenuItem value={channel}>{channel}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Channel Tag</InputLabel>
                <Select
                  value={tag_filter}
                  label="Channel Tag"
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <MenuItem value="">All Tags</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={genre_filter}
                  label="Genre"
                  onChange={(e) => setGenreFilter(e.target.value)}
                >
                  <MenuItem value="">All Genres</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>DVR Configuration</InputLabel>
                <Select
                  value={dvr_config}
                  label="DVR Configuration"
                  onChange={(e) => setDvrConfig(e.target.value)}
                >
                  <MenuItem value="">(default DVR Profile)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Start Extra (minutes)"
                value={start_extra}
                onChange={(e) => setStartExtra(parseInt(e.target.value) || 0)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Stop Extra (minutes)"
                value={stop_extra}
                onChange={(e) => setStopExtra(parseInt(e.target.value) || 0)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 6)}
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<RecordVoiceOver />}
          onClick={handleCreate}
        >
          Create AutoRec
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAutoRecDialog;