import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NetworkCheck as NetworkIcon,
  Stream as StreamIcon,
  Subscriptions as SubscriptionsIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ServerInfo {
  sw_version: string;
  api_version: number;
  name: string;
  capabilities: string[];
  uptime?: number;
  freemem?: number;
}

interface Connection {
  id: number;
  peer: string;
  started: number;
  type: string;
  streaming?: boolean;
  user?: string;
}

interface Subscription {
  id: number;
  channel: string;
  title?: string;
  hostname?: string;
  username?: string;
  client?: string;
  profile?: string;
  state?: string;
  errors?: number;
  in?: number;
  out?: number;
  start?: number;
  service?: string;
  packet_errors?: number;
  transport_errors?: number;
}

interface Input {
  uuid: string;
  input: string;
  stream?: string;
  subs?: number;
  weight?: number;
  signal?: number;
  ber?: number;
  snr?: number;
  uncorrected?: number;
  bps?: number;
  te?: number;
  cc?: number;
  ec_block?: number;
  tc_block?: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`status-tabpanel-${index}`}
      aria-labelledby={`status-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds) return 'Unknown';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

function formatBitrate(bps: number): string {
  if (!bps) return '0 b/s';
  if (bps >= 1000000) return `${(bps / 1000000).toFixed(1)} Mb/s`;
  if (bps >= 1000) return `${(bps / 1000).toFixed(1)} kb/s`;
  return `${bps} b/s`;
}

function Status() {
  const [currentTab, setCurrentTab] = useState(0);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(false);

  const loadServerInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/serverinfo');
      if (res.ok) {
        const data = await res.json();
        setServerInfo(data);
      }
    } catch (e) {
      console.error('Failed to load server info:', e);
    }
  }, []);

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/status/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.entries || []);
      }
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    try {
      const res = await fetch('/api/status/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.entries || []);
      }
    } catch (e) {
      console.error('Failed to load subscriptions:', e);
    }
  }, []);

  const loadInputs = useCallback(async () => {
    try {
      const res = await fetch('/api/status/inputs');
      if (res.ok) {
        const data = await res.json();
        setInputs(data.entries || []);
      }
    } catch (e) {
      console.error('Failed to load inputs:', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadServerInfo(),
      loadConnections(),
      loadSubscriptions(),
      loadInputs(),
    ]);
    setLoading(false);
  }, [loadServerInfo, loadConnections, loadSubscriptions, loadInputs]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleCancelConnection = async (id: number) => {
    try {
      await fetch('/api/connections/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: String(id) }),
      });
      loadConnections();
    } catch (e) {
      console.error('Failed to cancel connection:', e);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    { label: 'Server Info', icon: <InfoIcon /> },
    { label: 'Connections', icon: <NetworkIcon /> },
    { label: 'Inputs', icon: <StreamIcon /> },
    { label: 'Subscriptions', icon: <SubscriptionsIcon /> },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" component="h1">
          Status
        </Typography>
        <Button
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={refreshAll}
          disabled={loading}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Server Name</strong></TableCell>
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
                      <TableCell><strong>Free Memory</strong></TableCell>
                      <TableCell>{serverInfo?.freemem ? formatBytes(serverInfo.freemem) : '—'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Server Capabilities
                </Typography>
                {serverInfo?.capabilities ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {serverInfo.capabilities.map((cap) => (
                      <Chip key={cap} label={cap} variant="outlined" size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">Loading…</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Peer</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No connections</Typography>
                    </TableCell>
                  </TableRow>
                ) : connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell>{conn.peer}</TableCell>
                    <TableCell>{conn.user || '—'}</TableCell>
                    <TableCell>{conn.started ? new Date(conn.started * 1000).toLocaleString() : '—'}</TableCell>
                    <TableCell>{conn.type}</TableCell>
                    <TableCell>
                      <Tooltip title="Cancel connection">
                        <IconButton size="small" color="error" onClick={() => handleCancelConnection(conn.id)}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Input</TableCell>
                  <TableCell>Stream</TableCell>
                  <TableCell>Subs</TableCell>
                  <TableCell>Signal</TableCell>
                  <TableCell>SNR</TableCell>
                  <TableCell>BER</TableCell>
                  <TableCell>Bitrate</TableCell>
                  <TableCell>TE</TableCell>
                  <TableCell>CC</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inputs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No active inputs</Typography>
                    </TableCell>
                  </TableRow>
                ) : inputs.map((input) => (
                  <TableRow key={input.uuid}>
                    <TableCell>{input.input}</TableCell>
                    <TableCell>{input.stream || '—'}</TableCell>
                    <TableCell>{input.subs ?? '—'}</TableCell>
                    <TableCell>{input.signal != null ? `${input.signal}%` : '—'}</TableCell>
                    <TableCell>{input.snr != null ? `${input.snr} dB` : '—'}</TableCell>
                    <TableCell>{input.ber != null ? input.ber : '—'}</TableCell>
                    <TableCell>{input.bps != null ? formatBitrate(input.bps) : '—'}</TableCell>
                    <TableCell>{input.te ?? '—'}</TableCell>
                    <TableCell>{input.cc ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Channel / Service</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>In</TableCell>
                  <TableCell>Out</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No active subscriptions</Typography>
                    </TableCell>
                  </TableRow>
                ) : subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.hostname || sub.username || sub.client || `ID:${sub.id}`}
                    </TableCell>
                    <TableCell>{sub.channel || sub.service || '—'}</TableCell>
                    <TableCell>{sub.profile || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={sub.state || 'unknown'}
                        size="small"
                        color={sub.state === 'Running' ? 'success' : sub.state === 'Idle' ? 'default' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{sub.in != null ? formatBitrate(sub.in) : '—'}</TableCell>
                    <TableCell>{sub.out != null ? formatBitrate(sub.out) : '—'}</TableCell>
                    <TableCell>{sub.errors ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Box>
  );
}

export default Status;