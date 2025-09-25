import React from 'react';
import ConfigForm, { FormField } from '../common/ConfigForm';

const BaseConfigSection: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'server_name',
      label: 'Server name',
      type: 'text',
      description: 'Name of the server displayed in various places',
    },
    {
      key: 'language_ui',
      label: 'User interface language',
      type: 'select',
      description: 'Default language for the user interface',
      // Options will be loaded dynamically
    },
    {
      key: 'theme_ui',
      label: 'User interface theme',
      type: 'select',
      description: 'Default theme for the user interface',
      options: [
        { key: 'blue', val: 'Blue' },
        { key: 'gray', val: 'Gray' },
        { key: 'access', val: 'Access' },
      ],
    },
    {
      key: 'uilevel',
      label: 'User interface level',
      type: 'select',
      description: 'Default user interface level',
      options: [
        { key: 0, val: 'Basic' },
        { key: 1, val: 'Advanced' },
        { key: 2, val: 'Expert' },
      ],
    },
    {
      key: 'uilevel_nochange',
      label: 'Prevent user interface level changes',
      type: 'boolean',
      description: 'Prevent users from changing their interface level',
    },
    {
      key: 'ui_quicktips',
      label: 'Quick tips',
      type: 'boolean',
      description: 'Enable helpful quick tips in the interface',
    },
    {
      key: 'page_size_ui',
      label: 'Default page size',
      type: 'select',
      description: 'Default number of items to show per page',
      options: [
        { key: 25, val: '25' },
        { key: 50, val: '50' },
        { key: 100, val: '100' },
        { key: 200, val: '200' },
        { key: 999999999, val: 'All' },
      ],
    },
    {
      key: 'chname_num',
      label: 'Channel numbers in names',
      type: 'boolean',
      description: 'Include channel numbers in channel names',
    },
    {
      key: 'chname_src',
      label: 'Channel source in names',
      type: 'boolean',
      description: 'Include source information in channel names',
    },
    {
      key: 'label_formatting',
      label: 'Use Kodi-style episode formatting',
      type: 'boolean',
      description: 'Format episode information for Kodi compatibility',
    },
  ];

  const handleSave = (data: any) => {
    // Check if UI level, theme, or other settings changed that require reload
    const shouldReload = data.uilevel !== undefined || 
                        data.theme_ui !== undefined || 
                        data.language_ui !== undefined ||
                        data.uilevel_nochange !== undefined;
    
    if (shouldReload) {
      // Show a message that the page will reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <ConfigForm
      title="Base Configuration"
      url="config"
      fields={fields}
      onSave={handleSave}
    />
  );
};

export default BaseConfigSection;
