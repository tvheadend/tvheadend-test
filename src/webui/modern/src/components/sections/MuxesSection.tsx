import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const MuxesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'network', label: 'Network', type: 'text', width: 200 },
    { key: 'frequency', label: 'Frequency', type: 'number', width: 150 },
    { key: 'onid', label: 'Original Network ID', type: 'number', width: 140 },
    { key: 'tsid', label: 'Transport Stream ID', type: 'number', width: 140 },
    { key: 'scan_result', label: 'Scan Result', type: 'text', width: 100 },
    { key: 'scan_first', label: 'First Scan', type: 'text', width: 150 },
    { key: 'scan_last', label: 'Last Scan', type: 'text', width: 150 },
  ];

  return (
    <ConfigDataGrid
      title="Muxes"
      titleSingular="Mux"
      url="mpegts/mux"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default MuxesSection;
