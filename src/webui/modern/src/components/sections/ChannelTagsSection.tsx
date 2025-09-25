import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const ChannelTagsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'internal', label: 'Internal', type: 'boolean', width: 120 },
    { key: 'private', label: 'Private', type: 'boolean', width: 120 },
    { key: 'icon', label: 'Icon URL', type: 'text', width: 300 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Channel Tags"
      titleSingular="Channel Tag"
      url="channeltag/grid"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default ChannelTagsSection;
