import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const DVRProfilesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Profile Name', type: 'text', width: 250 },
    { key: 'pri', label: 'Priority', type: 'number', width: 100 },
    { key: 'retention', label: 'DVR Log retention period (days)', type: 'number', width: 180 },
    { key: 'removal', label: 'Automatic removal of failed recordings (days)', type: 'number', width: 220 },
    { key: 'clone', label: 'Make subdirectories per day', type: 'boolean', width: 180 },
    { key: 'channel_dir', label: 'Make subdirectories per channel', type: 'boolean', width: 200 },
    { key: 'title_dir', label: 'Make subdirectories per title', type: 'boolean', width: 180 },
    { key: 'clean_title', label: 'Clean up title', type: 'boolean', width: 140 },
  ];

  return (
    <ConfigDataGrid
      title="Digital Video Recorder Profiles"
      titleSingular="DVR Profile"
      url="dvr/config"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default DVRProfilesSection;
