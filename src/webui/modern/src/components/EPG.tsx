import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  TablePagination,
  LinearProgress,
  Avatar,
  Grid,
  CardMedia,
} from '@mui/material';
import {
  Search,
  Refresh,
  PlayArrow,
  RecordVoiceOver,
  Help,
  Clear,
  Info,
  NavigateNext,
  NavigateBefore,
  Stop,
  Delete,
  FindInPage,
  Close,
} from '@mui/icons-material';
import api from '../api/tvheadend';
import WatchTVDialog from './dialogs/WatchTVDialog';
import CreateAutoRecDialog from './dialogs/CreateAutoRecDialog';

interface EPGEvent {
  eventId: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  start: number;
  stop: number;
  duration: number;
  channelName: string;
  channelUuid: string;
  channelIcon?: string;
  genre?: string[];
  category?: string[];
  contentType?: number;
  stars?: number;
  ageRating?: number;
  rating?: string;
  episode?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  partNumber?: number;
  dvrState?: string;
  dvrUuid?: string;
  image?: string;
  fanartImage?: string;
  firstAired?: number;
  copyrightYear?: number;
  credits?: any;
  keyword?: string[];
  serieslinkUri?: string;
  recording?: boolean;
  scheduled?: boolean;
}

const EPG: React.FC = () => {
  const [events, setEvents] = useState<EPGEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [contentType, setContentType] = useState('');
  const [duration, setDuration] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [fulltext, setFulltext] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [watchTVDialogOpen, setWatchTVDialogOpen] = useState(false);
  const [createAutoRecDialogOpen, setCreateAutoRecDialogOpen] = useState(false);
  const [programDetailsDialogOpen, setProgramDetailsDialogOpen] = useState(false);
  const [channels, setChannels] = useState<Array<{uuid: string, name: string}>>([]);
  const [tags, setTags] = useState<Array<{uuid: string, name: string}>>([]);
  const [contentTypes, setContentTypes] = useState<Array<{key: number, val: string}>>([]);

  // Load initial data
  useEffect(() => {
    loadChannels();
    loadTags();
    loadContentTypes();
    loadEvents();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channel/list');
      const data = await response.json();
      setChannels(data.entries || []);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/channeltag/list');
      const data = await response.json();
      setTags(data.entries || []);
    } catch (error) {
      console.error('Failed to load channel tags:', error);
    }
  };

  const loadContentTypes = async () => {
    try {
      const response = await fetch('/api/epg/content_type/list');
      const data = await response.json();
      setContentTypes(data.entries || []);
    } catch (error) {
      console.error('Failed to load content types:', error);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
      });
      
      if (searchTitle) params.append('title', searchTitle);
      if (selectedChannel) params.append('channel', selectedChannel);
      if (selectedTag) params.append('tag', selectedTag);
      if (contentType) params.append('contentType', contentType);
      if (duration) params.append('duration_min', duration);
      if (newOnly) params.append('new', '1');
      if (fulltext) params.append('fulltext', '1');

      const response = await fetch(`/api/epg/events/grid?${params}`);
      const data = await response.json();
      setEvents(data.entries || []);
    } catch (error) {
      console.error('Failed to load EPG events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page, rowsPerPage, searchTitle, selectedChannel, selectedTag, contentType, duration, newOnly, fulltext]);

  const handleResetFilters = () => {
    setSearchTitle('');
    setSelectedChannel('');
    setSelectedTag('');
    setContentType('');
    setDuration('');
    setNewOnly(false); 
    setFulltext(false);
    setPage(0);
  };

  const handleWatchTV = (event: EPGEvent) => {
    setSelectedEvent(event);
    setWatchTVDialogOpen(true);
  };

  const handleCreateAutoRec = (event: EPGEvent) => {
    setSelectedEvent(event);
    setCreateAutoRecDialogOpen(true);
  };

  const handleProgramDetails = (event: EPGEvent) => {
    setSelectedEvent(event);
    setProgramDetailsDialogOpen(true);
  };

  const handleRecord = async (event: EPGEvent) => {
    try {
      await fetch('/api/dvr/entry/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.eventId })
      });
      loadEvents(); // Refresh to show recording status
    } catch (error) {
      console.error('Failed to create recording:', error);
    }
  };

  const handleStopRecording = async (event: EPGEvent) => {
    try {
      if (event.dvrUuid) {
        await fetch(`/api/dvr/entry/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid: event.dvrUuid })
        });
        loadEvents(); // Refresh to show updated status
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = (event: EPGEvent) => {
    if (event.recording) return { label: 'Recording', color: 'error' as const };
    if (event.scheduled) return { label: 'Scheduled', color: 'warning' as const };
    if (event.dvrState) return { label: event.dvrState, color: 'primary' as const };
    return null;
  };
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [watchTVOpen, setWatchTVOpen] = useState(false);
  const [createAutoRecOpen, setCreateAutoRecOpen] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelTags, setChannelTags] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);

  const durations = [
    { id: '', name: 'All' },
    { id: '1', name: '00:00:00 - 00:15:00' },
    { id: '2', name: '00:15:00 - 00:30:00' },
    { id: '3', name: '00:30:00 - 01:00:00' },
    { id: '4', name: '01:00:00 - 01:30:00' },
    { id: '5', name: '01:30:00 - 03:00:00' },
    { id: '6', name: '03:00:00 - No maximum' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEPGData();
  }, [page, rowsPerPage]);

  const loadInitialData = async () => {
    try {
      const mockChannels = [
        { key: '', val: 'All' },
        { key: 'bbc1', val: 'BBC One' },
        { key: 'bbc2', val: 'BBC Two' },
        { key: 'itv1', val: 'ITV1' },
        { key: 'ch4', val: 'Channel 4' },
      ];
      
      const mockTags = [
        { key: '', val: 'All' },
        { key: 'tv', val: 'TV' },
        { key: 'hdtv', val: 'HDTV' },
        { key: 'radio', val: 'Radio' },
      ];
      
      const mockContentTypes = [
        { key: '', val: 'All' },
        { key: '16', val: 'Movie/Drama' },
        { key: '32', val: 'News/Current affairs' },
        { key: '48', val: 'Show/Game show' },
        { key: '64', val: 'Sports' },
      ];
      
      setChannels(mockChannels);
      setChannelTags(mockTags);
      setContentTypes(mockContentTypes);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadEPGData = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      const mockData: EPGEvent[] = [
        {
          eventId: '1',
          title: 'BBC News at Six',
          subtitle: 'The latest news',
          summary: 'National and international news',
          description: 'The latest national and international news stories from around the world with detailed analysis and expert commentary.',
          start: Date.now(),
          stop: Date.now() + 1800000,
          duration: 1800,
          channelName: 'BBC One',
          channelUuid: 'bbc1',
          channelIcon: '/static/img/logobig.png',
          genre: ['News'],
          category: ['News/Current affairs'],
          contentType: 32,
          dvrState: '',
          firstAired: Date.now() - 86400000,
          episode: 'S2024 E180',
          seasonNumber: 2024,
          episodeNumber: 180,
        },
        {
          eventId: '2',
          title: 'EastEnders',
          subtitle: 'Episode 4821',
          summary: 'The residents of Walford face new challenges',
          description: 'British soap opera set in Albert Square in the East End of London. The residents face drama, romance, and family conflicts.',
          start: Date.now() + 1800000,
          stop: Date.now() + 3600000,
          duration: 1800,
          channelName: 'BBC One',
          channelUuid: 'bbc1',
          channelIcon: '/static/img/logobig.png',
          genre: ['Drama', 'Soap'],
          category: ['Movie/Drama'],
          contentType: 16,
          stars: 3,
          ageRating: 12,
          rating: 'PG',
          dvrState: 'scheduled',
          dvrUuid: 'dvr-uuid-123',
          firstAired: Date.now() - 172800000,
          copyrightYear: 2024,
          episode: 'S40 E123',
          seasonNumber: 40,
          episodeNumber: 123,
          serieslinkUri: 'crid://bbc.co.uk/eastenders',
          scheduled: true,
          keyword: ['soap', 'drama', 'bbc'],
        },
      ];
      setEvents(mockData);
    } catch (error) {
      console.error('Failed to load EPG data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadEPGData();
  };

  const handleReset = () => {
    setSearchTitle('');
    setSelectedChannel('');
    setSelectedTag('');
    setContentType('');
    setDuration('');
    setNewOnly(false);
    setFulltext(false);
    setPage(0);
    loadEPGData();
  };

  const handleEventClick = (event: EPGEvent, index: number) => {
    setSelectedEvent(event);
    setCurrentEventIndex(index);
    setDetailsOpen(true);
  };

  const handleNextEvent = () => {
    const nextIndex = currentEventIndex + 1;
    if (nextIndex < events.length) {
      setCurrentEventIndex(nextIndex);
      setSelectedEvent(events[nextIndex]);
    }
  };

  const handlePreviousEvent = () => {
    const prevIndex = currentEventIndex - 1;
    if (prevIndex >= 0) {
      setCurrentEventIndex(prevIndex);
      setSelectedEvent(events[prevIndex]);
    }
  };

  const handleWatchTV = () => {
    setWatchTVOpen(true);
  };

  const handleCreateAutoRec = () => {
    setCreateAutoRecOpen(true);
  };

  const handleRecord = async () => {
    if (selectedEvent) {
      try {
        await api.createDVREntry({
          event_id: selectedEvent.eventId,
          config_uuid: '',
        });
        setDetailsOpen(false);
        loadEPGData();
      } catch (error) {
        console.error('Failed to create recording:', error);
      }
    }
  };

  const handleStopDVR = async () => {
    if (selectedEvent?.dvrUuid) {
      try {
        await api.stopDVR(selectedEvent.dvrUuid);
        setDetailsOpen(false);
        loadEPGData();
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
  };

  const handleDeleteDVR = async () => {
    if (selectedEvent?.dvrUuid) {
      try {
        await api.deleteDVR(selectedEvent.dvrUuid);
        setDetailsOpen(false);
        loadEPGData();
      } catch (error) {
        console.error('Failed to delete recording:', error);
      }
    }
  };

  const searchTitleWeb = (service: string) => {
    if (!selectedEvent?.title) return;
    
    const urls = {
      'imdb': `https://www.imdb.com/find?q=${encodeURIComponent(selectedEvent.title)}`,
      'thetvdb': `https://www.thetvdb.com/search?query=${encodeURIComponent(selectedEvent.title)}&l=en`,
      'filmaffinity': `https://www.filmaffinity.com/en/search.php?stext=${encodeURIComponent(selectedEvent.title)}`,
      'csfd': `https://www.csfd.cz/hledat/?q=${encodeURIComponent(selectedEvent.title)}`,
    };
    
    const url = urls[service as keyof typeof urls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getProgress = (event: EPGEvent) => {
    const now = Date.now();
    if (now < event.start) return 0;
    if (now > event.stop) return 100;
    return ((now - event.start) / (event.stop - event.start)) * 100;
  };

  const getDVRStateChip = (state: string) => {
    const stateConfig = {
      scheduled: { label: 'Scheduled', color: 'primary' as const },
      recording: { label: 'Recording', color: 'error' as const },
      completed: { label: 'Completed', color: 'success' as const },
      failed: { label: 'Failed', color: 'error' as const },
      '': { label: '', color: 'default' as const },
    };
    
    const config = stateConfig[state as keyof typeof stateConfig] || stateConfig[''];
    
    return config.label ? (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    ) : null;
  };

  const getContentIcons = (event: EPGEvent) => {
    const icons: React.ReactElement[] = [];
    if (event.genre) {
      event.genre.forEach((genre, index) => (
        icons.push(
          <Chip key={index} label={genre} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
        )
      ));
    }
    return icons;
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {selectedEvent.channelIcon && (
            <Grid item xs={12} md={2}>
              <Avatar
                src={selectedEvent.channelIcon}
                sx={{ width: 64, height: 64 }}
                variant="rounded"
              />
            </Grid>
          )}
          <Grid item xs={12} md={selectedEvent.channelIcon ? 10 : 12}>
            <Typography variant="h5" gutterBottom>
              {selectedEvent.title}
              {selectedEvent.copyrightYear && ` (${selectedEvent.copyrightYear})`}
            </Typography>
            {selectedEvent.subtitle && (
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {selectedEvent.subtitle}
              </Typography>
            )}
            {selectedEvent.episode && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedEvent.episode}
              </Typography>
            )}
          </Grid>
        </Grid>

        {selectedEvent.image && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <CardMedia
              component="img"
              image={selectedEvent.image}
              alt={selectedEvent.title}
              sx={{ maxHeight: 300, width: 'auto', margin: '0 auto' }}
            />
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              <strong>Scheduled Start Time:</strong> {formatTime(selectedEvent.start)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Scheduled Stop Time:</strong> {formatTime(selectedEvent.stop)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Duration:</strong> {formatDuration(selectedEvent.duration)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Channel:</strong> {selectedEvent.channelName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedEvent.firstAired && (
              <Typography variant="body2" gutterBottom>
                <strong>First Aired:</strong> {formatTime(selectedEvent.firstAired)}
              </Typography>
            )}
            {selectedEvent.ageRating && (
              <Typography variant="body2" gutterBottom>
                <strong>Age Rating:</strong> {selectedEvent.ageRating}
              </Typography>
            )}
            {selectedEvent.rating && (
              <Typography variant="body2" gutterBottom>
                <strong>Parental Rating:</strong> {selectedEvent.rating}
              </Typography>
            )}
            {selectedEvent.stars && (
              <Typography variant="body2" gutterBottom>
                <strong>Rating:</strong> {'★'.repeat(selectedEvent.stars)}
              </Typography>
            )}
          </Grid>
        </Grid>

        {selectedEvent.summary && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              {selectedEvent.summary}
            </Typography>
          </Box>
        )}
        
        {selectedEvent.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              {selectedEvent.description}
            </Typography>
          </Box>
        )}

        {selectedEvent.genre && selectedEvent.genre.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Genres:</strong>
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedEvent.genre.map((genre, index) => (
                <Chip key={index} label={genre} size="small" />
              ))}
            </Stack>
          </Box>
        )}

        {selectedEvent.keyword && selectedEvent.keyword.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Keywords:</strong>
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedEvent.keyword.map((keyword, index) => (
                <Chip key={index} label={keyword} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  const getDialogButtons = () => {
    if (!selectedEvent) return [];

    const buttons = [];
    const isRecording = selectedEvent.dvrState === 'recording';
    const isScheduled = selectedEvent.dvrState === 'scheduled';

    buttons.push(
      <Button
        key="imdb"
        onClick={() => searchTitleWeb('imdb')}
        startIcon={<FindInPage />}
      >
        Query IMDB
      </Button>
    );

    buttons.push(
      <Button
        key="thetvdb"
        onClick={() => searchTitleWeb('thetvdb')}
        startIcon={<FindInPage />}
      >
        Query TheTVDB
      </Button>
    );

    if (isRecording) {
      buttons.push(
        <Button
          key="stop"
          onClick={handleStopDVR}
          startIcon={<Stop />}
          color="error"
        >
          Stop recording
        </Button>
      );
    }

    if (isScheduled || isRecording) {
      buttons.push(
        <Button
          key="delete"
          onClick={handleDeleteDVR}
          startIcon={<Delete />}
          color="error"
        >
          Delete recording
        </Button>
      );
    }

    if (!isRecording && !isScheduled) {
      buttons.push(
        <Button
          key="record"
          onClick={handleRecord}
          startIcon={<RecordVoiceOver />}
          variant="contained"
        >
          Record
        </Button>
      );
    }

    buttons.push(
      <Button
        key="autorec"
        onClick={handleCreateAutoRec}
        startIcon={<RecordVoiceOver />}
        variant="contained"
      >
        {selectedEvent.serieslinkUri ? 'Record series' : 'AutoRec'}
      </Button>
    );

    if (currentEventIndex > 0) {
      buttons.push(
        <Button
          key="previous"
          onClick={handlePreviousEvent}
          startIcon={<NavigateBefore />}
        >
          Previous
        </Button>
      );
    }

    if (currentEventIndex < events.length - 1) {
      buttons.push(
        <Button
          key="next"
          onClick={handleNextEvent}
          startIcon={<NavigateNext />}
        >
          Next
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Electronic Program Guide
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={selectedChannel}
              label="Channel"
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              {channels.map((channel) => (
                <MenuItem key={channel.key} value={channel.key}>
                  {channel.val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tag</InputLabel>
            <Select
              value={selectedTag}
              label="Tag"
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              {channelTags.map((tag) => (
                <MenuItem key={tag.key} value={tag.key}>
                  {tag.val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ minWidth: 200 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={fulltext}
                onChange={(e) => setFulltext(e.target.checked)}
                size="small"
              />
            }
            label="Fulltext"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
                size="small"
              />
            }
            label="New only"
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentType}
              label="Content Type"
              onChange={(e) => setContentType(e.target.value)}
            >
              {contentTypes.map((type) => (
                <MenuItem key={type.key} value={type.key}>
                  {type.val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Duration</InputLabel>
            <Select
              value={duration}
              label="Duration"
              onChange={(e) => setDuration(e.target.value)}
            >
              {durations.map((dur) => (
                <MenuItem key={dur.id} value={dur.id}>
                  {dur.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleReset}
            >
              Reset All
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadEPGData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={handleWatchTV}
            >
              Watch TV
            </Button>
            <Button
              variant="outlined"
              startIcon={<RecordVoiceOver />}
              onClick={handleCreateAutoRec}
            >
              Create AutoRec
            </Button>
            <Button
              variant="outlined"
              startIcon={<Help />}
            >
              Help
            </Button>
          </Stack>
        </Toolbar>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Content Icons</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Extra text</TableCell>
              <TableCell>Episode</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Stars</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Content Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event, index) => (
              <TableRow key={event.eventId} hover>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEventClick(event, index)}
                  >
                    <Info />
                  </IconButton>
                </TableCell>
                <TableCell>
                  {getDVRStateChip(event.dvrState || '')}
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 60 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getProgress(event)}
                      sx={{ height: 4 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 120 }}>
                    {getContentIcons(event)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {event.title}
                  </Typography>
                  {event.subtitle && (
                    <Typography variant="caption" color="textSecondary">
                      {event.subtitle}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ maxWidth: 150, display: 'block' }}>
                    {event.summary || event.description?.substring(0, 80)}
                    {(event.summary || event.description) && '...'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {event.episode && (
                    <Typography variant="caption">
                      {event.episode}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatTime(event.start)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDuration(event.duration)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {event.channelIcon && (
                      <Avatar src={event.channelIcon} sx={{ width: 24, height: 24 }} />
                    )}
                    <Typography variant="caption">
                      {event.channelName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {event.stars && (
                    <Typography variant="caption">
                      {'★'.repeat(event.stars)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {event.ageRating}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {event.contentType}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={1000}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 100, 200]}
      />

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedEvent?.title}
              {selectedEvent?.channelName && ` - ${selectedEvent.channelName}`}
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderEventDetails()}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
          {getDialogButtons()}
        </DialogActions>
      </Dialog>

      <WatchTVDialog
        open={watchTVOpen}
        onClose={() => setWatchTVOpen(false)}
        channelUuid={selectedEvent?.channelUuid}
        title={selectedEvent?.title}
      />

      <CreateAutoRecDialog
        open={createAutoRecOpen}
        onClose={() => setCreateAutoRecOpen(false)}
        eventId={selectedEvent?.eventId}
        title={selectedEvent?.title}
        channel={selectedEvent?.channelName}
      />
    </Box>
  );
};

export default EPG;