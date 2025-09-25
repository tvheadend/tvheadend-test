import React from 'react';
import ConfigForm, { FormField } from '../common/ConfigForm';

const ImageCacheSection: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'enabled',
      label: 'Image caching enabled',
      type: 'boolean',
      description: 'Enable caching of channel icons and other images',
    },
    {
      key: 'ignore_sslcert',
      label: 'Ignore SSL certificate errors',
      type: 'boolean',
      description: 'Ignore SSL certificate verification errors when fetching images',
    },
    {
      key: 'ok_period',
      label: 'Re-fetch period (hours)',
      type: 'number',
      description: 'Hours before re-fetching successfully cached images',
    },
    {
      key: 'fail_period',
      label: 'Re-try period (hours)',
      type: 'number',
      description: 'Hours before retrying failed image fetches',
    },
    {
      key: 'ignore_sslcert',
      label: 'Ignore SSL certificate',
      type: 'boolean',
      description: 'Ignore SSL certificate errors',
    },
  ];

  const handleSave = async (data: any) => {
    // After saving, we can trigger cache operations
    console.log('Image cache settings saved:', data);
  };

  return (
    <ConfigForm
      title="Image Cache Configuration"
      url="imagecache/config"
      fields={fields}
      onSave={handleSave}
    />
  );
};

export default ImageCacheSection;
