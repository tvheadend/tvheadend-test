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
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Tv as TvIcon,
  FiberManualRecord as RecordIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  loadChannels,
  loadChannelTags,
  loadContentTypes,
  loadChannelCategories,
  getDurationOptions,
  ChannelOption,
  TagOption,
  SelectOption
} from '../utils/api';
import WatchTVDialog from './dialogs/WatchTVDialog';
import EPGEventDialog from './dialogs/EPGEventDialog';
import CreateAutoRecDialog from './dialogs/CreateAutoRecDialog';
import AddRecordingDialog from './dialogs/AddRecordingDialog';

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
  keyword?: string[];
  credits?: Record<string, string[]>;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [fulltext, setFulltext] = useState(false);

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<EPGEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [watchTVDialogOpen, setWatchTVDialogOpen] = useState(false);
  const [autoRecDialogOpen, setAutoRecDialogOpen] = useState(false);
  const [addRecordingDialogOpen, setAddRecordingDialogOpen] = useState(false);
  const [watchTVChannel, setWatchTVChannel] = useState<string | undefined>();

  // Filter data
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [contentTypes, setContentTypes] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [durations] = useState<SelectOption[]>(getDurationOptions());

  const loadDynamicData = async () => {
    try {
      const [channelData, tagData, contentTypeData, categoryData] = await Promise.all([
        loadChannels({ numbers: true, sources: false }),
        loadChannelTags(),
        loadContentTypes(false),
        loadChannelCategories(),
      ]);
      setChannels(channelData);
      setTags(tagData);
      setContentTypes(contentTypeData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load EPG filter data:', error);
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
      if (category) params.append('category', category);
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
  }, [page, rowsPerPage, searchTitle, selectedChannel, selectedTag, contentType, category, duration, newOnly, fulltext]);

  useEffect(() => { loadDynamicData(); }, []);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleResetFilters = () => {
    setSearchTitle('');
    setSelectedChannel('');
    setSelectedTag('');
    setContentType('');
    setCategory('');
    setDuration('');
    setNewOnly(false);
    setFulltext(false);
    setPage(0);
  };

  const handleRowClick = (event: EPGEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleWatchTV = (event?: EPGEvent) => {
    setWatchTVChannel(event?.channelUuid);
    if (event) setSelectedEvent(event);
    setWatchTVDialogOpen(true);
  };

  const handleOpenAddRecording = (event: EPGEvent) => {
    setSelectedEvent(event);
    setAddRecordingDialogOpen(true);
  };

  const getDVRChip = (event: EPGEvent) => {
    if (!event.dvrState) return null;
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      scheduled: 'primary',
      recording: 'error',
      completed: 'success',
      missed: 'warning',
    };
    return (
      <Chip
        label={event.dvrState}
        size="small"
        color={colors[event.dvrState] || 'default'}
      />
    );
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
              onKeyDown={(e) => e.key === 'Enter' && loadEvents()}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Channel</InputLabel>
              <Select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} label="Channel">
                <MenuItem value="">All Channels</MenuItem>
                {channels.map((ch) => (
                  <MenuItem key={ch.uuid} value={ch.uuid}>{ch.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tag</InputLabel>
              <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} label="Tag">
                <MenuItem value="">All Tags</MenuItem>
                {tags.map((tag) => (
                  <MenuItem key={tag.uuid} value={tag.uuid}>{tag.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select value={contentType} onChange={(e) => setContentType(e.target.value)} label="Content Type">
                <MenuItem value="">All Types</MenuItem>
                {contentTypes.map((type) => (
                  <MenuItem key={type.key} value={type.key.toString()}>{type.val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Duration</InputLabel>
              <Select value={duration} onChange={(e) => setDuration(e.target.value)} label="Duration">
                {durations.map((dur) => (
                  <MenuItem key={dur.key} value={dur.key.toString()}>{dur.val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.key} value={cat.key.toString()}>{cat.val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={2} display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <FormControlLabel
            control={<Checkbox checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} size="small" />}
            label="New only"
          />
          <FormControlLabel
            control={<Checkbox checked={fulltext} onChange={(e) => setFulltext(e.target.checked)} size="small" />}
            label="Fulltext"
          />
          <Box flexGrow={1} />
          <Button startIcon={<SearchIcon />} variant="contained" size="small" onClick={loadEvents}>
            Search
          </Button>
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button startIcon={<TvIcon />} variant="outlined" size="small" onClick={() => handleWatchTV()}>
            Watch TV
          </Button>
          <Button
            startIcon={<RecordIcon />}
            variant="outlined"
            size="small"
            disabled={!selectedEvent}
            onClick={() => selectedEvent && setAutoRecDialogOpen(true)}
          >
            Auto Record
          </Button>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadEvents}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {totalEvents > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {totalEvents} events found
          </Typography>
        )}
      </Paper>

      {/* Events Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}></TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Subtitle</TableCell>
                <TableCell sx={{ width: 140 }}>Start</TableCell>
                <TableCell sx={{ width: 80 }}>Duration</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell sx={{ width: 60 }}>Stars</TableCell>
                <TableCell sx={{ width: 60 }}>Age</TableCell>
                <TableCell sx={{ width: 100 }}>Status</TableCell>
                <TableCell sx={{ width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No events found</Typography>
                  </TableCell>
                </TableRow>
              ) : events.map((event) => (
                <TableRow
                  key={event.eventId}
                  hover
                  onClick={() => handleRowClick(event)}
                  sx={{ cursor: 'pointer' }}
                  selected={selectedEvent?.eventId === event.eventId}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Details">
                      <IconButton size="small" onClick={() => handleRowClick(event)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 200 }}>
                      {event.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                      {event.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDateTime(event.start)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDuration(event.duration)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{event.channelName}</Typography>
                  </TableCell>
                  <TableCell>
                    {event.stars != null && (
                      <Typography variant="body2" title={`${event.stars}/5`}>
                        {'★'.repeat(event.stars)}{'☆'.repeat(5 - event.stars)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.ageRating != null && event.ageRating > 0 && (
                      <Typography variant="body2">{event.ageRating}+</Typography>
                    )}
                  </TableCell>
                  <TableCell>{getDVRChip(event)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Watch TV">
                        <IconButton size="small" onClick={() => handleWatchTV(event)}>
                          <TvIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!event.dvrState && (
                        <Tooltip title="Record">
                          <IconButton size="small" color="error" onClick={() => handleOpenAddRecording(event)}>
                            <RecordIcon fontSize="small" />
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

      {/* Event Details Dialog */}
      <EPGEventDialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        event={selectedEvent}
        onWatchTV={(event) => {
          setEventDialogOpen(false);
          if (event.channelUuid) handleWatchTV(event as EPGEvent);
        }}
        onAddRecording={(event) => {
          setEventDialogOpen(false);
          setSelectedEvent(event as EPGEvent);
          setAddRecordingDialogOpen(true);
        }}
        onCancelRecording={() => {
          loadEvents();
          setEventDialogOpen(false);
        }}
      />

      {/* Watch TV Dialog */}
      <WatchTVDialog
        open={watchTVDialogOpen}
        onClose={() => setWatchTVDialogOpen(false)}
        channelUuid={watchTVChannel}
        title={selectedEvent?.title}
      />

      {/* Auto Record Dialog */}
      <CreateAutoRecDialog
        open={autoRecDialogOpen}
        onClose={() => setAutoRecDialogOpen(false)}
        eventId={selectedEvent?.eventId}
        title={selectedEvent?.title}
        channel={selectedEvent?.channelUuid}
      />

      <AddRecordingDialog
        open={addRecordingDialogOpen}
        onClose={() => setAddRecordingDialogOpen(false)}
        event={selectedEvent}
        onScheduled={loadEvents}
      />
    </Box>
  );
}

export default EPG;
