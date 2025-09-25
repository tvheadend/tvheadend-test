import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Toolbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'boolean' | 'select' | 'password';
  options?: Array<{key: string | number, val: string}>;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ConfigFormProps {
  title: string;
  url: string;
  fields: FormField[];
  onSave?: (data: any) => void;
  labelWidth?: number;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  title,
  url,
  fields,
  onSave,
  labelWidth = 250,
}) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${url}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: 1 }),
      });
      const result = await response.json();
      if (result.entries && result.entries.length > 0) {
        setData(result.entries[0]);
      }
    } catch (error) {
      console.error(`Failed to load ${title}:`, error);
    } finally {
      setLoading(false);
    }
  }, [url, title]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/idnode/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: data }),
      });
      
      if (onSave) {
        onSave(data);
      }
      
      // Reload to get updated data
      await loadData();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setData({ ...data, [fieldKey]: value });
  };

  const renderField = (field: FormField) => {
    const value = data[field.key] || '';
    
    switch (field.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                disabled={field.disabled}
              />
            }
            label={field.label}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal" disabled={field.disabled}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            margin="normal"
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled}
            required={field.required}
            helperText={field.description}
          />
        );
      
      case 'password':
        return (
          <TextField
            fullWidth
            margin="normal"
            label={field.label}
            type="password"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled}
            required={field.required}
            helperText={field.description}
          />
        );
      
      default:
        return (
          <TextField
            fullWidth
            margin="normal"
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled}
            required={field.required}
            helperText={field.description}
          />
        );
    }
  };

  return (
    <Box>
      <Paper>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
            variant="contained"
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </Toolbar>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxWidth: 600 }}>
              {fields.map((field) => (
                <Box key={field.key} sx={{ mb: 2 }}>
                  {renderField(field)}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfigForm;
