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
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
  CircularProgress,
  TableSortLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Tv as TvIcon,
  Add as AddIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface EPGEvent {
  id: string;
  title: string;
  extraText: string;
  episode: string;
  startTime: string;
  duration: number;
  channelNumber: number;
  channel: string;
  stars: number;
  rating: string;
  age: string;
  contentType: string;
  progress: number;
}

function EPG() {
  const [events, setEvents] = useState<EPGEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [channelFilter, setChannelFilter] = useState('All');
  const [searchTitle, setSearchTitle] = useState('');
  const [fulltext, setFulltext] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  
  // Sort state
  const [orderBy, setOrderBy] = useState<keyof EPGEvent>('startTime');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'extraText', label: 'Extra text', sortable: false },
    { key: 'episode', label: 'Episode', sortable: false },
    { key: 'startTime', label: 'Start Time', sortable: true },
    { key: 'duration', label: 'Duration', sortable: true },
    { key: 'channelNumber', label: 'Number', sortable: true },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'stars', label: 'Stars', sortable: true },
    { key: 'rating', label: 'Rating', sortable: false },
    { key: 'age', label: 'Age', sortable: false },
    { key: 'contentType', label: 'Content Type', sortable: true },
  ];

  const loadEvents = useCallback(() => {
    setLoading(true);
    
    // Build query parameters for EPG API
    const params = new URLSearchParams({
      start: '0',
      limit: '50',
      sort: orderBy,
      dir: order
    });
    
    if (channelFilter !== 'All') {
      params.append('channel', channelFilter);
    }
    if (searchTitle) {
      params.append('title', searchTitle);
    }
    if (fulltext) {
      params.append('fulltext', '1');
    }
    if (newOnly) {
      params.append('mode', 'now');
    }
    if (tagFilter) {
      params.append('tag', tagFilter);
    }
    if (contentTypeFilter) {
      params.append('contenttype', contentTypeFilter);
    }
    if (durationFilter) {
      params.append('duration', durationFilter);
    }
    
    fetch(`/api/epg/events/grid?${params}`)
      .then(res => res.json())
      .then(data => {
        const mappedEvents: EPGEvent[] = (data.entries || []).map((entry: any) => ({
          id: entry.eventId || entry.uuid,
          title: entry.title || '',
          extraText: entry.subtitle || '',
          episode: entry.episodeUri || '',
          startTime: new Date(entry.start * 1000).toLocaleString(),
          duration: Math.floor((entry.stop - entry.start) / 60),
          channelNumber: entry.channelNumber || 0,
          channel: entry.channelName || '',
          stars: entry.stars || 0,
          rating: entry.rating || '',
          age: entry.age || '',
          contentType: entry.contentType || '',
          progress: 0 // Calculate progress based on current time
        }));
        
        setEvents(mappedEvents);
        setTotalPages(Math.ceil((data.totalCount || 0) / 50));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch EPG events:', err);
        setEvents([]);
        setTotalPages(1);
        setLoading(false);
      });
  }, [channelFilter, searchTitle, fulltext, newOnly, tagFilter, contentTypeFilter, durationFilter, orderBy, order]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSort = (property: keyof EPGEvent) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const resetAllFilters = () => {
    setChannelFilter('All');
    setSearchTitle('');
    setFulltext(false);
    setNewOnly(false);
    setTagFilter('');
    setContentTypeFilter('');
    setDurationFilter('');
    setPage(1);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const formatStars = (stars: number) => {
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Electronic Program Guide
      </Typography>

      {/* Complex Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          {/* Channel Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={channelFilter}
              label="Channel"
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="BBC One">BBC One</MenuItem>
              <MenuItem value="BBC Two">BBC Two</MenuItem>
              <MenuItem value="ITV">ITV</MenuItem>
              <MenuItem value="Channel 4">Channel 4</MenuItem>
            </Select>
          </FormControl>

          {/* Search Title */}
          <TextField
            size="small"
            placeholder="Search title…"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Fulltext Button */}
          <Button
            variant={fulltext ? 'contained' : 'outlined'}
            onClick={() => setFulltext(!fulltext)}
            size="small"
          >
            Fulltext
          </Button>

          {/* New Only Checkbox */}
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

          {/* Filter inputs */}
          <TextField
            size="small"
            placeholder="Filter channel…"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />

          <TextField
            size="small"
            placeholder="Filter tag…"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />

          <TextField
            size="small"
            placeholder="Filter content type…"
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
          />

          <TextField
            size="small"
            placeholder="Filter duration…"
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
          />

          {/* Reset Button */}
          <Button
            variant="outlined"
            onClick={resetAllFilters}
            size="small"
            startIcon={<RefreshIcon />}
          >
            Reset All
          </Button>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={1} mt={2}>
          <Button
            variant="contained"
            startIcon={<TvIcon />}
            size="small"
          >
            Watch TV
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
          >
            Create AutoRec
          </Button>
          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            size="small"
          >
            Help
          </Button>
        </Box>
      </Paper>

      {/* EPG Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Content Icons</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.key}
                        direction={orderBy === column.key ? order : 'asc'}
                        onClick={() => handleSort(column.key as keyof EPGEvent)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No events to display
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Details</Button>
                    </TableCell>
                    <TableCell>
                      <Button size="small">Actions</Button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: 100 }}>
                        <div style={{ 
                          width: '100%', 
                          height: '6px', 
                          backgroundColor: '#e0e0e0', 
                          borderRadius: '3px' 
                        }}>
                          <div style={{ 
                            width: `${event.progress}%`, 
                            height: '100%', 
                            backgroundColor: '#2B5797', 
                            borderRadius: '3px' 
                          }} />
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        {event.contentType === 'Movie' && <Chip label="🎬" size="small" />}
                        {event.contentType === 'Series' && <Chip label="📺" size="small" />}
                        {event.contentType === 'News' && <Chip label="📰" size="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.extraText}</TableCell>
                    <TableCell>{event.episode}</TableCell>
                    <TableCell>{event.startTime}</TableCell>
                    <TableCell>{formatDuration(event.duration)}</TableCell>
                    <TableCell>{event.channelNumber}</TableCell>
                    <TableCell>{event.channel}</TableCell>
                    <TableCell>{formatStars(event.stars)}</TableCell>
                    <TableCell>{event.rating}</TableCell>
                    <TableCell>{event.age}</TableCell>
                    <TableCell>
                      <Chip label={event.contentType} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default EPG;