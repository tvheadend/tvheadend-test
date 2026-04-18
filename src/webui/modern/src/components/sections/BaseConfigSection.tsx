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
  Help as HelpIcon,
} from '@mui/icons-material';
import { useHelp } from '../../contexts/HelpContext';

interface LanguageItem {
  identifier: string;
  val: string;
}

interface BaseConfig {
  servername: string;
  server_name: string;
  lang: string;
  langui: string;
  theme_ui: string;
  uilevel: number;
  uilevel_nochange: boolean;
  page_size_ui: number;
  language: string[];
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
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showClassHelp } = useHelp();

  // Load languages
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

  useEffect(() => {
    loadLanguages();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          language: selectedLanguages.map(lang => lang.identifier)
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
      if (!selectedLanguages.find(l => l.identifier === language.identifier)) {
        setSelectedLanguages([...selectedLanguages, language]);
      }
    } else {
      setSelectedLanguages(selectedLanguages.filter(l => l.identifier !== language.identifier));
    }
  };

  const getAvailableForSelection = () => {
    return availableLanguages.filter(lang => 
      !selectedLanguages.find(selected => selected.identifier === lang.identifier)
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
              sx={{ mr: 1 }}
            >
              Save Configuration
            </Button>
            <Button
              startIcon={<HelpIcon />}
              variant="outlined"
              onClick={() => showClassHelp('config')}
            >
              Help
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
              onChange={(e) => setConfig({...config, servername: e.target.value, server_name: e.target.value})}
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
                onChange={(e) => setConfig({...config, lang: e.target.value})}
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
                onChange={(e) => setConfig({...config, langui: e.target.value})}
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
                onChange={(e) => setConfig({...config, theme_ui: e.target.value})}
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
                onChange={(e) => setConfig({...config, uilevel: Number(e.target.value)})}
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
                onChange={(e) => setConfig({...config, page_size_ui: Number(e.target.value)})}
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
                  onChange={(e) => setConfig({...config, uilevel_nochange: e.target.checked})}
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
                        <ListItemButton onClick={() => handleLanguageMove(lang, true)}>
                          <ListItemText primary={lang.val} secondary={lang.identifier.toUpperCase()} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                <Button variant="outlined" size="small">→</Button>
                <Button variant="outlined" size="small">←</Button>
                <Button variant="outlined" size="small">↑</Button>
                <Button variant="outlined" size="small">↓</Button>
              </Grid>
              
              <Grid item xs={5}>
                <Typography variant="subtitle1">Selected Languages</Typography>
                <Paper sx={{ height: 200, overflow: 'auto' }}>
                  <List dense>
                    {selectedLanguages.map((lang, index) => (
                      <ListItem key={lang.identifier} disablePadding>
                        <ListItemButton onClick={() => handleLanguageMove(lang, false)}>
                          <ListItemText 
                            primary={`${index + 1}. ${lang.val}`} 
                            secondary={lang.identifier.toUpperCase()} 
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
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
