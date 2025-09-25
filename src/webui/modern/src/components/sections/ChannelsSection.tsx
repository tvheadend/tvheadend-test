import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const ChannelsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'number', label: 'Number', type: 'number', width: 100 },
    { key: 'bouquet', label: 'Bouquet', type: 'text', width: 200 },
    { key: 'epgauto', label: 'Auto EPG', type: 'boolean', width: 120 },
    { key: 'dvr_pre_time', label: 'DVR Pre', type: 'number', width: 100 },
    { key: 'dvr_pst_time', label: 'DVR Post', type: 'number', width: 100 },
    { key: 'autorid', label: 'Auto rid', type: 'boolean', width: 100 },
  ];

  return (
    <ConfigDataGrid
      title="Channels"
      titleSingular="Channel"
      url="channel/grid"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default ChannelsSection;
