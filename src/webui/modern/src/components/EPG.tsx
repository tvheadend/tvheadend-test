import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Pagination,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Tv as TvIcon,
  FiberManualRecord as RecordIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

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
  scheduled?: boolean;
  recording?: boolean;
  keyword?: string[];
}

function EPG() {
  const [events, setEvents] = useState<EPGEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [totalEvents, setTotalEvents] = useState(0);

  // Filter states
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [contentType, setContentType] = useState('');
  const [duration, setDuration] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [fulltext, setFulltext] = useState(false);

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<EPGEvent | null>(null);

  // Data states
  const [channels, setChannels] = useState<Array<{uuid: string, name: string}>>([]);
  const [tags, setTags] = useState<Array<{uuid: string, name: string}>>([]);
  const [contentTypes, setContentTypes] = useState<Array<{key: number, val: string}>>([]);

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

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
      });
      
      if (searchTitle) params.append('title', searchTitle);
      if (selectedChannel) params.append('channel', selectedChannel);
      if (selectedTag) params.append('channeltag', selectedTag);
      if (contentType) params.append('contentType', contentType);
      if (duration) params.append('duration_min', duration);
      if (newOnly) params.append('new', '1');
      if (fulltext) params.append('fulltext', '1');

      const response = await fetch(`/api/epg/events/grid?${params}`);
      const data = await response.json();
      setEvents(data.entries || []);
      setTotalEvents(data.totalCount || 0);
    } catch (error) {
      console.error('Failed to load EPG events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTitle, selectedChannel, selectedTag, contentType, duration, newOnly, fulltext]);

  // Load initial data
  useEffect(() => {
    loadChannels();
    loadTags();
    loadContentTypes();
  }, []);

  // Load events when filters change
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
    // Dialog would open here
    console.log('Watch TV:', event.title);
  };

  const handleCreateAutoRec = (event: EPGEvent) => {
    setSelectedEvent(event);
    // Dialog would open here
    console.log('Create AutoRec:', event.title);
  };

  const handleProgramDetails = (event: EPGEvent) => {
    setSelectedEvent(event);
    // Dialog would open here
    console.log('Program Details:', event.title);
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

  const totalPages = Math.ceil(totalEvents / rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Electronic Program Guide
      </Typography>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Channel</InputLabel>
              <Select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                label="Channel"
              >
                <MenuItem value="">All</MenuItem>
                {channels.map((channel) => (
                  <MenuItem key={channel.uuid} value={channel.uuid}>
                    {channel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tag</InputLabel>
              <Select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                label="Tag"
              >
                <MenuItem value="">All</MenuItem>
                {tags.map((tag) => (
                  <MenuItem key={tag.uuid} value={tag.uuid}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                label="Content Type"
              >
                <MenuItem value="">All</MenuItem>
                {contentTypes.map((type) => (
                  <MenuItem key={type.key} value={type.key.toString()}>
                    {type.val}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1} alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newOnly}
                    onChange={(e) => setNewOnly(e.target.checked)}
                  />
                }
                label="New only"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fulltext}
                    onChange={(e) => setFulltext(e.target.checked)}
                  />
                }
                label="Fulltext"
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={2} display="flex" gap={1}>
          <Button
            startIcon={<SearchIcon />}
            variant="contained"
            size="small"
            onClick={loadEvents}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetFilters}
          >
            Reset All
          </Button>
          <Button
            startIcon={<TvIcon />}
            variant="outlined"
            size="small"
            disabled={!selectedEvent}
            onClick={() => selectedEvent && handleWatchTV(selectedEvent)}
          >
            Watch TV
          </Button>
          <Button
            startIcon={<RecordIcon />}
            variant="outlined"
            size="small"
            disabled={!selectedEvent}
            onClick={() => selectedEvent && handleCreateAutoRec(selectedEvent)}
          >
            Create AutoRec
          </Button>
          <Button
            startIcon={<HelpIcon />}
            variant="outlined"
            size="small"
          >
            Help
          </Button>
        </Box>
      </Paper>

      {/* Events Table */}
      <Paper>
        <TableContainer>
          <Table>
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
                <TableCell>Rating</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Content Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No events found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => {
                  const status = getRecordingStatus(event);
                  return (
                    <TableRow 
                      key={event.eventId} 
                      hover
                      onClick={() => handleProgramDetails(event)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Button size="small">Details</Button>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Button size="small" onClick={(e) => { e.stopPropagation(); handleWatchTV(event); }}>
                            Watch
                          </Button>
                          <Button size="small" onClick={(e) => { e.stopPropagation(); handleCreateAutoRec(event); }}>
                            Record
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {/* Progress indicator would go here */}
                      </TableCell>
                      <TableCell>
                        {status && (
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {event.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {event.subtitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.episode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(event.start)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(event.duration)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.channelName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {event.stars && (
                          <Typography variant="body2">
                            {'★'.repeat(event.stars)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.rating}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.ageRating}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.category?.join(', ')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, value) => setPage(value - 1)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EPG;