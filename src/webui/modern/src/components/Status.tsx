import React, { useState } from 'react';
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
} from '@mui/material';
import {
  NetworkCheck as NetworkIcon,
  Stream as StreamIcon,
  Subscriptions as SubscriptionsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Status() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    { label: 'Server Info', icon: <InfoIcon /> },
    { label: 'Connections', icon: <NetworkIcon /> },
    { label: 'Streams', icon: <StreamIcon /> },
    { label: 'Subscriptions', icon: <SubscriptionsIcon /> },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Status
      </Typography>

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
                      <TableCell>Tvheadend</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Version</strong></TableCell>
                      <TableCell>0.0.0-unknown</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>API Version</strong></TableCell>
                      <TableCell>19</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Uptime</strong></TableCell>
                      <TableCell>0 days, 0 hours, 30 minutes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Storage Space</strong></TableCell>
                      <TableCell>17GiB/0/71GiB</TableCell>
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
                  Capabilities
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip label="caclient" variant="outlined" />
                  <Chip label="tvadapters" variant="outlined" />
                  <Chip label="satip_client" variant="outlined" />
                  <Chip label="satip_server" variant="outlined" />
                  <Chip label="trace" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client IP</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No connections to display
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stream</TableCell>
                  <TableCell>Bandwidth</TableCell>
                  <TableCell>Clients</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No streams to display
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No subscriptions to display
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Box>
  );
}

export default Status;