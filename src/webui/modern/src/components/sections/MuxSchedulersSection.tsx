import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const MuxSchedulersSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'cron', label: 'Cron Multi Line', type: 'text', width: 200 },
    { key: 'network', label: 'Network', type: 'text', width: 200 },
    { key: 'timeout', label: 'Timeout (seconds)', type: 'number', width: 140 },
    { key: 'grace', label: 'Grace period (seconds)', type: 'number', width: 160 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Mux Schedulers"
      titleSingular="Mux Scheduler"
      url="mpegts/mux_sched"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default MuxSchedulersSection;
