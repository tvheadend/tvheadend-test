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
  params?: Array<{ id?: string; value?: any }> | Record<string, any>;
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

  const getParamValue = (node: HardwareNode, key: string) => {
    if (!node.params) return undefined;
    if (Array.isArray(node.params)) {
      return node.params.find((param) => param?.id === key)?.value;
    }
    return node.params[key];
  };

  const getNodeEnabled = (node: HardwareNode) => {
    if (typeof node.enabled === 'boolean') return node.enabled;
    const active = getParamValue(node, 'active');
    if (typeof active === 'boolean') return active;
    if (typeof active === 'number') return active !== 0;
    if (typeof active === 'string') return active !== '0' && active.toLowerCase() !== 'false';
    return undefined;
  };

  const renderNode = (node: HardwareNode, depth = 0) => {
    const isAdapter = depth === 0;
    const isEnabled = getNodeEnabled(node);
    const signal = node.signal ?? getParamValue(node, 'signal');
    const snr = node.snr ?? getParamValue(node, 'snr');
    const ber = node.ber ?? getParamValue(node, 'ber');
    const bps = node.bps ?? getParamValue(node, 'bps');
    const services = node.services ?? getParamValue(node, 'services');
    const subscriptions = node.subscriptions ?? getParamValue(node, 'subscriptions');

    return (
      <Accordion
        key={node.id || node.uuid}
        defaultExpanded={isAdapter}
        disableGutters
        sx={{ ml: depth > 0 ? 2 : 0, borderLeft: depth > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            {isAdapter ? <TvIcon color="primary" fontSize="small" /> : <RouterIcon color="action" fontSize="small" />}
            <Typography variant={isAdapter ? 'subtitle1' : 'body1'} fontWeight={isAdapter ? 'bold' : 'normal'}>
              {node.text || node.displayname || node.devicename || node.id}
            </Typography>
            {isEnabled !== undefined && <Chip label={isEnabled ? 'Enabled' : 'Disabled'} size="small" color={isEnabled ? 'success' : 'default'} />}
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
          {(signal != null || snr != null || bps != null) && (
            <Box mb={2}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {signal != null && (
                      <TableRow>
                        <TableCell><strong>Signal</strong></TableCell>
                        <TableCell>{signal}%</TableCell>
                      </TableRow>
                    )}
                    {snr != null && (
                      <TableRow>
                        <TableCell><strong>SNR</strong></TableCell>
                        <TableCell>{snr} dB</TableCell>
                      </TableRow>
                    )}
                    {ber != null && (
                      <TableRow>
                        <TableCell><strong>BER</strong></TableCell>
                        <TableCell>{ber}</TableCell>
                      </TableRow>
                    )}
                    {bps != null && (
                      <TableRow>
                        <TableCell><strong>Bitrate</strong></TableCell>
                        <TableCell>{bps} b/s</TableCell>
                      </TableRow>
                    )}
                    {services != null && (
                      <TableRow>
                        <TableCell><strong>Services</strong></TableCell>
                        <TableCell>{services}</TableCell>
                      </TableRow>
                    )}
                    {subscriptions != null && (
                      <TableRow>
                        <TableCell><strong>Subscriptions</strong></TableCell>
                        <TableCell>{subscriptions}</TableCell>
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
