import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

interface WizardParam {
  id: string;
  type: string;
  caption?: string;
  value?: any;
  default?: any;
  rdonly?: boolean;
  noui?: boolean;
  enum?: { type: string; uri: string } | Array<{ key: string | number; val: string }>;
}

interface WizardEntry {
  caption?: string;
  params?: WizardParam[];
}

interface WizardDialogProps {
  open: boolean;
  onClose: () => void;
}

const WizardDialog: React.FC<WizardDialogProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<WizardEntry | null>(null);
  const [pageName, setPageName] = useState<string>('hello');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [enumOptions, setEnumOptions] = useState<Record<string, Array<{ key: string | number; val: string }>>>({});
  const [progress, setProgress] = useState<number | null>(null);

  const uiParams = useMemo(
    () => (entry?.params || []).filter((param) => !param.noui),
    [entry]
  );

  const pagePrev = useMemo(() => {
    const prev = (entry?.params || []).find((param) => param.id.startsWith('page_prev_'));
    return prev ? prev.id.replace('page_prev_', '') : null;
  }, [entry]);

  const pageNext = useMemo(() => {
    const next = (entry?.params || []).find((param) => param.id.startsWith('page_next_'));
    return next ? next.id.replace('page_next_', '') : null;
  }, [entry]);

  const loadEnumOptions = useCallback(async (params: WizardParam[]) => {
    const options: Record<string, Array<{ key: string | number; val: string }>> = {};

    for (const param of params) {
      if (!param.enum) continue;
      if (Array.isArray(param.enum)) {
        options[param.id] = param.enum;
        continue;
      }

      if (param.enum.type === 'api' && param.enum.uri) {
        try {
          const response = await fetch(`/api/${param.enum.uri}`);
          const data = await response.json();
          options[param.id] = (data.entries || []).map((item: any) => ({
            key: item.key ?? item.id ?? item.identifier ?? item.uuid ?? '',
            val: item.val ?? item.name ?? item.identifier ?? String(item.key ?? item.id ?? ''),
          }));
        } catch (e) {
          options[param.id] = [];
        }
      }
    }

    setEnumOptions(options);
  }, []);

  const loadWizardPage = useCallback(async (page: string) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      const response = await fetch(`/api/wizard/${page}/load?meta=1`);
      const data = await response.json();
      const wizardEntry: WizardEntry | null = data.entries?.[0] || null;
      setEntry(wizardEntry);
      setPageName(page);

      const initialData: Record<string, any> = {};
      (wizardEntry?.params || []).forEach((param) => {
        if (param.noui) return;
        initialData[param.id] = param.value ?? param.default ?? (param.type === 'bool' ? false : '');
      });
      setFormData(initialData);
      await loadEnumOptions(wizardEntry?.params || []);
    } catch (e) {
      setError('Failed to load wizard page.');
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [loadEnumOptions]);

  const startWizard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/wizard/start', { method: 'POST' });
      await loadWizardPage('hello');
    } catch (e) {
      setError('Failed to start wizard.');
      setLoading(false);
    }
  }, [loadWizardPage]);

  useEffect(() => {
    if (open) {
      startWizard();
    }
  }, [open, startWizard]);

  useEffect(() => {
    if (!open || pageName !== 'status') return;
    const timer = setInterval(async () => {
      try {
        const response = await fetch('/api/wizard/status/progress');
        const data = await response.json();
        if (typeof data.progress === 'number') {
          setProgress(Math.round(data.progress * 100));
        }
        setFormData((prev) => ({
          ...prev,
          muxes: data.muxes ?? prev.muxes,
          services: data.services ?? prev.services,
        }));
      } catch (e) {
        // keep existing values on polling errors
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [open, pageName]);

  const closeWizard = async () => {
    try {
      await fetch('/api/wizard/cancel', { method: 'POST' });
    } catch (e) {
      // best-effort cancel
    }
    onClose();
  };

  const savePage = async () => {
    if (!entry) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/wizard/${pageName}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: formData }),
      });
      if (!response.ok) {
        throw new Error('save failed');
      }

      if (pageNext) {
        await loadWizardPage(pageNext);
      } else {
        await closeWizard();
        window.location.reload();
      }
    } catch (e) {
      setError('Failed to save wizard page.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (param: WizardParam) => {
    const value = formData[param.id] ?? '';
    const disabled = !!param.rdonly || saving || loading;
    const hasOptions = (enumOptions[param.id]?.length || 0) > 0;

    if (param.type === 'bool') {
      return (
        <FormControlLabel
          key={param.id}
          control={
            <Checkbox
              checked={!!value}
              disabled={disabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, [param.id]: e.target.checked }))}
            />
          }
          label={param.caption || param.id}
        />
      );
    }

    if (hasOptions) {
      return (
        <FormControl fullWidth key={param.id} size="small" sx={{ mb: 2 }} disabled={disabled}>
          <InputLabel>{param.caption || param.id}</InputLabel>
          <Select
            value={value}
            label={param.caption || param.id}
            onChange={(e) => setFormData((prev) => ({ ...prev, [param.id]: e.target.value }))}
          >
            {enumOptions[param.id].map((option) => (
              <MenuItem key={String(option.key)} value={option.key}>
                {option.val}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    const type = param.id.toLowerCase().includes('password') ? 'password' : 'text';

    return (
      <TextField
        key={param.id}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        label={param.caption || param.id}
        type={type}
        value={String(value)}
        disabled={disabled}
        onChange={(e) => setFormData((prev) => ({ ...prev, [param.id]: e.target.value }))}
      />
    );
  };

  return (
    <Dialog open={open} onClose={closeWizard} maxWidth="md" fullWidth>
      <DialogTitle>{entry?.caption || 'Setup Wizard'}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {progress != null && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Scan progress: {progress}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
            {(uiParams.length === 0 && !error) ? (
              <Typography color="text.secondary">No input required on this step.</Typography>
            ) : (
              <Box>{uiParams.map(renderField)}</Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeWizard} disabled={saving}>
          Cancel
        </Button>
        {pagePrev && (
          <Button
            disabled={saving || loading}
            onClick={() => loadWizardPage(pagePrev)}
          >
            Previous
          </Button>
        )}
        <Button variant="contained" onClick={savePage} disabled={saving || loading}>
          {saving ? <CircularProgress size={18} /> : (pageNext ? 'Save & Next' : 'Finish')}
        </Button>
        <Button
          component="a"
          href="/markdown/firstconfig"
          target="_blank"
          rel="noreferrer"
        >
          Help
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WizardDialog;
