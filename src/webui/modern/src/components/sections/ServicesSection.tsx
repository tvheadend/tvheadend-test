import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const ServicesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'mux', label: 'Mux', type: 'text', width: 200 },
    { key: 'sid', label: 'Service ID', type: 'number', width: 100 },
    { key: 'stype', label: 'Service Type', type: 'text', width: 120 },
    { key: 'provider', label: 'Provider', type: 'text', width: 150 },
    { key: 'network', label: 'Network', type: 'text', width: 150 },
    { key: 'cridauth', label: 'CRID Authority', type: 'text', width: 150 },
    { key: 'lcn', label: 'Local Channel Number', type: 'number', width: 140 },
  ];

  return (
    <ConfigDataGrid
      title="Services"
      titleSingular="Service"
      url="mpegts/service"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default ServicesSection;
