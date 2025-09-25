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
  SwapVert as SwapIcon,
  ExpandLess,
  ExpandMore,
  Storage as StorageIcon,
  Security as SecurityIcon,
  MovieFilter as StreamIcon,
  VideoCall as RecordingIcon,
  BugReport as DebugIcon,
  AutoAwesome as WizardIcon,
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

interface ServerInfo {
  name: string;
  version: string;
  api_version: number;
  capabilities: string[];
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
  const [defaultViewLevel, setDefaultViewLevel] = useState('Basic');
  const [channelNumbers, setChannelNumbers] = useState(false);
  const [channelSources, setChannelSources] = useState(false);
  const [kodiFormatting, setKodiFormatting] = useState(false);
  
  // EPG Settings
  const [iptvThreads, setIptvThreads] = useState('2');
  const [parseHbbTV, setParseHbbTV] = useState(false);
  
  // Language selection states
  const [availableLanguages, setAvailableLanguages] = useState<LanguageItem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageItem[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardLanguage, setWizardLanguage] = useState('');
  const [epgLang1, setEpgLang1] = useState('');
  const [epgLang2, setEpgLang2] = useState('');
  const [epgLang3, setEpgLang3] = useState('');

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

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'pl', name: 'Polish' },
    { code: 'cs', name: 'Czech' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'el', name: 'Greek' },
    { code: 'tr', name: 'Turkish' },
    { code: 'he', name: 'Hebrew' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'tl', name: 'Filipino' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ur', name: 'Urdu' },
    { code: 'fa', name: 'Persian' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ab', name: 'Abkhazian' },
    { code: 'aa', name: 'Afar' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'ak', name: 'Akan' },
    { code: 'sq', name: 'Albanian' },
    { code: 'am', name: 'Amharic' },
    { code: 'an', name: 'Aragonese' },
    { code: 'hy', name: 'Armenian' },
    { code: 'as', name: 'Assamese' },
    { code: 'av', name: 'Avaric' },
    { code: 'ae', name: 'Avestan' },
    { code: 'ay', name: 'Aymara' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'bm', name: 'Bambara' },
    { code: 'ba', name: 'Bashkir' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bh', name: 'Bihari' },
    { code: 'bi', name: 'Bislama' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'br', name: 'Breton' },
    { code: 'my', name: 'Burmese' },
    { code: 'ca', name: 'Catalan' },
    { code: 'ch', name: 'Chamorro' },
    { code: 'ce', name: 'Chechen' },
    { code: 'ny', name: 'Chichewa' },
    { code: 'cu', name: 'Church Slavic' },
    { code: 'cv', name: 'Chuvash' },
    { code: 'kw', name: 'Cornish' },
    { code: 'co', name: 'Corsican' },
    { code: 'cr', name: 'Cree' },
    { code: 'cy', name: 'Welsh' },
    { code: 'dv', name: 'Divehi' },
    { code: 'dz', name: 'Dzongkha' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'ee', name: 'Ewe' },
    { code: 'fo', name: 'Faroese' },
    { code: 'fj', name: 'Fijian' },
    { code: 'fy', name: 'Western Frisian' },
    { code: 'ff', name: 'Fulah' },
    { code: 'gd', name: 'Scottish Gaelic' },
    { code: 'ga', name: 'Irish' },
    { code: 'gl', name: 'Galician' },
    { code: 'lg', name: 'Ganda' },
    { code: 'ka', name: 'Georgian' },
    { code: 'gn', name: 'Guarani' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian' },
    { code: 'ha', name: 'Hausa' },
    { code: 'hz', name: 'Herero' },
    { code: 'ho', name: 'Hiri Motu' },
    { code: 'is', name: 'Icelandic' },
    { code: 'io', name: 'Ido' },
    { code: 'ig', name: 'Igbo' },
    { code: 'iu', name: 'Inuktitut' },
    { code: 'ie', name: 'Interlingue' },
    { code: 'ia', name: 'Interlingua' },
    { code: 'ik', name: 'Inupiaq' },
    { code: 'jv', name: 'Javanese' },
    { code: 'kl', name: 'Kalaallisut' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kr', name: 'Kanuri' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Central Khmer' },
    { code: 'ki', name: 'Kikuyu' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'ky', name: 'Kirghiz' },
    { code: 'kv', name: 'Komi' },
    { code: 'kg', name: 'Kongo' },
    { code: 'kj', name: 'Kuanyama' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'lo', name: 'Lao' },
    { code: 'la', name: 'Latin' },
    { code: 'ln', name: 'Lingala' },
    { code: 'li', name: 'Limburgan' },
    { code: 'lb', name: 'Luxembourgish' },
    { code: 'lu', name: 'Luba-Katanga' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'gv', name: 'Manx' },
    { code: 'mi', name: 'Maori' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mh', name: 'Marshallese' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'na', name: 'Nauru' },
    { code: 'nv', name: 'Navajo' },
    { code: 'nd', name: 'North Ndebele' },
    { code: 'nr', name: 'South Ndebele' },
    { code: 'ng', name: 'Ndonga' },
    { code: 'ne', name: 'Nepali' },
    { code: 'nn', name: 'Norwegian Nynorsk' },
    { code: 'nb', name: 'Norwegian Bokmål' },
    { code: 'oc', name: 'Occitan' },
    { code: 'oj', name: 'Ojibwa' },
    { code: 'or', name: 'Oriya' },
    { code: 'om', name: 'Oromo' },
    { code: 'os', name: 'Ossetian' },
    { code: 'pi', name: 'Pali' },
    { code: 'ps', name: 'Pushto' },
    { code: 'qu', name: 'Quechua' },
    { code: 'rm', name: 'Romansh' },
    { code: 'rn', name: 'Rundi' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sc', name: 'Sardinian' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'se', name: 'Northern Sami' },
    { code: 'sm', name: 'Samoan' },
    { code: 'sg', name: 'Sango' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sn', name: 'Shona' },
    { code: 'si', name: 'Sinhala' },
    { code: 'ss', name: 'Swati' },
    { code: 'st', name: 'Southern Sotho' },
    { code: 'su', name: 'Sundanese' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ti', name: 'Tigrinya' },
    { code: 'to', name: 'Tonga' },
    { code: 'ts', name: 'Tsonga' },
    { code: 'tn', name: 'Tswana' },
    { code: 'tk', name: 'Turkmen' },
    { code: 'tw', name: 'Twi' },
    { code: 'ty', name: 'Tahitian' },
    { code: 'ug', name: 'Uighur' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'uz', name: 'Uzbek' },
    { code: 've', name: 'Venda' },
    { code: 'vo', name: 'Volapük' },
    { code: 'wa', name: 'Walloon' },
    { code: 'wo', name: 'Wolof' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yi', name: 'Yiddish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'za', name: 'Zhuang' },
    { code: 'zu', name: 'Zulu' },
  ];

  useEffect(() => {
    loadServerInfo();
    loadConfiguration(); 
    setAvailableLanguages(languages);
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
      const response = await fetch('/api/config');
      const data = await response.json();
      
      if (data.entries && data.entries.length > 0) {
        const config = data.entries[0];
        setDefaultLanguage(config.language_ui || '');
        setTheme(config.theme_ui || 'Blue');
        setItemsPerPage(String(config.page_size_ui || 50));
        setDefaultViewLevel(config.uilevel === 0 ? 'Basic' : config.uilevel === 1 ? 'Advanced' : 'Expert');
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
      const uilevel = defaultViewLevel === 'Basic' ? 0 : defaultViewLevel === 'Advanced' ? 1 : 2;
      
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
      // Save wizard settings
      setWizardOpen(false);
    }
  };

  const previousWizardStep = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };
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