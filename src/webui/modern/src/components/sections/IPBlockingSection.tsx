import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const IPBlockingSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'prefix', label: 'Network prefix', type: 'text', width: 350 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="IP Blocking Records"
      titleSingular="IP Blocking Record"
      url="ipblocking/entry"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default IPBlockingSection;
