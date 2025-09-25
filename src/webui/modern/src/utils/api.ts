// API utility functions for dynamic data retrieval

export interface ApiResponse<T = any> {
  entries?: T[];
  totalCount?: number;
}

export interface SelectOption {
  key: string | number;
  val: string;
}

export interface LanguageOption {
  identifier?: string;
  key?: string;
  id?: string;
  val?: string;
  name?: string;
}

export interface ChannelOption {
  uuid: string;
  name: string;
}

export interface TagOption {
  uuid: string;
  name: string;
}

/**
 * Generic API fetcher with error handling
 */
export const fetchApi = async <T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> => {
  try {
    let url = `/api/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Load languages from API
 */
export const loadLanguages = async (): Promise<LanguageOption[]> => {
  try {
    const data = await fetchApi<LanguageOption>('language/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load languages:', error);
    // Fallback to basic languages if API fails
    return [
      { identifier: 'en', val: 'English' },
      { identifier: 'de', val: 'German' },
      { identifier: 'fr', val: 'French' },
      { identifier: 'es', val: 'Spanish' },
    ];
  }
};

/**
 * Load UI languages from API
 */
export const loadUILanguages = async (): Promise<LanguageOption[]> => {
  try {
    const data = await fetchApi<LanguageOption>('language/ui_locale');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load UI languages:', error);
    return [];
  }
};

/**
 * Load locales from API
 */
export const loadLocales = async (): Promise<LanguageOption[]> => {
  try {
    const data = await fetchApi<LanguageOption>('language/locale');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load locales:', error);
    return [];
  }
};

/**
 * Load channels from API
 */
export const loadChannels = async (options?: { numbers?: boolean; sources?: boolean }): Promise<ChannelOption[]> => {
  try {
    const params: Record<string, string> = {};
    if (options?.numbers) params.numbers = '1';
    if (options?.sources) params.sources = '1';
    
    const data = await fetchApi<ChannelOption>('channel/list', params);
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load channels:', error);
    return [];
  }
};

/**
 * Load channel tags from API
 */
export const loadChannelTags = async (): Promise<TagOption[]> => {
  try {
    const data = await fetchApi<TagOption>('channeltag/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load channel tags:', error);
    return [];
  }
};

/**
 * Load content types from API
 */
export const loadContentTypes = async (full = false): Promise<SelectOption[]> => {
  try {
    const params = full ? { full: '1' } : undefined;
    const data = await fetchApi<SelectOption>('epg/content_type/list', params);
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load content types:', error);
    return [];
  }
};

/**
 * Load channel categories from API
 */
export const loadChannelCategories = async (): Promise<SelectOption[]> => {
  try {
    const data = await fetchApi<SelectOption>('channelcategory/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load channel categories:', error);
    return [];
  }
};

/**
 * Load profiles from API
 */
export const loadProfiles = async (): Promise<SelectOption[]> => {
  try {
    const data = await fetchApi<SelectOption>('profile/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load profiles:', error);
    return [];
  }
};

/**
 * Load codecs from API
 */
export const loadCodecs = async (): Promise<SelectOption[]> => {
  try {
    const data = await fetchApi<SelectOption>('codec/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load codecs:', error);
    return [];
  }
};

/**
 * Load DVR configs from API
 */
export const loadDVRConfigs = async (): Promise<SelectOption[]> => {
  try {
    const data = await fetchApi<SelectOption>('dvr/config/list');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load DVR configs:', error);
    return [];
  }
};

/**
 * Load hardware tree from API
 */
export const loadHardwareTree = async (): Promise<any[]> => {
  try {
    const data = await fetchApi<any>('hardware/tree');
    return data.entries || [];
  } catch (error) {
    console.error('Failed to load hardware tree:', error);
    return [];
  }
};

/**
 * Generate static theme options (these are hardcoded in the server)
 */
export const getThemeOptions = (): SelectOption[] => [
  { key: 'blue', val: 'Blue' },
  { key: 'gray', val: 'Gray' },
  { key: 'access', val: 'Access' },
];

/**
 * Generate static UI level options (these are hardcoded in the server)
 */
export const getUILevelOptions = (): SelectOption[] => [
  { key: -1, val: 'Default' },
  { key: 0, val: 'Basic' },
  { key: 1, val: 'Advanced' },
  { key: 2, val: 'Expert' },
];

/**
 * Generate static page size options (these are hardcoded in the server)
 */
export const getPageSizeOptions = (): SelectOption[] => [
  { key: 25, val: '25' },
  { key: 50, val: '50' },
  { key: 100, val: '100' },
  { key: 200, val: '200' },
  { key: 999999999, val: 'All' },
];

/**
 * Generate static duration filter options (intentionally static as designed)
 */
export const getDurationOptions = (): SelectOption[] => [
  { key: '-1', val: '(Clear filter)' },
  { key: '1', val: '00:00:00 - 00:15:00' },
  { key: '2', val: '00:15:00 - 00:30:00' },
  { key: '3', val: '00:30:00 - 01:00:00' },
  { key: '4', val: '01:00:00 - 01:30:00' },
  { key: '5', val: '01:30:00 - 03:00:00' },
  { key: '6', val: '03:00:00 - No maximum' },
];
