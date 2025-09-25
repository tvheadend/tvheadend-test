import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const ESFiltersSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'class', label: 'Type', type: 'text', width: 150 },
    { key: 'index', label: 'Index', type: 'number', width: 100 },
    { key: 'name', label: 'Name', type: 'text', width: 250 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Elementary Stream Filters"
      titleSingular="Elementary Stream Filter"
      url="esfilter/video"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default ESFiltersSection;
