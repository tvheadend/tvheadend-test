import React, { useState, useEffect, useRef } from 'react';
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
  Slider,
  IconButton,
  Toolbar,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Fullscreen,
  VolumeUp,
  VolumeOff,
  Close,
} from '@mui/icons-material';
import { 
  loadChannels, 
  loadProfiles,
  ChannelOption,
  SelectOption
} from '../../utils/api';

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
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [profiles, setProfiles] = useState<SelectOption[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>(channelUuid || '');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [volume, setVolume] = useState<number>(90);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load dynamic data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [channelData, profileData] = await Promise.all([
          loadChannels({ numbers: true, sources: false }),
          loadProfiles(),
        ]);
        setChannels(channelData);
        setProfiles(profileData);
        
        // Set default profile if available
        if (profileData.length > 0) {
          setSelectedProfile(profileData[0].key.toString());
        }
      } catch (error) {
        console.error('Failed to load Watch TV data:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Update selected channel when channelUuid prop changes
  useEffect(() => {
    if (channelUuid) {
      setSelectedChannel(channelUuid);
    }
  }, [channelUuid]);

  // Generate stream URL when channel or profile changes
  useEffect(() => {
    if (selectedChannel && selectedProfile) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/stream/channel/${selectedChannel}?profile=${selectedProfile}`;
      setStreamUrl(url);
    }
  }, [selectedChannel, selectedProfile]);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current && streamUrl) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const volumeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue / 100;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleChannelChange = (newChannelUuid: string) => {
    setSelectedChannel(newChannelUuid);
    // If currently playing, restart with new channel
    if (isPlaying && videoRef.current) {
      handleStop();
      setTimeout(() => handlePlay(), 100);
    }
  };

  const handleProfileChange = (newProfile: string) => {
    setSelectedProfile(newProfile);
    // If currently playing, restart with new profile
    if (isPlaying && videoRef.current) {
      handleStop();
      setTimeout(() => handlePlay(), 100);
    }
  };

  const getChannelName = (uuid: string) => {
    const channel = channels.find(ch => ch.uuid === uuid);
    return channel ? channel.name : 'Unknown Channel';
  };

  const getProfileName = (key: string) => {
    const profile = profiles.find(p => p.key.toString() === key);
    return profile ? profile.val : 'Unknown Profile';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Live TV Player</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Video Player */}
        <Box sx={{ position: 'relative', backgroundColor: '#000' }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'contain',
            }}
            controls={false}
            src={streamUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => {
              const video = e.target as HTMLVideoElement;
              setVolume(video.volume * 100);
              setIsMuted(video.muted);
            }}
          />
          
          {/* Video Controls Overlay */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
            }}
          >
            <Toolbar variant="dense" sx={{ minHeight: 48 }}>
              {/* Channel Selection */}
              <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                <InputLabel sx={{ color: 'white' }}>Channel</InputLabel>
                <Select
                  value={selectedChannel}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  label="Channel"
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {channels.map((channel) => (
                    <MenuItem key={channel.uuid} value={channel.uuid}>
                      {channel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Transport Controls */}
              <IconButton onClick={handlePlay} disabled={!streamUrl || isPlaying} sx={{ color: 'white' }}>
                <PlayArrow />
              </IconButton>
              <IconButton onClick={handlePause} disabled={!isPlaying} sx={{ color: 'white' }}>
                <Pause />
              </IconButton>
              <IconButton onClick={handleStop} disabled={!streamUrl} sx={{ color: 'white' }}>
                <Stop />
              </IconButton>
              <IconButton onClick={handleFullscreen} disabled={!streamUrl} sx={{ color: 'white' }}>
                <Fullscreen />
              </IconButton>

              <Box sx={{ flexGrow: 1 }} />

              {/* Profile Selection */}
              <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                <InputLabel sx={{ color: 'white' }}>Profile</InputLabel>
                <Select
                  value={selectedProfile}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  label="Profile"
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {profiles.map((profile) => (
                    <MenuItem key={profile.key} value={profile.key.toString()}>
                      {profile.val}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Volume Controls */}
              <IconButton onClick={handleMuteToggle} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
                sx={{ 
                  width: 80, 
                  mx: 1,
                  color: 'white',
                  '& .MuiSlider-thumb': { color: 'white' },
                  '& .MuiSlider-track': { color: 'white' },
                  '& .MuiSlider-rail': { color: 'rgba(255,255,255,0.3)' }
                }}
                min={0}
                max={100}
              />
              <Typography variant="caption" sx={{ color: 'white', minWidth: 35 }}>
                {Math.round(volume)}%
              </Typography>
            </Toolbar>
          </Paper>
        </Box>

        {/* Channel and Program Info */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedChannel ? getChannelName(selectedChannel) : 'No Channel Selected'}
          </Typography>
          {title && (
            <Typography variant="body2" color="textSecondary">
              Current Program: {title}
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Profile: {selectedProfile ? getProfileName(selectedProfile) : 'No Profile Selected'}
          </Typography>
          {streamUrl && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Stream URL: {streamUrl}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handlePlay}
          disabled={!streamUrl || isPlaying}
        >
          Start Streaming
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WatchTVDialog;