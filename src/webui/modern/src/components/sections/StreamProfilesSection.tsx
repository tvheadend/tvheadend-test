import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const StreamProfilesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'class', label: 'Type', type: 'text', width: 150 },
    { key: 'priority', label: 'Priority', type: 'number', width: 100 },
    { key: 'fpriority', label: 'Force Priority', type: 'number', width: 120 },
    { key: 'timeout', label: 'Timeout', type: 'number', width: 100 },
    { key: 'restart', label: 'Restart', type: 'boolean', width: 100 },
    { key: 'continue', label: 'Continue', type: 'boolean', width: 100 },
    { key: 'catonly', label: 'CAT only', type: 'boolean', width: 100 },
  ];

  return (
    <ConfigDataGrid
      title="Stream Profiles"
      titleSingular="Stream Profile"
      url="profile/stream"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default StreamProfilesSection;
