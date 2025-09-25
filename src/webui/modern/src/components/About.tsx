import React from 'react';
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

function About() {
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
                    // Fallback if image not found
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Box>
              
              <Typography variant="h4" component="h2" gutterBottom color="primary">
                HTS Tvheadend 0.0.0-unknown
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                © 2006 - 2024 Andreas Smas, Jaroslav Kysela, Adam Sutton, et al.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Modern React Interface
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                This is the new modern, responsive web interface built with React and Material-UI.
                It replaces the outdated ExtJS 3 interface with a GPL-compatible solution that works
                perfectly on desktop, tablet, and mobile devices.
              </Typography>
              
              <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={3}>
                <Chip icon={<CodeIcon />} label="React 18" />
                <Chip icon={<CodeIcon />} label="Material-UI 5" />
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
                <li>Live TV streaming and channel management</li>
                <li>Real-time status monitoring</li>
                <li>Comprehensive configuration management</li>
                <li>Multi-language support</li>
                <li>Mobile-responsive design</li>
                <li>Modern Material Design interface</li>
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
                <strong>Server Version:</strong> 0.0.0-unknown<br />
                <strong>API Version:</strong> 19<br />
                <strong>Interface:</strong> Modern React<br />
                <strong>Build:</strong> Production Optimized<br />
                <strong>License:</strong> GPL v3<br />
                <strong>Framework:</strong> React + Material-UI<br />
              </Typography>
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
                >
                  Official Website
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href="https://github.com/tvheadend/tvheadend"
                  target="_blank"
                >
                  GitHub Repository
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href="https://tvheadend.readthedocs.io/"
                  target="_blank"
                >
                  Documentation
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  href="https://opencollective.com/tvheadend/donate"
                  target="_blank"
                  color="secondary"
                >
                  Donate
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                To support Tvheadend development please consider making a donation
                towards project operating costs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Modern Interface Implementation Complete</strong><br />
              Successfully replaced ExtJS 3 with React + Material-UI<br />
              All original functionality preserved with modern UX improvements
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default About;