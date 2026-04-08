import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface SatIPConfig {
  satip_rtsp: string;
  satip_rtsp_port: number;
  satip_dvbs: number;
  satip_dvbt: number;
  satip_dvbc: number;
}

const SatIPServerSection: React.FC = () => {
  const [config, setConfig] = useState<SatIPConfig>({
    satip_rtsp: '',
    satip_rtsp_port: 554,
    satip_dvbs: 0,
    satip_dvbt: 0,
    satip_dvbc: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entries && data.entries[0]) {
          const cfg = data.entries[0];
          setConfig({
            satip_rtsp: cfg.satip_rtsp || '',
            satip_rtsp_port: cfg.satip_rtsp_port || 554,
            satip_dvbs: cfg.satip_dvbs || 0,
            satip_dvbt: cfg.satip_dvbt || 0,
            satip_dvbc: cfg.satip_dvbc || 0,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load SAT>IP config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/idnode/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: config }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'SAT>IP Server configuration saved' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">SAT&gt;IP Server</Typography>
        <Box display="flex" gap={1}>
          <Button startIcon={<RefreshIcon />} onClick={loadConfig} disabled={loading} size="small">
            Refresh
          </Button>
          <Button
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            size="small"
          >
            Save
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            SAT&gt;IP Server settings allow other SAT&gt;IP clients to use this server's tuners.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="RTSP Address"
                value={config.satip_rtsp}
                onChange={(e) => setConfig({ ...config, satip_rtsp: e.target.value })}
                helperText="Leave empty to use the server's primary IP address"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RTSP Port"
                type="number"
                value={config.satip_rtsp_port}
                onChange={(e) => setConfig({ ...config, satip_rtsp_port: parseInt(e.target.value) || 554 })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Advertised Tuner Counts
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="DVB-S/S2 Tuners"
                    type="number"
                    value={config.satip_dvbs}
                    onChange={(e) => setConfig({ ...config, satip_dvbs: parseInt(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="DVB-T/T2 Tuners"
                    type="number"
                    value={config.satip_dvbt}
                    onChange={(e) => setConfig({ ...config, satip_dvbt: parseInt(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="DVB-C Tuners"
                    type="number"
                    value={config.satip_dvbc}
                    onChange={(e) => setConfig({ ...config, satip_dvbc: parseInt(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SatIPServerSection;
