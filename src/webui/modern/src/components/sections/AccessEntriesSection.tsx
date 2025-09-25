import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const AccessEntriesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'username', label: 'Username', type: 'text', width: 250 },
    { key: 'password', label: 'Password', type: 'text', width: 250 },
    { key: 'prefix', label: 'Network prefix', type: 'text', width: 350 },
    { key: 'change', label: 'Change rights', type: 'text', width: 350 },
    { key: 'streaming', label: 'Streaming rights', type: 'text', width: 350 },
    { key: 'dvr', label: 'Video recorder rights', type: 'text', width: 350 },
    { key: 'webui', label: 'Web interface', type: 'boolean', width: 140 },
    { key: 'admin', label: 'Admin', type: 'boolean', width: 100 },
    { key: 'conn_limit_type', label: 'Connection limit type', type: 'select', width: 160 },
    { key: 'conn_limit', label: 'Limit connections', type: 'number', width: 160 },
    { key: 'channel_min', label: 'Min channel num', type: 'number', width: 160 },
    { key: 'channel_max', label: 'Max channel num', type: 'number', width: 160 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Access Entries"
      titleSingular="Access Entry"
      url="access/entry"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={true}
    />
  );
};

export default AccessEntriesSection;
