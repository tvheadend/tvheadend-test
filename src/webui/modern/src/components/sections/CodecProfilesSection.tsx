import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const CodecProfilesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Profile Name', type: 'text', width: 250 },
    { key: 'class', label: 'Type', type: 'text', width: 150 },
    { key: 'priority', label: 'Priority', type: 'number', width: 100 },
    { key: 'status', label: 'Status', type: 'text', width: 100 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Codec Profiles"
      titleSingular="Codec Profile"
      url="codec/profile"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default CodecProfilesSection;
