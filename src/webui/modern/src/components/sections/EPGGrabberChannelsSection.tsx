import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const EPGGrabberChannelsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'id', label: 'Internal ID', type: 'text', width: 150 },
    { key: 'uri', label: 'URI', type: 'text', width: 300 },
    { key: 'module', label: 'Module', type: 'text', width: 150 },
    { key: 'update', label: 'Update', type: 'text', width: 120 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="EPG Grabber Channels"
      titleSingular="EPG Grabber Channel"
      url="epggrab/channel"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default EPGGrabberChannelsSection;
