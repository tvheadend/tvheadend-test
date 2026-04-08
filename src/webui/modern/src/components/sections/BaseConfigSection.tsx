import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Alert,
} from '@mui/material';
import {
  PlayArrow as WizardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface LanguageItem {
  identifier: string;
  val: string;
}

interface BaseConfig {
  uuid?: string;
  servername: string;
  server_name: string;
  lang: string;
  langui: string;
  language_ui?: string;
  theme_ui: string;
  uilevel: number;
  uilevel_nochange: boolean;
  page_size_ui: number;
  language: string[] | string;
}

const BaseConfigSection: React.FC = () => {
  const [config, setConfig] = useState<BaseConfig>({
    servername: '',
    server_name: '',
    lang: 'en',
    langui: 'en',
    theme_ui: 'blue',
    uilevel: 2,
    uilevel_nochange: false,
    page_size_ui: 50,
    language: []
  });

  const [availableLanguages, setAvailableLanguages] = useState<LanguageItem[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [activeAvailableLanguageId, setActiveAvailableLanguageId] = useState<string>('');
  const [activeSelectedLanguageId, setActiveSelectedLanguageId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadLanguages = async () => {
    try {
      const response = await fetch('/api/language/list');
      const data = await response.json();
      if (data.entries) {
        const languageList = data.entries.map((lang: any) => ({
          identifier: lang.identifier || lang.key || lang.id,
          val: lang.val || lang.name || lang.identifier,
        }));
        setAvailableLanguages(languageList);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
      setAvailableLanguages([
        { identifier: 'en', val: 'English' },
        { identifier: 'de', val: 'German' },
        { identifier: 'fr', val: 'French' },
        { identifier: 'es', val: 'Spanish' },
      ]);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: 1 }),
      });
      const data = await response.json();
      if (data.entries && data.entries[0]) {
        const cfg = data.entries[0];
        setConfig((prev) => ({
          ...prev,
          ...cfg,
          servername: cfg.servername || cfg.server_name || '',
          server_name: cfg.server_name || cfg.servername || '',
          lang: cfg.lang || 'en',
          langui: cfg.langui || cfg.language_ui || 'en',
          language_ui: cfg.language_ui || cfg.langui || 'en',
          theme_ui: cfg.theme_ui || 'blue',
          uilevel: cfg.uilevel ?? 2,
          uilevel_nochange: !!cfg.uilevel_nochange,
          page_size_ui: cfg.page_size_ui || 50,
        }));
        const langs = Array.isArray(cfg.language)
          ? cfg.language
          : typeof cfg.language === 'string' && cfg.language.length > 0
            ? cfg.language.split(',').map((l: string) => l.trim()).filter(Boolean)
            : [];
        setSelectedLanguageIds(langs);
      }
    } catch (error) {
      console.error('Failed to load base configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
    loadConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          servername: config.servername || config.server_name || '',
          server_name: config.servername || config.server_name || '',
          language_ui: config.langui || config.language_ui || 'en',
          language: selectedLanguageIds,
        }),
      });
      if (response.ok) {
        console.log('Configuration saved successfully');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWizard = async () => {
    try {
      await fetch('/api/wizard/start', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Failed to start wizard:', error);
    }
  };

  const handleLanguageMove = (language: LanguageItem, toSelected: boolean) => {
    if (toSelected) {
      if (!selectedLanguageIds.includes(language.identifier)) {
        setSelectedLanguageIds([...selectedLanguageIds, language.identifier]);
      }
    } else {
      setSelectedLanguageIds(selectedLanguageIds.filter(id => id !== language.identifier));
    }
  };

  const moveLanguage = (direction: 'up' | 'down') => {
    if (!activeSelectedLanguageId) return;
    const currentIndex = selectedLanguageIds.indexOf(activeSelectedLanguageId);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedLanguageIds.length) return;
    const next = [...selectedLanguageIds];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    setSelectedLanguageIds(next);
  };

  const getAvailableForSelection = () => {
    return availableLanguages.filter(lang =>
      !selectedLanguageIds.includes(lang.identifier)
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Base Configuration</Typography>
          <Box>
            <Button
              startIcon={<WizardIcon />}
              variant="outlined"
              onClick={handleStartWizard}
              sx={{ mr: 1 }}
            >
              Start wizard
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              Save Configuration
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Server Settings</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Server Name"
              value={config.servername || config.server_name || ''}
              onChange={(e) => setConfig({ ...config, servername: e.target.value, server_name: e.target.value })}
              helperText="Name to display in the UI and HTSP"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Web Interface Settings</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Default Language</InputLabel>
              <Select
                value={config.lang || 'en'}
                onChange={(e) => setConfig({ ...config, lang: e.target.value })}
                label="Default Language"
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.identifier} value={lang.identifier}>
                    {lang.val}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Web Interface Language</InputLabel>
              <Select
                value={config.langui || 'en'}
                onChange={(e) => setConfig({ ...config, langui: e.target.value, language_ui: e.target.value })}
                label="Web Interface Language"
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.identifier} value={lang.identifier}>
                    {lang.val}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={config.theme_ui || 'blue'}
                onChange={(e) => setConfig({ ...config, theme_ui: e.target.value })}
                label="Theme"
              >
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="gray">Gray</MenuItem>
                <MenuItem value="access">Access</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>UI Level</InputLabel>
              <Select
                value={config.uilevel || 2}
                onChange={(e) => setConfig({ ...config, uilevel: Number(e.target.value) })}
                label="UI Level"
              >
                <MenuItem value={0}>Basic</MenuItem>
                <MenuItem value={1}>Advanced</MenuItem>
                <MenuItem value={2}>Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Page Size</InputLabel>
              <Select
                value={config.page_size_ui || 50}
                onChange={(e) => setConfig({ ...config, page_size_ui: Number(e.target.value) })}
                label="Page Size"
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
                <MenuItem value={999999999}>All</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.uilevel_nochange || false}
                  onChange={(e) => setConfig({ ...config, uilevel_nochange: e.target.checked })}
                />
              }
              label="UI level change allowed"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Language Selection</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select and order the languages for EPG and metadata processing.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Typography variant="subtitle1">Available Languages</Typography>
                <Paper sx={{ height: 200, overflow: 'auto' }}>
                  <List dense>
                    {getAvailableForSelection().map((lang) => (
                      <ListItem key={lang.identifier} disablePadding>
                        <ListItemButton
                          selected={activeAvailableLanguageId === lang.identifier}
                          onClick={() => setActiveAvailableLanguageId(lang.identifier)}
                          onDoubleClick={() => handleLanguageMove(lang, true)}
                        >
                          <ListItemText primary={lang.val} secondary={lang.identifier.toUpperCase()} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!activeAvailableLanguageId}
                  onClick={() => {
                    const lang = availableLanguages.find((l) => l.identifier === activeAvailableLanguageId);
                    if (lang) handleLanguageMove(lang, true);
                  }}
                >
                  →
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!activeSelectedLanguageId}
                  onClick={() => {
                    const lang = availableLanguages.find((l) => l.identifier === activeSelectedLanguageId) || {
                      identifier: activeSelectedLanguageId,
                      val: activeSelectedLanguageId
                    };
                    handleLanguageMove(lang, false);
                  }}
                >
                  ←
                </Button>
                <Button variant="outlined" size="small" disabled={!activeSelectedLanguageId} onClick={() => moveLanguage('up')}>↑</Button>
                <Button variant="outlined" size="small" disabled={!activeSelectedLanguageId} onClick={() => moveLanguage('down')}>↓</Button>
              </Grid>

              <Grid item xs={5}>
                <Typography variant="subtitle1">Selected Languages</Typography>
                <Paper sx={{ height: 200, overflow: 'auto' }}>
                  <List dense>
                    {selectedLanguageIds.map((langId, index) => {
                      const lang = availableLanguages.find((entry) => entry.identifier === langId);
                      const label = lang?.val || langId;
                      return (
                        <ListItem key={langId} disablePadding>
                          <ListItemButton
                            selected={activeSelectedLanguageId === langId}
                            onClick={() => setActiveSelectedLanguageId(langId)}
                            onDoubleClick={() => setSelectedLanguageIds(selectedLanguageIds.filter((id) => id !== langId))}
                          >
                            <ListItemText
                              primary={`${index + 1}. ${label}`}
                              secondary={langId.toUpperCase()}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BaseConfigSection;
