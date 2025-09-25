import React from 'react';
import { Card, CardContent, Typography, Alert } from '@mui/material';

const TVAdaptersSection: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>TV Adapters</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          TV Adapter configuration requires a tree view component. This section displays 
          hardware adapters in a hierarchical structure and will be implemented with 
          a custom tree grid component.
        </Alert>
        <Typography variant="body2">
          This section will show:
          <ul>
            <li>DVB adapters and frontends</li>
            <li>ATSC adapters</li>
            <li>IPTV adapters</li>
            <li>HDHomeRun devices</li>
            <li>SAT&gt;IP devices</li>
            <li>V4L adapters</li>
          </ul>
          Each adapter can be configured with specific parameters and enabled/disabled.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TVAdaptersSection;
