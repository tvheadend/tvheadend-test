import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const NetworksSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'networkname', label: 'Network Name', type: 'text', width: 250 },
    { key: 'class', label: 'Type', type: 'text', width: 150 },
    { key: 'nid', label: 'Network ID', type: 'number', width: 100 },
    { key: 'autodiscovery', label: 'Auto discovery', type: 'boolean', width: 120 },
    { key: 'skip_initial_scan', label: 'Skip initial scan', type: 'boolean', width: 140 },
    { key: 'bouquet', label: 'Bouquet', type: 'boolean', width: 100 },
    { key: 'charset', label: 'Character set', type: 'text', width: 120 },
  ];

  return (
    <ConfigDataGrid
      title="Networks"
      titleSingular="Network"
      url="mpegts/network"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default NetworksSection;
