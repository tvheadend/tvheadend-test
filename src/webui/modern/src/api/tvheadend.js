/**
 * Tvheadend API Client
 * Complete implementation to replace ExtJS functionality
 */

class TvheadendAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.comet = null;
    this.cometSeq = 0;
  }

  // Core API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Server info API
  async getServerInfo() {
    return this.request('serverinfo');
  }

  // Configuration APIs
  async getConfig() {
    return this.request('config/load');
  }

  async loadConfig(params = {}) {
    return this.request('config/load', {
      method: 'POST',
      body: params,
    });
  }

  async saveConfig(config) {
    return this.request('idnode/save', {
      method: 'POST',
      body: config,
    });
  }

  // EPG APIs
  async getEPG(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`epg/events/grid${queryString ? '?' + queryString : ''}`);
  }

  async getChannels() {
    return this.request('channel/list');
  }

  async getChannelTags() {
    return this.request('channeltag/list');
  }

  async getContentTypes() {
    return this.request('epg/content_type/list');
  }

  // DVR APIs
  async getDVREntries(type = 'grid_upcoming') {
    return this.request(`dvr/entry/${type}`);
  }

  async createDVREntry(params) {
    return this.request('dvr/entry/create_by_event', {
      method: 'POST',
      body: params,
    });
  }

  async createAutoRec(params) {
    return this.request('dvr/autorec/create_by_series', {
      method: 'POST',
      body: params,
    });
  }

  async stopDVR(uuid) {
    return this.request('dvr/entry/stop', {
      method: 'POST',
      body: { uuid },
    });
  }

  async deleteDVR(uuid) {
    return this.request('idnode/delete', {
      method: 'POST',
      body: { uuid },
    });
  }

  // Status APIs
  async getStatus() {
    return this.request('status/connections');
  }

  async getStreams() {
    return this.request('status/streams');
  }

  async getSubscriptions() {
    return this.request('status/subscriptions');
  }

  // Wizard APIs
  async startWizard() {
    return this.request('wizard/start', { method: 'POST' });
  }

  async getWizardPage(page) {
    return this.request(`wizard/${page}/load`, {
      method: 'GET',
      body: { meta: 1 },
    });
  }

  async saveWizardPage(page, data) {
    return this.request(`wizard/${page}/save`, {
      method: 'POST',
      body: data,
    });
  }

  async cancelWizard() {
    return this.request('wizard/cancel', { method: 'POST' });
  }

  // Language APIs
  async getLanguages() {
    return this.request('language/list');
  }

  // Profile APIs
  async getProfiles() {
    return this.request('profile/list');
  }

  // Streaming API
  getStreamURL(channelUuid, title = '') {
    return `/play/ticket/stream/channel/${channelUuid}${title ? '?title=' + encodeURIComponent(title) : ''}`;
  }

  // WebSocket/Comet connection for real-time updates
  startComet(onMessage) {
    if (this.comet) {
      this.comet.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/comet/poll`;
    
    this.comet = new WebSocket(wsUrl);
    
    this.comet.onopen = () => {
      console.log('Comet connection established');
    };
    
    this.comet.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse comet message:', error);
      }
    };
    
    this.comet.onerror = (error) => {
      console.error('Comet connection error:', error);
    };
    
    this.comet.onclose = () => {
      console.log('Comet connection closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.startComet(onMessage), 5000);
    };
  }

  stopComet() {
    if (this.comet) {
      this.comet.close();
      this.comet = null;
    }
  }
}

// Create singleton instance
const api = new TvheadendAPI();

export default api;