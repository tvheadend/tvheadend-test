import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  FormGroup,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Tv as TvIcon,
  ExpandLess,
  ExpandMore,
  Storage as StorageIcon,
  Security as SecurityIcon,
  MovieFilter as StreamIcon,
  VideoCall as RecordingIcon,
  BugReport as DebugIcon,
  AutoAwesome as WizardIcon,
} from '@mui/icons-material';
import { 
  loadLanguages, 
  getThemeOptions,
  getUILevelOptions,
  getPageSizeOptions,
  SelectOption,
  LanguageOption
} from '../utils/api';
import AccessEntriesSection from './sections/AccessEntriesSection';
import PasswordsSection from './sections/PasswordsSection';
import IPBlockingSection from './sections/IPBlockingSection';
import ImageCacheSection from './sections/ImageCacheSection';
import NetworksSection from './sections/NetworksSection';
import MuxesSection from './sections/MuxesSection';
import ServicesSection from './sections/ServicesSection';
import ChannelsSection from './sections/ChannelsSection';
import ChannelTagsSection from './sections/ChannelTagsSection';
import BouquetsSection from './sections/BouquetsSection';
import EPGGrabberModulesSection from './sections/EPGGrabberModulesSection';
import StreamProfilesSection from './sections/StreamProfilesSection';
import DVRProfilesSection from './sections/DVRProfilesSection';
import TimeshiftSection from './sections/TimeshiftSection';
// import BaseConfigSection from './sections/BaseConfigSection';

interface ConfigSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  subsections?: ConfigSection[];
}

interface ServerInfo {
  name: string;
  version: string;
  api_version: number;
  capabilities: string[];
  uuid?: string;
}

function Configuration() {
  const [selectedSection, setSelectedSection] = useState('general');
  const [selectedSubsection, setSelectedSubsection] = useState('base');
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  
  // Server data
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [serverName, setServerName] = useState('');
  const [originalServerName, setOriginalServerName] = useState('');
  
  // Web interface settings
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [theme, setTheme] = useState('Blue');
  const [itemsPerPage, setItemsPerPage] = useState('50');
  const [defaultViewLevel, setDefaultViewLevel] = useState('0');
  const [channelNumbers, setChannelNumbers] = useState(false);
  const [channelSources, setChannelSources] = useState(false);
  const [kodiFormatting, setKodiFormatting] = useState(false);
  
  // EPG Settings
  const [iptvThreads, setIptvThreads] = useState('2');
  const [parseHbbTV, setParseHbbTV] = useState(false);
  
  // Language selection states
  const [selectedLanguages] = useState<LanguageOption[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardLanguage, setWizardLanguage] = useState('');
  const [epgLang1, setEpgLang1] = useState('');
  const [epgLang2, setEpgLang2] = useState('');
  const [epgLang3, setEpgLang3] = useState('');

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [themes, setThemes] = useState<SelectOption[]>([]);
  const [uiLevels, setUILevels] = useState<SelectOption[]>([]);
  const [pageSizes, setPageSizes] = useState<SelectOption[]>([]);

  // Load dynamic data from APIs
  const loadDynamicData = async () => {
    try {
      // Load languages - we can use any of the three language endpoints
      const languageData = await loadLanguages();
      setLanguages(languageData);
      
      // Set static options that are hardcoded in the server
      setThemes(getThemeOptions());
      setUILevels(getUILevelOptions());
      setPageSizes(getPageSizeOptions());
    } catch (error) {
      console.error('Failed to load configuration data:', error);
    }
  };

  const configSections: ConfigSection[] = [
    {
      id: 'general',
      label: 'General',
      icon: <SettingsIcon />,
      subsections: [
        { id: 'base', label: 'Base', icon: <SettingsIcon /> },
        { id: 'imagecache', label: 'Image Cache', icon: <StorageIcon /> },
        { id: 'satip-server', label: 'SAT>IP Server', icon: <TvIcon /> },
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: <GroupIcon />,
      subsections: [
        { id: 'access-entries', label: 'Access Entries', icon: <SecurityIcon /> },
        { id: 'passwords', label: 'Passwords', icon: <SecurityIcon /> },
        { id: 'ip-blocking', label: 'IP Blocking Records', icon: <SecurityIcon /> },
      ]
    },
    {
      id: 'dvb-inputs',
      label: 'DVB Inputs',
      icon: <TvIcon />,
      subsections: [
        { id: 'tv-adapters', label: 'TV adapters', icon: <TvIcon /> },
        { id: 'networks', label: 'Networks', icon: <TvIcon /> },
        { id: 'muxes', label: 'Muxes', icon: <TvIcon /> },
        { id: 'services', label: 'Services', icon: <TvIcon /> },
        { id: 'mux-schedulers', label: 'Mux Schedulers', icon: <TvIcon /> },
      ]
    },
    {
      id: 'channel-epg',
      label: 'Channel / EPG',
      icon: <TvIcon />,
      subsections: [
        { id: 'channels', label: 'Channels', icon: <TvIcon /> },
        { id: 'channel-tags', label: 'Channel Tags', icon: <TvIcon /> },
        { id: 'bouquets', label: 'Bouquets', icon: <TvIcon /> },
        { id: 'epg-grabber-channels', label: 'EPG Grabber Channels', icon: <TvIcon /> },
        { id: 'epg-grabber-modules', label: 'EPG Grabber Modules', icon: <TvIcon /> },
        { id: 'rating-labels', label: 'Rating Labels', icon: <TvIcon /> },
      ]
    },
    {
      id: 'stream',
      label: 'Stream',
      icon: <StreamIcon />,
      subsections: [
        { id: 'stream-profiles', label: 'Stream Profiles', icon: <StreamIcon /> },
        { id: 'codec-profiles', label: 'Codec Profiles', icon: <StreamIcon /> },
        { id: 'esfilters', label: 'Elementary Stream Filters', icon: <StreamIcon /> },
      ]
    },
    {
      id: 'recording',
      label: 'Recording',
      icon: <RecordingIcon />,
      subsections: [
        { id: 'dvr-profiles', label: 'Digital Video Recorder Profiles', icon: <RecordingIcon /> },
        { id: 'timeshift', label: 'Timeshift', icon: <RecordingIcon /> },
      ]
    },
    {
      id: 'debugging',
      label: 'Debugging',
      icon: <DebugIcon />,
      subsections: [
        { id: 'tvhlog', label: 'Configuration', icon: <DebugIcon /> },
        { id: 'memory-info', label: 'Memory Information Entries', icon: <DebugIcon /> },
      ]
    }
  ];

  useEffect(() => {
    loadServerInfo();
    loadConfiguration();
    loadDynamicData();
  }, []);

  const loadServerInfo = async () => {
    try {
      const response = await fetch('/api/serverinfo');
      const data = await response.json();
      setServerInfo(data);
      setServerName(data.name || 'Tvheadend');
      setOriginalServerName(data.name || 'Tvheadend');
    } catch (error) {
      console.error('Failed to load server info:', error);
    }
  };

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/config/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meta: 1 }),
      });
      const data = await response.json();
      
      if (data.entries && data.entries.length > 0) {
        const config = data.entries[0];
        setDefaultLanguage(config.language_ui || '');
        setTheme(config.theme_ui || 'Blue');
        setItemsPerPage(String(config.page_size_ui || 50));
        setDefaultViewLevel(String(config.uilevel ?? 0));
        setChannelNumbers(config.chname_num !== false);
        setChannelSources(config.chname_src === true);
        setKodiFormatting(config.label_formatting === true);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      const uilevel = parseInt(defaultViewLevel) || 0;
      
      const configData = {
        uuid: serverInfo?.uuid || '',
        name: serverName,
        language_ui: defaultLanguage,
        theme_ui: theme,
        page_size_ui: parseInt(itemsPerPage),
        uilevel: uilevel,
        chname_num: channelNumbers,
        chname_src: channelSources,
        label_formatting: kodiFormatting,
      };

      const response = await fetch('/api/idnode/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ node: configData }),
      });

      if (response.ok) {
        setOriginalServerName(serverName);
        console.log('Configuration saved successfully');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const undoChanges = () => {
    setServerName(originalServerName);
    loadConfiguration();
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSectionSelect = (sectionId: string, subsectionId?: string) => {
    setSelectedSection(sectionId);
    if (subsectionId) {
      setSelectedSubsection(subsectionId);
    } else {
      const section = configSections.find(s => s.id === sectionId);
      if (section?.subsections) {
        setSelectedSubsection(section.subsections[0].id);
      }
    }
  };

  const startWizard = () => {
    setWizardOpen(true);
    setWizardStep(0);
  };

  const nextWizardStep = () => {
    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    } else {
      setWizardOpen(false);
    }
  };

  const previousWizardStep = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'general':
        switch (selectedSubsection) {
          case 'base':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Server Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Server Name"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Web Interface Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Default Language</InputLabel>
                        <Select
                          value={defaultLanguage}
                          onChange={(e) => setDefaultLanguage(e.target.value)}
                          label="Default Language"
                        >
                          {languages.map((lang) => (
                            <MenuItem key={lang.identifier || lang.key || lang.id} value={lang.identifier || lang.key || lang.id}>
                              {lang.val || lang.name || lang.identifier}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          label="Theme"
                        >
                          {themes.map((themeOption) => (
                            <MenuItem key={themeOption.key} value={themeOption.key}>
                              {themeOption.val}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Items per page</InputLabel>
                        <Select
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(e.target.value)}
                          label="Items per page"
                        >
                          {pageSizes.map((size) => (
                            <MenuItem key={size.key} value={size.key}>
                              {size.val}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Default view level</InputLabel>
                        <Select
                          value={defaultViewLevel}
                          onChange={(e) => setDefaultViewLevel(e.target.value)}
                          label="Default view level"
                        >
                          {uiLevels.map((level) => (
                            <MenuItem key={level.key} value={level.key}>
                              {level.val}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={channelNumbers}
                          onChange={(e) => setChannelNumbers(e.target.checked)}
                        />
                      }
                      label="Show channel numbers"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={channelSources}
                          onChange={(e) => setChannelSources(e.target.checked)}
                        />
                      }
                      label="Show channel sources"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={kodiFormatting}
                          onChange={(e) => setKodiFormatting(e.target.checked)}
                        />
                      }
                      label="Use Kodi formatting"
                    />
                  </FormGroup>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Advanced EPG Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={5}>
                      <Typography variant="subtitle1">Available Languages</Typography>
                      <Paper sx={{ height: 200, overflow: 'auto', p: 1 }}>
                        <List dense>
                          {languages.filter(lang => !selectedLanguages.find(sl => (sl.identifier || sl.key || sl.id) === (lang.identifier || lang.key || lang.id))).map((lang) => (
                            <ListItem key={lang.identifier || lang.key || lang.id} disablePadding>
                              <ListItemButton>
                                <ListItemText primary={lang.val || lang.name || lang.identifier} secondary={(lang.identifier || lang.key || lang.id || '').toUpperCase()} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                      <Button variant="outlined">→</Button>
                      <Button variant="outlined">←</Button>
                      <Button variant="outlined">↑</Button>
                      <Button variant="outlined">↓</Button>
                      <Button variant="outlined">⤴</Button>
                      <Button variant="outlined">⤵</Button>
                    </Grid>
                    
                    <Grid item xs={5}>
                      <Typography variant="subtitle1">Selected Languages</Typography>
                      <Paper sx={{ height: 200, overflow: 'auto', p: 1 }}>
                        <List dense>
                          {selectedLanguages.map((lang) => (
                            <ListItem key={lang.identifier || lang.key || lang.id} disablePadding>
                              <ListItemButton>
                                <ListItemText primary={lang.val || lang.name || lang.identifier} secondary={(lang.identifier || lang.key || lang.id || '').toUpperCase()} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Miscellaneous Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="IPTV scanning threads"
                        type="number"
                        value={iptvThreads}
                        onChange={(e) => setIptvThreads(e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={parseHbbTV}
                          onChange={(e) => setParseHbbTV(e.target.checked)}
                        />
                      }
                      label="Parse HbbTV Application Information"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            );
          
          case 'imagecache':
            return <ImageCacheSection />;
          case 'satip-server':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>SAT&gt;IP Server</Typography>
                  <Typography variant="body2">SAT&gt;IP server configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          default:
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedSubsection === 'imagecache' ? 'Image Cache Settings' : 'SAT&gt;IP Server Settings'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure {selectedSubsection === 'imagecache' ? 'image caching for channel logos and program artwork' : 'SAT>IP server functionality'}.
                  </Typography>
                </CardContent>
              </Card>
            );
        }
        
      case 'users':
        switch (selectedSubsection) {
          case 'access-entries':
            return <AccessEntriesSection />;
          case 'passwords':
            return <PasswordsSection />;
          case 'ip-blocking':
            return <IPBlockingSection />;
          default:
            return <AccessEntriesSection />;
        }
        
      case 'dvb-inputs':
        switch (selectedSubsection) {
          case 'tv-adapters':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>TV Adapters</Typography>
                  <Typography variant="body2">TV adapter configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          case 'networks':
            return <NetworksSection />;
          case 'muxes':
            return <MuxesSection />;
          case 'services':
            return <ServicesSection />;  
          case 'mux-schedulers':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Mux Schedulers</Typography>
                  <Typography variant="body2">Mux scheduler configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          default:
            return <NetworksSection />;
        }
        
      case 'channel-epg':
        switch (selectedSubsection) {
          case 'channels':
            return <ChannelsSection />;
          case 'channel-tags':
            return <ChannelTagsSection />;
          case 'bouquets':
            return <BouquetsSection />;
          case 'epg-grabber-channels':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>EPG Grabber Channels</Typography>
                  <Typography variant="body2">EPG grabber channel configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          case 'epg-grabber-modules':
            return <EPGGrabberModulesSection />;
          case 'rating-labels':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Rating Labels</Typography>
                  <Typography variant="body2">Rating label configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          default:
            return <ChannelsSection />;
        }
        
      case 'stream':
        switch (selectedSubsection) {
          case 'stream-profiles':
            return <StreamProfilesSection />;
          case 'codec-profiles':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Codec Profiles</Typography>
                  <Typography variant="body2">Codec profile configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          case 'esfilters':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Elementary Stream Filters</Typography>
                  <Typography variant="body2">ES filter configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          default:
            return <StreamProfilesSection />;
        }
        
      case 'recording':
        switch (selectedSubsection) {
          case 'dvr-profiles':
            return <DVRProfilesSection />;
          case 'timeshift':
            return <TimeshiftSection />;
          default:
            return <DVRProfilesSection />;
        }
        
      case 'debugging':
        switch (selectedSubsection) {
          case 'tvhlog':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Tvheadend Log</Typography>
                  <Typography variant="body2">Log configuration will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          case 'memory-info':
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Memory Information</Typography>
                  <Typography variant="body2">Memory information will be implemented here.</Typography>
                </CardContent>
              </Card>
            );
          default:
            return (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Debugging</Typography>
                  <Typography variant="body2">Debug configuration options.</Typography>
                </CardContent>
              </Card>
            );
        }
        
      default:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {configSections.find(s => s.id === selectedSection)?.label || 'Configuration'}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedSection === 'users' && 'Manage user accounts, access control, and authentication settings.'}
                {selectedSection === 'dvb-inputs' && 'Configure DVB input sources, networks, and hardware adapters.'}
                {selectedSection === 'channel-epg' && 'Manage channels, EPG sources, and program guide settings.'}
                {selectedSection === 'stream' && 'Configure streaming profiles, transcoding, and codec settings.'}
                {selectedSection === 'recording' && 'Set up recording profiles, DVR settings, and timeshift options.'}
                {selectedSection === 'debugging' && 'Configure logging, diagnostics, and debug information.'}
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 300, mr: 2, overflow: 'auto' }}>
        <Toolbar>
          <Typography variant="h6">Configuration</Typography>
        </Toolbar>
        <Divider />
        
        {/* Toolbar Buttons */}
        <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            size="small"
            onClick={saveConfiguration}
            sx={{ mr: 1, mb: 1 }}
          >
            Save
          </Button>
          <Button
            startIcon={<UndoIcon />}
            variant="outlined"
            size="small"
            onClick={undoChanges}
            sx={{ mr: 1, mb: 1 }}
          >
            Undo
          </Button>
          <Button
            startIcon={<WizardIcon />}
            variant="outlined"
            size="small"
            onClick={startWizard}
            sx={{ mr: 1, mb: 1 }}
          >
            Start wizard
          </Button>
          <Button
            startIcon={<HelpIcon />}
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          >
            Help
          </Button>
        </Box>
        
        <List component="nav">
          {configSections.map((section) => (
            <div key={section.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (section.subsections) {
                      handleSectionToggle(section.id);
                    }
                    handleSectionSelect(section.id);
                  }}
                  selected={selectedSection === section.id}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.label} />
                  {section.subsections && (
                    expandedSections.includes(section.id) ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              
              {section.subsections && (
                <Collapse in={expandedSections.includes(section.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.subsections.map((subsection) => (
                      <ListItem key={subsection.id} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => handleSectionSelect(section.id, subsection.id)}
                          selected={selectedSection === section.id && selectedSubsection === subsection.id}
                        >
                          <ListItemIcon>{subsection.icon}</ListItemIcon>
                          <ListItemText primary={subsection.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>

      {/* Setup Wizard Dialog */}
      <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Setup Wizard - Step {wizardStep + 1} of 3
        </DialogTitle>
        <DialogContent>
          {wizardStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Welcome to Tvheadend
              </Typography>
              <Typography paragraph>
                This wizard will guide you through the initial setup of your Tvheadend server.
                You can skip this wizard and configure everything manually later.
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Interface Language</InputLabel>
                <Select
                  value={wizardLanguage}
                  onChange={(e) => setWizardLanguage(e.target.value)}
                  label="Interface Language"
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.identifier || lang.key || lang.id} value={lang.identifier || lang.key || lang.id}>
                      {lang.val || lang.name || lang.identifier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          {wizardStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                EPG Language Priority
              </Typography>
              <Typography paragraph>
                Select the preferred languages for Electronic Program Guide data.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 1 (highest priority)</InputLabel>
                    <Select
                      value={epgLang1}
                      onChange={(e) => setEpgLang1(e.target.value)}
                      label="Language 1 (highest priority)"
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.identifier || lang.key || lang.id} value={lang.identifier || lang.key || lang.id}>
                          {lang.val || lang.name || lang.identifier}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 2</InputLabel>
                    <Select
                      value={epgLang2}
                      onChange={(e) => setEpgLang2(e.target.value)}
                      label="Language 2"
                    >
                      <MenuItem value="">None</MenuItem>
                      {languages.map((lang) => (
                        <MenuItem key={lang.identifier || lang.key || lang.id} value={lang.identifier || lang.key || lang.id}>
                          {lang.val || lang.name || lang.identifier}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 3</InputLabel>
                    <Select
                      value={epgLang3}
                      onChange={(e) => setEpgLang3(e.target.value)}
                      label="Language 3"
                    >
                      <MenuItem value="">None</MenuItem>
                      {languages.map((lang) => (
                        <MenuItem key={lang.identifier || lang.key || lang.id} value={lang.identifier || lang.key || lang.id}>
                          {lang.val || lang.name || lang.identifier}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {wizardStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Setup Complete
              </Typography>
              <Typography paragraph>
                The basic setup is now complete. You can continue to configure
                network sources, channels, and other settings using the Configuration menu.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWizardOpen(false)}>Cancel</Button>
          {wizardStep > 0 && (
            <Button onClick={previousWizardStep}>Previous</Button>
          )}
          <Button onClick={nextWizardStep} variant="contained">
            {wizardStep === 2 ? 'Finish' : 'Save & Next'}
          </Button>
          <Button startIcon={<HelpIcon />}>Help</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Configuration;