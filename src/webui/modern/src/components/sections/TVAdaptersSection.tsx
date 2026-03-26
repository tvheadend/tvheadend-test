import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Tv as TvIcon,
  Router as RouterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface HardwareNode {
  id: string;
  text: string;
  cls?: string;
  leaf?: boolean;
  children?: HardwareNode[];
  params?: Record<string, any>;
  uuid?: string;
  enabled?: boolean;
  devicename?: string;
  displayname?: string;
  services?: number;
  subscriptions?: number;
  signal?: number;
  snr?: number;
  ber?: number;
  bps?: number;
  fe_status?: string;
}

const TVAdaptersSection: React.FC = () => {
  const [hardware, setHardware] = useState<HardwareNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHardware = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hardware/tree');
      if (response.ok) {
        const data = await response.json();
        setHardware(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load hardware tree:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHardware();
  }, []);

  const renderNode = (node: HardwareNode, depth = 0) => {
    const isAdapter = depth === 0;

    return (
      <Accordion key={node.id || node.uuid} defaultExpanded={isAdapter}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            {isAdapter ? <TvIcon color="primary" fontSize="small" /> : <RouterIcon color="action" fontSize="small" />}
            <Typography variant={isAdapter ? 'subtitle1' : 'body1'} fontWeight={isAdapter ? 'bold' : 'normal'}>
              {node.text || node.displayname || node.devicename || node.id}
            </Typography>
            {node.enabled === false && (
              <Chip label="Disabled" size="small" color="warning" />
            )}
            {node.fe_status && (
              <Chip
                label={node.fe_status}
                size="small"
                color={node.fe_status === 'Lock' ? 'success' : 'default'}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: depth * 2 + 2 }}>
          {/* Signal info if available */}
          {(node.signal != null || node.snr != null || node.bps != null) && (
            <Box mb={2}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {node.signal != null && (
                      <TableRow>
                        <TableCell><strong>Signal</strong></TableCell>
                        <TableCell>{node.signal}%</TableCell>
                      </TableRow>
                    )}
                    {node.snr != null && (
                      <TableRow>
                        <TableCell><strong>SNR</strong></TableCell>
                        <TableCell>{node.snr} dB</TableCell>
                      </TableRow>
                    )}
                    {node.ber != null && (
                      <TableRow>
                        <TableCell><strong>BER</strong></TableCell>
                        <TableCell>{node.ber}</TableCell>
                      </TableRow>
                    )}
                    {node.bps != null && (
                      <TableRow>
                        <TableCell><strong>Bitrate</strong></TableCell>
                        <TableCell>{node.bps} b/s</TableCell>
                      </TableRow>
                    )}
                    {node.services != null && (
                      <TableRow>
                        <TableCell><strong>Services</strong></TableCell>
                        <TableCell>{node.services}</TableCell>
                      </TableRow>
                    )}
                    {node.subscriptions != null && (
                      <TableRow>
                        <TableCell><strong>Subscriptions</strong></TableCell>
                        <TableCell>{node.subscriptions}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Recurse into children */}
          {node.children?.map((child) => renderNode(child, depth + 1))}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">TV Adapters</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadHardware} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : hardware.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No TV adapters detected. Connect a DVB, ATSC, IPTV, or SAT&gt;IP device to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        hardware.map((node) => renderNode(node))
      )}
    </Box>
  );
};

export default TVAdaptersSection;
