import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const CAClientSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'class', label: 'Type', type: 'text', width: 150 },
    { key: 'hostname', label: 'Hostname', type: 'text', width: 200 },
    { key: 'port', label: 'Port', type: 'number', width: 100 },
    { key: 'username', label: 'Username', type: 'text', width: 150 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Conditional Access Clients"
      titleSingular="CA Client"
      url="caclient"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default CAClientSection;
