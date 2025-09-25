import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface ServerInfo {
  sw_version: string;
  api_version: number;
  name: string;
  capabilities: string[];
}

function Dashboard() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageInfo] = useState('17GiB/0/71GiB');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Fetch server info
    fetch('/api/serverinfo')
      .then(res => res.json())
      .then(data => {
        setServerInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch server info:', err);
        setLoading(false);
      });

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Server Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Server Information</Typography>
              </Box>
              {serverInfo && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {serverInfo.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Version:</strong> {serverInfo.sw_version}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>API Version:</strong> {serverInfo.api_version}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Current Time:</strong> {currentTime.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Storage Space</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {storageInfo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available / Recording / Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Capabilities Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NetworkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Server Capabilities</Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {serverInfo?.capabilities.map((capability) => (
                  <Chip
                    key={capability}
                    label={capability}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
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
                      <TableCell>{serverInfo?.name || 'Tvheadend'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Access Control</TableCell>
                      <TableCell>
                        <Chip label="No verified access" color="warning" size="small" />
                      </TableCell>
                      <TableCell>Login required for full access</TableCell>
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