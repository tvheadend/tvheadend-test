import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Info as InfoIcon,
  VideoLibrary as DVRIcon,
  Tv as TvIcon,
} from '@mui/icons-material';

interface ServerInfo {
  sw_version: string;
  api_version: number;
  name: string;
  capabilities: string[];
  uptime?: number;
  freemem?: number;
  totalmem?: number;
  dvrspace?: number;
  totaldvrspace?: number;
  tzoffset?: number;
}

interface UpcomingRecording {
  uuid: string;
  disp_title: string;
  channelname: string;
  start_real: number;
  stop_real: number;
  sched_status: string;
}

function formatUptime(seconds: number): string {
  if (!seconds) return '—';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

function Dashboard() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingRecordings, setUpcomingRecordings] = useState<UpcomingRecording[]>([]);
  const [recordingCount, setRecordingCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    try {
      const [infoRes, dvrRes] = await Promise.all([
        fetch('/api/serverinfo'),
        fetch('/api/dvr/entry/grid_upcoming?start=0&limit=5'),
      ]);

      if (infoRes.ok) {
        const data = await infoRes.json();
        setServerInfo(data);
      }

      if (dvrRes.ok) {
        const dvrData = await dvrRes.json();
        setUpcomingRecordings((dvrData.entries || []).slice(0, 5));
        setRecordingCount(dvrData.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  const dvrUsedPct = serverInfo?.dvrspace != null && serverInfo?.totaldvrspace
    ? Math.round(((serverInfo.totaldvrspace - serverInfo.dvrspace) / serverInfo.totaldvrspace) * 100)
    : null;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Server Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Server Information</Typography>
              </Box>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell>{serverInfo?.name || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Version</strong></TableCell>
                    <TableCell>{serverInfo?.sw_version || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>API Version</strong></TableCell>
                    <TableCell>{serverInfo?.api_version || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Uptime</strong></TableCell>
                    <TableCell>{serverInfo?.uptime ? formatUptime(serverInfo.uptime) : '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Current Time</strong></TableCell>
                    <TableCell>{currentTime.toLocaleTimeString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Storage & Memory</Typography>
              </Box>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>DVR Space Free</strong></TableCell>
                    <TableCell>{serverInfo?.dvrspace != null ? formatBytes(serverInfo.dvrspace) : '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>DVR Space Total</strong></TableCell>
                    <TableCell>{serverInfo?.totaldvrspace ? formatBytes(serverInfo.totaldvrspace) : '—'}</TableCell>
                  </TableRow>
                  {dvrUsedPct !== null && (
                    <TableRow>
                      <TableCell><strong>DVR Usage</strong></TableCell>
                      <TableCell>
                        <Tooltip title={`${dvrUsedPct}% used`}>
                          <Box>
                            <LinearProgress variant="determinate" value={dvrUsedPct} sx={{ mb: 0.5 }} />
                            <Typography variant="caption">{dvrUsedPct}%</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell><strong>Free Memory</strong></TableCell>
                    <TableCell>{serverInfo?.freemem != null ? formatBytes(serverInfo.freemem) : '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Capabilities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NetworkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Server Capabilities</Typography>
              </Box>
              {serverInfo?.capabilities && serverInfo.capabilities.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {serverInfo.capabilities.map((capability) => (
                    <Chip key={capability} label={capability} variant="outlined" color="primary" size="small" />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No capabilities reported</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming recordings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DVRIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Upcoming Recordings
                  {recordingCount > 0 && (
                    <Chip label={recordingCount} size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>
              </Box>
              {upcomingRecordings.length === 0 ? (
                <Typography color="text.secondary">No upcoming recordings</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Channel</TableCell>
                      <TableCell>Start</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingRecordings.map((rec) => (
                      <TableRow key={rec.uuid}>
                        <TableCell>{rec.disp_title}</TableCell>
                        <TableCell>{rec.channelname}</TableCell>
                        <TableCell>
                          {rec.start_real ? new Date(rec.start_real * 1000).toLocaleString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TvIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">System Overview</Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Details</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Web Interface</TableCell>
                      <TableCell>
                        <Chip label="Running" color="success" size="small" />
                      </TableCell>
                      <TableCell>Modern React Interface Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Server</TableCell>
                      <TableCell>
                        <Chip label="Online" color="success" size="small" />
                      </TableCell>
                      <TableCell>{serverInfo?.name || 'Tvheadend'} {serverInfo?.sw_version}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>DVR</TableCell>
                      <TableCell>
                        <Chip
                          label={recordingCount > 0 ? `${recordingCount} scheduled` : 'Idle'}
                          color={recordingCount > 0 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{recordingCount} upcoming recording(s)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
