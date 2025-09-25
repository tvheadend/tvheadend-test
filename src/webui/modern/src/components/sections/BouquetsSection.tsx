import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const BouquetsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Bouquet Name', type: 'text', width: 250 },
    { key: 'src', label: 'Source', type: 'text', width: 200 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
    { key: 'map_radiosvc', label: 'Map radio services', type: 'boolean', width: 150 },
    { key: 'map_cryptsvc', label: 'Map encrypted services', type: 'boolean', width: 170 },
    { key: 'lcn_off', label: 'LCN offset', type: 'number', width: 100 },
  ];

  return (
    <ConfigDataGrid
      title="Bouquets"
      titleSingular="Bouquet"
      url="bouquet"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default BouquetsSection;
