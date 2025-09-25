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
  FormLabel,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Tv as TvIcon,
  SwapVert as SwapIcon,
} from '@mui/icons-material';

interface ConfigSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  subsections?: ConfigSection[];
}

interface LanguageItem {
  code: string;
  name: string;
}

function Configuration() {
  const [selectedSection, setSelectedSection] = useState('general');
  const [selectedSubsection, setSelectedSubsection] = useState('base');
  const [serverName, setServerName] = useState('Tvheadend');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [theme, setTheme] = useState('Blue');
  const [itemsPerPage, setItemsPerPage] = useState('50');
  const [defaultViewLevel, setDefaultViewLevel] = useState('Basic');
  const [channelNumbers, setChannelNumbers] = useState(false);
  const [channelSources, setChannelSources] = useState(false);
  const [kodiFormatting, setKodiFormatting] = useState(false);
  const [iptvThreads, setIptvThreads] = useState('2');
  const [parseHbbTV, setParseHbbTV] = useState(false);
  
  // Language selection states
  const [availableLanguages, setAvailableLanguages] = useState<LanguageItem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageItem[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const configSections: ConfigSection[] = [
    {
      id: 'general',
      label: 'General',
      icon: <SettingsIcon />,
      subsections: [
        { id: 'base', label: 'Base', icon: <SettingsIcon /> },
        { id: 'satip-server', label: 'SAT>IP Server', icon: <TvIcon /> },
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: <SettingsIcon />,
    },
    {
      id: 'dvb-inputs',
      label: 'DVB Inputs',
      icon: <TvIcon />,
    },
    {
      id: 'channel-epg',
      label: 'Channel / EPG',
      icon: <TvIcon />,
    },
    {
      id: 'stream',
      label: 'Stream',
      icon: <TvIcon />,
    },
    {
      id: 'recording',
      label: 'Recording',
      icon: <TvIcon />,
    },
  ];

  // Mock language data
  useEffect(() => {
    const mockLanguages: LanguageItem[] = [
      { code: 'ab', name: 'Abkhazian' },
      { code: 'ace', name: 'Achinese' },
      { code: 'ach', name: 'Acoli' },
      { code: 'ada', name: 'Adangme' },
      { code: 'ady', name: 'Adyghe' },
      { code: 'aa', name: 'Afar' },
      { code: 'afh', name: 'Afrihili' },
      { code: 'af', name: 'Afrikaans' },
      { code: 'afa', name: 'Afro-Asiatic languages' },
      { code: 'ain', name: 'Ainu' },
      { code: 'ak', name: 'Akan' },
      { code: 'akk', name: 'Akkadian' },
      { code: 'sq', name: 'Albanian' },
      { code: 'ale', name: 'Aleut' },
      { code: 'alg', name: 'Algonquian languages' },
      { code: 'alt', name: 'Altai (Southern)' },
      { code: 'tut', name: 'Altaic languages' },
      { code: 'am', name: 'Amharic' },
      { code: 'anp', name: 'Angika' },
      { code: 'apa', name: 'Apache languages' },
      { code: 'ar', name: 'Arabic' },
      { code: 'an', name: 'Aragonese' },
      { code: 'arc', name: 'Aramaic (Ancient)' },
      { code: 'arp', name: 'Arapaho' },
      { code: 'arw', name: 'Arawak' },
      { code: 'hy', name: 'Armenian' },
      { code: 'rup', name: 'Aromanian' },
      { code: 'art', name: 'Artificial languages' },
      { code: 'as', name: 'Assamese' },
      { code: 'ast', name: 'Asturian' },
      { code: 'ath', name: 'Athapascan languages' },
      { code: 'aud', name: 'Audio Description' },
      { code: 'aus', name: 'Australian languages' },
      { code: 'map', name: 'Austronesian languages' },
      { code: 'av', name: 'Avaric' },
      { code: 'ae', name: 'Avestan' },
      { code: 'awa', name: 'Awadhi' },
      { code: 'ay', name: 'Aymara' },
      { code: 'az', name: 'Azerbaijani' },
      { code: 'ban', name: 'Balinese' },
      { code: 'bat', name: 'Baltic languages' },
      { code: 'bal', name: 'Baluchi' },
      { code: 'bm', name: 'Bambara' },
      { code: 'bai', name: 'Bamileke languages' },
      { code: 'bad', name: 'Banda languages' },
      { code: 'bnt', name: 'Bantu languages' },
      { code: 'bas', name: 'Basa' },
      { code: 'ba', name: 'Bashkir' },
      { code: 'eu', name: 'Basque' },
      // ... many more languages (truncated for brevity)
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'es', name: 'Spanish' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ru', name: 'Russian' },
    ];
    setAvailableLanguages(mockLanguages);
  }, []);

  const moveLanguageToSelected = (language: LanguageItem) => {
    setAvailableLanguages(prev => prev.filter(l => l.code !== language.code));
    setSelectedLanguages(prev => [...prev, language]);
  };

  const moveLanguageToAvailable = (language: LanguageItem) => {
    setSelectedLanguages(prev => prev.filter(l => l.code !== language.code));
    setAvailableLanguages(prev => [...prev, language].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const renderLanguageSelector = () => (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={5}>
        <FormControl fullWidth>
          <FormLabel>Available</FormLabel>
          <Paper
            variant="outlined"
            sx={{
              height: 200,
              overflow: 'auto',
              p: 1,
            }}
          >
            <List dense>
              {availableLanguages.map((language) => (
                <ListItem
                  key={language.code}
                  dense
                  sx={{ cursor: 'pointer' }}
                  onClick={() => moveLanguageToSelected(language)}
                >
                  <ListItemText primary={language.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </FormControl>
      </Grid>
      
      <Grid item xs={2} sx={{ textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            →
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            ←
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            ↑
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            ↓
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            ⤴
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapIcon />}
          >
            ⤵
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={5}>
        <FormControl fullWidth>
          <FormLabel>Selected</FormLabel>
          <Paper
            variant="outlined"
            sx={{
              height: 200,
              overflow: 'auto',
              p: 1,
            }}
          >
            <List dense>
              {selectedLanguages.map((language) => (
                <ListItem
                  key={language.code}
                  dense
                  sx={{ cursor: 'pointer' }}
                  onClick={() => moveLanguageToAvailable(language)}
                >
                  <ListItemText primary={language.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderConfigContent = () => {
    if (selectedSection === 'general' && selectedSubsection === 'base') {
      return (
        <Box>
          {/* Toolbar */}
          <Paper sx={{ mb: 2 }}>
            <Toolbar>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                startIcon={<UndoIcon />}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Undo
              </Button>
              <Button
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={() => setWizardOpen(true)}
              >
                Start wizard
              </Button>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button
                variant="outlined"
                sx={{ mr: 1 }}
              >
                View level: basic
              </Button>
              <Button
                startIcon={<HelpIcon />}
                variant="outlined"
              >
                Help
              </Button>
            </Toolbar>
          </Paper>

          {/* Configuration Forms */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Server Settings
                  </Typography>
                  <TextField
                    fullWidth
                    label="Tvheadend server name:"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Web Interface Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Default language:</InputLabel>
                        <Select
                          value={defaultLanguage}
                          label="Default language:"
                          onChange={(e) => setDefaultLanguage(e.target.value)}
                        >
                          <MenuItem value="">Select Default language ...</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="de">German</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Theme:</InputLabel>
                        <Select
                          value={theme}
                          label="Theme:"
                          onChange={(e) => setTheme(e.target.value)}
                        >
                          <MenuItem value="Blue">Blue</MenuItem>
                          <MenuItem value="Gray">Gray</MenuItem>
                          <MenuItem value="Access">Access</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Items per page:"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(e.target.value)}
                        margin="normal"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Default view level:</InputLabel>
                        <Select
                          value={defaultViewLevel}
                          label="Default view level:"
                          onChange={(e) => setDefaultViewLevel(e.target.value)}
                        >
                          <MenuItem value="Basic">Basic</MenuItem>
                          <MenuItem value="Advanced">Advanced</MenuItem>
                          <MenuItem value="Expert">Expert</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={channelNumbers}
                              onChange={(e) => setChannelNumbers(e.target.checked)}
                            />
                          }
                          label="Channel name with numbers:"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={channelSources}
                              onChange={(e) => setChannelSources(e.target.checked)}
                            />
                          }
                          label="Channel name with sources:"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={kodiFormatting}
                              onChange={(e) => setKodiFormatting(e.target.checked)}
                            />
                          }
                          label="Kodi label formatting support:"
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    EPG Settings
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Default language(s):
                  </Typography>
                  {renderLanguageSelector()}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Miscellaneous Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="IPTV threads:"
                        value={iptvThreads}
                        onChange={(e) => setIptvThreads(e.target.value)}
                        margin="normal"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={parseHbbTV}
                            onChange={(e) => setParseHbbTV(e.target.checked)}
                          />
                        }
                        label="Parse HbbTV info:"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {configSections.find(s => s.id === selectedSection)?.label}
          {selectedSubsection && ` - ${configSections.find(s => s.id === selectedSection)?.subsections?.find(ss => ss.id === selectedSubsection)?.label}`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configuration options for this section will be implemented here.
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuration
      </Typography>

      <Grid container spacing={2}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper>
            <List>
              {configSections.map((section) => (
                <Box key={section.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedSection === section.id}
                      onClick={() => {
                        setSelectedSection(section.id);
                        if (section.subsections) {
                          setSelectedSubsection(section.subsections[0].id);
                        } else {
                          setSelectedSubsection('');
                        }
                      }}
                    >
                      <ListItemText primary={section.label} />
                    </ListItemButton>
                  </ListItem>
                  {section.subsections && selectedSection === section.id && (
                    <List component="div" disablePadding>
                      {section.subsections.map((subsection) => (
                        <ListItem key={subsection.id} disablePadding>
                          <ListItemButton
                            sx={{ pl: 4 }}
                            selected={selectedSubsection === subsection.id}
                            onClick={() => setSelectedSubsection(subsection.id)}
                          >
                            <ListItemText primary={subsection.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            {renderConfigContent()}
          </Paper>
        </Grid>
      </Grid>

      {/* Setup Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Welcome to Tvheadend Setup Wizard
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Tvheadend, Your TV Streaming Server and Video Recorder
            </Typography>
            <Typography variant="body2" gutterBottom>
              Let's start by configuring the basic language settings. Please select the default user interface and EPG language(s).
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>This wizard is optional, and can be cancelled at any time, but recommended for new users.</li>
              <li>Running this wizard on existing configurations is NOT a good idea as it may lead to confusion, misconfiguration and unexpected features! ;)</li>
              <li>The wizard will restart and reload the interface in your chosen language, unfortunately not all translations are available/complete.</li>
              <li>If you get stuck at any point and need a little more information, press [Help].</li>
            </Box>
          </Box>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Web interface
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Language:</InputLabel>
                <Select
                  value=""
                  label="Language:"
                >
                  <MenuItem value="">Select Language ...</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                EPG Language (priority order)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 1:</InputLabel>
                    <Select
                      value=""
                      label="Language 1:"
                    >
                      <MenuItem value="">Select Language 1 ...</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 2:</InputLabel>
                    <Select
                      value=""
                      label="Language 2:"
                    >
                      <MenuItem value="">Select Language 2 ...</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Language 3:</InputLabel>
                    <Select
                      value=""
                      label="Language 3:"
                    >
                      <MenuItem value="">Select Language 3 ...</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWizardOpen(false)}>Cancel</Button>
          <Button variant="contained">Save & Next</Button>
          <Button variant="outlined">Help</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Configuration;