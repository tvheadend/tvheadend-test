import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

interface ServerInfo {
  sw_version: string;
  api_version: number;
  name: string;
  capabilities: string[];
}

function About() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  useEffect(() => {
    fetch('/api/serverinfo')
      .then(res => res.json())
      .then(data => setServerInfo(data))
      .catch(() => {});
  }, []);

  const version = serverInfo?.sw_version || '—';
  const apiVersion = serverInfo?.api_version || '—';
  const serverName = serverInfo?.name || 'Tvheadend';

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        About
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <img
                  src="/static/img/logobig.png"
                  alt="Tvheadend Logo"
                  style={{ width: 120, height: 120 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Box>

              <Typography variant="h4" component="h2" gutterBottom color="primary">
                HTS Tvheadend {version}
              </Typography>

              <Typography variant="body1" gutterBottom>
                © 2006 - 2025 Andreas Smas, Jaroslav Kysela, Adam Sutton, et al.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Modern Web Interface
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                This is the modern, responsive web interface for Tvheadend built with React and
                Material-UI. It provides full feature parity with the classic ExtJS interface
                while offering a clean, mobile-friendly experience.
              </Typography>

              <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={3}>
                <Chip icon={<CodeIcon />} label="React" />
                <Chip icon={<CodeIcon />} label="Material-UI" />
                <Chip icon={<CodeIcon />} label="TypeScript" />
                <Chip icon={<CodeIcon />} label="Responsive Design" />
                <Chip icon={<CodeIcon />} label="GPL Compatible" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <ul>
                <li>Complete EPG (Electronic Program Guide) with advanced filtering</li>
                <li>Full DVR (Digital Video Recorder) management</li>
                <li>Live TV streaming with built-in video player</li>
                <li>Auto-recording rules based on title/channel/genre</li>
                <li>Real-time status monitoring (inputs, connections, subscriptions)</li>
                <li>Comprehensive configuration management</li>
                <li>Access control (users, passwords, IP blocking)</li>
                <li>DVB input management (networks, muxes, services)</li>
                <li>EPG grabber configuration</li>
                <li>Stream profiles and codec management</li>
                <li>Timeshift support</li>
                <li>CA client management</li>
                <li>Multi-language support</li>
                <li>Mobile-responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Technical Details
              </Typography>

              <Typography variant="body2" component="div">
                <strong>Server Name:</strong> {serverName}<br />
                <strong>Server Version:</strong> {version}<br />
                <strong>API Version:</strong> {apiVersion}<br />
                <strong>Interface:</strong> Modern React<br />
                <strong>License:</strong> GPL v3<br />
                <strong>Framework:</strong> React + Material-UI<br />
              </Typography>

              {serverInfo?.capabilities && serverInfo.capabilities.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Capabilities</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {serverInfo.capabilities.map(cap => (
                      <Chip key={cap} label={cap} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Support & Resources
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href="https://tvheadend.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Website
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href="https://github.com/tvheadend/tvheadend"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href="https://tvheadend.readthedocs.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  href="https://opencollective.com/tvheadend/donate"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="secondary"
                >
                  Donate
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                To support Tvheadend development, please consider making a donation
                towards project operating costs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              Tvheadend is a TV streaming server and digital video recorder for Linux.<br />
              It supports DVB, ATSC, IPTV, HDHomeRun, and SAT&gt;IP input sources.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default About;
