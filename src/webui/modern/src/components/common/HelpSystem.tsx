import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowUp as BackToTopIcon,
} from '@mui/icons-material';
import { marked } from 'marked';

interface HelpSystemProps {
  open: boolean;
  onClose: () => void;
  pageName?: string;
  initialPage?: string;
}

interface HelpPage {
  name: string;
  title: string;
}

const HelpSystem: React.FC<HelpSystemProps> = ({
  open,
  onClose,
  pageName,
  initialPage = 'introduction'
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Help');
  const [toc, setToc] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HelpPage[]>([]);
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const parseMarkdown = useCallback((text: string): string => {
    // Simple markdown parsing - ensure synchronous operation
    let html = marked.parse(text) as string;
    
    // Post-process the HTML to handle internal links
    html = html.replace(/<a href="([^"]*)" ([^>]*)>([^<]*)<\/a>/g, (match, href, attrs, text) => {
      const x = href.indexOf('#');
      if (href.indexOf(':/') === -1 && (x === -1 || x > 1)) {
        return `<a href="#" data-page="${href}" ${attrs}>${text}</a>`;
      }
      return match;
    });
    
    // Handle images
    html = html.replace(/<img src="([^"]*)"([^>]*)>/g, (match, src, attrs) => {
      let newSrc = src;
      if (src.startsWith('images/')) {
        newSrc = '/static/img' + src.substring(6);
      } else if (src.startsWith('icons/')) {
        newSrc = '/static/' + src;
      }
      return `<img src="${newSrc}" style="max-width: 100%; height: auto;"${attrs}>`;
    });
    
    // Handle headings with anchors
    html = html.replace(/<h([1-6])>([^<]*)<\/h[1-6]>/g, (match, level, text) => {
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h${level} id="tvh-doc-hdr-${id}"><a class="hts-doc-anchor" href="#${id}">${text}</a></h${level}>`;
    });
    
    return html;
  }, []);

  // Load table of contents
  const loadToc = useCallback(async () => {
    try {
      const response = await fetch('/markdown/toc');
      if (!response.ok) throw new Error('Failed to load table of contents');
      const tocText = await response.text();
      setToc(parseMarkdown(tocText));
    } catch (error) {
      console.error('Failed to load TOC:', error);
    }
  }, [parseMarkdown]);

  const getErrorContent = useCallback((): string => {
    const errorMsg = `## Not Available

There's no documentation available, or there was a problem loading the page.

**You'll also see this page if you try and view documentation (for a feature) not included with your version of Tvheadend.**

Please take a look at the other Help pages (Table of Contents), if you still can't find what you're looking for please see the [documentation](http://docs.tvheadend.org/documentation) or join the [IRC channel on libera](https://web.libera.chat/?nick=tvhhelp|?#hts).`;
    
    return parseMarkdown(errorMsg);
  }, [parseMarkdown]);

  // Load initial page
  const loadPage = useCallback(async (page: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/markdown/${page}`);
      if (!response.ok) {
        throw new Error('Page not found');
      }
      
      const mdText = await response.text();
      const lines = mdText.split('\n');
      const titleLine = lines[0];
      
      // Extract title from first line (should start with #)
      let pageTitle = 'Help';
      if (titleLine.startsWith('#')) {
        pageTitle = titleLine.replace(/^#+\s*/, '');
      }
      
      setTitle(pageTitle);
      setContent(parseMarkdown(mdText));
      
      // Add to history
      setHistory(prev => {
        const newEntry = { name: page, title: pageTitle };
        const filtered = prev.filter(h => h.name !== page);
        return [newEntry, ...filtered].slice(0, 5); // Keep last 5 pages
      });
      
    } catch (err) {
      setError('Failed to load help page. The page may not exist or there was a connection error.');
      setContent(getErrorContent());
      setTitle('Not Available');
    } finally {
      setLoading(false);
    }
  }, [parseMarkdown, getErrorContent]);

  useEffect(() => {
    if (open && !toc) {
      loadToc();
    }
  }, [open, toc, loadToc]);

  // Load initial page
  useEffect(() => {
    if (open) {
      const pageToLoad = pageName || initialPage;
      loadPage(pageToLoad);
    }
  }, [open, pageName, initialPage, loadPage]);

  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const pageLink = target.getAttribute('data-page');
    
    if (pageLink) {
      event.preventDefault();
      loadPage(pageLink);
      return;
    }
    
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const id = 'tvh-doc-hdr-' + href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    const contentElement = document.getElementById('help-content');
    if (contentElement) {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderHistory = () => {
    if (history.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Last Help Pages</Typography>
        {history.map((page, index) => (
          <Typography key={page.name} variant="body2" sx={{ mb: 0.5 }}>
            {index + 1}. <Button 
              variant="text" 
              size="small" 
              onClick={() => loadPage(page.name)}
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
            >
              {page.title}
            </Button>
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { height: fullScreen ? '100vh' : '80vh' }
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent 
        id="help-content"
        sx={{ 
          p: 0, 
          display: 'flex',
          flexDirection: fullScreen ? 'column' : 'row',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Table of Contents Sidebar */}
        {!fullScreen && toc && (
          <Box sx={{ 
            width: 300, 
            bgcolor: 'grey.50', 
            borderRight: '1px solid', 
            borderColor: 'divider',
            overflowY: 'auto',
            p: 2
          }}>
            {renderHistory()}
            <div 
              dangerouslySetInnerHTML={{ __html: toc }}
              onClick={handleContentClick}
              style={{ fontSize: '0.875rem' }}
            />
          </Box>
        )}

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 3,
          '& .hts-doc-anchor': {
            textDecoration: 'none',
            color: 'inherit'
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            mt: 2,
            mb: 1
          },
          '& p': {
            mb: 1
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: 2,
            '& th, & td': {
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              textAlign: 'left'
            },
            '& th': {
              bgcolor: 'grey.100',
              fontWeight: 'bold'
            }
          },
          '& pre': {
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto'
          },
          '& code': {
            bgcolor: 'grey.100',
            px: 0.5,
            borderRadius: 0.5,
            fontFamily: 'monospace'
          }
        }}>
          {fullScreen && toc && (
            <Box sx={{ mb: 2 }}>
              {renderHistory()}
              <details>
                <summary>Table of Contents</summary>
                <div 
                  dangerouslySetInnerHTML={{ __html: toc }}
                  onClick={handleContentClick}
                  style={{ fontSize: '0.875rem', marginTop: '1rem' }}
                />
              </details>
            </Box>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {content && (
            <div 
              dangerouslySetInnerHTML={{ __html: content }}
              onClick={handleContentClick}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<BackToTopIcon />}
          onClick={scrollToTop}
        >
          Back to Top
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpSystem;