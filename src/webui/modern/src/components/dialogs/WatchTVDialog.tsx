import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import api from '../../api/tvheadend';

interface WatchTVDialogProps {
  open: boolean;
  onClose: () => void;
  channelUuid?: string;
  title?: string;
}

const WatchTVDialog: React.FC<WatchTVDialogProps> = ({
  open,
  onClose,
  channelUuid,
  title,
}) => {
  const handleWatchTV = () => {
    if (channelUuid) {
      const streamUrl = api.getStreamURL(channelUuid, title);
      window.open(streamUrl, '_blank');
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Watch TV
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <PlayArrow sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {title || 'Live TV Stream'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This will open a new window with the live TV stream.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleWatchTV}
        >
          Watch TV
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WatchTVDialog;