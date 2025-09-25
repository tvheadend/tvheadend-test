import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const EPGGrabberModulesSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'name', label: 'Module Name', type: 'text', width: 250 },
    { key: 'path', label: 'Path', type: 'text', width: 300 },
    { key: 'args', label: 'Extra Arguments', type: 'text', width: 200 },
    { key: 'priority', label: 'Priority', type: 'number', width: 100 },
    { key: 'type', label: 'Type', type: 'text', width: 120 },
  ];

  return (
    <ConfigDataGrid
      title="EPG Grabber Modules"
      titleSingular="EPG Grabber Module"
      url="epggrab/module"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default EPGGrabberModulesSection;
