import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const MemoryInfoSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'id', label: 'ID', type: 'text', width: 100 },
    { key: 'type', label: 'Type', type: 'text', width: 150 },
    { key: 'alloc', label: 'Allocated', type: 'number', width: 120 },
    { key: 'free', label: 'Free', type: 'number', width: 120 },
    { key: 'peak', label: 'Peak', type: 'number', width: 120 },
    { key: 'bytes', label: 'Bytes', type: 'number', width: 120 },
  ];

  return (
    <ConfigDataGrid
      title="Memory Information Entries"
      titleSingular="Memory Information Entry"
      url="memoryinfo"
      columns={columns}
      canAdd={false}
      canEdit={false}
      canDelete={false}
      canMove={false}
    />
  );
};

export default MemoryInfoSection;
